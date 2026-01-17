// ---------------------
// SIMPLE 1-PAGE WEBAPP DEMO
// (Works without database)
// ---------------------

const BOT_USERNAME = "Dsquantitative_bot"; // change later (example: DSQuantitativeRobotBot)
const DEPOSIT_ADDRESS = "0x3abf35cbd97a4236e9da24c6957e332c54706133";

let state = {
  userId: null,
  vip: "VIP0",
  vipDaysTotal: 5,
  vipStart: null,
  ds: 0,
  usdt: 0,
  todayDs: 0,
};

// ----- Telegram WebApp detect -----
function initTelegram() {
  const tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user?.id) state.userId = user.id;

    // Optional: use user first name
    const firstName = user?.first_name || "User";
    document.getElementById("helloUser").innerText = `Hello, ${firstName}`;
  } else {
    // Browser test
    state.userId = 999999999;
    document.getElementById("helloUser").innerText = `Hello, Demo User`;
  }

  document.getElementById("userIdText").innerText = `User ID: ${state.userId}`;
  document.getElementById("depositAddr").innerText = DEPOSIT_ADDRESS;

  // Referral Link based on USERID
  const refLink = `https://t.me/${BOT_USERNAME}?start=${state.userId}`;
  document.getElementById("refLink").innerText = refLink;
}

// ----- Navigation -----
function switchPage(pageName) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  document.getElementById(`page-${pageName}`).classList.add("active");
  document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add("active");
}

// ----- Modals -----
function openModal(id) {
  document.getElementById(id).classList.add("show");
}
function closeAllModals() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
}

// ----- Copy helpers -----
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// ----- VIP Logic (Demo) -----
function startVipNow() {
  if (!state.vipStart) {
    state.vipStart = Date.now();
    state.ds = 0;
    state.usdt = 0;
    state.todayDs = 0;
  }

  // Give today's DS once (demo)
  state.todayDs = 1000;
  state.ds += 1000;

  updateUI();
}

// ----- Exchange -----
function exchangeDsToUsdt(dsAmount) {
  if (dsAmount < 1000) return { ok: false, msg: "Minimum 1000 DS required." };
  if (dsAmount > state.ds) return { ok: false, msg: "Not enough DS balance." };

  const usdtGet = dsAmount / 1000;
  state.ds -= dsAmount;
  state.usdt += usdtGet;

  updateUI();
  return { ok: true, msg: `Exchanged ${dsAmount} DS → ${usdtGet.toFixed(2)} USDT` };
}

// ----- Withdraw -----
function submitWithdraw(address, amount) {
  const msgEl = document.getElementById("withdrawMsg");
  msgEl.innerText = "";

  if (!address || address.length < 10) {
    msgEl.innerText = "❌ Enter valid USDT address.";
    return;
  }
  if (!amount || amount < 5) {
    msgEl.innerText = "❌ Minimum withdrawal is 5 USDT.";
    return;
  }
  if (amount > state.usdt) {
    msgEl.innerText = "❌ Not enough USDT balance.";
    return;
  }

  // demo: reduce balance directly
  state.usdt -= amount;
  updateUI();

  msgEl.innerText = "✅ Withdrawal request submitted (manual approval).";
}

// ----- UI Update -----
function updateUI() {
  const vipText = state.vip;
  document.getElementById("vipStatus").innerText = vipText;
  document.getElementById("vipLevelText").innerText = vipText;
  document.getElementById("vipPill").innerText = vipText;

  document.getElementById("dsBalance").innerText = `${Math.floor(state.ds)} DS`;

  document.getElementById("todayDs").innerText = `${Math.floor(state.todayDs)} DS`;
  document.getElementById("totalDs").innerText = `${Math.floor(state.ds)} DS`;

  document.getElementById("meDs").innerText = `${Math.floor(state.ds)} DS`;
  document.getElementById("meUsdt").innerText = `${state.usdt.toFixed(2)} USDT`;

  // Total assets show USDT only (simple)
  document.getElementById("totalAssets").innerText = `$${state.usdt.toFixed(2)}`;
  document.getElementById("meAssets").innerText = `$${state.usdt.toFixed(2)}`;
  document.getElementById("totalUsdt").innerText = `$${state.usdt.toFixed(2)}`;
}

// ----- Events -----
function bindEvents() {
  // bottom nav
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => switchPage(btn.dataset.page));
  });

  // grid opens modals
  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.open));
  });

  // close modals
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Copy deposit
  document.getElementById("copyDepositBtn").addEventListener("click", async () => {
    const ok = await copyText(DEPOSIT_ADDRESS);
    alert(ok ? "✅ Address Copied" : "❌ Copy failed");
  });

  // Copy referral
  document.getElementById("copyRefBtn").addEventListener("click", async () => {
    const text = document.getElementById("refLink").innerText;
    const ok = await copyText(text);
    alert(ok ? "✅ Referral Copied" : "❌ Copy failed");
  });

  // Start Quantify
  document.getElementById("startQuantifyBtn").addEventListener("click", () => {
    startVipNow();
    alert("✅ Quantify Started: +1000 DS added (demo)");
  });

  // Exchange preview
  const exchangeInput = document.getElementById("exchangeDsInput");
  exchangeInput.addEventListener("input", () => {
    const dsVal = Number(exchangeInput.value || 0);
    const usdtVal = dsVal / 1000;
    document.getElementById("exchangePreview").innerText = `You will get: ${usdtVal.toFixed(2)} USDT`;
  });

  // Exchange button
  document.getElementById("exchangeBtn").addEventListener("click", () => {
    const dsVal = Number(document.getElementById("exchangeDsInput").value || 0);
    const res = exchangeDsToUsdt(dsVal);
    alert(res.ok ? `✅ ${res.msg}` : `❌ ${res.msg}`);
  });

  // Withdraw submit
  document.getElementById("withdrawSubmit").addEventListener("click", () => {
    const addr = document.getElementById("wdAddress").value.trim();
    const amt = Number(document.getElementById("wdAmount").value || 0);
    submitWithdraw(addr, amt);
  });

  // close modal when tapping outside
  document.querySelectorAll(".modal").forEach(m => {
    m.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) closeAllModals();
    });
  });
}

// ----- Start -----
initTelegram();
bindEvents();
updateUI();

