/* ============================================================
   SAIMO Real Estate - وحدة المصادقة (تسجيل الدخول والتسجيل)
   المشروع النهائي: موقع HTML/CSS/JS أصلي (بدون Backend)
   المميزات: تبويبات Login/Register، التحقق من البيانات،
             localStorage للجلسات، محاكاة بيانات المستخدمين
   ============================================================ */

// ── ١. اختيار عناصر DOM ────────────────────────────────────
const tabs = document.querySelectorAll(".auth-tab");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const msg = document.getElementById("auth-msg");

// ── ٢. منطق التبديل بين التبويبات ──────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    const tabName = tab.dataset.tab;
    if (tabName === "login") {
      formLogin.hidden = false;
      formRegister.hidden = true;
    } else {
      formLogin.hidden = true;
      formRegister.hidden = false;
    }
    msg.hidden = true;
    if (typeof gsap !== "undefined") {
      gsap.from(".auth-card", { y: 12, duration: 0.35, ease: "power2.out" });
    }
  });
});

// ── ٣. دالة عرض الرسائل ────────────────────────────────────
function showMsg(text, isError = false) {
  msg.textContent = text;
  msg.hidden = false;
  msg.style.color = isError ? "#f44336" : "var(--gold-bright)";
  if (typeof gsap !== "undefined") {
    gsap.from(msg, { opacity: 0, y: 8, duration: 0.4 });
  }
}

// ── ٤. دوال التحقق من البيانات (Validation) ─────────────────
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateName(name) {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
}

// ── ٥. نظام المستخدمين المحلي (localStorage) ───────────────
// يخزن المستخدمين في المتصفح بدون Backend

function getUsers() {
  const users = localStorage.getItem("saimo_users");
  return users ? JSON.parse(users) : [];
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("saimo_users", JSON.stringify(users));
}

function findUser(email) {
  return getUsers().find((u) => u.email === email);
}

// ── ٦. إعادة التوجيه التلقائي إذا كان مسجل دخوله ────────────
const token = localStorage.getItem("saimo_token");
const userStr = localStorage.getItem("saimo_user");

if (token && userStr) {
  const user = JSON.parse(userStr);
  window.location.href = user.role === "admin" ? "admin.html" : "browse.html";
}

// ── ٧. معالج تسجيل الدخول (محاكاة محلية) ────────────────────
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = formLogin.querySelector('[name="email"]').value.trim();
  const password = formLogin.querySelector('[name="password"]').value;
  const btn = formLogin.querySelector('[type="submit"]');

  // التحقق من البيانات
  if (!email || !password) {
    showMsg("Please fill in all fields.", true);
    return;
  }
  if (!validateEmail(email)) {
    showMsg("Please enter a valid email address.", true);
    return;
  }
  if (!validatePassword(password)) {
    showMsg("Password must be at least 6 characters.", true);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Signing in...";

  // محاكاة تأخير الشبكة
  setTimeout(() => {
    const user = findUser(email);
    if (!user || user.password !== password) {
      showMsg("Invalid email or password.", true);
      btn.disabled = false;
      btn.textContent = "Sign In";
      return;
    }

    // إنشاء توكن وهمي وتسجيل الدخول
    const fakeToken = "token_" + Date.now();
    localStorage.setItem("saimo_token", fakeToken);
    localStorage.setItem("saimo_user", JSON.stringify(user));

    showMsg("Welcome back, " + user.name + "! Redirecting...");
    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin.html" : "browse.html";
    }, 1000);
  }, 800);
});

// ── ٨. معالج التسجيل (محاكاة محلية) ────────────────────────
formRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = formRegister.querySelector('[name="name"]').value.trim();
  const email = formRegister.querySelector('[name="email"]').value.trim();
  const password = formRegister.querySelector('[name="password"]').value;
  const btn = formRegister.querySelector('[type="submit"]');

  // التحقق من البيانات
  if (!name || !email || !password) {
    showMsg("Please fill in all fields.", true);
    return;
  }
  if (!validateName(name)) {
    showMsg("Name must be 2-50 letters only.", true);
    return;
  }
  if (!validateEmail(email)) {
    showMsg("Please enter a valid email address.", true);
    return;
  }
  if (!validatePassword(password)) {
    showMsg("Password must be at least 6 characters.", true);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Creating account...";

  // محاكاة تأخير الشبكة
  setTimeout(() => {
    if (findUser(email)) {
      showMsg("Email already registered.", true);
      btn.disabled = false;
      btn.textContent = "Register";
      return;
    }

    // إنشاء مستخدم جديد
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
      role: "user"
    };
    saveUser(newUser);

    showMsg("Account created! You can now sign in.");
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
    }, 1500);
  }, 800);
});

// ── ٩. حركات عند تحميل الصفحة ───────────────────────────────
if (typeof gsap !== "undefined") {
  gsap.from(".auth-card", {
    opacity: 0, y: 40, duration: 0.9, ease: "power3.out", delay: 0.1
  });
  gsap.from(".auth-tabs button", {
    opacity: 0, y: -12, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.2
  });
}
