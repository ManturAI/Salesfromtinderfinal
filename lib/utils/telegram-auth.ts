import { ParsedInitData, TelegramUser, TelegramAuthResult } from '@/lib/types/telegram';

/**
 * Парсит initData строку в объект
 */
export function parseInitData(initData: string): ParsedInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const data: Record<string, unknown> = {};
    
    for (const [key, value] of urlParams.entries()) {
      if (key === 'user' || key === 'chat') {
        try {
          data[key] = JSON.parse(decodeURIComponent(value));
        } catch {
          data[key] = value;
        }
      } else if (key === 'auth_date' || key === 'can_send_after') {
        data[key] = parseInt(value, 10);
      } else {
        data[key] = value;
      }
    }
    
    return data as unknown as ParsedInitData;
  } catch (error) {
    console.error('Error parsing initData:', error);
    return null;
  }
}

/**
 * Создает HMAC подпись используя Web Crypto API
 */
async function createHmac(algorithm: string, key: string | Uint8Array, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = typeof key === 'string' ? encoder.encode(key) : new Uint8Array(key);
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Валидирует подпись Telegram initData
 */
export async function validateTelegramData(
  initData: string, 
  botToken: string
): Promise<{ isValid: boolean; data?: ParsedInitData }> {
  try {
    const parsed = parseInitData(initData);
    if (!parsed || !parsed.hash) {
      return { isValid: false };
    }

    // Создаем строку для проверки подписи
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Сортируем параметры
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = await createHmac('sha256', 'WebAppData', botToken);
    const secretKeyBytes = new Uint8Array(secretKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Создаем подпись
    const signature = await createHmac('sha256', secretKeyBytes, sortedParams);

    const isValid = signature === hash;
    
    return {
      isValid,
      data: isValid ? parsed : undefined
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return { isValid: false };
  }
}

/**
 * Проверяет, не истекла ли подпись (по умолчанию 24 часа)
 */
export function isAuthDateValid(authDate: number, maxAgeSeconds: number = 86400): boolean {
  const now = Math.floor(Date.now() / 1000);
  return (now - authDate) <= maxAgeSeconds;
}

/**
 * Извлекает пользователя из initData
 */
export function extractTelegramUser(initData: string): TelegramUser | null {
  const parsed = parseInitData(initData);
  return parsed?.user || null;
}

/**
 * Полная валидация и аутентификация пользователя
 */
export async function authenticateTelegramUser(
  initData: string,
  botToken: string
): Promise<TelegramAuthResult> {
  try {
    // Валидируем подпись
    const validation = await validateTelegramData(initData, botToken);
    if (!validation.isValid || !validation.data) {
      return {
        success: false,
        error: 'Invalid Telegram signature'
      };
    }

    // Проверяем время
    if (!isAuthDateValid(validation.data.auth_date)) {
      return {
        success: false,
        error: 'Authentication data expired'
      };
    }

    // Проверяем наличие пользователя
    if (!validation.data.user) {
      return {
        success: false,
        error: 'No user data found'
      };
    }

    return {
      success: true,
      user: validation.data.user
    };
  } catch (error) {
    console.error('Error authenticating Telegram user:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Создает JWT токен для пользователя Telegram
 */
export async function createTelegramJWT(user: TelegramUser, secret: string): Promise<string> {
  const payload = {
    telegram_id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    language_code: user.language_code,
    is_premium: user.is_premium,
    photo_url: user.photo_url,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
  };

  // Простая реализация JWT (в продакшене лучше использовать библиотеку)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = await createHmac('sha256', secret, `${header}.${payloadStr}`);
  const signatureBase64 = Buffer.from(signature, 'hex').toString('base64url');

  return `${header}.${payloadStr}.${signatureBase64}`;
}

/**
 * Верифицирует JWT токен
 */
export async function verifyTelegramJWT(token: string, secret: string): Promise<TelegramUser | null> {
  try {
    const [header, payload, signature] = token.split('.');
    
    // Проверяем подпись
    const expectedSignature = await createHmac('sha256', secret, `${header}.${payload}`);
    const expectedSignatureBase64 = Buffer.from(expectedSignature, 'hex').toString('base64url');

    if (signature !== expectedSignatureBase64) {
      return null;
    }

    // Декодируем payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Проверяем срок действия
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}