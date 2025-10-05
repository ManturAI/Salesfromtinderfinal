"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Component as EtheralShadow } from "../components/ui/etheral-shadow";
import { HoverButton } from "../components/ui/hover-button";
import { useLessons } from "../lib/hooks/useLessons";
import { useAuth } from "../lib/hooks/useAuth";

export default function Home() {
  const [showActions, setShowActions] = useState(false);
  const { categories, loading, error } = useLessons();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shouldOpen = params.get("actions") === "1";
      const stored = localStorage.getItem("sf_actions") === "true";
      if (shouldOpen || stored) {
        setShowActions(true);
      }
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  // Иконки для категорий
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'needs':
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="6" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        );
      case 'objections':
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L5 14h6l-1 8 9-13h-6l1-7z" />
          </svg>
        );
      case 'closing':
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        );
      case 'general':
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        );
      default:
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        );
    }
  };

  return (
    <div className="font-sans relative min-h-screen">
      {/* Фон EtheralShadow */}
      <div className="absolute inset-0">
        <EtheralShadow 
          color="rgba(128, 128, 128, 1)"
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      {/* Контент по центру */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center px-6 w-[520px] max-w-[92vw] mx-auto">
          {/* User info and auth buttons */}
          {!authLoading && (
            <div className="absolute top-4 right-4 flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white/90 text-sm font-medium">
                      {user.full_name}
                    </div>
                    <div className="text-white/50 text-xs">
                      {user.email}
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors text-sm"
                    >
                      Админ
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className="px-3 py-1.5 bg-white/5 text-white/70 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors text-sm"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href="/admin" aria-label="Админ панель" className="group inline-block">
            <h1 className="relative leading-tight text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] cursor-pointer transition-colors group-hover:text-fuchsia-300">
              Продажник из тиндера
            </h1>
          </Link>
          <div className="mx-auto mt-2 h-[2px] w-28 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 opacity-70" />
          
          {/* Кнопки избранных и завершенных */}
          {showActions && (
            <div className="mt-6 flex justify-center gap-4 pointer-events-auto">
              <Link
                href="/favorites"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">Избранные</span>
              </Link>
              
              <Link
                href="/completed"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Завершенные</span>
              </Link>
            </div>
          )}
          {!showActions && (
            <div className="mt-6 pointer-events-auto">
              <HoverButton onClick={() => { setShowActions(true); try { localStorage.setItem("sf_actions", "true"); } catch {} }}>
                Начать
              </HoverButton>
            </div>
          )}
          {showActions && (
            <div className="mt-8 space-y-4 pointer-events-auto">
              {loading ? (
                <div className="text-white/70 text-center py-8">
                  Загрузка категорий...
                </div>
              ) : error ? (
                <div className="text-red-400 text-center py-8">
                  Ошибка загрузки: {error}
                </div>
              ) : (
                categories
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((category) => (
                    <Link 
                      key={category.id}
                      href={`/lessons/${category.slug}`} 
                      aria-label={category.name} 
                      className="group block w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                        {getCategoryIcon(category.slug)}
                      </span>
                      <span className="flex-1">
                        <span className="block text-base md:text-lg font-semibold text-white">
                          {category.name}
                        </span>
                        <span className="block text-sm text-white/70">
                          {category.description}
                        </span>
                        {category.published_lesson_count > 0 && (
                          <span className="block text-xs text-white/50 mt-1">
                            {category.published_lesson_count} урок{category.published_lesson_count === 1 ? '' : category.published_lesson_count < 5 ? 'а' : 'ов'}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
