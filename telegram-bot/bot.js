/**
 * StudentOS Telegram Bot
 * ─── AI Presentation Maker & Habit Tracker ───
 * ─── Multi-language: EN / UZ / RU ───
 *
 * Tech: Telegraf, OpenAI, pptxgenjs, dotenv
 */

require('dotenv').config();

const { Telegraf, Markup, Scenes, session } = require('telegraf');
const OpenAI = require('openai');
const PptxGenJS = require('pptxgenjs');

// ─── Validate env ──────────────────────────────────────────
const { BOT_TOKEN, OPENAI_API_KEY, OPENAI_MODEL = 'gpt-4o-mini' } = process.env;

if (!BOT_TOKEN) { console.error('❌ BOT_TOKEN missing'); process.exit(1); }
if (!OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY missing'); process.exit(1); }

// ─── Clients ───────────────────────────────────────────────
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new Telegraf(BOT_TOKEN);

// ─── In-memory Habit Store ─────────────────────────────────
const habitsStore = new Map();
function getUserHabits(userId) {
    if (!habitsStore.has(userId)) habitsStore.set(userId, []);
    return habitsStore.get(userId);
}
function getToday() { return new Date().toISOString().slice(0, 10); }

// ─── i18n Translations ────────────────────────────────────
const i18n = {
    en: {
        lang_chosen: '🇬🇧 Language set to English!',
        welcome: "🎓 *StudentOS Bot*\n\nChoose a tool to get started:",
        btn_presentation: '📊 Presentation Maker',
        btn_habit: '🗓 Habit Tracker',
        btn_help: '❓ Help',
        btn_back: '🔙 Main Menu',
        btn_add_habit: '➕ Add Habit',
        btn_my_habits: '📋 My Habits',
        btn_cancel: '❌ Cancel',
        help_text: '🎓 *StudentOS Bot — Help*\n\n📊 *Presentation Maker* — AI-powered PowerPoint creation\n🗓 *Habit Tracker* — Daily habits with streak tracking\n🌐 /lang — Change language\n\nUse the buttons at the bottom to navigate!',
        // Presentation
        pres_ask_topic: '📊 *AI Presentation Maker*\n\nSend me the topic for your presentation:',
        pres_ask_slides: '📝 Topic: *{topic}*\n\nHow many slides do you want?',
        pres_btn_5: '5 Slides',
        pres_btn_10: '10 Slides',
        pres_btn_15: '15 Slides',
        pres_generating: '⏳ Generating a *{count}-slide* presentation about *"{topic}"*...\n\nThis may take 20–30 seconds.',
        pres_building: '🎨 Building your PowerPoint file...',
        pres_done: '✅ *{topic}*\n{count} slides generated!\n\nOpen in PowerPoint or Google Slides.',
        pres_send_text: '❌ Please send a text topic.',
        pres_pick_btn: '👆 Please click one of the buttons above.',
        pres_error: '❌ Something went wrong.\n\n_{error}_',
        pres_quota: '💳 OpenAI quota exceeded. Check your API billing.',
        cancelled: '❌ Cancelled.',
        // Habits
        habit_ask_name: '➕ *Add a new habit*\n\nSend me the name of the habit:',
        habit_too_long: '❌ Too long. Keep it under 100 characters.',
        habit_exists: '⚠️ You already have *"{name}"*.',
        habit_added: '✅ Habit *"{name}"* added!\n\n🔥 Streak: 0 days',
        habit_empty: '📋 You have no habits yet!\n\nTap ➕ Add Habit to create one.',
        habit_list: '📋 *Your Habits*\n\nTap to mark done for today:',
        habit_delete_title: '🗑 *Delete a Habit*\n\nTap to remove:',
        habit_delete_btn: '🗑 Delete a Habit',
        habit_all_deleted: '🗑 All habits deleted.',
        habit_back: '⬅️ Back',
        // General
        error_generic: '⚠️ An unexpected error occurred. Use /start to restart.',
        choose_lang: '🌐 Choose your language / Tilni tanlang / Выберите язык:',
    },
    uz: {
        lang_chosen: "🇺🇿 Til o'zbek tiliga o'zgartirildi!",
        welcome: "🎓 *StudentOS Bot*\n\nBoshlash uchun vositani tanlang:",
        btn_presentation: '📊 Prezentatsiya yasash',
        btn_habit: '🗓 Odatlarni kuzatish',
        btn_help: '❓ Yordam',
        btn_back: "🔙 Bosh menyu",
        btn_add_habit: "➕ Odat qo'shish",
        btn_my_habits: '📋 Mening odatlarim',
        btn_cancel: '❌ Bekor qilish',
        help_text: "🎓 *StudentOS Bot — Yordam*\n\n📊 *Prezentatsiya yasash* — AI yordamida PowerPoint yaratish\n🗓 *Odatlarni kuzatish* — Kunlik odatlar va streak\n🌐 /lang — Tilni o'zgartirish\n\nPastdagi tugmalar orqali foydalaning!",
        pres_ask_topic: '📊 *AI Prezentatsiya*\n\nPrezentatsiya mavzusini yuboring:',
        pres_ask_slides: '📝 Mavzu: *{topic}*\n\nNechta slayd kerak?',
        pres_btn_5: '5 ta slayd',
        pres_btn_10: '10 ta slayd',
        pres_btn_15: '15 ta slayd',
        pres_generating: '⏳ *"{topic}"* mavzusida *{count} ta slayd* yaratilmoqda...\n\n20–30 soniya kutib turing.',
        pres_building: '🎨 PowerPoint fayli yaratilmoqda...',
        pres_done: '✅ *{topic}*\n{count} ta slayd yaratildi!\n\nPowerPoint yoki Google Slides-da oching.',
        pres_send_text: '❌ Iltimos, matn shaklida mavzu yuboring.',
        pres_pick_btn: '👆 Iltimos, yuqoridagi tugmalardan birini bosing.',
        pres_error: '❌ Xatolik yuz berdi.\n\n_{error}_',
        pres_quota: '💳 OpenAI kvotasi tugadi. Hisobingizni tekshiring.',
        cancelled: '❌ Bekor qilindi.',
        habit_ask_name: "➕ *Yangi odat qo'shish*\n\nOdat nomini yuboring:",
        habit_too_long: '❌ Juda uzun. 100 belgidan kam bo\'lsin.',
        habit_exists: '⚠️ Sizda allaqachon *"{name}"* bor.',
        habit_added: '✅ *"{name}"* odati qo\'shildi!\n\n🔥 Streak: 0 kun',
        habit_empty: "📋 Sizda hali odatlar yo'q!\n\n➕ Odat qo'shish tugmasini bosing.",
        habit_list: '📋 *Odatlaringiz*\n\nBugun bajarilganini belgilang:',
        habit_delete_title: "🗑 *Odatni o'chirish*\n\nO'chirish uchun bosing:",
        habit_delete_btn: "🗑 Odatni o'chirish",
        habit_all_deleted: "🗑 Barcha odatlar o'chirildi.",
        habit_back: '⬅️ Orqaga',
        error_generic: '⚠️ Kutilmagan xatolik. /start buyrug\'ini yuboring.',
        choose_lang: "🌐 Tilni tanlang / Choose your language / Выберите язык:",
    },
    ru: {
        lang_chosen: '🇷🇺 Язык изменён на русский!',
        welcome: '🎓 *StudentOS Bot*\n\nВыберите инструмент:',
        btn_presentation: '📊 Создание презентаций',
        btn_habit: '🗓 Трекер привычек',
        btn_help: '❓ Помощь',
        btn_back: '🔙 Главное меню',
        btn_add_habit: '➕ Добавить привычку',
        btn_my_habits: '📋 Мои привычки',
        btn_cancel: '❌ Отмена',
        help_text: '🎓 *StudentOS Bot — Помощь*\n\n📊 *Создание презентаций* — PowerPoint с помощью ИИ\n🗓 *Трекер привычек* — Ежедневные привычки со стриками\n🌐 /lang — Сменить язык\n\nИспользуйте кнопки внизу экрана!',
        pres_ask_topic: '📊 *ИИ Презентации*\n\nОтправьте тему для презентации:',
        pres_ask_slides: '📝 Тема: *{topic}*\n\nСколько слайдов сделать?',
        pres_btn_5: '5 слайдов',
        pres_btn_10: '10 слайдов',
        pres_btn_15: '15 слайдов',
        pres_generating: '⏳ Создаю *{count} слайдов* на тему *"{topic}"*...\n\nЭто займёт 20–30 секунд.',
        pres_building: '🎨 Собираю файл PowerPoint...',
        pres_done: '✅ *{topic}*\nСоздано {count} слайдов!\n\nОткройте в PowerPoint или Google Slides.',
        pres_send_text: '❌ Пожалуйста, отправьте тему текстом.',
        pres_pick_btn: '👆 Нажмите одну из кнопок выше.',
        pres_error: '❌ Произошла ошибка.\n\n_{error}_',
        pres_quota: '💳 Квота OpenAI исчерпана. Проверьте баланс.',
        cancelled: '❌ Отменено.',
        habit_ask_name: '➕ *Новая привычка*\n\nОтправьте название привычки:',
        habit_too_long: '❌ Слишком длинное. Не больше 100 символов.',
        habit_exists: '⚠️ У вас уже есть *"{name}"*.',
        habit_added: '✅ Привычка *"{name}"* добавлена!\n\n🔥 Стрик: 0 дней',
        habit_empty: '📋 У вас пока нет привычек!\n\nНажмите ➕ Добавить привычку.',
        habit_list: '📋 *Ваши привычки*\n\nНажмите, чтобы отметить выполнение:',
        habit_delete_title: '🗑 *Удалить привычку*\n\nНажмите для удаления:',
        habit_delete_btn: '🗑 Удалить привычку',
        habit_all_deleted: '🗑 Все привычки удалены.',
        habit_back: '⬅️ Назад',
        error_generic: '⚠️ Произошла ошибка. Используйте /start.',
        choose_lang: '🌐 Choose your language / Tilni tanlang / Выберите язык:',
    },
};

// ─── i18n helpers ──────────────────────────────────────────
function t(ctx, key, params = {}) {
    const lang = ctx.session?.lang || 'en';
    let text = i18n[lang]?.[key] || i18n.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, v);
    }
    return text;
}

