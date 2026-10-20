/* =====================================================
   HOME → INTRO SCROLL   (original, unchanged)
===================================================== */

const heroSequence    = document.querySelector(".hero-sequence");
const handwrittenTitle = document.querySelector(".handwritten-title");
const background      = document.querySelector(".home-background");
const introLayer      = document.querySelector(".intro-layer");
const homeIntro       = document.querySelector(".home-intro");
const homeDescription = document.querySelector(".home-description");
const enterLink       = document.querySelector(".enter-link");
const bottomStatement = document.querySelector(".bottom-statement");
const chapterLinks    = document.querySelectorAll(".chapter");


function animateHero() {

  const rect = heroSequence.getBoundingClientRect();
  const totalDistance = heroSequence.offsetHeight - window.innerHeight;

  let progress = -rect.top / totalDistance;
  progress = Math.max(0, Math.min(progress, 1));

  /* title: stays on screen, only a slight zoom + lift */
  const titleScale = 1 + progress * 0.10;
  const titleMoveY = progress * -30;

  handwrittenTitle.style.transform =
    `translateY(${titleMoveY}px) scale(${titleScale})`;

  /* background: very slight zoom */
  const backgroundScale = 1 + progress * 0.035;
  background.style.transform = `scale(${backgroundScale})`;

  /* home text fades out */
  const homeOpacity = Math.max(0, 1 - progress * 2.2);
  homeIntro.style.opacity = homeOpacity;
  homeDescription.style.opacity = homeOpacity;
  enterLink.style.opacity = homeOpacity;
  bottomStatement.style.opacity = homeOpacity;

  /* intro fades in */
  let introOpacity = (progress - 0.28) / 0.32;
  introOpacity = Math.max(0, Math.min(introOpacity, 1));
  introLayer.style.opacity = introOpacity;

  /* nav: first half HOME, second half INTRO */
  if (progress < 0.4) {
    setActiveChapter("home");
  } else {
    setActiveChapter("intro");
  }
}


function setActiveChapter(sectionName) {
  chapterLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.section === sectionName) {
      link.classList.add("active");
    }
  });
}


/* chapters after the intro: which one is on screen */
function updateOtherSections() {

  const ids = ["ceylon", "twinings", "tazo", "bestea", "book"];

  ids.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const rect = section.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.35 &&
        rect.bottom > window.innerHeight * 0.35) {
      setActiveChapter(id);
    }
  });
}



/* =====================================================
   HELPERS
===================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const mixColor = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));


/* nav colour: dark text over light paper, cream over dark */
function updateNavTone() {
  let tone = "dark";
  $$("[data-nav]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top <= 44 && r.bottom > 44) tone = el.dataset.nav;
  });
  document.body.classList.toggle("on-light", tone === "light");
}

/* thin progress line */
const progressBar = $("#progressBar");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}


/* =====================================================
   REVEAL ON SCROLL
===================================================== */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

$$(".reveal, #scale").forEach((el) => revealObserver.observe(el));

/* lines that light up one after another */
function sequenceOnView(elements, container, delay = 450) {
  if (!elements.length || !container) return;
  const o = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      elements.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * delay));
      o.disconnect();
    }
  }, { threshold: 0.35 });
  o.observe(container);
}

sequenceOnView($$(".cl"), $("#ceylonClosing"), 700);
sequenceOnView($$(".end-line"), $("#ending"), 550);
sequenceOnView($$("#bsChain span"), $("#bsChain"), 450);


/* =====================================================
   01 INTRO — read word by word
===================================================== */

const manifesto = $("#manifesto");
let manifestoWords = [];

