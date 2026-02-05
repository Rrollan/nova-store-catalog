const products = [
  {
    id: 1,
    name: "AirWave Pro",
    price: 12990,
    description: "Беспроводные наушники с активным шумоподавлением.",
    tags: ["наушники", "bluetooth", "anc"],
    keywords: ["наушники с шумоподавлением", "bluetooth наушники", "anc"],
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Luma Headset",
    price: 8990,
    description: "Чистый звук и мягкая посадка для длительной работы.",
    tags: ["гарнитура", "звук", "комфорт"],
    keywords: ["гарнитура для работы", "наушники для звонков"],
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Pulse Speaker",
    price: 5990,
    description: "Компактная акустика с мощным басом.",
    tags: ["акустика", "бас", "портативная"],
    keywords: ["портативная колонка", "компактная акустика"],
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Cloud Pad",
    price: 15990,
    description: "Планшет для креативных задач и заметок.",
    tags: ["планшет", "творчество", "стилус"],
    keywords: ["планшет для рисования", "планшет для заметок"],
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Zen Charge",
    price: 3490,
    description: "Элегантная беспроводная зарядка на каждый день.",
    tags: ["зарядка", "qi", "минимализм"],
    keywords: ["беспроводная зарядка qi", "зарядка для iphone"],
    image: "",
  },
  {
    id: 6,
    name: "Aurora Watch",
    price: 21990,
    description: "Смарт-часы с ярким дисплеем и трекингом активности.",
    tags: ["смарт-часы", "фитнес", "здоровье"],
    keywords: ["умные часы", "смарт-часы для спорта"],
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80",
  },
];

const state = {
  search: "",
  selectedId: null,
  admin: false,
  editId: null,
};

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const toastContainer = document.getElementById("toastContainer");
const schemaData = document.getElementById("schemaData");
const leadModal = document.getElementById("leadModal");
const leadForm = document.getElementById("leadForm");
const leadProduct = document.getElementById("leadProduct");
const leadName = document.getElementById("leadName");
const leadPhone = document.getElementById("leadPhone");
const leadSuccess = document.getElementById("leadSuccess");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editName = document.getElementById("editName");
const editDesc = document.getElementById("editDesc");
const editPrice = document.getElementById("editPrice");
const editImage = document.getElementById("editImage");
const editKeywords = document.getElementById("editKeywords");
const editTags = document.getElementById("editTags");
const editImageFile = document.getElementById("editImageFile");
const catalogTitle = document.getElementById("catalogTitle");
const currency = new Intl.NumberFormat("ru-RU");
const TELEGRAM = {
  token: "8539494261:AAGOs8q6LXkkW0evtMRXAiiAvlDK0OiyjFM",
  chatId: "1345815453",
};
const ADMIN_PASSWORD = "админ";
const ADMIN_ARM_WINDOW_MS = 12000;

let adminClickCount = 0;
let adminArmTimeout = null;
let adminArmed = false;

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function openModal(modal) {
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function getFilteredProducts() {
  const term = state.search.toLowerCase().trim();
  return products
    .filter((item) => {
      if (!term) return true;
      const haystack = [
        item.name,
        item.description,
        ...(item.tags || []),
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => a.id - b.id);
}

function renderSchema(data) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: data.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        image: item.image || undefined,
        description: item.description,
        keywords: item.keywords?.join(", "),
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  schemaData.textContent = JSON.stringify(schema, null, 2);
}

function createPlaceholder() {
  const div = document.createElement("div");
  div.className = "placeholder";
  div.innerHTML = "<span>⌁</span>";
  return div;
}

function renderProducts() {
  const data = getFilteredProducts();
  grid.innerHTML = "";

  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${index * 0.05}s`;
    card.addEventListener("click", () => openLead(item));

    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        img.replaceWith(createPlaceholder());
      });
      card.appendChild(img);
    } else {
      card.appendChild(createPlaceholder());
    }

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = item.name;

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = item.description;

    const tags = document.createElement("div");
    tags.className = "tag-list";
    (item.tags || []).forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.textContent = tag;
      tags.appendChild(tagEl);
    });

    const price = document.createElement("div");
    price.className = "card-price";
    price.textContent = `${currency.format(item.price)} ₽`;

    card.appendChild(title);
    card.appendChild(desc);
    if (item.tags && item.tags.length) card.appendChild(tags);
    card.appendChild(price);

    if (state.admin) {
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.type = "button";
      editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
        </svg>
      `;
      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openEdit(item);
      });
      card.appendChild(editBtn);
    }

    grid.appendChild(card);
  });

  renderSchema(data);
}

