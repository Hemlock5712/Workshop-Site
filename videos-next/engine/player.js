// The player. One scene, three ways to drive it:
//   play     the narration's audio is the clock
//   gate     the narration waits; the student drives the scene live
//   export   tools/export.mjs calls window.renderAt(t) once per frame, no audio
// In export (and when the student skips) a gate plays its scripted version, so
// the MP4 and the page tell the same story.

import { C, H, MONO, W, captions, micro, rrect, text } from "./core.js";

export function mountPlayer(root, { VOICE, scene, audioSrc }) {
  const params = new URLSearchParams(location.search);
  const exporting = params.has("export");

  root.innerHTML = `
    <div class="stage">
      <canvas width="${W}" height="${H}"></canvas>
      <div class="gate-ui" hidden></div>
      <button class="big-play" aria-label="Play">▶</button>
    </div>
    <div class="bar">
      <button class="pp" aria-label="Play">▶</button>
      <div class="track"><div class="fill"></div><div class="ticks"></div><input type="range" min="0" max="1000" value="0" aria-label="Seek"></div>
      <span class="time">0:00</span>
      <label class="cc"><input type="checkbox" checked> Captions</label>
    </div>`;
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const audio = new Audio(audioSrc);
  audio.preload = "auto";
  const $ = (s) => root.querySelector(s);
  const gateUi = $(".gate-ui");
  const range = $(".track input");
  const fill = $(".fill");

  // chapter ticks, one per narrated line
  $(".ticks").innerHTML = VOICE.lines
    .map(
      (l) =>
        `<i style="left:${(100 * l.t0) / VOICE.duration}%" title="${l.text.replace(/"/g, "&quot;")}"></i>`
    )
    .join("");

  let t = 0;
  let live = null; // the gate's live model while a student drives it
  const done = new Set(); // gates already played this session
  let showCaptions = true;

  function paint() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (live) {
      scene.draw(ctx, live.state.time, live.state);
      gatePrompt(live.prompt());
    } else {
      scene.draw(ctx, t);
      const gp = scene.gatePromptAt?.(t);
      if (gp) gatePrompt(gp);
      else if (showCaptions) captions(ctx, VOICE, t);
    }
    fill.style.width = `${(100 * t) / VOICE.duration}%`;
    if (document.activeElement !== range)
      range.value = String(Math.round((1000 * t) / VOICE.duration));
    $(".time").textContent = `${fmt(t)} / ${fmt(VOICE.duration)}`;
  }

  function gatePrompt(s) {
    ctx.save();
    rrect(ctx, W / 2 - 420, 950, 840, 84, 6);
    ctx.fillStyle = "rgba(6, 9, 20, 0.8)";
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "your turn", W / 2, 980, { align: "center", color: C.accent });
    text(ctx, s, W / 2, 1018, { size: 32, weight: 600, align: "center" });
    ctx.restore();
  }

  // ---- the clock ---------------------------------------------------------------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (live) {
      if (live.step(dt)) endGate();
    } else if (!audio.paused) {
      t = audio.currentTime;
      const g = scene.gate;
      if (g && !done.has(g.id) && t >= g.t0 && t < g.t1) startGate(g);
    }
    paint();
    requestAnimationFrame(frame);
  }

  function startGate(g) {
    done.add(g.id);
    audio.pause();
    t = g.t0;
    live = scene.liveGate();
    resetControls();
    gateUi.hidden = false;
    setPlaying(true);
  }
  function endGate() {
    live = null;
    gateUi.hidden = true;
    audio.currentTime = scene.gate.t1;
    t = scene.gate.t1;
    audio.play();
  }

  // ---- controls ----------------------------------------------------------------
  function setPlaying(p) {
    $(".pp").textContent = p ? "❚❚" : "▶";
    $(".big-play").hidden = p;
  }
  function toggle() {
    if (live) return;
    if (audio.paused) {
      if (t >= VOICE.duration - 0.05) t = 0;
      audio.currentTime = t;
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }
  audio.addEventListener("ended", () => setPlaying(false));
  $(".pp").onclick = toggle;
  $(".big-play").onclick = toggle;
  canvas.onclick = () => {
    if (!live) toggle();
  };
  range.oninput = () => {
    if (live) endGateSilently();
    t = (Number(range.value) / 1000) * VOICE.duration;
    audio.currentTime = t;
  };
  $(".cc input").onchange = (e) => (showCaptions = e.target.checked);

  function endGateSilently() {
    live = null;
    gateUi.hidden = true;
  }

  // ---- the gate's controls ----------------------------------------------------------
  // A scene lists what its "your turn" needs, each with an optional key:
  //   { k, label, key: "Space", kind: "hold" | "press" | "range", min, max, step, value }
  // hold sends input(k, true) and input(k, false); press sends input(k, true) once;
  // range sends input(k, number). Pointer events on the canvas go to live.pointer.
  const DEFAULTS = {
    trigger: {
      k: "trigger",
      label: "Hold trigger",
      key: "Space",
      kind: "hold",
    },
    disable: {
      k: "disable",
      label: "Disable",
      key: "KeyD",
      kind: "press",
      cls: "dis",
    },
  };
  const controls =
    scene.gateControls ??
    (scene.gateKeys ?? ["trigger", "disable"]).map((k) => DEFAULTS[k]);
  const keyName = (code) => (code ? code.replace(/^Key|^Digit/, "") : "");
  gateUi.innerHTML =
    controls
      .map((c) =>
        c.kind === "range"
          ? `<label class="btn rng">${c.label} <input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step ?? "any"}" value="${c.value ?? c.min}"><output></output></label>`
          : `<button class="btn ${c.cls ?? (c.kind === "hold" ? "trig" : "")}" data-k="${c.k}">${c.label}${c.key ? ` <kbd>${keyName(c.key)}</kbd>` : ""}</button>`
      )
      .join("") + `<button class="btn skip" data-k="skip">Skip</button>`;

  const press = (k, down) => {
    if (!live) return;
    if (k === "skip") {
      if (down) endGate();
      return;
    }
    live.input(k, down);
    root.querySelector(`button[data-k="${k}"]`)?.classList.toggle("down", down);
  };
  const byKey = Object.fromEntries(
    controls.filter((c) => c.key).map((c) => [c.key, c])
  );
  for (const b of gateUi.querySelectorAll("button")) {
    const c = controls.find((x) => x.k === b.dataset.k);
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      press(b.dataset.k, true);
      if (c && c.kind === "press")
        setTimeout(() => press(b.dataset.k, false), 120);
    });
    if (!c || c.kind === "hold") {
      b.addEventListener("pointerup", () => press(b.dataset.k, false));
      b.addEventListener("pointercancel", () => press(b.dataset.k, false));
    }
  }
  for (const r of gateUi.querySelectorAll('input[type="range"]')) {
    const show = () => (r.nextElementSibling.textContent = r.value);
    show();
    r.addEventListener("input", () => {
      show();
      if (live) live.input(r.dataset.k, Number(r.value));
    });
  }
  // canvas pointer -> stage coordinates, for dragging and scrubbing inside a gate
  const toStage = (e) => {
    const b = canvas.getBoundingClientRect();
    return [
      ((e.clientX - b.left) / b.width) * W,
      ((e.clientY - b.top) / b.height) * H,
    ];
  };
  for (const type of ["pointerdown", "pointermove", "pointerup"]) {
    canvas.addEventListener(type, (e) => {
      if (!live?.pointer) return;
      if (type === "pointerdown") canvas.setPointerCapture(e.pointerId);
      live.pointer(type.slice(7), ...toStage(e));
    });
  }

  addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const c = live && byKey[e.code];
    if (c) {
      press(c.k, true);
      if (c.kind === "press") setTimeout(() => press(c.k, false), 120);
    } else if (live) return;
    else if (e.code === "Space" || e.code === "KeyK") toggle();
    else if (e.code === "ArrowRight")
      audio.currentTime = t = Math.min(VOICE.duration, t + 5);
    else if (e.code === "ArrowLeft") audio.currentTime = t = Math.max(0, t - 5);
    else return;
    e.preventDefault();
  });
  addEventListener("keyup", (e) => {
    const c = live && byKey[e.code];
    if (c && c.kind === "hold") press(c.k, false);
  });

  // the gate starts with its controls reset
  const resetControls = () => {
    for (const r of gateUi.querySelectorAll('input[type="range"]')) {
      const c = controls.find((x) => x.k === r.dataset.k);
      r.value = c.value ?? c.min;
      r.nextElementSibling.textContent = r.value;
    }
  };

  // ---- export hook ---------------------------------------------------------------
  window.renderAt = (time) => {
    t = time;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    scene.draw(ctx, t);
    const gp = scene.gatePromptAt?.(t);
    if (gp) gatePrompt(gp);
    else captions(ctx, VOICE, t);
    return canvas.toDataURL("image/jpeg", 0.93);
  };
  window.lessonDuration = VOICE.duration;

  document.fonts.ready.then(() => {
    window.ready = true;
    if (!exporting) requestAnimationFrame(frame);
    else paint();
  });
}

const fmt = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
