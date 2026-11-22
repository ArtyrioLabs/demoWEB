(() => {
  const cfg = window.CAFE_CONFIG;
  const categories = window.MENU_CATEGORIES;
  const items = window.MENU_ITEMS;

  let activeCategory = categories[0].id;
  let selectedTime = "Зараз (я в кав'ярні)";
  let selectedPayment = "cash";
  const cart = new Map(); // key: `${itemId}__${variantIndex}`

  const PAYMENT_LABELS = {
    cash: "На касі",
    apple_pay: "Apple Pay (оплачено онлайн · демо)",
    google_pay: "Google Pay (оплачено онлайн · демо)"
  };

  const PAYMENT_CODES = {
    cash: "p0",
    apple_pay: "p1",
    google_pay: "p2"
  };

  // DOM elements
  const wifiSsidEl = document.getElementById("wifiSsid");
  const copyWifiBtn = document.getElementById("copyWifiBtn");
  const categoryTabsEl = document.getElementById("categoryTabs");
  const activeCategoryTitleEl = document.getElementById("activeCategoryTitle");
  const activeCategoryCountEl = document.getElementById("activeCategoryCount");
  const menuListEl = document.getElementById("menuList");

  const cartBarWrapperEl = document.getElementById("cartBarWrapper");
  const cartCountBadgeEl = document.getElementById("cartCountBadge");
  const cartTotalPriceEl = document.getElementById("cartTotalPrice");
  const openCartBtn = document.getElementById("openCartBtn");

  const orderModalBackdropEl = document.getElementById("orderModalBackdrop");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cartItemsListEl = document.getElementById("cartItemsList");
  const timeChipsEl = document.getElementById("timeChips");
  const paymentMethodsEl = document.getElementById("paymentMethods");
  const paymentDemoHintEl = document.getElementById("paymentDemoHint");
  const orderSummaryLabelEl = document.getElementById("orderSummaryLabel");
  const orderCommentEl = document.getElementById("orderComment");
  const modalTotalPriceEl = document.getElementById("modalTotalPrice");
  const submitOrderBtn = document.getElementById("submitOrderBtn");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function initStaticLinks() {
    wifiSsidEl.textContent = cfg.wifi.ssid;
    document.getElementById("mapsReviewLink").href = cfg.mapsUrl;
    document.getElementById("addressMapLink").href = cfg.mapsUrl;
    document.getElementById("instagramLink").href = cfg.instagramUrl;
    const phoneLink = document.getElementById("phoneLink");
    phoneLink.href = cfg.phoneHref;
    phoneLink.textContent = cfg.phoneDisplay;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  copyWifiBtn.addEventListener("click", async () => {
    try {
      await copyText(cfg.wifi.password);
      copyWifiBtn.classList.add("copied");
      copyWifiBtn.textContent = "Скопійовано!";
      showToast("Пароль скопійовано!");
      setTimeout(() => {
        copyWifiBtn.classList.remove("copied");
        copyWifiBtn.textContent = "Скопіювати пароль від Wi-Fi";
      }, 2000);
    } catch {
      showToast(`Пароль: ${cfg.wifi.password}`);
    }
  });

  function getCartKey(itemId, variantIndex) {
    return `${itemId}__${variantIndex}`;
  }

  function changeQty(itemId, variantIndex, delta) {
    const key = getCartKey(itemId, variantIndex);
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const variant = item.variants[variantIndex];
    const existing = cart.get(key);
    const nextQty = (existing ? existing.qty : 0) + delta;

    if (nextQty <= 0) {
      cart.delete(key);
    } else {
      cart.set(key, {
        itemId,
        variantIndex,
        name: item.name,
        variantLabel: variant.label,
        price: variant.price,
        qty: nextQty
      });
    }

    renderMenu();
    updateCartUI();
  }

  function getCartTotals() {
    let count = 0;
    let total = 0;
    for (const entry of cart.values()) {
      count += entry.qty;
      total += entry.price * entry.qty;
    }
    return { count, total };
  }

  function updateCartUI() {
    const { count, total } = getCartTotals();
    cartCountBadgeEl.textContent = String(count);
    cartTotalPriceEl.textContent = `${total} грн`;
    modalTotalPriceEl.textContent = `${total} грн`;

    if (count > 0) {
      cartBarWrapperEl.classList.add("visible");
      cartBarWrapperEl.setAttribute("aria-hidden", "false");
    } else {
      cartBarWrapperEl.classList.remove("visible");
      cartBarWrapperEl.setAttribute("aria-hidden", "true");
      closeModal();
    }

    renderModalCartItems();
    updateSubmitButtonUI();
  }

  function updateSubmitButtonUI() {
    const { total } = getCartTotals();
    submitOrderBtn.classList.remove("apple-pay-btn", "google-pay-btn");

    if (selectedPayment === "apple_pay") {
      orderSummaryLabelEl.textContent = "До сплати онлайн (Apple Pay)";
      paymentDemoHintEl.hidden = false;
      submitOrderBtn.classList.add("apple-pay-btn");
      submitOrderBtn.textContent = `Оплатити та замовити · ${total} грн`;
    } else if (selectedPayment === "google_pay") {
      orderSummaryLabelEl.textContent = "До сплати онлайн (Google Pay)";
      paymentDemoHintEl.hidden = false;
      submitOrderBtn.classList.add("google-pay-btn");
      submitOrderBtn.textContent = `Оплатити та замовити · ${total} грн`;
    } else {
      orderSummaryLabelEl.textContent = "До сплати на касі";
      paymentDemoHintEl.hidden = true;
      submitOrderBtn.textContent = "Оформити замовлення";
    }
  }

  function renderTabs() {
    categoryTabsEl.innerHTML = "";
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `category-tab${cat.id === activeCategory ? " active" : ""}`;
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        activeCategory = cat.id;
        renderTabs();
        renderMenu();
      });
      categoryTabsEl.appendChild(btn);
    });
  }

  function renderMenu() {
    const currentCat = categories.find((c) => c.id === activeCategory);
    const filtered = items.filter((i) => i.category === activeCategory);

    activeCategoryTitleEl.textContent = currentCat ? currentCat.label : "";
    activeCategoryCountEl.textContent = `${filtered.length} поз.`;

    menuListEl.innerHTML = "";
    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "menu-card";

      const badgeHtml = item.badge ? `<span class="menu-badge">${item.badge}</span>` : "";
      const variantsHtml = item.variants
        .map((variant, idx) => {
          const entry = cart.get(getCartKey(item.id, idx));
          const qty = entry ? entry.qty : 0;
          const controlsHtml =
            qty === 0
              ? `<button type="button" class="btn-add" data-action="add" data-id="${item.id}" data-idx="${idx}">+ Додати</button>`
              : `<div class="qty-controls">
                   <button type="button" class="btn-qty" data-action="dec" data-id="${item.id}" data-idx="${idx}" aria-label="Зменшити">−</button>
                   <span class="qty-value">${qty}</span>
                   <button type="button" class="btn-qty plus" data-action="inc" data-id="${item.id}" data-idx="${idx}" aria-label="Збільшити">+</button>
                 </div>`;

          return `
            <div class="variant-row">
              <div class="variant-info">
                <span class="variant-label">${variant.label}</span>
                <span class="variant-price">${variant.price} грн</span>
              </div>
              ${controlsHtml}
            </div>
          `;
        })
        .join("");

      card.innerHTML = `
        <div class="menu-card-top">
          <h3 class="menu-card-title">${item.name}</h3>
          ${badgeHtml}
        </div>
        <p class="menu-card-desc">${item.description}</p>
        <div class="variants-list">${variantsHtml}</div>
      `;

      menuListEl.appendChild(card);
    });
  }

  menuListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const itemId = btn.dataset.id;
    const idx = Number(btn.dataset.idx);
    changeQty(itemId, idx, action === "dec" ? -1 : 1);
  });

  function renderModalCartItems() {
    cartItemsListEl.innerHTML = "";
    for (const entry of cart.values()) {
      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <div>
          <div class="cart-item-name">${entry.name}</div>
          <div class="cart-item-sub">${entry.variantLabel} · ${entry.price} грн</div>
        </div>
        <div class="qty-controls">
          <button type="button" class="btn-qty" data-action="dec" data-id="${entry.itemId}" data-idx="${entry.variantIndex}">−</button>
          <span class="qty-value">${entry.qty}</span>
          <button type="button" class="btn-qty plus" data-action="inc" data-id="${entry.itemId}" data-idx="${entry.variantIndex}">+</button>
        </div>
      `;
      cartItemsListEl.appendChild(row);
    }
  }

  cartItemsListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    changeQty(btn.dataset.id, Number(btn.dataset.idx), btn.dataset.action === "dec" ? -1 : 1);
  });

  function openModal() {
    orderModalBackdropEl.classList.add("open");
    orderModalBackdropEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    orderModalBackdropEl.classList.remove("open");
    orderModalBackdropEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openCartBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  orderModalBackdropEl.addEventListener("click", (e) => {
    if (e.target === orderModalBackdropEl) closeModal();
  });

  timeChipsEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".time-chip");
    if (!chip) return;
    timeChipsEl.querySelectorAll(".time-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    selectedTime = chip.dataset.time;
  });

  paymentMethodsEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".payment-chip");
    if (!chip) return;
    paymentMethodsEl.querySelectorAll(".payment-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    selectedPayment = chip.dataset.payment;
    updateSubmitButtonUI();
  });

  function buildCompactStartPayload() {
    // Формат: o_<itemIdx>-<varIdx>-<qty>_..._t<mins>_p<0|1|2> (до 64 символів для Telegram /start)
    const parts = [];
    for (const entry of cart.values()) {
      const itemIdx = items.findIndex((i) => i.id === entry.itemId);
      if (itemIdx >= 0) {
        parts.push(`${itemIdx}-${entry.variantIndex}-${entry.qty}`);
      }
    }
    const mins = selectedTime.startsWith("Зараз") ? "0" : selectedTime.replace(/\D/g, "") || "5";
    const payCode = PAYMENT_CODES[selectedPayment] || "p0";
    return `o_${parts.join("_")}_t${mins}_${payCode}`;
  }

  function buildOrderText() {
    const { total } = getCartTotals();
    const lines = ["☕ Нове передзамовлення з сайту Same Ta:"];
    for (const entry of cart.values()) {
      lines.push(`• ${entry.name} (${entry.variantLabel}) × ${entry.qty} — ${entry.price * entry.qty} грн`);
    }
    lines.push(`\n⏱ Час готовності: ${selectedTime}`);
    lines.push(`💳 Оплата: ${PAYMENT_LABELS[selectedPayment] || "На касі"}`);
    const comment = orderCommentEl.value.trim();
    if (comment) {
      lines.push(`💬 Коментар: ${comment}`);
    }
    lines.push(`💰 Сума: ${total} грн`);
    return lines.join("\n");
  }

  async function sendViaBotApi(text) {
    const url = `https://api.telegram.org/bot${cfg.telegram.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.telegram.baristaChatId,
        text,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Прийнято", callback_data: "status:accepted" },
              { text: "☕ Готово", callback_data: "status:ready" }
            ]
          ]
        }
      })
    });
    if (!res.ok) throw new Error("Telegram API error");
  }

  submitOrderBtn.addEventListener("click", async () => {
    if (cart.size === 0) return;

    if (selectedPayment !== "cash") {
      submitOrderBtn.disabled = true;
      submitOrderBtn.textContent = "Обробка оплати (демо)...";
      await new Promise((r) => setTimeout(r, 850));
      showToast("Оплату підтверджено (демо)!");
      submitOrderBtn.disabled = false;
      updateSubmitButtonUI();
    }

    const orderText = buildOrderText();

    if (
      cfg.telegram.mode === "bot_api" &&
      cfg.telegram.botToken &&
      cfg.telegram.baristaChatId
    ) {
      submitOrderBtn.disabled = true;
      submitOrderBtn.textContent = "Відправляємо...";
      try {
        await sendViaBotApi(orderText);
        cart.clear();
        orderCommentEl.value = "";
        renderMenu();
        updateCartUI();
        showToast("Замовлення відправлено бариста!");
      } catch {
        showToast("Помилка відправки. Перевірте токен бота.");
      } finally {
        submitOrderBtn.disabled = false;
        updateSubmitButtonUI();
      }
      return;
    }

    // Режим deeplink (безкоштовний хостинг без бекенду)
    const payload = buildCompactStartPayload();
    const botUser = cfg.telegram.botUsername.replace(/^@/, "");
    let tgUrl = `https://t.me/${botUser}`;

    if (payload.length <= 64) {
      tgUrl = `https://t.me/${botUser}?start=${encodeURIComponent(payload)}`;
    } else {
      try {
        await copyText(orderText);
        showToast("Замовлення скопійовано — вставте його в бот");
      } catch {
        // ignore clipboard error
      }
    }

    window.open(tgUrl, "_blank", "noopener,noreferrer");
    showToast("Переходимо в Telegram для підтвердження...");
  });

  // Ініціалізація
  initStaticLinks();
  renderTabs();
  renderMenu();
  updateCartUI();
})();