function getLang(ctx) {
    return ctx.session?.lang || 'en';
}

function mainMenuKb(ctx) {
    return Markup.keyboard([
        [t(ctx, 'btn_presentation'), t(ctx, 'btn_habit')],
        [t(ctx, 'btn_help')],
    ]).resize();
}

function habitMenuKb(ctx) {
    return Markup.keyboard([
        [t(ctx, 'btn_add_habit'), t(ctx, 'btn_my_habits')],
        [t(ctx, 'btn_back')],
    ]).resize();
}

function cancelKb(ctx) {
    return Markup.keyboard([[t(ctx, 'btn_cancel')]]).resize();
}

const langSelectKb = Markup.inlineKeyboard([
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
    [Markup.button.callback("🇺🇿 O'zbekcha", 'lang_uz')],
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
]);

// ─── PPTX Theme ────────────────────────────────────────────
const THEME = {
    bg: '0F172A', accent: '6366F1', white: 'FFFFFF', muted: 'CBD5E1', fontFace: 'Segoe UI',
};

async function generatePptxBuffer(topic, slides) {
    const pptx = new PptxGenJS();
    pptx.author = 'StudentOS Bot';
    pptx.title = topic;
    pptx.layout = 'LAYOUT_WIDE';

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: THEME.bg };
    titleSlide.addText(topic, {
        x: 0.8, y: 1.5, w: '85%', h: 2,
        fontSize: 36, fontFace: THEME.fontFace, color: THEME.white, bold: true, align: 'left',
    });
    titleSlide.addText('Generated by StudentOS Bot', {
        x: 0.8, y: 4.0, w: '50%', fontSize: 14, fontFace: THEME.fontFace, color: THEME.muted,
    });
    titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 3.6, w: 2.0, h: 0.06, fill: { color: THEME.accent },
    });

    slides.forEach((sd, idx) => {
        const slide = pptx.addSlide();
        slide.background = { color: THEME.bg };
        slide.addText(`${String(idx + 1).padStart(2, '0')}`, {
            x: 0.5, y: 0.3, w: 0.8, h: 0.5,
            fontSize: 13, fontFace: THEME.fontFace, color: THEME.accent, bold: true,
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 0.85, w: 1.5, h: 0.05, fill: { color: THEME.accent },
        });
        slide.addText(sd.title || `Slide ${idx + 1}`, {
            x: 0.5, y: 1.0, w: '90%', h: 0.8,
            fontSize: 24, fontFace: THEME.fontFace, color: THEME.white, bold: true,
        });
        const bullets = (sd.bullet_points || []).map((bp) => ({
            text: bp,
            options: {
                fontSize: 15, fontFace: THEME.fontFace, color: THEME.muted,
                bullet: { type: 'bullet', color: THEME.accent },
                paraSpaceAfter: 10, lineSpacingMultiple: 1.3,
            },
        }));
        if (bullets.length > 0) {
            slide.addText(bullets, { x: 0.5, y: 2.0, w: '88%', h: 3.5, valign: 'top' });
        }
    });

    return await pptx.write({ outputType: 'nodebuffer' });
}

