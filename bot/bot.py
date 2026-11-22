import asyncio
import logging
import os
from typing import Optional

from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message
from dotenv import load_dotenv

from menu_data import CATEGORIES, MENU_ITEMS, PICKUP_TIMES

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
BARISTA_CHAT_ID = os.getenv("BARISTA_CHAT_ID", "0")

logging.basicConfig(level=logging.INFO)
router = Router()

# Тимчасове сховище підтверджених чернеток замовлень із сайту (key: user_id)
PENDING_SITE_ORDERS: dict[int, str] = {}


def categories_keyboard() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=title, callback_data=f"cat:{cat_id}")]
        for cat_id, title in CATEGORIES.items()
    ]
    rows.append([InlineKeyboardButton(text="📍 Адреса та графік", callback_data="info:contacts")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def items_keyboard(cat_id: str) -> InlineKeyboardMarkup:
    rows = []
    for idx, item in enumerate(MENU_ITEMS):
        if item["category"] != cat_id:
            continue
        min_price = min(v[1] for v in item["variants"])
        rows.append([
            InlineKeyboardButton(
                text=f"{item['name']} · від {min_price} грн",
                callback_data=f"item:{idx}",
            )
        ])
    rows.append([InlineKeyboardButton(text="⬅️ Назад до категорій", callback_data="back:cats")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def variants_keyboard(item_idx: int) -> InlineKeyboardMarkup:
    item = MENU_ITEMS[item_idx]
    rows = []
    for v_idx, (label, price) in enumerate(item["variants"]):
        rows.append([
            InlineKeyboardButton(
                text=f"{label} — {price} грн",
                callback_data=f"var:{item_idx}:{v_idx}",
            )
        ])
    rows.append([InlineKeyboardButton(text="⬅️ Назад", callback_data=f"cat:{item['category']}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def pickup_time_keyboard(item_idx: int, v_idx: int) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=f"⏱ {t}", callback_data=f"time:{item_idx}:{v_idx}:{t_idx}")]
        for t_idx, t in enumerate(PICKUP_TIMES)
    ]
    rows.append([InlineKeyboardButton(text="⬅️ Змінити об'єм", callback_data=f"item:{item_idx}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def barista_status_keyboard(guest_id: int, accepted: bool = False) -> InlineKeyboardMarkup:
    buttons = []
    if not accepted:
        buttons.append(
            InlineKeyboardButton(text="✅ Прийнято", callback_data=f"status:accepted:{guest_id}")
        )
    buttons.append(
        InlineKeyboardButton(text="☕ Готово", callback_data=f"status:ready:{guest_id}")
    )
    return InlineKeyboardMarkup(inline_keyboard=[buttons])


def decode_site_payload(payload: str) -> Optional[str]:
    """Розбирає компактний payload формату o_2-0-1_10-0-1_t10_p1 із сайту."""
    if not payload.startswith("o_"):
        return None
    parts = payload[2:].split("_")
    if not parts:
        return None

    payment_map = {
        "p0": "На касі",
        "p1": "Apple Pay (оплачено онлайн · демо)",
        "p2": "Google Pay (оплачено онлайн · демо)",
    }
    payment_label = "На касі"
    if parts and parts[-1] in payment_map:
        payment_label = payment_map[parts[-1]]
        parts = parts[:-1]

    mins = "5"
    if parts and parts[-1].startswith("t"):
        mins = parts[-1][1:] or "5"
        parts = parts[:-1]

    lines = []
    total = 0
    for token in parts:
        try:
            item_idx_s, var_idx_s, qty_s = token.split("-")
            item = MENU_ITEMS[int(item_idx_s)]
            label, price = item["variants"][int(var_idx_s)]
            qty = int(qty_s)
            subtotal = price * qty
            total += subtotal
            lines.append(f"• {item['name']} ({label}) × {qty} — {subtotal} грн")
        except (ValueError, IndexError):
            continue

    if not lines:
        return None

    time_label = "Зараз (гість у кав'ярні)" if mins == "0" else f"Через {mins} хв"
    return (
        "☕ Замовлення з QR-сайту:\n"
        + "\n".join(lines)
        + f"\n\n⏱ Час готовності: {time_label}\n💳 Оплата: {payment_label}\n💰 Сума: {total} грн"
    )


async def send_order_to_barista(bot: Bot, guest: Message | CallbackQuery, order_text: str) -> None:
    user = guest.from_user
    guest_name = user.full_name if user else "Гість"
    username = f" (@{user.username})" if user and user.username else ""
    guest_id = user.id if user else 0

    barista_msg = f"🆕 Нове замовлення!\n👤 Гість: {guest_name}{username}\n\n{order_text}"

    try:
        chat_id = int(BARISTA_CHAT_ID)
    except ValueError:
        chat_id = 0

    if chat_id == 0:
        logging.warning("BARISTA_CHAT_ID не налаштовано (заглушка). Замовлення:\n%s", barista_msg)
        return

    await bot.send_message(
        chat_id=chat_id,
        text=barista_msg,
        reply_markup=barista_status_keyboard(guest_id),
    )


@router.message(CommandStart())
async def cmd_start(message: Message, command: CommandObject) -> None:
    if command.args:
        decoded = decode_site_payload(command.args)
        if decoded and message.from_user:
            PENDING_SITE_ORDERS[message.from_user.id] = decoded
            kb = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="✅ Підтвердити та відправити бариста", callback_data="site:confirm")],
                    [InlineKeyboardButton(text="🔄 Обрати інше в боті", callback_data="back:cats")],
                ]
            )
            await message.answer(
                f"Перевірте ваше передзамовлення в **Same Ta**:\n\n{decoded}",
                reply_markup=kb,
                parse_mode="Markdown",
            )
            return

    await message.answer(
        "Вітаємо у кав'ярні **Same Ta** (Бровари, вул. Василя Симоненка, 105) ☕\n\n"
        "Оберіть категорію, щоб оформити передзамовлення у 3 кліки:",
        reply_markup=categories_keyboard(),
        parse_mode="Markdown",
    )


@router.callback_query(F.data == "site:confirm")
async def confirm_site_order(callback: CallbackQuery, bot: Bot) -> None:
    user_id = callback.from_user.id
    order_text = PENDING_SITE_ORDERS.pop(user_id, None)
    if not order_text:
        await callback.answer("Замовлення вже відправлено або застаріло.", show_alert=True)
        return

    await send_order_to_barista(bot, callback, order_text)
    await callback.message.edit_text(
        f"✅ Замовлення передано бариста!\n\n{order_text}\n\nМи повідомимо вас, коли все буде готово."
    )
    await callback.answer("Відправлено!")


@router.callback_query(F.data == "back:cats")
async def back_to_categories(callback: CallbackQuery) -> None:
    await callback.message.edit_text(
        "Оберіть категорію меню **Same Ta** ☕:",
        reply_markup=categories_keyboard(),
        parse_mode="Markdown",
    )
    await callback.answer()


@router.callback_query(F.data == "info:contacts")
async def show_contacts(callback: CallbackQuery) -> None:
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="⬅️ Назад до меню", callback_data="back:cats")]]
    )
    await callback.message.edit_text(
        "📍 **Same Ta — Бровари**\n"
        "Адреса: вул. Василя Симоненка, 105\n"
        "Графік: Пн–Пт 08:00–21:00 · Сб–Нд 09:00–21:00\n"
        "Телефон: +380 63 234 63 68",
        reply_markup=kb,
        parse_mode="Markdown",
    )
    await callback.answer()


@router.callback_query(F.data.startswith("cat:"))
async def select_category(callback: CallbackQuery) -> None:
    cat_id = callback.data.split(":", 1)[1]
    cat_title = CATEGORIES.get(cat_id, "Меню")
    await callback.message.edit_text(
        f"**{cat_title}** — оберіть позицію:",
        reply_markup=items_keyboard(cat_id),
        parse_mode="Markdown",
    )
    await callback.answer()


@router.callback_query(F.data.startswith("item:"))
async def select_item(callback: CallbackQuery) -> None:
    item_idx = int(callback.data.split(":", 1)[1])
    item = MENU_ITEMS[item_idx]
    await callback.message.edit_text(
        f"**{item['name']}**\nОберіть об'єм або порцію:",
        reply_markup=variants_keyboard(item_idx),
        parse_mode="Markdown",
    )
    await callback.answer()


@router.callback_query(F.data.startswith("var:"))
async def select_variant(callback: CallbackQuery) -> None:
    _, item_idx_s, v_idx_s = callback.data.split(":")
    item_idx, v_idx = int(item_idx_s), int(v_idx_s)
    item = MENU_ITEMS[item_idx]
    label, price = item["variants"][v_idx]
    await callback.message.edit_text(
        f"**{item['name']}** ({label} — {price} грн)\nКоли ви підійдете за замовленням?",
        reply_markup=pickup_time_keyboard(item_idx, v_idx),
        parse_mode="Markdown",
    )
    await callback.answer()


@router.callback_query(F.data.startswith("time:"))
async def select_time(callback: CallbackQuery, bot: Bot) -> None:
    _, item_idx_s, v_idx_s, t_idx_s = callback.data.split(":")
    item = MENU_ITEMS[int(item_idx_s)]
    label, price = item["variants"][int(v_idx_s)]
    pickup_time = PICKUP_TIMES[int(t_idx_s)]

    order_text = (
        f"• {item['name']} ({label}) × 1 — {price} грн\n"
        f"⏱ Час готовності: {pickup_time}\n"
        f"💰 Сума: {price} грн"
    )
    await send_order_to_barista(bot, callback, order_text)

    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="☕ Замовити ще", callback_data="back:cats")]]
    )
    await callback.message.edit_text(
        f"✅ Замовлення прийнято в обробку!\n\n{order_text}\n\nЧекаємо на вас у Same Ta!",
        reply_markup=kb,
    )
    await callback.answer("Замовлення відправлено!")


@router.callback_query(F.data.startswith("status:"))
async def barista_update_status(callback: CallbackQuery, bot: Bot) -> None:
    _, status_key, guest_id_s = callback.data.split(":")
    guest_id = int(guest_id_s)
    original_text = callback.message.text or ""

    if status_key == "accepted":
        new_text = f"{original_text}\n\n📌 Статус: Прийнято в роботу"
        await callback.message.edit_text(new_text, reply_markup=barista_status_keyboard(guest_id, accepted=True))
        if guest_id:
            try:
                await bot.send_message(guest_id, "✅ Бариста прийняв ваше замовлення в роботу!")
            except Exception:
                pass
        await callback.answer("Позначено як «Прийнято»")
    elif status_key == "ready":
        new_text = f"{original_text}\n\n✨ Статус: Готово! Можна видавати."
        await callback.message.edit_text(new_text, reply_markup=None)
        if guest_id:
            try:
                await bot.send_message(guest_id, "☕ Ваше замовлення готове! Чекаємо на вас у Same Ta.")
            except Exception:
                pass
        await callback.answer("Позначено як «Готово»")


async def main() -> None:
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        logging.warning("Вкажіть реальний BOT_TOKEN у файлі bot/.env перед запуском.")
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
