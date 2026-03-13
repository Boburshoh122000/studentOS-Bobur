import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import {
  sendTelegramMessageDirect,
  sendTelegramMessageWithButtons,
  editTelegramMessage,
  answerCallbackQuery,
  checkChannelMembership,
} from '../services/telegram.service.js';

const CREO_CHANNEL = '@creo_life';
const CREO_CHANNEL_URL = 'https://t.me/creo_life';

const router = Router();

// ─── Public: Link account via code (called by the polling bot) ──────────────
// No JWT auth — the 6-digit code IS the credential. Expires in 10 minutes.
router.post('/link-account', async (req: Request, res: Response) => {
  const { chatId, username, code } = req.body as {
    chatId: number;
    username: string | null;
    code: string;
  };

  if (!chatId || !code) {
    return res.status(400).json({ error: 'chatId and code are required' });
  }

  const user = await prisma.user.findFirst({
    where: {
      telegramLinkCode: code,
      telegramLinkCodeExpiry: { gt: new Date() },
    },
    select: { id: true, email: true, studentProfile: { select: { fullName: true } } },
  });

  if (!user) {
    return res.status(404).json({ error: 'Invalid or expired code' });
  }

  // Prevent this Telegram account from linking to multiple StudentOS accounts
  const conflict = await prisma.user.findFirst({
    where: { telegramChatId: BigInt(chatId), id: { not: user.id } },
  });

  if (conflict) {
    return res.status(409).json({ error: 'Telegram already linked to another account' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: BigInt(chatId),
      telegramUsername: username,
      telegramLinkCode: null,
      telegramLinkCodeExpiry: null,
    },
  });

  const name = user.studentProfile?.fullName || user.email;
  return res.json({ success: true, name });
});

// ─── Debug: Webhook info + re-register ──────────────────────────────────────
router.get('/webhook-info', async (_req: Request, res: Response) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const backendUrl = process.env.BACKEND_URL;
  if (!token) {
    res.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set' });
    return;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data: any = await r.json();
    res.json({
      webhookInfo: data,
      expectedUrl: backendUrl ? `${backendUrl}/api/telegram/webhook` : 'BACKEND_URL not set',
      match: backendUrl ? data?.result?.url === `${backendUrl}/api/telegram/webhook` : false,
    });
  } catch (err: any) {
    res.json({ ok: false, error: err.message });
  }
});

// ─── Manual: Re-register webhook ────────────────────────────────────────────
router.post('/register-webhook', async (_req: Request, res: Response) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const backendUrl = process.env.BACKEND_URL;
  if (!token) {
    res.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set in Railway env' });
    return;
  }
  if (!backendUrl) {
    res.json({ ok: false, error: 'BACKEND_URL not set in Railway env' });
    return;
  }
  try {
    const webhookUrl = `${backendUrl}/api/telegram/webhook`;
    const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data: any = await r.json();
    res.json({ ...data, webhookUrl });
  } catch (err: any) {
    res.json({ ok: false, error: err.message });
  }
});

// ─── Telegram Webhook Handler ───────────────────────────────────────────────
// This endpoint receives updates from Telegram. No auth middleware —
// it's called by Telegram's servers. The route is secured by keeping the
// webhook URL secret (registered via setWebhook with the bot token).

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('[Telegram Webhook] Received update:', JSON.stringify(req.body).slice(0, 200));
    const update = req.body;

    // Handle regular messages (commands)
    if (update.message?.text) {
      await handleMessage(update.message);
    }

    // Handle callback queries (inline keyboard button presses)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    // Always respond 200 to Telegram (otherwise it retries)
    res.sendStatus(200);
  } catch (err) {
    console.error('[Telegram Webhook] Error:', err);
    res.sendStatus(200); // Still 200 — don't make Telegram retry
  }
});

