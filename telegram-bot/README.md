# StudentOS Telegram Bot

AI-powered Telegram bot with **Presentation Maker** and **Habit Tracker**.

## Features

### 📊 Presentation Maker

- Multi-step guided flow via inline buttons
- Topic → Slide count → AI generation → `.pptx` file delivery
- Uses OpenAI (`gpt-4o-mini`) for content, `pptxgenjs` for PowerPoint generation
- Professional dark theme slide design

### 🗓 Habit Tracker

- Add/view/delete habits
- Mark habits done daily with a single tap
- 🔥 Streak counting with automatic reset

## Setup

```bash
cd telegram-bot
npm install
cp .env.example .env
# Edit .env with your BOT_TOKEN and OPENAI_API_KEY
npm start
```

## Environment Variables

| Variable         | Required | Description                                                  |
| ---------------- | -------- | ------------------------------------------------------------ |
| `BOT_TOKEN`      | ✅       | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `OPENAI_API_KEY` | ✅       | OpenAI API key                                               |
| `OPENAI_MODEL`   | ❌       | Model to use (default: `gpt-4o-mini`)                        |

## Commands

| Command   | Description                 |
| --------- | --------------------------- |
| `/start`  | Welcome message + main menu |
| `/menu`   | Show main menu              |
| `/help`   | Help & feature descriptions |
| `/cancel` | Cancel current action       |
