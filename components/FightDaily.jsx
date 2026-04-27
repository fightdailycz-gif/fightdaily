"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// =============================================================================
// AUDIO ENGINE — Web Audio API oscillators (nepřeruší muziku na iOS)
// =============================================================================
function getCtx(ref) {
  if (!ref.current) {
    const C = window.AudioContext || window.webkitAudioContext;
    ref.current = new C();
  }
  if (ref.current.state === "suspended") ref.current.resume();
  return ref.current;
}
function makeOut(ctx) {
  const c = ctx.createDynamicsCompressor();
  c.threshold.value = -4; c.knee.value = 2; c.ratio.value = 6;
  c.attack.value = 0.001; c.release.value = 0.08;
  c.connect(ctx.destination); return c;
}
function playBell(ctx) {
  const out = makeOut(ctx), t = ctx.currentTime;
  [[880,1.0,2.2],[1108,.65,1.6],[1760,.45,1.1],[550,.55,1.4],[2637,.25,.7],[440,.3,1.0]]
    .forEach(([f,g,d]) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type="sine"; o.frequency.value=f;
      gn.gain.setValueAtTime(g,t); gn.gain.exponentialRampToValueAtTime(.001,t+d);
      o.connect(gn); gn.connect(out); o.start(t); o.stop(t+d+.1);
    });
}
function playBuzzer(ctx) {
  const out = makeOut(ctx), t = ctx.currentTime, dur = 1.6;
  [[80,"sawtooth",1.0],[160,"sawtooth",.75],[200,"square",.55],[55,"square",.7],[320,"sawtooth",.3]]
    .forEach(([f,type,g]) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type=type; o.frequency.value=f;
      gn.gain.setValueAtTime(g,t); gn.gain.linearRampToValueAtTime(.001,t+dur);
      o.connect(gn); gn.connect(out); o.start(t); o.stop(t+dur+.1);
    });
}
function playAirHorn(ctx) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value=-3; comp.knee.value=2; comp.ratio.value=8;
  comp.attack.value=.001; comp.release.value=.1; comp.connect(ctx.destination);
  const lpf = ctx.createBiquadFilter();
  lpf.type="lowpass"; lpf.frequency.value=1800; lpf.Q.value=.7; lpf.connect(comp);
  const t = ctx.currentTime, dur = 2.0;
  [[233,1.0],[228,.9],[238,.9],[230,.7],[236,.7],[466,.5],[469,.4],[116,.55],[699,.2]]
    .forEach(([f,g]) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type="sawtooth";
      o.frequency.setValueAtTime(f*1.08,t); o.frequency.exponentialRampToValueAtTime(f,t+.06);
      gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(g,t+.012);
      gn.gain.setValueAtTime(g*.93,t+.12); gn.gain.setValueAtTime(g*.90,t+dur-.3);
      gn.gain.linearRampToValueAtTime(.001,t+dur);
      o.connect(gn); gn.connect(lpf); o.start(t); o.stop(t+dur+.1);
    });
}
function playSiren(ctx) {
  const out = makeOut(ctx), t = ctx.currentTime;
  [0,.5,1.0,1.5].forEach((off,i) => {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    const rising = i%2===0;
    o.type="sawtooth";
    o.frequency.setValueAtTime(rising?400:800,t+off);
    o.frequency.linearRampToValueAtTime(rising?800:400,t+off+.5);
    gn.gain.setValueAtTime(.8,t+off);
    if(i===3) gn.gain.linearRampToValueAtTime(.001,t+2.0);
    o.connect(gn); gn.connect(out); o.start(t+off); o.stop(t+off+.6);
  });
}
function playTripleBell(ctx) { playBell(ctx); setTimeout(()=>playBell(ctx),450); setTimeout(()=>playBell(ctx),900); }
function playDoubleHorn(ctx) { playAirHorn(ctx); setTimeout(()=>playAirHorn(ctx),700); }
function playFanfare(ctx) {
  const out = makeOut(ctx), t = ctx.currentTime;
  [[523,0],[659,.12],[784,.24],[1047,.36],[784,.56],[1047,.68]].forEach(([f,d]) => {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    const dl = d<.5?.14:.28;
    o.type="square"; o.frequency.value=f;
    gn.gain.setValueAtTime(.7,t+d); gn.gain.exponentialRampToValueAtTime(.001,t+d+dl);
    o.connect(gn); gn.connect(out); o.start(t+d); o.stop(t+d+dl+.05);
  });
}
function playSchoolBell(ctx) {
  const out = makeOut(ctx), t = ctx.currentTime;
  for(let i=0;i<8;i++){
    const o=ctx.createOscillator(), gn=ctx.createGain();
    o.type="square"; o.frequency.value=i%2===0?1200:800;
    gn.gain.setValueAtTime(i%2===0?.75:.4,t+i*.12);
    gn.gain.exponentialRampToValueAtTime(.001,t+i*.12+.1);
    o.connect(gn); gn.connect(out); o.start(t+i*.12); o.stop(t+i*.12+.12);
  }
}
function playWarning(ctx) {
  const t = ctx.currentTime;
  [0,.25,.5].forEach(d => {
    const out=makeOut(ctx), o=ctx.createOscillator(), gn=ctx.createGain();
    o.type="square"; o.frequency.value=880;
    gn.gain.setValueAtTime(1.0,t+d); gn.gain.exponentialRampToValueAtTime(.001,t+d+.2);
    o.connect(gn); gn.connect(out); o.start(t+d); o.stop(t+d+.25);
  });
}
function playGetReady(ctx) {
  const t = ctx.currentTime;
  [523,659,784,1047].forEach((f,i) => {
    const out=makeOut(ctx), o=ctx.createOscillator(), gn=ctx.createGain();
    o.type="sine"; o.frequency.value=f;
    gn.gain.setValueAtTime(.9,t+i*.18); gn.gain.exponentialRampToValueAtTime(.001,t+i*.18+.28);
    o.connect(gn); gn.connect(out); o.start(t+i*.18); o.stop(t+i*.18+.35);
  });
}