// ─── SCENE: Presentation Maker ─────────────────────────────
const presentationScene = new Scenes.WizardScene(
    'presentation-wizard',

    // Step 0 → ask topic
    async (ctx) => {
        await ctx.reply(t(ctx, 'pres_ask_topic'), { parse_mode: 'Markdown', ...cancelKb(ctx) });
        return ctx.wizard.next();
    },

    // Step 1 → receive topic, ask slide count
    async (ctx) => {
        const text = ctx.message?.text;
        if (!text || text === t(ctx, 'btn_cancel')) {
            await ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx));
            return ctx.scene.leave();
        }
        ctx.wizard.state.topic = text;

        await ctx.reply(
            t(ctx, 'pres_ask_slides', { topic: text }),
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback(t(ctx, 'pres_btn_5'), 'slides_5'),
                    Markup.button.callback(t(ctx, 'pres_btn_10'), 'slides_10'),
                    Markup.button.callback(t(ctx, 'pres_btn_15'), 'slides_15'),
                ]),
            }
        );
        return ctx.wizard.next();
    },

    // Step 2 → placeholder
    async (ctx) => {
        if (ctx.message?.text === t(ctx, 'btn_cancel')) {
            await ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx));
            return ctx.scene.leave();
        }
        await ctx.reply(t(ctx, 'pres_pick_btn'));
    }
);

