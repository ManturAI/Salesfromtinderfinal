import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTelegramJWT } from '@/lib/utils/telegram-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Сначала пробуем Telegram аутентификацию
    const cookieStore = await cookies();
    const telegramToken = cookieStore.get('telegram-auth-token')?.value;

    if (telegramToken) {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const payload = verifyTelegramJWT(telegramToken, jwtSecret);

      if (payload) {
        // Получаем пользователя по telegram_id (using id from TelegramUser)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', payload.id)
          .single();

        if (!userError && userData) {
          return NextResponse.json({
            user: userData
          });
        }
      }
    }

    // Fallback на стандартную Supabase аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получение данных пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: userData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Проверка аутентификации
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url, preferences } = body;

    // Обновление данных пользователя
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({
        full_name,
        avatar_url,
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}