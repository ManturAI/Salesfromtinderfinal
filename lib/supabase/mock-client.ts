// Mock Supabase client for development/testing without real Supabase setup

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  preferences?: Record<string, unknown>;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  published_lesson_count: number;
  total_lesson_count: number;
  icon?: string;
  is_published?: boolean;
  created_at?: string;
}

export interface MockLesson {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  type: 'sprint' | 'archive';
  category_id: string;
  published?: boolean;
  order_index: number;
  lesson_categories?: Partial<MockCategory>;
  created_at: string;
  updated_at?: string;
  is_published: boolean;
}

export interface MockProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  is_favorite: boolean;
  is_completed: boolean;
  completion_percentage: number;
  time_spent: number;
  started_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  lessons?: MockLesson;
}

// Mock data
const mockAuthUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    user_metadata: { full_name: 'Admin User', role: 'admin' },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    user_metadata: { full_name: 'Regular User', role: 'user' },
    created_at: new Date().toISOString(),
  },
];

const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    avatar_url: null,
    preferences: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'user',
    avatar_url: null,
    preferences: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCategories = [
  {
    id: '1',
    name: 'Потребности',
    slug: 'needs',
    description: 'Выявление потребностей клиента',
    order_index: 1,
    is_published: true,
    published_lesson_count: 2,
    total_lesson_count: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Возражения',
    slug: 'objections',
    description: 'Работа с возражениями',
    order_index: 2,
    is_published: true,
    published_lesson_count: 1,
    total_lesson_count: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Постмитинг',
    slug: 'postmeet',
    description: 'Работа после встречи',
    order_index: 3,
    is_published: true,
    published_lesson_count: 0,
    total_lesson_count: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Закрытие',
    slug: 'closing',
    description: 'Закрытие сделки',
    order_index: 4,
    is_published: true,
    published_lesson_count: 0,
    total_lesson_count: 1,
    created_at: new Date().toISOString(),
  },
];

const mockLessons = [
  {
    id: '1',
    title: 'Основы выявления потребностей',
    slug: 'basics-needs',
    content: 'Содержание урока о выявлении потребностей...',
    category_id: '1',
    order_index: 1,
    is_published: true,
    type: 'sprint',
    created_at: new Date().toISOString(),
    lesson_categories: {
      id: '1',
      name: 'Потребности',
      slug: 'needs',
      icon: 'needs'
    }
  },
  {
    id: '2',
    title: 'Работа с ценовыми возражениями',
    slug: 'price-objections',
    content: 'Содержание урока о работе с ценовыми возражениями...',
    category_id: '2',
    order_index: 1,
    is_published: true,
    type: 'sprint',
    created_at: new Date().toISOString(),
    lesson_categories: {
      id: '2',
      name: 'Возражения',
      slug: 'objections',
      icon: 'objections'
    }
  },
  {
    id: '3',
    title: 'Эмоциональные потребности клиента',
    slug: 'emotional-needs',
    content: 'В этом уроке мы изучим, как выявлять и работать с эмоциональными потребностями клиента. Эмоциональные потребности часто являются ключевым фактором в принятии решения о покупке. Мы рассмотрим техники активного слушания, вопросы для выявления эмоций, и способы адаптации презентации под эмоциональные потребности клиента.',
    category_id: '1',
    order_index: 2,
    is_published: true,
    type: 'sprint',
    created_at: new Date().toISOString(),
    lesson_categories: {
      id: '1',
      name: 'Потребности',
      slug: 'needs',
      icon: 'needs'
    }
  },
  {
    id: '4',
    title: 'Анализ бюджета клиента',
    slug: 'budget-analysis',
    content: 'Этот урок посвящен навыкам анализа бюджета клиента и работе с финансовыми ограничениями. Вы научитесь деликатно выяснять бюджетные рамки, предлагать решения в рамках бюджета клиента, и работать с ситуациями, когда бюджет не соответствует потребностям. Также рассмотрим техники обоснования ценности продукта.',
    category_id: '1',
    order_index: 3,
    is_published: true,
    type: 'sprint',
    created_at: new Date().toISOString(),
    lesson_categories: {
      id: '1',
      name: 'Потребности',
      slug: 'needs',
      icon: 'needs'
    }
  },
];

const mockProgress: MockProgress[] = [
  {
    id: '1',
    user_id: '1',
    lesson_id: '1',
    status: 'completed',
    is_favorite: false,
    is_completed: true,
    completion_percentage: 100,
    time_spent: 1800,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Add proper type definitions
interface QueryFilter {
  column: string;
  operator: string;
  value: unknown;
}

interface QueryResult<T = unknown> {
  data: T | null;
  error: Error | null;
}

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: string;
  };
  created_at: string;
}

interface SignUpOptions {
  data?: Record<string, unknown>;
}

interface SignUpParams {
  email: string;
  password: string;
  options?: SignUpOptions;
}

interface AuthStateChangeCallback {
  (event: string, session: { user: AuthUser } | null): void;
}

