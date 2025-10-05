-- Sample data for Supabase database
-- Based on mock client data

-- Insert lesson categories
INSERT INTO public.lesson_categories (id, name, slug, description, order_index, is_published) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Потребности', 'needs', 'Выявление потребностей клиента', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Возражения', 'objections', 'Работа с возражениями', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Постмитинг', 'postmeet', 'Работа после встречи', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Закрытие', 'closing', 'Закрытие сделки', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published;

-- Insert lessons
INSERT INTO public.lessons (id, title, slug, content, category_id, order_index, is_published, type) VALUES
(
  '550e8400-e29b-41d4-a716-446655440011',
  'Основы выявления потребностей',
  'basics-needs',
  'Содержание урока о выявлении потребностей...',
  '550e8400-e29b-41d4-a716-446655440001',
  1,
  true,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  'Работа с ценовыми возражениями',
  'price-objections',
  'Содержание урока о работе с ценовыми возражениями...',
  '550e8400-e29b-41d4-a716-446655440002',
  1,
  true,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  'Эмоциональные потребности клиента',
  'emotional-needs',
  'В этом уроке мы изучим, как выявлять и работать с эмоциональными потребностями клиента. Эмоциональные потребности часто являются ключевым фактором в принятии решения о покупке. Мы рассмотрим техники активного слушания, вопросы для выявления эмоций, и способы адаптации презентации под эмоциональные потребности клиента.',
  '550e8400-e29b-41d4-a716-446655440001',
  2,
  true,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440014',
  'Анализ бюджета клиента',
  'budget-analysis',
  'Этот урок посвящен навыкам анализа бюджета клиента и работе с финансовыми ограничениями. Вы научитесь деликатно выяснять бюджетные рамки, предлагать решения в рамках бюджета клиента, и работать с ситуациями, когда бюджет не соответствует потребностям. Также рассмотрим техники обоснования ценности продукта.',
  '550e8400-e29b-41d4-a716-446655440001',
  3,
  true,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440015',
  'Техники работы с сомнениями',
  'doubt-techniques',
  'Урок о работе с сомнениями клиентов и преодолении неуверенности в принятии решений.',
  '550e8400-e29b-41d4-a716-446655440002',
  2,
  false,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440016',
  'Следующие шаги после встречи',
  'next-steps',
  'Планирование и выполнение действий после встречи с клиентом.',
  '550e8400-e29b-41d4-a716-446655440003',
  1,
  false,
  'sprint'
),
(
  '550e8400-e29b-41d4-a716-446655440017',
  'Финальная презентация',
  'final-presentation',
  'Техники проведения финальной презентации и закрытия сделки.',
  '550e8400-e29b-41d4-a716-446655440004',
  1,
  false,
  'sprint'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  category_id = EXCLUDED.category_id,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published,
  type = EXCLUDED.type;

-- Note: Users will be automatically created when they sign up through Supabase Auth
-- The trigger function handle_new_user() will insert them into the public.users table

-- Sample user progress (will be created when users interact with lessons)
-- This is just an example of how progress data would look
-- INSERT INTO public.user_progress (user_id, lesson_id, status, is_favorite, is_completed, completion_percentage, time_spent, started_at, completed_at) VALUES
-- ('user-uuid-here', '550e8400-e29b-41d4-a716-446655440011', 'completed', false, true, 100, 1800, NOW() - INTERVAL '1 day', NOW());

-- Create a sample admin user (you'll need to replace with actual user ID after signup)
-- INSERT INTO public.users (id, email, full_name, role) VALUES
-- ('admin-user-uuid', 'admin@example.com', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';