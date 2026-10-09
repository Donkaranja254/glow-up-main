// ===== GlowUp Ruiru – App Logic (v3) =====

const STORAGE_KEY = 'glowup_ruiru_services';
const USERS_KEY = 'glowup_ruiru_users';
const BOOKINGS_KEY = 'glowup_ruiru_bookings';
const RATINGS_KEY = 'glowup_ruiru_ratings';

// ---------- Helpers ----------
function cleanPhone(raw) {
  let n = (raw || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '254' + n.slice(1);
  if (n.startsWith('7') && n.length === 9) n = '254' + n;
  return n;
}

function formatPhone(num) {
  if (!num) return '';
  if (String(num).startsWith('254') && String(num).length === 12) {
    return '0' + num.slice(3, 6) + ' ' + num.slice(6, 9) + ' ' + num.slice(9);
  }
  return num;
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getServices() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveServices(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}
function getBookings() {
  try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []; }
  catch { return []; }
}
function saveBookings(list) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}
function getRatings() {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY)) || []; }
  catch { return []; }
}
function saveRatings(list) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}

function getStudentRating(studentName) {
  const ratings = getRatings().filter(r => r.studentName === studentName);
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const sum = ratings.reduce((a, r) => a + r.stars, 0);
  return { avg: sum / ratings.length, count: ratings.length };
}

function starsHtml(avg, count) {
  if (count === 0) {
    return `<div class="rating-row"><span class="stars">☆☆☆☆☆</span> <span class="rating-count">No ratings yet</span></div>`;
  }
  const full = Math.round(avg);
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= full ? '★' : '☆';
  return `<div class="rating-row"><span class="stars">${s}</span> <span class="rating-count">${avg.toFixed(1)} (${count})</span></div>`;
}

