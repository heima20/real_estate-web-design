/* ============================================================
   SAIMO Real Estate - وحدة الصفحة الرئيسية (Home Page)
   المشروع النهائي: موقع HTML/CSS/JS أصلي (بدون Backend)
   المميزات: Hero Animations، ساعة رقمية، تأثيرات Scroll،
             عقارات مميزة (بيانات وهمية)، تمرير سلس
   مفاهيم DOM: querySelector, createElement, setInterval, Events
   ============================================================ */

// تسجيل إضافات GSAP للحركات المرتبطة بالتمرير
gsap.registerPlugin(ScrollTrigger);

// ── ١. مساعدات حركة النص (تعديل DOM) ────────────────────────

/**
 * تغليف كل حرف في span لتحريكه حرف بحرف
 * @param {Element} el - العنصر المراد معالجته
 * @returns {Array} مصفوفة عناصر span
 */
function wrapChars(el) {
  const text = el.textContent.trim();
  el.textContent = "";
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.className = "split-char";
    span.textContent = text[i] === " " ? "\u00a0" : text[i];
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

/**
 * تغليف كل كلمة في span لتحريكها كلمة بكلمة
 * @param {Element} el - العنصر المراد معالجته
 * @returns {Array} مصفوفة عناصر span
 */
function wrapWords(el) {
  const parts = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  const words = [];
  parts.forEach((w, i) => {
    const span = document.createElement("span");
    span.className = "split-word";
    span.textContent = w;
    el.appendChild(span);
    if (i < parts.length - 1) el.appendChild(document.createTextNode(" "));
    words.push(span);
  });
  return words;
}

// ── ٢. الساعة الرقمية (المطلوب: Clock + setInterval) ────────
// هذا يحقق متطلب المشروع لمفهوم DOM/Event للساعة

/**
 * إنشاء وتحديث ساعة رقمية
 * يستخدم setInterval للتحديث كل ثانية - مفهوم أساسي في JS
 */
function initClock() {
  let clockContainer = document.getElementById("digital-clock");
  if (!clockContainer) {
    clockContainer = document.createElement("div");
    clockContainer.id = "digital-clock";
    clockContainer.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; z-index: 9999;
      background: rgba(0,0,0,0.7); color: #fff; padding: 10px 16px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(clockContainer);
  }

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric"
    });
    clockContainer.innerHTML = `
      <div style="font-size:18px; font-weight:bold;">${hours}:${minutes}:${seconds}</div>
      <div style="font-size:11px; opacity:0.8; margin-top:2px;">${dateStr}</div>
    `;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initClock);
} else {
  initClock();
}

// ── ٣. عداد الزيارات (localStorage + DOM) ────────────────────
function initVisitorCounter() {
  let visits = parseInt(localStorage.getItem("saimo_visits") || "0");
  visits++;
  localStorage.setItem("saimo_visits", visits);
  console.log(`Welcome! You have visited this site ${visits} time(s).`);
}
initVisitorCounter();

// ── ٤. التمرير السلس (Lenis) ───────────────────────────────
const lenis = new Lenis({
  duration: 1.6,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);

// ── ٥. تأثير Header عند التمرير ─────────────────────────────
const siteHeader = document.getElementById("site-header");
lenis.on("scroll", () => {
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", lenis.scroll > 40);
  }
});

// ── ٦. حركات قسم Hero ───────────────────────────────────────
const titleChars = wrapChars(document.querySelector("#title"));
const subtitleWords = wrapWords(document.querySelector("#subtitle"));

