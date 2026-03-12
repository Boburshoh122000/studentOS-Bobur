/**
 * StudentOS Telegram Bot
 * ─── Habit Tracker ───
 * ─── Multi-language: EN / UZ / RU ───
 *
 * Tech: Telegraf, OpenAI, dotenv
 */

require('dotenv').config();

const { Telegraf, Markup, Scenes, session } = require('telegraf');
const OpenAI = require('openai');
const https = require('https');
const http = require('http');

// ─── Validate env ──────────────────────────────────────────
const { BOT_TOKEN, OPENAI_API_KEY, BACKEND_URL } = process.env;
if (!BOT_TOKEN) { console.error('❌ BOT_TOKEN missing'); process.exit(1); }
if (!OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY missing'); process.exit(1); }

// ─── Helper: POST to backend ────────────────────────────────
function postToBackend(path, body) {
    return new Promise((resolve, reject) => {
        const base = BACKEND_URL || 'http://localhost:5000';
        const url = new URL(path, base);
        const payload = JSON.stringify(body);
        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: {} }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new Telegraf(BOT_TOKEN);

// ─── Habit Store ───────────────────────────────────────────
const habitsStore = new Map();
function getUserHabits(uid) { if (!habitsStore.has(uid)) habitsStore.set(uid, []); return habitsStore.get(uid); }
function getToday() { return new Date().toISOString().slice(0, 10); }

// ═══════════════════════════════════════════════════════════
//  i18n — Translations (EN / UZ / RU)
// ═══════════════════════════════════════════════════════════
const i18n = {
    en: {
        lang_chosen: '🇬🇧 Language set to English!',
        welcome: '🎓 *StudentOS Bot*\n\nChoose a tool to get started:',
        btn_habit: '🗓 Habit Tracker',
        btn_help: '❓ Help',
        btn_back: '🔙 Main Menu',
        btn_add_habit: '➕ Add Habit',
        btn_my_habits: '📋 My Habits',
        btn_cancel: '❌ Cancel',
        help_text: '🎓 *StudentOS Bot — Help*\n\n🗓 *Habit Tracker* — Daily habits with streak tracking\n🌐 /lang — Change language',
        cancelled: '❌ Cancelled.',
        habit_ask_name: '➕ *Add a new habit*\n\nSend the habit name:',
        habit_too_long: '❌ Too long (100 char max).',
        habit_exists: '⚠️ *"{name}"* already exists.',
        habit_added: '✅ *"{name}"* added! 🔥 Streak: 0',
        habit_empty: '📋 No habits yet! Tap ➕ to add one.',
        habit_list: '📋 *Your Habits*\n\nTap to toggle:',
        habit_delete_title: '🗑 *Delete a Habit*\n\nTap to remove:',
        habit_delete_btn: '🗑 Delete a Habit',
        habit_all_deleted: '🗑 All deleted.',
        habit_back: '⬅️ Back',
        error_generic: '⚠️ Error. Use /start.',
        choose_lang: '🌐 Choose your language:',
    },
    uz: {
        lang_chosen: "🇺🇿 Til o'zbek tiliga o'zgartirildi!",
        welcome: '🎓 *StudentOS Bot*\n\nBoshlash uchun vositani tanlang:',
        btn_habit: '🗓 Odatlarni kuzatish',
        btn_help: '❓ Yordam',
        btn_back: '🔙 Bosh menyu',
        btn_add_habit: "➕ Odat qo'shish",
        btn_my_habits: '📋 Mening odatlarim',
        btn_cancel: '❌ Bekor qilish',
        help_text: "🎓 *Yordam*\n\n🗓 *Odatlar* — Kunlik kuzatish\n🌐 /lang — Tilni o'zgartirish",
        cancelled: '❌ Bekor qilindi.',
        habit_ask_name: "➕ *Yangi odat*\n\nOdat nomini yuboring:",
        habit_too_long: "❌ Juda uzun (100 belgigacha).",
        habit_exists: '⚠️ *"{name}"* allaqachon bor.',
        habit_added: '✅ *"{name}"* qo\'shildi! 🔥 Streak: 0',
        habit_empty: "📋 Odatlar yo'q! ➕ bosing.",
        habit_list: '📋 *Odatlaringiz*\n\nBelgilang:',
        habit_delete_title: "🗑 *O'chirish*\n\nBosing:",
        habit_delete_btn: "🗑 O'chirish",
        habit_all_deleted: "🗑 Hammasi o'chirildi.",
        habit_back: '⬅️ Orqaga',
        error_generic: '⚠️ Xatolik. /start yuboring.',
        choose_lang: '🌐 Tilni tanlang:',
    },
    ru: {
        lang_chosen: '🇷🇺 Язык: русский!',
        welcome: '🎓 *StudentOS Bot*\n\nВыберите инструмент:',
        btn_habit: '🗓 Трекер привычек',
        btn_help: '❓ Помощь',
        btn_back: '🔙 Главное меню',
        btn_add_habit: '➕ Добавить привычку',
        btn_my_habits: '📋 Мои привычки',
        btn_cancel: '❌ Отмена',
        help_text: '🎓 *Помощь*\n\n🗓 *Привычки* — Ежедневный трекер\n🌐 /lang — Сменить язык',
        cancelled: '❌ Отменено.',
        habit_ask_name: '➕ *Новая привычка*\n\nНазвание:',
        habit_too_long: '❌ Слишком длинное (макс. 100).',
        habit_exists: '⚠️ *"{name}"* уже есть.',
        habit_added: '✅ *"{name}"* добавлена! 🔥 Стрик: 0',
        habit_empty: '📋 Пока нет привычек! Нажмите ➕.',
        habit_list: '📋 *Ваши привычки*\n\nОтмечайте:',
        habit_delete_title: '🗑 *Удалить*\n\nНажмите:',
        habit_delete_btn: '🗑 Удалить',
        habit_all_deleted: '🗑 Все удалено.',
        habit_back: '⬅️ Назад',
        error_generic: '⚠️ Ошибка. /start.',
        choose_lang: '🌐 Выберите язык:',
    },
};

// ─── i18n helpers ──────────────────────────────────────────
function t(ctx, key, params = {}) {
    const lang = ctx.session?.lang || 'en';
    let text = i18n[lang]?.[key] || i18n.en[key] || key;
    for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, v);
    return text;
}
function getLang(ctx) { return ctx.session?.lang || 'en'; }

function mainMenuKb(ctx) {
    return Markup.keyboard([[t(ctx, 'btn_habit')], [t(ctx, 'btn_help')]]).resize();
}
function habitMenuKb(ctx) {
    return Markup.keyboard([[t(ctx, 'btn_add_habit'), t(ctx, 'btn_my_habits')], [t(ctx, 'btn_back')]]).resize();
}
function cancelKb(ctx) {
    return Markup.keyboard([[t(ctx, 'btn_cancel')]]).resize();
}
const langSelectKb = Markup.inlineKeyboard([
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
    [Markup.button.callback("🇺🇿 O'zbekcha", 'lang_uz')],
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
]);

// ═══════════════════════════════════════════════════════════
//  HABIT TRACKER SCENE
// ═══════════════════════════════════════════════════════════
const addHabitScene = new Scenes.WizardScene(
    'add-habit-wizard',
    async (ctx) => {
        await ctx.reply(t(ctx, 'habit_ask_name'), { parse_mode: 'Markdown', ...cancelKb(ctx) });
        return ctx.wizard.next();
    },
    async (ctx) => {
        const name = ctx.message?.text?.trim();
        if (!name || name === t(ctx, 'btn_cancel')) {
            await ctx.reply(t(ctx, 'cancelled'), habitMenuKb(ctx));
            return ctx.scene.leave();
        }
        if (name.length > 100) { await ctx.reply(t(ctx, 'habit_too_long')); return; }
        const habits = getUserHabits(ctx.from.id);
        if (habits.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
            await ctx.reply(t(ctx, 'habit_exists', { name }), { parse_mode: 'Markdown', ...habitMenuKb(ctx) });
            return ctx.scene.leave();
        }
        habits.push({ name, streak: 0, lastDone: null });
        await ctx.reply(t(ctx, 'habit_added', { name }), { parse_mode: 'Markdown', ...habitMenuKb(ctx) });
        return ctx.scene.leave();
    }
);
addHabitScene.hears(/❌/, async (ctx) => {
    await ctx.reply(t(ctx, 'cancelled'), habitMenuKb(ctx));
    return ctx.scene.leave();
});

// ═══════════════════════════════════════════════════════════
//  MIDDLEWARE & ROUTING
// ═══════════════════════════════════════════════════════════
const stage = new Scenes.Stage([addHabitScene]);
bot.use(session());
bot.use(stage.middleware());

async function sendMainMenu(ctx) {
    await ctx.reply(t(ctx, 'welcome'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) });
}

async function showHabitList(ctx) {
    const habits = getUserHabits(ctx.from.id);
    if (habits.length === 0) return ctx.reply(t(ctx, 'habit_empty'), habitMenuKb(ctx));
    const today = getToday();
    const buttons = habits.map((h, i) => {
        const d = h.lastDone === today;
        return [Markup.button.callback(`${d ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)];
    });
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
    await ctx.reply(t(ctx, 'habit_list'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
}

// ── /start ──
bot.start(async (ctx) => {
    ctx.session ??= {};
    await ctx.reply(`👋 *Welcome / Xush kelibsiz / Добро пожаловать!*\n\n${i18n.en.choose_lang}`, {
        parse_mode: 'Markdown', ...langSelectKb,
    });
});

bot.command('lang', (ctx) => ctx.reply(t(ctx, 'choose_lang'), langSelectKb));
bot.command('menu', sendMainMenu);
bot.command('help', (ctx) => ctx.reply(t(ctx, 'help_text'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) }));

// ── Language selection ──
bot.action(/lang_(en|uz|ru)/, async (ctx) => {
    ctx.session ??= {};
    ctx.session.lang = ctx.match[1];
    await ctx.answerCbQuery(i18n[ctx.match[1]].lang_chosen);
    await ctx.editMessageText(i18n[ctx.match[1]].lang_chosen);
    await sendMainMenu(ctx);
});

// ── Reply Keyboard listeners (all 3 languages) ──
bot.hears([i18n.en.btn_habit, i18n.uz.btn_habit, i18n.ru.btn_habit], (ctx) =>
    ctx.reply('🗓', { ...habitMenuKb(ctx) })
);
bot.hears([i18n.en.btn_help, i18n.uz.btn_help, i18n.ru.btn_help], (ctx) =>
    ctx.reply(t(ctx, 'help_text'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) })
);
bot.hears([i18n.en.btn_back, i18n.uz.btn_back, i18n.ru.btn_back], sendMainMenu);
bot.hears([i18n.en.btn_add_habit, i18n.uz.btn_add_habit, i18n.ru.btn_add_habit], (ctx) => ctx.scene.enter('add-habit-wizard'));
bot.hears([i18n.en.btn_my_habits, i18n.uz.btn_my_habits, i18n.ru.btn_my_habits], showHabitList);

// ── Habit inline actions ──
bot.action(/toggle_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const habits = getUserHabits(ctx.from.id);
    const idx = parseInt(ctx.match[1], 10);
    if (idx >= habits.length) return;
    const h = habits[idx], today = getToday();
    if (h.lastDone === today) { h.streak = Math.max(0, h.streak - 1); h.lastDone = null; }
    else {
        const yd = new Date(); yd.setDate(yd.getDate() - 1);
        h.streak = (h.lastDone === yd.toISOString().slice(0, 10) || h.streak === 0) ? h.streak + 1 : 1;
        h.lastDone = today;
    }
    const buttons = habits.map((hb, i) => [Markup.button.callback(`${hb.lastDone === today ? '✅' : '⬜'} ${hb.name}  (🔥${hb.streak})`, `toggle_${i}`)]);
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
    try { await ctx.editMessageText(t(ctx, 'habit_list'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }); } catch { }
});

bot.action('delete_menu', async (ctx) => {
    await ctx.answerCbQuery();
    const habits = getUserHabits(ctx.from.id);
    if (!habits.length) return ctx.reply(t(ctx, 'habit_empty'), habitMenuKb(ctx));
    const buttons = habits.map((h, i) => [Markup.button.callback(`🗑 ${h.name}`, `del_${i}`)]);
    buttons.push([Markup.button.callback(t(ctx, 'habit_back'), 'back_habits')]);
    await ctx.editMessageText(t(ctx, 'habit_delete_title'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
});

bot.action(/del_(\d+)/, async (ctx) => {
    const habits = getUserHabits(ctx.from.id);
    const idx = parseInt(ctx.match[1], 10);
    if (idx >= habits.length) return ctx.answerCbQuery('Not found');
    const removed = habits.splice(idx, 1)[0];
    await ctx.answerCbQuery(`Deleted "${removed.name}"`);
    if (habits.length > 0) {
        const today = getToday();
        const buttons = habits.map((h, i) => [Markup.button.callback(`${h.lastDone === today ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)]);
        buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
        await ctx.editMessageText(t(ctx, 'habit_list'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
    } else await ctx.editMessageText(t(ctx, 'habit_all_deleted'));
});

bot.action('back_habits', async (ctx) => {
    await ctx.answerCbQuery();
    const habits = getUserHabits(ctx.from.id);
    const today = getToday();
    const buttons = habits.map((h, i) => [Markup.button.callback(`${h.lastDone === today ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)]);
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
    await ctx.editMessageText(t(ctx, 'habit_list'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
});

bot.command('cancel', (ctx) => ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx)));

// ── /link CODE — Connect Telegram to StudentOS account ──────
bot.command('link', async (ctx) => {
    const code = ctx.message.text.split(' ')[1]?.trim();
    if (!code) {
        return ctx.reply('❌ Please provide the code:\n\n<code>/link 123456</code>', { parse_mode: 'HTML' });
    }

    const chatId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name || null;

    try {
        const result = await postToBackend('/api/telegram/link-account', { chatId, username, code });
        if (result.status === 200 && result.body.success) {
            const name = result.body.name || 'there';
            return ctx.reply(
                `✅ <b>Successfully connected to StudentOS!</b>\n\nHello, <b>${name}</b>! Your Telegram is now linked.\n\n💡 <b>Commands:</b>\n/habits — View & toggle today's habits`,
                { parse_mode: 'HTML' }
            );
        }
        if (result.status === 404) {
            return ctx.reply('❌ Invalid or expired code. Please generate a new one from <b>Settings → Integrations</b> in StudentOS.', { parse_mode: 'HTML' });
        }
        if (result.status === 409) {
            return ctx.reply('⚠️ This Telegram account is already connected to a different StudentOS account.');
        }
        return ctx.reply('❌ Something went wrong. Please try again.');
    } catch {
        return ctx.reply('❌ Could not reach StudentOS server. Please try again later.');
    }
});

bot.catch((err, ctx) => { console.error(`Error [${ctx.updateType}]:`, err); ctx.reply(t(ctx, 'error_generic'), mainMenuKb(ctx)); });

// ─── Launch ────────────────────────────────────────────────
bot.launch().then(() => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────────┐');
    console.log('  │   🤖 StudentOS Telegram Bot                 │');
    console.log('  │   🗓  Habit Tracker  🌐 EN / UZ / RU        │');
    console.log('  └─────────────────────────────────────────────┘');
    console.log('');
}).catch((err) => { console.error('Launch failed:', err); process.exit(1); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