const ALARMS = [
  { id:"airHorn",    label:"AIR HORN", icon:"campaign",             fn:playAirHorn,    desc:"Stadionový roh" },
  { id:"buzzer",     label:"BUZZER",   icon:"electric_bolt",        fn:playBuzzer,     desc:"Elektrický bzučák" },
  { id:"bell",       label:"ZVON",     icon:"notifications",        fn:playBell,       desc:"Boxerský zvon" },
  { id:"tripleBell", label:"3× ZVON",  icon:"notifications_active", fn:playTripleBell, desc:"Trojitý zvon" },
];

// =============================================================================
// CONSTANTS
// =============================================================================
const C = {
  bg: "#000000",
  card: "#171717",
  cardBorder: "#222",
  cardLight: "#1f1f1f",
  yellow: "#FFE600",
  orange: "#FF6E1A",
  red: "#EF1B1B",
  blue: "#2196F3",
  green: "#4CAF50",
  white: "#FFFFFF",
  textDim: "#666",
  textMuted: "#999",
  textVeryDim: "#3a3a3a",
};

const PHASE = { IDLE:"idle", WARMUP:"warmup", ROUND:"round", REST:"rest", DONE:"done" };

const fmt = s => {
  const sec = Math.max(0, Math.floor(s));
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
};
const fmtMS = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

function makeTimer() {
  return {
    phase: PHASE.IDLE,
    timeLeft: 30,
    curRound: 1,
    rounds: 5,
    roundSec: 180,
    restSec: 60,
    warnAt: 10,
    warmupSec: 30,
    warmupOn: true,
    alarmId: "airHorn",
    running: false,
    // Wall-clock timing — phase ends at this timestamp (ms), null when not running
    phaseEndAt: null,
    // When paused, remaining ms in current phase (null when running)
    pausedRemainingMs: null,
  };
}

// =============================================================================
// PERSISTENCE — localStorage (SSR-safe)
// =============================================================================
const STORAGE_KEY = "fightdaily_settings_v1";
const PERSISTED_KEYS = ["rounds", "roundSec", "restSec", "warnAt", "warmupSec", "warmupOn", "alarmId"];

function loadSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

function saveSettings(t) {
  if (typeof window === "undefined") return;
  try {
    const toSave = {};
    PERSISTED_KEYS.forEach(k => { toSave[k] = t[k]; });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage full or disabled — fail silently
  }
}