// ---------- Dark Mode ----------
function initTheme() {
  const saved = localStorage.getItem('glowup_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('glowup_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ---------- Logout ----------
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ---------- Login Page Logic ----------
document.addEventListener('DOMContentLoaded', () => {
  // Role tabs
  const tabs = document.querySelectorAll('.role-tabs .tab');
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const role = tab.dataset.role;
        const clientForm = document.getElementById('clientForm');
        const studentSec = document.getElementById('studentSection');
        const adminSec = document.getElementById('adminSection');
        if (clientForm) clientForm.style.display = role === 'client' ? 'block' : 'none';
        if (studentSec) studentSec.style.display = role === 'student' ? 'block' : 'none';
        if (adminSec) adminSec.style.display = role === 'admin' ? 'block' : 'none';
      });
    });
  }

  // Sub-tabs (Login / Register)
  document.querySelectorAll('.sub-tabs').forEach(group => {
    const subTabs = group.querySelectorAll('.sub-tab');
    subTabs.forEach(st => {
      st.addEventListener('click', () => {
        subTabs.forEach(t => t.classList.remove('active'));
        st.classList.add('active');
        const parent = group.parentElement;
        const sub = st.dataset.sub;
        // Student
        const sLogin = parent.querySelector('#studentLoginForm');
        const sReg = parent.querySelector('#studentRegisterForm');
        if (sLogin && sReg) {
          sLogin.style.display = sub === 'login' ? 'block' : 'none';
          sReg.style.display = sub === 'register' ? 'block' : 'none';
        }
        // Admin
        const aLogin = parent.querySelector('#adminLoginForm');
        const aReg = parent.querySelector('#adminRegisterForm');
        if (aLogin && aReg) {
          aLogin.style.display = sub === 'alogin' ? 'block' : 'none';
          aReg.style.display = sub === 'aregister' ? 'block' : 'none';
        }
      });
    });
  });

  // --- CLIENT ---
  const clientForm = document.getElementById('clientForm');
  if (clientForm) {
    clientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const first = document.getElementById('cFirstName').value.trim();
      const last = document.getElementById('cLastName').value.trim();
      const phone = cleanPhone(document.getElementById('cPhone').value);
      if (!first || !last || phone.length < 12) {
        alert('Please enter valid first name, last name and phone.');
        return;
      }
      sessionStorage.setItem('role', 'client');
      sessionStorage.setItem('fullName', first + ' ' + last);
      sessionStorage.setItem('firstName', first);
      sessionStorage.setItem('phone', phone);
      window.location.href = 'client.html';
    });
  }

  // --- STUDENT REGISTER ---
  const sRegForm = document.getElementById('studentRegisterForm');
  if (sRegForm) {
    sRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const first = document.getElementById('sRegFirst').value.trim();
      const last = document.getElementById('sRegLast').value.trim();
      const phone = cleanPhone(document.getElementById('sRegPhone').value);
      const pass = document.getElementById('sRegPass').value;
      const pass2 = document.getElementById('sRegPass2').value;

      if (phone.length < 12) { alert('Valid phone required (e.g. 0712345678)'); return; }
      if (pass.length < 4) { alert('Password must be at least 4 characters'); return; }
      if (pass !== pass2) { alert('Passwords do not match'); return; }

      let users = getUsers();
      if (users.find(u => u.role === 'student' && u.phone === phone)) {
        alert('A student account already exists with this phone. Please login instead.');
        return;
      }

      users.push({
        role: 'student',
        firstName: first,
        lastName: last,
        fullName: first + ' ' + last,
        phone,
        password: pass,
        createdAt: new Date().toISOString()
      });
      saveUsers(users);

      sessionStorage.setItem('role', 'student');
      sessionStorage.setItem('fullName', first + ' ' + last);
      sessionStorage.setItem('phone', phone);
      alert('Account created! Welcome, ' + first);
      window.location.href = 'student.html';
    });
  }

  // --- STUDENT LOGIN ---
  const sLoginForm = document.getElementById('studentLoginForm');
  if (sLoginForm) {
    sLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = cleanPhone(document.getElementById('sLoginPhone').value);
      const pass = document.getElementById('sLoginPass').value;
      const users = getUsers();
      const user = users.find(u => u.role === 'student' && u.phone === phone);

      if (!user) {
        alert('No student account found with this phone. Please register first.');
        return;
      }
      if (user.password !== pass) {
        alert('Wrong password. Try again or use Forgot Password.');
        return;
      }

      sessionStorage.setItem('role', 'student');
      sessionStorage.setItem('fullName', user.fullName);
      sessionStorage.setItem('phone', user.phone);
      window.location.href = 'student.html';
    });
  }

  // --- ADMIN REGISTER ---
  const aRegForm = document.getElementById('adminRegisterForm');
  if (aRegForm) {
    aRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('aRegName').value.trim();
      const phone = cleanPhone(document.getElementById('aRegPhone').value);
      const pass = document.getElementById('aRegPass').value;
      const pass2 = document.getElementById('aRegPass2').value;

      if (phone.length < 12) { alert('Valid phone required'); return; }
      if (pass.length < 4) { alert('Password must be at least 4 characters'); return; }
      if (pass !== pass2) { alert('Passwords do not match'); return; }

      let users = getUsers();
      // Only one admin allowed, or update existing
      const existing = users.findIndex(u => u.role === 'admin');
      const adminData = {
        role: 'admin',
        fullName: name,
        phone,
        password: pass,
        createdAt: new Date().toISOString()
      };
      if (existing >= 0) {
        if (!confirm('An admin already exists. Replace with this account?')) return;
        users[existing] = adminData;
      } else {
        users.push(adminData);
      }
      saveUsers(users);

      sessionStorage.setItem('role', 'admin');
      sessionStorage.setItem('fullName', name);
      sessionStorage.setItem('phone', phone);
      alert('Admin account ready!');
      window.location.href = 'admin.html';
    });
  }

  // --- ADMIN LOGIN ---
  const aLoginForm = document.getElementById('adminLoginForm');
  if (aLoginForm) {
    aLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('aLoginName').value.trim();
      const phone = cleanPhone(document.getElementById('aLoginPhone').value);
      const pass = document.getElementById('aLoginPass').value;
      const users = getUsers();
      const user = users.find(u => u.role === 'admin' && u.phone === phone);

      if (!user) {
        alert('No admin account found. Please register first (First time? Register).');
        return;
      }
      if (user.password !== pass) {
        alert('Wrong password.');
        return;
      }
      // Optional: also check name roughly
      sessionStorage.setItem('role', 'admin');
      sessionStorage.setItem('fullName', user.fullName);
      sessionStorage.setItem('phone', user.phone);
      window.location.href = 'admin.html';
    });
  }
});

