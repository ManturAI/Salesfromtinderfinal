import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  time_spent?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  lessons?: {
    id: string;
    title: string;
    type: 'sprint' | 'archive';
    lesson_categories?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface ProgressStats {
  total_lessons: number;
  completed_lessons: number;
  in_progress_lessons: number;
  completion_percentage: number;
  average_score: number;
  total_time_spent: number;
  by_category: Array<{
    category_name: string;
    category_slug: string;
    total: number;
    completed: number;
    completion_percentage: number;
  }>;
  by_type: Array<{
    type: 'sprint' | 'archive';
    total: number;
    completed: number;
    completion_percentage: number;
  }>;
  recent_activity: Array<{
    lesson_id: string;
    lesson_title: string;
    status: string;
    completed_at: string;
    score?: number;
  }>;
}

interface ProgressState {
  progress: UserProgress[];
  stats: ProgressStats | null;
  loading: boolean;
  error: string | null;
}

export function useProgress(lessonId?: string) {
  const [state, setState] = useState<ProgressState>({
    progress: [],
    stats: null,
    loading: true,
    error: null,
  });

  const { user } = useAuth();

  const fetchProgress = async (lesson?: string) => {
    try {
      const params = new URLSearchParams();
      if (lesson) params.append('lesson_id', lesson);
      
      const response = await fetch(`/api/progress?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      return data.progress;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/progress/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setState({
          progress: [],
          stats: null,
          loading: false,
          error: null,
        });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const [progress, stats] = await Promise.all([
          fetchProgress(lessonId),
          fetchStats()
        ]);

        setState({
          progress,
          stats,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load progress',
        }));
      }
    };

    loadData();
  }, [user, lessonId]);

  const updateProgress = async (
    lessonId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    score?: number,
    timeSpent?: number
  ) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          status,
          score,
          time_spent: timeSpent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { success: false, error: data.error };
      }

      // Обновляем локальное состояние
      setState(prev => {
        const existingIndex = prev.progress.findIndex(p => p.lesson_id === lessonId);
        let newProgress;
        
        if (existingIndex >= 0) {
          newProgress = [...prev.progress];
          newProgress[existingIndex] = data.progress;
        } else {
          newProgress = [...prev.progress, data.progress];
        }

        return {
          ...prev,
          progress: newProgress,
          loading: false,
          error: null,
        };
      });

      // Обновляем статистику
      try {
        const newStats = await fetchStats();
        setState(prev => ({ ...prev, stats: newStats }));
      } catch (error) {
        console.error('Error updating stats:', error);
      }

      return { success: true, progress: data.progress };
    } catch {
      console.error('Failed to update progress');
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return state.progress.find(p => p.lesson_id === lessonId);
  };

  const getProgressByStatus = (status: 'not_started' | 'in_progress' | 'completed') => {
    return state.progress.filter(p => p.status === status);
  };

  const refetch = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [progress, stats] = await Promise.all([
        fetchProgress(lessonId),
        fetchStats()
      ]);

      setState({
        progress,
        stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reload progress',
      }));
    }
  };

  return {
    ...state,
    updateProgress,
    getLessonProgress,
    getProgressByStatus,
    refetch,
  };
}