// Mock query builder
class MockQueryBuilder implements PromiseLike<QueryResult> {
  private table: string;
  private selectFields: string = '*';
  private filters: QueryFilter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;
  private singleResult: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  insert(data: Record<string, unknown>) {
    if (this.table === 'user_progress') {
      const newProgress: MockProgress = {
        id: String(mockProgress.length + 1),
        user_id: data.user_id as string,
        lesson_id: data.lesson_id as string,
        status: (data.status as MockProgress['status']) || 'not_started',
        is_favorite: Boolean(data.is_favorite),
        is_completed: Boolean(data.is_completed),
        completion_percentage: Number(data.completion_percentage) || 0,
        time_spent: Number(data.time_spent) || 0,
        started_at: (data.started_at as string) || new Date().toISOString(),
        completed_at: (data.completed_at as string) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      (mockProgress as MockProgress[]).push(newProgress);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: newProgress, error: null })
        })
      };
    }
    
    if (this.table === 'lessons') {
      const newLesson: MockLesson = {
        id: String(mockLessons.length + 1),
        title: data.title as string,
        slug: data.slug as string,
        content: data.content as string,
        category_id: data.category_id as string,
        description: data.description as string,
        created_at: new Date().toISOString(),
        is_published: true,
        type: 'sprint',
        order_index: mockLessons.length + 1,
        lesson_categories: undefined,
      };
      
      const category = mockCategories.find(c => c.id === data.category_id);
      if (category) {
        newLesson.lesson_categories = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.slug
        };
      }
      
      (mockLessons as MockLesson[]).push(newLesson);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: newLesson, error: null })
        })
      };
    }
    
    return {
      select: () => ({
        single: () => Promise.resolve({ data, error: null })
      })
    };
  }

  update(data: Record<string, unknown>) {
    const chainObject = {
      eq: (_column: string, _value: unknown) => ({
        select: () => ({
          single: () => {
            // Simulate updating data in the mock database
            if (this.table === 'user_progress') {
              const recordIndex = mockProgress.findIndex(record => (record as unknown as Record<string, unknown>)[_column] === _value);
              if (recordIndex !== -1) {
                const existingRecord = mockProgress[recordIndex];
                (mockProgress as MockProgress[])[recordIndex] = {
                  ...existingRecord,
                  ...data,
                  updated_at: new Date().toISOString()
                } as MockProgress;
              }
            }
            return Promise.resolve({ data, error: null });
          },
          eq: (_column2: string, _value2: unknown) => ({
            single: () => Promise.resolve({ data, error: null })
          })
        }),
        eq: (_column2: string, _value2: unknown) => ({
          select: () => ({
            single: () => Promise.resolve({ data, error: null })
          })
        })
      }),
      select: () => ({
        single: () => Promise.resolve({ data, error: null }),
        eq: (_column: string, _value: unknown) => ({
          single: () => Promise.resolve({ data, error: null })
        })
      })
    };
    return chainObject;
  }

  delete() {
    return {
      eq: (column: string, value: unknown) => {
        // Simulate deleting data from the mock database
        if (this.table === 'user_progress') {
          const recordIndex = mockProgress.findIndex(record => (record as unknown as Record<string, unknown>)[column] === value);
          if (recordIndex !== -1) {
            mockProgress.splice(recordIndex, 1);
          }
        }
        return Promise.resolve({ data: null, error: null });
      }
    };
  }

  async execute(): Promise<QueryResult> {
    let data: Record<string, unknown>[] = [];
    
    // Get data based on table
    switch (this.table) {
      case 'user_progress':
        data = [...mockProgress].map(progress => {
          const lesson = mockLessons.find(l => l.id === progress.lesson_id);
          return {
            ...progress,
            lessons: lesson || null
          };
        });
        break;
      case 'lessons':
        data = [...mockLessons];
        break;
      case 'categories':
        data = [...mockCategories];
        break;
      case 'users':
        data = [...mockUsers];
        break;
      default:
        data = [];
    }

    // Apply filters
    this.filters.forEach(filter => {
      data = data.filter(item => {
        if (filter.operator === 'eq') {
          // Handle nested properties like 'lesson_categories.slug'
          if (filter.column.includes('.')) {
            const [parentKey, childKey] = filter.column.split('.');
            const parentValue = item[parentKey] as Record<string, unknown>;
            return parentValue && parentValue[childKey] === filter.value;
          }
          return item[filter.column] === filter.value;
        }
        return true;
      });
    });

    // Apply ordering
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = a[this.orderBy!.column];
        const bVal = b[this.orderBy!.column];
        
        // Handle unknown types safely
        const aStr = String(aVal);
        const bStr = String(bVal);
        
        const comparison = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        return this.orderBy!.ascending ? comparison : -comparison;
      });
    }

    // Apply limit
    if (this.limitValue) {
      data = data.slice(0, this.limitValue);
    }

    // Return single result or array
    if (this.singleResult) {
      return { data: data[0] || null, error: null };
    }

    return { data, error: null };
  }

  // Make the query builder thenable so it can be awaited
  then<TResult1 = QueryResult, TResult2 = never>(
    onFulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onFulfilled, onRejected);
  }
}

export function createMockClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: mockAuthUsers[0] },
        error: null,
      }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = mockAuthUsers.find(u => u.email === email);
        if (user && password === 'password') {
          return { data: { user }, error: null };
        }
        return { data: { user: null }, error: { message: 'Invalid credentials' } };
      },
      signUp: async ({ email, options }: Omit<SignUpParams, 'password'>) => {
        const newUser = {
          id: String(mockAuthUsers.length + 1),
          email,
          user_metadata: {
            full_name: (options?.data?.full_name as string) || 'New User',
            role: 'user'
          },
          created_at: new Date().toISOString(),
        };
        mockAuthUsers.push(newUser);
        return { data: { user: newUser }, error: null };
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: AuthStateChangeCallback) => {
        // Mock auth state change
        setTimeout(() => callback('SIGNED_IN', { user: mockAuthUsers[0] }), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from: (table: string) => new MockQueryBuilder(table),
  };
}