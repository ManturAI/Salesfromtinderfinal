"use client"
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";
import { useLessons } from "../../../lib/hooks/useLessons";
import { useProgress } from "../../../lib/hooks/useProgress";
import { useAuth } from "../../../lib/hooks/useAuth";

interface FavoriteItem {
  lesson_id: string;
}

interface CompletedItem {
  lesson_id: string;
}

function PageContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [activeSection, setActiveSection] = useState<"sprint" | "archive">("sprint");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const { lessons, categories, loading, error } = useLessons(slug);
  const { getLessonProgress } = useProgress();
  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set<string>(data.favorites.map((fav: FavoriteItem) => fav.lesson_id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const loadCompleted = useCallback(async () => {
    try {
      const response = await fetch('/api/completed');
      if (response.ok) {
        const data = await response.json();
        const completedIds = new Set<string>(data.completed.map((comp: CompletedItem) => comp.lesson_id));
        setCompletedLessons(completedIds);
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  }, []);

  // Загружаем статусы избранного и завершенного при загрузке компонента
  useEffect(() => {
    if (user) {
      loadFavorites();
      loadCompleted();
    }
  }, [user, loadFavorites, loadCompleted]);

  const toggleFavorite = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;

    try {
      const isFavorite = favorites.has(lessonId);
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
        const newFavorites = new Set(favorites);
        if (isFavorite) {
          newFavorites.delete(lessonId);
        } else {
          newFavorites.add(lessonId);
        }
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleCompleted = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;

    try {
      const isCompleted = completedLessons.has(lessonId);
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
        const newCompleted = new Set(completedLessons);
        if (isCompleted) {
          newCompleted.delete(lessonId);
        } else {
          newCompleted.add(lessonId);
        }
        setCompletedLessons(newCompleted);
      }
    } catch (error) {
      console.error('Error toggling completed:', error);
    }
  };

  const handleBack = () => router.push("/?actions=1");

  const currentCategory = categories.find(cat => cat.slug === slug);
  const sprintLessons = lessons.filter(lesson => lesson.type === 'sprint');
  const archiveLessons = lessons.filter(lesson => lesson.type === 'archive');

  const changeSection = (section: "sprint" | "archive") => {
    setActiveSection(section);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "demo":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="9" x2="16" y2="9" />
          </svg>
        );
      case "case":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
        );
      case "tools":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
          </svg>
        );
      case "archive":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
        );
      case "email":
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        );
      default:
        return (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        );
    }
  };

  const getProgressStatus = (lessonId: string) => {
    const lessonProgress = getLessonProgress(lessonId);
    return lessonProgress?.status || 'not_started';
  };

  const getProgressIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        );
      case 'in_progress':
        return (
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
        );
      default:
        return (
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
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
            Загрузка уроков...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="text-red-400 text-center">
            Ошибка загрузки: {error}
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

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок и навигация */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
              Назад к категориям
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {currentCategory?.name || 'Категория не найдена'}
            </h1>
            <p className="text-white/70 text-lg">
              {currentCategory?.description || 'Описание категории'}
            </p>
          </div>

          {/* Переключатель секций */}
          <div className="mb-8">
            <div className="flex gap-1 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => changeSection("sprint")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "sprint"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Спринт ({sprintLessons.length})
              </button>
              <button
                onClick={() => changeSection("archive")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === "archive"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Архив ({archiveLessons.length})
              </button>
            </div>
          </div>

          {/* Контент секций */}
          <div className="space-y-3">
            {activeSection === "sprint" ? (
              sprintLessons.length > 0 ? (
                sprintLessons
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 shadow-sm hover:border-white/20 hover:bg-white/10 transition cursor-pointer"
                      onClick={() => router.push(`/lessons/${slug}/${lesson.id}`)}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors text-sm">
                        {getIcon(lesson.icon)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Кнопка избранного */}
                        <button
                          onClick={(e) => toggleFavorite(lesson.id, e)}
                          className={`p-2 rounded-lg transition-all ${
                            favorites.has(lesson.id)
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-yellow-400"
                          }`}
                          title={favorites.has(lesson.id) ? "Удалить из избранного" : "Добавить в избранное"}
                        >
                          <svg className="w-4 h-4" fill={favorites.has(lesson.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        
                        {/* Кнопка завершения */}
                        <button
                          onClick={(e) => toggleCompleted(lesson.id, e)}
                          className={`p-2 rounded-lg transition-all ${
                            completedLessons.has(lesson.id)
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-green-400"
                          }`}
                          title={completedLessons.has(lesson.id) ? "Отметить как незавершенное" : "Отметить как завершенное"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        
                        {/* Индикатор прогресса */}
                        {getProgressIndicator(getProgressStatus(lesson.id))}
                        
                        {/* Стрелка */}
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-white/50">
                  В этой категории пока нет уроков спринта
                </div>
              )
            ) : (
              archiveLessons.length > 0 ? (
                archiveLessons
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 shadow-sm hover:border-white/20 hover:bg-white/10 transition cursor-pointer"
                      onClick={() => router.push(`/lessons/${slug}/${lesson.id}`)}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors text-sm">
                        {getIcon(lesson.icon)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Кнопка избранного */}
                        <button
                          onClick={(e) => toggleFavorite(lesson.id, e)}
                          className={`p-2 rounded-lg transition-all ${
                            favorites.has(lesson.id)
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-yellow-400"
                          }`}
                          title={favorites.has(lesson.id) ? "Удалить из избранного" : "Добавить в избранное"}
                        >
                          <svg className="w-4 h-4" fill={favorites.has(lesson.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        
                        {/* Кнопка завершения */}
                        <button
                          onClick={(e) => toggleCompleted(lesson.id, e)}
                          className={`p-2 rounded-lg transition-all ${
                            completedLessons.has(lesson.id)
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-green-400"
                          }`}
                          title={completedLessons.has(lesson.id) ? "Отметить как незавершенное" : "Отметить как завершенное"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        
                        {/* Индикатор прогресса */}
                        {getProgressIndicator(getProgressStatus(lesson.id))}
                        
                        {/* Стрелка */}
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-white/50">
                  В этой категории пока нет архивных уроков
                </div>
              )
            )}
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