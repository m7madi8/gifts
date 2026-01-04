// بيانات أساسية
const STORAGE_KEY = 'carGiftCampaignDataV1';

const cityDefinitions = [
  {
    id: 'ramallah',
    name: 'رام الله والبيرة',
    target: 20000,
    distributors: 2,
    baseline: 0.32,
    zones: ['المنارة', 'شارع الإرسال', 'شارع ركب', 'البيرة – البلدة', 'الماصيون', 'بيرزيت']
  },
  {
    id: 'hebron',
    name: 'الخليل',
    target: 20000,
    distributors: 2,
    baseline: 0.30,
    zones: ['باب الزاوية', 'عين سارة', 'شارع بئر السبع', 'جامعة البوليتكنك', 'الحاووز', 'دورا']
  },
  {
    id: 'nablus',
    name: 'نابلس',
    target: 20000,
    distributors: 2,
    baseline: 0.31,
    zones: ['دوار الشهداء', 'المجمع التجاري', 'رفيديا', 'جامعة النجاح', 'شارع الجامعة', 'البلدة القديمة']
  },
  {
    id: 'bethlehem',
    name: 'بيت لحم',
    target: 10000,
    distributors: 1,
    baseline: 0.28,
    zones: ['بيت ساحور', 'بيت جالا', 'شارع الجامعة', 'منطقة المهد', 'الداون تاون']
  },
  {
    id: 'tulkarm',
    name: 'طولكرم',
    target: 10000,
    distributors: 1,
    baseline: 0.26,
    zones: ['ميدان جمال عبدالناصر', 'أسواق المدينة', 'الجامعة', 'شارع باريس']
  },
  {
    id: 'jenin',
    name: 'جنين',
    target: 10000,
    distributors: 1,
    baseline: 0.24,
    zones: ['وسط البلد', 'مجمع السيارات', 'الأسواق', 'الجامعة العربية الأمريكية']
  },
  {
    id: 'qst',
    name: 'قلقيلية + سلفيت + طوباس',
    target: 10000,
    distributors: 1,
    baseline: 0.22,
    zones: ['قلقيلية', 'سلفيت', 'طوباس']
  }
];

const distributorProfiles = [
  { id: 'dist-01', name: 'أحمد البرغوثي', phone: '0599-100001', cityId: 'ramallah', cityName: 'رام الله والبيرة', area: 'المنارة', assigned: 0 },
  { id: 'dist-02', name: 'محمد شحادة', phone: '0599-100002', cityId: 'ramallah', cityName: 'رام الله والبيرة', area: 'شارع الإرسال', assigned: 0 },
  { id: 'dist-03', name: 'رائد النتشة', phone: '0599-100003', cityId: 'hebron', cityName: 'الخليل', area: 'باب الزاوية', assigned: 0 },
  { id: 'dist-04', name: 'مريم خليل', phone: '0599-100004', cityId: 'hebron', cityName: 'الخليل', area: 'عين سارة', assigned: 0 },
  { id: 'dist-05', name: 'ليلى عوادة', phone: '0599-100005', cityId: 'nablus', cityName: 'نابلس', area: 'رفيديا', assigned: 0 },
  { id: 'dist-06', name: 'نادر دويك', phone: '0599-100006', cityId: 'nablus', cityName: 'نابلس', area: 'شارع الجامعة', assigned: 0 },
  { id: 'dist-07', name: 'سارة زلوم', phone: '0599-100007', cityId: 'bethlehem', cityName: 'بيت لحم', area: 'بيت ساحور', assigned: 0 },
  { id: 'dist-08', name: 'معتصم عودة', phone: '0599-100008', cityId: 'tulkarm', cityName: 'طولكرم', area: 'ميدان جمال عبدالناصر', assigned: 0 },
  { id: 'dist-09', name: 'حسان جرار', phone: '0599-100009', cityId: 'jenin', cityName: 'جنين', area: 'وسط البلد', assigned: 0 },
  { id: 'dist-10', name: 'يوسف القيسي', phone: '0599-100010', cityId: 'qst', cityName: 'قلقيلية + سلفيت + طوباس', area: 'قلقيلية', assigned: 0 }
];

// أدوات مساعدة
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const fmt = (num) => num.toLocaleString('ar-EG');
const sumPayments = (list, id) => list.filter((p) => p.distributorId === id).reduce((s, p) => s + p.amount, 0);
const paymentTotals = (data) => {
  const map = {};
  data.payments.forEach((p) => {
    map[p.distributorId] = (map[p.distributorId] || 0) + p.amount;
  });
  return map;
};
const latestDateFor = (list, id) => {
  const dates = list.filter((p) => p.distributorId === id).map((p) => p.date).sort();
  return dates[dates.length - 1] || '';
};
const normalizeCoupon = (code) => (code || '').trim().toUpperCase();

