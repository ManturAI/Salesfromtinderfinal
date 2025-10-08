"use client"
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Component as EtheralShadow } from "../../../../components/ui/etheral-shadow";
import { useLessons } from "../../../../lib/hooks/useLessons";
import { useProgress } from "../../../../lib/hooks/useProgress";
import { useAuth } from "../../../../lib/hooks/useAuth";

interface ContentSection {
  title?: string;
  content?: string;
  type?: string;
  items?: string[];
}

interface LessonContentData {
  sections?: ContentSection[];
  [key: string]: unknown;
}

interface FavoriteItem {
  lesson_id: string;
}

interface CompletedItem {
  lesson_id: string;
}

interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: LessonContentData | string;
  type: 'sprint' | 'archive';
  icon: string;
  lesson_categories?: {
    name: string;
    slug: string;
  };
}

function PageContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const lessonId = params.id as string;
  
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { fetchLesson } = useLessons();
  const { updateProgress, getLessonProgress } = useProgress();
  const { user } = useAuth();

  const loadFavoriteStatus = useCallback(async () => {
    if (!user) return false;
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoriteLesson = data.favorites.find((fav: FavoriteItem) => fav.lesson_id === lessonId);
        return !!favoriteLesson;
      }
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
    return false;
  }, [lessonId, user]);

  const loadCompletedStatus = useCallback(async () => {
    if (!user) return false;
    try {
      const response = await fetch('/api/completed');
      if (response.ok) {
        const data = await response.json();
        const completedLesson = data.completed.find((comp: CompletedItem) => comp.lesson_id === lessonId);
        return !!completedLesson;
      }
    } catch (error) {
      console.error('Error loading completed status:', error);
    }
    return false;
  }, [lessonId, user]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadAllData = async () => {
      if (!lessonId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Создаем модифицированную версию fetchLesson с AbortController
        const fetchLessonWithAbort = async (id: string) => {
          const response = await fetch(`/api/lessons/${id}`, {
            signal: abortController.signal
          });
          if (!response.ok) {
            throw new Error('Failed to fetch lesson');
          }
          const data = await response.json();
          return data.lesson;
        };
        
        // Загружаем все данные параллельно
        const [lessonData, favoriteStatus, completedStatus] = await Promise.all([
          fetchLessonWithAbort(lessonId),
          loadFavoriteStatus(),
          loadCompletedStatus()
        ]);
        
        // Проверяем, не был ли запрос отменен
        if (abortController.signal.aborted) return;
        
        // Обновляем все состояния одновременно
        setLesson(lessonData);
        setIsFavorite(favoriteStatus);
        setIsCompleted(completedStatus);
        
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Игнорируем ошибки отмены запроса
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadAllData();
    
    // Очистка: отменяем запрос при размонтировании или изменении lessonId
    return () => {
      abortController.abort();
    };
  }, [lessonId]);

  const toggleFavorite = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          is_favorite: !isFavorite
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleCompleted = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          is_completed: !isCompleted
        }),
      });

      if (response.ok) {
        setIsCompleted(!isCompleted);
      }
    } catch (error) {
      console.error('Error toggling completed:', error);
    }
  };

  const handleBack = () => router.push(`/lessons/${slug}`);

  const handleStartLesson = async () => {
    if (!lesson) return;
    
    const result = await updateProgress(lesson.id, 'in_progress');
    if (result?.success) {
      // Можно добавить уведомление об успехе
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    
    const result = await updateProgress(lesson.id, 'completed');
    if (result?.success) {
      // Можно добавить уведомление об успехе
      setIsCompleted(true);
    }
  };

  const renderLessonContent = (content: LessonContentData | string) => {
    if (!content) return null;

    // Если контент - это строка, отображаем как текст
    if (typeof content === 'string') {
      return (
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-white/80 leading-relaxed">
            {content}
          </div>
        </div>
      );
    }

    // Если контент - это объект, пытаемся отобразить его структурированно
    if (typeof content === 'object') {
      return (
        <div className="space-y-6">
          {content.sections?.map((section: ContentSection, index: number) => (
            <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
              {section.title && (
                <h3 className="text-xl font-semibold text-white mb-4">
                  {section.title}
                </h3>
              )}
              {section.content && (
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              )}
              {section.items && (
                <ul className="list-disc list-inside space-y-2 text-white/80">
                  {section.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )) || (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-white/80 leading-relaxed">
                {JSON.stringify(content, null, 2)}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "demo":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="9" x2="16" y2="9" />
          </svg>
        );
      case "case":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
        );
      case "tools":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
          </svg>
        );
      case "archive":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
        );
      default:
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="font-sans relative min-h-screen">
        <div className="absolute inset-0">
          <EtheralShadow 
            color="rgba(128, 128, 128, 1)"
            noise={{ opacity: 1, scale: 1.2 }}
            sizing="fill"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white/70 text-center">
            Загрузка урока...
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="font-sans relative min-h-screen">
        <div className="absolute inset-0">
          <EtheralShadow 
            color="rgba(128, 128, 128, 1)"
            noise={{ opacity: 1, scale: 1.2 }}
            sizing="fill"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              {error || 'Урок не найден'}
            </div>
            <button
              onClick={handleBack}
              className="text-white/70 hover:text-white transition-colors"
            >
              Вернуться к урокам
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lessonProgress = getLessonProgress(lesson.id);
  const progressStatus = lessonProgress?.status || 'not_started';

  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow 
          color="rgba(128, 128, 128, 1)"
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Навигация */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
              Назад к урокам
            </button>

            {/* Заголовок урока */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90">
                {getIcon(lesson.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {lesson.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.type === 'sprint' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {lesson.type === 'sprint' ? 'Спринт' : 'Архив'}
                  </span>
                </div>
                <p className="text-white/70 text-lg mb-4">
                  {lesson.description}
                </p>
                {lesson.lesson_categories && (
                  <div className="text-white/50 text-sm">
                    Категория: {lesson.lesson_categories.name}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-3 mb-8">
              {/* Основные кнопки прогресса */}
              <div className="flex gap-3">
                {progressStatus === 'not_started' && (
                  <button
                    onClick={handleStartLesson}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg"
                  >
                    Начать урок
                  </button>
                )}
                {progressStatus === 'in_progress' && (
                  <button
                    onClick={handleCompleteLesson}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    Завершить урок
                  </button>
                )}
                {progressStatus === 'completed' && (
                  <div className="px-6 py-3 bg-green-500/20 text-green-300 font-medium rounded-xl border border-green-500/30">
                    ✓ Урок завершен
                  </div>
                )}
              </div>

              {/* Кнопки избранного и завершенного */}
              {user && (
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-xl transition-all ${
                      isFavorite
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-yellow-400'
                    }`}
                    title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <svg className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={toggleCompleted}
                    className={`p-3 rounded-xl transition-all ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-green-400'
                    }`}
                    title={isCompleted ? 'Отметить как незавершенный' : 'Отметить как завершенный'}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Контент урока */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            {renderLessonContent(lesson.content)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="font-sans relative min-h-screen">
        <div className="absolute inset-0">
          <EtheralShadow 
            color="rgba(128, 128, 128, 1)"
            noise={{ opacity: 1, scale: 1.2 }}
            sizing="fill"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white/70">Загрузка...</div>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}