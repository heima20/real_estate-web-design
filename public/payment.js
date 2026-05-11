/* ============================================================
   SAIMO Real Estate - وحدة الدفع / الحجز (Payment / Reservation)
   المشروع النهائي: موقع HTML/CSS/JS أصلي (بدون Backend)
   المميزات: التحقق من البطاقة، Session Storage، محاكاة الدفع،
             تنسيق النموذج، معالجة النجاح
   مفاهيم DOM: querySelector, addEventListener, sessionStorage,
               Validation, Input Formatting
   ============================================================ */

// ── ١. مراجع عناصر DOM ──────────────────────────────────────
const summary = document.getElementById("pay-summary");
const form = document.getElementById("pay-form");
const done = document.getElementById("pay-done");

let reserveData = null;

// ── ٢. تحميل بيانات الحجز من sessionStorage ────────────────
try {
  const raw = sessionStorage.getItem("saimoReserve");
  if (raw && summary) {
    reserveData = JSON.parse(raw);
    summary.innerHTML = `
      <div class="pay-summary__title">${reserveData.title}</div>
      <div class="pay-summary__price">${Number(reserveData.price).toLocaleString("en-US")} ${reserveData.currency || "EGP"}</div>`;
  } else if (summary) {
    summary.innerHTML = '<p>No property selected. <a href="browse.html">Browse Properties</a></p>';
    if (form) form.hidden = true;
  }
} catch (e) {
  if (summary) summary.textContent = "Invalid data.";
  console.error("خطأ بيانات الدفع:", e);
}

// ── ٣. دالة التحقق من رقم البطاقة (خوارزمية Luhn) ───────────

/**
 * التحقق من رقم البطاقة باستخدام خوارزمية Luhn
 * @param {string} cardNum - رقم البطاقة (أرقام فقط)
 * @returns {boolean} صحيح أم لا
 */
function validateCardNumber(cardNum) {
  if (cardNum.length !== 16) return false;
  let sum = 0;
  let isEven = false;
  for (let i = cardNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNum[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// ── ٤. معالج إرسال النموذج (محاكاة محلية) ────────────────────
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cardInput = form.querySelector('[name="card"]');
  const cardNum = (cardInput?.value || "").replace(/\s/g, "");
  const submitBtn = form.querySelector('[type="submit"]');

  // التحقق من البيانات
  if (cardNum.length !== 16) {
    alert("Please enter a valid 16-digit card number.");
    cardInput?.focus();
    return;
  }
  if (!validateCardNumber(cardNum)) {
    alert("Invalid card number. Please check and try again.");
    cardInput?.focus();
    return;
  }

  // تحديث حالة الزر
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
  }

  // محاكاة تأخير معالجة الدفع
  setTimeout(() => {
    // حفظ الحجز في localStorage (محاكاة قاعدة بيانات)
    const reservations = JSON.parse(localStorage.getItem("saimo_reservations") || "[]");
    reservations.push({
      id: Date.now(),
      property_id: reserveData?.id,
      property_title: reserveData?.title,
      price: reserveData?.price,
      card_last4: cardNum.slice(-4),
      date: new Date().toISOString()
    });
    localStorage.setItem("saimo_reservations", JSON.stringify(reservations));

    // عرض حالة النجاح
    if (form) form.hidden = true;
    if (done) done.hidden = false;
    sessionStorage.removeItem("saimoReserve");
  }, 1500);
});

// ── ٥. تنسيق إدخال البطاقة في الوقت الفعلي ───────────────────
form?.querySelector('[name="card"]')?.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").substring(0, 16);
  e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
});
