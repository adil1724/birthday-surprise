const CONFIG = {
  // Apna Secret Numeric Password yahan set karein:
  secretPassword: '2006',
  birthdayPersonName: 'Adina',
  envelopeInitial: 'A',
  targetDateIST: '2026-10-24T00:00:00+05:30',
  // Custom MP3/OGG file add karne ke liye path set karein, jaise:
  // musicFile: 'assets/audio/romantic-birthday.mp3',
  musicFile: '',

  stage2BirthdayTitle: 'Happy Birthday Adina!',
  stage3BirthdayMessage: 'Happy Birthday Adina!',
  stage5FinalWish: 'Once Again, Happy Birthday Adina!',

  balloons: [
    {
      id: 1,
      colorName: 'Pink',
      gradient: 'radial-gradient(circle at 30% 30%, #ffd6e0, #ff7597)',
      accent: '#ff7597',
      note: 'Some people dont even realise how beautifully they make ordinary moments special. You are one of those people! ♡'
    },
    {
      id: 2,
      colorName: 'Lavender',
      gradient: 'radial-gradient(circle at 30% 30%, #f3e8ff, #b388ff)',
      accent: '#b388ff',
      note: 'Zindagi tumhe hazaar surprises de, but I hope tumhari smile kabhi kisi reason ki mohtaaj na ho. ♡'
    },
    {
      id: 3,
      colorName: 'Baby Blue',
      gradient: 'radial-gradient(circle at 30% 30%, #e0f2fe, #60a5fa)',
      accent: '#60a5fa',
      note: 'A little reminder: You dont have to be perfect to be unforgettable. Apni asli wali self hi tumhari best quality hai!'
    },
    {
      id: 4,
      colorName: 'Peach',
      gradient: 'radial-gradient(circle at 30% 30%, #ffedd5, #fb923c)',
      accent: '#fb923c',
      note: 'May you collect passport stamps, beautiful memories, unexpected opportunities and stories that you will tell with sparkling eyes.'
    },
    {
      id: 5,
      colorName: 'Red',
      gradient: 'radial-gradient(circle at 30% 30%, #fecdd3, #e11d48)',
      accent: '#e11d48',
      note: 'Some girls are pretty, some are sweet, but some have that little extra magic. And today, we are celebrating one of them. That is YOU!'
    }
  ],

  
letterLines: [
  'Hiee Adina! ❤️🥹',
  'Ssoo yaaahhhh, itss 24th of December!',
  "Itss miee favorite person's Birthdayyy obviouslyyy!",
  'And itss youhhhh, Q2! 🎀',
  '~ Happieeeeee Birthdayyyy, Miss Fresher !',
  'Sabse pehle toh Happy Birthdayyy pretty girll!',
  'I am so lucky to hve someone like uhh in myy lyff.',
  'Kuch log bs milte hain aur kuch apni alg si pehchaan bana jaate hainn,',
  'and uhh are definitely one of themmm!',
  'Tumhari baatein aur tumhara nature kisi bhi normal din ko kaafi accha bana deta hai.',
  'Some people dont even realise how beautifully they make ordinary moments special, and youre one of those people!',
  'Tum jitne genuine and kind ho, utni hi khushiyan tum deserve krti ho.',
  'Umeed hai tumhare saare sapne jaldi poore hon aur har din nayi smile laaye.',
  'Mayy Allahh bless uhh with lots of loveee, Happiness nd success in ur lyf.',
  'May all your dreams come true!',
  'Hamesha apni simplicity nd cuteness k sth shine krti rehnaa.',
  'Zindagi tmhe hr woh wjh de muskurane ki joh tum deserve krti hoo.',
  'Youu r one of a kindd, Betuuu!',
  'Never change the way you are, because apni asli wali self hi tumhari best quality hai!',
  'No matters where life takess uss, I promise ill alwyss be there forr uhh.',
  'May you collect beautiful memories, unexpected opportunities and countless reasons to smile.',
  'I hope tumhari life hamesha happiness, laughter nd beautiful surprises se bhari rahe.',
  'Oncee againn a vrryy Happiessttt wala birthdayyyy pretty girll! ❤️',
  '~ Havee a blasstttt Dayyyyy !!',
  'Stay happy, keep smiling and always keep shininggg! ♡',
  'With lots of loveee, just for youuu! 🎀'
]

};

const TARGET_TIMESTAMP = new Date(CONFIG.targetDateIST).getTime();

const state = {
  currentStage: 1,
  isUnlocked: false,
  passwordEnteredDigits: '',
  passwordUnlocked: false,
  passwordTransitioning: false,
  countdownInterval: null,
  activeTimers: [],
  activeIntervals: [],

  isPullingBow: false,
  balloonPopped: false,
  treeActive: false,

  cakeStep: 0,
  candlesBlown: [false, false, false],
  cakeCelebrationShown: false,
  stage3Transitioning: false,

  // Mic blow state
  micStream: null,
  micAudioCtx: null,
  micRafId: null,
  lastBlowTime: 0,

  poppedBalloonsCount: 0,
  allFiveNotesShown: false,

  envelopeOpened: false,
  letterTypingStarted: false,
  letterTypingFinished: false,
  letterTransitioning: false,
  letterUserScrolledUp: false,
  secretRevealed: false,

  // Finale state
  finaleActive: false,
  finaleRafId: null,

  // Audio state
  musicPlaying: false,
  musicVolume: 0.55,
  sfxCtx: null,
  bgmSynthTimer: null,
  bgmFadeTimer: null
};

function addTimer(fn, ms) {
  const id = setTimeout(fn, ms);
  state.activeTimers.push(id);
  return id;
}

function addInterval(fn, ms) {
  const id = setInterval(fn, ms);
  state.activeIntervals.push(id);
  return id;
}

function clearTimers() {
  state.activeTimers.forEach((id) => clearTimeout(id));
  state.activeTimers = [];
  state.activeIntervals.forEach((id) => clearInterval(id));
  state.activeIntervals = [];
}

function isReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ==========================================================================
   SOUND EFFECTS & ROMANTIC BACKGROUND MUSIC ENGINE (Web Audio + HTML5 Audio)
   ========================================================================== */
function getAudioContext() {
  if (!state.sfxCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      state.sfxCtx = new AudioCtx();
    }
  }
  if (state.sfxCtx && state.sfxCtx.state === 'suspended') {
    state.sfxCtx.resume().catch(() => {});
  }
  return state.sfxCtx;
}

function playSoundEffect(type) {
  if (type === 'key-click' && !state.musicPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.value = Math.min(0.45, state.musicVolume * 0.65);
  masterGain.connect(ctx.destination);

  if (type === 'key-click') {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.055);
  } else if (type === 'heart-burst') {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      g.gain.setValueAtTime(0.001, now + i * 0.055);
      g.gain.exponentialRampToValueAtTime(0.28, now + i * 0.055 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.45);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.48);
    });
  } else if (type === 'balloon-pop') {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.11);
    g.gain.setValueAtTime(0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (type === 'candle-blow') {
    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
    noise.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    noise.start(now);
  } else if (type === 'firework') {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.35);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.38);

    [880, 1174.66, 1318.5].forEach((freq, idx) => {
      const sp = ctx.createOscillator();
      const sg = ctx.createGain();
      sp.type = 'sine';
      sp.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.04);
      sg.gain.setValueAtTime(0.12, now + 0.08 + idx * 0.04);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.34 + idx * 0.04);
      sp.connect(sg);
      sg.connect(masterGain);
      sp.start(now + 0.08 + idx * 0.04);
      sp.stop(now + 0.36 + idx * 0.04);
    });
  }
}