gsap.timeline({ defaults: { ease: "expo.out" } })
  .from(".hero-frame", { scale: 1.08, opacity: 0, duration: 1.4 }, 0)
  .from(".overlay--home", { opacity: 0, duration: 1.15 }, 0)
  .from(".hero-shine", { opacity: 0, xPercent: 40, duration: 2, ease: "power2.inOut" }, 0.1)
  .from(".home-eyebrow", {
    y: -80, opacity: 0, letterSpacing: "1.2em", filter: "blur(10px)", duration: 1.4
  }, 0.15)
  .from(titleChars, {
    opacity: 0, y: 200, rotationX: -88,
    rotationZ: () => gsap.utils.random(-18, 18),
    stagger: { each: 0.028, from: "random" },
    duration: 2.1, ease: "back.out(1.9)",
  }, "-=0.9")
  .from(subtitleWords, { opacity: 0, y: 60, x: 50, stagger: 0.11, duration: 1.3, ease: "power3.out" }, "-=1.1")
  .from(".hero-actions .btn", { y: 50, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out" }, "-=0.85")
  .from(".scroll-hint", { opacity: 0, y: 40, duration: 1 }, "-=0.7");

gsap.to(".hero--home video", {
  scale: 1.2, yPercent: 22, ease: "none",
  scrollTrigger: { trigger: ".hero--home", start: "top top", end: "bottom top", scrub: 2.2, pin: true },
});

gsap.to(".hero--home .content", {
  y: -80, opacity: 0.15, scale: 0.94, ease: "none",
  scrollTrigger: { trigger: ".hero--home", start: "top top", end: "bottom top", scrub: 0.95 },
});

// ── ٧. حركة عداد الإحصائيات ──────────────────────────────────
gsap.from("#home-strip", {
  y: 60, opacity: 0, duration: 1.2, ease: "power3.out",
  scrollTrigger: { trigger: "#home-strip", start: "top 92%", once: true },
});

document.querySelectorAll(".home-strip__n[data-count]").forEach((el) => {
  const max = parseInt(el.dataset.count, 10);
  const o = { v: 0 };
  gsap.to(o, {
    v: max, duration: 2.4, ease: "power2.out",
    scrollTrigger: { trigger: "#home-strip", start: "top 88%", once: true },
    onUpdate: () => { el.textContent = Math.round(o.v); },
  });
});

// ── ٨. عرض العقارات المميزة (بيانات وهمية) ───────────────────

/**
 * عرض بطاقات العقارات المميزة
 * @param {Array} list - مصفوفة بيانات العقارات
 * @param {Object} govMap - ربط أسماء المحافظات
 */
function renderFeatured(list, govMap) {
  const grid = document.getElementById("featured-grid");
  if (!grid || !list?.length) return;
  grid.innerHTML = "";
  list.slice(0, 3).forEach((p) => {
    const gov = (govMap && govMap[p.governorate || p.location]) || p.location || "";
    const a = document.createElement("a");
    a.href = `property.html?id=${encodeURIComponent(p.id)}`;
    a.className = "featured-card";
    a.innerHTML = `
      <div class="featured-card__img"><img src="${p.cover}" alt="" loading="lazy" width="800" height="520"></div>
      <div class="featured-card__body">
        <span class="featured-card__tag">${p.type === "villa" ? "Villa" : "Apartment"} · ${gov} · ${p.area_name || ""}</span>
        <h3 class="featured-card__title font-display">${p.title}</h3>
        <p class="featured-card__brief">${p.brief}</p>
        <span class="featured-card__price">${p.price.toLocaleString("en-US")} ${p.currency || "EGP"}</span>
      </div>`;
    grid.appendChild(a);
  });

  gsap.from(".featured-card", {
    y: 100, opacity: 0, rotationX: 10, transformOrigin: "50% 100%",
    stagger: 0.18, duration: 1.25, ease: "power4.out",
    scrollTrigger: { trigger: "#featured-grid", start: "top 86%", once: true },
  });
}

// ── ٩. بيانات وهمية محلية للصفحة الرئيسية ────────────────────
const homeGovMap = {
  cairo: "Cairo",
  north_coast: "North Coast",
  red_sea: "Red Sea"
};

const homeFeatured = [
  {
    id: 1,
    title: "Luxury Villa in New Cairo",
    brief: "Stunning 5-bedroom villa with private pool and garden",
    type: "villa",
    governorate: "cairo",
    area_name: "Fifth Settlement",
    price: 8500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=520&fit=crop"
  },
  {
    id: 3,
    title: "Seafront Villa in Sahel",
    brief: "Beachfront villa with panoramic sea views",
    type: "villa",
    governorate: "north_coast",
    area_name: "Hacienda Bay",
    price: 12000000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=520&fit=crop"
  },
  {
    id: 6,
    title: "Red Sea Resort Villa",
    brief: "Tropical villa steps away from the beach",
    type: "villa",
    governorate: "red_sea",
    area_name: "Hurghada",
    price: 4200000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=520&fit=crop"
  }
];

// تحميل العقارات المميزة مباشرة بدون API
renderFeatured(homeFeatured, homeGovMap);

// ── ١٠. حركات دخول الأقسام ───────────────────────────────────
gsap.from(".section--home-featured .section-head > *", {
  y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out",
  scrollTrigger: { trigger: ".section--home-featured", start: "top 78%", once: true },
});

gsap.from(".home-cta-row", {
  y: 40, opacity: 0, duration: 1, ease: "power2.out",
  scrollTrigger: { trigger: ".home-cta-row", start: "top 90%", once: true },
});

window.addEventListener("load", () => ScrollTrigger.refresh());
