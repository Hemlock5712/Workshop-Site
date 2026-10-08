#!/usr/bin/env node
// Drive a lesson's interactive gate in headless Chromium, the way a student would.
//   node tools/gate-test.mjs lessons/<name> "<actions>" [out.png]
// actions, separated by ";" (or "," when no action has coordinates): down:Space  up:Space  key:KeyC  wait:700  range:tol=0.001
//   drag:x1,y1>x2,y2 (stage coords)   click:x,y   shot (screenshot now)
// Seeks to just before the gate, plays into it, runs the actions, then waits for the
// narration to resume. Prints when it resumed and any page errors.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./serve.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(path.join(HERE, "..", "..", "package.json"))("playwright");
const [lessonArg, actions = "", out = "out/gate.png"] = process.argv.slice(2);
const lesson = path.relative(path.join(HERE, ".."), path.resolve(lessonArg)).split(path.sep).join("/");

const s = await serve();
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(`http://127.0.0.1:${s.address().port}/${lesson}/`);
await p.waitForFunction(() => window.ready);
const g0 = await p.evaluate(() => window.VOICE.gates[0].t0);
await p.click(".big-play");
await p.evaluate((t) => {
  const r = document.querySelector(".track input");
  r.value = String(Math.round((1000 * t) / window.lessonDuration));
  r.dispatchEvent(new Event("input"));
}, g0 - 1.5);
await p.waitForSelector(".gate-ui:not([hidden])", { timeout: 15000 });
const box = await p.locator("canvas").boundingBox();
const page = (x, y) => [box.x + (x / 1920) * box.width, box.y + (y / 1080) * box.height];
// actions split on ";" (needed once any drag or click carries x,y); "," still works without them
for (const a of actions.split(actions.includes(";") ? ";" : ",").filter(Boolean)) {
  const [op, arg = ""] = a.split(":");
  if (op === "down") await p.keyboard.down(arg);
  else if (op === "up") await p.keyboard.up(arg);
  else if (op === "key") await p.keyboard.press(arg);
  else if (op === "wait") await p.waitForTimeout(Number(arg));
  else if (op === "shot") await p.screenshot({ path: out });
  else if (op === "range") {
    const [k, v] = arg.split("=");
    await p.evaluate(([k, v]) => {
      const r = document.querySelector(`.gate-ui input[data-k="${k}"]`);
      r.value = v;
      r.dispatchEvent(new Event("input"));
    }, [k, v]);
  } else if (op === "click") {
    const [x, y] = arg.split(",").map(Number);
    await p.mouse.click(...page(x, y));
  } else if (op === "drag") {
    const [[x1, y1], [x2, y2]] = arg.split(">").map((q) => q.split(",").map(Number));
    await p.mouse.move(...page(x1, y1));
    await p.mouse.down();
    await p.mouse.move(...page(x2, y2), { steps: 12 });
    await p.mouse.up();
  } else if (op === "button") await p.click(`.gate-ui [data-k="${arg}"]`);
}
const resumed = await p.waitForSelector(".gate-ui[hidden]", { state: "attached", timeout: 15000 }).then(() => true, () => false);
console.log(resumed ? `gate passed, narration resumed at ${await p.evaluate(() => document.querySelector(".time").textContent)}` : "gate did NOT finish within 15 s");
console.log("page errors:", errs.length ? errs : "none");
await b.close();
s.close();
process.exit(resumed && !errs.length ? 0 : 1);