function initMusicController() {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const icon = btn.querySelector('.music-icon');
  const label = btn.querySelector('.music-label');
  const volSlider = document.getElementById('music-volume');

  if (CONFIG.musicFile) {
    audio.src = CONFIG.musicFile;
  }

  function updateMusicUI(isPlaying) {
    state.musicPlaying = isPlaying;
    icon.textContent = isPlaying ? '🎵' : '🔇';
    label.textContent = isPlaying ? 'Music On' : 'Music Off';
  }

  function fadeAudioElement(targetVol, durationMs, onComplete) {
    clearInterval(state.bgmFadeTimer);
    const steps = 16;
    const stepTime = durationMs / steps;
    const startVol = audio.volume;
    const delta = (targetVol - startVol) / steps;
    let currentStep = 0;

    state.bgmFadeTimer = setInterval(() => {
      currentStep += 1;
      const nextVol = Math.max(0, Math.min(1, startVol + delta * currentStep));
      audio.volume = nextVol;
      if (currentStep >= steps) {
        clearInterval(state.bgmFadeTimer);
        audio.volume = Math.max(0, Math.min(1, targetVol));
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  function startBuiltInMusicBox() {
    stopBuiltInMusicBox();
    const ctx = getAudioContext();
    if (!ctx) return;

    const melody = [
      261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
      261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
      261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
      466.16, 466.16, 440.00, 349.23, 392.00, 349.23
    ];
    let step = 0;

    function playNextNote() {
      if (!state.musicPlaying) return;
      const c = getAudioContext();
      if (!c) return;
      const now = c.currentTime;
      const freq = melody[step % melody.length];
      step += 1;

      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peak = Math.max(0.001, state.musicVolume * 0.14);
      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.62);

      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    }

    playNextNote();
    state.bgmSynthTimer = setInterval(playNextNote, 680);
  }

  function stopBuiltInMusicBox() {
    if (state.bgmSynthTimer) {
      clearInterval(state.bgmSynthTimer);
      state.bgmSynthTimer = null;
    }
  }

  window.startBackgroundMusic = function () {
    if (state.musicPlaying) return;
    if (CONFIG.musicFile) {
      audio.volume = 0;
      audio.play().then(() => {
        updateMusicUI(true);
        fadeAudioElement(state.musicVolume, 700);
      }).catch(() => {});
    } else {
      updateMusicUI(true);
      startBuiltInMusicBox();
    }
  };

  window.stopBackgroundMusic = function () {
    if (!state.musicPlaying) return;
    if (CONFIG.musicFile) {
      fadeAudioElement(0, 450, () => {
        audio.pause();
        updateMusicUI(false);
      });
    } else {
      stopBuiltInMusicBox();
      updateMusicUI(false);
    }
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!state.musicPlaying) {
      window.startBackgroundMusic();
    } else {
      window.stopBackgroundMusic();
    }
  });

  volSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    state.musicVolume = parseFloat(e.target.value);
    if (CONFIG.musicFile && state.musicPlaying) {
      audio.volume = state.musicVolume;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const initialEl = document.getElementById('envelope-initial');
  if (initialEl) initialEl.textContent = CONFIG.envelopeInitial;

  initMusicController();
  startAmbientParticles();
  bindEvents();
  showStage(1);
});

function showStage(stageId) {
  clearTimers();
  stopMicrophoneBlowDetection();
  stopGrandFinale();
  state.currentStage = stageId;

  const petalsLayer = document.getElementById('rose-petals-layer');
  if (petalsLayer) petalsLayer.innerHTML = '';

  const pwPetalsLayer = document.getElementById('pw-rose-petals-layer');
  if (pwPetalsLayer) pwPetalsLayer.innerHTML = '';

  document.querySelectorAll('.stage').forEach((sec) => {
    sec.classList.add('hidden');
    sec.classList.remove('fade-out');
  });

  const activeSec =
    stageId === 'password'
      ? document.getElementById('stage-password')
      : document.getElementById(`stage-${stageId}`);

  if (activeSec) {
    activeSec.classList.remove('hidden');
  }

  if (stageId === 1) initStage1();
  if (stageId === 'password') initPasswordStage();
  if (stageId === 2) initStage2();
  if (stageId === 3) initStage3();
  if (stageId === 4) initStage4();
  if (stageId === 5) initStage5();
}

function transitionToStage(nextStageId) {
  const currentSec =
    state.currentStage === 'password'
      ? document.getElementById('stage-password')
      : document.getElementById(`stage-${state.currentStage}`);

  if (currentSec) {
    currentSec.classList.add('fade-out');
  }
  addTimer(() => {
    showStage(nextStageId);
  }, 550);
}

function startAmbientParticles() {
  const layer = document.getElementById('ambient-layer');
  const symbols = ['✨', '🎈', '🎉', '🌟', '💫'];

  setInterval(() => {
    if (document.hidden || isReducedMotion()) return;
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
  }, 850);
}

/* ==========================================================================
   STAGE 1: COUNTDOWN -> OPENS PASSWORD LOCK SCREEN AT 00:00:00
   ========================================================================== */
function initStage1() {
  state.isUnlocked = false;
  state.passwordUnlocked = false;
  state.passwordTransitioning = false;
  document.getElementById('stage-1').classList.remove('unlocking');

  const welcomeOverlay = document.getElementById('magical-welcome-overlay');
  if (welcomeOverlay) {
    welcomeOverlay.classList.add('hidden');
    welcomeOverlay.classList.remove('active');
    document.getElementById('welcome-particles-layer').innerHTML = '';
  }
  startCountdown();
}

function playMagicalWelcomeAnimation(onComplete) {
  const overlay = document.getElementById('magical-welcome-overlay');
  const particlesLayer = document.getElementById('welcome-particles-layer');
  if (!overlay || !particlesLayer) {
    onComplete();
    return;
  }

  particlesLayer.innerHTML = '';
  overlay.classList.remove('hidden');
  void overlay.offsetWidth;
  overlay.classList.add('active');

  const icons = ['💖', '✨', '⭐', '💗', '🌟', '💫'];
  const count = isReducedMotion() ? 10 : 28;
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'welcome-magic-particle';
    span.textContent = icons[i % icons.length];
    span.style.left = `${6 + Math.random() * 88}%`;
    span.style.top = `${15 + Math.random() * 72}%`;
    span.style.fontSize = `${14 + Math.random() * 18}px`;
    span.style.animationDelay = `${Math.random() * 0.8}s`;
    particlesLayer.appendChild(span);
  }

  addTimer(() => {
    overlay.classList.remove('active');
    addTimer(() => {
      overlay.classList.add('hidden');
      particlesLayer.innerHTML = '';
      onComplete();
    }, 600);
  }, 2100);
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
          transitionToStage('password');
        }, 950);
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