presentationScene.action(/slides_(\d+)/, async (ctx) => {
    const slideCount = parseInt(ctx.match[1], 10);
    const topic = ctx.wizard.state.topic;
    const lang = getLang(ctx);

    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup();

    const statusMsg = await ctx.reply(
        t(ctx, 'pres_generating', { count: slideCount, topic }),
        { parse_mode: 'Markdown' }
    );

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.7,
            max_tokens: 3000,
            messages: [
                {
                    role: 'system',
                    content: `You are an expert presentation creator. Create a structured outline. Return ONLY valid JSON — no markdown, no code fences. Return a JSON array where each object has "title" (string) and "bullet_points" (array of 3-4 concise strings). ${lang === 'uz' ? 'Write all content in Uzbek.' : lang === 'ru' ? 'Write all content in Russian.' : 'Write all content in English.'}`,
                },
                {
                    role: 'user',
                    content: `Create a professional presentation about "${topic}" with exactly ${slideCount} slides.`,
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content?.trim();
        if (!raw) throw new Error('Empty AI response');

        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const slidesData = JSON.parse(cleaned);
        if (!Array.isArray(slidesData) || slidesData.length === 0) throw new Error('Invalid data');

        await ctx.telegram.editMessageText(
            ctx.chat.id, statusMsg.message_id, undefined, t(ctx, 'pres_building')
        );

        const pptxBuffer = await generatePptxBuffer(topic, slidesData);
        const safeName = topic.replace(/[^a-zA-Z0-9\u0400-\u04FF\u0600-\u06FF ]/g, '').trim().replace(/\s+/g, '_');

        await ctx.replyWithDocument(
            { source: pptxBuffer, filename: `${safeName || 'Presentation'}.pptx` },
            {
                caption: t(ctx, 'pres_done', { topic, count: slidesData.length }),
                parse_mode: 'Markdown',
                ...mainMenuKb(ctx),
            }
        );
        try { await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id); } catch { }
    } catch (err) {
        console.error('Presentation failed:', err);
        const errMsg = err.code === 'insufficient_quota'
            ? t(ctx, 'pres_quota')
            : t(ctx, 'pres_error', { error: err.message || 'Unknown' });
        await ctx.reply(errMsg, { parse_mode: 'Markdown', ...mainMenuKb(ctx) });
    }
    return ctx.scene.leave();
});

