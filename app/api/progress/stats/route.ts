import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LessonCategory {
  name: string;
  slug: string;
}

interface Lesson {
  type: 'sprint' | 'archive';
  lesson_categories: LessonCategory;
}

interface ProgressStat {
  status: 'completed' | 'started' | 'not_started';
  completion_percentage?: number;
  time_spent?: number;
  updated_at?: string;
  lessons: Lesson;
}

interface CategoryStat {
  name: string;
  slug: string;
  completed: number;
  started: number;
  total_time: number;
}

interface TypeStat {
  completed: number;
  started: number;
  total_time: number;
}

export async function GET() {
  try {
    const supabase = createClient();

    // Проверка аутентификации
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем общую статистику прогресса
    const { data: progressStats, error: statsError } = await supabase
      .from('user_progress')
      .select(`
        status,
        completion_percentage,
        time_spent,
        lessons (
          type,
          lesson_categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id);

    if (statsError) {
      console.error('Error fetching progress stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch progress statistics' },
        { status: 500 }
      );
    }

    // Type assertion for progressStats
    const typedProgressStats = progressStats as ProgressStat[] | null;

    // Получаем общее количество уроков
    const result = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    const totalLessons = 'count' in result ? result.count : null;
    const countError = 'error' in result ? result.error : null;

    if (countError) {
      console.error('Error fetching total lessons count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch total lessons count' },
        { status: 500 }
      );
    }

    // Вычисляем статистику
    const completedLessons = typedProgressStats?.filter((p: ProgressStat) => p.status === 'completed').length || 0;
    const startedLessons = typedProgressStats?.filter((p: ProgressStat) => p.status === 'started').length || 0;
    const totalTimeSpent = typedProgressStats?.reduce((sum: number, p: ProgressStat) => sum + (p.time_spent || 0), 0) || 0;
    const averageCompletion = typedProgressStats && typedProgressStats.length > 0 
      ? typedProgressStats.reduce((sum: number, p: ProgressStat) => sum + (p.completion_percentage || 0), 0) / typedProgressStats.length 
      : 0;

    // Статистика по категориям
    const categoryStats: { [key: string]: CategoryStat } = {};
    typedProgressStats?.forEach((progress: ProgressStat) => {
      const categorySlug = progress.lessons?.lesson_categories?.slug;
      const categoryName = progress.lessons?.lesson_categories?.name;
      
      if (categorySlug && categoryName) {
        if (!categoryStats[categorySlug]) {
          categoryStats[categorySlug] = {
            name: categoryName,
            slug: categorySlug,
            completed: 0,
            started: 0,
            total_time: 0
          };
        }
        
        if (progress.status === 'completed') {
          categoryStats[categorySlug].completed++;
        } else if (progress.status === 'started') {
          categoryStats[categorySlug].started++;
        }
        
        categoryStats[categorySlug].total_time += progress.time_spent || 0;
      }
    });

    // Статистика по типам уроков
    const typeStats: { [key: string]: TypeStat } = {};
    typedProgressStats?.forEach((progress: ProgressStat) => {
      const lessonType = progress.lessons?.type;
      
      if (lessonType) {
        if (!typeStats[lessonType]) {
          typeStats[lessonType] = {
            completed: 0,
            started: 0,
            total_time: 0
          };
        }
        
        if (progress.status === 'completed') {
          typeStats[lessonType].completed++;
        } else if (progress.status === 'started') {
          typeStats[lessonType].started++;
        }
        
        typeStats[lessonType].total_time += progress.time_spent || 0;
      }
    });

    const stats = {
      overview: {
        total_lessons: totalLessons || 0,
        completed_lessons: completedLessons,
        started_lessons: startedLessons,
        completion_rate: totalLessons ? (completedLessons / totalLessons) * 100 : 0,
        total_time_spent: totalTimeSpent,
        average_completion: averageCompletion
      },
      by_category: Object.values(categoryStats),
      by_type: typeStats,
      recent_activity: typedProgressStats
        ?.sort((a: ProgressStat, b: ProgressStat) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
        .slice(0, 10) || []
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}