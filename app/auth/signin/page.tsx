"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";
import { useAuth } from "../../../lib/hooks/useAuth";
import TelegramAuth from "../../../components/auth/TelegramAuth";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  
  const redirect = searchParams.get('redirect') || '/';

  // Перенаправляем авторизованного пользователя
  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleTelegramSuccess = (user: any) => {
    console.log('Telegram auth success:', user);
    router.push(redirect);
  };

  const handleTelegramError = (error: string) => {
    console.error('Telegram auth error:', error);
    setError(error);
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
              Вход в систему
            </h1>
            <p className="text-white/70">
              Войдите через Telegram для продолжения
            </p>
          </div>

          {/* Telegram Auth Component */}
          <TelegramAuth 
            onSuccess={handleTelegramSuccess}
            onError={handleTelegramError}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

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