// ---------- STUDENT: Add Service (only own) ----------
const addForm = document.getElementById('addServiceForm');
if (addForm) {
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('role') !== 'student') return;

    const studentName = sessionStorage.getItem('fullName');
    const whatsapp = sessionStorage.getItem('phone');
    const serviceType = document.getElementById('serviceType').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const notes = document.getElementById('notes').value.trim();

    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    const services = getServices();
    services.unshift({
      id: Date.now(),
      studentName,
      studentPhone: whatsapp,
      serviceType,
      startTime,
      endTime,
      price: 0,
      free: true,
      whatsapp,
      notes,
      createdAt: new Date().toISOString()
    });
    saveServices(services);

    document.getElementById('serviceType').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('notes').value = '';

    renderStudentList();
    alert('Service posted! Only you can manage it.');
  });
}

// ---------- STUDENT: Render only MY services ----------
function renderStudentList() {
  const container = document.getElementById('servicesList');
  if (!container) return;

  const myPhone = sessionStorage.getItem('phone');
  const services = getServices().filter(s => s.whatsapp === myPhone || s.studentPhone === myPhone);

  if (services.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">You have not posted any services yet.</p>';
    return;
  }

  container.innerHTML = services.map(s => `
    <div class="service-item">
      <div class="info">
        <h4>${escapeHtml(s.serviceType)}</h4>
        <p>⏰ ${formatTime(s.startTime)} – ${formatTime(s.endTime)}</p>
        ${s.notes ? `<p style="font-style:italic;">${escapeHtml(s.notes)}</p>` : ''}
      </div>
      <div style="text-align:right;">
        <div class="price" style="color:var(--success);">FREE</div>
        <button class="delete-btn" onclick="deleteMyService(${s.id})" title="Delete">×</button>
      </div>
    </div>
  `).join('');
}

function deleteMyService(id) {
  const myPhone = sessionStorage.getItem('phone');
  const services = getServices();
  const item = services.find(s => s.id === id);
  if (!item || (item.whatsapp !== myPhone && item.studentPhone !== myPhone)) {
    alert('You can only delete your own services.');
    return;
  }
  if (!confirm('Delete this service?')) return;
  saveServices(services.filter(s => s.id !== id));
  renderStudentList();
}

function clearMyServices() {
  if (!confirm('Clear all YOUR services only?')) return;
  const myPhone = sessionStorage.getItem('phone');
  const services = getServices().filter(s => s.whatsapp !== myPhone && s.studentPhone !== myPhone);
  saveServices(services);
  renderStudentList();
}

function showMyRating() {
  const box = document.getElementById('myRatingBox');
  if (!box) return;
  const name = sessionStorage.getItem('fullName');
  const r = getStudentRating(name);
  box.innerHTML = `<strong>My Rating</strong><br>${starsHtml(r.avg, r.count)}`;
}

