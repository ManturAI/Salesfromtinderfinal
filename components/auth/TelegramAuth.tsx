'use client';

import { useEffect, useState } from 'react';

interface TelegramAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function TelegramAuth({ onSuccess, onError, className }: TelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли Telegram WebApp
    const checkTelegramWebApp = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setIsTelegramAvailable(true);
        // Инициализируем Telegram WebApp
        if (window.Telegram.WebApp.ready) {
          window.Telegram.WebApp.ready();
        }
        return true;
      }
      return false;
    };

    // Проверяем сразу
    if (checkTelegramWebApp()) {
      return;
    }

    // Если не доступен, проверяем через интервал (на случай если скрипт еще загружается)
    const interval = setInterval(() => {
      if (checkTelegramWebApp()) {
        clearInterval(interval);
      }
    }, 100);

    // Очищаем интервал через 5 секунд
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleTelegramAuth = async () => {
    if (!window.Telegram?.WebApp) {
      const errorMsg = 'Telegram WebApp не доступен. Откройте приложение через Telegram.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const webApp = window.Telegram.WebApp;
      const initData = webApp.initData;

      if (!initData) {
        throw new Error('Не удалось получить данные инициализации Telegram');
      }

      // Отправляем запрос на аутентификацию
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка аутентификации');
      }

      if (data.success && data.user) {
        onSuccess?.(data.user);
        // Можно перенаправить пользователя или обновить состояние приложения
        window.location.reload();
      } else {
        throw new Error('Неожиданный ответ сервера');
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Произошла ошибка при аутентификации';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAuth = () => {
    // Для случаев когда нужно показать инструкции пользователю
    setError('Для входа откройте это приложение через Telegram бота или веб-приложение Telegram.');
  };

  if (!isTelegramAvailable) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.655-.377 2.655-1.377 2.655-.896 0-1.377-1.377-1.377-2.655 0-.896.377-2.655.377-2.655s.169-3.551.169-4.447c0-.896-.377-1.377-.896-1.377s-.896.481-.896 1.377c0 .896.169 4.447.169 4.447s.377 1.759.377 2.655c0 1.278-.481 2.655-1.377 2.655s-1.377-1.377-1.377-2.655c0-.896.377-2.655.377-2.655s.727-4.87.896-6.728C8.16 5.373 10.142 4 12 4s3.84 1.373 3.568 4.16z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Вход через Telegram</h3>
        </div>
        <p className="text-white/70 text-sm mb-4">
          Для использования приложения необходимо войти через Telegram
        </p>
        
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <p className="text-yellow-300 text-sm">
            Откройте это приложение через Telegram бота или веб-приложение Telegram для автоматического входа.
          </p>
        </div>
        
        <button 
          onClick={handleManualAuth}
          className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
        >
          Как войти через Telegram?
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.655-.377 2.655-1.377 2.655-.896 0-1.377-1.377-1.377-2.655 0-.896.377-2.655.377-2.655s.169-3.551.169-4.447c0-.896-.377-1.377-.896-1.377s-.896.481-.896 1.377c0 .896.169 4.447.169 4.447s.377 1.759.377 2.655c0 1.278-.481 2.655-1.377 2.655s-1.377-1.377-1.377-2.655c0-.896.377-2.655.377-2.655s.727-4.87.896-6.728C8.16 5.373 10.142 4 12 4s3.84 1.373 3.568 4.16z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Вход через Telegram</h3>
      </div>
      <p className="text-white/70 text-sm mb-4">
        Нажмите кнопку ниже для входа с использованием вашего Telegram аккаунта
      </p>
      
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      
      <button 
        onClick={handleTelegramAuth}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
            Вход...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.655-.377 2.655-1.377 2.655-.896 0-1.377-1.377-1.377-2.655 0-.896.377-2.655.377-2.655s.169-3.551.169-4.447c0-.896-.377-1.377-.896-1.377s-.896.481-.896 1.377c0 .896.169 4.447.169 4.447s.377 1.759.377 2.655c0 1.278-.481 2.655-1.377 2.655s-1.377-1.377-1.377-2.655c0-.896.377-2.655.377-2.655s.727-4.87.896-6.728C8.16 5.373 10.142 4 12 4s3.84 1.373 3.568 4.16z"/>
            </svg>
            Войти через Telegram
          </>
        )}
      </button>

      <div className="text-xs text-white/50 text-center mt-3">
        Используя Telegram для входа, вы соглашаетесь с нашими условиями использования
      </div>
    </div>
  );
}