import { useState, useEffect } from 'react';

interface LessonCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  lesson_count: number;
  published_lesson_count: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any;
  type: 'sprint' | 'archive';
  icon: string;
  order_index: number;
  is_published: boolean;
  category_id: string;
  created_at: string;
  updated_at: string;
  lesson_categories?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description?: string;
  };
}

interface LessonsState {
  lessons: Lesson[];
  categories: LessonCategory[];
  loading: boolean;
  error: string | null;
}

export function useLessons(categorySlug?: string, type?: string) {
  const [state, setState] = useState<LessonsState>({
    lessons: [],
    categories: [],
    loading: true,
    error: null,
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const fetchLessons = async (category?: string, lessonType?: string) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (lessonType) params.append('type', lessonType);
      
      const response = await fetch(`/api/lessons?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      const data = await response.json();
      return data.lessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  };

  const fetchLesson = async (id: string) => {
    try {
      const response = await fetch(`/api/lessons/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      const data = await response.json();
      return data.lesson;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const [categories, lessons] = await Promise.all([
          fetchCategories(),
          fetchLessons(categorySlug, type)
        ]);

        setState({
          categories,
          lessons,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load data',
        }));
      }
    };

    loadData();
  }, [categorySlug, type]);

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [categories, lessons] = await Promise.all([
        fetchCategories(),
        fetchLessons(categorySlug, type)
      ]);

      setState({
        categories,
        lessons,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reload data',
      }));
    }
  };

  const getLessonsByCategory = (slug: string) => {
    return state.lessons.filter(lesson => 
      lesson.lesson_categories?.slug === slug
    );
  };

  const getLessonsByType = (lessonType: 'sprint' | 'archive') => {
    return state.lessons.filter(lesson => lesson.type === lessonType);
  };

  return {
    ...state,
    fetchLesson,
    refetch,
    getLessonsByCategory,
    getLessonsByType,
  };
}