/* ============================================================
   SAIMO Real Estate - وحدة تفاصيل العقار (Property Detail)
   المشروع النهائي: موقع HTML/CSS/JS أصلي (بدون Backend)
   المميزات: قراءة معاملات URL، حقن محتوى ديناميكي،
             بناء معرض صور، التنقل للدفع، حركات Scroll
   مفاهيم DOM: URLSearchParams, createElement, innerHTML, Events
   ============================================================ */

// تسجيل ScrollTrigger لحركات الصفحة
gsap.registerPlugin(ScrollTrigger);

// ── ١. قراءة معاملات URL ───────────────────────────────────
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const root = document.getElementById("property-content");
const loading = document.getElementById("property-loading");

// ── ٢. بيانات وهمية محلية للعقارات ─────────────────────────
const mockProperties = {
  1: {
    id: 1,
    title: "Luxury Villa in New Cairo",
    brief: "Stunning 5-bedroom villa with private pool and garden. This magnificent property offers the ultimate in luxury living with spacious interiors, premium finishes, and a private outdoor oasis.",
    type: "villa",
    governorate: "cairo",
    area_name: "Fifth Settlement",
    beds: 5,
    baths: 4,
    sqm: 450,
    price: 8500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=780&fit=crop"
    ]
  },
  2: {
    id: 2,
    title: "Modern Apartment in Zamalek",
    brief: "Elegant 3-bedroom apartment with Nile view. Located in the heart of Zamalek with stunning panoramic views of the Nile.",
    type: "apartment",
    governorate: "cairo",
    area_name: "Zamalek",
    beds: 3,
    baths: 2,
    sqm: 180,
    price: 3200000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=780&fit=crop"
    ]
  },
  3: {
    id: 3,
    title: "Seafront Villa in Sahel",
    brief: "Beachfront villa with panoramic sea views. Wake up to the sound of waves in this exclusive coastal retreat.",
    type: "villa",
    governorate: "north_coast",
    area_name: "Hacienda Bay",
    beds: 6,
    baths: 5,
    sqm: 600,
    price: 12000000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=780&fit=crop"
    ]
  },
  4: {
    id: 4,
    title: "Cozy Apartment in Alexandria",
    brief: "Charming 2-bedroom apartment near the Corniche. Perfect for those who love the Mediterranean lifestyle.",
    type: "apartment",
    governorate: "alex",
    area_name: "Gleem",
    beds: 2,
    baths: 1,
    sqm: 120,
    price: 1500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=780&fit=crop"
    ]
  },
  5: {
    id: 5,
    title: "Penthouse in 6th of October",
    brief: "Luxurious penthouse with rooftop terrace. Enjoy breathtaking city views from your private sky garden.",
    type: "apartment",
    governorate: "giza",
    area_name: "6th of October",
    beds: 4,
    baths: 3,
    sqm: 300,
    price: 5500000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=780&fit=crop"
    ]
  },
  6: {
    id: 6,
    title: "Red Sea Resort Villa",
    brief: "Tropical villa steps away from the beach. Your private paradise in the heart of Hurghada.",
    type: "villa",
    governorate: "red_sea",
    area_name: "Hurghada",
    beds: 4,
    baths: 3,
    sqm: 350,
    price: 4200000,
    currency: "EGP",
    cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&h=900&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=780&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=780&fit=crop"
    ]
  }
};

const govMap = {
  cairo: "Cairo",
  alex: "Alexandria",
  giza: "Giza",
  north_coast: "North Coast",
  red_sea: "Red Sea"
};

// ── ٣. دوال مساعدة ──────────────────────────────────────────
function typeLabel(t) {
  return t === "villa" ? "Villa" : "Apartment";
}

function goPayment(p) {
  sessionStorage.setItem(
    "saimoReserve",
    JSON.stringify({ id: p.id, title: p.title, price: p.price, currency: p.currency || "EGP" })
  );
  window.location.href = "payment.html";
}

// ── ٤. التعامل مع ID مفقود ──────────────────────────────────
if (!id || !root) {
  if (loading) loading.textContent = "Invalid ID.";
} else {
  // البحث عن العقار في البيانات الوهمية
  const p = mockProperties[parseInt(id)];

  if (!p) {
    loading.textContent = "Property not found.";
  } else {
    const govAr = govMap[p.governorate] || p.governorate || "";
    loading.hidden = true;
    root.hidden = false;

    // بناء HTML المعرض ديناميكياً
    const galleryHtml = [p.cover, ...(p.gallery || [])]
      .map((src, i) =>
        `<div class="pd-gallery__cell${i === 0 ? " pd-gallery__cell--hero" : ""}"><img src="${src}" alt="" loading="${i < 2 ? "eager" : "lazy"}" width="1200" height="780"></div>`
      )
      .join("");

    // حقن محتوى العقار
    root.innerHTML = `
      <section class="pd-hero">
        <div class="pd-hero__media"><img src="${p.cover}" alt="" width="1600" height="900"></div>
        <div class="pd-hero__panel">
          <span class="pd-badge">${typeLabel(p.type)} · ${govAr} · ${p.area_name || ""}</span>
          <h1 class="pd-title font-display">${p.title}</h1>
          <p class="pd-brief">${p.brief}</p>
          <ul class="pd-facts">
            <li><strong>${p.beds}</strong> Bedrooms</li>
            <li><strong>${p.baths}</strong> Bathrooms</li>
            <li><strong>${p.sqm}</strong> m² built area</li>
            <li>${p.area_name || ""}</li>
          </ul>
          <div class="pd-price">${p.price.toLocaleString("en-US")} <span>${p.currency || "EGP"}</span></div>
          <button type="button" class="btn btn--solid btn--wide" id="pd-pay">Proceed to Reservation</button>
          <a href="browse.html" class="pd-back">← Back to Listings</a>
        </div>
      </section>
      <section class="pd-gallery">
        <h2 class="font-display pd-section-title">Photo Gallery</h2>
        <div class="pd-gallery__grid">${galleryHtml}</div>
      </section>
      <section class="pd-info section alt">
        <h2 class="font-display pd-section-title">About the Location</h2>
        <p class="pd-info__text">${govAr} — ${p.area_name || ""}. SAIMO residences emphasize privacy, natural views, and refined finishes. Schedule a visit after sign-in or via the contact form on the Story page.</p>
      </section>`;

    // ربط Event Listener بزر الدفع
    document.getElementById("pd-pay")?.addEventListener("click", () => goPayment(p));

    // حركات الدخول
    gsap.from(".pd-hero__media", { scale: 1.08, opacity: 0, duration: 1.4, ease: "power2.out" });
    gsap.from(".pd-hero__panel > *", { y: 36, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", delay: 0.2 });
    gsap.utils.toArray(".pd-gallery__cell").forEach((cell, i) => {
      gsap.from(cell, { opacity: 0, y: 50, duration: 0.8, delay: i * 0.06, ease: "power2.out",
        scrollTrigger: { trigger: cell, start: "top 90%", once: true },
      });
    });
  }
}
