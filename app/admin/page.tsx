"use client"
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Component as EtheralShadow } from "../../components/ui/etheral-shadow";
import { useAuth } from "../../lib/hooks/useAuth";

type Topic = {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  order_index: number;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  category_id?: string;
  type: 'sprint' | 'archive';
  order_index: number;
  is_published: boolean;
};

const ICONS = [
  { id: "globe.svg", label: "Globe" },
  { id: "file.svg", label: "File" },
  { id: "window.svg", label: "Window" },
  { id: "next.svg", label: "Next" },
  { id: "vercel.svg", label: "Vercel" },
];

export default function Page() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  
  // All useState hooks must be called before any conditional logic
  const [activeTab, setActiveTab] = useState<"topics" | "lessons">("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicIcon, setTopicIcon] = useState(ICONS[0].id);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonIcon, setLessonIcon] = useState(ICONS[0].id);
  const [lessonCategoryId, setLessonCategoryId] = useState<string | undefined>(undefined);
  const [lessonType, setLessonType] = useState<'sprint' | 'archive'>('sprint');
  const [lessonError, setLessonError] = useState<string | null>(null);

  // All useEffect hooks must be called before any conditional logic
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/?error=access_denied');
    }
  }, [user, authLoading, router]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadTopics();
      loadLessons();
    }
  }, [user]);

  // API функции
  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setTopics(data.categories || []);
      } else {
        console.error('Error loading topics:', data.error);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      if (response.ok) {
        setLessons(data.lessons || []);
      } else {
        console.error('Error loading lessons:', data.error);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  // useMemo must be called before any conditional returns
  const topicMap = useMemo(() => Object.fromEntries(topics.map(t => [t.id, t.name])), [topics]);

  const handleBack = () => router.push("/?actions=1");

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/');
    }
  };

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading || !user || user.role !== 'admin') {
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
            {authLoading ? 'Проверка авторизации...' : 'Перенаправление...'}
          </div>
        </div>
      </div>
    );
  }

  const canAddTopic = topicTitle.trim().length > 0;
  const canAddLesson = lessonTitle.trim().length > 0 && lessonContent.trim().length > 0;

  const addTopic = async () => {
    if (!canAddTopic) {
      setTopicError("Введите название темы");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: topicTitle.trim(),
          description: topicDesc.trim(),
          icon: topicIcon,
          order_index: topics.length
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTopics((prev) => [data.category, ...prev]);
        setTopicTitle("");
        setTopicDesc("");
        setTopicIcon(ICONS[0].id);
        setTopicError(null);
      } else {
        setTopicError(data.error || 'Ошибка при создании темы');
      }
    } catch (error) {
      setTopicError('Ошибка при создании темы');
      console.error('Error creating topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLesson = async () => {
    if (!canAddLesson) {
      setLessonError("Введите название и содержание урока");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          content: lessonContent.trim(),
          icon: lessonIcon,
          category_id: lessonCategoryId,
          type: lessonType,
          order_index: lessons.length,
          is_published: true
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setLessons((prev) => [data.lesson, ...prev]);
        setLessonTitle("");
        setLessonDesc("");
        setLessonContent("");
        setLessonIcon(ICONS[0].id);
        setLessonCategoryId(undefined);
        setLessonType('sprint');
        setLessonError(null);
      } else {
        setLessonError(data.error || 'Ошибка при создании урока');
      }
    } catch (error) {
      setLessonError('Ошибка при создании урока');
      console.error('Error creating lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeTopic = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту тему? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTopics(prev => prev.filter(t => t.id !== id));
        // Обновляем уроки, убирая связь с удаленной категорией
        setLessons(prev => prev.map(l => (l.category_id === id ? { ...l, category_id: undefined } : l)));
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении темы');
      }
    } catch (error) {
      alert('Ошибка при удалении темы');
      console.error('Error deleting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeLesson = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLessons(prev => prev.filter(l => l.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении урока');
      }
    } catch (error) {
      alert('Ошибка при удалении урока');
      console.error('Error deleting lesson:', error);
    } finally {
      setLoading(false);
    }
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
        <EtheralShadow 
          color="rgba(128, 128, 128, 1)"
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with user info and navigation */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
                Назад на главную
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Панель администратора
              </h1>
              <p className="text-white/70 mt-2">
                Управление категориями и уроками
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white font-medium">
                  {user.full_name}
                </div>
                <div className="text-white/50 text-sm">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("topics")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "topics"
                    ? "bg-white text-gray-900"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Темы
              </button>
              <button
                onClick={() => setActiveTab("lessons")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "lessons"
                    ? "bg-white text-gray-900"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Уроки
              </button>
            </div>
          </div>

          {/* Topics Tab */}
          {activeTab === "topics" && (
            <div className="space-y-8">
              {/* Add Topic Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <SectionHeader title="Добавить новую тему" subtitle="Создайте категорию для группировки уроков" />
                
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Название темы *
                    </label>
                    <input
                      type="text"
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      placeholder="Например: Основы продаж"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={topicDesc}
                      onChange={(e) => setTopicDesc(e.target.value)}
                      placeholder="Краткое описание темы..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Иконка
                    </label>
                    <IconPicker value={topicIcon} onChange={setTopicIcon} />
                  </div>

                  {topicError && (
                    <div className="text-red-400 text-sm">{topicError}</div>
                  )}

                  <button
                    onClick={addTopic}
                    disabled={!canAddTopic || loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium rounded-xl hover:from-fuchsia-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Создание...' : 'Создать тему'}
                  </button>
                </div>
              </div>

              {/* Topics List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <SectionHeader 
                  title="Существующие темы" 
                  subtitle={`Всего тем: ${topics.length}`}
                />
                
                {loading && topics.length === 0 ? (
                  <div className="text-center py-8 text-white/70">Загрузка...</div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    Пока нет созданных тем. Создайте первую тему выше.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {topics.map((topic, index) => (
                      <div
                        key={topic.id || `topic-${index}`}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Image 
                              src={`/${topic.icon}`} 
                              alt={topic.name} 
                              width={24} 
                              height={24} 
                              className="h-6 w-6" 
                            />
                            <div>
                              <h3 className="font-medium text-white">{topic.name}</h3>
                              {topic.description && (
                                <p className="text-sm text-white/70 mt-1">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeTopic(topic.id)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 p-1 rounded disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === "lessons" && (
            <div className="space-y-8">
              {/* Add Lesson Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <SectionHeader title="Добавить новый урок" subtitle="Создайте урок для выбранной темы" />
                
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Название урока *
                    </label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Например: Как начать разговор с клиентом"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={lessonDesc}
                      onChange={(e) => setLessonDesc(e.target.value)}
                      placeholder="Краткое описание урока..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Содержание урока *
                    </label>
                    <textarea
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="Полное содержание урока..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Тема
                      </label>
                      <select
                        value={lessonCategoryId || ""}
                        onChange={(e) => setLessonCategoryId(e.target.value || undefined)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent"
                      >
                        <option value="">Без темы</option>
                        {topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Тип урока
                      </label>
                      <select
                        value={lessonType}
                        onChange={(e) => setLessonType(e.target.value as 'sprint' | 'archive')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:border-transparent"
                      >
                        <option value="sprint">Спринт</option>
                        <option value="archive">Архив</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Иконка
                    </label>
                    <IconPicker value={lessonIcon} onChange={setLessonIcon} />
                  </div>

                  {lessonError && (
                    <div className="text-red-400 text-sm">{lessonError}</div>
                  )}

                  <button
                    onClick={addLesson}
                    disabled={!canAddLesson || loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium rounded-xl hover:from-fuchsia-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Создание...' : 'Создать урок'}
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <SectionHeader 
                  title="Существующие уроки" 
                  subtitle={`Всего уроков: ${lessons.length}`}
                />
                
                {loading && lessons.length === 0 ? (
                  <div className="text-center py-8 text-white/70">Загрузка...</div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    Пока нет созданных уроков. Создайте первый урок выше.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id || `lesson-${index}`}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Image 
                              src={`/${lesson.icon}`} 
                              alt={lesson.title} 
                              width={24} 
                              height={24} 
                              className="h-6 w-6 mt-1" 
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-white">{lesson.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  lesson.type === 'sprint' 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {lesson.type === 'sprint' ? 'Спринт' : 'Архив'}
                                </span>
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-white/70 mb-2">{lesson.description}</p>
                              )}
                              {lesson.category_id && topicMap[lesson.category_id] && (
                                <p className="text-xs text-white/50">
                                  Тема: {topicMap[lesson.category_id]}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeLesson(lesson.id)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 p-1 rounded disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}