function exportCSV(rows, filename) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildDefaultData() {
  const distributors = distributorProfiles.map((d) => ({ ...d, sold: 0, status: '' }));

  return {
    meta: {
      campaignName: 'فرصتك أكبر – شارك واربح سيارة أحلامك',
      slogan: 'اشتري كوبونك بـ 3 شيكل وادخل السحب على سيارة حقيقية',
      couponPrice: 3,
      totalCoupons: 100000,
      drawDate: 'بعد العيد (بعد 3 أشهر من الانطلاق)',
      drawLocation: 'يتم تحديده وإعلانه قبل السحب',
      version: '1.6-register'
    },
    cities: cityDefinitions.map((c) => ({
      id: c.id,
      name: c.name,
      target: c.target,
      zones: c.zones
    })),
    distributors,
    dailySales: [],
    payments: [],
    assignments: [],
    participants: []
  };
}

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.meta?.version === '1.6-register') return parsed;
    } catch (_) { /* ignore */ }
  }
  const data = buildDefaultData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// حسابات
function totals(data) {
  const sold = data.distributors.reduce((sum, d) => sum + d.sold, 0);
  const remaining = Math.max(0, data.meta.totalCoupons - sold);
  const revenue = sold * data.meta.couponPrice;
  const progress = clamp(Math.round((sold / data.meta.totalCoupons) * 100), 0, 100);
  return { sold, remaining, revenue, progress };
}

function cityStats(data) {
  return data.cities.map((city) => {
    const related = data.distributors.filter((d) => d.cityId === city.id);
    const sold = related.reduce((s, d) => s + d.sold, 0);
    const assigned = related.reduce((s, d) => s + d.assigned, 0);
    const target = city.target || assigned;
    const remaining = Math.max(0, target - sold);
    const percent = target ? Math.round((sold / target) * 100) : 0;
    return { ...city, sold, assigned, remaining, percent, distributors: related.length };
  });
}

function distributorStatus(d) {
  const ratio = d.assigned ? d.sold / d.assigned : 0;
  if (ratio >= 0.9) return 'completed';
  if (ratio <= 0.5) return 'weak';
  return 'active';
}

// رسم وتحديث الواجهة
const dataState = {
  data: loadData(),
  charts: { city: null, dist: null, daily: null }
};

function renderSummary() {
  const t = totals(dataState.data);
  document.getElementById('totalCoupons').textContent = fmt(dataState.data.meta.totalCoupons);
  document.getElementById('soldCoupons').textContent = fmt(t.sold);
  document.getElementById('remainingCoupons').textContent = fmt(t.remaining);
  document.getElementById('revenue').textContent = `${fmt(t.revenue)} شيكل`;
  document.getElementById('progressPercent').textContent = `${t.progress}%`;
  document.getElementById('progressBarFill').style.width = `${t.progress}%`;
  document.getElementById('progressNote').textContent = t.progress >= 75
    ? 'الإنجاز ممتاز'
    : t.progress >= 40
      ? 'نحتاج تسريع الوتيرة'
      : 'يتطلب حملات ميدانية أقوى';
}

function renderCities() {
  const body = document.getElementById('citiesBody');
  body.innerHTML = '';
  cityStats(dataState.data).forEach((c) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.zones.map((z) => `<span class="tag">${z}</span>`).join('')}</td>
      <td>${fmt(c.target)}</td>
      <td>${c.distributors}</td>
      <td>${fmt(c.sold)}</td>
      <td>${fmt(c.remaining)}</td>
      <td>
        <div class="progress-mini"><span style="width:${c.percent}%"></span></div>
        <small class="muted">${c.percent}%</small>
      </td>
    `;
    body.appendChild(row);
  });
}

function renderDistributors() {
  const body = document.getElementById('distributorsBody');
  body.innerHTML = '';
  const weakList = [];
  const paidMap = paymentTotals(dataState.data);

  dataState.data.distributors.forEach((d) => {
    const status = distributorStatus(d);
    if (status === 'weak') weakList.push(d);
    const remaining = Math.max(0, d.assigned - d.sold);
    const expectedMoney = d.sold * dataState.data.meta.couponPrice;
    const paid = paidMap[d.id] || 0;
    const remainingMoney = Math.max(0, expectedMoney - paid);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${d.phone || '-'}</td>
      <td>${d.cityName}</td>
      <td>${d.area}</td>
      <td>${fmt(d.assigned)}</td>
      <td>${fmt(d.sold)}</td>
      <td>${fmt(remaining)}</td>
      <td>${fmt(expectedMoney)} شيكل</td>
      <td>${fmt(paid)} شيكل</td>
      <td>${fmt(remainingMoney)} شيكل</td>
      <td><span class="status ${status}">${status === 'completed' ? 'مكتمل' : status === 'weak' ? 'ضعيف' : 'نشط'}</span></td>
      <td><button class="ghost edit-btn" data-id="${d.id}">تحديث</button></td>
    `;
    body.appendChild(row);
  });

  document.getElementById('weakCount').textContent = `${weakList.length} موزع أداء ضعيف`;
  const weakUl = document.getElementById('weakList');
  weakUl.innerHTML = weakList.length
    ? weakList.slice(0, 6).map((w) => `<li>${w.name} – ${w.cityName} (${Math.round((w.sold / w.assigned) * 100)}%)</li>`).join('')
    : '<li>لا تنبيهات حالياً</li>';

  const leaders = [...dataState.data.distributors]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = leaders.map((l, i) =>
    `<li>${i + 1}. ${l.name} – ${l.cityName} (${fmt(l.sold)} كوبون)</li>`
  ).join('');

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleEditDistributor(btn.dataset.id));
  });
}