function openLead(item) {
  state.selectedId = item.id;
  leadProduct.textContent = `${item.name} • ${currency.format(item.price)} ₽`;
  leadForm.reset();
  leadSuccess.classList.remove("active");
  leadSuccess.setAttribute("aria-hidden", "true");
  leadForm.style.display = "grid";
  openModal(leadModal);
}

function openEdit(item) {
  state.editId = item.id;
  editName.value = item.name;
  editDesc.value = item.description;
  editPrice.value = item.price;
  editImage.value = item.image;
  editImageFile.value = "";
  editKeywords.value = (item.keywords || []).join(", ");
  editTags.value = (item.tags || []).join(", ");
  openModal(editModal);
}

async function handleEditSubmit(event) {
  event.preventDefault();
  const item = products.find((p) => p.id === state.editId);
  if (!item) return;

  item.name = editName.value.trim();
  item.description = editDesc.value.trim();
  item.price = Number(editPrice.value);
  item.image = editImage.value.trim();
  item.keywords = editKeywords.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  item.tags = editTags.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (editImageFile.files && editImageFile.files[0]) {
    const file = editImageFile.files[0];
    item.image = await readFileAsDataUrl(file);
  }

  closeModal(editModal);
  renderProducts();
  showToast("Товар обновлен");
}

async function handleLeadSubmit(event) {
  event.preventDefault();
  const item = products.find((p) => p.id === state.selectedId);
  if (!item) return;

  const name = leadName.value.trim();
  const phone = leadPhone.value.trim();
  const message = `Новая заявка\nТовар: ${item.name}\nИмя: ${name}\nТелефон: ${phone}`;

  const sent = await sendLeadToTelegram(message);
  if (sent) {
    leadForm.style.display = "none";
    leadSuccess.classList.add("active");
    leadSuccess.setAttribute("aria-hidden", "false");
  }
}

async function sendLeadToTelegram(message) {
  if (!TELEGRAM.token || !TELEGRAM.chatId) {
    showToast("Укажите Telegram token и chatId в app.js");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM.chatId,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      showToast("Не удалось отправить заявку");
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    showToast("Ошибка отправки");
    return false;
  }
}

searchInput.addEventListener("input", (event) => {
  const value = event.target.value.trim();
  if (adminArmed && value.toLowerCase() === ADMIN_PASSWORD) {
    state.admin = true;
    adminArmed = false;
    adminClickCount = 0;
    clearTimeout(adminArmTimeout);
    searchInput.value = "";
    state.search = "";
    renderProducts();
    showToast("Админ режим включен");
    return;
  }

  state.search = value;
  renderProducts();
});

leadForm.addEventListener("submit", handleLeadSubmit);
editForm.addEventListener("submit", handleEditSubmit);

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7");
  const parts = digits.startsWith("7") ? digits.slice(1, 11) : digits.slice(0, 10);
  const a = parts.slice(0, 3);
  const b = parts.slice(3, 6);
  const c = parts.slice(6, 8);
  const d = parts.slice(8, 10);
  let result = "+7";
  if (a.length) result += ` (${a}`;
  if (a.length === 3) result += ")";
  if (b.length) result += ` ${b}`;
  if (c.length) result += `-${c}`;
  if (d.length) result += `-${d}`;
  return result;
}

leadPhone.addEventListener("input", (event) => {
  const cursorStart = event.target.selectionStart;
  const before = event.target.value;
  event.target.value = formatPhone(event.target.value);
  const after = event.target.value;
  if (cursorStart !== null) {
    const diff = after.length - before.length;
    event.target.setSelectionRange(cursorStart + diff, cursorStart + diff);
  }
});

leadPhone.addEventListener("focus", (event) => {
  if (!event.target.value) event.target.value = "+7 ";
});

leadPhone.addEventListener("blur", (event) => {
  if (event.target.value === "+7 ") event.target.value = "";
});

leadModal.addEventListener("click", (event) => {
  const closeTarget = event.target.dataset.close;
  if (closeTarget === "lead") closeModal(leadModal);
});

editModal.addEventListener("click", (event) => {
  const closeTarget = event.target.dataset.close;
  if (closeTarget === "edit") closeModal(editModal);
});

catalogTitle.addEventListener("click", () => {
  adminClickCount += 1;
  if (adminClickCount === 5) {
    adminArmed = true;
    showToast("Введите пароль в поиск");
    clearTimeout(adminArmTimeout);
    adminArmTimeout = setTimeout(() => {
      adminArmed = false;
      adminClickCount = 0;
    }, ADMIN_ARM_WINDOW_MS);
  }
});

renderProducts();
