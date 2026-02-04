// script.js
const app = document.getElementById("app");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const container = document.querySelector(".buttons");
const arrowsLayer = document.getElementById("no-arrows");

/* 🔊 SOUND */
const sound = document.getElementById("yesSound");
const noSound = document.getElementById("noSound");

/* unlock audio once (browser policy) */
/* unlock audio once (browser policy) */
window.addEventListener(
  "pointerdown",
  () => {
    // unlock YES sound
    sound.volume = 0.6;
    sound
      .play()
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
      })
      .catch(() => {});

    // unlock NO sound
    noSound.volume = 0.35;
    noSound
      .play()
      .then(() => {
        noSound.pause();
        noSound.currentTime = 0;
      })
      .catch(() => {});
  },
  { once: true },
);

let lastNoSound = 0;
const NO_SOUND_COOLDOWN = 150; // ms

function playNoSound() {
  const now = Date.now();
  if (now - lastNoSound < NO_SOUND_COOLDOWN) return;
  lastNoSound = now;

  noSound.currentTime = 0;
  noSound.volume = 0.35;
  noSound.play().catch(() => {});
}

let yesScale = 1;
const growStep = 0.12;
const maxScale = 2.4;

let lastX = null;
let lastY = null;
let noTransformDisabled = false;

/* ✅ emoji hearts background (combo) */
const bgLayer = document.getElementById("bg-hearts");
const HEARTS = ["💖", "💕", "💘", "💗", "💓", "❤️"];
const BG_HEART_COUNT = 70;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnBgHeart() {
  const el = document.createElement("div");
  el.className = "bg-heart";
  el.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];

  const x = rand(0, 100);
  const size = rand(26, 60);
  const op = rand(0.18, 0.5);
  const dur = rand(10, 22);
  const drift = `${rand(-40, 40)}vw`;
  const rot = `${rand(-180, 180)}deg`;

  el.style.setProperty("--x", `${x}vw`);
  el.style.setProperty("--size", `${size}px`);
  el.style.setProperty("--op", op.toFixed(2));
  el.style.setProperty("--dur", `${dur}s`);
  el.style.setProperty("--drift", drift);
  el.style.setProperty("--rot", rot);

  // randomize start so it's already filled
  el.style.top = `${rand(0, 120)}vh`;

  bgLayer.appendChild(el);
}

for (let i = 0; i < BG_HEART_COUNT; i++) spawnBgHeart();

/* heart burst on YES click */
function heartBurst() {
  const count = 45;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];

    const size = rand(22, 54);
    const dx = `${rand(-42, 42)}vw`;
    const dy = `${rand(-38, 30)}vh`;
    const dur = `${rand(900, 1600)}ms`;

    h.style.setProperty("--size", `${size}px`);
    h.style.setProperty("--dx", dx);
    h.style.setProperty("--dy", dy);
    h.style.setProperty("--dur", dur);

    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}

/* ✅ REPLACE your whole setupPhotoInteractions() with this one */

