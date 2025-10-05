import { NextRequest, NextResponse } from 'next/server';
import { authenticateTelegramUser, createTelegramJWT } from '@/lib/utils/telegram-auth';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      );
    }

    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return NextResponse.json(
        { error: 'Telegram authentication not configured' },
        { status: 500 }
      );
    }

    // Аутентифицируем пользователя
    const authResult = authenticateTelegramUser(initData, botToken);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    const telegramUser = authResult.user;
    const supabase = createClient();

    // Проверяем, существует ли пользователь в базе данных
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let user = existingUser;

    // Если пользователь не существует, создаем его
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id,
          email: `telegram_${telegramUser.id}@telegram.local`,
          full_name: `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
          username: telegramUser.username,
          language_code: telegramUser.language_code || 'ru',
          is_premium: telegramUser.is_premium || false,
          photo_url: telegramUser.photo_url,
          role: 'user',
          preferences: {
            telegram_data: {
              allows_write_to_pm: telegramUser.allows_write_to_pm
            }
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUser;
    } else {
      // Обновляем данные существующего пользователя
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
          username: telegramUser.username,
          language_code: telegramUser.language_code || user.language_code,
          is_premium: telegramUser.is_premium || false,
          photo_url: telegramUser.photo_url || user.photo_url,
          preferences: {
            ...user.preferences,
            telegram_data: {
              allows_write_to_pm: telegramUser.allows_write_to_pm
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        // Продолжаем с существующими данными пользователя
      } else {
        user = updatedUser;
      }
    }

    // Создаем JWT токен
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = createTelegramJWT(telegramUser, jwtSecret);

    // Устанавливаем cookie с токеном
    const cookieStore = await cookies();
    cookieStore.set('telegram-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url
      },
      token
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('telegram-auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const { verifyTelegramJWT } = await import('@/lib/utils/telegram-auth');
    const payload = verifyTelegramJWT(token, jwtSecret);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', payload.telegram_id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url
      }
    });

  } catch (error) {
    console.error('Telegram auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}