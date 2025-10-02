"use client"
import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";

function PageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<"sprint" | "archive">("sprint");

  const handleBack = () => router.push("/?actions=1");

  useEffect(() => {
    const section = searchParams.get("section");
    setActiveSection(section === "archive" ? "archive" : "sprint");
  }, [searchParams]);

  const changeSection = (section: "sprint" | "archive") => {
    setActiveSection(section);
    router.replace(`${pathname}?section=${section}`, { scroll: false });
  };

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Назад
      </button>

      <h1 className="text-2xl md:text-3xl font-bold">Выявление потребностей</h1>
      <p className="mt-2 text-sm text-white/70">Активный спринт и архив материалов</p>

      <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => changeSection("sprint")}
          className={`px-4 py-2 text-sm rounded-full transition ${
            activeSection === "sprint"
              ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-white border border-white/15"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          Спринт
        </button>
        <button
          onClick={() => changeSection("archive")}
          className={`ml-1 px-4 py-2 text-sm rounded-full transition ${
            activeSection === "archive"
              ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-white border border-white/15"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          Архив
        </button>
      </div>

      <div className="mt-8">
        {activeSection === "sprint" ? (
          <div className="space-y-4">
            <div className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="9" x2="16" y2="9" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Демо-урок: Выявление потребностей клиента</span>
                <span className="block text-sm text-white/70">Методики интервью и уточняющих вопросов</span>
              </span>
            </div>

            {[
              { id: "case-need-1", title: "Кейс: Разговор с ЛПР", desc: "Разбор вопросов" },
              { id: "tools-need-1", title: "Инструменты: Матрица потребностей", desc: "Каркас беседы" },
            ].map((item) => (
              <div key={item.id} className="group w-full text-left flex itemscenter gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="12" x2="15" y2="15" />
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block text-base md:text-lg font-semibold text-white">{item.title}</span>
                  <span className="block text-sm text-white/70">{item.desc}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="6" width="16" height="12" rx="2" />
                  <path d="M4 7l8 5 8-5" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">Демо-урок (архив): Открытые вопросы</span>
                <span className="block text-sm text-white/70">Материалы прошлых спринтов</span>
              </span>
            </div>

            {[
              { id: "2024-07-need", title: "Июль 2024: Диалог с клиентом", desc: "Архивный урок" },
              { id: "2024-05-need", title: "Май 2024: Сбор требований", desc: "Архивный урок" },
            ].map((item) => (
              <div key={item.id} className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="6" width="16" height="12" rx="2" />
                    <path d="M4 7l8 5 8-5" />
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block text-base md:text-lg font-semibold text-white">{item.title}</span>
                  <span className="block text-sm text-white/70">{item.desc}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow color="rgba(128, 128, 128, 1)" noise={{ opacity: 1, scale: 1.2 }} sizing="fill" />
      </div>
      <Suspense fallback={<div className="relative z-10 mx-auto max-w-2xl px-4 py-10 text-white/70">Загрузка…</div>}>
        <PageContent />
      </Suspense>
    </div>
  );
}
// Ensure TypeScript treats this file as a module in all setups
export {}