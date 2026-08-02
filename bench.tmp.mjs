import fs from "node:fs";
import MiniSearch from "minisearch";

const BOOST = { title: 2.5, heading: 3, content: 1, code: 0.4 };
const idx = MiniSearch.loadJSON(fs.readFileSync("public/search-index.json","utf8"), {
  fields: ["title","heading","content","code"],
  storeFields: ["title","heading","slug","anchor","url","excerpt","lessonNum","section","sectionNum"],
});

function search(q) {
  const terms = q.trim().split(/\s+/).filter(Boolean);
  const last = terms.length - 1;
  const opts = {
    boost: BOOST,
    // Only the final term is still being typed, so only it gets prefix.
    prefix: (t, i) => i === last,
    fuzzy: (t, i) => (t.length >= 4 ? (i === last ? 0.2 : 0.15) : false),
    combineWith: "AND",
  };
  let r = idx.search(q, opts);
  if (r.length === 0) r = idx.search(q, { ...opts, combineWith: "OR" });
  return r;
}

const queries = ["kP","motion magic","how do I stop a flywheel","CANivore","state machine","odometry",
  "cruise velocity","Private methods run faster on SystemCore","MotionMagicVoltage","alert-danger"];
for (const q of queries) {
  const r = search(q);
  console.log("\n=== " + JSON.stringify(q) + "  -> " + r.length + " / 298");
  console.log(r.slice(0,4).map((x,i)=>"   "+(i+1)+". "+x.url+(x.heading?"  « "+x.heading:"")).join("\n") || "   (none)");
}
