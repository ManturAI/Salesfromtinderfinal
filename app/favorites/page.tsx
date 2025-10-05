"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/hooks/useAuth";
import { Component as EtheralShadow } from "../../components/ui/etheral-shadow";

interface FavoriteLesson {
  id: string;
  lesson_id: string;
  is_favorite: boolean;
  created_at: string;
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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchFavorites();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Ошибка загрузки избранных уроков');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (lessonId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          is_favorite: false
        }),
      });

      if (response.ok) {
        // Удаляем урок из списка избранных
        setFavorites(prev => prev.filter(fav => fav.lesson_id !== lessonId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
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
              Избранные уроки
            </h1>
            <p className="text-white/70 mb-8">
              Войдите в систему, чтобы просмотреть избранные уроки
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors"
            >
              Войти
            </Link>
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
              Избранные уроки
            </h1>
            <div className="mx-auto h-[2px] w-24 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 opacity-70" />
          </div>

          {/* Content */}
          {error ? (
            <div className="text-red-400 text-center py-8">
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-xl text-white/90 mb-2">Нет избранных уроков</h2>
              <p className="text-white/60 mb-6">
                Добавьте уроки в избранное, чтобы быстро находить их здесь
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
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-yellow-300 transition-colors">
                    {getCategoryIcon(favorite.lessons.type)}
                  </span>
                  
                  <div className="flex-1">
                    <Link 
                      href={`/lessons/${favorite.lessons.lesson_categories.slug}/${favorite.lessons.id}`}
                      className="block"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors">
                        {favorite.lessons.title}
                      </h3>
                      <p className="text-sm text-white/70">
                        {favorite.lessons.description}
                      </p>
                      <span className="text-xs text-white/50">
                        {favorite.lessons.lesson_categories.name} • {favorite.lessons.type === 'sprint' ? 'Спринт' : 'Архив'}
                      </span>
                    </Link>
                  </div>

                  <button
                    onClick={() => toggleFavorite(favorite.lesson_id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Удалить из избранного"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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