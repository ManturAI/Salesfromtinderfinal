import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем избранные уроки пользователя
    const { data: favorites, error } = await supabase
      .from('user_progress')
      .select(`
        id,
        lesson_id,
        is_favorite,
        created_at,
        lessons (
          id,
          title,
          description,
          type,
          icon,
          lesson_categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return NextResponse.json({ favorites: favorites || [] });
  } catch (error) {
    console.error('Error in favorites API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lesson_id, is_favorite } = await request.json();

    if (!lesson_id || typeof is_favorite !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Проверяем, существует ли запись прогресса
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson_id)
      .single();

    let result;

    if (existingProgress) {
      // Обновляем существующую запись
      result = await supabase
        .from('user_progress')
        .update({ is_favorite })
        .eq('user_id', user.id)
        .eq('lesson_id', lesson_id)
        .select()
        .single();
    } else {
      // Создаем новую запись
      result = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          lesson_id,
          is_favorite,
          status: 'not_started'
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating favorite status:', result.error);
      return NextResponse.json({ error: 'Failed to update favorite status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      progress: result.data,
      message: is_favorite ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (error) {
    console.error('Error in favorites API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}