// ─── /start <user_id> — Link Telegram account ──────────────────────────────
async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();

  // /start command with deep link payload
  if (text.startsWith('/start')) {
    const payload = text.split(' ')[1]; // The user UUID
    if (payload) {
      await handleStartCommand(chatId, message.from, payload);
    } else {
      await sendTelegramMessageDirect(
        chatId,
        '👋 <b>Welcome to StudentOS Bot!</b>\n\n' +
          'To connect your account, go to <b>Settings → Integrations</b> in StudentOS and tap <b>Connect Telegram</b>.\n\n' +
          helpText()
      );
    }
    return;
  }

  // /link CODE command — pair via generated code
  if (text.startsWith('/link ')) {
    const code = text.split(' ')[1]?.trim();
    if (code) {
      await handleLinkCommand(chatId, message.from, code);
    } else {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Please provide the code: <code>/link 123456</code>'
      );
    }
    return;
  }

  // /habits command
  if (text === '/habits') {
    await handleHabitsCommand(chatId);
    return;
  }

  // /credits command — show balance
  if (text === '/credits' || text === '/balance') {
    await handleCreditsCommand(chatId);
    return;
  }

  // /earn command — show earn opportunities
  if (text === '/earn') {
    await handleEarnCommand(chatId);
    return;
  }

  // /verify command — verify @creo_life membership and award credits
  if (text === '/verify') {
    await handleVerifyCommand(chatId);
    return;
  }

  // Unknown command
  await sendTelegramMessageDirect(chatId, helpText());
}

function helpText(): string {
  return (
    '🤖 <b>StudentOS Bot Commands:</b>\n\n' +
    "/habits — View & toggle today's habits\n" +
    '/credits — Check your credit balance\n' +
    '/earn — How to earn free credits\n' +
    '/verify — Verify channel join &amp; claim credits'
  );
}

// ─── Deep Link: Connect Telegram to StudentOS account ───────────────────────
async function handleStartCommand(chatId: number, from: any, userUuid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userUuid },
      select: { id: true, email: true, studentProfile: { select: { fullName: true } } },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Invalid link. Please use the Connect button from your StudentOS Settings.'
      );
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId), id: { not: userUuid } },
    });

    if (existing) {
      await sendTelegramMessageDirect(
        chatId,
        '⚠️ This Telegram account is already connected to a different StudentOS account.'
      );
      return;
    }

    const username = from?.username ? `@${from.username}` : from?.first_name || null;

    await prisma.user.update({
      where: { id: userUuid },
      data: { telegramChatId: BigInt(chatId), telegramUsername: username },
    });

    const name = user.studentProfile?.fullName || user.email;

    await sendTelegramMessageDirect(
      chatId,
      `✅ <b>Successfully connected to StudentOS!</b>\n\n` +
        `Hello, <b>${name}</b>! You will now receive notifications here.\n\n` +
        helpText()
    );
  } catch (err) {
    console.error('[Telegram] handleStartCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Something went wrong. Please try again.');
  }
}

// ─── /link CODE — Pair via generated code ───────────────────────────────────
async function handleLinkCommand(chatId: number, from: any, code: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        telegramLinkCode: code,
        telegramLinkCodeExpiry: { gt: new Date() },
      },
      select: { id: true, email: true, studentProfile: { select: { fullName: true } } },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Invalid or expired code. Please generate a new one from <b>Settings → Integrations</b> in StudentOS.'
      );
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId), id: { not: user.id } },
    });

    if (existing) {
      await sendTelegramMessageDirect(
        chatId,
        '⚠️ This Telegram account is already connected to a different StudentOS account.'
      );
      return;
    }

    const username = from?.username ? `@${from.username}` : from?.first_name || null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: BigInt(chatId),
        telegramUsername: username,
        telegramLinkCode: null,
        telegramLinkCodeExpiry: null,
      },
    });

    const name = user.studentProfile?.fullName || user.email;

    await sendTelegramMessageDirect(
      chatId,
      `✅ <b>Successfully connected to StudentOS!</b>\n\n` +
        `Hello, <b>${name}</b>! Your account is now linked.\n\n` +
        helpText()
    );
  } catch (err) {
    console.error('[Telegram] handleLinkCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Something went wrong. Please try again.');
  }
}

