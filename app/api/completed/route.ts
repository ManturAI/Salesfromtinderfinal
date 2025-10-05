import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем завершенные уроки пользователя
    const { data: completed, error } = await supabase
      .from('user_progress')
      .select(`
        id,
        lesson_id,
        is_completed,
        completed_at,
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
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed lessons:', error);
      return NextResponse.json({ error: 'Failed to fetch completed lessons' }, { status: 500 });
    }

    return NextResponse.json({ completed: completed || [] });
  } catch (error) {
    console.error('Error in completed API:', error);
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

    const { lesson_id, is_completed } = await request.json();

    if (!lesson_id || typeof is_completed !== 'boolean') {
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
    const updateData: any = { 
      is_completed,
      status: is_completed ? 'completed' : 'not_started',
      completed_at: is_completed ? new Date().toISOString() : null
    };

    if (existingProgress) {
      // Обновляем существующую запись
      result = await supabase
        .from('user_progress')
        .update(updateData)
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
          ...updateData,
          is_favorite: false
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating completion status:', result.error);
      return NextResponse.json({ error: 'Failed to update completion status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      progress: result.data,
      message: is_completed ? 'Lesson marked as completed' : 'Lesson marked as incomplete'
    });
  } catch (error) {
    console.error('Error in completed API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}