# Same Ta (Бровари) — QR-меню та Telegram-бот передзамовлень

Демонстраційний MVP-проєкт для кав'ярні **Same Ta** (м. Бровари, вул. Василя Симоненка, 105).

## Структура
- `site/` — мобільний односторінковий сайт-меню (HTML/CSS/JS, український інтерфейс, без бекенду).
- `bot/` — Telegram-бот на Python (`aiogram 3`) для передзамовлень у 3 кліки та прийому замовлень із сайту.

## 1. Налаштування сайту (`site/menu.js`)
Усі демо-дані (Wi-Fi, позиції меню, Instagram, username бота) зібрані в `site/menu.js`:
- Для деплою на **GitHub Pages** або **Vercel** вкажіть кореневу папку `site/` (або перенесіть її вміст у корінь репозиторію).
- У `CAFE_CONFIG.telegram.botUsername` вкажіть username створеного бота (без `@`).
- За замовчуванням увімкнено режим `"deeplink"`: сайт кодує кошик у посилання `t.me/<bot>?start=o_...` і відкриває бота без жодного бекенду.

## 2. Запуск Telegram-бота (`bot/`)
```bash
cd bot
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
```
Заповніть у `bot/.env`:
- `BOT_TOKEN` — токен від `@BotFather`
- `BARISTA_CHAT_ID` — ID робочого чату або Telegram-акаунту бариста

Запуск:
```bash
python bot.py
```
