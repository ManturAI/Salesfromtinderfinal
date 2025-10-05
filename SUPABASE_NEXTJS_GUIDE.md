# Полный гайд по интеграции Supabase с Next.js

## Содержание
1. [Введение](#введение)
2. [Создание проекта Supabase](#создание-проекта-supabase)
3. [Настройка Next.js проекта](#настройка-nextjs-проекта)
4. [Установка зависимостей](#установка-зависимостей)
5. [Настройка переменных окружения](#настройка-переменных-окружения)
6. [Создание клиентов Supabase](#создание-клиентов-supabase)
7. [Настройка аутентификации](#настройка-аутентификации)
8. [Интеграция с Prisma ORM](#интеграция-с-prisma-orm)
9. [Создание и настройка базы данных](#создание-и-настройка-базы-данных)
10. [Миграции базы данных](#миграции-базы-данных)
11. [Примеры использования](#примеры-использования)
12. [Решение проблем](#решение-проблем)

## Введение

Supabase — это open-source альтернатива Firebase, которая предоставляет PostgreSQL базу данных, аутентификацию, real-time подписки и хранилище файлов. Next.js — популярный React фреймворк для создания server-rendered приложений.

## Создание проекта Supabase

### Шаг 1: Создание нового проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой аккаунт или зарегистрируйтесь
3. Нажмите "New Project"
4. Выберите организацию
5. Введите название проекта
6. Создайте надежный пароль для базы данных
7. Выберите регион (желательно ближайший к вашим пользователям)
8. Нажмите "Create new project"

### Шаг 2: Получение API ключей

После создания проекта:

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (URL проекта)
   - **anon/public key** (публичный ключ)
   - **service_role key** (сервисный ключ)

### Шаг 3: Получение строки подключения к базе данных

1. Перейдите в **Settings** → **Database**
2. Найдите раздел **Connection string**
3. Выберите **URI** (не Prisma)
4. Скопируйте строку подключения
5. Замените `[YOUR-PASSWORD]` на пароль, который вы создали при создании проекта

## Настройка Next.js проекта

Если у вас еще нет Next.js проекта:

```bash
npx create-next-app@latest my-supabase-app
cd my-supabase-app
```

## Установка зависимостей

### Основные зависимости для Supabase

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Дополнительные зависимости для Prisma (опционально)

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Инициализация Prisma

```bash
npx prisma init
```

## Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (для Prisma)
DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"

# Для production (опционально)
DIRECT_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"
```

**Важно:** Никогда не коммитьте файлы с секретными ключами в репозиторий!

## Создание клиентов Supabase

### Для клиентских компонентов

Создайте файл `utils/supabase/client.js`:

```javascript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### Для серверных компонентов

Создайте файл `utils/supabase/server.js`:

```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Метод setAll был вызван из Server Component
            // Это можно игнорировать, если у вас есть middleware
          }
        },
      },
    }
  )
}
```

### Middleware для обновления сессий

Создайте файл `utils/supabase/middleware.js`:

```javascript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Обновление пользовательской сессии
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
```

Создайте файл `middleware.js` в корне проекта:

```javascript
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Настройка аутентификации

### Компонент для входа/регистрации

Создайте файл `components/AuthForm.jsx`:

```jsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Проверьте вашу почту для подтверждения регистрации!')
    }
    setLoading(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Успешный вход!')
      window.location.reload()
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Регистрация
          </button>
          
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Вход
          </button>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Выход
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          {message}
        </div>
      )}
    </div>
  )
}
```

### Хук для получения пользователя

Создайте файл `hooks/useUser.js`:

```javascript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}
```

## Интеграция с Prisma ORM

### Настройка схемы Prisma

Отредактируйте файл `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

### Создание клиента Prisma

Создайте файл `lib/prisma.js`:

```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Комбинированный клиент

Создайте файл `lib/db.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

// Supabase клиент
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Prisma клиент
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Создание и настройка базы данных

### Создание таблиц через SQL Editor

В Supabase Dashboard перейдите в **SQL Editor** и выполните:

```sql
-- Создание таблицы пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы постов
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all posts" ON posts
  FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);
```

## Миграции базы данных

### Создание миграций с Prisma

```bash
# Создание первой миграции
npx prisma migrate dev --name init

# Генерация клиента Prisma
npx prisma generate

# Просмотр базы данных
npx prisma studio
```

### Синхронизация существующей базы данных

Если у вас уже есть таблицы в Supabase:

```bash
# Получение схемы из базы данных
npx prisma db pull

# Создание миграции на основе существующей схемы
npx prisma migrate dev --name init_from_db
```

## Примеры использования

### API Route для работы с постами

Создайте файл `app/api/posts/route.js`:

```javascript
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Использование Prisma
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении постов' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании поста' },
      { status: 500 }
    )
  }
}
```

### Компонент для отображения постов

Создайте файл `components/PostsList.jsx`:

```jsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { user } = useUser()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        setTitle('')
        setContent('')
        fetchPosts()
      }
    } catch (error) {
      console.error('Ошибка при создании поста:', error)
    }
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {user && (
        <form onSubmit={createPost} className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Создать новый пост</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Заголовок"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Содержание"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-32"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Создать пост
          </button>
        </form>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.content}</p>
            <div className="text-sm text-gray-500">
              Автор: {post.author.email} | 
              Создано: {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### Главная страница

Обновите файл `app/page.js`:

```jsx
import AuthForm from '@/components/AuthForm'
import PostsList from '@/components/PostsList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Supabase + Next.js App
        </h1>
        
        <AuthForm />
        <PostsList />
      </div>
    </main>
  )
}
```

## Решение проблем

### Проблема с подключением к базе данных

1. **Проверьте переменные окружения:**
   - Убедитесь, что все переменные правильно скопированы
   - Проверьте, что нет лишних пробелов

2. **Проблемы с паролем:**
   - Если в пароле есть специальные символы, экранируйте их:
     - `@` → `%40`
     - `?` → `%3F`
     - `$` → `%24`

3. **Проект приостановлен:**
   - Проверьте статус проекта в Supabase Dashboard
   - Если проект приостановлен, восстановите его

### Проблемы с аутентификацией

1. **Отключите подтверждение email для тестирования:**
   - Перейдите в **Authentication** → **Settings**
   - Отключите "Enable email confirmations"

2. **Настройте URL для редиректа:**
   - В **Authentication** → **URL Configuration**
   - Добавьте `http://localhost:3000` в Site URL

### Проблемы с Prisma

1. **Ошибки миграции:**
   ```bash
   # Сброс базы данных (ОСТОРОЖНО!)
   npx prisma migrate reset
   
   # Принудительная синхронизация
   npx prisma db push
   ```

2. **Проблемы с типами:**
   ```bash
   # Регенерация клиента
   npx prisma generate
   ```

### Проблемы с CORS

Если возникают проблемы с CORS, добавьте в `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Полезные команды

```bash
# Запуск проекта
npm run dev

# Работа с Prisma
npx prisma studio          # Открыть GUI для базы данных
npx prisma migrate dev      # Создать и применить миграцию
npx prisma generate         # Генерация клиента
npx prisma db push          # Принудительная синхронизация схемы
npx prisma db pull          # Получение схемы из базы данных

# Проверка типов
npm run type-check

# Сборка проекта
npm run build
```

## Заключение

Этот гайд покрывает основные аспекты интеграции Supabase с Next.js. Supabase предоставляет мощные возможности для создания современных веб-приложений с минимальными настройками backend'а.

### Дополнительные возможности для изучения:

- **Real-time подписки** для live обновлений
- **Storage** для загрузки файлов
- **Edge Functions** для serverless функций
- **Row Level Security** для продвинутой безопасности
- **Database Functions** для сложной бизнес-логики

Удачи в разработке! 🚀