presentationScene.hears(/❌/, async (ctx) => {
    await ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx));
    return ctx.scene.leave();
});

// ─── SCENE: Add Habit ──────────────────────────────────────
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
        if (name.length > 100) {
            await ctx.reply(t(ctx, 'habit_too_long'));
            return;
        }
        const userId = ctx.from.id;
        const habits = getUserHabits(userId);
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

// ─── Scene Stage ───────────────────────────────────────────
const stage = new Scenes.Stage([presentationScene, addHabitScene]);

bot.use(session());
bot.use(stage.middleware());

// ─── Helpers ───────────────────────────────────────────────
async function sendMainMenu(ctx) {
    await ctx.reply(t(ctx, 'welcome'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) });
}

async function showHabitList(ctx) {
    const userId = ctx.from.id;
    const habits = getUserHabits(userId);
    if (habits.length === 0) {
        return ctx.reply(t(ctx, 'habit_empty'), habitMenuKb(ctx));
    }
    const today = getToday();
    const buttons = habits.map((h, idx) => {
        const done = h.lastDone === today;
        return [Markup.button.callback(`${done ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${idx}`)];
    });
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
    await ctx.reply(t(ctx, 'habit_list'), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
}

// ─── /start — Language selection ───────────────────────────
bot.start(async (ctx) => {
    ctx.session ??= {};
    await ctx.reply(
        `👋 *Welcome / Xush kelibsiz / Добро пожаловать!*\n\n${i18n.en.choose_lang}`,
        { parse_mode: 'Markdown', ...langSelectKb }
    );
});

// ─── /lang — Change language ───────────────────────────────
bot.command('lang', async (ctx) => {
    await ctx.reply(t(ctx, 'choose_lang'), langSelectKb);
});

// ─── Language selection actions ────────────────────────────
bot.action(/lang_(en|uz|ru)/, async (ctx) => {
    const lang = ctx.match[1];
    ctx.session ??= {};
    ctx.session.lang = lang;

    await ctx.answerCbQuery(i18n[lang].lang_chosen);
    await ctx.editMessageText(i18n[lang].lang_chosen);
    await sendMainMenu(ctx);
});

// ─── /menu & /help ─────────────────────────────────────────
bot.command('menu', sendMainMenu);
bot.command('help', async (ctx) => {
    await ctx.reply(t(ctx, 'help_text'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) });
});

// ─── Main Menu buttons (match ALL 3 languages) ────────────
// Presentation
bot.hears([
    i18n.en.btn_presentation,
    i18n.uz.btn_presentation,
    i18n.ru.btn_presentation,
], (ctx) => ctx.scene.enter('presentation-wizard'));

// Habit Tracker
bot.hears([
    i18n.en.btn_habit,
    i18n.uz.btn_habit,
    i18n.ru.btn_habit,
], async (ctx) => {
    await ctx.reply(
        t(ctx, 'welcome').includes('Habit') ? '🗓 *Habit Tracker*' :
            t(ctx, 'welcome').includes('Одат') ? '🗓 *Odatlarni kuzatish*' :
                '🗓 *Трекер привычек*',
        { parse_mode: 'Markdown', ...habitMenuKb(ctx) }
    );
});

// Help
bot.hears([
    i18n.en.btn_help,
    i18n.uz.btn_help,
    i18n.ru.btn_help,
], async (ctx) => {
    await ctx.reply(t(ctx, 'help_text'), { parse_mode: 'Markdown', ...mainMenuKb(ctx) });
});

// Back to main menu
bot.hears([
    i18n.en.btn_back,
    i18n.uz.btn_back,
    i18n.ru.btn_back,
], sendMainMenu);

