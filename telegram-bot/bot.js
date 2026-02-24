/**
 * StudentOS Telegram Bot
 * ─── Enterprise AI Presentation Maker & Habit Tracker ───
 * ─── Multi-language: EN / UZ / RU ───
 *
 * Tech: Telegraf, OpenAI (GPT-4o), pptxgenjs (charts + images), dotenv
 */

require('dotenv').config();

const { Telegraf, Markup, Scenes, session } = require('telegraf');
const OpenAI = require('openai');
const PptxGenJS = require('pptxgenjs');
const https = require('https');

// ─── Validate env ──────────────────────────────────────────
const { BOT_TOKEN, OPENAI_API_KEY } = process.env;
if (!BOT_TOKEN) { console.error('❌ BOT_TOKEN missing'); process.exit(1); }
if (!OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY missing'); process.exit(1); }

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
        btn_presentation: '📊 Presentation Maker',
        btn_habit: '🗓 Habit Tracker',
        btn_help: '❓ Help',
        btn_back: '🔙 Main Menu',
        btn_add_habit: '➕ Add Habit',
        btn_my_habits: '📋 My Habits',
        btn_cancel: '❌ Cancel',
        help_text: '🎓 *StudentOS Bot — Help*\n\n📊 *Presentation Maker* — Enterprise-grade AI presentations with charts, images & deep research (GPT-4o)\n🗓 *Habit Tracker* — Daily habits with streak tracking\n🌐 /lang — Change language',
        pres_ask_topic: '📊 *AI Presentation Maker (GPT-4o)*\n\n🔬 Deep research mode enabled.\n\nSend me the topic for your presentation:',
        pres_ask_slides: '📝 Topic: *{topic}*\n\nHow many slides?',
        pres_btn_5: '5 Slides', pres_btn_10: '10 Slides', pres_btn_15: '15 Slides',
        pres_generating: '⏳ *GPT-4o* is researching *"{topic}"*...\n\n📊 Generating {count} enterprise slides with charts & images.\nThis may take 30–60 seconds.',
        pres_building: '🎨 Assembling PowerPoint with images & charts...',
        pres_done: '✅ *{topic}*\n📊 {count} enterprise slides with charts & HD images!\n\nOpen in PowerPoint or Google Slides.',
        pres_send_text: '❌ Please send a text topic.',
        pres_pick_btn: '👆 Click a button above.',
        pres_error: '❌ Generation failed.\n\n_{error}_',
        pres_quota: '💳 OpenAI quota exceeded.',
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
        btn_presentation: '📊 Prezentatsiya yasash',
        btn_habit: '🗓 Odatlarni kuzatish',
        btn_help: '❓ Yordam',
        btn_back: '🔙 Bosh menyu',
        btn_add_habit: "➕ Odat qo'shish",
        btn_my_habits: '📋 Mening odatlarim',
        btn_cancel: '❌ Bekor qilish',
        help_text: "🎓 *Yordam*\n\n📊 *Prezentatsiya* — GPT-4o, grafiklar va rasmlar bilan\n🗓 *Odatlar* — Kunlik kuzatish\n🌐 /lang — Tilni o'zgartirish",
        pres_ask_topic: "📊 *AI Prezentatsiya (GPT-4o)*\n\n🔬 Chuqur tadqiqot rejimi.\n\nMavzuni yuboring:",
        pres_ask_slides: '📝 Mavzu: *{topic}*\n\nNechta slayd?',
        pres_btn_5: '5 ta slayd', pres_btn_10: '10 ta slayd', pres_btn_15: '15 ta slayd',
        pres_generating: '⏳ *GPT-4o* *"{topic}"* mavzusini tadqiq qilmoqda...\n\n📊 {count} ta slayd yaratilmoqda.\n30–60 soniya kuting.',
        pres_building: '🎨 PowerPoint faylga rasmlar va grafiklar joylashtirilmoqda...',
        pres_done: '✅ *{topic}*\n📊 {count} ta slayd yaratildi!\n\nPowerPoint yoki Google Slides-da oching.',
        pres_send_text: '❌ Matn yuboring.',
        pres_pick_btn: '👆 Tugmani bosing.',
        pres_error: '❌ Xatolik.\n\n_{error}_',
        pres_quota: '💳 OpenAI kvotasi tugadi.',
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
        btn_presentation: '📊 Создание презентаций',
        btn_habit: '🗓 Трекер привычек',
        btn_help: '❓ Помощь',
        btn_back: '🔙 Главное меню',
        btn_add_habit: '➕ Добавить привычку',
        btn_my_habits: '📋 Мои привычки',
        btn_cancel: '❌ Отмена',
        help_text: '🎓 *Помощь*\n\n📊 *Презентации* — GPT-4o, графики и изображения\n🗓 *Привычки* — Ежедневный трекер\n🌐 /lang — Сменить язык',
        pres_ask_topic: '📊 *ИИ Презентации (GPT-4o)*\n\n🔬 Режим глубокого исследования.\n\nОтправьте тему:',
        pres_ask_slides: '📝 Тема: *{topic}*\n\nСколько слайдов?',
        pres_btn_5: '5 слайдов', pres_btn_10: '10 слайдов', pres_btn_15: '15 слайдов',
        pres_generating: '⏳ *GPT-4o* исследует *"{topic}"*...\n\n📊 Генерация {count} слайдов с графиками.\n30–60 секунд.',
        pres_building: '🎨 Сборка PowerPoint с изображениями и графиками...',
        pres_done: '✅ *{topic}*\n📊 {count} слайдов с графиками и HD-изображениями!\n\nОткройте в PowerPoint или Google Slides.',
        pres_send_text: '❌ Отправьте тему текстом.',
        pres_pick_btn: '👆 Нажмите кнопку выше.',
        pres_error: '❌ Ошибка.\n\n_{error}_',
        pres_quota: '💳 Квота OpenAI исчерпана.',
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
    return Markup.keyboard([[t(ctx, 'btn_presentation'), t(ctx, 'btn_habit')], [t(ctx, 'btn_help')]]).resize();
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
//  PPTX ENTERPRISE GENERATOR
// ═══════════════════════════════════════════════════════════

const THEME = {
    bg: '0F172A',
    bgAlt: '1E293B',
    accent: '6366F1',
    accentGlow: '818CF8',
    white: 'FFFFFF',
    muted: '94A3B8',
    light: 'CBD5E1',
    fontFace: 'Segoe UI',
};

const CHART_COLORS = ['6366F1', '22D3EE', 'F472B6', '34D399', 'FBBF24', 'FB7185', 'A78BFA', '2DD4BF'];

/**
 * Fetch image as base64 from Unsplash (free source URL)
 */
function fetchImageBase64(keyword) {
    const url = `https://source.unsplash.com/800x500/?${encodeURIComponent(keyword)}`;

    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 8000);

        const doFetch = (fetchUrl, redirects = 0) => {
            if (redirects > 5) { clearTimeout(timeout); resolve(null); return; }

            https.get(fetchUrl, { headers: { 'User-Agent': 'StudentOS-Bot/1.0' } }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return doFetch(res.headers.location, redirects + 1);
                }
                if (res.statusCode !== 200) { clearTimeout(timeout); resolve(null); return; }

                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    clearTimeout(timeout);
                    const buffer = Buffer.concat(chunks);
                    if (buffer.length < 1000) { resolve(null); return; }
                    resolve(buffer.toString('base64'));
                });
                res.on('error', () => { clearTimeout(timeout); resolve(null); });
            }).on('error', () => { clearTimeout(timeout); resolve(null); });
        };

        doFetch(url);
    });
}