/* ==========================================================================
   NEW PASSWORD LOCK SCREEN (50/50 SPLIT + DIAL PAD + RIGHT-SIDE ROSE PETALS)
   ========================================================================== */
function getConfiguredPassword() {
  return String(CONFIG.secretPassword || '').trim();
}

function getPasswordMaxDigits() {
  const configured = getConfiguredPassword();
  return configured.length > 0 ? Math.max(configured.length, 4) : 6;
}

function initPasswordStage() {
  state.passwordEnteredDigits = '';
  state.passwordUnlocked = false;
  state.passwordTransitioning = false;

  const pwStage = document.getElementById('stage-password');
  const card = document.getElementById('pw-keypad-card');
  const feedbackEl = document.getElementById('pw-feedback-msg');
  const burstLayer = document.getElementById('pw-success-burst-layer');

  pwStage.classList.remove('pw-entered');
  card.classList.remove('shake', 'unlocked-success');
  feedbackEl.textContent = '';
  feedbackEl.className = 'pw-feedback-msg';
  if (burstLayer) burstLayer.innerHTML = '';

  // Apply staggered delays to keypad buttons
  document.querySelectorAll('#pw-dial-pad .pw-key').forEach((btn, idx) => {
    btn.style.setProperty('--key-delay', `${0.22 + idx * 0.035}s`);
  });

  renderPasswordDots();
  renderPasswordLeftParticles();
  startPasswordRightRosePetals();

  void pwStage.offsetWidth;
  pwStage.classList.add('pw-entered');
}

function renderPasswordDots(isSuccessGlow = false) {
  const dotsRow = document.getElementById('pw-dots-row');
  if (!dotsRow) return;

  const configuredLen = getConfiguredPassword().length;
  const dotCount = configuredLen > 0 ? configuredLen : Math.max(4, state.passwordEnteredDigits.length);
  dotsRow.innerHTML = '';

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('span');
    dot.className = 'pw-dot';
    if (i < state.passwordEnteredDigits.length) {
      dot.classList.add('filled');
    }
    if (isSuccessGlow) {
      dot.classList.add('glow-success');
    }
    dotsRow.appendChild(dot);
  }
}

