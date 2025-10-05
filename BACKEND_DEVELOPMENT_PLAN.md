# План разработки бэкенда для Salesfromtinder

## Обзор проекта

**Salesfromtinder** - это веб-приложение для обучения продажам, построенное на Next.js 15.5.2 с использованием React 19.1.0, TypeScript и Tailwind CSS. Проект имеет современную архитектуру с красивым UI и анимациями на базе Framer Motion.

### Текущая архитектура

- **Frontend**: Next.js 15.5.2 (App Router)
- **UI**: React 19.1.0 + TypeScript + Tailwind CSS
- **Анимации**: Framer Motion 12.23.12
- **Стилизация**: Кастомные компоненты с градиентами и анимациями
- **Структура**: Модульная архитектура с переиспользуемыми компонентами

## Анализ существующей структуры

### Основные страницы
- **Главная страница** (`app/page.tsx`) - лендинг с навигацией к урокам
- **Админ панель** (`app/admin/page.tsx`) - управление темами и уроками
- **Уроки** (`app/lessons/`) - страницы обучения (closing, needs, objections, topic)

### Ключевые компоненты
- **EtheralShadow** - фоновый компонент с анимированными эффектами
- **HoverButton** - интерактивная кнопка с анимацией
- **BackgroundCircles** - анимированный фон с градиентами

### Текущее состояние данных
- Локальное хранение в `localStorage`
- Статические данные в компонентах
- Отсутствие серверной части

## План разработки бэкенда

### Этап 1: Настройка базовой инфраструктуры

#### 1.1 Настройка базы данных (Supabase)
```bash
# Установка зависимостей
npm install @supabase/supabase-js @supabase/ssr
npm install prisma @prisma/client
npm install -D prisma
```

**Файлы для создания:**
- `.env.local` - переменные окружения
- `lib/supabase/client.ts` - клиент для браузера
- `lib/supabase/server.ts` - серверный клиент
- `lib/supabase/middleware.ts` - middleware для сессий
- `middleware.ts` - корневой middleware

#### 1.2 Схема базы данных
```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Категории уроков
CREATE TABLE lesson_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Уроки
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES lesson_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  type VARCHAR(50) DEFAULT 'sprint', -- 'sprint' или 'archive'
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Прогресс пользователей
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Настройки приложения
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Этап 2: API Routes и серверные функции

#### 2.1 Структура API
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── lessons/
│   ├── route.ts              # GET /api/lessons
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/lessons/[id]
│   └── categories/route.ts   # GET /api/lessons/categories
├── admin/
│   ├── lessons/route.ts      # POST /api/admin/lessons
│   ├── categories/route.ts   # POST /api/admin/categories
│   └── users/route.ts        # GET /api/admin/users
├── user/
│   ├── progress/route.ts     # GET/POST /api/user/progress
│   └── profile/route.ts      # GET/PUT /api/user/profile
└── settings/route.ts         # GET/PUT /api/settings
```

#### 2.2 Основные API endpoints

**Аутентификация:**
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/logout` - выход из системы

**Уроки:**
- `GET /api/lessons` - получение всех уроков
- `GET /api/lessons/categories` - получение категорий
- `GET /api/lessons/[id]` - получение конкретного урока
- `POST /api/lessons` - создание урока (админ)
- `PUT /api/lessons/[id]` - обновление урока (админ)
- `DELETE /api/lessons/[id]` - удаление урока (админ)

**Прогресс пользователя:**
- `GET /api/user/progress` - получение прогресса
- `POST /api/user/progress` - обновление прогресса
- `GET /api/user/profile` - профиль пользователя

### Этап 3: Интеграция с существующим фронтендом

#### 3.1 Обновление существующих страниц

**Главная страница (`app/page.tsx`):**
```typescript
// Замена статических данных на API вызовы
const [lessons, setLessons] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchLessons();
}, []);