if (manifesto) {
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`).join(" ");
  manifestoWords = $$(".w", manifesto);
}

function updateManifesto() {
  if (!manifestoWords.length) return;
  const r = manifesto.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.4));
  const n = Math.round(p * manifestoWords.length);
  manifestoWords.forEach((w, i) => w.classList.toggle("on", i < n));
}


/* =====================================================
   01 INTRO — the accordion unfolds
===================================================== */

$$(".acc-panel").forEach((panel) => {
  panel.style.setProperty("--t", panel.dataset.tone);
  panel.dataset.name = $("h4", panel).textContent.replace(/\s+/g, " ").trim();

  const open = () => {
    $$(".acc-panel").forEach((p) => p.classList.toggle("open", p === panel));
  };
  panel.addEventListener("click", open);
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
});


/* =====================================================
   02 CEYLON — pinned stage that follows the text
===================================================== */

const stageImgs = $$("#ceylonStage .stage-img");
const steps = $$(".step");
const stageNum = $("#stageNum");

/* small screens: each step carries its own picture */
steps.forEach((step, i) => {
  if (!stageImgs[i]) return;
  const fig = document.createElement("img");
  fig.src = stageImgs[i].src;
  fig.alt = "";
  fig.className = "step-fig";
  step.appendChild(fig);
});

if (steps.length) {
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = Number(e.target.dataset.i);
      steps.forEach((s) => s.classList.toggle("on", s === e.target));
      stageImgs.forEach((img, k) => img.classList.toggle("on", k === i));
      if (stageNum) stageNum.textContent = String(i + 1).padStart(2, "0");
    });
  }, { rootMargin: "-42% 0px -42% 0px" });
  steps.forEach((s) => stepObserver.observe(s));
}

/* drag through 1835 → 1870s → today */
const tlTexts = [
  "George Steuart & Company is established in Ceylon.",
  "Coffee plantations decline. The company becomes closely connected to the island’s growing tea industry.",
  "The name 1835 Steuarts Ceylon carries this history forward through its Ceylon tea blends, including Vintage Earl Grey."
];
const tlRange = $("#tlRange");
if (tlRange) {
  const ticks = $$("#timeline .tl-ticks span");
  const setTl = () => {
    const v = Number(tlRange.value);
    ticks.forEach((t, i) => t.classList.toggle("on", i === v));
    $("#tlText").textContent = tlTexts[v];
  };
  tlRange.addEventListener("input", setTl);
  ticks.forEach((t, i) => t.addEventListener("click", () => { tlRange.value = i; setTl(); }));
  setTl();
}

/* the long essay */
const essayBtn = $("#essayBtn");
if (essayBtn) {
  essayBtn.addEventListener("click", () => {
    const open = $("#essay").classList.toggle("open");
    essayBtn.setAttribute("aria-expanded", open);
    $("span", essayBtn).textContent = open ? "CLOSE THE ESSAY" : "READ THE ESSAY";
  });
}


/* =====================================================
   03 TWININGS — wait three minutes
===================================================== */

const bStart = $("#bStart");

if (bStart) {
  const TOTAL = 180;
  const RING = 703.7;
  const bFast = $("#bFast");
  const bTime = $("#bTime");
  const bRing = $("#bRing");
  const bLiquid = $("#bLiquid");
  const bPetals = $("#bPetals");
  const bNote = $("#bNote");
  const ritual = $$("#ritual li");

  const CLEAR = [251, 243, 214];
  const GOLD  = [227, 169, 59];

  let elapsed = 0, speed = 1, running = false, last = 0, timers = [], raf = 0;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function paint() {
    const t = clamp(elapsed / TOTAL);
    bTime.textContent = fmt(Math.max(0, TOTAL - elapsed));
    bRing.style.strokeDashoffset = RING * (1 - t);
    const c = mixColor(CLEAR, GOLD, smooth(t)).map(Math.round);
    bLiquid.style.fill = `rgb(${c.join(",")})`;
    bPetals.style.transform =
      `translate(-50%, -50%) translateY(${t * 22}px) rotate(${t * 40}deg)`;
    bPetals.style.opacity = 1 - t * 0.35;
  }

  function reset() {
    timers.forEach(clearTimeout); timers = [];
    cancelAnimationFrame(raf);
    running = false; elapsed = 0;
    ritual.forEach((li) => li.classList.remove("on"));
    bLiquid.style.transition = "none";
    bLiquid.style.transform = "translateY(215px)";
    paint();
  }

  function tick(now) {
    if (!running) return;
    elapsed += ((now - last) / 1000) * speed;
    last = now;
    if (elapsed >= TOTAL) { elapsed = TOTAL; paint(); finish(); return; }
    paint();
    raf = requestAnimationFrame(tick);
  }

  function finish() {
    running = false;
    bNote.textContent = "The cup gives waiting a beginning and an end.";
    timers.push(setTimeout(() => ritual[4].classList.add("on"), 400));
    timers.push(setTimeout(() => ritual[5].classList.add("on"), 1500));
    bStart.textContent = "BEGIN AGAIN";
    bFast.hidden = true;
  }

  bStart.addEventListener("click", () => {
    reset();
    bNote.textContent = "Nothing happens quickly here.";
    bFast.hidden = false;
    bStart.textContent = "RESTART";

    /* the quick actions */
    [0, 700, 1400].forEach((ms, i) => {
      timers.push(setTimeout(() => ritual[i].classList.add("on"), ms));
    });
    /* pour: the water rises */
    timers.push(setTimeout(() => {
      bLiquid.style.transition = "transform 1.6s cubic-bezier(.2,.7,.2,1), fill 0.4s linear";
      bLiquid.style.transform = "translateY(30px)";
    }, 1400));
    /* the waiting */
    timers.push(setTimeout(() => {
      ritual[3].classList.add("on");
      running = true; last = performance.now();
      raf = requestAnimationFrame(tick);
    }, 2100));
  });

  bFast.addEventListener("click", () => {
    speed = speed === 1 ? 30 : 1;
    bFast.textContent = speed === 1 ? "FAST-FORWARD ×30" : "BACK TO REAL TIME";
  });

  paint();
}


/* =====================================================
   04 TAZO — touch the ingredients, pour the water
===================================================== */

const mqA = $("#mqA"), mqB = $("#mqB");
function updateMarquee() {
  if (!mqA || !mqB) return;
  const r = mqA.parentElement.getBoundingClientRect();
  if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
  const s = window.scrollY * 0.5;
  const unit = mqA.scrollWidth / 3;
  mqA.style.transform = `translateX(${-(s % unit)}px)`;
  mqB.style.transform = `translateX(${-unit + (s % unit)}px)`;
}

const botItems = $$(".bot-item");
const botImgs = $$(".bot-img");
botItems.forEach((item) => {
  item.addEventListener("click", () => {
    const i = Number(item.dataset.i);
    botItems.forEach((b) => b.classList.toggle("on", b === item));
    botImgs.forEach((img, k) => img.classList.toggle("on", k === i));
  });
});

const pourRange = $("#pourRange");
if (pourRange) {
  const liquid = $("#pLiquid");
  const dried = $("#pDried");
  const stage = $("#pStage");
  const chain = $$("#chain li");

  /* [r, g, b, alpha] */
  const C0 = [255, 255, 255, 0.10];
  const C1 = [244, 150, 172, 0.80];
  const C2 = [188, 22, 48, 0.96];
  const marks = [0, 20, 40, 65, 88];

  const paintPour = () => {
    const v = Number(pourRange.value) / 100;
    const c = v < 0.45 ? mixColor(C0, C1, v / 0.45) : mixColor(C1, C2, (v - 0.45) / 0.55);
    liquid.style.fill = `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(2)})`;
    dried.style.opacity = 1 - v * 0.75;
    dried.style.transform = `translate(-50%, -50%) scale(${1 - v * 0.12})`;
    stage.textContent = v < 0.22 ? "ALMOST TRANSPARENT" : v < 0.65 ? "PINK" : "A STRONGER RED";
    chain.forEach((li, i) => li.classList.toggle("on", Number(pourRange.value) >= marks[i]));
  };
  pourRange.addEventListener("input", paintPour);
  paintPour();
}


/* =====================================================
   05 BESTEA — six stages, pinned
===================================================== */

const processEl = $("#process");
const stagesData = [
  ["01", "WITHER",  "Freshly picked leaves are allowed to wither, gradually becoming softer and less rigid."],
  ["02", "BRUISE",  "Movement and handling then change the physical structure of the leaf."],
  ["03", "OXIDIZE", "As the material reacts with air, its color, aroma, and character begin to develop."],
  ["04", "ROLL",    "Rolling changes the leaf again, creating the twisted or compressed forms that remain visible after drying."],
  ["05", "ROAST",   "Heat is eventually introduced to control the transformation and stabilize the material."],
  ["06", "BREW",    "During brewing, dry material begins to absorb water. Leaves soften and expand. Folded forms loosen. Aroma rises from the cup. Color spreads outward."]
];
let prIndex = -1;

function setStage(i) {
  if (i === prIndex) return;
  prIndex = i;
  $("#prNum").textContent = stagesData[i][0];
  $("#prVerb").textContent = stagesData[i][1];
  $("#prText").textContent = stagesData[i][2];
  $$(".pr-img").forEach((img, k) => img.classList.toggle("on", k === i));
  $$("#prList li").forEach((li, k) => li.classList.toggle("on", k === i));
}

function updateProcess() {
  if (!processEl) return;
  const r = processEl.getBoundingClientRect();
  const total = processEl.offsetHeight - window.innerHeight;
  const p = clamp(-r.top / total);
  setStage(Math.min(5, Math.floor(p * 6)));
  $("#prBar").style.transform = `scaleX(${p})`;
}

$$("#prList li").forEach((li) => {
  li.addEventListener("click", () => {
    const i = Number(li.dataset.i);
    const total = processEl.offsetHeight - window.innerHeight;
    const top = processEl.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.5) / 6) * total, behavior: "smooth" });
  });
});

/* wipe: before heat → after heat */
const heatRange = $("#heatRange");
if (heatRange) {
  const cmp = $("#heatCompare");
  const chips = $$("#heatChips li");
  const marksH = [15, 40, 65, 90];
  const paintHeat = () => {
    const v = Number(heatRange.value);
    cmp.style.setProperty("--h", v + "%");
    chips.forEach((c, i) => c.classList.toggle("on", v >= marksH[i]));
  };
  heatRange.addEventListener("input", paintHeat);
  paintHeat();
}


/* =====================================================
   06 THE BOOK — the accordion opens as you scroll
===================================================== */

const foldEl = $("#fold");
const foldCards = $$(".fold-card");

function updateFold() {
  if (!foldEl) return;
  const r = foldEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = smooth(clamp((vh * 0.85 - r.top) / (vh * 0.6)));

  const W = foldCards[0].offsetWidth;
  const n = foldCards.length;
  const maxSpread = (foldEl.clientWidth * 0.92 - W) / (n - 1);
  const spread = Math.min(W * 1.12, maxSpread);
  const packed = W * 0.07;

  foldCards.forEach((card, i) => {
    const k = i - (n - 1) / 2;
    const x = lerp(k * packed, k * spread, p);
    const rot = lerp(k * 1.6, 0, p);
    card.style.transform = `translate(calc(-50% + ${x}px), -50%) rotate(${rot}deg)`;
    card.style.zIndex = i + 1;
  });

  $("#foldMeter").style.transform = `scaleX(${p})`;
  $("#foldState").textContent = p < 0.12 ? "FOLDED" : p > 0.88 ? "OPENED" : "UNFOLDING";
}


/* =====================================================
   SCROLL
===================================================== */

let ticking = false;

function onScroll() {
  animateHero();
  updateOtherSections();
  updateNavTone();
  updateProgress();
  updateManifesto();
  updateMarquee();
  updateProcess();
  updateFold();
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

window.addEventListener("resize", onScroll);

onScroll();


/* chapter covers: reveal on view, word split, box tilt */
(function () {
  document.documentElement.classList.add('js');
  $$('.hx-split').forEach(function (el) {
    var d = parseFloat(el.dataset.d || 1), st = parseFloat(el.dataset.s || .03), n = 0;
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(function (l) {
      return l.trim().split(/\s+/).map(function (w) {
        return '<span class="w" style="animation-delay:' + (d + (n++) * st).toFixed(2) + 's">' + w + '</span>';
      }).join(' ');
    }).join('<br>');
  });
  var heroes = $$('.hx');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    heroes.forEach(function (h) { io.observe(h); });
  } else { heroes.forEach(function (h) { h.classList.add('go'); }); }
  heroes.forEach(function (h) {
    h.addEventListener('mousemove', function (e) {
      var r = h.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      h.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      h.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
  });
})();
