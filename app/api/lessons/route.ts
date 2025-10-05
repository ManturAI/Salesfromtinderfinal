import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const type = searchParams.get('type');
    const published = searchParams.get('published') !== 'false';

    let query = supabase
      .from('lessons')
      .select(`
        *,
        lesson_categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('is_published', published)
      .order('order_index', { ascending: true });

    // Фильтр по категории
    if (categorySlug) {
      query = query.eq('lesson_categories.slug', categorySlug);
    }

    // Фильтр по типу урока
    if (type) {
      query = query.eq('type', type);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      title, 
      description, 
      content, 
      category_id, 
      type = 'sprint', 
      icon = 'demo',
      order_index = 0, 
      is_published = true 
    } = body;

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, content' },
        { status: 400 }
      );
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        title,
        description,
        content,
        category_id,
        type,
        icon,
        order_index,
        is_published
      })
      .select(`
        *,
        lesson_categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}