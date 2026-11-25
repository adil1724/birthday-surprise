const CONFIG = {
  birthdayPersonName: 'Someone Special',
  envelopeInitial: 'A',
  targetDateIST: '2026-10-24T00:00:00+05:30',
  musicFile: '',

  stage2BirthdayTitle: 'Happy Birthday Someone Special!',
  stage3BirthdayMessage: 'Happy Birthday Someone Special!',
  stage5FinalWish: 'Once Again, Happy Birthday Someone Special!',

  balloons: [
    {
      id: 1,
      colorName: 'Pink',
      gradient: 'radial-gradient(circle at 30% 30%, #ffd6e0, #ff7597)',
      accent: '#ff7597',
      note: 'Tumhari smile sach mein bahut acchi hai. Hamesha aise hi haste rehna!'
    },
    {
      id: 2,
      colorName: 'Lavender',
      gradient: 'radial-gradient(circle at 30% 30%, #f3e8ff, #b388ff)',
      accent: '#b388ff',
      note: 'Bas wish hai ki tumhari life mein hamesha khushiyan aur acchhe pal rahein.'
    },
    {
      id: 3,
      colorName: 'Baby Blue',
      gradient: 'radial-gradient(circle at 30% 30%, #e0f2fe, #60a5fa)',
      accent: '#60a5fa',
      note: 'Aaj ka din tumhare liye bahut special ho!'
    },
    {
      id: 4,
      colorName: 'Peach',
      gradient: 'radial-gradient(circle at 30% 30%, #ffedd5, #fb923c)',
      accent: '#fb923c',
      note: 'Apne saare goals aur dreams aise hi chase karte rehna!'
    },
    {
      id: 5,
      colorName: 'Red',
      gradient: 'radial-gradient(circle at 30% 30%, #fecdd3, #e11d48)',
      accent: '#e11d48',
      note: 'Tum sach mein bahut amazing insaan ho. Happy Birthday!'
    }
  ],

  letterLines: [
    'Hey Someone Special!',
    'Sabse pehle toh Happy Birthday!',
    'Tumhari baatein aur tumhara nature kisi bhi normal din ko kaafi accha bana deta hai.',
    'Tum jitne genuine aur kind ho, utni hi khushiyan tum deserve karte ho.',
    'Umeed hai tumhare saare sapne jaldi poore hon aur har din naya smile laaye.',
    'Aaj ka din khoob enjoy karo aur hamesha aise hi khush raho!'
  ]
};

const TARGET_TIMESTAMP = new Date(CONFIG.targetDateIST).getTime();

const state = {
  currentStage: 1,
  isUnlocked: false,
  countdownInterval: null,
  activeTimers: [],

  isPullingBow: false,
  balloonPopped: false,
  treeActive: false,

  cakeStep: 0,
  candlesBlown: [false, false, false],
  cakeCelebrationShown: false,

  poppedBalloonsCount: 0,
  allFiveNotesShown: false,

  envelopeOpened: false,
  letterTypingStarted: false
};

function addTimer(fn, ms) {
  const id = setTimeout(fn, ms);
  state.activeTimers.push(id);
  return id;
}

function clearTimers() {
  state.activeTimers.forEach((id) => clearTimeout(id));
  state.activeTimers = [];
}

document.addEventListener('DOMContentLoaded', () => {
  const initialEl = document.getElementById('envelope-initial');
  if (initialEl) initialEl.textContent = CONFIG.envelopeInitial;

  initMusicController();
  startAmbientParticles();
  bindEvents();
  showStage(1);
});

function showStage(stageNum) {
  clearTimers();
  state.currentStage = stageNum;

  document.querySelectorAll('.stage').forEach((sec) => {
    sec.classList.add('hidden');
    sec.classList.remove('fade-out');
  });

  const activeSec = document.getElementById(`stage-${stageNum}`);
  if (activeSec) {
    activeSec.classList.remove('hidden');
  }

  if (stageNum === 1) initStage1();
  if (stageNum === 2) initStage2();
  if (stageNum === 3) initStage3();
  if (stageNum === 4) initStage4();
  if (stageNum === 5) initStage5();
}

function transitionToStage(nextStageNum) {
  const currentSec = document.getElementById(`stage-${state.currentStage}`);
  if (currentSec) {
    currentSec.classList.add('fade-out');
  }
  addTimer(() => {
    showStage(nextStageNum);
  }, 550);
}

function initMusicController() {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const icon = btn.querySelector('.music-icon');
  const label = btn.querySelector('.music-label');

  if (!CONFIG.musicFile) {
    btn.style.display = 'none';
    return;
  }

  audio.src = CONFIG.musicFile;
  let playing = false;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!playing) {
      audio.play().then(() => {
        playing = true;
        icon.textContent = '🎵';
        label.textContent = 'Music On';
      }).catch(() => {});
    } else {
      audio.pause();
      playing = false;
      icon.textContent = '🔇';
      label.textContent = 'Music Off';
    }
  });
}

