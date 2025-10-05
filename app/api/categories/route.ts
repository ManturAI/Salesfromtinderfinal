import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UserData {
  role: 'user' | 'admin';
}

interface Lesson {
  id: string;
  title: string;
  type: 'sprint' | 'archive';
  is_published: boolean;
}

interface Category {
  lessons?: Lesson[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: categories, error } = await supabase
      .from('lesson_categories')
      .select(`
        *,
        lessons (
          id,
          title,
          type,
          is_published
        )
      `)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Подсчитываем количество уроков в каждой категории
    const categoriesWithCounts = Array.isArray(categories) ? categories.map((category: Category) => ({
      ...category,
      lesson_count: category.lessons?.length || 0,
      published_lesson_count: Array.isArray(category.lessons) ? category.lessons.filter((lesson: Lesson) => lesson.is_published).length : 0
    })) : [];

    return NextResponse.json({ categories: categoriesWithCounts });
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
    
    // Проверяем аутентификацию пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверяем права администратора
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || (userData as UserData)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, order_index = 0 } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Создаем slug из названия
    const slug = name.toLowerCase()
      .replace(/[^a-zа-я0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .trim();

    const { data: category, error } = await supabase
      .from('lesson_categories')
      .insert({
        name,
        description: description || '',
        slug,
        icon: icon || 'globe.svg',
        order_index
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}