/**
 * Generate enterprise-grade PPTX from structured AI data
 */
async function generateEnterprisePptx(data) {
    const pptx = new PptxGenJS();
    pptx.author = 'StudentOS Bot';
    pptx.title = data.presentation_title;
    pptx.layout = 'LAYOUT_WIDE';

    // ── Title Slide ──
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: THEME.bg };

    // Accent bar top
    titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.06, fill: { color: THEME.accent },
    });

    titleSlide.addText(data.presentation_title, {
        x: 0.8, y: 1.2, w: '80%', h: 2.5,
        fontSize: 40, fontFace: THEME.fontFace, color: THEME.white,
        bold: true, align: 'left', lineSpacingMultiple: 1.1,
    });

    titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 3.8, w: 2.5, h: 0.06, fill: { color: THEME.accent },
    });

    titleSlide.addText('Powered by StudentOS • GPT-4o Deep Research', {
        x: 0.8, y: 4.2, w: '60%', fontSize: 12, fontFace: THEME.fontFace, color: THEME.muted,
    });

    // ── Content Slides ──
    const slides = data.slides || [];

    for (let idx = 0; idx < slides.length; idx++) {
        const sd = slides[idx];
        const layout = sd.layout || 'bullet_points';
        const slide = pptx.addSlide();
        slide.background = { color: THEME.bg };

        // Top accent bar
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 0.04, fill: { color: THEME.accent },
        });

        // Slide number
        slide.addText(`${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`, {
            x: 11.2, y: 0.2, w: 1.5, h: 0.4,
            fontSize: 10, fontFace: THEME.fontFace, color: THEME.muted, align: 'right',
        });

        if (layout === 'data_chart' && sd.chart_data) {
            // ── CHART SLIDE ──
            slide.addText(sd.title || '', {
                x: 0.5, y: 0.3, w: '70%', h: 0.8,
                fontSize: 22, fontFace: THEME.fontFace, color: THEME.white, bold: true,
            });

            const cd = sd.chart_data;
            const chartType = cd.type === 'pie' ? pptx.charts.PIE : pptx.charts.BAR;

            const chartData = [{
                name: 'Data',
                labels: cd.labels || [],
                values: cd.values || [],
            }];

            const chartColors = (cd.labels || []).map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

            slide.addChart(chartType, chartData, {
                x: 0.5, y: 1.4, w: 6.5, h: 4.5,
                showTitle: false,
                showValue: true,
                valueFontSize: 11,
                valueFontColor: THEME.white,
                catAxisLabelColor: THEME.light,
                catAxisLabelFontSize: 10,
                valAxisLabelColor: THEME.muted,
                valAxisLabelFontSize: 9,
                chartColors,
                dataLabelColor: THEME.white,
                dataLabelFontSize: 10,
                showLegend: cd.type === 'pie',
                legendPos: 'b',
                legendColor: THEME.light,
                legendFontSize: 10,
            });

            // Right-side bullet points for chart context
            const points = sd.content || [];
            if (points.length > 0) {
                const bullets = points.map((p) => ({
                    text: p,
                    options: {
                        fontSize: 12, fontFace: THEME.fontFace, color: THEME.light,
                        bullet: { type: 'bullet', color: THEME.accent },
                        paraSpaceAfter: 8, lineSpacingMultiple: 1.3,
                    },
                }));
                slide.addText(bullets, { x: 7.5, y: 1.4, w: 5, h: 4.5, valign: 'top' });
            }

        } else if (layout === 'content_with_image' && sd.image_search_keyword) {
            // ── IMAGE + CONTENT SLIDE ──
            slide.addText(sd.title || '', {
                x: 0.5, y: 0.3, w: '90%', h: 0.8,
                fontSize: 22, fontFace: THEME.fontFace, color: THEME.white, bold: true,
            });

            // Bullet points on left
            const points = sd.content || [];
            const bullets = points.map((p) => ({
                text: p,
                options: {
                    fontSize: 14, fontFace: THEME.fontFace, color: THEME.light,
                    bullet: { type: 'bullet', color: THEME.accent },
                    paraSpaceAfter: 10, lineSpacingMultiple: 1.4,
                },
            }));
            if (bullets.length > 0) {
                slide.addText(bullets, { x: 0.5, y: 1.4, w: 6.5, h: 4.5, valign: 'top' });
            }

            // Image on right (fetched earlier & passed as base64)
            if (sd._imageBase64) {
                slide.addImage({
                    data: `image/jpeg;base64,${sd._imageBase64}`,
                    x: 7.5, y: 1.2, w: 5, h: 4.5,
                    rounding: true,
                });
            } else {
                // Fallback placeholder
                slide.addShape(pptx.ShapeType.rect, {
                    x: 7.5, y: 1.2, w: 5, h: 4.5,
                    fill: { color: THEME.bgAlt }, rectRadius: 0.2,
                });
                slide.addText('📷', {
                    x: 7.5, y: 2.8, w: 5, h: 1.5,
                    fontSize: 48, align: 'center', color: THEME.muted,
                });
            }

        } else {
            // ── BULLET POINTS SLIDE (default) ──
            slide.addText(sd.title || '', {
                x: 0.5, y: 0.3, w: '90%', h: 0.8,
                fontSize: 24, fontFace: THEME.fontFace, color: THEME.white, bold: true,
            });

            slide.addShape(pptx.ShapeType.rect, {
                x: 0.5, y: 1.15, w: 2, h: 0.05, fill: { color: THEME.accent },
            });

            const points = sd.content || sd.bullet_points || [];
            const bullets = points.map((p) => ({
                text: p,
                options: {
                    fontSize: 15, fontFace: THEME.fontFace, color: THEME.light,
                    bullet: { type: 'bullet', color: THEME.accent },
                    paraSpaceAfter: 12, lineSpacingMultiple: 1.4,
                },
            }));
            if (bullets.length > 0) {
                slide.addText(bullets, { x: 0.5, y: 1.5, w: '90%', h: 4.5, valign: 'top' });
            }
        }
    }

    // ── Closing Slide ──
    const endSlide = pptx.addSlide();
    endSlide.background = { color: THEME.bg };
    endSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.06, fill: { color: THEME.accent },
    });
    endSlide.addText('Thank You', {
        x: 0, y: 2.0, w: '100%', h: 1.5,
        fontSize: 44, fontFace: THEME.fontFace, color: THEME.white, bold: true, align: 'center',
    });
    endSlide.addText('Generated with StudentOS Bot • GPT-4o', {
        x: 0, y: 3.8, w: '100%',
        fontSize: 13, fontFace: THEME.fontFace, color: THEME.muted, align: 'center',
    });

    return await pptx.write({ outputType: 'nodebuffer' });
}

