// Connects to a running halsim_ws_server, holds a trigger, and reports what
// came back: telemetry samples, message rate and bytes per second by type.
//
//   node sim-runner/probe-ws.mjs ws://localhost:13300/wpilibws [seconds]
const url = process.argv[2] ?? "ws://localhost:3300/wpilibws";
const seconds = Number(process.argv[3] ?? 12);

const started = Date.now();
const byType = new Map();
let firstWorkshopAt = null;
let last = null;

const ws = new WebSocket(url);
ws.onopen = () => console.log(`open after ${Date.now() - started} ms`);
ws.onerror = (e) => console.log("error", e.message ?? e);
ws.onclose = (e) => console.log("close", e.code, e.reason);
ws.onmessage = (event) => {
  const text = String(event.data);
  const msg = JSON.parse(text);
  const key = `${msg.type}:${msg.type === "SimDevice" ? msg.device : ""}`;
  const entry = byType.get(key) ?? { count: 0, bytes: 0 };
  entry.count += 1;
  entry.bytes += text.length;
  byType.set(key, entry);
  if (msg.type === "SimDevice" && msg.device === "Workshop") {
    firstWorkshopAt ??= Date.now() - started;
    last = { ...last, ...msg.data };
  }
};

const joystick = (axes, buttons) =>
  ws.send(JSON.stringify({ type: "Joystick", device: "0", data: { ">axes": axes, ">buttons": buttons } }));
const idle = () => joystick([0, 0, 0, 0, 0, 0], Array(16).fill(false));

setTimeout(() => idle(), 1000);
setTimeout(() => {
  console.log("before trigger", last);
  joystick([0, 0, 1, 1, 0, 0], Array(16).fill(false)); // both triggers held
}, 3000);
const sampler = setInterval(() => console.log(`t=${((Date.now() - started) / 1000).toFixed(1)}`, last), 1500);
setTimeout(() => {
  clearInterval(sampler);
  idle();
  const elapsed = (Date.now() - started) / 1000;
  console.log(`first Workshop sample at ${firstWorkshopAt} ms`);
  for (const [key, { count, bytes }] of byType) {
    console.log(`${key.padEnd(34)} ${(count / elapsed).toFixed(0).padStart(5)} msg/s ${(bytes / elapsed / 1024).toFixed(1).padStart(7)} KiB/s`);
  }
  ws.close();
}, seconds * 1000);