function renderPasswordLeftParticles() {
  const container = document.getElementById('pw-left-particles');
  if (!container) return;
  container.innerHTML = '';

  const count = isReducedMotion() ? 6 : 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'pw-glow-particle';
    const size = 4 + Math.random() * 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${8 + Math.random() * 84}%`;
    p.style.top = `${10 + Math.random() * 80}%`;
    p.style.animationDuration = `${2.4 + Math.random() * 2.2}s`;
    p.style.animationDelay = `${Math.random() * 1.8}s`;
    container.appendChild(p);
  }
}

function startPasswordRightRosePetals() {
  const layer = document.getElementById('pw-rose-petals-layer');
  if (!layer) return;
  layer.innerHTML = '';

  const MAX_PETALS = 26;

  function spawnRightPetal() {
    if (state.currentStage !== 'password' || isReducedMotion()) return;
    if (layer.childElementCount >= MAX_PETALS) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'pw-falling-petal';

    const shape = document.createElement('span');
    shape.className = 'pw-petal-shape';

    const size = 12 + Math.random() * 13;
    const leftPct = Math.random() * 94;
    const duration = 6.2 + Math.random() * 5.2;
    const sway = (Math.random() - 0.5) * 75;
    const maxOpacity = 0.58 + Math.random() * 0.32;

    wrapper.style.left = `${leftPct}%`;
    wrapper.style.animationDuration = `${duration}s`;
    wrapper.style.setProperty('--petal-size', `${size}px`);
    wrapper.style.setProperty('--petal-sway', `${sway}px`);
    wrapper.style.setProperty('--petal-max-opacity', `${maxOpacity}`);

    const shades = [
      'radial-gradient(circle at 30% 25%, #ffe5ec 0%, #ff8fab 60%, #fb6f92 100%)',
      'radial-gradient(circle at 30% 25%, #ffd6e0 0%, #ff7597 60%, #e11d48 100%)',
      'radial-gradient(circle at 30% 25%, #fff0f5 0%, #ffb3c6 60%, #ff8fab 100%)'
    ];
    shape.style.background = shades[Math.floor(Math.random() * shades.length)];

    wrapper.appendChild(shape);
    layer.appendChild(wrapper);

    addTimer(() => {
      if (wrapper.parentNode) wrapper.remove();
    }, duration * 1000 + 150);
  }

  for (let i = 0; i < 6; i++) {
    addTimer(spawnRightPetal, i * 260);
  }
  addInterval(spawnRightPetal, 560);
}

function animateKeyPressVisual(selectorOrEl) {
  const el =
    typeof selectorOrEl === 'string'
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;
  if (!el) return;
  el.classList.remove('key-pressed');
  void el.offsetWidth;
  el.classList.add('key-pressed');
  setTimeout(() => el.classList.remove('key-pressed'), 160);
}

function handlePasswordDigitInput(digit) {
  if (state.currentStage !== 'password' || state.passwordUnlocked || state.passwordTransitioning) {
    return;
  }
  const cleanDigit = String(digit).replace(/\D/g, '');
  if (cleanDigit.length !== 1) return;

  const maxLen = getPasswordMaxDigits();
  if (state.passwordEnteredDigits.length >= maxLen) return;

  state.passwordEnteredDigits += cleanDigit;
  playSoundEffect('key-click');

  const feedbackEl = document.getElementById('pw-feedback-msg');
  if (feedbackEl && feedbackEl.classList.contains('error')) {
    feedbackEl.textContent = '';
    feedbackEl.className = 'pw-feedback-msg';
  }

  renderPasswordDots(false);
}

function handlePasswordBackspace() {
  if (state.currentStage !== 'password' || state.passwordUnlocked || state.passwordTransitioning) {
    return;
  }
  if (state.passwordEnteredDigits.length === 0) return;
  state.passwordEnteredDigits = state.passwordEnteredDigits.slice(0, -1);
  playSoundEffect('key-click');
  renderPasswordDots(false);
}

function handlePasswordClear() {
  if (state.currentStage !== 'password' || state.passwordUnlocked || state.passwordTransitioning) {
    return;
  }
  state.passwordEnteredDigits = '';
  playSoundEffect('key-click');
  const feedbackEl = document.getElementById('pw-feedback-msg');
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.className = 'pw-feedback-msg';
  }
  renderPasswordDots(false);
}

function triggerPasswordHeartExplosion() {
  const burstLayer = document.getElementById('pw-success-burst-layer');
  if (!burstLayer) return;
  burstLayer.innerHTML = '';

  const icons = ['💖', '💗', '💕', '✨', '🌸', '💓'];
  const count = isReducedMotion() ? 12 : 28;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'pw-heart-burst-item';
    heart.textContent = icons[i % icons.length];
    const angle = (Math.PI * 2 * i) / count;
    const distance = 75 + Math.random() * 145;
    heart.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    heart.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    heart.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
    burstLayer.appendChild(heart);
  }
}

function validateSecretPassword() {
  if (state.currentStage !== 'password' || state.passwordUnlocked || state.passwordTransitioning) {
    return;
  }

  const expected = getConfiguredPassword();
  const entered = state.passwordEnteredDigits;
  const card = document.getElementById('pw-keypad-card');
  const feedbackEl = document.getElementById('pw-feedback-msg');

  // Strict match required; never allow empty or placeholder bypass
  const isConfiguredValid = expected.length > 0 && expected !== 'YOUR_SECRET_PASSWORD';
  const isMatch = isConfiguredValid && entered === expected;

  if (!isMatch) {
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');

    feedbackEl.className = 'pw-feedback-msg error';
    feedbackEl.textContent = !isConfiguredValid
      ? 'Set your secretPassword in script.js first! 💌'
      : 'Oops! Wrong secret password, try again ❤️';

    state.passwordEnteredDigits = '';
    renderPasswordDots(false);
    return;
  }

  // Correct password entered!
  state.passwordUnlocked = true;
  state.passwordTransitioning = true;

  renderPasswordDots(true);
  card.classList.add('unlocked-success');
  feedbackEl.className = 'pw-feedback-msg success';
  feedbackEl.textContent = 'Yay! You Unlocked The Surprise! ❤️';

  playSoundEffect('heart-burst');
  triggerPasswordHeartExplosion();

  addTimer(() => {
    const pwSec = document.getElementById('stage-password');
    if (pwSec) pwSec.classList.add('fade-out');

    addTimer(() => {
      if (pwSec) {
        pwSec.classList.add('hidden');
        pwSec.classList.remove('fade-out');
      }
      const pwPetalsLayer = document.getElementById('pw-rose-petals-layer');
      if (pwPetalsLayer) pwPetalsLayer.innerHTML = '';

      playMagicalWelcomeAnimation(() => {
        showStage(2);
      });
    }, 520);
  }, 1350);
}

/* ==========================================================================
   STAGE 2: CUPID BOW & FEATURE 2 UPGRADED HEART TREE
   ========================================================================== */
function initStage2() {
  state.isPullingBow = false;
  state.balloonPopped = false;
  state.treeActive = false;

  document.getElementById('stage2-part-a').classList.remove('hidden');
  document.getElementById('stage2-part-b').classList.add('hidden');

  const bowWrapper = document.getElementById('bow-wrapper');
  bowWrapper.classList.remove('pulling', 'recoil');

  const arrow = document.getElementById('flying-arrow');
  arrow.classList.remove('shoot');
  arrow.style.opacity = '1';
  arrow.style.setProperty('--pull-x', '0px');
  arrow.style.setProperty('--shoot-x', '0px');
  arrow.style.setProperty('--shoot-y', '0px');
  arrow.style.setProperty('--shoot-deg', '0deg');
  updateBowStringPull(0);

  const balloonBtn = document.getElementById('target-balloon-btn');
  balloonBtn.classList.remove('popped', 'impact-compress');
  balloonBtn.style.visibility = 'visible';

  document.getElementById('heart-burst-layer').innerHTML = '';
  document.getElementById('stage2-title').textContent = '';
  document.getElementById('tree-hearts-canopy').innerHTML = '';
  document.getElementById('tree-fairy-lights').innerHTML = '';
  document.getElementById('tree-fireflies-layer').innerHTML = '';
  document.getElementById('tree-falling-hearts-layer').innerHTML = '';
}

function updateBowStringPull(pullPx) {
  const stringPath = document.getElementById('bow-string-path');
  const bowLimb = document.getElementById('bow-limb');
  const bowLimbInner = document.getElementById('bow-limb-inner');
  const topNock = document.querySelector('#bow-svg circle:nth-of-type(1)');
  const botNock = document.querySelector('#bow-svg circle:nth-of-type(2)');

  const pullX = Math.max(-34, Math.min(0, pullPx));
  const tension = Math.abs(pullX) / 34; // 0 to 1
  const tipX = 48 - tension * 10;
  const topY = 16 + tension * 5;
  const botY = 154 - tension * 5;
  const ctrlX = 118 + tension * 6;
  const innerCtrlX = 112 + tension * 6;
  const midX = tipX + pullX * 0.85;

  if (bowLimb) {
    bowLimb.setAttribute('d', `M${tipX} ${topY} C${ctrlX} 45, ${ctrlX} 125, ${tipX} ${botY}`);
  }
  if (bowLimbInner) {
    bowLimbInner.setAttribute('d', `M${tipX} ${topY} C${innerCtrlX} 47, ${innerCtrlX} 123, ${tipX} ${botY}`);
  }
  if (topNock) {
    topNock.setAttribute('cx', tipX);
    topNock.setAttribute('cy', topY);
  }
  if (botNock) {
    botNock.setAttribute('cx', tipX);
    botNock.setAttribute('cy', botY);
  }
  if (stringPath) {
    stringPath.setAttribute('d', `M${tipX} ${topY} L${midX} 85 L${tipX} ${botY}`);
  }
  const arrowEl = document.getElementById('flying-arrow');
  if (arrowEl) {
    arrowEl.style.setProperty('--pull-x', `${midX - 48}px`);
  }
}

function animateBowPullAndShoot() {
  if (state.balloonPopped) return;
  state.balloonPopped = true;

  const arena = document.getElementById('cupid-arena');
  const bowWrapper = document.getElementById('bow-wrapper');
  const arrow = document.getElementById('flying-arrow');
  const balloonBtn = document.getElementById('target-balloon-btn');
  const balloonSphere = balloonBtn.querySelector('.target-balloon-sphere');

  // Step 1 & 2: Smooth progressive bow draw & string tension
  bowWrapper.classList.add('pulling');
  updateBowStringPull(-12);
  addTimer(() => updateBowStringPull(-24), 110);
  addTimer(() => updateBowStringPull(-32), 220);

  // Step 3 & 4: Release bowstring & calculate exact trajectory to balloon impact point
  addTimer(() => {
    const arenaRect = arena.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();
    const targetRect = (balloonSphere || balloonBtn).getBoundingClientRect();

    // Arrow tip starts at right edge of arrow container
    const startTipX = arrowRect.right - 8;
    const startTipY = arrowRect.top + arrowRect.height / 2;

    // Impact point on the left-center side of the balloon sphere
    const hitX = targetRect.left + targetRect.width * 0.36;
    const hitY = targetRect.top + targetRect.height * 0.48;

    const deltaX = Math.max(90, hitX - startTipX);
    const deltaY = hitY - startTipY;
    const angleDeg = Math.max(-18, Math.min(18, (Math.atan2(deltaY, deltaX) * 180) / Math.PI));

    // Normalized coordinates within cupid-arena for burst & impact flash
    const impactRelX = hitX - arenaRect.left;
    const impactRelY = hitY - arenaRect.top;
    const centerRelX = targetRect.left + targetRect.width / 2 - arenaRect.left;
    const centerRelY = targetRect.top + targetRect.height / 2 - arenaRect.top;

    bowWrapper.classList.remove('pulling');
    updateBowStringPull(0);
    bowWrapper.classList.add('recoil');

    const flightDurationMs = 430;
    arrow.style.setProperty('--shoot-dur', `${flightDurationMs}ms`);
    arrow.style.setProperty('--shoot-x', `${deltaX}px`);
    arrow.style.setProperty('--shoot-y', `${deltaY}px`);
    arrow.style.setProperty('--shoot-deg', `${angleDeg}deg`);
    void arrow.offsetWidth;
    arrow.classList.add('shoot');

    // Step 5 & 6: Arrow visibly reaches balloon -> compress balloon & show impact flash
    addTimer(() => {
      balloonBtn.classList.add('impact-compress');
      createImpactFlash(impactRelX, impactRelY);
    }, flightDurationMs - 35);

    // Step 7 & 8: Balloon bursts suddenly -> fragments, pink sparkles & hearts spread outward
    addTimer(() => {
      arrow.style.opacity = '0';
      balloonBtn.classList.remove('impact-compress');
      balloonBtn.classList.add('popped');
      playSoundEffect('heart-burst');
      createBurstParticles(centerRelX, centerRelY);
      document.getElementById('stage2-title').textContent = CONFIG.stage2BirthdayTitle;

      // Step 9: Existing next birthday animation (Heart Tree) starts smoothly
      addTimer(() => {
        showHeartTreeAutomatically();
      }, 1850);
    }, flightDurationMs + 85);
  }, 360);
}

function createImpactFlash(xPx, yPx) {
  const burstLayer = document.getElementById('heart-burst-layer');
  if (!burstLayer) return;
  const flash = document.createElement('span');
  flash.className = 'impact-flash';
  flash.style.setProperty('--ix', `${xPx}px`);
  flash.style.setProperty('--iy', `${yPx}px`);
  burstLayer.appendChild(flash);
  addTimer(() => flash.remove(), 360);
}

function createBurstParticles(originX, originY) {
  const burstLayer = document.getElementById('heart-burst-layer');
  if (!burstLayer) return;
  burstLayer.innerHTML = '';

  const bx = typeof originX === 'number' ? `${originX}px` : '62%';
  const by = typeof originY === 'number' ? `${originY}px` : '42%';

  // Realistic balloon rubber fragments flying outward
  const fragmentShapes = [
    '65% 35% 70% 30% / 40% 60% 40% 60%',
    '30% 70% 40% 60% / 65% 35% 65% 35%',
    '50% 50% 25% 75% / 55% 45% 70% 30%',
    '75% 25% 60% 40% / 35% 65% 35% 65%'
  ];
  const fragmentCount = isReducedMotion() ? 6 : 14;
  for (let i = 0; i < fragmentCount; i++) {
    const frag = document.createElement('span');
    frag.className = 'balloon-fragment';
    frag.style.setProperty('--bx', bx);
    frag.style.setProperty('--by', by);
    frag.style.setProperty('--fw', `${12 + Math.random() * 11}px`);
    frag.style.setProperty('--fh', `${9 + Math.random() * 9}px`);
    frag.style.setProperty('--frad', fragmentShapes[i % fragmentShapes.length]);

    const angle = (Math.PI * 2 * i) / fragmentCount + (Math.random() - 0.5) * 0.25;
    const distance = 65 + Math.random() * 105;
    frag.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    frag.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    frag.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
    burstLayer.appendChild(frag);
    addTimer(() => frag.remove(), 1000);
  }

  // Pink sparkles and heart particles
  const icons = ['💖', '✨', '💗', '💕', '🌸', '✨', '💓'];
  const particleCount = isReducedMotion() ? 12 : 28;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('span');
    p.className = 'burst-particle';
    p.textContent = icons[i % icons.length];
    p.style.setProperty('--bx', bx);
    p.style.setProperty('--by', by);
    p.style.setProperty('--psize', `${15 + Math.random() * 10}px`);

    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.18;
    const distance = 75 + Math.random() * 125;
    p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    p.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
    burstLayer.appendChild(p);
    addTimer(() => p.remove(), 1150);
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
  renderHeartTreeEnhancements();

  addTimer(() => {
    transitionToStage(3);
  }, 5400);
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
    path.setAttribute('filter', 'url(#heart-glow-filter)');
    path.setAttribute('class', 'tree-leaf-heart');
    path.style.animationDelay = `${0.9 + idx * 0.04}s, ${idx * 0.12}s`;

    g.appendChild(path);
    canopy.appendChild(g);
  });
}

function renderHeartTreeEnhancements() {
  const fairyGroup = document.getElementById('tree-fairy-lights');
  fairyGroup.innerHTML = '';
  const lightCoords = [
    [165, 96], [195, 98], [138, 122], [180, 120], [222, 122],
    [110, 148], [150, 148], [210, 148], [250, 148],
    [94, 176], [132, 176], [180, 166], [228, 176], [266, 176]
  ];

  lightCoords.forEach(([lx, ly], idx) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', lx);
    circle.setAttribute('cy', ly);
    circle.setAttribute('r', '3.5');
    circle.setAttribute('fill', idx % 2 === 0 ? '#fff3b0' : '#ffd166');
    circle.setAttribute('filter', 'url(#fairy-light-glow)');
    circle.setAttribute('class', 'fairy-light-dot');
    circle.style.animationDelay = `${0.8 + idx * 0.15}s`;
    fairyGroup.appendChild(circle);
  });

  const firefliesLayer = document.getElementById('tree-fireflies-layer');
  firefliesLayer.innerHTML = '';
  const fireflyCount = isReducedMotion() ? 4 : 12;
  for (let i = 0; i < fireflyCount; i++) {
    const ff = document.createElement('span');
    ff.className = 'tree-firefly';
    ff.style.left = `${14 + Math.random() * 72}%`;
    ff.style.top = `${16 + Math.random() * 64}%`;
    ff.style.setProperty('--fx-x', `${(Math.random() - 0.5) * 44}px`);
    ff.style.setProperty('--fx-y', `${-14 - Math.random() * 28}px`);
    ff.style.animationDelay = `${Math.random() * 2}s`;
    firefliesLayer.appendChild(ff);
  }

  const fallingLayer = document.getElementById('tree-falling-hearts-layer');
  fallingLayer.innerHTML = '';
  const fallingIcons = ['💗', '💖', '🌸', '💕'];

  function spawnFallingHeart() {
    if (!state.treeActive || state.currentStage !== 2 || isReducedMotion()) return;
    const h = document.createElement('span');
    h.className = 'tree-falling-heart';
    h.textContent = fallingIcons[Math.floor(Math.random() * fallingIcons.length)];
    h.style.left = `${22 + Math.random() * 56}%`;
    h.style.top = `${22 + Math.random() * 24}%`;
    h.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 55}px`);
    fallingLayer.appendChild(h);
    addTimer(() => h.remove(), 4300);
  }

  addTimer(() => {
    spawnFallingHeart();
    addInterval(spawnFallingHeart, 580);
  }, 1100);
}

