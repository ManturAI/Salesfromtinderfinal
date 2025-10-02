"use client"
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Component as EtheralShadow } from "../../components/ui/etheral-shadow";

type Topic = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  icon: string;
  topicId?: string;
};

const ICONS = [
  { id: "globe.svg", label: "Globe" },
  { id: "file.svg", label: "File" },
  { id: "window.svg", label: "Window" },
  { id: "next.svg", label: "Next" },
  { id: "vercel.svg", label: "Vercel" },
];

const TOPICS_KEY = "sf_admin_topics";
const LESSONS_KEY = "sf_admin_lessons";

export default function Page() {
  const router = useRouter();
  const handleBack = () => router.push("/?actions=1");

  const [activeTab, setActiveTab] = useState<"topics" | "lessons">("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicIcon, setTopicIcon] = useState(ICONS[0].id);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonIcon, setLessonIcon] = useState(ICONS[0].id);
  const [lessonTopicId, setLessonTopicId] = useState<string | undefined>(undefined);
  const [lessonError, setLessonError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedTopics = JSON.parse(localStorage.getItem(TOPICS_KEY) || "[]");
      const savedLessons = JSON.parse(localStorage.getItem(LESSONS_KEY) || "[]");
      setTopics(Array.isArray(savedTopics) ? savedTopics : []);
      setLessons(Array.isArray(savedLessons) ? savedLessons : []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  }, [lessons]);

  const canAddTopic = topicTitle.trim().length > 0;
  const canAddLesson = lessonTitle.trim().length > 0;

  const addTopic = () => {
    if (!canAddTopic) {
      setTopicError("Введите название темы");
      return;
    }
    const t: Topic = {
      id: `t_${Date.now()}`,
      title: topicTitle.trim(),
      description: topicDesc.trim(),
      icon: topicIcon,
    };
    setTopics((prev) => [t, ...prev]);
    setTopicTitle("");
    setTopicDesc("");
    setTopicIcon(ICONS[0].id);
    setTopicError(null);
  };

  const addLesson = () => {
    if (!canAddLesson) {
      setLessonError("Введите название урока");
      return;
    }
    const l: Lesson = {
      id: `l_${Date.now()}`,
      title: lessonTitle.trim(),
      description: lessonDesc.trim(),
      icon: lessonIcon,
      topicId: lessonTopicId || undefined,
    };
    setLessons((prev) => [l, ...prev]);
    setLessonTitle("");
    setLessonDesc("");
    setLessonIcon(ICONS[0].id);
    setLessonTopicId(undefined);
    setLessonError(null);
  };

  const topicMap = useMemo(() => Object.fromEntries(topics.map(t => [t.id, t.title])), [topics]);

  const removeTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    setLessons(prev => prev.map(l => (l.topicId === id ? { ...l, topicId: undefined } : l)));
  };

  const removeLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const IconPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="grid grid-cols-5 gap-3">
      {ICONS.map((icon) => {
        const selected = value === icon.id;
        return (
          <button
            key={icon.id}
            type="button"
            onClick={() => onChange(icon.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-2 transition ${
              selected ? "border-fuchsia-300 bg-white/10 ring-1 ring-fuchsia-300" : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
            aria-pressed={selected}
          >
            <Image src={`/${icon.id}`} alt={icon.label} width={28} height={28} className="h-7 w-7" />
            <span className="text-xs text-white/80">{icon.label}</span>
          </button>
        );
      })}
    </div>
  );

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
    </div>
  );

  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow color="rgba(128, 128, 128, 1)" noise={{ opacity: 1, scale: 1.2 }} sizing="fill" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Назад
          </button>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold">Админ панель</h1>
            <p className="mt-1 text-sm text-white/70">Добавляйте темы и уроки, выбирайте SVG‑иконки и описания</p>
          </div>
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("topics")}
            className={`px-4 py-2 text-sm rounded-full transition ${activeTab === "topics" ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-white border border-white/15" : "text-white/80 hover:bg-white/10"}`}
          >
            Темы
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`ml-1 px-4 py-2 text-sm rounded-full transition ${activeTab === "lessons" ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-white border border-white/15" : "text-white/80 hover:bg-white/10"}`}
          >
            Уроки
          </button>
        </div>

        <div className="mt-8 space-y-10">
          {activeTab === "topics" ? (
            <div>
              <SectionHeader title="Добавить тему" subtitle="Заполните название, выберите иконку и описание" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <input
                    value={topicTitle}
                    onChange={(e) => { setTopicTitle(e.target.value); setTopicError(null); }}
                    placeholder="Название темы"
                    className={`w-full rounded-lg border px-3 py-2 text-white placeholder-white/60 ${topicError ? "border-red-400 bg-red-500/10" : "border-white/10 bg-white/5"}`}
                  />
                  <div>
                    <p className="text-sm text-white/70 mb-2">Выберите иконку</p>
                    <IconPicker value={topicIcon} onChange={setTopicIcon} />
                  </div>
                  <textarea
                    value={topicDesc}
                    onChange={(e) => setTopicDesc(e.target.value)}
                    placeholder="Описание"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/60"
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={addTopic}
                      disabled={!canAddTopic}
                      className={`rounded-lg border px-4 py-2 text-sm transition ${canAddTopic ? "border-white/15 bg-white/10 hover:bg-white/15" : "border-white/10 bg-white/5 text-white/50 cursor-not-allowed"}`}
                    >
                      Добавить тему
                    </button>
                    {topicError && <span className="text-sm text-red-300">{topicError}</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-2">Предпросмотр</p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-4">
                    <Image src={`/${topicIcon}`} alt="icon preview" width={40} height={40} className="h-10 w-10" />
                    <div className="flex-1">
                      <div className="text-white font-medium">{topicTitle || "Название темы"}</div>
                      <div className="text-white/70 text-sm">{topicDesc || "Описание темы"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Список тем</h3>
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">{topics.length} шт.</span>
                </div>
                <div className="mt-3 space-y-3">
                  {topics.length === 0 && (
                    <div className="text-white/70">Пока нет добавленных тем.</div>
                  )}
                  {topics.map((t) => (
                    <div key={t.id} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10">
                      <Image src={`/${t.icon}`} alt="icon" width={32} height={32} className="h-8 w-8" />
                      <div className="flex-1">
                        <div className="text-white font-medium">{t.title}</div>
                        <div className="text-white/70 text-sm">{t.description}</div>
                      </div>
                      <button onClick={() => removeTopic(t.id)} className="text-sm text-white/70 hover:text-red-300">Удалить</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <SectionHeader title="Добавить урок" subtitle="Название, иконка, описание и (необязательно) привязка к теме" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <input
                    value={lessonTitle}
                    onChange={(e) => { setLessonTitle(e.target.value); setLessonError(null); }}
                    placeholder="Название урока"
                    className={`w-full rounded-lg border px-3 py-2 text-white placeholder-white/60 ${lessonError ? "border-red-400 bg-red-500/10" : "border-white/10 bg-white/5"}`}
                  />
                  <div>
                    <p className="text-sm text-white/70 mb-2">Выберите иконку</p>
                    <IconPicker value={lessonIcon} onChange={setLessonIcon} />
                  </div>
                  <select
                    value={lessonTopicId || ""}
                    onChange={(e) => setLessonTopicId(e.target.value || undefined)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    <option value="">Без темы</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <textarea
                    value={lessonDesc}
                    onChange={(e) => setLessonDesc(e.target.value)}
                    placeholder="Описание"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/60"
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={addLesson}
                      disabled={!canAddLesson}
                      className={`rounded-lg border px-4 py-2 text-sm transition ${canAddLesson ? "border-white/15 bg-white/10 hover:bg-white/15" : "border-white/10 bg-white/5 text-white/50 cursor-not-allowed"}`}
                    >
                      Добавить урок
                    </button>
                    {lessonError && <span className="text-sm text-red-300">{lessonError}</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-2">Предпросмотр</p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-4">
                    <Image src={`/${lessonIcon}`} alt="icon preview" width={40} height={40} className="h-10 w-10" />
                    <div className="flex-1">
                      <div className="text-white font-medium">{lessonTitle || "Название урока"}</div>
                      <div className="text-white/70 text-sm">{lessonDesc || "Описание урока"}</div>
                      {lessonTopicId && (
                        <div className="text-white/60 text-xs mt-1">Тема: {topicMap[lessonTopicId]}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Список уроков</h3>
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">{lessons.length} шт.</span>
                </div>
                <div className="mt-3 space-y-3">
                  {lessons.length === 0 && (
                    <div className="text-white/70">Пока нет добавленных уроков.</div>
                  )}
                  {lessons.map((l) => (
                    <div key={l.id} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10">
                      <Image src={`/${l.icon}`} alt="icon" width={32} height={32} className="h-8 w-8" />
                      <div className="flex-1">
                        <div className="text-white font-medium">{l.title}</div>
                        <div className="text-white/70 text-sm">{l.description}</div>
                        {l.topicId && (
                          <div className="text-white/60 text-xs mt-1">Тема: {topicMap[l.topicId]}</div>
                        )}
                      </div>
                      <button onClick={() => removeLesson(l.id)} className="text-sm text-white/70 hover:text-red-300">Удалить</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}