// =============================================================================
// MAIN APP
// =============================================================================
export default function FightDaily() {
  const [, redraw] = useState(0);
  const T = useRef(makeTimer());
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const warnFired = useRef(false);
  const grFired = useRef(false);
  const wakeLockRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const [view, setView] = useState("timer"); // "timer" | "settings"

  const R = () => redraw(n => n + 1);

  const initAudio = useCallback(() => {
    const ctx = getCtx(audioRef);
    if (!audioReady) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      g.gain.value = .0001; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + .01);
      setAudioReady(true);
    }
    return ctx;
  }, [audioReady]);

  const fireAlarm = useCallback(ctx => {
    const a = ALARMS.find(x => x.id === T.current.alarmId) || ALARMS[0];
    a.fn(ctx);
  }, []);

  // ── Wake Lock — drží display rozsvícený když timer běží ─────────────────────
  const acquireWakeLock = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Browser nepodporuje nebo permission denied — fail silently
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {}
  }, []);

  // ── Tick — wall-clock based, fires audio cues at thresholds ─────────────────
  const tick = useCallback(() => {
    const t = T.current;
    const ctx = audioRef.current;
    if (!ctx || !t.running || t.pausedRemainingMs != null || t.phaseEndAt == null) return;

    const remainingMs = t.phaseEndAt - Date.now();
    const newTimeLeft = Math.max(0, Math.ceil(remainingMs / 1000));
    t.timeLeft = newTimeLeft;

    // Audio cues — refs prevent multi-fire, get reset at phase transition
    if (t.phase === PHASE.ROUND
        && newTimeLeft <= t.warnAt && newTimeLeft > 0
        && !warnFired.current) {
      warnFired.current = true;
      playWarning(ctx);
    }
    if ((t.phase === PHASE.WARMUP || t.phase === PHASE.REST)
        && newTimeLeft <= 3 && newTimeLeft > 0
        && !grFired.current) {
      grFired.current = true;
      playGetReady(ctx);
    }

    // Phase end — wall clock crossed 0 (or below if app was backgrounded)
    if (remainingMs <= 0) {
      const now = Date.now();
      warnFired.current = false;
      grFired.current = false;

      if (t.phase === PHASE.WARMUP) {
        playBell(ctx);
        t.phase = PHASE.ROUND;
        t.phaseEndAt = now + t.roundSec * 1000;
        t.timeLeft = t.roundSec;
      } else if (t.phase === PHASE.ROUND) {
        fireAlarm(ctx);
        if (t.curRound >= t.rounds) {
          t.phase = PHASE.DONE;
          t.timeLeft = 0;
          t.running = false;
          t.phaseEndAt = null;
          clearInterval(intervalRef.current);
          releaseWakeLock();
        } else {
          t.phase = PHASE.REST;
          t.phaseEndAt = now + t.restSec * 1000;
          t.timeLeft = t.restSec;
        }
      } else if (t.phase === PHASE.REST) {
        playBell(ctx);
        t.curRound++;
        t.phase = PHASE.ROUND;
        t.phaseEndAt = now + t.roundSec * 1000;
        t.timeLeft = t.roundSec;
      }
    }

    R();
  }, [fireAlarm, releaseWakeLock]);

  const start = () => {
    const ctx = initAudio();
    const t = T.current;
    if (t.phase === PHASE.DONE) return;

    if (!t.running) {
      const now = Date.now();
      if (t.phase === PHASE.IDLE) {
        // Fresh start
        warnFired.current = false; grFired.current = false;
        t.curRound = 1;
        if (t.warmupOn) {
          t.phase = PHASE.WARMUP;
          t.phaseEndAt = now + t.warmupSec * 1000;
          t.timeLeft = t.warmupSec;
        } else {
          t.phase = PHASE.ROUND;
          t.phaseEndAt = now + t.roundSec * 1000;
          t.timeLeft = t.roundSec;
          setTimeout(() => playBell(ctx), 80);
        }
      } else if (t.pausedRemainingMs != null) {
        // Resume from pause — shift phase end by remaining
        t.phaseEndAt = now + t.pausedRemainingMs;
        t.pausedRemainingMs = null;
      }
      t.running = true;
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 250);
      acquireWakeLock();
    } else {
      // Pause — capture remaining ms
      t.running = false;
      t.pausedRemainingMs = Math.max(0, (t.phaseEndAt ?? Date.now()) - Date.now());
      clearInterval(intervalRef.current);
      releaseWakeLock();
    }
    R();
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    releaseWakeLock();
    const t = T.current;
    t.phase = PHASE.IDLE;
    t.curRound = 1;
    t.running = false;
    t.phaseEndAt = null;
    t.pausedRemainingMs = null;
    t.timeLeft = t.warmupOn ? t.warmupSec : t.roundSec;
    warnFired.current = false; grFired.current = false;
    R();
  };

  const adjustTime = (delta) => {
    const t = T.current;
    if (t.phase === PHASE.IDLE || t.phase === PHASE.DONE) return;

    if (t.pausedRemainingMs != null) {
      t.pausedRemainingMs = Math.max(1000, t.pausedRemainingMs + delta * 1000);
      t.timeLeft = Math.ceil(t.pausedRemainingMs / 1000);
    } else if (t.phaseEndAt != null) {
      t.phaseEndAt += delta * 1000;
      const minEnd = Date.now() + 1000;
      if (t.phaseEndAt < minEnd) t.phaseEndAt = minEnd;
      t.timeLeft = Math.max(1, Math.ceil((t.phaseEndAt - Date.now()) / 1000));
    }
    // Reset audio cue refs if user pushed time back above threshold
    if (t.phase === PHASE.ROUND && t.timeLeft > t.warnAt) warnFired.current = false;
    if ((t.phase === PHASE.WARMUP || t.phase === PHASE.REST) && t.timeLeft > 3) grFired.current = false;
    R();
  };

  // ── Visibility change — re-acquire Wake Lock and catch-up tick ─────────────
  // iOS uvolní wake lock při skrytí tabu/locknutí telefonu; tady ho vrátíme.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && T.current.running) {
        acquireWakeLock();
        tick(); // catch up immediately, ne čekat 250ms
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [tick, acquireWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const setSetting = (key, val) => {
    T.current[key] = val;
    if (T.current.phase === PHASE.IDLE) {
      T.current.timeLeft = T.current.warmupOn ? T.current.warmupSec : T.current.roundSec;
    }
    saveSettings(T.current);
    R();
  };

  // Load saved settings on mount (client-side only)
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      PERSISTED_KEYS.forEach(k => {
        if (k in saved) T.current[k] = saved[k];
      });
      // Refresh idle timer display to match loaded settings
      if (T.current.phase === PHASE.IDLE) {
        T.current.timeLeft = T.current.warmupOn ? T.current.warmupSec : T.current.roundSec;
      }
      R();
    }
  }, []);

  const t = T.current;

  // ── DERIVED ─────────────────────────────────────────────────────────────────
  const elapsedInPhase =
    t.phase === PHASE.ROUND  ? t.roundSec - t.timeLeft :
    t.phase === PHASE.WARMUP ? t.warmupSec - t.timeLeft :
    t.phase === PHASE.REST   ? t.restSec - t.timeLeft : 0;

  const isGo = t.phase === PHASE.ROUND && elapsedInPhase < 2;
  const isWarning = t.phase === PHASE.ROUND && t.timeLeft <= t.warnAt && t.timeLeft > 0;

  const totalTime =
    t.phase === PHASE.WARMUP ? t.warmupSec :
    t.phase === PHASE.ROUND  ? t.roundSec :
    t.phase === PHASE.REST   ? t.restSec  : t.warmupOn ? t.warmupSec : t.roundSec;

  const progress = totalTime > 0 ? Math.max(0, t.timeLeft / totalTime) : 1;

  const ringColor =
    t.phase === PHASE.WARMUP ? C.orange :
    t.phase === PHASE.REST   ? C.blue :
    t.phase === PHASE.DONE   ? C.green :
    isWarning ? C.red : C.yellow;

  const phaseLabel =
    t.phase === PHASE.IDLE   ? "READY" :
    t.phase === PHASE.WARMUP ? "WARMUP" :
    t.phase === PHASE.REST   ? "REST" :
    t.phase === PHASE.DONE   ? "DONE!" :
    isGo ? "GO" : "KEEP UP!";

  const sub = getSubtitle(t);

  // ─── SETTINGS VIEW ──────────────────────────────────────────────────────────
  if (view === "settings") {
    return (
      <SettingsView
        t={t}
        setSetting={setSetting}
        onBack={() => setView("timer")}
        playPreview={(fn) => fn(initAudio())}
      />
    );
  }

  // ─── TIMER VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <Style />

      {/* HEADER */}
      <header style={S.header}>
        <Logo height={18} />
      </header>

      {/* PHASE LABEL */}
      <div style={{
        ...S.phaseLabel,
        color: t.phase === PHASE.DONE ? C.green : C.yellow,
        textShadow: `0 0 50px ${t.phase === PHASE.DONE ? C.green : C.yellow}33`,
      }}>
        {phaseLabel}
      </div>

      {/* CIRCLE */}
      <CircleTimer
        progress={progress}
        ringColor={ringColor}
        ringWidth={isGo ? 22 : 12}
        timeText={t.phase === PHASE.DONE ? "DONE" : fmt(t.timeLeft)}
        sub={sub}
        onSettings={() => { initAudio(); setView("settings"); }}
        timeColor={t.phase === PHASE.DONE ? C.green : t.phase === PHASE.REST ? C.blue : C.white}
        isWarning={isWarning}
      />

      {/* ROUND INDICATORS */}
      <div style={S.rounds}>
        {Array.from({ length: t.rounds }).map((_, i) => {
          const num = i + 1;
          const state = getRoundState(num, t);
          return <RoundDot key={i} num={num} state={state} />;
        })}
      </div>

      {/* CONTROLS */}
      <div style={S.controls}>
        <IconBtn onClick={reset} disabled={t.phase === PHASE.IDLE}>
          <Icon name="restart_alt" size={22} weight={500} />
        </IconBtn>
        <AdjustBtn onClick={() => adjustTime(-10)} disabled={t.phase === PHASE.IDLE || t.phase === PHASE.DONE}>−10</AdjustBtn>
        <PlayBtn t={t} onClick={start} />
        <AdjustBtn onClick={() => adjustTime(+10)} disabled={t.phase === PHASE.IDLE || t.phase === PHASE.DONE}>+10</AdjustBtn>
        <IconBtn onClick={() => fireAlarm(initAudio())} active={audioReady}>
          <Icon name="volume_up" size={22} weight={500} />
        </IconBtn>
      </div>

      <div style={S.footerHint}>
        {audioReady ? "ZVUK AKTIVNÍ · MUZIKA HRAJE DÁL" : "TAPNI PRO AKTIVACI"}
      </div>
    </div>
  );
}