// ─── /credits — Show current credit balance ──────────────────────────────────
async function handleCreditsCommand(chatId: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      select: { creditBalance: true, studentProfile: { select: { fullName: true } } },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Your Telegram is not linked to a StudentOS account.\n\n' +
          'Go to <b>Settings → Integrations</b> in StudentOS to connect.'
      );
      return;
    }

    const name = user.studentProfile?.fullName || 'there';
    await sendTelegramMessageDirect(
      chatId,
      `💳 <b>Your Credit Balance</b>\n\n` +
        `Hi <b>${name}</b>, you have:\n\n` +
        `🪙 <b>${user.creditBalance} credits</b>\n\n` +
        `Use credits to access AI-powered tools on StudentOS.\n` +
        `Send /earn to see how to get more credits!`
    );
  } catch (err) {
    console.error('[Telegram] handleCreditsCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Failed to fetch balance. Please try again.');
  }
}

// ─── /earn — Show earn opportunities ─────────────────────────────────────────
async function handleEarnCommand(chatId: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      select: {
        creditBalance: true,
        telegramCredited: true,
        referralCode: true,
      },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Your Telegram is not linked to a StudentOS account.\n\n' +
          'Go to <b>Settings → Integrations</b> in StudentOS to connect.'
      );
      return;
    }

    const channelStatus = user.telegramCredited ? '✅ Claimed' : '⬜ Not claimed';
    const referralLink = user.referralCode
      ? `https://studentos.uz/ref/${user.referralCode}`
      : 'Go to studentos.uz to get your link';

    await sendTelegramMessageDirect(
      chatId,
      `🎁 <b>Earn Free Credits</b>\n\n` +
        `💳 Balance: <b>${user.creditBalance} credits</b>\n\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `1️⃣ <b>Join Our Channel</b> — +5 credits\n` +
        `   Status: ${channelStatus}\n` +
        `   👉 Join: ${CREO_CHANNEL_URL}\n` +
        `   Then send /verify to claim!\n\n` +
        `2️⃣ <b>Invite Friends</b> — +5 credits per friend\n` +
        `   Share your link:\n` +
        `   👉 ${referralLink}`
    );
  } catch (err) {
    console.error('[Telegram] handleEarnCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Failed to load earn info. Please try again.');
  }
}

// ─── /verify — Verify @creo_life membership and award credits ────────────────
async function handleVerifyCommand(chatId: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      select: { id: true, telegramCredited: true, creditBalance: true },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Your Telegram is not linked to a StudentOS account.\n\n' +
          'Go to <b>Settings → Integrations</b> in StudentOS to connect.'
      );
      return;
    }

    if (user.telegramCredited) {
      await sendTelegramMessageDirect(
        chatId,
        `✅ <b>Already claimed!</b>\n\n` +
          `You already received your 5 credits for joining ${CREO_CHANNEL}.\n\n` +
          `💳 Balance: <b>${user.creditBalance} credits</b>`
      );
      return;
    }

    // Check channel membership (null = can't verify → trust user)
    const isMember = await checkChannelMembership(BigInt(chatId), CREO_CHANNEL);

    if (isMember === false) {
      await sendTelegramMessageDirect(
        chatId,
        `❌ <b>Not a member yet!</b>\n\n` +
          `Join ${CREO_CHANNEL} first:\n` +
          `👉 ${CREO_CHANNEL_URL}\n\n` +
          `Then send /verify again to claim your 5 credits.`
      );
      return;
    }

    // Award 5 credits
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        creditBalance: { increment: 5 },
        telegramCredited: true,
      },
      select: { creditBalance: true },
    });

    const verifiedMsg =
      isMember === true
        ? `✅ Verified — you're a member of ${CREO_CHANNEL}!`
        : `✅ Verified — welcome to the community!`;

    await sendTelegramMessageDirect(
      chatId,
      `🎉 <b>Credits Claimed!</b>\n\n` +
        `${verifiedMsg}\n\n` +
        `🪙 <b>+5 credits added!</b>\n` +
        `💳 New balance: <b>${updated.creditBalance} credits</b>\n\n` +
        `Send /earn to see more ways to earn!`
    );
  } catch (err) {
    console.error('[Telegram] handleVerifyCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Something went wrong. Please try again.');
  }
}

