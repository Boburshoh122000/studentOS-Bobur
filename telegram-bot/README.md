# StudentOS Telegram Bot

Telegram bot for StudentOS — habit tracking and account integration.

## Features

### 🗓 Habit Tracker

- Add / view / delete habits
- Mark habits done daily with a single tap
- 🔥 Streak counting with automatic reset
- Multi-language: 🇬🇧 English / 🇺🇿 O'zbek / 🇷🇺 Русский

### 🔗 StudentOS Account Linking

- Generate a link code in **Settings → Integrations** on StudentOS
- Send `/link 123456` to the bot to connect your account
- Receive notifications and manage habits via Telegram

## Setup

```bash
cd telegram-bot
npm install
cp .env.example .env
# Edit .env with your BOT_TOKEN, OPENAI_API_KEY, and BACKEND_URL
npm start
```

## Environment Variables

| Variable         | Required | Description                                                  |
| ---------------- | -------- | ------------------------------------------------------------ |
| `BOT_TOKEN`      | Yes      | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `OPENAI_API_KEY` | Yes      | OpenAI API key                                               |
| `OPENAI_MODEL`   | No       | Model to use (default: `gpt-4o-mini`)                        |
| `BACKEND_URL`    | Yes      | StudentOS backend URL (e.g. `https://api.studentos.uz`)      |

## Commands

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `/start`     | Welcome message + language selection |
| `/menu`      | Show main menu                       |
| `/help`      | Help & feature descriptions          |
| `/link CODE` | Connect your StudentOS account       |
| `/cancel`    | Cancel current action                |