/* ==========================================================================
   STAGE 3: BIRTHDAY CAKE (FIXED ASSEMBLY + MICROPHONE BLOW + SAFE FALLBACK)
   ========================================================================== */
function initStage3() {
  state.cakeStep = 0;
  state.candlesBlown = [false, false, false];
  state.cakeCelebrationShown = false;
  state.stage3Transitioning = false;

  document.getElementById('candle-instruction').classList.add('hidden');
  document.getElementById('cake-birthday-msg').classList.add('hidden');
  document.getElementById('cake-birthday-msg').textContent = '';
  const touchHint = document.getElementById('cake-touch-continue');
  if (touchHint) touchHint.classList.add('hidden');
  document.getElementById('cake-stage-area').classList.remove('celebration-glow');
  document.getElementById('cake-fireworks-layer').innerHTML = '';

  // Reset all 4 cake layers cleanly with forced reflow so Replay works every time
  const layers = ['cake-tier-base', 'cake-tier-mid', 'cake-tier-top', 'cake-top-decor'];
  layers.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('dropped');
      void el.offsetWidth;
    }
  });

  // Reset all 3 candles, flames, and smoke puffs
  document.querySelectorAll('.candle-unit').forEach((c, i) => {
    c.classList.remove('dropped');
    void c.offsetWidth;
    const flameEl = document.getElementById(`flame-${i + 1}`);
    const smokeEl = document.getElementById(`smoke-${i + 1}`);
    if (flameEl) flameEl.classList.remove('lit');
    if (smokeEl) smokeEl.classList.remove('puff');
  });

  // 1. Bottom -> 2. Middle -> 3. Top -> 4. Top Decoration
  layers.forEach((id, idx) => {
    addTimer(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('dropped');
    }, 320 + idx * 460);
  });

  // 5. Three candles appear one by one -> 6. Flames light up -> 7. Interaction unlocked
  addTimer(() => {
    [1, 2, 3].forEach((num, idx) => {
      addTimer(() => {
        const candleEl = document.querySelector(`.candle-unit[data-candle="${num}"]`);
        if (candleEl) candleEl.classList.add('dropped');
      }, idx * 420);
    });

    // Light all three flames once the candles have landed
    addTimer(() => {
      [1, 2, 3].forEach((num, idx) => {
        addTimer(() => {
          const flameEl = document.getElementById(`flame-${num}`);
          if (flameEl) flameEl.classList.add('lit');
          if (num === 3) {
            state.cakeStep = 1;
            document.getElementById('candle-instruction').classList.remove('hidden');
            // Silently enable mic blow detection in background (falls back smoothly to candle tap)
            startMicrophoneBlowDetection();
          }
        }, idx * 180);
      });
    }, 1450);
  }, 2250);
}

