-- Начальные данные для приложения Salesfromtinder

-- Вставка категорий уроков
INSERT INTO lesson_categories (name, slug, description, icon, order_index) VALUES
('Выявление потребностей', 'needs', 'Научитесь правильно выявлять потребности клиентов', 'needs', 1),
('Отработка возражений', 'objections', 'Эффективные техники работы с возражениями', 'objections', 2),
('Закрытие сделки', 'closing', 'Методы успешного закрытия продаж', 'closing', 3),
('Общие навыки', 'general', 'Базовые навыки продаж', 'general', 4)
ON CONFLICT (slug) DO NOTHING;

-- Получение ID категорий для вставки уроков
DO $$
DECLARE
    needs_id UUID;
    objections_id UUID;
    closing_id UUID;
    general_id UUID;
BEGIN
    SELECT id INTO needs_id FROM lesson_categories WHERE slug = 'needs';
    SELECT id INTO objections_id FROM lesson_categories WHERE slug = 'objections';
    SELECT id INTO closing_id FROM lesson_categories WHERE slug = 'closing';
    SELECT id INTO general_id FROM lesson_categories WHERE slug = 'general';

    -- Уроки для категории "Выявление потребностей"
    INSERT INTO lessons (category_id, title, description, content, type, icon, order_index, is_published) VALUES
    (needs_id, 'Техника СПИН-продаж', 'Изучите классическую методику СПИН для выявления потребностей', 
     '{"sections": [{"title": "Ситуационные вопросы", "content": "Вопросы о текущей ситуации клиента"}, {"title": "Проблемные вопросы", "content": "Выявление проблем и болей"}, {"title": "Извлекающие вопросы", "content": "Усиление важности проблемы"}, {"title": "Направляющие вопросы", "content": "Подведение к решению"}]}', 
     'sprint', 'demo', 1, true),
    
    (needs_id, 'Активное слушание', 'Развитие навыков активного слушания клиента', 
     '{"sections": [{"title": "Техники слушания", "content": "Основные приемы активного слушания"}, {"title": "Невербальные сигналы", "content": "Чтение языка тела клиента"}, {"title": "Уточняющие вопросы", "content": "Как правильно задавать уточняющие вопросы"}]}', 
     'sprint', 'case', 2, true),

    (needs_id, 'Карта потребностей', 'Создание карты потребностей клиента', 
     '{"sections": [{"title": "Явные потребности", "content": "Потребности, которые клиент озвучивает прямо"}, {"title": "Скрытые потребности", "content": "Потребности, которые нужно выявить"}, {"title": "Приоритизация", "content": "Определение наиболее важных потребностей"}]}', 
     'archive', 'tools', 1, true);

    -- Уроки для категории "Отработка возражений"
    INSERT INTO lessons (category_id, title, description, content, type, icon, order_index, is_published) VALUES
    (objections_id, 'Техника "Да, и..."', 'Классическая техника работы с возражениями', 
     '{"sections": [{"title": "Принятие возражения", "content": "Как правильно принять возражение клиента"}, {"title": "Переформулирование", "content": "Техники переформулирования возражений"}, {"title": "Аргументация", "content": "Представление контраргументов"}]}', 
     'sprint', 'demo', 1, true),
    
    (objections_id, 'Ценовые возражения', 'Специальные техники работы с ценовыми возражениями', 
     '{"sections": [{"title": "Анализ стоимости", "content": "Разбор стоимости на составляющие"}, {"title": "Демонстрация ценности", "content": "Показ ценности продукта"}, {"title": "Альтернативные предложения", "content": "Предложение альтернативных вариантов"}]}', 
     'sprint', 'case', 2, true),

    (objections_id, 'База возражений', 'Готовые ответы на типичные возражения', 
     '{"sections": [{"title": "Топ-10 возражений", "content": "Самые частые возражения и ответы на них"}, {"title": "Отраслевые возражения", "content": "Специфические возражения по отраслям"}, {"title": "Персонализация ответов", "content": "Адаптация ответов под конкретного клиента"}]}', 
     'archive', 'archive', 1, true);

    -- Уроки для категории "Закрытие сделки"
    INSERT INTO lessons (category_id, title, description, content, type, icon, order_index, is_published) VALUES
    (closing_id, 'Техника альтернативного выбора', 'Предложение клиенту выбора между вариантами', 
     '{"sections": [{"title": "Подготовка альтернатив", "content": "Как подготовить варианты для выбора"}, {"title": "Презентация выбора", "content": "Правильная подача альтернатив"}, {"title": "Работа с решением", "content": "Помощь клиенту в принятии решения"}]}', 
     'sprint', 'demo', 1, true),
    
    (closing_id, 'Создание срочности', 'Техники создания ощущения срочности у клиента', 
     '{"sections": [{"title": "Ограниченное предложение", "content": "Использование ограниченности во времени"}, {"title": "Эксклюзивность", "content": "Создание ощущения эксклюзивности"}, {"title": "Последствия бездействия", "content": "Демонстрация упущенных возможностей"}]}', 
     'sprint', 'case', 2, true),

    (closing_id, 'Работа с документами', 'Правильное оформление сделки', 
     '{"sections": [{"title": "Подготовка документов", "content": "Какие документы нужны для сделки"}, {"title": "Процесс подписания", "content": "Как провести процесс подписания"}, {"title": "Послепродажное сопровождение", "content": "Что делать после заключения сделки"}]}', 
     'archive', 'tools', 1, true);

    -- Уроки для категории "Общие навыки"
    INSERT INTO lessons (category_id, title, description, content, type, icon, order_index, is_published) VALUES
    (general_id, 'Построение доверия', 'Основы построения доверительных отношений с клиентом', 
     '{"sections": [{"title": "Первое впечатление", "content": "Как произвести правильное первое впечатление"}, {"title": "Эмпатия", "content": "Развитие эмпатии в продажах"}, {"title": "Честность и открытость", "content": "Важность честности в отношениях с клиентом"}]}', 
     'sprint', 'demo', 1, true),
    
    (general_id, 'Презентационные навыки', 'Эффективная презентация продукта или услуги', 
     '{"sections": [{"title": "Структура презентации", "content": "Как построить эффективную презентацию"}, {"title": "Визуальные материалы", "content": "Использование визуальных материалов"}, {"title": "Интерактивность", "content": "Вовлечение клиента в презентацию"}]}', 
     'sprint', 'case', 2, true);

END $$;

-- Настройки приложения
INSERT INTO app_settings (key, value, description) VALUES
('app_name', '"Продажник из тиндера"', 'Название приложения'),
('welcome_message', '"Добро пожаловать в обучающую платформу по продажам!"', 'Приветственное сообщение'),
('max_lessons_per_day', '5', 'Максимальное количество уроков в день'),
('enable_progress_tracking', 'true', 'Включить отслеживание прогресса')
ON CONFLICT (key) DO NOTHING;