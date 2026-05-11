/* ============================================================
   SAIMO Real Estate - وحدة القصة / من نحن (Story / About Page)
   المشروع النهائي: موقع HTML/CSS/JS أصلي
   المميزات: حركة الحروف، Parallax Scrolling، عداد إحصائيات،
             تأثيرات المعرض، نموذج التواصل، تمرير سلس
   مفاهيم DOM: querySelector، createElement، addEventListener،
               setInterval (ضمنياً في العدادات)، Event Delegation
   ============================================================ */

// تسجيل إضافات GSAP
gsap.registerPlugin(ScrollTrigger);

// ── ١. مساعد حركة الحروف ────────────────────────────────────

/**
 * تغليف كل حرف في span للتحكم فيه فردياً
 * @param {Element} el - العنصر المستهدف
 * @returns {Array} مصفوفة عناصر span المنشأة
 */
function wrapChars(el) {
  if (!el) return [];
  const text = el.textContent.trim();
  el.textContent = ""; // مسح النص الأصلي
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.className = "split-char split-char--story";
    span.textContent = text[i] === " " ? "\u00a0" : text[i];
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

// ── ٢. إعداد التمرير السلس (Lenis) ────────────────────────
const lenis = new Lenis({
  duration: 1.55,
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

// ── ٣. حالة Header عند التمرير (Event Listener) ─────────────
const siteHeader = document.getElementById("site-header");
lenis.on("scroll", () => {
  // تبديل الكلاس حسب موضع التمرير
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", lenis.scroll > 60);
  }
});

// ── ٤. حركات قسم Hero ───────────────────────────────────────
const storyTitleChars = wrapChars(document.querySelector("#story-title"));

// Master entrance timeline
gsap.timeline({ defaults: { ease: "power3.out" } })
  .from(".story-hero__bg img", { scale: 1.18, duration: 2.2, ease: "power2.out" }, 0)
  .from(".story-hero__veil", { opacity: 0.4, duration: 1.2 }, 0)
  .from(".story-hero__kicker", { y: 30, opacity: 0, letterSpacing: "0.8em", duration: 1.1 }, 0.2)
  .from(storyTitleChars, { opacity: 0, x: -70, filter: "blur(12px)", stagger: 0.045, duration: 1.35, ease: "power4.out" }, "-=0.6")
  .from("#story-lead", { opacity: 0, y: 40, clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "power2.inOut" }, "-=0.5");

// ── ٥. تأثيرات Parallax عند التمرير ─────────────────────────
gsap.to(".story-hero__bg img", { yPercent: 18, scale: 1.06, ease: "none",
  scrollTrigger: { trigger: ".story-hero", start: "top top", end: "bottom top", scrub: 1.2 },
});

gsap.to(".story-hero__content", { y: -40, opacity: 0.25, ease: "none",
  scrollTrigger: { trigger: ".story-hero", start: "top top", end: "bottom top", scrub: 0.8 },
});

// ── ٦. حركات دخول الأقسام ───────────────────────────────────
gsap.utils.toArray(".page-story .section").forEach((sec) => {
  gsap.fromTo(sec, { opacity: 0, x: 80, clipPath: "inset(0 0 0 12%)" },
    { opacity: 1, x: 0, clipPath: "inset(0 0 0 0%)", duration: 1.5, ease: "power4.out", immediateRender: false,
      scrollTrigger: { trigger: sec, start: "top 88%", once: true },
    });
});

// ── ٧. حركات العناوين ───────────────────────────────────────
document.querySelectorAll(".page-story .section h2").forEach((h) => {
  if (h.closest("#about")) {
    gsap.fromTo(h, { opacity: 0, scale: 0.92, filter: "blur(6px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: "#about", start: "top 75%", once: true },
      });
    return;
  }
  gsap.fromTo(h, { opacity: 0, y: 36, skewX: 8 },
    { opacity: 1, y: 0, skewX: 0, duration: 1.05, ease: "power3.out",
      scrollTrigger: { trigger: h, start: "top 84%", once: true } });
});

gsap.fromTo("#about-lead", { opacity: 0, y: 36 },
  { opacity: 1, y: 0, duration: 1.15, ease: "power2.out",
    scrollTrigger: { trigger: "#about-lead", start: "top 86%", once: true } });

// ── ٨. حركة عداد الإحصائيات ─────────────────────────────────
// توضح العد التصاعدي - تأثير بصري مهم في DOM
const specsEl = document.querySelector("#specs");
document.querySelectorAll("#specs .stat").forEach((stat, i) => {
  const num = stat.querySelector(".stat-num");
  if (!num || !specsEl) return;
  const target = parseInt(num.dataset.value, 10);
  const obj = { val: 0 }; // كائن لتحريكه بـ GSAP
  const st = { trigger: specsEl, start: "top 78%", once: true };
  // حركة دخول حاوية الإحصائية
  gsap.from(stat, { opacity: 0, x: -40, duration: 0.8, delay: i * 0.1, ease: "power2.out", scrollTrigger: st });
  // حركة العد التصاعدي للرقم
  gsap.to(obj, { val: target, duration: 2, ease: "power2.out", delay: 0.1 + i * 0.1, scrollTrigger: st,
    onUpdate: () => { num.textContent = Math.round(obj.val).toLocaleString("en-US"); },
  });
});

// ── ٩. حركة بطاقات المميزات ─────────────────────────────────
gsap.utils.toArray(".feature-card").forEach((card, i) => {
  gsap.fromTo(card, { opacity: 0, x: -50, rotationY: -12 },
    { opacity: 1, x: 0, rotationY: 0, duration: 1.05, delay: i * 0.14, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 90%", once: true },
    });
});

// ── ١٠. تأثيرات المعرض و Parallax ────────────────────────────
const galleryRoot = document.getElementById("gallery");
if (galleryRoot) {
  galleryRoot.querySelectorAll("figure").forEach((fig, i) => {
    // حركة الدخول
    gsap.fromTo(fig, { autoAlpha: 0, x: -60, scale: 0.92 },
      { autoAlpha: 1, x: 0, scale: 1, duration: 1.2, ease: "power3.out", delay: i * 0.08,
        scrollTrigger: { trigger: fig, start: "top 92%", once: true },
      });
    // Image parallax within figure
    const img = fig.querySelector("img");
    if (img) {
      gsap.to(img, { yPercent: -5, ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 1.3 },
      });
    }
  });
}

// ── ١١. حركة بلوك الاقتباس ──────────────────────────────────
gsap.fromTo(".quote-block", { opacity: 0, scale: 0.96, y: 30 },
  { opacity: 1, scale: 1, y: 0, duration: 1.3, ease: "power2.out",
    scrollTrigger: { trigger: ".quote-block", start: "top 86%", once: true } });

// ── ١٢. حركة قسم التواصل ────────────────────────────────────
gsap.fromTo(".contact-grid", { opacity: 0, y: 50 },
  { opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
    scrollTrigger: { trigger: "#contact", start: "top 82%", once: true } });

// ── ١٣. معالج نموذج التواصل (منع الإرسال الافتراضي) ──────────
document.querySelector("#contact-form")?.addEventListener("submit", (e) => {
  e.preventDefault(); // منع الإرسال الفعلي
  // جلب قيم النموذج
  const form = e.target;
  const name = form.querySelector('[name="name"]')?.value.trim();
  const email = form.querySelector('[name="email"]')?.value.trim();
  const message = form.querySelector('[name="message"]')?.value.trim();
  // تحقق بسيط
  if (!name || !email || !message) {
    alert("Please fill in all fields.");
    return;
  }
  // رسالة نجاح
  alert("Thank you for your message! We will contact you soon.");
  form.reset(); // مسح النموذج
});

// تحديث ScrollTrigger بعد اكتمال تحميل كل المحتوى
window.addEventListener("load", () => ScrollTrigger.refresh());
