import { env } from '../config/env.js';
import prisma from '../config/database.js';

const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

/**
 * Send a raw Telegram message to a chat ID.
 */
export async function sendTelegramMessageDirect(
  chatId: bigint | number | string,
  text: string,
  options?: { parse_mode?: 'HTML' | 'Markdown'; reply_markup?: object }
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        text,
        parse_mode: options?.parse_mode || 'HTML',
        ...(options?.reply_markup && { reply_markup: options.reply_markup }),
      }),
    });

    const data: any = await res.json();
    if (!data.ok) {
      console.error('[Telegram] sendMessage failed:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram] sendMessage error:', err);
    return false;
  }
}

/**
 * Send a Telegram message to a StudentOS user by their user ID.
 * Looks up the telegramChatId from the database.
 * Returns false if the user hasn't connected Telegram.
 */
export async function sendTelegramMessage(
  userId: string,
  text: string,
  options?: { parse_mode?: 'HTML' | 'Markdown'; reply_markup?: object }
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    });

    if (!user?.telegramChatId) return false;

    return sendTelegramMessageDirect(user.telegramChatId, text, options);
  } catch (err) {
    console.error('[Telegram] sendTelegramMessage error:', err);
    return false;
  }
}

/**
 * Send a message with inline keyboard buttons.
 */
export async function sendTelegramMessageWithButtons(
  chatId: bigint | number | string,
  text: string,
  buttons: { text: string; callback_data: string }[][]
): Promise<number | null> {
  if (!env.TELEGRAM_BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      }),
    });

    const data: any = await res.json();
    if (!data.ok) {
      console.error('[Telegram] sendMessageWithButtons failed:', data.description);
      return null;
    }
    return data.result.message_id;
  } catch (err) {
    console.error('[Telegram] sendMessageWithButtons error:', err);
    return null;
  }
}

/**
 * Edit an existing message's text and buttons.
 */
export async function editTelegramMessage(
  chatId: bigint | number | string,
  messageId: number,
  text: string,
  buttons?: { text: string; callback_data: string }[][]
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        ...(buttons && { reply_markup: { inline_keyboard: buttons } }),
      }),
    });

    const data: any = await res.json();
    if (!data.ok) {
      console.error('[Telegram] editMessageText failed:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram] editMessageText error:', err);
    return false;
  }
}

/**
 * Check if a user (by their Telegram chatId) is a member of a channel.
 * Returns true for creator/administrator/member/restricted statuses.
 * Returns false for left/kicked or any API error.
 */
export async function checkChannelMembership(
  chatId: bigint | number | string,
  channel: string
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;

  try {
    const res = await fetch(
      `${TELEGRAM_API}/getChatMember?chat_id=${encodeURIComponent(channel)}&user_id=${chatId.toString()}`
    );
    const data: any = await res.json();
    if (!data.ok) return false;
    const status: string = data.result?.status ?? '';
    return ['creator', 'administrator', 'member', 'restricted'].includes(status);
  } catch {
    return false;
  }
}

/**
 * Answer a callback query (removes the loading spinner on button press).
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN) return;

  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        ...(text && { text }),
      }),
    });
  } catch (err) {
    console.error('[Telegram] answerCallbackQuery error:', err);
  }
}