function startAmbientParticles() {
  const layer = document.getElementById('ambient-layer');
  const symbols = ['✨', '🎈', '🎉', '🌟', '💫'];

  setInterval(() => {
    const el = document.createElement('span');
    el.className = 'ambient-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${14 + Math.random() * 16}px`;
    const duration = 6 + Math.random() * 6;
    el.style.animationDuration = `${duration}s`;
    layer.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, duration * 1000);
  }, 750);
}

function initStage1() {
  state.isUnlocked = false;
  document.getElementById('stage-1').classList.remove('unlocking');
  startCountdown();
}

function startCountdown() {
  clearInterval(state.countdownInterval);

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  function tick() {
    const diff = TARGET_TIMESTAMP - Date.now();

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';

      if (!state.isUnlocked) {
        state.isUnlocked = true;
        clearInterval(state.countdownInterval);
        document.getElementById('stage-1').classList.add('unlocking');
        addTimer(() => {
          transitionToStage(2);
        }, 1200);
      }
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    daysEl.textContent = String(Math.floor(totalSec / 86400)).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0');
    minsEl.textContent = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    secsEl.textContent = String(totalSec % 60).padStart(2, '0');
  }

  tick();
  state.countdownInterval = setInterval(tick, 250);
}

function initStage2() {
  state.isPullingBow = false;
  state.balloonPopped = false;
  state.treeActive = false;

  document.getElementById('stage2-part-a').classList.remove('hidden');
  document.getElementById('stage2-part-b').classList.add('hidden');

  const arrow = document.getElementById('flying-arrow');
  arrow.classList.remove('shoot');
  arrow.style.opacity = '1';
  arrow.style.setProperty('--pull-x', '0px');
  updateBowStringPull(0);

  const balloonBtn = document.getElementById('target-balloon-btn');
  balloonBtn.classList.remove('popped');
  balloonBtn.style.visibility = 'visible';

  document.getElementById('heart-burst-layer').innerHTML = '';
  document.getElementById('stage2-title').textContent = '';
  document.getElementById('tree-hearts-canopy').innerHTML = '';
}

function updateBowStringPull(pullPx) {
  const stringPath = document.getElementById('bow-string-path');
  const pullX = Math.max(-28, Math.min(0, pullPx));
  const midX = 102 + pullX;
  stringPath.setAttribute('d', `M102 16 L${midX} 85 L102 154`);
  document.getElementById('flying-arrow').style.setProperty('--pull-x', `${pullX}px`);
}

function animateBowPullAndShoot() {
  if (state.balloonPopped) return;
  state.balloonPopped = true;

  const bowWrapper = document.getElementById('bow-wrapper');
  const arrow = document.getElementById('flying-arrow');
  const balloonBtn = document.getElementById('target-balloon-btn');

  bowWrapper.classList.add('pulling');
  updateBowStringPull(-24);

  addTimer(() => {
    bowWrapper.classList.remove('pulling');
    updateBowStringPull(0);
    arrow.classList.add('shoot');
  }, 340);

  addTimer(() => {
    arrow.style.opacity = '0';
    balloonBtn.classList.add('popped');
    createBurstParticles();
    document.getElementById('stage2-title').textContent = CONFIG.stage2BirthdayTitle;

    addTimer(() => {
      showHeartTreeAutomatically();
    }, 1800);
  }, 820);
}

function createBurstParticles() {
  const burstLayer = document.getElementById('heart-burst-layer');
  const icons = ['🎉', '✨', '🎈', '🌟', '💫', '🎊'];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('span');
    p.className = 'burst-particle';
    p.textContent = icons[i % icons.length];
    const angle = (Math.PI * 2 * i) / 30;
    const distance = 85 + Math.random() * 120;
    p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    p.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
    burstLayer.appendChild(p);
  }
}

function showHeartTreeAutomatically() {
  if (state.treeActive) return;
  state.treeActive = true;

  document.getElementById('stage2-part-a').classList.add('hidden');
  document.getElementById('stage2-part-b').classList.remove('hidden');

  const trunk = document.getElementById('tree-trunk-group');
  trunk.style.animation = 'none';
  void trunk.offsetWidth;
  trunk.style.animation = '';

  renderHeartTreeCanopy();

  addTimer(() => {
    transitionToStage(3);
  }, 4600);
}