// ─── Habit sub-menu buttons (ALL 3 languages) ─────────────
bot.hears([
    i18n.en.btn_add_habit,
    i18n.uz.btn_add_habit,
    i18n.ru.btn_add_habit,
], (ctx) => ctx.scene.enter('add-habit-wizard'));

bot.hears([
    i18n.en.btn_my_habits,
    i18n.uz.btn_my_habits,
    i18n.ru.btn_my_habits,
], showHabitList);

// ─── Habit Inline Actions ──────────────────────────────────
bot.action(/toggle_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const habits = getUserHabits(userId);
    const idx = parseInt(ctx.match[1], 10);
    if (idx >= habits.length) return;

    const habit = habits[idx];
    const today = getToday();

    if (habit.lastDone === today) {
        habit.streak = Math.max(0, habit.streak - 1);
        habit.lastDone = null;
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yd = yesterday.toISOString().slice(0, 10);
        habit.streak = (habit.lastDone === yd || habit.streak === 0) ? habit.streak + 1 : 1;
        habit.lastDone = today;
    }

    const buttons = habits.map((h, i) => {
        const done = h.lastDone === today;
        return [Markup.button.callback(`${done ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)];
    });
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);

    try {
        await ctx.editMessageText(t(ctx, 'habit_list'), {
            parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons),
        });
    } catch { }
});

bot.action('delete_menu', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const habits = getUserHabits(userId);
    if (habits.length === 0) return ctx.reply(t(ctx, 'habit_empty'), habitMenuKb(ctx));

    const buttons = habits.map((h, idx) => [
        Markup.button.callback(`🗑 ${h.name}`, `del_${idx}`),
    ]);
    buttons.push([Markup.button.callback(t(ctx, 'habit_back'), 'back_habits')]);

    await ctx.editMessageText(t(ctx, 'habit_delete_title'), {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons),
    });
});

bot.action(/del_(\d+)/, async (ctx) => {
    const userId = ctx.from.id;
    const habits = getUserHabits(userId);
    const idx = parseInt(ctx.match[1], 10);
    if (idx >= habits.length) return ctx.answerCbQuery('Not found');

    const removed = habits.splice(idx, 1)[0];
    await ctx.answerCbQuery(`Deleted "${removed.name}"`);

    if (habits.length > 0) {
        const today = getToday();
        const buttons = habits.map((h, i) => {
            const done = h.lastDone === today;
            return [Markup.button.callback(`${done ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)];
        });
        buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
        await ctx.editMessageText(t(ctx, 'habit_list'), {
            parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons),
        });
    } else {
        await ctx.editMessageText(t(ctx, 'habit_all_deleted'));
    }
});

bot.action('back_habits', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const habits = getUserHabits(userId);
    const today = getToday();
    const buttons = habits.map((h, i) => {
        const done = h.lastDone === today;
        return [Markup.button.callback(`${done ? '✅' : '⬜'} ${h.name}  (🔥${h.streak})`, `toggle_${i}`)];
    });
    buttons.push([Markup.button.callback(t(ctx, 'habit_delete_btn'), 'delete_menu')]);
    await ctx.editMessageText(t(ctx, 'habit_list'), {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons),
    });
});

// ─── Global cancel ─────────────────────────────────────────
bot.command('cancel', async (ctx) => {
    await ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx));
});

// ─── Error handling ────────────────────────────────────────
bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}:`, err);
    ctx.reply(t(ctx, 'error_generic'), mainMenuKb(ctx));
});

// ─── Launch ────────────────────────────────────────────────
bot.launch()
    .then(() => {
        console.log('');
        console.log('  ┌──────────────────────────────────────────────┐');
        console.log('  │   🤖 StudentOS Telegram Bot is running       │');
        console.log('  │   Presentation Maker ✅  Habit Tracker ✅     │');
        console.log('  │   Languages: 🇬🇧 EN  🇺🇿 UZ  🇷🇺 RU             │');
        console.log('  └──────────────────────────────────────────────┘');
        console.log('');
    })
    .catch((err) => { console.error('Launch failed:', err); process.exit(1); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