// =============================================================================
// SUBTITLE LOGIC
// =============================================================================
function getSubtitle(t) {
  switch (t.phase) {
    case PHASE.IDLE:
      return t.warmupOn
        ? { main: "Warmup", next: "Next: Round 1" }
        : { main: "Round 1", next: t.rounds > 1 ? "Next: Round 2" : "Final round" };
    case PHASE.WARMUP:
      return { main: "Warmup", next: "Next: Round 1" };
    case PHASE.ROUND:
      return {
        main: `Round ${t.curRound}`,
        next: t.curRound < t.rounds ? `Next: Round ${t.curRound + 1}` : "Final round"
      };
    case PHASE.REST:
      return { main: "Rest", next: `Next: Round ${t.curRound + 1}` };
    case PHASE.DONE:
      return { main: "Workout complete", next: `${t.rounds} rounds done` };
    default:
      return { main: "", next: "" };
  }
}

function getRoundState(num, t) {
  if (t.phase === PHASE.DONE) return "done";
  if (num < t.curRound) return "done";
  if (num === t.curRound) {
    if (t.phase === PHASE.ROUND) return "active";
    if (t.phase === PHASE.REST) return "done";
  }
  return "future";
}

// =============================================================================
// COMPONENTS
// =============================================================================

function CircleTimer({ progress, ringColor, ringWidth, timeText, sub, onSettings, timeColor, isWarning }) {
  // Použij fixní viewBox velikost pro SVG matiku, ale renderuj responzivně přes clamp()
  // min 240px, max 340px, prefer 70vmin (70% kratší strany viewportu)
  const SIZE = 320; // logická velikost pro výpočty viewBoxu
  const R_inner = (SIZE - ringWidth - 6) / 2;
  const cx = SIZE / 2, cy = SIZE / 2;
  const circ = 2 * Math.PI * R_inner;

  // CSS responsive size — funguje od malého iPhone SE až po desktop
  const cssSize = "clamp(240px, 65vmin, 340px)";

  return (
    <div style={{
      position: "relative",
      width: cssSize, height: cssSize,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%" height="100%"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle cx={cx} cy={cy} r={R_inner} fill="none" stroke="#1A1A1A" strokeWidth={ringWidth}
          style={{ transition: "stroke-width 0.4s" }} />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={R_inner} fill="none"
          stroke={ringColor} strokeWidth={ringWidth}
          strokeLinecap="butt"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{
            transition: "stroke-dashoffset 0.9s linear, stroke 0.4s, stroke-width 0.4s",
          }}
        />
        {/* Glow halo when warning */}
        {isWarning && (
          <circle cx={cx} cy={cy} r={R_inner} fill="none"
            stroke={ringColor} strokeWidth={ringWidth + 4}
            strokeLinecap="butt"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            style={{ filter: "blur(6px)", opacity: 0.5, transition: "stroke-dashoffset 0.9s linear" }}
          />
        )}
      </svg>

      {/* Inner content */}
      <div style={{
        position: "absolute",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 10,
      }}>
        <button onClick={onSettings} style={S.settingsPill}>
          <Icon name="settings" size={16} weight={500} />
          <span>Nastavení</span>
        </button>

        <div style={{
          fontSize: timeText === "DONE" ? "clamp(40px, 11vmin, 56px)" : "clamp(54px, 14vmin, 76px)",
          fontWeight: 800,
          letterSpacing: timeText === "DONE" ? 4 : -2,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: timeColor,
          marginTop: 4,
        }}>
          {timeText}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 2 }}>
          <div style={{ fontSize: "clamp(15px, 3.5vmin, 18px)", fontWeight: 500, color: C.white, lineHeight: 1.2 }}>
            {sub.main}
          </div>
          <div style={{ fontSize: "clamp(11px, 2.5vmin, 13px)", color: C.textDim, fontWeight: 400 }}>
            {sub.next}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundDot({ num, state }) {
  const styles = {
    future: { background: "#1A1A1A", color: C.textDim, border: "2px solid transparent" },
    active: { background: "transparent", color: C.yellow, border: `2px solid ${C.yellow}`, boxShadow: `0 0 12px ${C.yellow}44` },
    done:   { background: C.green, color: "#000", border: "2px solid transparent", boxShadow: `0 0 8px ${C.green}55` },
  };
  return (
    <div style={{
      width: 38, height: 38,
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 700,
      transition: "all 0.35s ease",
      ...styles[state],
    }}>
      {num}
    </div>
  );
}

function PlayBtn({ t, onClick }) {
  const isDone = t.phase === PHASE.DONE;
  const isRunning = t.running;
  const isIdle = t.phase === PHASE.IDLE;

  return (
    <button onClick={onClick} disabled={isDone}
      style={{
        width: 76, height: 76, borderRadius: "50%",
        background: isDone ? "#1A1A1A" : C.yellow,
        border: "none",
        color: "#000",
        cursor: isDone ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: !isDone ? `0 0 30px ${C.yellow}55, 0 6px 20px rgba(0,0,0,0.5)` : "none",
        transition: "all 0.25s",
      }}>
      {isDone
        ? <Icon name="check" size={32} weight={700} color={C.green} />
        : isRunning
          ? <PauseIcon />
          : <PlayIcon />}
    </button>
  );
}

const PlayIcon = () => <Icon name="play_arrow" size={36} fill weight={700} />;
const PauseIcon = () => <Icon name="pause" size={32} fill weight={700} />;

function Logo({ height = 18, color = "currentColor" }) {
  const w = (height * 137) / 18;
  return (
    <svg width={w} height={height} viewBox="0 0 137 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color, display: "block" }}>
      <path d="M0 17.424V0.383999H12.096V3.792H1.824L4.176 1.368V9.168L1.824 7.392H11.664V10.8H1.824L4.176 9.024V17.424H0Z" fill="currentColor"/>
      <path d="M14.3438 17.424V0.383999H18.5198V17.424H14.3438Z" fill="currentColor"/>
      <path d="M28.671 17.808C27.023 17.808 25.607 17.432 24.423 16.68C23.239 15.928 22.327 14.888 21.687 13.56C21.047 12.232 20.727 10.688 20.727 8.928C20.727 7.216 21.055 5.688 21.711 4.344C22.367 3 23.303 1.944 24.519 1.176C25.751 0.392 27.231 0 28.959 0C30.479 0 31.751 0.248 32.775 0.743999C33.815 1.224 34.647 1.92 35.271 2.832C35.911 3.744 36.359 4.832 36.615 6.096L32.295 6.288C32.135 5.376 31.799 4.672 31.287 4.176C30.775 3.664 30.015 3.408 29.007 3.408C28.127 3.408 27.391 3.648 26.799 4.128C26.207 4.608 25.759 5.264 25.455 6.096C25.167 6.912 25.023 7.856 25.023 8.928C25.023 10 25.167 10.952 25.455 11.784C25.743 12.6 26.183 13.24 26.775 13.704C27.383 14.168 28.151 14.4 29.079 14.4C29.751 14.4 30.327 14.272 30.807 14.016C31.303 13.76 31.695 13.408 31.983 12.96C32.271 12.496 32.447 11.968 32.511 11.376H28.983V8.472H36.663V17.424H34.167L33.951 13.872L34.431 14.016C34.271 14.768 33.919 15.432 33.375 16.008C32.847 16.568 32.175 17.008 31.359 17.328C30.559 17.648 29.663 17.808 28.671 17.808Z" fill="currentColor"/>
      <path d="M39.3984 17.424V0.383999H43.5744V8.4L41.7744 7.128H51.1344L49.3344 8.4V0.383999H53.5104V17.424H49.3344V9.312L51.1344 10.56H41.7744L43.5744 9.312V17.424H39.3984Z" fill="currentColor"/>
      <path d="M59.8277 17.424V3.792H54.7877V0.383999H69.0677V3.792H64.0277V17.424H59.8277Z" fill="currentColor"/>
      <path d="M70.5938 17.424V0.383999H76.6657C79.4817 0.383999 81.6418 1.128 83.1458 2.616C84.6658 4.088 85.4258 6.192 85.4258 8.928C85.4258 11.648 84.6817 13.744 83.1937 15.216C81.7057 16.688 79.5778 17.424 76.8098 17.424H70.5938ZM74.7698 14.016H76.6657C78.2017 14.016 79.3298 13.6 80.0498 12.768C80.7698 11.936 81.1298 10.648 81.1298 8.904C81.1298 7.16 80.7698 5.872 80.0498 5.04C79.3298 4.208 78.2017 3.792 76.6657 3.792H74.7698V14.016Z" fill="currentColor"/>
      <path d="M85.7297 17.424L91.8737 0.383999H96.7217L102.866 17.424H98.5697L97.4657 14.208H91.1297L90.0017 17.424H85.7297ZM92.2577 10.896H96.3377L94.3217 4.896L92.2577 10.896Z" fill="currentColor"/>
      <path d="M104.273 17.424V0.383999H108.449V17.424H104.273Z" fill="currentColor"/>
      <path d="M111.703 17.424V0.383999H115.879V16.44L113.527 14.016H123.511V17.424H111.703Z" fill="currentColor"/>
      <path d="M126.143 17.424V10.92L120.239 0.383999H124.799L128.255 6.888L131.639 0.383999H136.199L130.342 10.92V17.424H126.143Z" fill="currentColor"/>
    </svg>
  );
}

function Icon({ name, size = 24, fill = false, weight = 400, color, style }) {
  return (
    <span
      className="ms"
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        color,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

function AdjustBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: 56, height: 44, borderRadius: 10,
        background: "transparent",
        border: `1.5px solid ${disabled ? "#2a2a2a" : C.yellow}`,
        color: disabled ? "#2a2a2a" : C.yellow,
        fontSize: 16, fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
      {children}
    </button>
  );
}

function IconBtn({ onClick, disabled, active, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: 38, height: 38,
        background: "transparent", border: "none",
        color: disabled ? "#2a2a2a" : active ? C.white : C.textDim,
        fontSize: 18,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "color 0.2s",
      }}>
      {children}
    </button>
  );
}

