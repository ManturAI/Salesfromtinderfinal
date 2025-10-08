require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Проверка наличия необходимых переменных окружения
if (!process.env.BOT_TOKEN) {
  console.error('❌ Ошибка: Не указан токен бота в .env файле');
  console.log('💡 Создайте файл .env на основе .env.example и добавьте BOT_TOKEN');
  process.exit(1);
}

if (!process.env.WEBAPP_URL) {
  console.error('❌ Ошибка: Не указан URL веб-приложения в .env файле');
  console.log('💡 Добавьте WEBAPP_URL в файл .env (например: http://localhost:3000)');
  process.exit(1);
}

// Создание экземпляра бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Обработка ошибок polling
bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error.message);
});

// Обработка ошибок webhook
bot.on('webhook_error', (error) => {
  console.error('❌ Ошибка webhook:', error.message);
});

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'пользователь';
  const username = msg.from.username ? `@${msg.from.username}` : '';
  
  console.log(`🚀 Пользователь ${firstName} ${username} (ID: ${msg.from.id}) запустил бота`);
  
  // Создаем клавиатуру с кнопкой для открытия веб-приложения
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{
          text: '🌐 Открыть обучающую платформу',
          web_app: { url: process.env.WEBAPP_URL }
        }],
        [
          { text: '📚 О платформе' },
          { text: '❓ Помощь' }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  const welcomeMessage = `Добро пожаловать, ${firstName}! 🎉

🎯 **Sales Training Platform** - ваш персональный помощник в изучении техник продаж!

📖 **Что вас ждет:**
• Интерактивные уроки по продажам
• Практические кейсы и примеры
• Отслеживание прогресса обучения
• Избранные материалы

👆 Нажмите кнопку ниже, чтобы начать обучение!`;
  
  bot.sendMessage(chatId, welcomeMessage, keyboard);
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🤖 **Справка по боту Sales Training**

📋 **Доступные команды:**
/start - Запустить бота и показать главное меню
/help - Показать эту справку
/info - Информация о платформе
/stats - Статистика использования (скоро)

🔧 **Как пользоваться:**
1️⃣ Нажмите "🌐 Открыть обучающую платформу"
2️⃣ Изучайте материалы в веб-приложении
3️⃣ Отслеживайте свой прогресс
4️⃣ Добавляйте уроки в избранное

💡 **Возможности веб-приложения:**
• Категории уроков (Потребности, Возражения, и др.)
• Интерактивный контент
• Система прогресса
• Избранные материалы

❓ Если у вас есть вопросы, обратитесь к администратору.`;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Обработка команды /info
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  
  const infoMessage = `📊 **О платформе Sales Training**

🎯 **Цель:** Обучение эффективным техникам продаж

📚 **Содержание:**
• **Потребности** - Выявление потребностей клиента
• **Возражения** - Работа с возражениями
• **Постмитинг** - Работа после встречи  
• **Закрытие** - Закрытие сделки

⚡ **Особенности:**
• Современный интерфейс
• Адаптивный дизайн
• Отслеживание прогресса
• Система избранного

🔗 **Технологии:** Next.js, React, Supabase, Telegram Bot API

Версия: 1.0.0`;
  
  bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
  // Игнорируем команды и сообщения от веб-приложения
  if (msg.text && !msg.text.startsWith('/') && !msg.web_app_data) {
    const chatId = msg.chat.id;
    
    bot.sendMessage(
      chatId,
      'Используйте кнопку ниже для доступа к обучающей платформе:',
      {
        reply_markup: {
          keyboard: [
            [{
              text: '🌐 Открыть веб-приложение',
              web_app: { url: process.env.WEBAPP_URL }
            }]
          ],
          resize_keyboard: true
        }
      }
    );
  }
});

// Обработка данных, полученных из веб-приложения
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = msg.web_app_data.data;
  
  try {
    // Пытаемся распарсить данные как JSON
    const parsedData = JSON.parse(data);
    bot.sendMessage(chatId, `Получены данные из веб-приложения: ${JSON.stringify(parsedData, null, 2)}`);
  } catch (e) {
    // Если не удалось распарсить как JSON, отправляем как текст
    bot.sendMessage(chatId, `Получены данные из веб-приложения: ${data}`);
  }
});

console.log('Бот запущен! Нажмите Ctrl+C для остановки.');