// ---------- ADMIN DASHBOARD ----------
function renderAdminDashboard() {
  const students = getUsers().filter(u => u.role === 'student');
  const services = getServices();
  const ratings = getRatings();

  const elS = document.getElementById('statStudents');
  const elV = document.getElementById('statServices');
  const elR = document.getElementById('statRatings');
  if (elS) elS.textContent = students.length;
  if (elV) elV.textContent = services.length;
  if (elR) elR.textContent = ratings.length;

  // Students & ratings
  const list = document.getElementById('studentsRatingsList');
  if (list) {
    if (students.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted);">No students registered yet.</p>';
    } else {
      list.innerHTML = students.map(st => {
        const r = getStudentRating(st.fullName);
        const myServices = services.filter(s => s.whatsapp === st.phone || s.studentPhone === st.phone);
        return `
          <div class="service-item" style="margin-bottom:10px;">
            <div class="info">
              <h4>${escapeHtml(st.fullName)}</h4>
              <p>📱 ${formatPhone(st.phone)}</p>
              <p>Services today: ${myServices.length}</p>
              ${starsHtml(r.avg, r.count)}
            </div>
          </div>`;
      }).join('');
    }
  }

  // All services
  const allList = document.getElementById('allServicesList');
  if (allList) {
    if (services.length === 0) {
      allList.innerHTML = '<p style="color:var(--text-muted);">No services posted today.</p>';
    } else {
      allList.innerHTML = services.map(s => {
        const r = getStudentRating(s.studentName);
        return `
          <div class="service-item">
            <div class="info">
              <h4>${escapeHtml(s.serviceType)}</h4>
              <p><strong>${escapeHtml(s.studentName)}</strong></p>
              ${starsHtml(r.avg, r.count)}
              <p>⏰ ${formatTime(s.startTime)} – ${formatTime(s.endTime)}</p>
              <p>📱 ${formatPhone(s.whatsapp)}</p>
              ${s.notes ? `<p style="font-style:italic;">${escapeHtml(s.notes)}</p>` : ''}
            </div>
            <div class="price" style="color:var(--success);">FREE</div>
          </div>`;
      }).join('');
    }
  }
}

function adminClearAllServices() {
  if (!confirm('Clear ALL services from all students? This cannot be undone.')) return;
  saveServices([]);
  renderAdminDashboard();
}