function extinguishSingleCandle(candleNum) {
  if (state.cakeStep < 1) return false;
  const idx = candleNum - 1;
  if (state.candlesBlown[idx]) return false;

  state.candlesBlown[idx] = true;
  const flame = document.getElementById(`flame-${candleNum}`);
  const smoke = document.getElementById(`smoke-${candleNum}`);

  flame.classList.remove('lit');
  smoke.classList.remove('puff');
  void smoke.offsetWidth;
  smoke.classList.add('puff');
  playSoundEffect('candle-blow');

  if (state.candlesBlown.every(Boolean)) {
    stopMicrophoneBlowDetection();
    document.getElementById('candle-instruction').classList.add('hidden');

    // Wait for candle smoke/extinguish animation to complete before showing Touch to Continue
    addTimer(() => {
      document.getElementById('cake-stage-area').classList.add('celebration-glow');
      triggerCakeMiniFireworks();
      playSoundEffect('firework');

      const bdayMsg = document.getElementById('cake-birthday-msg');
      bdayMsg.textContent = CONFIG.stage3BirthdayMessage;
      bdayMsg.classList.remove('hidden');

      const touchHint = document.getElementById('cake-touch-continue');
      if (touchHint) touchHint.classList.remove('hidden');
      state.cakeCelebrationShown = true;
    }, 950);
  }
  return true;
}

function handleCandleBlow(e, candleNum) {
  e.stopPropagation();
  extinguishSingleCandle(candleNum);
}

function blowNextLitCandle() {
  if (state.cakeStep < 1) return;
  const nextIdx = state.candlesBlown.findIndex((blown) => !blown);
  if (nextIdx !== -1) {
    extinguishSingleCandle(nextIdx + 1);
  }
}

function triggerCakeMiniFireworks() {
  const layer = document.getElementById('cake-fireworks-layer');
  if (!layer) return;
  layer.innerHTML = '';

  const colors = ['#ff4d79', '#ffd166', '#b388ff', '#ff8fab', '#ffffff'];
  const origins = [
    { x: '24%', y: '26%' },
    { x: '76%', y: '24%' },
    { x: '50%', y: '18%' }
  ];

  origins.forEach((origin, oIdx) => {
    addTimer(() => {
      for (let i = 0; i < 18; i++) {
        const spark = document.createElement('span');
        spark.className = 'mini-firework-spark';
        spark.style.left = origin.x;
        spark.style.top = origin.y;
        spark.style.background = colors[i % colors.length];
        spark.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
        const angle = (Math.PI * 2 * i) / 18;
        const dist = 42 + Math.random() * 55;
        spark.style.setProperty('--fx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--fy', `${Math.sin(angle) * dist}px`);
        layer.appendChild(spark);
        addTimer(() => spark.remove(), 1200);
      }
    }, oIdx * 280);
  });
}

