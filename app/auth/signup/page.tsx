"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";
import { useAuth } from "../../../lib/hooks/useAuth";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signUp } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const redirect = searchParams.get('redirect') || '/';

  // Перенаправляем авторизованного пользователя
  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(email, password, fullName);
    
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Произошла ошибка при регистрации');
    }
    
    setIsSubmitting(false);
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
            Загрузка...
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Регистрация
            </h1>
            <p className="text-white/70">
              Создайте аккаунт для доступа к урокам
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                Полное имя
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                placeholder="Введите ваше имя"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                placeholder="Введите ваш email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                placeholder="Минимум 6 символов"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email || !password || !fullName}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-lg hover:from-violet-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Уже есть аккаунт?{' '}
              <Link 
                href={`/auth/signin${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="text-white/50 hover:text-white/70 transition-colors text-sm"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}