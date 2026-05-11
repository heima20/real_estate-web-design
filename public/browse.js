/* ============================================================
   SAIMO Real Estate - وحدة تصفح العقارات (Browse / Listing)
   المشروع النهائي: موقع HTML/CSS/JS أصلي (بدون Backend)
   المميزات: فلترة ديناميكية، بحث، بيانات وهمية محلية، حركات
   مفاهيم DOM: querySelector, createElement, innerHTML, Events
   ============================================================ */

// ── ١. متغيرات الحالة ───────────────────────────────────────
let allProps = [];
let govMap = {};

// ── ٢. مراجع عناصر DOM ──────────────────────────────────────
const grid = document.getElementById("cards-grid");
const countEl = document.getElementById("browse-count");
const qInput = document.getElementById("q");
const locSelect = document.getElementById("loc");
let typeFilter = "";

// ── ٣. بيانات وهمية محلية (Mock Data) ───────────────────────
// بدلاً من API Backend، نستخدم بيانات مخزنة في الكود

const mockGovernorates = [
  { value: "cairo", label: "Cairo" },
  { value: "alex", label: "Alexandria" },
  { value: "giza", label: "Giza" },
  { value: "north_coast", label: "North Coast" },
  { value: "red_sea", label: "Red Sea" }
];

const mockProperties = [
  {
    id: 1,
    title: "Luxury Villa in New Cairo",
    brief: "Stunning 5-bedroom villa with private pool and garden",
    type: "villa",
    governorate: "cairo",
    area_name: "Fifth Settlement",
    beds: 5,
    baths: 4,
    sqm: 450,
    price: 8500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Modern Apartment in Zamalek",
    brief: "Elegant 3-bedroom apartment with Nile view",
    type: "apartment",
    governorate: "cairo",
    area_name: "Zamalek",
    beds: 3,
    baths: 2,
    sqm: 180,
    price: 3200000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Seafront Villa in Sahel",
    brief: "Beachfront villa with panoramic sea views",
    type: "villa",
    governorate: "north_coast",
    area_name: "Hacienda Bay",
    beds: 6,
    baths: 5,
    sqm: 600,
    price: 12000000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Cozy Apartment in Alexandria",
    brief: "Charming 2-bedroom apartment near the Corniche",
    type: "apartment",
    governorate: "alex",
    area_name: "Gleem",
    beds: 2,
    baths: 1,
    sqm: 120,
    price: 1500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=640&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Penthouse in 6th of October",
    brief: "Luxurious penthouse with rooftop terrace",
    type: "apartment",
    governorate: "giza",
    area_name: "6th of October",
    beds: 4,
    baths: 3,
    sqm: 300,
    price: 5500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=640&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Red Sea Resort Villa",
    brief: "Tropical villa steps away from the beach",
    type: "villa",
    governorate: "red_sea",
    area_name: "Hurghada",
    beds: 4,
    baths: 3,
    sqm: 350,
    price: 4200000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=640&h=400&fit=crop"
  }
];

// ── ٤. دوال مساعدة ──────────────────────────────────────────
function typeLabel(t) {
  return t === "villa" ? "Villa" : "Apartment";
}

function govLabel(key) {
  return govMap[key] || key || "";
}

function formatPrice(p) {
  return `${p.price.toLocaleString("en-US")} ${p.currency || "EGP"}`;
}

// ── ٥. دالة العرض ───────────────────────────────────────────
function render(list) {
  if (!grid) return;
  grid.innerHTML = "";
  countEl.textContent = list.length ? `${list.length} properties` : "No results found";
  list.forEach((p) => {
    const gov = govLabel(p.governorate || p.location);
    const el = document.createElement("article");
    el.className = "prop-card";
    el.innerHTML = `
      <a href="property.html?id=${encodeURIComponent(p.id)}" class="prop-card__link">
        <div class="prop-card__media"><img src="${p.cover}" alt="" loading="lazy" width="640" height="400"></div>
        <div class="prop-card__body">
          <span class="prop-card__badge">${typeLabel(p.type)} · ${gov} · ${p.area_name || ""}</span>
          <h2 class="prop-card__title font-display">${p.title}</h2>
          <p class="prop-card__brief">${p.brief}</p>
          <div class="prop-card__meta">${p.beds} beds · ${p.sqm} m²</div>
          <div class="prop-card__price">${formatPrice(p)}</div>
        </div>
      </a>`;
    grid.appendChild(el);
  });
  if (typeof gsap !== "undefined") {
    gsap.from(".prop-card", {
      y: 40, opacity: 0, stagger: 0.06, duration: 0.65, ease: "power2.out",
    });
  }
}

// ── ٦. دالة الفلترة ─────────────────────────────────────────
function filter() {
  const q = (qInput?.value || "").trim();
  const gov = locSelect?.value || "";
  const list = allProps.filter((p) => {
    const g = p.governorate || p.location;
    if (typeFilter && p.type !== typeFilter) return false;
    if (gov && g !== gov) return false;
    if (!q) return true;
    const hay = `${p.title} ${g} ${p.area_name || ""} ${p.brief || ""}`;
    const low = hay.toLowerCase();
    const qq = q.toLowerCase();
    return hay.includes(q) || low.includes(qq);
  });
  render(list);
}

// ── ٧. تعبئة قائمة المحافظات ──────────────────────────────
function fillGovernorates(list) {
  if (!locSelect) return;
  while (locSelect.options.length > 1) locSelect.remove(1);
  list.forEach(({ value, label }) => {
    govMap[value] = label;
    const o = document.createElement("option");
    o.value = value;
    o.textContent = label;
    locSelect.appendChild(o);
  });
}

// ── ٨. مستمعي الأحداث ──────────────────────────────────────
document.querySelectorAll(".chip[data-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    typeFilter = btn.dataset.type || "";
    filter();
  });
});

qInput?.addEventListener("input", filter);
locSelect?.addEventListener("change", filter);

// ── ٩. تحميل البيانات المحلية (بدلاً من API) ───────────────
fillGovernorates(mockGovernorates);
allProps = mockProperties;
filter();