async function startMicrophoneBlowDetection() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return;
  }

  try {
    stopMicrophoneBlowDetection();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (state.currentStage !== 3 || state.candlesBlown.every(Boolean)) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    state.micStream = stream;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    state.micAudioCtx = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function detectBlowLoop() {
      if (!state.micStream || state.currentStage !== 3 || state.candlesBlown.every(Boolean)) {
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      const bins = Math.min(32, dataArray.length);
      for (let i = 0; i < bins; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bins;

      const now = Date.now();
      if (avg > 62 && now - state.lastBlowTime > 480) {
        state.lastBlowTime = now;
        blowNextLitCandle();
      }

      state.micRafId = requestAnimationFrame(detectBlowLoop);
    }

    detectBlowLoop();
  } catch (err) {
    // Mic permission unavailable; tapping candles or cake area serves as fallback
  }
}

function stopMicrophoneBlowDetection() {
  if (state.micRafId) {
    cancelAnimationFrame(state.micRafId);
    state.micRafId = null;
  }
  if (state.micStream) {
    state.micStream.getTracks().forEach((track) => track.stop());
    state.micStream = null;
  }
  if (state.micAudioCtx) {
    state.micAudioCtx.close().catch(() => {});
    state.micAudioCtx = null;
  }
}

function handleStage3Touch(e) {
  if (e && e.target && e.target.closest('#music-controller')) return;
  // Fallback when mic is unavailable: tapping the cake/assembly blows the next lit candle
  if (state.cakeStep >= 1 && !state.candlesBlown.every(Boolean)) {
    if (e && e.target && e.target.closest('#cake-stage-area') && !e.target.closest('.candle-unit')) {
      blowNextLitCandle();
    }
    return;
  }
  if (state.cakeCelebrationShown && !state.stage3Transitioning) {
    state.stage3Transitioning = true;
    transitionToStage(4);
  }
}

/* ==========================================================================
   STAGE 4: FIVE SURPRISE BALLOONS
   ========================================================================== */
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
      playSoundEffect('balloon-pop');
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
  const noteNum = state.poppedBalloonsCount;
  const stack = document.getElementById('notes-stack');

  const card = document.createElement('div');
  card.className = `note-card note-theme-${noteNum}`;
  card.style.setProperty('--note-accent', noteData.accent);

  const badgeIcons = {
    1: '💖',
    2: '💎',
    3: '💌',
    4: '✨',
    5: '🎀'
  };
  const cornerIcons = {
    1: '💖 ✨',
    2: '💎 ✧',
    3: '♡',
    4: '✦',
    5: '♡'
  };

  const badge = document.createElement('span');
  badge.className = 'note-badge';
  badge.textContent = `Note #${noteNum} ${badgeIcons[noteNum] || '✨'}`;

  // Decorative satin-style ribbon bow SVG
  const bowColor = noteNum === 1 ? '#ff4d79' : noteNum === 2 ? '#a855f7' : '#ff8fab';
  const bowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  bowSvg.setAttribute('viewBox', '0 0 40 28');
  bowSvg.setAttribute('class', 'note-bow-deco');
  bowSvg.setAttribute('aria-hidden', 'true');
  bowSvg.innerHTML = `
    <path d="M20 14 L5 5 C2 10, 2 18, 5 23 Z" fill="${bowColor}" opacity="0.88"/>
    <path d="M20 14 L35 5 C38 10, 38 18, 35 23 Z" fill="${bowColor}" opacity="0.88"/>
    <path d="M18 16 L12 26 L16 26 L20 18 L24 26 L28 26 L22 16 Z" fill="${bowColor}" opacity="0.75"/>
    <circle cx="20" cy="14" r="3.6" fill="#ffd166"/>
  `;

  if (noteNum === 1 || noteNum === 2) {
    const sparkle = document.createElement('span');
    sparkle.className = 'note-sparkle-dot';
    sparkle.setAttribute('aria-hidden', 'true');
    sparkle.textContent = '✨';
    card.appendChild(sparkle);
  }

  const corner = document.createElement('span');
  corner.className = 'note-corner-deco';
  corner.setAttribute('aria-hidden', 'true');
  corner.textContent = cornerIcons[noteNum] || '♡';

  const p = document.createElement('p');
  p.className = 'note-text';
  p.textContent = noteData.note;

  card.appendChild(badge);
  card.appendChild(bowSvg);
  card.appendChild(p);
  card.appendChild(corner);
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

/* ==========================================================================
   STAGE 5: SECRET BIRTHDAY LETTER + ROSE PETALS + FEATURE 5 GRAND FINALE
   ========================================================================== */
function initStage5() {
  state.envelopeOpened = false;
  state.letterTypingStarted = false;
  state.letterTypingFinished = false;
  state.letterTransitioning = false;
  state.letterUserScrolledUp = false;
  state.secretRevealed = false;
  stopGrandFinale();

  document.getElementById('envelope-btn').classList.remove('opened');
  document.getElementById('envelope-scene').classList.remove('hidden');
  document.getElementById('letter-paper-card').classList.add('hidden');
  document.getElementById('letter-lines-container').innerHTML = '';
  const viewport = document.getElementById('letter-scroll-viewport');
  if (viewport) viewport.scrollTop = 0;
  const heartOrnament = document.getElementById('letter-end-heart-ornament');
  if (heartOrnament) heartOrnament.classList.add('hidden');
  document.getElementById('secret-msg-section').classList.add('hidden');
  document.getElementById('secret-msg-reveal').classList.add('hidden');
  document.getElementById('secret-msg-btn').classList.remove('hidden');
  document.getElementById('final-celebration-footer').classList.add('hidden');
  const letterTouchHint = document.getElementById('letter-touch-continue');
  if (letterTouchHint) letterTouchHint.classList.add('hidden');
  document.getElementById('final-wish-banner').textContent = CONFIG.stage5FinalWish;

  startFloatingRosePetals();
}

function autoScrollLetterIfFollowing() {
  const viewport = document.getElementById('letter-scroll-viewport');
  if (!viewport || state.letterUserScrolledUp) return;
  viewport.scrollTop = viewport.scrollHeight;
}

function startFloatingRosePetals() {
  const layer = document.getElementById('rose-petals-layer');
  if (!layer) return;
  layer.innerHTML = '';
  const petals = ['🌸', '🌹', '💮', '🌺'];

  function spawnPetal() {
    if (state.currentStage !== 5 || isReducedMotion()) return;
    const p = document.createElement('span');
    p.className = 'rose-petal';
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${14 + Math.random() * 12}px`;
    const dur = 6 + Math.random() * 4.5;
    p.style.animationDuration = `${dur}s`;
    p.style.setProperty('--petal-sway', `${(Math.random() - 0.5) * 90}px`);
    layer.appendChild(p);
    addTimer(() => p.remove(), dur * 1000);
  }

  spawnPetal();
  addInterval(spawnPetal, 750);
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
  const secretSection = document.getElementById('secret-msg-section');
  const footer = document.getElementById('final-celebration-footer');
  const heartOrnament = document.getElementById('letter-end-heart-ornament');

  if (lineIdx >= CONFIG.letterLines.length) {
    addTimer(() => {
      if (heartOrnament) heartOrnament.classList.remove('hidden');
      secretSection.classList.remove('hidden');
      footer.classList.remove('hidden');
      const letterTouchHint = document.getElementById('letter-touch-continue');
      if (letterTouchHint) letterTouchHint.classList.remove('hidden');
      state.letterTypingFinished = true;
      autoScrollLetterIfFollowing();
    }, 450);
    return;
  }

  const lineText = CONFIG.letterLines[lineIdx];
  const p = document.createElement('p');
  p.className = 'letter-line';
  if (lineIdx === CONFIG.letterLines.length - 1) {
    p.classList.add('appended-hinglish-line');
  }
  container.appendChild(p);
  autoScrollLetterIfFollowing();

  const chars = Array.from(lineText);
  let cIdx = 0;
  const charDelay = lineIdx === CONFIG.letterLines.length - 1 ? 24 : 36;

  function nextChar() {
    if (cIdx < chars.length) {
      p.textContent += chars[cIdx];
      cIdx += 1;
      if (cIdx % 4 === 0 || chars[cIdx - 1] === '\n') {
        autoScrollLetterIfFollowing();
      }
      addTimer(nextChar, charDelay);
    } else {
      autoScrollLetterIfFollowing();
      addTimer(() => {
        writeLetterByLetter(lineIdx + 1);
      }, 420);
    }
  }

  nextChar();
}

/* ==========================================================================
   FEATURE 5: GRAND FINALE FIREWORKS CELEBRATION
   ========================================================================== */
function launchGrandFinale() {
  if (state.finaleActive) return;
  state.finaleActive = true;

  const overlay = document.getElementById('grand-finale-overlay');
  const canvas = document.getElementById('finale-fireworks-canvas');
  const floatLayer = document.getElementById('finale-floating-layer');
  if (!overlay || !canvas) return;

  overlay.classList.remove('hidden');
  void overlay.offsetWidth;
  overlay.classList.add('visible');

  playSoundEffect('firework');

  const ctx = canvas.getContext('2d');
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  overlay._resizeHandler = resizeCanvas;

  const particles = [];
  const palette = ['#ff4d79', '#ffd166', '#ff8fab', '#f3e8ff', '#ffb703', '#ffffff'];

  function spawnFireworkShell() {
    if (!state.finaleActive) return;
    const x = canvas.width * (0.18 + Math.random() * 0.64);
    const y = canvas.height * (0.14 + Math.random() * 0.42);
    const count = isReducedMotion() ? 22 : 52;
    const baseColor = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.12;
      const speed = 1.6 + Math.random() * 3.8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.012,
        color: i % 3 === 0 ? '#ffd166' : baseColor,
        size: 2 + Math.random() * 2.2
      });
    }
    playSoundEffect('firework');
  }

  function spawnConfettiAndHearts() {
    if (!state.finaleActive || isReducedMotion()) return;
    const items = ['💖', '✨', '🎊', '💗', '⭐', '🌟'];
    const el = document.createElement('span');
    el.className = 'finale-float-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${16 + Math.random() * 16}px`;
    const dur = 4.5 + Math.random() * 3.5;
    el.style.animationDuration = `${dur}s`;
    floatLayer.appendChild(el);
    addTimer(() => el.remove(), dur * 1000);
  }

  spawnFireworkShell();
  spawnConfettiAndHearts();
  addInterval(spawnFireworkShell, 1150);
  addInterval(spawnConfettiAndHearts, 420);

  function renderFireworksFrame() {
    if (!state.finaleActive) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    state.finaleRafId = requestAnimationFrame(renderFireworksFrame);
  }

  renderFireworksFrame();
}

function stopGrandFinale() {
  state.finaleActive = false;
  if (state.finaleRafId) {
    cancelAnimationFrame(state.finaleRafId);
    state.finaleRafId = null;
  }
  const overlay = document.getElementById('grand-finale-overlay');
  const canvas = document.getElementById('finale-fireworks-canvas');
  const floatLayer = document.getElementById('finale-floating-layer');
  if (overlay) {
    if (overlay._resizeHandler) {
      window.removeEventListener('resize', overlay._resizeHandler);
      overlay._resizeHandler = null;
    }
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
  }
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (floatLayer) {
    floatLayer.innerHTML = '';
  }
}

/* ==========================================================================
   EVENT BINDINGS & FULL EXPERIENCE REPLAY
   ========================================================================== */
function resetEntireExperience() {
  clearTimers();
  clearInterval(state.countdownInterval);
  stopMicrophoneBlowDetection();
  stopGrandFinale();
  if (window.stopBackgroundMusic) {
    window.stopBackgroundMusic();
  }
  showStage(1);
}

function bindEvents() {
  const autoStartMusicOnce = () => {
    if (!state.musicPlaying && window.startBackgroundMusic) {
      window.startBackgroundMusic();
    }
    document.removeEventListener('pointerdown', autoStartMusicOnce);
  };
  document.addEventListener('pointerdown', autoStartMusicOnce, { once: true });

  // Password Lock Screen Keypad & Controls
  document.querySelectorAll('#pw-dial-pad .pw-key[data-digit]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      animateKeyPressVisual(btn);
      handlePasswordDigitInput(btn.dataset.digit);
    });
  });

  document.getElementById('pw-clear-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    animateKeyPressVisual(e.currentTarget);
    handlePasswordClear();
  });

  document.getElementById('pw-back-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    animateKeyPressVisual(e.currentTarget);
    handlePasswordBackspace();
  });

  document.getElementById('pw-enter-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    validateSecretPassword();
  });

  // Physical Keyboard Support on Password Lock Screen (no bypass shortcuts)
  document.addEventListener('keydown', (e) => {
    if (state.currentStage !== 'password') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      animateKeyPressVisual(`#pw-dial-pad .pw-key[data-digit="${e.key}"]`);
      handlePasswordDigitInput(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      animateKeyPressVisual('#pw-back-btn');
      handlePasswordBackspace();
    } else if (e.key === 'Escape' || e.key === 'Delete') {
      e.preventDefault();
      animateKeyPressVisual('#pw-clear-btn');
      handlePasswordClear();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      validateSecretPassword();
    }
  });

  // Cupid Bow & Balloon
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
  const cakeTouchContinue = document.getElementById('cake-touch-continue');
  if (cakeTouchContinue) {
    cakeTouchContinue.addEventListener('click', handleStage3Touch);
    cakeTouchContinue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStage3Touch(e);
      }
    });
  }

  document.getElementById('stage-4').addEventListener('click', handleStage4Touch);

  const handleStage5Touch = (e) => {
    if (state.currentStage !== 5 || !state.letterTypingFinished || state.letterTransitioning) {
      return;
    }
    if (e && e.target && e.target.closest('button, #music-controller, .secret-msg-reveal')) {
      return;
    }
    state.letterTransitioning = true;
    launchGrandFinale();
  };

  document.getElementById('stage-5').addEventListener('click', handleStage5Touch);
  const letterTouchContinue = document.getElementById('letter-touch-continue');
  if (letterTouchContinue) {
    letterTouchContinue.addEventListener('click', handleStage5Touch);
    letterTouchContinue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStage5Touch(e);
      }
    });
  }

  document.querySelectorAll('.candle-unit').forEach((candleEl) => {
    candleEl.addEventListener('click', (e) => {
      const num = Number(candleEl.dataset.candle);
      handleCandleBlow(e, num);
    });
  });

  document.getElementById('envelope-btn').addEventListener('click', handleEnvelopeOpen);

  const letterViewport = document.getElementById('letter-scroll-viewport');
  if (letterViewport) {
    letterViewport.addEventListener('scroll', () => {
      const distanceFromBottom =
        letterViewport.scrollHeight - letterViewport.scrollTop - letterViewport.clientHeight;
      state.letterUserScrolledUp = distanceFromBottom > 38;
    }, { passive: true });
  }

  document.getElementById('secret-msg-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.secretRevealed) return;
    state.secretRevealed = true;
    playSoundEffect('heart-burst');
    document.getElementById('secret-msg-btn').classList.add('hidden');
    document.getElementById('secret-msg-reveal').classList.remove('hidden');
  });

  document.getElementById('finale-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    state.letterTransitioning = false;
    stopGrandFinale();
  });

  document.getElementById('replay-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    resetEntireExperience();
  });

  document.getElementById('finale-replay-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    resetEntireExperience();
  });
}
