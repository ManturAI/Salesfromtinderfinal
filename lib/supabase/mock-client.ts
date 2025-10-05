// Mock Supabase client for development/testing without real Supabase setup

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  preferences?: Record<string, any>;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  published_lesson_count: number;
  total_lesson_count: number;
}

export interface MockLesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  type: 'sprint' | 'archive';
  category_id: string;
  published: boolean;
  order_index: number;
  lesson_categories?: MockCategory;
}

export interface MockProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  is_favorite?: boolean;
  is_completed?: boolean;
  completion_percentage?: number;
  time_spent?: number;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
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
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Возражения',
    slug: 'objections',
    description: 'Работа с возражениями',
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Постмитинг',
    slug: 'postmeet',
    description: 'Работа после встречи',
    order_index: 3,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Закрытие',
    slug: 'closing',
    description: 'Закрытие сделки',
    order_index: 4,
    is_published: true,
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

const mockProgress = [
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

// Mock query builder
class MockQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private table: string;
  private selectFields: string = '*';
  private filters: any[] = [];
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

  eq(column: string, value: any) {
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

  insert(data: any) {
    // Simulate inserting data into the mock database
    if (this.table === 'user_progress') {
      const newRecord = {
        id: String(mockProgress.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
      mockProgress.push(newRecord);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: newRecord, error: null })
        })
      };
    }
    
    if (this.table === 'lessons') {
      const newLesson = {
        id: String(mockLessons.length + 1),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') || 'lesson-' + (mockLessons.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_published: true,
        type: 'sprint',
        order_index: mockLessons.filter(l => l.category_id === data.category_id).length + 1,
        ...data
      };
      
      // Find the category to add lesson_categories info
      const category = mockCategories.find(c => c.id === data.category_id);
      if (category) {
        newLesson.lesson_categories = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.slug
        };
      }
      
      mockLessons.push(newLesson);
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

  update(data: any) {
    return {
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => {
            // Simulate updating data in the mock database
            if (this.table === 'user_progress') {
              const recordIndex = mockProgress.findIndex(record => (record as any)[column] === value);
              if (recordIndex !== -1) {
                mockProgress[recordIndex] = {
                  ...mockProgress[recordIndex],
                  ...data,
                  updated_at: new Date().toISOString()
                };
                return Promise.resolve({ data: mockProgress[recordIndex], error: null });
              }
            }
            return Promise.resolve({ data, error: null });
          }
        }),
        eq: (column2: string, value2: any) => ({
          select: () => ({
            single: () => {
              // Handle multiple eq conditions (user_id and lesson_id)
              if (this.table === 'user_progress') {
                const recordIndex = mockProgress.findIndex(record => 
                  (record as any)[column] === value && (record as any)[column2] === value2
                );
                if (recordIndex !== -1) {
                  mockProgress[recordIndex] = {
                    ...mockProgress[recordIndex],
                    ...data,
                    updated_at: new Date().toISOString()
                  };
                  return Promise.resolve({ data: mockProgress[recordIndex], error: null });
                }
              }
              return Promise.resolve({ data, error: null });
            }
          })
        })
      })
    };
  }

  delete() {
    return {
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    };
  }

  async execute() {
    let data: any[] = [];
    
    // Get data based on table
    switch (this.table) {
      case 'lesson_categories':
      case 'categories':
        data = [...mockCategories];
        // Handle JOIN with lessons table if select includes lessons
        if (this.selectFields.includes('lessons')) {
          data = data.map(category => {
            const categoryLessons = mockLessons.filter(l => l.category_id === category.id);
            return {
              ...category,
              lessons: categoryLessons
            };
          });
        }
        break;
      case 'lessons':
        data = [...mockLessons];
        break;
      case 'user_progress':
      case 'progress':
        data = [...mockProgress];
        // Handle JOIN with lessons table if select includes lessons
        if (this.selectFields.includes('lessons')) {
          data = data.map(progress => {
            const lesson = mockLessons.find(l => l.id === progress.lesson_id);
            return {
              ...progress,
              lessons: lesson || null
            };
          });
        }
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
            return item[parentKey] && item[parentKey][childKey] === filter.value;
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
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
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
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onFulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
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
      signUp: async ({ email, password, options }: any) => {
        const newUser = {
          id: String(mockAuthUsers.length + 1),
          email,
          user_metadata: options?.data || {},
          created_at: new Date().toISOString(),
        };
        mockAuthUsers.push(newUser);
        return { data: { user: newUser }, error: null };
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        // Mock auth state change
        setTimeout(() => callback('SIGNED_IN', { user: mockAuthUsers[0] }), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from: (table: string) => new MockQueryBuilder(table),
  };
}