// =============================================================================
// SETTINGS VIEW
// =============================================================================
function SettingsView({ t, setSetting, onBack, playPreview }) {
  return (
    <div style={S.appScroll}>
      <Style />

      {/* STICKY HEADER with back */}
      <header style={{ ...S.stickyHeader, position: "sticky", top: 0 }}>
        <button onClick={onBack} style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          background: "transparent", border: "none", color: C.white,
          cursor: "pointer", padding: 8, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="arrow_back" size={22} weight={500} />
        </button>
        <div style={{ ...S.brand, color: C.white, letterSpacing: 0, fontSize: 17, fontWeight: 500 }}>
          Nastavení
        </div>
      </header>

      <div style={{ width: "100%", maxWidth: 440, padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* 2x2 GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SettingCard label="Kola" value={t.rounds}
            onMinus={() => setSetting("rounds", Math.max(1, t.rounds - 1))}
            onPlus={() => setSetting("rounds", Math.min(20, t.rounds + 1))}
            display={t.rounds}
          />
          <SettingCard label="Čas kola" value={t.roundSec}
            onMinus={() => setSetting("roundSec", Math.max(15, t.roundSec - 15))}
            onPlus={() => setSetting("roundSec", Math.min(600, t.roundSec + 15))}
            display={fmtMS(t.roundSec)}
          />
          <SettingCard label="Pauza (sec)" value={t.restSec}
            onMinus={() => setSetting("restSec", Math.max(10, t.restSec - 10))}
            onPlus={() => setSetting("restSec", Math.min(300, t.restSec + 10))}
            display={fmtMS(t.restSec)}
          />
          <SettingCard label="Warning (sec)" value={t.warnAt}
            onMinus={() => setSetting("warnAt", Math.max(5, t.warnAt - 5))}
            onPlus={() => setSetting("warnAt", Math.min(30, t.warnAt + 5))}
            display={fmtMS(t.warnAt)}
          />
        </div>

        <Separator />

        {/* WARMUP */}
        <div style={S.fullCard}>
          <div style={S.cardLabel}>Warmup</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <button onClick={() => setSetting("warmupOn", !t.warmupOn)}
              style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
              <Toggle on={t.warmupOn} />
              <span style={{ fontSize: 15, color: t.warmupOn ? C.yellow : C.textDim, fontWeight: 500 }}>
                {t.warmupOn ? "Zapnuto" : "Vypnuto"}
              </span>
            </button>
            {t.warmupOn && (
              <Stepper
                value={fmtMS(t.warmupSec)}
                onMinus={() => setSetting("warmupSec", Math.max(10, t.warmupSec - 10))}
                onPlus={() => setSetting("warmupSec", Math.min(300, t.warmupSec + 10))}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* ALARM PICKER */}
        <div style={S.fullCard}>
          <div style={S.cardLabel}>Typ alarmu</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {ALARMS.map(a => {
              const sel = t.alarmId === a.id;
              return (
                <button key={a.id}
                  onClick={() => { setSetting("alarmId", a.id); playPreview(a.fn); }}
                  style={{
                    background: sel ? "#1F1A00" : "#0F0F0F",
                    border: `1.5px solid ${sel ? C.yellow : "#222"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: sel ? C.white : C.textDim,
                    textAlign: "left",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.2s",
                  }}>
                  <Icon name={a.icon} size={22} weight={500} color={sel ? C.yellow : C.textDim} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: sel ? C.yellow : C.white }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 10, color: sel ? "#888" : "#444", marginTop: 1 }}>
                      {a.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ label, display, onMinus, onPlus }) {
  return (
    <div style={S.gridCard}>
      <div style={S.cardLabel}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <StepBtn icon="remove" onClick={onMinus} />
        <span style={{ fontSize: 22, fontWeight: 700, color: C.yellow, fontVariantNumeric: "tabular-nums" }}>
          {display}
        </span>
        <StepBtn icon="add" onClick={onPlus} />
      </div>
    </div>
  );
}

function Stepper({ value, onMinus, onPlus }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <StepBtn icon="remove" onClick={onMinus} />
      <span style={{ fontSize: 20, fontWeight: 700, color: C.yellow, minWidth: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <StepBtn icon="add" onClick={onPlus} />
    </div>
  );
}

function StepBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 8,
      background: "#222", border: "none",
      color: C.white,
      cursor: "pointer", fontFamily: "inherit",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={icon} size={20} weight={600} />
    </button>
  );
}

function Toggle({ on }) {
  return (
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? C.yellow : "#2a2a2a",
      position: "relative",
      transition: "background 0.25s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 22 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#000",
        transition: "left 0.25s",
      }} />
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "#1a1a1a", margin: "4px 0" }} />;
}

// =============================================================================
// STYLES (shared)
// =============================================================================
const S = {
  // Timer view — fixed viewport, no scroll, mezery rozdělené přes justify-content: space-between
  app: {
    height: "100dvh",        // dynamic viewport height — kompenzuje iOS top/bottom bary
    minHeight: "100dvh",
    maxHeight: "100dvh",
    overflow: "hidden",      // ŽÁDNÉ scrollování
    background: C.bg,
    color: C.white,
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "space-between",
    padding: "0 0 16px",
  },
  // Settings view — scrollovatelný obsah, ale header bude sticky
  appScroll: {
    minHeight: "100dvh",
    background: C.bg,
    color: C.white,
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex", flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    padding: "16px 16px 8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  // Sticky header pro settings view
  stickyHeader: {
    position: "sticky", top: 0, zIndex: 10,
    width: "100%",
    padding: "16px 16px 14px",
    background: C.bg,
    borderBottom: "1px solid #1a1a1a",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brand: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: 4,
    color: C.white,
  },
  phaseLabel: {
    fontSize: "clamp(40px, 11vmin, 56px)",
    fontWeight: 900,
    letterSpacing: -1,
    lineHeight: 1,
    transition: "color 0.4s, text-shadow 0.4s",
    flexShrink: 0,
  },
  rounds: {
    display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
    maxWidth: 380, padding: "0 16px",
    flexShrink: 0,
  },
  controls: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", maxWidth: 380, padding: "0 20px",
    gap: 8,
    flexShrink: 0,
  },
  settingsPill: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 18px", borderRadius: 999,
    background: "rgba(28,28,28,0.85)",
    border: "1px solid #262626",
    color: C.white, fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
  },
  footerHint: {
    fontSize: 9, color: "#222", letterSpacing: 2, fontWeight: 700, textAlign: "center",
    marginTop: 4,
    flexShrink: 0,
  },
  // settings cards
  gridCard: {
    background: C.card, border: `1px solid ${C.cardBorder}`,
    borderRadius: 14, padding: "12px 14px",
  },
  fullCard: {
    background: C.card, border: `1px solid ${C.cardBorder}`,
    borderRadius: 14, padding: "14px 16px",
  },
  cardLabel: {
    fontSize: 14, color: C.white, fontWeight: 500,
  },
};

// Global resets + Material Symbols base class.
// Fonty samotné jsou loadnuté v <head> (app/layout.tsx) — žádný @import zde,
// abychom předešli FOUC (flash of unstyled content).
function Style() {
  return (
    <style>{`
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; background: #000; }
      button:disabled { cursor: default; }

      /* Material Symbols base class */
      .ms {
        font-family: 'Material Symbols Rounded';
        font-weight: normal;
        font-style: normal;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
        user-select: none;
        /* font-display: block v Google URL = neukáže text-fallback,
           jen prázdný prostor po dobu načítání (max 3s) → žádné "settings" napsané textem */
      }
    `}</style>
  );
}