function renderDailyTable() {
  const body = document.getElementById('dailyBody');
  body.innerHTML = '';
  const sorted = [...dataState.data.dailySales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  sorted.forEach((entry) => {
    const dist = dataState.data.distributors.find((d) => d.id === entry.distributorId);
    const cityName = dist ? dist.cityName : 'غير محدد';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${cityName}</td>
      <td>${dist ? dist.name : entry.distributorId}</td>
      <td>${fmt(entry.amount)}</td>
    `;
    body.appendChild(row);
  });
}

function renderPaymentsTable() {
  const body = document.getElementById('paymentsBody');
  if (!body) return;
  body.innerHTML = '';
  const sorted = [...dataState.data.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
  sorted.forEach((p) => {
    const dist = dataState.data.distributors.find((d) => d.id === p.distributorId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.date}</td>
      <td>${dist ? dist.name : p.distributorId}</td>
      <td>${dist ? dist.cityName : 'غير محدد'}</td>
      <td>${fmt(p.amount)} شيكل</td>
      <td>${p.note || '-'}</td>
    `;
    body.appendChild(row);
  });
}

function renderAssignmentsTable() {
  const body = document.getElementById('assignmentsBody');
  if (!body) return;
  body.innerHTML = '';
  const sorted = [...dataState.data.assignments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
  sorted.forEach((p) => {
    const dist = dataState.data.distributors.find((d) => d.id === p.distributorId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.date}</td>
      <td>${dist ? dist.name : p.distributorId}</td>
      <td>${dist ? dist.cityName : 'غير محدد'}</td>
      <td>${fmt(p.amount)} كوبون</td>
      <td>${p.note || '-'}</td>
    `;
    body.appendChild(row);
  });
}

function handleQuickForm(e) {
  e.preventDefault();
  const date = document.getElementById('quickDate').value;
  const distributorId = document.getElementById('quickDistributor').value;
  const assignVal = Number(document.getElementById('quickAssign').value);
  const payVal = Number(document.getElementById('quickPayment').value);
  const note = document.getElementById('quickNote').value.trim();
  if (!date || !distributorId) return;
  const dist = dataState.data.distributors.find((d) => d.id === distributorId);
  if (!dist) return;

  if (assignVal > 0) {
    dist.assigned += assignVal;
    dataState.data.assignments.push({
      date,
      distributorId,
      cityId: dist.cityId,
      amount: assignVal,
      note: note || 'دفعة كوبونات'
    });
  }

  if (payVal > 0) {
    dataState.data.payments.push({
      date,
      distributorId,
      cityId: dist.cityId,
      amount: payVal,
      note: note || 'استلام مبلغ'
    });
  }

  saveData(dataState.data);
  renderAll();
  e.target.reset();
  const qDate = document.getElementById('quickDate');
  if (qDate) qDate.value = date;
}

function fillProfileForm(id) {
  const name = document.getElementById('profileName');
  const phone = document.getElementById('profilePhone');
  const city = document.getElementById('profileCity');
  const area = document.getElementById('profileArea');
  const assigned = document.getElementById('profileAssigned');
  if (!id) {
    name.value = '';
    phone.value = '';
    city.value = dataState.data.cities[0]?.id || '';
    area.value = '';
    assigned.value = 0;
    return;
  }
  const dist = dataState.data.distributors.find((d) => d.id === id);
  if (!dist) return;
  name.value = dist.name;
  phone.value = dist.phone || '';
  city.value = dist.cityId;
  area.value = dist.area;
  assigned.value = dist.assigned;
}

function handleProfileForm(e) {
  e.preventDefault();
  const select = document.getElementById('profileSelect').value;
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const cityId = document.getElementById('profileCity').value;
  const area = document.getElementById('profileArea').value.trim();
  const assignedVal = Number(document.getElementById('profileAssigned').value);
  if (!name || !phone || !cityId || Number.isNaN(assignedVal) || assignedVal < 0) return;
  const cityDef = dataState.data.cities.find((c) => c.id === cityId);
  if (!cityDef) return;
  const existingIdx = dataState.data.distributors.findIndex((d) => d.id === select);
  if (existingIdx >= 0) {
    const dist = dataState.data.distributors[existingIdx];
    dist.name = name;
    dist.phone = phone;
    dist.cityId = cityId;
    dist.cityName = cityDef.name;
    dist.area = area;
    dist.assigned = assignedVal;
    dist.sold = Math.min(dist.sold, dist.assigned);
  } else {
    const newId = `dist-${Date.now()}`;
    dataState.data.distributors.push({
      id: newId,
      name,
      phone,
      cityId,
      cityName: cityDef.name,
      area,
      assigned: assignedVal,
      sold: 0,
      status: ''
    });
  }
  saveData(dataState.data);
  fillSelects();
  renderAll();
  document.getElementById('profileSelect').value = '';
  fillProfileForm('');
}

function renderDetailView() {
  const select = document.getElementById('detailSelect');
  if (!select) return;
  const dist = dataState.data.distributors.find((d) => d.id === select.value);
  const paidMap = paymentTotals(dataState.data);
  const paid = dist ? (paidMap[dist.id] || 0) : 0;
  const lastAssign = dist ? latestDateFor(dataState.data.assignments, dist.id) : '-';
  const lastPay = dist ? latestDateFor(dataState.data.payments, dist.id) : '-';
  const expected = dist ? dist.sold * dataState.data.meta.couponPrice : 0;
  const remainMoney = Math.max(0, expected - paid);
  const remainCoupons = dist ? Math.max(0, dist.assigned - dist.sold) : 0;

  document.getElementById('detailName').textContent = dist ? dist.name : '-';
  document.getElementById('detailPhone').textContent = dist ? (dist.phone || '-') : '-';
  document.getElementById('detailCity').textContent = dist ? dist.cityName : '-';
  document.getElementById('detailArea').textContent = dist ? dist.area : '-';
  document.getElementById('detailAssigned').textContent = dist ? fmt(dist.assigned) : '0';
  document.getElementById('detailSold').textContent = dist ? fmt(dist.sold) : '0';
  document.getElementById('detailRemain').textContent = fmt(remainCoupons);
  document.getElementById('detailExpected').textContent = `${fmt(expected)} شيكل`;
  document.getElementById('detailPaid').textContent = `${fmt(paid)} شيكل`;
  document.getElementById('detailRemainMoney').textContent = `${fmt(remainMoney)} شيكل`;
  document.getElementById('detailLastAssign').textContent = lastAssign || '-';
  document.getElementById('detailLastPayment').textContent = lastPay || '-';

  const assignBody = document.getElementById('detailAssignBody');
  const payBody = document.getElementById('detailPaymentBody');
  const assignRows = dataState.data.assignments
    .filter((a) => a.distributorId === (dist?.id || ''))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
  const payRows = dataState.data.payments
    .filter((p) => p.distributorId === (dist?.id || ''))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  if (assignBody) {
    assignBody.innerHTML = assignRows.map((a) =>
      `<tr><td>${a.date}</td><td>${fmt(a.amount)}</td><td>${a.note || '-'}</td></tr>`
    ).join('');
  }
  if (payBody) {
    payBody.innerHTML = payRows.map((p) =>
      `<tr><td>${p.date}</td><td>${fmt(p.amount)} شيكل</td><td>${p.note || '-'}</td></tr>`
    ).join('');
  }

  const soldInput = document.getElementById('detailSoldValue');
  if (soldInput && dist) soldInput.value = dist.sold;
}

function handleDetailAssignForm(e) {
  e.preventDefault();
  const select = document.getElementById('detailSelect').value;
  const amount = Number(document.getElementById('detailAssignAmount').value);
  const note = document.getElementById('detailAssignNote').value.trim();
  if (!select || !amount || amount <= 0) return;
  const dist = dataState.data.distributors.find((d) => d.id === select);
  if (!dist) return;
  dist.assigned += amount;
  dataState.data.assignments.push({
    date: new Date().toISOString().slice(0, 10),
    distributorId: dist.id,
    cityId: dist.cityId,
    amount,
    note: note || 'دفعة كوبونات'
  });
  saveData(dataState.data);
  renderAll();
  renderDetailView();
  document.getElementById('detailAssignForm').reset();
}

function handleDetailPaymentForm(e) {
  e.preventDefault();
  const select = document.getElementById('detailSelect').value;
  const amount = Number(document.getElementById('detailPaymentAmount').value);
  const note = document.getElementById('detailPaymentNote').value.trim();
  if (!select || !amount || amount <= 0) return;
  const dist = dataState.data.distributors.find((d) => d.id === select);
  if (!dist) return;
  dataState.data.payments.push({
    date: new Date().toISOString().slice(0, 10),
    distributorId: dist.id,
    cityId: dist.cityId,
    amount,
    note: note || 'استلام مبلغ'
  });
  saveData(dataState.data);
  renderAll();
  renderDetailView();
  document.getElementById('detailPaymentForm').reset();
}

function handleDetailSoldForm(e) {
  e.preventDefault();
  const select = document.getElementById('detailSelect').value;
  const soldVal = Number(document.getElementById('detailSoldValue').value);
  if (!select || Number.isNaN(soldVal) || soldVal < 0) return;
  const dist = dataState.data.distributors.find((d) => d.id === select);
  if (!dist) return;
  dist.sold = Math.min(soldVal, dist.assigned);
  saveData(dataState.data);
  renderAll();
  renderDetailView();
}

function exportSingleDistributorFile() {
  const select = document.getElementById('detailSelect');
  if (!select || !select.value) return;
  const d = dataState.data.distributors.find((x) => x.id === select.value);
  if (!d) return;
  const paidMap = paymentTotals(dataState.data);
  const paid = paidMap[d.id] || 0;
  const expected = d.sold * dataState.data.meta.couponPrice;
  const remainingMoney = Math.max(0, expected - paid);
  const remainingCoupons = Math.max(0, d.assigned - d.sold);
  const lastAssign = latestDateFor(dataState.data.assignments, d.id);
  const lastPay = latestDateFor(dataState.data.payments, d.id);
  const rows = [
    ['id', 'name', 'phone', 'city', 'area', 'assigned', 'sold', 'remaining_coupons', 'expected_money', 'paid', 'remaining_money', 'last_assignment', 'last_payment'],
    [d.id, d.name, d.phone || '', d.cityName, d.area, d.assigned, d.sold, remainingCoupons, expected, paid, remainingMoney, lastAssign, lastPay],
    [],
    ['assignments'],
    ['date', 'amount', 'note'],
    ...dataState.data.assignments.filter((a) => a.distributorId === d.id).map((a) => [a.date, a.amount, a.note || '']),
    [],
    ['payments'],
    ['date', 'amount', 'note'],
    ...dataState.data.payments.filter((p) => p.distributorId === d.id).map((p) => [p.date, p.amount, p.note || ''])
  ];
  exportCSV(rows, `${d.id}_detail.csv`);
}

function renderRegistrations() {
  const list = document.getElementById('registerList');
  const total = document.getElementById('registerTotal');
  const table = document.getElementById('registerTableBody');
  if (total) total.textContent = fmt(dataState.data.participants.length);
  if (!list && !table) return;
  const rows = [...dataState.data.participants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);
  if (list) {
    list.innerHTML = rows.map((p) => `<li>${p.name} – ${p.cityName} – كوبون ${p.couponCode} (${p.createdAt.slice(0,10)})</li>`).join('');
  }
  if (table) {
    table.innerHTML = rows.map((p) =>
      `<tr><td>${p.createdAt.slice(0,10)}</td><td>${p.name}</td><td>${p.phone}</td><td>${p.cityName}</td><td>${p.couponCode}</td><td>${p.note || '-'}</td></tr>`
    ).join('');
  }
}

function handleRegisterForm(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const cityId = document.getElementById('regCity').value;
  const couponRaw = document.getElementById('regCoupon').value;
  const note = document.getElementById('regNote').value.trim();
  const agree = document.getElementById('regAgree').checked;
  if (!name || !phone || !cityId || !couponRaw || !agree) return;
  const couponCode = normalizeCoupon(couponRaw);
  if (dataState.data.participants.some((p) => normalizeCoupon(p.couponCode) === couponCode)) {
    alert('هذا الكوبون مسجل بالفعل'); return;
  }
  const city = dataState.data.cities.find((c) => c.id === cityId);
  dataState.data.participants.push({
    id: `reg-${Date.now()}`,
    name,
    phone,
    cityId,
    cityName: city ? city.name : 'غير محدد',
    couponCode,
    note,
    createdAt: new Date().toISOString()
  });
  saveData(dataState.data);
  renderRegistrations();
  e.target.reset();
  document.getElementById('regAgree').checked = false;
  const msg = document.getElementById('registerMsg');
  if (msg) {
    msg.textContent = 'تم تسجيل طلب الاشتراك بنجاح. حظاً سعيداً!';
    setTimeout(() => { msg.textContent = ''; }, 3500);
  }
}

function ensureChart(ref, ctx, config) {
  if (ref && typeof ref.destroy === 'function') ref.destroy();
  return new Chart(ctx, config);
}

function renderCharts() {
  const cityData = cityStats(dataState.data);
  const cityCtx = document.getElementById('cityChart').getContext('2d');
  dataState.charts.city = ensureChart(dataState.charts.city, cityCtx, {
    type: 'bar',
    data: {
      labels: cityData.map((c) => c.name),
      datasets: [
        { label: 'المستهدف', data: cityData.map((c) => c.target), backgroundColor: 'rgba(59,130,246,0.5)' },
        { label: 'مباع', data: cityData.map((c) => c.sold), backgroundColor: 'rgba(34,197,94,0.6)' }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { ticks: { color: '#9fb3d9' } }, y: { ticks: { color: '#9fb3d9' } } } }
  });

  const leaders = [...dataState.data.distributors].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const distCtx = document.getElementById('distributorChart').getContext('2d');
  dataState.charts.dist = ensureChart(dataState.charts.dist, distCtx, {
    type: 'bar',
    data: {
      labels: leaders.map((d) => d.name),
      datasets: [{ label: 'مبيعات', data: leaders.map((d) => d.sold), backgroundColor: 'rgba(59,130,246,0.6)' }]
    },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9fb3d9' } }, y: { ticks: { color: '#9fb3d9' } } } }
  });

  const dailyMap = {};
  dataState.data.dailySales.forEach((d) => {
    dailyMap[d.date] = (dailyMap[d.date] || 0) + d.amount;
  });
  const dates = Object.keys(dailyMap).sort();
  const recentDates = dates.slice(-14);
  const dailyCtx = document.getElementById('dailyChart').getContext('2d');
  dataState.charts.daily = ensureChart(dataState.charts.daily, dailyCtx, {
    type: 'line',
    data: {
      labels: recentDates,
      datasets: [{ label: 'مبيعات', data: recentDates.map((d) => dailyMap[d]), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.18)', tension: 0.25, fill: true }]
    },
    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9fb3d9' } }, y: { ticks: { color: '#9fb3d9' } } } }
  });
}

// تفاعلات
function handleEditDistributor(id) {
  const dist = dataState.data.distributors.find((d) => d.id === id);
  if (!dist) return;
  const soldInput = prompt(`المباع الحالي ${dist.sold}/${dist.assigned}. أدخل قيمة جديدة:`, dist.sold);
  if (soldInput === null) return;
  const soldVal = Number(soldInput);
  if (Number.isNaN(soldVal) || soldVal < 0) return alert('قيمة غير صالحة');

  const assignedInput = prompt(`المسند الحالي ${dist.assigned}. أدخل المسند (اتركه كما هو أو عدّل):`, dist.assigned);
  if (assignedInput !== null) {
    const assignedVal = Number(assignedInput);
    if (!Number.isNaN(assignedVal) && assignedVal > 0) dist.assigned = assignedVal;
  }

  dist.sold = Math.min(soldVal, dist.assigned);
  dist.status = distributorStatus(dist);
  saveData(dataState.data);
  renderAll();
}

function handleDailyForm(e) {
  e.preventDefault();
  const date = document.getElementById('dailyDate').value;
  const cityId = document.getElementById('dailyCity').value;
  const distributorId = document.getElementById('dailyDistributor').value;
  const amount = Number(document.getElementById('dailyAmount').value);
  if (!date || !cityId || !distributorId || !amount || amount <= 0) return;

  const dist = dataState.data.distributors.find((d) => d.id === distributorId);
  if (!dist) return;

  dist.sold = Math.min(dist.assigned, dist.sold + amount);
  dataState.data.dailySales.push({ date, cityId, distributorId, amount });
  saveData(dataState.data);
  renderAll();
  e.target.reset();
}

function handlePaymentForm(e) {
  e.preventDefault();
  const date = document.getElementById('paymentDate').value;
  const distributorId = document.getElementById('paymentDistributor').value;
  const amount = Number(document.getElementById('paymentAmount').value);
  const note = document.getElementById('paymentNote').value.trim();
  if (!date || !distributorId || !amount || amount <= 0) return;
  const dist = dataState.data.distributors.find((d) => d.id === distributorId);
  dataState.data.payments.push({
    date,
    distributorId,
    cityId: dist ? dist.cityId : '',
    amount,
    note
  });
  saveData(dataState.data);
  renderAll();
  e.target.reset();
}

function handleAssignForm(e) {
  e.preventDefault();
  const date = document.getElementById('assignDate').value;
  const distributorId = document.getElementById('assignDistributor').value;
  const amount = Number(document.getElementById('assignAmount').value);
  const note = document.getElementById('assignNote').value.trim();
  if (!date || !distributorId || !amount || amount <= 0) return;
  const dist = dataState.data.distributors.find((d) => d.id === distributorId);
  if (!dist) return;
  dist.assigned += amount;
  dataState.data.assignments.push({
    date,
    distributorId,
    cityId: dist.cityId,
    amount,
    note
  });
  saveData(dataState.data);
  renderAll();
  e.target.reset();
}

function fillSelects() {
  const citySelect = document.getElementById('dailyCity');
  const distSelect = document.getElementById('dailyDistributor');
  const paySelect = document.getElementById('paymentDistributor');
  const assignSelect = document.getElementById('assignDistributor');
  const quickSelect = document.getElementById('quickDistributor');
  const regCitySelect = document.getElementById('regCity');
  citySelect.innerHTML = dataState.data.cities.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  function updateDist() {
    const currentCity = citySelect.value;
    const options = dataState.data.distributors
      .filter((d) => d.cityId === currentCity)
      .map((d) => `<option value="${d.id}">${d.name}</option>`)
      .join('');
    distSelect.innerHTML = options || '<option>لا يوجد موزعون</option>';
  }
  citySelect.addEventListener('change', updateDist);
  updateDist();

  if (paySelect) {
    paySelect.innerHTML = dataState.data.distributors
      .map((d) => `<option value="${d.id}">${d.name} – ${d.cityName}</option>`)
      .join('');
  }

  if (assignSelect) {
    assignSelect.innerHTML = dataState.data.distributors
      .map((d) => `<option value="${d.id}">${d.name} – ${d.cityName}</option>`)
      .join('');
  }

  if (quickSelect) {
    quickSelect.innerHTML = dataState.data.distributors
      .map((d) => `<option value="${d.id}">${d.name} – ${d.cityName}</option>`)
      .join('');
  }

  const profSelect = document.getElementById('profileSelect');
  if (profSelect) {
    profSelect.innerHTML = `<option value="">موزع جديد</option>` + dataState.data.distributors
      .map((d) => `<option value="${d.id}">${d.name} – ${d.cityName}</option>`)
      .join('');
  }

  const profCity = document.getElementById('profileCity');
  if (profCity) {
    profCity.innerHTML = dataState.data.cities.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  if (regCitySelect) {
    regCitySelect.innerHTML = dataState.data.cities.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  }
}

function setThemeFromStorage() {
  const stored = localStorage.getItem('carGiftTheme') || 'dark';
  if (stored === 'light') document.body.classList.add('light-mode');
  updateThemeLabel();
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  localStorage.setItem('carGiftTheme', mode);
  updateThemeLabel();
}

function updateThemeLabel() {
  const text = document.body.classList.contains('light-mode') ? 'وضع ليلي' : 'وضع مضيء';
  document.getElementById('themeToggle').textContent = text;
  document.getElementById('modeButton').textContent = text;
}

function resetData() {
  if (!confirm('هل تريد تصفير البيانات والعودة للقيم الافتراضية؟')) return;
  dataState.data = buildDefaultData();
  saveData(dataState.data);
  renderAll();
  fillSelects();
}

function exportDistributorsFile() {
  const paidMap = paymentTotals(dataState.data);
  const rows = [
    ['id', 'name', 'phone', 'city', 'area', 'assigned', 'sold', 'expected_money', 'paid', 'remaining_money']
  ];
  dataState.data.distributors.forEach((d) => {
    const expected = d.sold * dataState.data.meta.couponPrice;
    const paid = paidMap[d.id] || 0;
    const remaining = Math.max(0, expected - paid);
    rows.push([d.id, d.name, d.phone || '', d.cityName, d.area, d.assigned, d.sold, expected, paid, remaining]);
  });
  exportCSV(rows, 'distributors.csv');
}

function exportPaymentsFile() {
  const rows = [['date', 'distributorId', 'cityId', 'amount', 'note']];
  dataState.data.payments.forEach((p) => {
    rows.push([p.date, p.distributorId, p.cityId, p.amount, p.note || '']);
  });
  exportCSV(rows, 'payments.csv');
}

function exportAssignmentsFile() {
  const rows = [['date', 'distributorId', 'cityId', 'amount', 'note']];
  dataState.data.assignments.forEach((p) => {
    rows.push([p.date, p.distributorId, p.cityId, p.amount, p.note || '']);
  });
  exportCSV(rows, 'assignments.csv');
}

function exportDistributorsFullFile() {
  const rows = [
    ['id', 'name', 'phone', 'city', 'area', 'assigned', 'sold', 'remaining_coupons', 'expected_money', 'paid', 'remaining_money', 'last_assignment', 'last_payment']
  ];
  const paidMap = paymentTotals(dataState.data);
  dataState.data.distributors.forEach((d) => {
    const expected = d.sold * dataState.data.meta.couponPrice;
    const paid = paidMap[d.id] || 0;
    const remainingMoney = Math.max(0, expected - paid);
    const remainingCoupons = Math.max(0, d.assigned - d.sold);
    const lastAssign = latestDateFor(dataState.data.assignments, d.id);
    const lastPay = latestDateFor(dataState.data.payments, d.id);
    rows.push([
      d.id,
      d.name,
      d.phone || '',
      d.cityName,
      d.area,
      d.assigned,
      d.sold,
      remainingCoupons,
      expected,
      paid,
      remainingMoney,
      lastAssign,
      lastPay
    ]);
  });
  exportCSV(rows, 'distributors_full.csv');
}

function renderAll() {
  renderSummary();
  renderCities();
  renderDistributors();
  renderDailyTable();
  renderAssignmentsTable();
  renderPaymentsTable();
  renderCharts();
  renderDetailView();
  renderRegistrations();
}

// بدء التشغيل
document.addEventListener('DOMContentLoaded', () => {
  setThemeFromStorage();
  document.getElementById('drawDateLabel').textContent = dataState.data.meta.drawDate;
  document.getElementById('drawLocationLabel').textContent = `موقع السحب: ${dataState.data.meta.drawLocation}`;
  const today = new Date().toISOString().slice(0, 10);
  const dateField = document.getElementById('dailyDate');
  if (dateField) dateField.value = today;
  document.getElementById('dailyForm').addEventListener('submit', handleDailyForm);
  const payForm = document.getElementById('paymentForm');
  if (payForm) {
    const payDate = document.getElementById('paymentDate');
    if (payDate) payDate.value = today;
    payForm.addEventListener('submit', handlePaymentForm);
  }
  const assignForm = document.getElementById('assignForm');
  if (assignForm) {
    const assignDate = document.getElementById('assignDate');
    if (assignDate) assignDate.value = today;
    assignForm.addEventListener('submit', handleAssignForm);
  }
  const quickForm = document.getElementById('quickForm');
  if (quickForm) {
    const qDate = document.getElementById('quickDate');
    if (qDate) qDate.value = today;
    quickForm.addEventListener('submit', handleQuickForm);
  }
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileForm);
    const profileReset = document.getElementById('profileReset');
    if (profileReset) profileReset.addEventListener('click', () => fillProfileForm(''));
    const profileSelect = document.getElementById('profileSelect');
    if (profileSelect) profileSelect.addEventListener('change', (e) => fillProfileForm(e.target.value));
    fillProfileForm('');
  }
  document.getElementById('resetData').addEventListener('click', resetData);
  document.getElementById('resetButton').addEventListener('click', resetData);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('modeButton').addEventListener('click', toggleTheme);
  const exportDist = document.getElementById('exportDistributors');
  if (exportDist) exportDist.addEventListener('click', exportDistributorsFile);
  const exportDistFull = document.getElementById('exportDistributorsFull');
  if (exportDistFull) exportDistFull.addEventListener('click', exportDistributorsFullFile);
  const exportPay = document.getElementById('exportPayments');
  if (exportPay) exportPay.addEventListener('click', exportPaymentsFile);
  const exportAssign = document.getElementById('exportAssignments');
  if (exportAssign) exportAssign.addEventListener('click', exportAssignmentsFile);
  const exportDistSingle = document.getElementById('exportDistributorSingle');
  if (exportDistSingle) exportDistSingle.addEventListener('click', exportSingleDistributorFile);
  const detailSelect = document.getElementById('detailSelect');
  if (detailSelect) detailSelect.addEventListener('change', renderDetailView);
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const regDate = document.getElementById('regDate');
    if (regDate) regDate.value = today;
    registerForm.addEventListener('submit', handleRegisterForm);
  }
  const exportRegs = document.getElementById('exportRegistrations');
  if (exportRegs) exportRegs.addEventListener('click', () => {
    const rows = [['date','name','phone','city','coupon','note']];
    dataState.data.participants.forEach((p)=> {
      rows.push([p.createdAt.slice(0,10), p.name, p.phone, p.cityName, p.couponCode, p.note||'']);
    });
    exportCSV(rows,'registrations.csv');
  });
  fillSelects();
  renderAll();
});