// ─── /habits — Interactive habit tracker ────────────────────────────────────
async function handleHabitsCommand(chatId: number) {
  try {
    // Find user by telegramChatId
    const user = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      select: { id: true },
    });

    if (!user) {
      await sendTelegramMessageDirect(
        chatId,
        '❌ Your Telegram is not linked to a StudentOS account.\n\n' +
          'Use the <b>Connect Telegram</b> button in your StudentOS Dashboard.'
      );
      return;
    }

    // Get today's habits with completion status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        logs: {
          where: { completedAt: { gte: today } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (habits.length === 0) {
      await sendTelegramMessageDirect(
        chatId,
        "📋 You don't have any habits yet.\n\nCreate habits in your StudentOS Dashboard!"
      );
      return;
    }

    // Build inline keyboard
    const buttons = habits.map((habit) => {
      const completed = habit.logs.length > 0;
      const icon = completed ? '✅' : '⬜';
      return [
        {
          text: `${icon} ${habit.title}`,
          callback_data: `habit_toggle:${habit.id}`,
        },
      ];
    });

    const completedCount = habits.filter((h) => h.logs.length > 0).length;

    await sendTelegramMessageWithButtons(
      chatId,
      `📋 <b>Today's Habits</b> (${completedCount}/${habits.length})\n\n` +
        `Tap a habit to toggle it:`,
      buttons
    );
  } catch (err) {
    console.error('[Telegram] handleHabitsCommand error:', err);
    await sendTelegramMessageDirect(chatId, '❌ Failed to load habits. Please try again.');
  }
}

// ─── Callback Query Handler (Inline Keyboard Presses) ──────────────────────
async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data || '';

  // Answer the callback immediately (removes loading spinner)
  await answerCallbackQuery(callbackQuery.id);

  // Handle habit toggle
  if (data.startsWith('habit_toggle:')) {
    const habitId = data.replace('habit_toggle:', '');
    await toggleHabit(chatId, messageId, habitId);
  }
}

// ─── Toggle Habit Completion ────────────────────────────────────────────────
async function toggleHabit(chatId: number, messageId: number, habitId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      select: { id: true },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        userId: user.id,
        completedAt: { gte: today },
      },
    });

    if (existingLog) {
      // Un-complete: remove the log
      await prisma.habitLog.delete({ where: { id: existingLog.id } });
    } else {
      // Complete: create a log
      await prisma.habitLog.create({
        data: { habitId, userId: user.id },
      });
    }

    // Re-fetch all habits to rebuild the keyboard
    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        logs: {
          where: { completedAt: { gte: today } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const buttons = habits.map((habit) => {
      const completed = habit.logs.length > 0;
      const icon = completed ? '✅' : '⬜';
      return [
        {
          text: `${icon} ${habit.title}`,
          callback_data: `habit_toggle:${habit.id}`,
        },
      ];
    });

    const completedCount = habits.filter((h) => h.logs.length > 0).length;

    // Edit the existing message in-place
    await editTelegramMessage(
      chatId,
      messageId,
      `📋 <b>Today's Habits</b> (${completedCount}/${habits.length})\n\n` +
        `Tap a habit to toggle it:`,
      buttons
    );
  } catch (err) {
    console.error('[Telegram] toggleHabit error:', err);
  }
}

export default router;
