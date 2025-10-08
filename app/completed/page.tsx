"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/hooks/useAuth";
import { Component as EtheralShadow } from "../../components/ui/etheral-shadow";

interface CompletedLesson {
  id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string;
  lessons: {
    id: string;
    title: string;
    description: string;
    type: 'sprint' | 'archive';
    icon: string;
    lesson_categories: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export default function CompletedPage() {
  const [completed, setCompleted] = useState<CompletedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchCompleted();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCompleted = async () => {
    try {
      const response = await fetch('/api/completed');
      if (!response.ok) {
        throw new Error('Failed to fetch completed lessons');
      }
      const data = await response.json();
      setCompleted(data.completed);
    } catch (error) {
      console.error('Error fetching completed lessons:', error);
      setError('Ошибка загрузки завершенных уроков');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = async (lessonId: string) => {
    try {
      const response = await fetch('/api/completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          completed: false
        }),
      });

      if (response.ok) {
        // Удаляем урок из списка завершенных
        setCompleted(prev => prev.filter(comp => comp.lesson_id !== lessonId));
      }
    } catch (error) {
      console.error('Error removing from completed:', error);
    }
  };

  const getCategoryIcon = (type: string) => {
    if (type === 'sprint') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
      </svg>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
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
          <div className="text-white/70 text-center py-8">
            Загрузка...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
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
          <div className="text-center px-6 w-[520px] max-w-[92vw] mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Завершенные уроки
            </h1>
            <p className="text-white/60 mb-6 text-center">
              Войдите в систему через Telegram, чтобы просмотреть завершенные уроки
            </p>
            <div className="text-center px-6 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg">
              Автоматический вход через Telegram
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow 
          color="rgba(128, 128, 128, 1)"
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>
      
      <div className="relative z-10 min-h-screen py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <svg className="h-6 w-6 text-white/70 hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              Завершенные уроки
            </h1>
            <div className="mx-auto h-[2px] w-24 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 opacity-70" />
          </div>

          {/* Content */}
          {error ? (
            <div className="text-red-400 text-center py-8">
              {error}
            </div>
          ) : completed.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl text-white/90 mb-2">Нет завершенных уроков</h2>
              <p className="text-white/60 mb-6">
                Завершите уроки, чтобы отслеживать свой прогресс здесь
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors"
              >
                Перейти к урокам
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {completed.map((completedLesson) => (
                <div
                  key={completedLesson.id}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-green-300 transition-colors">
                    {getCategoryIcon(completedLesson.lessons.type)}
                  </span>
                  
                  <div className="flex-1">
                    <Link 
                      href={`/lessons/${completedLesson.lessons.lesson_categories.slug}/${completedLesson.lessons.id}`}
                      className="block"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
                        {completedLesson.lessons.title}
                      </h3>
                      <p className="text-sm text-white/70">
                        {completedLesson.lessons.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{completedLesson.lessons.lesson_categories.name} • {completedLesson.lessons.type === 'sprint' ? 'Спринт' : 'Архив'}</span>
                        <span>•</span>
                        <span>Завершено {formatDate(completedLesson.completed_at)}</span>
                      </div>
                    </Link>
                  </div>

                  <button
                    onClick={() => toggleCompleted(completedLesson.lesson_id)}
                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                    title="Отметить как незавершенный"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}