function renderHeartTreeCanopy() {
  const canopy = document.getElementById('tree-hearts-canopy');
  canopy.innerHTML = '';

  const heartColors = ['#ff4d79', '#ff7597', '#ff8fab', '#e11d48', '#ffb3c6', '#fb6f92'];
  const spots = [
    [180, 76], [154, 88], [206, 88], [130, 108], [230, 108],
    [164, 114], [196, 114], [104, 130], [256, 130], [142, 136],
    [180, 136], [218, 136], [82, 152], [278, 152], [118, 158],
    [158, 162], [202, 162], [242, 158], [72, 184], [288, 184],
    [102, 188], [136, 188], [224, 188], [258, 188], [90, 212],
    [270, 212], [122, 212], [238, 212], [180, 102], [148, 174],
    [212, 174], [116, 142], [244, 142], [168, 148], [192, 148]
  ];

  spots.forEach(([cx, cy], idx) => {
    const color = heartColors[idx % heartColors.length];
    const scale = 0.72 + (idx % 4) * 0.14;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${cx}, ${cy}) scale(${scale})`);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0 10 C0 10 -12 1 -12 -6 C-12 -11 -8 -14 -4 -14 C-1.5 -14 0 -12.5 0 -11 C0 -12.5 1.5 -14 4 -14 C8 -14 12 -11 12 -6 C12 1 0 10 0 10 Z');
    path.setAttribute('fill', color);
    path.setAttribute('class', 'tree-leaf-heart');
    path.style.animationDelay = `${0.9 + idx * 0.04}s, ${idx * 0.12}s`;

    g.appendChild(path);
    canopy.appendChild(g);
  });
}

function initStage3() {
  state.cakeStep = 0;
  state.candlesBlown = [false, false, false];
  state.cakeCelebrationShown = false;

  document.getElementById('candle-instruction').classList.add('hidden');
  document.getElementById('cake-birthday-msg').classList.add('hidden');
  document.getElementById('cake-birthday-msg').textContent = '';

  const layers = ['cake-tier-base', 'cake-tier-mid', 'cake-tier-top', 'cake-top-decor'];
  layers.forEach((id) => document.getElementById(id).classList.remove('dropped'));

  document.querySelectorAll('.candle-unit').forEach((c, i) => {
    c.classList.remove('dropped');
    document.getElementById(`flame-${i + 1}`).classList.remove('lit');
    document.getElementById(`smoke-${i + 1}`).classList.remove('puff');
  });

  layers.forEach((id, idx) => {
    addTimer(() => {
      document.getElementById(id).classList.add('dropped');
    }, 350 + idx * 480);
  });

  addTimer(() => {
    [1, 2, 3].forEach((num, idx) => {
      addTimer(() => {
        document.querySelector(`.candle-unit[data-candle="${num}"]`).classList.add('dropped');
        addTimer(() => {
          document.getElementById(`flame-${num}`).classList.add('lit');
          if (num === 3) {
            state.cakeStep = 1;
            document.getElementById('candle-instruction').classList.remove('hidden');
          }
        }, 420);
      }, idx * 480);
    });
  }, 2400);
}

function handleCandleBlow(e, candleNum) {
  e.stopPropagation();
  if (state.cakeStep < 1) return;
  const idx = candleNum - 1;
  if (state.candlesBlown[idx]) return;

  state.candlesBlown[idx] = true;
  const flame = document.getElementById(`flame-${candleNum}`);
  const smoke = document.getElementById(`smoke-${candleNum}`);

  flame.classList.remove('lit');
  smoke.classList.remove('puff');
  void smoke.offsetWidth;
  smoke.classList.add('puff');

  if (state.candlesBlown.every(Boolean)) {
    document.getElementById('candle-instruction').classList.add('hidden');
    addTimer(() => {
      const bdayMsg = document.getElementById('cake-birthday-msg');
      bdayMsg.textContent = CONFIG.stage3BirthdayMessage;
      bdayMsg.classList.remove('hidden');
      state.cakeCelebrationShown = true;
    }, 450);
  }
}

function handleStage3Touch() {
  if (state.cakeCelebrationShown) {
    transitionToStage(4);
  }
}

function initStage4() {
  state.poppedBalloonsCount = 0;
  state.allFiveNotesShown = false;

  const sky = document.getElementById('balloons-sky');
  const stack = document.getElementById('notes-stack');
  sky.innerHTML = '';
  stack.innerHTML = '';
  document.getElementById('all-balloons-done').classList.add('hidden');

  CONFIG.balloons.forEach((b, idx) => {
    const item = document.createElement('div');
    item.className = 'balloon-item';
    item.style.setProperty('--dur', `${2.7 + (idx % 3) * 0.55}s`);
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${b.colorName} Balloon`);

    const body = document.createElement('div');
    body.className = 'balloon-body';
    body.style.background = b.gradient;
    body.style.borderBottomColor = b.accent;

    const str = document.createElement('div');
    str.className = 'balloon-string';

    item.appendChild(body);
    item.appendChild(str);

    const popHandler = (e) => {
      e.stopPropagation();
      if (item.dataset.popped === 'true') return;
      item.dataset.popped = 'true';
      item.classList.add('popping');
      addTimer(() => {
        item.style.visibility = 'hidden';
        revealNextBalloonNote();
      }, 280);
    };

    item.addEventListener('click', popHandler);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') popHandler(e);
    });

    sky.appendChild(item);
  });
}

