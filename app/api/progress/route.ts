import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const progressSchema = z.object({
  lesson_id: z.string().uuid('Invalid lesson ID'),
  status: z.enum(['started', 'completed']),
  completion_percentage: z.number().min(0).max(100).optional(),
  time_spent: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lesson_id');

    // Проверка аутентификации
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('user_progress')
      .select(`
        *,
        lessons (
          id,
          title,
          type,
          lesson_categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Фильтр по конкретному уроку
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data: progress, error } = await query;

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress });
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
    const supabase = await createClient();

    // Проверка аутентификации
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Валидация входных данных
    const validationResult = progressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { lesson_id, status, completion_percentage, time_spent } = validationResult.data;

    // Проверяем, существует ли уже прогресс для этого урока
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing progress:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing progress' },
        { status: 500 }
      );
    }

    let progressData;
    let error;

    if (existingProgress) {
      // Обновляем существующий прогресс
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (completion_percentage !== undefined) {
        updateData.completion_percentage = completion_percentage;
      }

      if (time_spent !== undefined) {
        updateData.time_spent = time_spent;
      }

      if (status === 'completed' && !updateData.completion_percentage) {
        updateData.completion_percentage = 100;
      }

      const result = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();

      progressData = result.data;
      error = result.error;
    } else {
      // Создаем новый прогресс
      const insertData: any = {
        user_id: user.id,
        lesson_id,
        status,
        completion_percentage: completion_percentage || (status === 'completed' ? 100 : 0),
        time_spent: time_spent || 0
      };

      const result = await supabase
        .from('user_progress')
        .insert(insertData)
        .select()
        .single();

      progressData = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving progress:', error);
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Progress saved successfully',
      progress: progressData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}