const fetchLessons = async () => {
  try {
    const response = await fetch('/api/lessons/categories');
    const data = await response.json();
    setLessons(data);
  } catch (error) {
    console.error('Error fetching lessons:', error);
  } finally {
    setLoading(false);
  }
};
```

**Админ панель (`app/admin/page.tsx`):**
```typescript
// Интеграция с API для управления контентом
const createLesson = async (lessonData) => {
  const response = await fetch('/api/admin/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lessonData)
  });
  return response.json();
};
```

#### 3.2 Создание новых компонентов

**Компонент аутентификации (`components/auth/AuthForm.tsx`):**
- Форма входа/регистрации
- Интеграция с Supabase Auth
- Обработка ошибок и валидация

**Компонент прогресса (`components/progress/ProgressTracker.tsx`):**
- Отображение прогресса пользователя
- Синхронизация с сервером
- Локальное кэширование

### Этап 4: Система управления контентом

#### 4.1 Расширенная админ панель
- **Управление пользователями** - просмотр, блокировка, роли
- **Аналитика** - статистика прохождения уроков
- **Настройки** - конфигурация приложения
- **Контент-менеджер** - WYSIWYG редактор для уроков

#### 4.2 Система ролей
```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// Middleware для проверки ролей
export function withAuth(handler: NextApiHandler, requiredRole?: UserRole) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return handler(req, res);
  };
}
```

### Этап 5: Оптимизация и производительность

#### 5.1 Кэширование
- **Redis** для кэширования API ответов
- **Next.js ISR** для статических страниц
- **SWR/React Query** для клиентского кэширования

#### 5.2 Оптимизация базы данных
- Индексы для часто запрашиваемых полей
- Пагинация для больших списков
- Оптимизация запросов с JOIN

#### 5.3 Мониторинг и логирование
```typescript
// Система логирования
import { createLogger } from '@/lib/logger';

const logger = createLogger('api');

export async function GET(request: Request) {
  try {
    logger.info('Fetching lessons', { userId: user.id });
    // ... логика
  } catch (error) {
    logger.error('Error fetching lessons', { error, userId: user.id });
    throw error;
  }
}
```

### Этап 6: Безопасность и валидация

#### 6.1 Валидация данных
```typescript
import { z } from 'zod';

const CreateLessonSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  content: z.object({}).passthrough(),
  type: z.enum(['sprint', 'archive'])
});

export async function POST(request: Request) {
  const body = await request.json();
  const validatedData = CreateLessonSchema.parse(body);
  // ... создание урока
}
```

#### 6.2 Безопасность
- **CSRF защита** через Next.js middleware
- **Rate limiting** для API endpoints
- **Input sanitization** для пользовательского контента
- **Row Level Security** в Supabase

### Этап 7: Тестирование и развертывание

#### 7.1 Тестирование
```typescript
// Пример unit теста для API
import { GET } from '@/app/api/lessons/route';
import { createMocks } from 'node-mocks-http';

describe('/api/lessons', () => {
  it('should return lessons list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await GET(req);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

#### 7.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
```

## Временные рамки

### Неделя 1-2: Базовая инфраструктура
- Настройка Supabase
- Создание схемы БД
- Базовые API routes

### Неделя 3-4: Интеграция с фронтендом
- Обновление существующих страниц
- Система аутентификации
- Базовый CRUD для уроков

### Неделя 5-6: Расширенный функционал
- Система прогресса
- Расширенная админ панель
- Система ролей

### Неделя 7-8: Оптимизация и тестирование
- Кэширование и производительность
- Тестирование
- Развертывание

## Заключение

Данный план обеспечивает поэтапную миграцию от клиентского приложения к полноценному full-stack решению с сохранением существующего дизайна и пользовательского опыта. Использование Supabase позволит быстро развернуть backend с минимальными затратами на инфраструктуру, а модульная архитектура обеспечит масштабируемость проекта.

### Ключевые преимущества:
- **Быстрый старт** благодаря Supabase
- **Сохранение существующего UI/UX**
- **Масштабируемая архитектура**
- **Современный tech stack**
- **Безопасность из коробки**