/* simple red arrow */
const arrowSVG = `
<svg viewBox="0 0 64 64" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 32 H42" stroke="#ff2d2d" stroke-width="6" stroke-linecap="round"/>
  <path d="M38 16 L58 32 L38 48" fill="none" stroke="#ff2d2d" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ring */
const ringSlots = 12;
let placed = 0;
let ring = { cx: 0, cy: 0, rx: 160, ry: 130 };

function computeRing() {
  const cont = container.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  const extra = 70;

  ring.cx = (yes.left + yes.right) / 2 - cont.left;
  ring.cy = (yes.top + yes.bottom) / 2 - cont.top;
  ring.rx = (yes.width / 2) * maxScale + extra;
  ring.ry = (yes.height / 2) * maxScale + extra;
}
computeRing();
window.addEventListener("resize", computeRing);

function addArrow() {
  const i = placed % ringSlots;
  const t = (2 * Math.PI * i) / ringSlots;

  const x = ring.cx + Math.cos(t) * ring.rx;
  const y = ring.cy + Math.sin(t) * ring.ry;
  const angle = (Math.atan2(ring.cy - y, ring.cx - x) * 180) / Math.PI;

  const el = document.createElement("div");
  el.className = "cupid-arrow";
  el.innerHTML = arrowSVG;
  el.style.left = `${x - 23}px`;
  el.style.top = `${y - 23}px`;
  el.style.transform = `rotate(${angle}deg)`;
  arrowsLayer.appendChild(el);

  placed++;
  while (arrowsLayer.children.length > ringSlots) {
    arrowsLayer.removeChild(arrowsLayer.firstChild);
  }
}

function overlapsYes(x, y, margin) {
  const contRect = container.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();

  const yesLeft = yesRect.left - contRect.left - margin;
  const yesTop = yesRect.top - contRect.top - margin;
  const yesRight = yesLeft + yesRect.width + margin * 2;
  const yesBottom = yesTop + yesRect.height + margin * 2;

  const noLeft = x;
  const noTop = y;
  const noRight = x + noBtn.offsetWidth;
  const noBottom = y + noBtn.offsetHeight;

  return !(
    noRight < yesLeft ||
    noLeft > yesRight ||
    noBottom < yesTop ||
    noTop > yesBottom
  );
}

function moveNoAndGrowYes() {
  if (placed < 12) {
    addArrow();
  }

  playNoSound();

  if (!noTransformDisabled) {
    noBtn.style.transform = "none";
    noTransformDisabled = true;

    const c = container.getBoundingClientRect();
    const n = noBtn.getBoundingClientRect();
    lastX = n.left - c.left;
    lastY = n.top - c.top;

    noBtn.style.left = `${lastX}px`;
    noBtn.style.top = `${lastY}px`;
  }

  const padding = 12;
  const minDistance = 90;
  const avoidMargin = 34;
  const maxTries = 250;

  const maxX = container.clientWidth - noBtn.offsetWidth - padding * 2;
  const maxY = container.clientHeight - noBtn.offsetHeight - padding * 2;

  let x,
    y,
    dist = Infinity,
    tries = 0;

  do {
    x = padding + Math.random() * Math.max(0, maxX);
    y = padding + Math.random() * Math.max(0, maxY);

    const dx = x - lastX;
    const dy = y - lastY;
    dist = Math.sqrt(dx * dx + dy * dy);

    tries++;
    if (tries > maxTries) break;
  } while (dist < minDistance || overlapsYes(x, y, avoidMargin));

  lastX = x;
  lastY = y;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  yesScale = Math.min(maxScale, yesScale + growStep);
  yesBtn.style.setProperty("--s", yesScale);
}

/* dodge */
["mouseover", "mousedown", "touchstart"].forEach((evt) => {
  noBtn.addEventListener(
    evt,
    (e) => {
      e.preventDefault();
      moveNoAndGrowYes();
    },
    { passive: false },
  );
});

/* confetti */
function launchConfetti() {
  const colors = ["#ff4d6d", "#ff2d2d", "#ffffff", "#ffd6e0"];
  for (let i = 0; i < 170; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}

/* YES */
yesBtn.addEventListener("click", () => {
  sound.currentTime = 0;
  sound.volume = 1;
  sound.play().catch(() => {});

  app.className = "app-final";
  app.innerHTML = `
    <div class="final-screen">
      <img class="photo p1" src="foto1.jpeg" alt="foto1">
      <img class="photo p2" src="foto2.jpeg" alt="foto2">
      <img class="photo p3" src="foto3.jpeg" alt="foto3">
      <img class="photo p4" src="foto4.jpeg" alt="foto4">
      <img class="photo p5" src="foto5.jpeg" alt="foto5">

      <div class="final-center">
        <h1>😍❤️💕😘😘</h1>
        <p>I love you pookie 💖🐸</p>
      </div>
    </div>
  `;

  launchConfetti();
  heartBurst();
});