function revealNextBalloonNote() {
  const noteData = CONFIG.balloons[state.poppedBalloonsCount];
  if (!noteData) return;

  state.poppedBalloonsCount += 1;
  const stack = document.getElementById('notes-stack');

  const card = document.createElement('div');
  card.className = 'note-card';
  card.style.setProperty('--note-accent', noteData.accent);

  const badge = document.createElement('span');
  badge.className = 'note-badge';
  badge.textContent = `Note #${state.poppedBalloonsCount} ✨`;

  const p = document.createElement('p');
  p.className = 'note-text';
  p.textContent = noteData.note;

  card.appendChild(badge);
  card.appendChild(p);
  stack.appendChild(card);

  if (state.poppedBalloonsCount === CONFIG.balloons.length) {
    document.getElementById('all-balloons-done').classList.remove('hidden');
    state.allFiveNotesShown = true;
  }
}

function handleStage4Touch() {
  if (state.allFiveNotesShown) {
    transitionToStage(5);
  }
}

function initStage5() {
  state.envelopeOpened = false;
  state.letterTypingStarted = false;

  document.getElementById('envelope-btn').classList.remove('opened');
  document.getElementById('envelope-scene').classList.remove('hidden');
  document.getElementById('letter-paper-card').classList.add('hidden');
  document.getElementById('letter-lines-container').innerHTML = '';
  document.getElementById('final-celebration-footer').classList.add('hidden');
  document.getElementById('final-wish-banner').textContent = CONFIG.stage5FinalWish;
}

function handleEnvelopeOpen(e) {
  e.stopPropagation();
  if (state.envelopeOpened) return;
  state.envelopeOpened = true;

  document.getElementById('envelope-btn').classList.add('opened');

  addTimer(() => {
    document.getElementById('envelope-scene').classList.add('hidden');
    document.getElementById('letter-paper-card').classList.remove('hidden');

    if (!state.letterTypingStarted) {
      state.letterTypingStarted = true;
      writeLetterByLetter(0);
    }
  }, 850);
}

function writeLetterByLetter(lineIdx) {
  const container = document.getElementById('letter-lines-container');
  const footer = document.getElementById('final-celebration-footer');

  if (lineIdx >= CONFIG.letterLines.length) {
    addTimer(() => {
      footer.classList.remove('hidden');
    }, 450);
    return;
  }

  const lineText = CONFIG.letterLines[lineIdx];
  const p = document.createElement('p');
  p.className = 'letter-line';
  container.appendChild(p);

  const chars = Array.from(lineText);
  let cIdx = 0;

  function nextChar() {
    if (cIdx < chars.length) {
      p.textContent += chars[cIdx];
      cIdx += 1;
      addTimer(nextChar, 38);
    } else {
      addTimer(() => {
        writeLetterByLetter(lineIdx + 1);
      }, 450);
    }
  }

  nextChar();
}

function bindEvents() {
  const bowWrapper = document.getElementById('bow-wrapper');
  let startX = null;

  bowWrapper.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (state.balloonPopped) return;
    startX = e.clientX;
    state.isPullingBow = true;
    bowWrapper.classList.add('pulling');
    bowWrapper.setPointerCapture(e.pointerId);
  });

  bowWrapper.addEventListener('pointermove', (e) => {
    if (!state.isPullingBow || state.balloonPopped) return;
    const dx = e.clientX - startX;
    updateBowStringPull(dx);
  });

  const releaseBow = (e) => {
    if (!state.isPullingBow) return;
    e.stopPropagation();
    state.isPullingBow = false;
    bowWrapper.classList.remove('pulling');
    animateBowPullAndShoot();
  };

  bowWrapper.addEventListener('pointerup', releaseBow);
  bowWrapper.addEventListener('pointercancel', releaseBow);
  bowWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    animateBowPullAndShoot();
  });

  document.getElementById('target-balloon-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    animateBowPullAndShoot();
  });

  document.getElementById('stage-3').addEventListener('click', handleStage3Touch);
  document.getElementById('stage-4').addEventListener('click', handleStage4Touch);

  document.querySelectorAll('.candle-unit').forEach((candleEl) => {
    candleEl.addEventListener('click', (e) => {
      const num = Number(candleEl.dataset.candle);
      handleCandleBlow(e, num);
    });
  });

  document.getElementById('envelope-btn').addEventListener('click', handleEnvelopeOpen);

  document.getElementById('replay-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showStage(1);
  });
}
