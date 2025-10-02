"use client"
import { useState } from "react";
import { Component as EtheralShadow } from "../components/ui/etheral-shadow";
import { HoverButton } from "../components/ui/hover-button";

export default function Home() {
  const [showActions, setShowActions] = useState(false);
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
          <h1 className="relative leading-tight text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            Продажник из тиндера
          </h1>
          <div className="mx-auto mt-2 h-[2px] w-28 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 opacity-70" />
          {!showActions && (
            <div className="mt-6 pointer-events-auto">
              <HoverButton onClick={() => setShowActions(true)}>
                Начать
              </HoverButton>
            </div>
          )}
          {showActions && (
            <div className="mt-8 space-y-4 pointer-events-auto">
              <button aria-label="Выявление потребностей" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
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
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Выявление потребностей</span>
                <span className="block text-sm text-white/70">Сбор информации и понимание задач клиента</span>
              </span>
            </button>

            <button aria-label="Отработка возражений" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
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
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Отработка возражений</span>
                <span className="block text-sm text-white/70">Работа с сомнениями и барьерами клиента</span>
              </span>
            </button>

            <button aria-label="Постмит после встречи" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
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
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Постмит после встречи</span>
                <span className="block text-sm text-white/70">Резюме, материалы и дальнейшие шаги</span>
              </span>
            </button>

            <button aria-label="Дожим клиентов" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
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
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Дожим клиентов</span>
                <span className="block text-sm text-white/70">Финализация сделки и призыв к действию</span>
              </span>
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
