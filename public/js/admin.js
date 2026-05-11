/* ============================================================
   SAIMO Real Estate - Admin Panel (Frontend Only / localStorage)
   بدون backend – كل البيانات في localStorage
   ============================================================ */

// ── البيانات الافتراضية للعقارات ─────────────────────────────
const DEFAULT_PROPERTIES = [
  { id:1, title:"Luxury Villa in New Cairo",    brief:"Stunning 5-bedroom villa with private pool and garden.",        type:"villa",     governorate:"cairo",       area_name:"Fifth Settlement", beds:5, baths:4, sqm:450,  price:8500000,  currency:"EGP", cover:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop",  is_active:1 },
  { id:2, title:"Modern Apartment in Zamalek",  brief:"Elegant 3-bedroom apartment with Nile view.",                  type:"apartment", governorate:"cairo",       area_name:"Zamalek",          beds:3, baths:2, sqm:180,  price:3200000,  currency:"EGP", cover:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=900&fit=crop",  is_active:1 },
  { id:3, title:"Seafront Villa in Sahel",      brief:"Beachfront villa with panoramic sea views.",                   type:"villa",     governorate:"north_coast", area_name:"Hacienda Bay",     beds:6, baths:5, sqm:600,  price:12000000, currency:"EGP", cover:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop",  is_active:1 },
  { id:4, title:"Cozy Apartment in Alexandria", brief:"Charming 2-bedroom apartment near the Corniche.",              type:"apartment", governorate:"alex",        area_name:"Gleem",            beds:2, baths:1, sqm:120,  price:1500000,  currency:"EGP", cover:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&h=900&fit=crop", is_active:1 },
  { id:5, title:"Penthouse in 6th of October",  brief:"Luxurious penthouse with rooftop terrace.",                    type:"apartment", governorate:"giza",        area_name:"6th of October",   beds:4, baths:3, sqm:300,  price:5500000,  currency:"EGP", cover:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&h=900&fit=crop",  is_active:1 },
  { id:6, title:"Red Sea Resort Villa",         brief:"Tropical villa steps away from the beach.",                    type:"villa",     governorate:"red_sea",     area_name:"Hurghada",         beds:4, baths:3, sqm:350,  price:4200000,  currency:"EGP", cover:"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&h=900&fit=crop",  is_active:1 }
];

// ── مساعدات localStorage ────────────────────────────────────
function getProps()         { const d = localStorage.getItem("saimo_properties"); return d ? JSON.parse(d) : [...DEFAULT_PROPERTIES]; }
function saveProps(list)    { localStorage.setItem("saimo_properties", JSON.stringify(list)); }
function getReservations()  { const d = localStorage.getItem("saimo_reservations"); return d ? JSON.parse(d) : []; }
function getInquiries()     { const d = localStorage.getItem("saimo_inquiries"); return d ? JSON.parse(d) : []; }
function getUsers()         { const d = localStorage.getItem("saimo_users"); return d ? JSON.parse(d) : []; }
function nextId(list)       { return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1; }

// ── تهيئة: أنشئ العقارات الافتراضية إذا لم تكن موجودة ──────
if (!localStorage.getItem("saimo_properties")) saveProps(DEFAULT_PROPERTIES);

// ── فحص الصلاحية ───────────────────────────────────────────
let govChartInstance = null;
let revenueChartInstance = null;

const token   = localStorage.getItem("saimo_token");
const userStr = localStorage.getItem("saimo_user");
if (!token || !userStr) {
  window.location.href = "login.html";
} else {
  const user = JSON.parse(userStr);
  if (user.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("saimo_token");
  localStorage.removeItem("saimo_user");
  window.location.href = "login.html";
}

// ── التنقل بين الأقسام ────────────────────────────────────
function showSection(name) {
  document.querySelectorAll("[id^='section-']").forEach(s => s.style.display = "none");
  document.getElementById("section-" + name).style.display = "block";
  document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));
  event.target.closest("a").classList.add("active");
  if (name === "properties")  loadProperties();
  if (name === "reservations") loadAllReservations();
  if (name === "inquiries")   loadAllInquiries();
  if (name === "users")       loadUsers();
}

// ── تحميل كل شيء ────────────────────────────────────────
function loadAll() {
  loadStats();
  loadGovChart();
  loadRevenueChart();
  loadRecentReservations();
}

// ── الإحصائيات ───────────────────────────────────────────
function loadStats() {
  document.getElementById("stat-properties").textContent  = getProps().length;
  document.getElementById("stat-users").textContent       = getUsers().length;
  document.getElementById("stat-reservations").textContent = getReservations().length;
  document.getElementById("stat-inquiries").textContent   = getInquiries().filter(i => i.status === "new").length;
}

// ── مخطط توزيع المحافظات ─────────────────────────────────
function loadGovChart() {
  const props = getProps();
  const counts = {};
  props.forEach(p => { counts[p.governorate] = (counts[p.governorate] || 0) + 1; });
  const labels = Object.keys(counts);
  const data   = labels.map(k => counts[k]);
  if (!labels.length) { document.getElementById("govChart").parentElement.innerHTML = "<div class='empty'>No data</div>"; return; }
  const ctx = document.getElementById("govChart").getContext("2d");
  if (govChartInstance) govChartInstance.destroy();
  govChartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: "Properties", data, backgroundColor: "rgba(201,169,98,0.7)", borderColor: "var(--gold)", borderWidth: 1, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });
}

// ── مخطط الإيرادات ───────────────────────────────────────
function loadRevenueChart() {
  const reservations = getReservations();
  const months = ["Jan","Feb","Mar","Apr","May","Jun"];
  const values = [0,0,0,0,0, reservations.length * 50000];
  const ctx = document.getElementById("revenueChart").getContext("2d");
  if (revenueChartInstance) revenueChartInstance.destroy();
  revenueChartInstance = new Chart(ctx, {
    type: "line",
    data: { labels: months, datasets: [{ label: "Revenue (EGP)", data: values, borderColor: "var(--gold)", backgroundColor: "rgba(201,169,98,0.1)", fill: true, tension: 0.4, pointBackgroundColor: "var(--gold)", pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });
}

// ── الحجوزات الأخيرة ──────────────────────────────────────
function loadRecentReservations() {
  renderReservationsTable(getReservations().slice(0, 5), "recent-reservations");
}
function loadAllReservations() {
  renderReservationsTable(getReservations(), "all-reservations");
}

function renderReservationsTable(data, containerId) {
  const container = document.getElementById(containerId);
  if (!data || !data.length) { container.innerHTML = "<div class='empty'>No reservations yet.</div>"; return; }
  const rows = data.map(r => `<tr>
    <td>#${r.id}</td>
    <td>${r.property_title || "N/A"}</td>
    <td>****${r.card_last4 || "N/A"}</td>
    <td><span class="badge badge-${r.status || 'pending'}">${r.status || "pending"}</span></td>
    <td>${r.date ? new Date(r.date).toLocaleDateString() : "N/A"}</td>
  </tr>`).join("");
  container.innerHTML = `<table><thead><tr><th>ID</th><th>Property</th><th>Card</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ── جدول العقارات ─────────────────────────────────────────
function loadProperties() {
  const props = getProps();
  const container = document.getElementById("properties-table");
  if (!props.length) { container.innerHTML = "<div class='empty'>No properties found.</div>"; return; }
  const rows = props.map(p => `<tr>
    <td>#${p.id}</td>
    <td><img src="${p.cover}" style="width:50px;height:35px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px">${p.title}</td>
    <td>${p.type}</td>
    <td>${p.governorate}</td>
    <td>${Number(p.price).toLocaleString()} EGP</td>
    <td><span class="badge badge-${p.is_active ? 'active' : 'inactive'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
    <td>
      <button class="btn btn-sm btn-outline" onclick="editProperty(${p.id})">Edit</button>
      <button class="btn btn-sm btn-danger"  onclick="deleteProperty(${p.id})">Delete</button>
    </td>
  </tr>`).join("");
  container.innerHTML = `<table><thead><tr><th>ID</th><th>Property</th><th>Type</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ── الاستفسارات ───────────────────────────────────────────
function loadAllInquiries() {
  const data = getInquiries();
  const container = document.getElementById("all-inquiries");
  if (!data.length) { container.innerHTML = "<div class='empty'>No inquiries yet.</div>"; return; }
  const rows = data.map(i => `<tr>
    <td>#${i.id}</td>
    <td>${i.name}</td>
    <td>${i.email}</td>
    <td>${(i.message || "").substring(0, 60)}...</td>
    <td><span class="badge badge-${i.status}">${i.status}</span></td>
    <td>${i.created_at ? new Date(i.created_at).toLocaleDateString() : "N/A"}</td>
  </tr>`).join("");
  container.innerHTML = `<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ── المستخدمون ────────────────────────────────────────────
function loadUsers() {
  const users = getUsers();
  document.getElementById("users-table").innerHTML =
    `<div class="empty">Total registered users: <strong>${users.length}</strong></div>`;
}

// ── الـ Modal ─────────────────────────────────────────────
function openModal(isEdit = false) {
  document.getElementById("modal").classList.add("active");
  document.getElementById("property-form").reset();
  document.getElementById("prop-id").value = "";
  document.getElementById("modal-title").textContent = isEdit ? "Edit Property" : "Add New Property";
}
function closeModal() { document.getElementById("modal").classList.remove("active"); }
document.getElementById("modal").addEventListener("click", e => { if (e.target === document.getElementById("modal")) closeModal(); });

// ── حفظ العقار ────────────────────────────────────────────
function saveProperty(e) {
  e.preventDefault();
  const idVal = document.getElementById("prop-id").value;
  const payload = {
    title:      document.getElementById("prop-title").value,
    type:       document.getElementById("prop-type").value,
    governorate:document.getElementById("prop-gov").value,
    area_name:  document.getElementById("prop-area").value,
    price:      parseInt(document.getElementById("prop-price").value),
    beds:       parseInt(document.getElementById("prop-beds").value),
    baths:      parseInt(document.getElementById("prop-baths").value),
    sqm:        parseInt(document.getElementById("prop-sqm").value),
    cover:      document.getElementById("prop-cover").value,
    brief:      document.getElementById("prop-brief").value,
    currency:   "EGP",
    is_active:  1
  };
  const list = getProps();
  if (idVal) {
    payload.id = parseInt(idVal);
    const idx = list.findIndex(p => p.id === payload.id);
    if (idx !== -1) list[idx] = { ...list[idx], ...payload };
  } else {
    payload.id = nextId(list);
    list.push(payload);
  }
  saveProps(list);
  closeModal();
  loadAll();
  if (document.getElementById("section-properties").style.display !== "none") loadProperties();
}

// ── تعديل عقار ────────────────────────────────────────────
function editProperty(id) {
  const p = getProps().find(x => x.id === id);
  if (!p) return;
  document.getElementById("prop-id").value    = p.id;
  document.getElementById("prop-title").value = p.title;
  document.getElementById("prop-type").value  = p.type;
  document.getElementById("prop-gov").value   = p.governorate;
  document.getElementById("prop-area").value  = p.area_name || "";
  document.getElementById("prop-price").value = p.price;
  document.getElementById("prop-beds").value  = p.beds;
  document.getElementById("prop-baths").value = p.baths;
  document.getElementById("prop-sqm").value   = p.sqm;
  document.getElementById("prop-cover").value = p.cover || "";
  document.getElementById("prop-brief").value = p.brief || "";
  openModal(true);
}

// ── حذف عقار ─────────────────────────────────────────────
function deleteProperty(id) {
  if (!confirm("Are you sure you want to delete this property?")) return;
  saveProps(getProps().filter(p => p.id !== id));
  loadAll();
  loadProperties();
}

// ── تحميل أولي ───────────────────────────────────────────
loadAll();