// ═══════════════════════════════════════════════════════════
//  PRESENTATION WIZARD SCENE
// ═══════════════════════════════════════════════════════════
const presentationScene = new Scenes.WizardScene(
    'presentation-wizard',

    async (ctx) => {
        await ctx.reply(t(ctx, 'pres_ask_topic'), { parse_mode: 'Markdown', ...cancelKb(ctx) });
        return ctx.wizard.next();
    },

    async (ctx) => {
        const text = ctx.message?.text;
        if (!text || text === t(ctx, 'btn_cancel')) {
            await ctx.reply(t(ctx, 'cancelled'), mainMenuKb(ctx));
            return ctx.scene.leave();
        }
        ctx.wizard.state.topic = text;
        await ctx.reply(t(ctx, 'pres_ask_slides', { topic: text }), {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback(t(ctx, 'pres_btn_5'), 'slides_5'),
                Markup.button.callback(t(ctx, 'pres_btn_10'), 'slides_10'),
                Markup.button.callback(t(ctx, 'pres_btn_15'), 'slides_15'),
            ]),
        });
        return ctx.wizard.next();
    },

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
        // ── GPT-4o Deep Research Call ──
        const langInstruction = lang === 'uz'
            ? 'Write ALL content (titles, bullet points, narratives) in Uzbek language.'
            : lang === 'ru'
                ? 'Write ALL content (titles, bullet points, narratives) in Russian language.'
                : 'Write all content in English.';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.7,
            max_tokens: 4096,
            messages: [
                {
                    role: 'system',
                    content: `You are an Expert Data Analyst & Presentation Designer. You produce enterprise-grade, deeply researched presentations. Use real statistics, compelling narratives, and professional business language. Include actionable insights.

${langInstruction}

Return ONLY valid JSON (no markdown fences, no extra text). Use this exact structure:
{
  "presentation_title": "A compelling, concise title",
  "slides": [
    {
      "layout": "bullet_points",
      "title": "Slide Headline",
      "content": ["Deep insight with data", "Another researched point with %", "Actionable recommendation"],
      "image_search_keyword": null,
      "chart_data": null
    },
    {
      "layout": "content_with_image",
      "title": "Visual Slide Title",
      "content": ["Key point 1", "Key point 2", "Key point 3"],
      "image_search_keyword": "specific 1-2 word query for stock photo",
      "chart_data": null
    },
    {
      "layout": "data_chart",
      "title": "Chart: Metric Comparison",
      "content": ["Explanation of chart data", "Key takeaway"],
      "image_search_keyword": null,
      "chart_data": {
        "type": "bar",
        "labels": ["Category A", "Category B", "Category C"],
        "values": [45, 80, 25]
      }
    }
  ]
}

Rules:
- Use "bullet_points" for most slides.
- Include 2-3 "content_with_image" slides with highly specific image_search_keyword (e.g. "remote work", "data analytics", "startup funding").
- Include 1-2 "data_chart" slides with realistic data. chart_data.type can be "bar" or "pie".
- Each slide MUST have 3-4 content points.
- Make content data-driven with real statistics where possible.
- Total ${slideCount} slides (not counting title/end slides).`,
                },
                {
                    role: 'user',
                    content: `Create an enterprise-grade presentation about: "${topic}"`,
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content?.trim();
        if (!raw) throw new Error('Empty AI response');

        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const presData = JSON.parse(cleaned);

        if (!presData.slides || !Array.isArray(presData.slides) || presData.slides.length === 0) {
            throw new Error('Invalid presentation data');
        }

        // ── Fetch images in parallel ──
        await ctx.telegram.editMessageText(
            ctx.chat.id, statusMsg.message_id, undefined, t(ctx, 'pres_building')
        );

        const imagePromises = presData.slides.map(async (sd) => {
            if (sd.layout === 'content_with_image' && sd.image_search_keyword) {
                sd._imageBase64 = await fetchImageBase64(sd.image_search_keyword);
            }
        });
        await Promise.all(imagePromises);

        // ── Generate PPTX ──
        const pptxBuffer = await generateEnterprisePptx(presData);
        const safeName = topic.replace(/[^a-zA-Z0-9\u0400-\u04FF ]/g, '').trim().replace(/\s+/g, '_');

        await ctx.replyWithDocument(
            { source: pptxBuffer, filename: `${safeName || 'Presentation'}.pptx` },
            {
                caption: t(ctx, 'pres_done', { topic: presData.presentation_title, count: presData.slides.length }),
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
const stage = new Scenes.Stage([presentationScene, addHabitScene]);
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
bot.hears([i18n.en.btn_presentation, i18n.uz.btn_presentation, i18n.ru.btn_presentation], (ctx) => ctx.scene.enter('presentation-wizard'));
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
bot.catch((err, ctx) => { console.error(`Error [${ctx.updateType}]:`, err); ctx.reply(t(ctx, 'error_generic'), mainMenuKb(ctx)); });

// ─── Launch ────────────────────────────────────────────────
bot.launch().then(() => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────────────────┐');
    console.log('  │   🤖 StudentOS Telegram Bot — Enterprise Edition   │');
    console.log('  │   📊 GPT-4o Presentations (Charts + HD Images)     │');
    console.log('  │   🗓  Habit Tracker  🌐 EN / UZ / RU               │');
    console.log('  └─────────────────────────────────────────────────────┘');
    console.log('');
}).catch((err) => { console.error('Launch failed:', err); process.exit(1); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