// ---------- CLIENT: Render services ----------
function renderClientList() {
  const container = document.getElementById('clientServicesList');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  let services = getServices();
  const filter = document.getElementById('filterService')?.value || '';
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const sortBy = document.getElementById('sortBy')?.value || 'newest';

  if (filter) services = services.filter(s => s.serviceType === filter);
  if (search) {
    services = services.filter(s =>
      s.serviceType.toLowerCase().includes(search) ||
      s.studentName.toLowerCase().includes(search) ||
      (s.notes || '').toLowerCase().includes(search)
    );
  }

  if (sortBy === 'rating') {
    services.sort((a, b) => {
      const ra = getStudentRating(a.studentName);
      const rb = getStudentRating(b.studentName);
      if (rb.avg !== ra.avg) return rb.avg - ra.avg;
      return rb.count - ra.count;
    });
  }

  const slotEl = document.getElementById('slotCount');
  if (slotEl) slotEl.textContent = getServices().length + ' available';

  if (services.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = services.map(s => {
    const rating = getStudentRating(s.studentName);
    return `
    <div class="client-card">
      <div class="service-type">${escapeHtml(s.serviceType)}</div>
      <div class="stylist">by ${escapeHtml(s.studentName)}</div>
      ${starsHtml(rating.avg, rating.count)}
      <div class="time-slot">
        <span>🕐</span>
        <span>${formatTime(s.startTime)} – ${formatTime(s.endTime)}</span>
      </div>
      ${s.notes ? `<div class="notes">${escapeHtml(s.notes)}</div>` : ''}
      <div class="price-tag" style="color:var(--success);">FREE</div>
      <button class="btn-book" onclick="bookWhatsApp(${s.id})">💬 Book via WhatsApp</button>
      <button class="btn-rate" onclick='openRatingModal(${JSON.stringify(s.studentName)})'>⭐ Rate Student</button>
    </div>`;
  }).join('');
}

function bookWhatsApp(id) {
  const services = getServices();
  const s = services.find(item => item.id === id);
  if (!s || !s.whatsapp) {
    alert('No WhatsApp number for this service.');
    return;
  }
  const clientName = sessionStorage.getItem('fullName') || 'Client';
  const clientPhone = sessionStorage.getItem('phone') || '';
  const message = encodeURIComponent(
    `Hello ${s.studentName}! 👋\n\n` +
    `I am ${clientName} and I would like to book:\n` +
    `✨ Service: ${s.serviceType}\n` +
    `🕐 Time: ${formatTime(s.startTime)} – ${formatTime(s.endTime)}\n` +
    `✨ Cost: FREE\n` +
    (clientPhone ? `📱 My number: ${formatPhone(clientPhone)}\n` : '') +
    `\nPlease confirm if you are available. Thank you!\n(GlowUp Ruiru – VX25+XJ)`
  );

  const bookings = getBookings();
  bookings.unshift({
    id: Date.now(), serviceId: s.id, serviceType: s.serviceType,
    studentName: s.studentName, startTime: s.startTime, endTime: s.endTime,
    price: s.price, clientName, clientPhone, bookedAt: new Date().toISOString()
  });
  saveBookings(bookings.slice(0, 20));
  window.open(`https://wa.me/${s.whatsapp}?text=${message}`, '_blank');
  if (typeof renderMyBookings === 'function') renderMyBookings();
}

function renderMyBookings() {
  const container = document.getElementById('myBookingsList');
  if (!container) return;
  const clientPhone = sessionStorage.getItem('phone');
  const mine = getBookings().filter(b => b.clientPhone === clientPhone);
  if (mine.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No bookings yet. Click "Book via WhatsApp" on a service.</p>';
    return;
  }
  container.innerHTML = mine.map(b => `
    <div class="booking-item">
      <div>
        <strong>${escapeHtml(b.serviceType)}</strong>
        <span style="color:var(--text-muted);font-size:0.85rem;"> with ${escapeHtml(b.studentName)}</span>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;">
          ${formatTime(b.startTime)} – ${formatTime(b.endTime)} · FREE
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);">${new Date(b.bookedAt).toLocaleDateString('en-KE')}</div>
    </div>
  `).join('');
}

function showRequestForm() {
  const sec = document.getElementById('requestSection');
  if (sec) { sec.style.display = 'block'; sec.scrollIntoView({ behavior: 'smooth' }); }
}

// ---------- Ratings Modal ----------
let pendingRatingStudent = '';
let selectedStars = 0;

function openRatingModal(studentName) {
  if (!studentName) return;
  pendingRatingStudent = studentName;
  selectedStars = 0;
  const modal = document.getElementById('ratingModal');
  if (!modal) {
    alert('Rating form not found. Please refresh the page.');
    return;
  }
  const nameEl = document.getElementById('ratingStudentName');
  if (nameEl) nameEl.textContent = 'How was your experience with ' + studentName + '?';
  const commentEl = document.getElementById('ratingComment');
  if (commentEl) commentEl.value = '';
  updateStarPicker(0);
  modal.style.display = 'flex';
  // Ensure star clicks work every time modal opens
  setupStarPicker();
}

function closeRatingModal() {
  const modal = document.getElementById('ratingModal');
  if (modal) modal.style.display = 'none';
  pendingRatingStudent = '';
  selectedStars = 0;
}

function setupStarPicker() {
  const picker = document.getElementById('starPicker');
  if (!picker) return;
  // Use onclick so it always works (no duplicate listener issues)
  picker.querySelectorAll('span').forEach(span => {
    span.onclick = function () {
      selectedStars = parseInt(this.getAttribute('data-v'), 10);
      updateStarPicker(selectedStars);
    };
  });
}

function updateStarPicker(n) {
  const picker = document.getElementById('starPicker');
  if (!picker) return;
  picker.querySelectorAll('span').forEach(span => {
    const v = parseInt(span.getAttribute('data-v'), 10);
    if (v <= n) {
      span.classList.add('active');
      span.style.color = 'var(--star)';
    } else {
      span.classList.remove('active');
      span.style.color = '';
    }
  });
}

function submitRating() {
  if (!pendingRatingStudent) {
    alert('No student selected.');
    return;
  }
  if (selectedStars < 1) {
    alert('Please select 1–5 stars.');
    return;
  }
  const comment = (document.getElementById('ratingComment')?.value || '').trim();
  const ratings = getRatings();
  ratings.unshift({
    id: Date.now(),
    studentName: pendingRatingStudent,
    stars: selectedStars,
    comment,
    clientName: sessionStorage.getItem('fullName') || 'Anonymous',
    createdAt: new Date().toISOString()
  });
  saveRatings(ratings);
  closeRatingModal();
  if (typeof renderClientList === 'function') renderClientList();
  alert('Thank you for your rating! ⭐');
}

// Close modal when clicking outside the box
document.addEventListener('click', function (e) {
  const modal = document.getElementById('ratingModal');
  if (modal && e.target === modal) closeRatingModal();
});
