import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Station =
  | "intro"
  | "pricemech"
  | "laws"
  | "equilibrium"
  | "shifters"
  | "fourstep"
  | "controls"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch3";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// Station 1 — The Price Mechanism
// ─────────────────────────────────────────────
const PRICE_MECH_QS = [
  {
    q: "During the pandemic, lumber prices tripled. According to your slides, what did that price spike communicate to the market?",
    options: [
      "That lumber companies were being greedy",
      "That there was not enough wood — scarcity relative to demand",
      "That the government had placed a tax on lumber",
      "That lumber quality had improved significantly",
    ],
    correct: 1,
    exp: "A price spike is a signal. The tripling of lumber prices sent one clear message: 'We don't have enough wood.' Prices transmit scarcity information instantly, locally, and continuously — no central coordinator needed.",
  },
  {
    q: "When pandemic lumber prices tripled, producers responded by ramping up output and running extra shifts. What role were they playing in the price mechanism?",
    options: [
      "Responding to the incentive the price signal created",
      "Ignoring the price signal and following government orders",
      "Acting as the central coordinator of the lumber market",
      "Reducing supply to take advantage of higher prices",
    ],
    correct: 0,
    exp: "A price is a signal wrapped in an incentive. Producers saw the higher price as an incentive to supply more — drill more, hire more, run extra shifts. No one told them to; the price did the coordinating.",
  },
  {
    q: "Your slides state that prices transmit information 'instantly, locally, and continuously.' What is the key implication of this for how markets work?",
    options: [
      "Markets require a government agency to set prices correctly",
      "Resources flow to their highest-valued uses with no central coordinator needed",
      "Prices only work in large economies with many buyers and sellers",
      "Consumers must be fully informed about production costs for prices to work",
    ],
    correct: 1,
    exp: "Every shopper, shipper, and producer reads the same price signal simultaneously. Resources flow to their highest-valued uses automatically — with no central plan, no coordinator, no committee required. This is the core insight of the price mechanism.",
  },
];

function PriceMechStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = PRICE_MECH_QS[idx];
  const isLast = idx === PRICE_MECH_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">The Price Mechanism</p>
        <p className="text-muted-foreground text-xs">
          A price is a <strong className="text-foreground">signal wrapped in an incentive</strong> — it tells you what is scarce and simultaneously rewards you for responding. No central coordinator needed.
        </p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PRICE_MECH_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Laws of Demand & Supply: Curve Direction Sorter
// ─────────────────────────────────────────────
const CURVE_SCENARIOS = [
  { id: 1, text: "The price of gasoline rises from $1.40 to $2.80 per gallon.", curve: "movement", curveLabel: "Movement along demand", dir: "down", dirLabel: "Quantity demanded decreases (movement along curve)", reason: "A price change causes a movement ALONG the existing demand curve — not a shift. Higher price → lower quantity demanded." },
  { id: 2, text: "A study finds coffee reduces heart disease risk. Millions of consumers switch from tea to coffee.", curve: "demand", curveLabel: "Demand curve shifts", dir: "right", dirLabel: "Right — demand increases at every price", reason: "Tastes changed — a non-price factor. The entire demand curve shifts right: more coffee demanded at every price level." },
  { id: 3, text: "A drought destroys half the Florida orange crop.", curve: "supply", curveLabel: "Supply curve shifts", dir: "left", dirLabel: "Left — supply decreases at every price", reason: "Natural conditions are a supply shifter. The drought reduces production at every price — the entire supply curve shifts left." },
  { id: 4, text: "The government grants a large subsidy to electric vehicle manufacturers.", curve: "supply", curveLabel: "Supply curve shifts", dir: "right", dirLabel: "Right — supply increases at every price", reason: "Government policy (subsidy) lowers production costs — a supply shifter. Producers offer more EVs at every price — supply shifts right." },
  { id: 5, text: "Consumer incomes rise, increasing willingness to buy new cars.", curve: "demand", curveLabel: "Demand curve shifts", dir: "right", dirLabel: "Right — demand increases at every price", reason: "Income is a demand shifter. Higher income means consumers want more cars at every price — the entire demand curve shifts right." },
  { id: 6, text: "The price of solar panels falls from $400 to $200 per panel.", curve: "movement", curveLabel: "Movement along demand", dir: "down", dirLabel: "Quantity demanded increases (movement along curve)", reason: "Price fell — this causes a movement ALONG the demand curve (quantity demanded rises). The curve itself does not shift." },
];

const CURVE_OPTS = [
  { id: "movement", label: "Movement along curve", color: "bg-slate-100 border-slate-300 text-slate-800" },
  { id: "demand",   label: "Demand curve shifts",  color: "bg-blue-100 border-blue-300 text-blue-800" },
  { id: "supply",   label: "Supply curve shifts",  color: "bg-green-100 border-green-300 text-green-800" },
];
const DIR_OPTS = [
  { id: "right", label: "→ Right (increase)" },
  { id: "left",  label: "← Left (decrease)" },
  { id: "down",  label: "↓ Along (quantity changes)" },
];

function LawsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, { curve: string; dir: string }>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = CURVE_SCENARIOS.every(s => answers[s.id]?.curve && answers[s.id]?.dir);
  const correctCount = checked ? CURVE_SCENARIOS.filter(s => answers[s.id]?.curve === s.curve && answers[s.id]?.dir === s.dir).length : 0;

  function setAns(id: number, field: "curve" | "dir", val: string) {
    setAnswers(a => ({ ...a, [id]: { ...a[id], [field]: val } }));
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — Laws of Demand & Supply: Curve or Shift?</p>
        <p className="text-muted-foreground text-xs mb-2">For each scenario, decide: does it cause a <strong className="text-foreground">movement along a curve</strong> (price changed) or a <strong className="text-foreground">shift of a curve</strong> (non-price factor)? Then pick the direction.</p>
        <div className="flex flex-wrap gap-1 text-xs">
          {CURVE_OPTS.map(c => <span key={c.id} className={`px-2 py-0.5 rounded-full border font-medium ${c.color}`}>{c.label}</span>)}
        </div>
      </div>
      <div className="space-y-3">
        {CURVE_SCENARIOS.map(s => {
          const ans = answers[s.id] || {};
          const curveOk = checked && ans.curve === s.curve;
          const dirOk = checked && ans.dir === s.dir;
          const bothOk = curveOk && dirOk;
          const anyWrong = checked && (!curveOk || !dirOk);
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 transition ${bothOk ? "border-green-400 bg-green-50" : anyWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{s.text}</p>
              {!checked ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {CURVE_OPTS.map(c => (
                      <button key={c.id} onClick={() => setAns(s.id, "curve", c.id)}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${ans.curve === c.id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {DIR_OPTS.map(d => (
                      <button key={d.id} onClick={() => setAns(s.id, "dir", d.id)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans.dir === d.id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className={`text-xs font-semibold ${curveOk ? "text-green-700" : "text-red-700"}`}>{curveOk ? "✓ " : "✗ "}{s.curveLabel}</p>
                  <p className={`text-xs font-semibold ${dirOk ? "text-green-700" : "text-red-700"}`}>{dirOk ? "✓ " : "✗ "}{s.dirLabel}</p>
                  <p className="text-xs text-muted-foreground italic mt-1">{s.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Answers
        </button>
      ) : (
        <div className="space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {CURVE_SCENARIOS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, CURVE_SCENARIOS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Market Equilibrium: Surplus/Shortage Classifier
// ─────────────────────────────────────────────
const EQUIL_SCENARIOS = [
  { id: 1, text: "Gasoline market: equilibrium is $1.40/gal. Current price is $1.80. At this price, producers supply 680M gallons but buyers only want 500M.", status: "surplus", movement: "falls", statusLabel: "Surplus (Qs > Qd)", movementLabel: "Price falls toward equilibrium", reason: "At $1.80, Qs (680M) > Qd (500M) — 180M gallon surplus. Unsold inventory builds. Sellers cut prices to clear stock." },
  { id: 2, text: "Gasoline market: current price is $1.20/gal. Buyers want 700M gallons but producers only supply 550M.", status: "shortage", movement: "rises", statusLabel: "Shortage (Qd > Qs)", movementLabel: "Price rises toward equilibrium", reason: "At $1.20, Qd (700M) > Qs (550M) — 150M gallon shortage. Shelves go bare. Sellers raise prices as buyers compete." },
  { id: 3, text: "At the current price, every unit produced is sold and no buyer is left wanting. Quantity demanded equals quantity supplied.", status: "equilibrium", movement: "stable", statusLabel: "Equilibrium (Qd = Qs)", movementLabel: "Price is stable — no pressure to change", reason: "When Qd = Qs the market clears. There are no unsold goods and no unsatisfied buyers, so there is no pressure for the price to move." },
  { id: 4, text: "A city passes a rent control law capping rent at $500/month. The market equilibrium rent is $600/month. More people want apartments than landlords are willing to rent.", status: "shortage", movement: "rises", statusLabel: "Shortage (Qd > Qs)", movementLabel: "Price would rise — but ceiling holds it down", reason: "A price ceiling below equilibrium causes Qd > Qs — a persistent shortage. The price cannot rise to clear the market because of the legal ceiling." },
  { id: 5, text: "The government sets a minimum wheat price of $8/bushel. The market equilibrium is $6/bushel. Farmers produce more wheat than buyers want to purchase.", status: "surplus", movement: "falls", statusLabel: "Surplus (Qs > Qd)", movementLabel: "Price would fall — but floor holds it up", reason: "A price floor above equilibrium causes Qs > Qd — a persistent surplus. Government typically buys the excess to maintain the floor price." },
];

const STATUS_OPTS = [
  { id: "surplus",     label: "Surplus (Qs > Qd)",  color: "bg-red-100 border-red-300 text-red-800" },
  { id: "shortage",    label: "Shortage (Qd > Qs)", color: "bg-amber-100 border-amber-300 text-amber-800" },
  { id: "equilibrium", label: "Equilibrium",        color: "bg-green-100 border-green-300 text-green-800" },
];
const MOVE_OPTS = [
  { id: "falls",  label: "Price falls" },
  { id: "rises",  label: "Price rises" },
  { id: "stable", label: "Price stable" },
];

function EquilibriumStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, { status: string; movement: string }>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = EQUIL_SCENARIOS.every(s => answers[s.id]?.status && answers[s.id]?.movement);
  const correctCount = checked ? EQUIL_SCENARIOS.filter(s => answers[s.id]?.status === s.status && answers[s.id]?.movement === s.movement).length : 0;

  function setAns(id: number, field: "status" | "movement", val: string) {
    setAnswers(a => ({ ...a, [id]: { ...a[id], [field]: val } }));
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — Market Equilibrium: Surplus or Shortage?</p>
        <p className="text-muted-foreground text-xs mb-2">Classify each market situation and identify which direction price pressure moves. Remember: markets self-correct — surpluses push prices down, shortages push prices up.</p>
        <div className="flex flex-wrap gap-1 text-xs">
          {STATUS_OPTS.map(s => <span key={s.id} className={`px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>)}
        </div>
      </div>
      <div className="space-y-3">
        {EQUIL_SCENARIOS.map(s => {
          const ans = answers[s.id] || {};
          const statOk = checked && ans.status === s.status;
          const moveOk = checked && ans.movement === s.movement;
          const bothOk = statOk && moveOk;
          const anyWrong = checked && (!statOk || !moveOk);
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 transition ${bothOk ? "border-green-400 bg-green-50" : anyWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{s.text}</p>
              {!checked ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {STATUS_OPTS.map(o => (
                      <button key={o.id} onClick={() => setAns(s.id, "status", o.id)}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${ans.status === o.id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {MOVE_OPTS.map(m => (
                      <button key={m.id} onClick={() => setAns(s.id, "movement", m.id)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans.movement === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className={`text-xs font-semibold ${statOk ? "text-green-700" : "text-red-700"}`}>{statOk ? "✓ " : "✗ "}{s.statusLabel}</p>
                  <p className={`text-xs font-semibold ${moveOk ? "text-green-700" : "text-red-700"}`}>{moveOk ? "✓ " : "✗ "}{s.movementLabel}</p>
                  <p className="text-xs text-muted-foreground italic mt-1">{s.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Answers
        </button>
      ) : (
        <div className="space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {EQUIL_SCENARIOS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, EQUIL_SCENARIOS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Shifters
// ─────────────────────────────────────────────
type ShifterItem = {
  id: number;
  scenario: string;
  side: "demand" | "supply";
  direction: "left" | "right";
  sideExp: string;
  dirExp: string;
};

const SHIFTER_SCENARIOS: ShifterItem[] = [
  {
    id: 1,
    scenario: "Steel prices rise sharply. Car manufacturers now face higher production costs.",
    side: "supply", direction: "left",
    sideExp: "Steel is an input price — a producer-side factor. It shifts supply, not demand.",
    dirExp: "Higher input costs make production more expensive at every output level, shifting supply LEFT (less offered at each price).",
  },
  {
    id: 2,
    scenario: "U.S. chicken consumption rose from 47 to 97 lbs per person between 1980 and 2021 as tastes shifted toward chicken.",
    side: "demand", direction: "right",
    sideExp: "Tastes are a consumer-side factor — they shift demand.",
    dirExp: "Greater preference for chicken means more is demanded at every price — demand shifts RIGHT.",
  },
  {
    id: 3,
    scenario: "A severe drought destroys grain crops across the Midwest.",
    side: "supply", direction: "left",
    sideExp: "Natural conditions are a producer-side factor — they shift supply.",
    dirExp: "The drought reduces grain production at every price level — supply shifts LEFT.",
  },
  {
    id: 4,
    scenario: "An aging U.S. population increases the need for nursing home care and hearing aids.",
    side: "demand", direction: "right",
    sideExp: "Population size and demographics are consumer-side factors — they shift demand.",
    dirExp: "A larger elderly population means more demand for these services at every price — demand shifts RIGHT.",
  },
  {
    id: 5,
    scenario: "The government grants a subsidy to electric vehicle manufacturers.",
    side: "supply", direction: "right",
    sideExp: "Government policy (subsidies) is a producer-side factor — it shifts supply.",
    dirExp: "A subsidy lowers production costs, so producers offer more at every price — supply shifts RIGHT.",
  },
  {
    id: 6,
    scenario: "Consumers expect coffee prices to rise next month, so they buy more coffee today.",
    side: "demand", direction: "right",
    sideExp: "Future expectations are a consumer-side factor — they shift demand.",
    dirExp: "Expecting a price increase, consumers buy more now at current prices — demand shifts RIGHT today.",
  },
];

function ShiftersStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selSide, setSelSide] = useState<"demand" | "supply" | null>(null);
  const [selDir, setSelDir] = useState<"left" | "right" | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const item = SHIFTER_SCENARIOS[idx];
  const isLast = idx === SHIFTER_SCENARIOS.length - 1;
  const sideCorrect = checked ? selSide === item.side : null;
  const dirCorrect = checked ? selDir === item.direction : null;
  const bothCorrect = sideCorrect && dirCorrect;

  function handleCheck() {
    if (!selSide || !selDir) return;
    const pts = (selSide === item.side ? 1 : 0) + (selDir === item.direction ? 1 : 0);
    const newScore = score + pts;
    setScore(newScore);
    setChecked(true);
  }

  function handleNext() {
    setSelSide(null);
    setSelDir(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">What Shifts the Curves?</p>
        <div className="text-muted-foreground text-xs grid grid-cols-2 gap-3 mt-2">
          <div>
            <p className="font-semibold text-foreground mb-1">Demand shifters</p>
            <p>Income · Tastes · Population · Related goods · Expectations</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Supply shifters</p>
            <p>Input prices · Natural conditions · Technology · Government policy</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Price change → movement ALONG the curve. Non-price change → the WHOLE curve shifts.</p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Scenario {idx + 1} of {SHIFTER_SCENARIOS.length}</span>
        <div className="flex gap-1">{SHIFTER_SCENARIOS.map((_, i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < idx ? "bg-green-500" : i === idx ? "bg-primary" : "bg-muted"}`} />)}</div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground">{item.scenario}</p>

        {/* Side selection */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Which curve shifts?</p>
          <div className="flex gap-2">
            {(["demand", "supply"] as const).map((s) => (
              <button key={s} disabled={checked} onClick={() => setSelSide(s)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition capitalize ${
                  checked
                    ? s === item.side ? "border-green-500 bg-green-50 text-green-800" : s === selSide ? "border-red-400 bg-red-50 text-red-700" : "border-border text-muted-foreground opacity-50"
                    : selSide === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"
                }`}>
                {s}
              </button>
            ))}
          </div>
          {checked && <p className={`text-xs ${sideCorrect ? "text-green-700" : "text-red-700"}`}>{sideCorrect ? "✓ " : "✗ "}{item.sideExp}</p>}
        </div>

        {/* Direction selection */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Which direction?</p>
          <div className="flex gap-2">
            {(["left", "right"] as const).map((d) => (
              <button key={d} disabled={checked} onClick={() => setSelDir(d)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition capitalize ${
                  checked
                    ? d === item.direction ? "border-green-500 bg-green-50 text-green-800" : d === selDir ? "border-red-400 bg-red-50 text-red-700" : "border-border text-muted-foreground opacity-50"
                    : selDir === d ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"
                }`}>
                {d === "left" ? "← Left (decrease)" : "→ Right (increase)"}
              </button>
            ))}
          </div>
          {checked && <p className={`text-xs ${dirCorrect ? "text-green-700" : "text-red-700"}`}>{dirCorrect ? "✓ " : "✗ "}{item.dirExp}</p>}
        </div>
      </div>

      {!checked && (
        <button onClick={handleCheck} disabled={!selSide || !selDir}
          className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition">
          Check Answer
        </button>
      )}
      {checked && !isLast && (
        <button onClick={handleNext} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Next Scenario →
        </button>
      )}
      {checked && isLast && (
        <button onClick={() => onComplete(score, SHIFTER_SCENARIOS.length * 2)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Mark Complete ✓
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Four-Step Analysis: Stepped Scenario Walkthrough
// ─────────────────────────────────────────────
const FOURSTEP_SCENARIOS = [
  {
    scenario: "A severe drought hits Midwest grain farms, destroying a large portion of the corn and wheat harvest.",
    steps: [
      { q: "Step 1 — Which curve is affected: demand or supply?", options: ["A) Demand — consumers want less grain after the drought", "B) Supply — the drought affects producers' ability to grow grain", "C) Both curves shift simultaneously", "D) Neither — droughts only affect prices, not quantities"], correct: 1, exp: "A drought is a natural condition — a producer-side factor. It affects the supply curve, not demand. Consumers still want the same amount of grain at each price." },
      { q: "Step 2 — Which direction does the curve shift?", options: ["A) Right — producers offer more grain at every price", "B) Left — producers offer less grain at every price", "C) The curve rotates but does not shift", "D) There is no shift — only a movement along the curve"], correct: 1, exp: "Drought destroys production capacity. Less grain is available at every price level, so the supply curve shifts LEFT." },
      { q: "Step 3 — What happens to equilibrium price and quantity?", options: ["A) Price falls, quantity rises", "B) Price rises, quantity falls", "C) Price rises, quantity rises", "D) Price falls, quantity falls"], correct: 1, exp: "Supply shifts left → new equilibrium has higher price and lower quantity. Key pattern: when supply shifts, P and Q move in opposite directions." },
    ],
  },
  {
    scenario: "Rising incomes and a surge of confidence lead consumers to buy significantly more new cars.",
    steps: [
      { q: "Step 1 — Which curve is affected: demand or supply?", options: ["A) Supply — car factories produce more when consumers are confident", "B) Demand — income and confidence are consumer-side factors", "C) Supply — automakers respond to higher prices by producing more", "D) Neither — income changes only affect the labor market"], correct: 1, exp: "Income and consumer confidence are demand shifters — consumer-side factors. They shift the demand curve." },
      { q: "Step 2 — Which direction does the curve shift?", options: ["A) Left — higher incomes cause consumers to save more instead", "B) Right — consumers want more cars at every price level", "C) Left — car prices rise, reducing quantity demanded", "D) Right for supply, not demand"], correct: 1, exp: "Higher income and confidence increase willingness to buy. More cars are demanded at every price — the demand curve shifts RIGHT." },
      { q: "Step 3 — What happens to equilibrium price and quantity?", options: ["A) Price rises, quantity falls", "B) Price falls, quantity rises", "C) Price rises, quantity rises", "D) Price falls, quantity falls"], correct: 2, exp: "Demand shifts right → new equilibrium has higher price AND higher quantity. Key pattern: when demand shifts, P and Q move in the SAME direction." },
    ],
  },
  {
    scenario: "The government grants a large subsidy to solar panel manufacturers, significantly lowering their production costs.",
    steps: [
      { q: "Step 1 — Which curve is affected: demand or supply?", options: ["A) Demand — consumers want more solar panels because of the subsidy", "B) Supply — the subsidy lowers producers' costs", "C) Both — subsidies always shift both curves", "D) Neither — subsidies only affect government revenue"], correct: 1, exp: "A government subsidy to manufacturers is a producer-side policy — it lowers production costs and shifts the supply curve." },
      { q: "Step 2 — Which direction does the supply curve shift?", options: ["A) Left — the subsidy reduces profit incentive", "B) Right — lower costs mean producers offer more at every price", "C) Left — government intervention always reduces supply", "D) The curve pivots, not shifts"], correct: 1, exp: "Lower production costs mean producers can profitably offer more panels at every price — supply shifts RIGHT." },
      { q: "Step 3 — What happens to equilibrium price and quantity?", options: ["A) Price rises, quantity falls", "B) Price rises, quantity rises", "C) Price falls, quantity falls", "D) Price falls, quantity rises"], correct: 3, exp: "Supply shifts right → new equilibrium has lower price and higher quantity. Pattern: supply shifts → P and Q move oppositely. The subsidy makes solar cheaper and more widely adopted." },
    ],
  },
];

function FourStepStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [scenIdx, setScenIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const scen = FOURSTEP_SCENARIOS[scenIdx];
  const step = scen.steps[stepIdx];
  const isLastStep = stepIdx === scen.steps.length - 1;
  const isLastScen = scenIdx === FOURSTEP_SCENARIOS.length - 1;
  const totalQs = FOURSTEP_SCENARIOS.reduce((a, s) => a + s.steps.length, 0);

  function handleCheck() {
    if (sel === null) return;
    const newScore = sel === step.correct ? score + 1 : score;
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() {
    setSel(null);
    setChecked(false);
    if (!isLastStep) { setStepIdx(i => i + 1); }
    else if (!isLastScen) { setScenIdx(i => i + 1); setStepIdx(0); }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Four-Step Analysis</p>
        <p className="text-muted-foreground text-xs">Apply the four-step method to 3 real scenarios. Each scenario walks through which curve shifts, which direction, and what happens to P and Q.</p>
        <div className="flex gap-1 mt-2">
          {FOURSTEP_SCENARIOS.map((s, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < scenIdx ? "bg-primary" : i === scenIdx ? "bg-primary/60" : "bg-primary/20"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Scenario {scenIdx + 1} of {FOURSTEP_SCENARIOS.length}</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
        <p className="font-semibold text-amber-800 text-xs uppercase tracking-wide mb-1">Scenario {scenIdx + 1}</p>
        <p className="text-foreground">{scen.scenario}</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {stepIdx + 1} of {scen.steps.length}</p>
        <p className="text-sm font-semibold text-foreground">{step.q}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button key={i} disabled={checked} onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}>{opt}</button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !(isLastStep && isLastScen) && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            {isLastStep ? "Next Scenario →" : "Next Step →"}
          </button>
        )}
        {checked && isLastStep && isLastScen && (
          <button onClick={() => onComplete(score, totalQs)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Price Controls: Verdict Cards
// ─────────────────────────────────────────────
const CONTROLS_CARDS = [
  {
    id: "ceiling",
    icon: "🏠",
    title: "Rent Control",
    tag: "PRICE CEILING",
    tagColor: "bg-blue-100 border-blue-400 text-blue-800",
    setup: "City sets maximum rent at $500/month. Market equilibrium is $600/month.",
    whoWins: "Current tenants holding rent-controlled units pay $100/month less than the market rate.",
    whoPays: "New renters face a shortage — fewer apartments are offered. Landlords convert units to condos, reduce maintenance, and allocate by waiting lists or connections. Total rental housing supply shrinks.",
    lesson: "The ceiling helps a few sitting tenants — and hurts many more prospective renters. No free lunch.",
  },
  {
    id: "floor",
    icon: "🌾",
    title: "Agricultural Price Floor",
    tag: "PRICE FLOOR",
    tagColor: "bg-amber-100 border-amber-400 text-amber-800",
    setup: "Government sets a minimum wheat price of $8/bushel above the $6 market equilibrium.",
    whoWins: "Farmers receive a guaranteed price above what the market would pay — higher and more stable income.",
    whoPays: "Taxpayers fund government purchases of the surplus wheat. Consumers pay above-market food prices. Resources are misallocated — too much wheat is produced relative to what buyers actually want. High-income countries spend roughly $1 billion per day supporting farmers.",
    lesson: "Price floors benefit producers but impose costs on consumers and taxpayers. The surplus must go somewhere — usually government storage or export subsidies.",
  },
  {
    id: "minwage",
    icon: "💵",
    title: "Minimum Wage",
    tag: "PRICE FLOOR",
    tagColor: "bg-amber-100 border-amber-400 text-amber-800",
    setup: "Government sets a minimum wage of $15/hour in a market where the equilibrium wage is $12/hour.",
    whoWins: "Workers who keep their jobs earn $3/hour more. Raises living standards for employed low-wage workers.",
    whoPays: "The standard model predicts some reduction in employment — businesses hire fewer workers or substitute technology when labor costs rise above equilibrium. The debate: how large is this effect? Most economists find modest employment effects at moderate minimum wages, larger effects if set far above equilibrium.",
    lesson: "A price floor on labor (minimum wage) is more nuanced than commodity markets. The trade-off is real but the magnitude depends on how binding the floor is relative to the local equilibrium wage.",
  },
];

function ControlsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = CONTROLS_CARDS.every(c => revealed.has(c.id));

  function toggle(id: string) {
    setRevealed(r => new Set([...r, id]));
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 6 — Price Controls: Who Wins, Who Pays?</p>
        <p className="text-muted-foreground text-xs">Price controls create predictable winners and losers. Open each card to see who benefits and who bears the cost. Open all three to complete the station.</p>
      </div>
      <div className="space-y-3">
        {CONTROLS_CARDS.map(card => {
          const isOpen = expanded === card.id;
          const seen = revealed.has(card.id);
          return (
            <div key={card.id} className={`rounded-2xl border-2 overflow-hidden transition ${seen ? "border-primary/40" : "border-border"} bg-card`}>
              <button onClick={() => toggle(card.id)}
                className="w-full flex items-center justify-between p-4 text-left gap-3 hover:bg-muted/40 transition">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mr-2 ${card.tagColor}`}>{card.tag}</span>
                    <span className="text-sm font-semibold text-foreground">{card.title}</span>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="bg-muted/50 rounded-xl p-3 text-xs text-foreground">
                    <p className="font-semibold mb-1">Setup</p>
                    <p>{card.setup}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs">
                    <p className="font-semibold text-green-800 mb-1">✓ Who Benefits</p>
                    <p className="text-green-700">{card.whoWins}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
                    <p className="font-semibold text-red-800 mb-1">✗ Who Pays the Cost</p>
                    <p className="text-red-700">{card.whoPays}</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Key Lesson</p>
                    <p className="text-xs text-foreground">{card.lesson}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button disabled={!allRevealed} onClick={() => onComplete(CONTROLS_CARDS.length, CONTROLS_CARDS.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allRevealed ? "Mark Complete ✓" : `Open all cards to continue (${revealed.size}/${CONTROLS_CARDS.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared Stepped Quiz Component
// ─────────────────────────────────────────────
function SteppedQuiz({ q, idx, total, sel, setSel, checked, onCheck, onNext, isLast, score, onComplete }: {
  q: { q: string; options: string[]; correct: number; exp: string };
  idx: number; total: number; sel: number | null; setSel: (n: number) => void;
  checked: boolean; onCheck: () => void; onNext: () => void; isLast: boolean; score: number;
  onComplete: (score: number, total: number) => void;
}) {
  return (
    <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of {total}</p>
        {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
      </div>
      <p className="text-sm font-semibold text-foreground">{q.q}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button key={i} disabled={checked} onClick={() => setSel(i)}
            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
              checked
                ? i === q.correct ? "border-green-500 bg-green-50 text-green-900"
                  : i === sel && sel !== q.correct ? "border-red-400 bg-red-50 text-red-900"
                  : "border-border text-muted-foreground opacity-60"
                : sel === i ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-foreground hover:border-primary"
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {checked && (
        <div className={`rounded-lg p-3 text-xs ${sel === q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {sel === q.correct ? "✓ Correct — " : "✗ Incorrect — "}{q.exp}
        </div>
      )}
      {!checked && sel !== null && (
        <button onClick={onCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
          Check Answer
        </button>
      )}
      {checked && !isLast && (
        <button onClick={onNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
          Next Question →
        </button>
      )}
      {checked && isLast && (
        <button onClick={() => onComplete(score, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Mark Complete ✓
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Price Mechanism", back: "Prices act as signals and incentives — communicating scarcity while rewarding producers and guiding consumers, all without a central coordinator." },
  { front: "Law of Demand", back: "As price rises, quantity demanded falls; as price falls, quantity demanded rises. Price and quantity demanded move in opposite directions." },
  { front: "Demand vs. Quantity Demanded", back: "Demand is the entire curve (all price-quantity combinations). Quantity demanded is one specific point on that curve at a given price." },
  { front: "Law of Supply", back: "As price rises, quantity supplied rises; as price falls, quantity supplied falls. Price and quantity supplied move in the same direction." },
  { front: "Demand Shifters (5)", back: "The five non-price factors that shift the demand curve: (1) Income, (2) Tastes, (3) Population, (4) Prices of related goods (substitutes/complements), (5) Future price expectations." },
  { front: "Supply Shifters (4)", back: "The four non-price factors that shift the supply curve: (1) Input prices, (2) Natural conditions, (3) Technology, (4) Government policy (taxes, subsidies, regulations)." },
  { front: "Market Equilibrium", back: "The price at which quantity demanded equals quantity supplied. At this price the market clears — no surplus or shortage." },
  { front: "Surplus", back: "When price is above equilibrium, quantity supplied exceeds quantity demanded. Sellers cut prices to clear unsold goods, pushing price back toward equilibrium." },
  { front: "Shortage", back: "When price is below equilibrium, quantity demanded exceeds quantity supplied. Sellers raise prices, pushing the market back toward equilibrium." },
  { front: "Price Ceiling", back: "A government-imposed maximum price set below equilibrium. Creates a shortage (Qd > Qs). Example: rent control." },
  { front: "Price Floor", back: "A government-imposed minimum price set above equilibrium. Creates a surplus (Qs > Qd). Example: agricultural price supports." },
  { front: "Ceteris Paribus", back: "Latin for 'all else equal.' When analyzing a market change, we change one variable at a time and hold all others constant." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [cards] = useState(() => shuffle([...FLASHCARDS]));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set());

  function handleFlip() { setFlipped(f => !f); }
  function handleNext() {
    setSeen(s => new Set([...s, idx]));
    if (idx < cards.length - 1) { setIdx(i => i + 1); setFlipped(false); }
  }
  function handlePrev() {
    if (idx > 0) { setIdx(i => i - 1); setFlipped(false); }
  }
  const allSeen = seen.size >= cards.length - 1;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 3 Key Terms</p>
        <p className="text-muted-foreground text-xs">Review all {cards.length} terms. Click each card to reveal the definition. You must view all cards before the Quiz unlocks.</p>
        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(seen.size / cards.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{seen.size}/{cards.length} cards reviewed</p>
      </div>
      <div onClick={handleFlip} className="cursor-pointer select-none bg-card border-2 border-border rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{flipped ? "Definition" : "Term"} — {idx + 1} / {cards.length}</p>
        <p className={`font-semibold leading-relaxed ${flipped ? "text-sm text-muted-foreground" : "text-base text-foreground"}`}>
          {flipped ? cards[idx].back : cards[idx].front}
        </p>
        <p className="text-xs text-muted-foreground mt-4">{flipped ? "Click to see term" : "Click to reveal definition"}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={handlePrev} disabled={idx === 0}
          className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground disabled:opacity-30 hover:bg-muted transition">← Prev</button>
        <button onClick={handleNext} disabled={idx === cards.length - 1}
          className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground disabled:opacity-30 hover:bg-muted transition">Next →</button>
      </div>
      <button disabled={!allSeen} onClick={() => onComplete(cards.length, cards.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allSeen ? "Mark Complete — Unlock Quiz ✓" : `Review all cards to unlock (${seen.size}/${cards.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz pool — modeled on W2-HW1 and W2-HW2 style
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  {
    q: "In economics, 'demand' for a good refers to those who are:",
    options: ["Everyone who wishes they could own the good", "Those who are both willing AND able to buy it at various prices", "The total quantity purchased last quarter", "Consumers who have already bought the good at least once"],
    correct: 1,
    exp: "Demand requires both willingness (the desire) AND ability (the purchasing power) to pay. Wanting a luxury sports car without the budget to buy one is not economic demand.",
  },
  {
    q: "The law of demand states that, ceteris paribus:",
    options: [
      "As price rises, demand increases",
      "As price rises, quantity demanded rises",
      "As price rises, quantity demanded falls",
      "Price and quantity demanded move in the same direction",
    ],
    correct: 2,
    exp: "The law of demand describes an inverse relationship between price and quantity demanded along a fixed curve. This is a movement ALONG the curve — the curve itself does not shift when price changes.",
  },
  {
    q: "Movie ticket prices fall from $15 to $10. Consumers attend more movies. Economists call this:",
    options: [
      "An increase in demand",
      "A rightward shift of the demand curve",
      "A change in consumer tastes",
      "An increase in quantity demanded",
    ],
    correct: 3,
    exp: "A change in the good's own price moves us ALONG the existing demand curve — that is a change in quantity demanded, not a shift of demand. The demand curve stays in place; only the position along it changes.",
  },
  {
    q: "The law of supply states that, ceteris paribus, as price rises:",
    options: [
      "Quantity supplied rises",
      "Quantity supplied falls",
      "The supply curve shifts left",
      "Producers exit the market",
    ],
    correct: 0,
    exp: "Law of supply: higher prices reward production. As price rises, quantity supplied rises — producers drill more, hire more, open new plants. Price and quantity supplied move in the SAME direction.",
  },
  {
    q: "In a free market, the equilibrium price is determined by:",
    options: [
      "The largest firm setting a price that covers its costs",
      "The government agency responsible for price stability",
      "The intersection of the market demand curve and the market supply curve",
      "Producers calculating cost plus a standard profit margin",
    ],
    correct: 2,
    exp: "Market equilibrium occurs where Qd = Qs — graphically where demand and supply curves intersect. No single buyer or seller sets this price; it emerges from the interaction of all market participants.",
  },
  {
    q: "At a price BELOW market equilibrium, what occurs?",
    options: [
      "Quantity supplied exceeds quantity demanded — a surplus",
      "The market is in equilibrium",
      "Producers increase output to take advantage of rising prices",
      "Quantity demanded exceeds quantity supplied — a shortage",
    ],
    correct: 3,
    exp: "Below equilibrium, the low price attracts more buyers (Qd rises) and discourages sellers (Qs falls). The resulting shortage puts upward pressure on price until the market clears at equilibrium.",
  },
  {
    q: "At a price ABOVE market equilibrium, what occurs?",
    options: ["Quantity demanded exceeds quantity supplied — a shortage", "Quantity supplied exceeds quantity demanded — a surplus", "The market is in equilibrium at the higher price", "Consumers immediately stop buying until prices fall"],
    correct: 1,
    exp: "Above equilibrium, the high price discourages buyers (Qd falls) and attracts sellers (Qs rises). The surplus of unsold goods puts downward pressure on price, self-correcting back toward equilibrium.",
  },
  {
    q: "Peanut butter and jelly are complements. If the price of peanut butter rises sharply, what happens in the market for jelly?",
    options: [
      "Demand for jelly decreases (shifts left)",
      "Demand for jelly increases (shifts right)",
      "The quantity demanded of jelly falls along the existing curve",
      "No change — jelly and peanut butter are independent goods",
    ],
    correct: 0,
    exp: "Complements are used together. When peanut butter becomes more expensive, people buy less of it — and therefore less jelly. Demand for jelly shifts LEFT (decreases at every price). This is a demand shift, not a movement along the curve.",
  },
  {
    q: "A drought devastates the corn crop. Using the four-step method, what happens to equilibrium price and quantity of corn?",
    options: [
      "Price falls, quantity rises",
      "Price rises, quantity rises",
      "Price falls, quantity falls",
      "Price rises, quantity falls",
    ],
    correct: 3,
    exp: "Step 2: natural conditions → supply. Step 3: less corn at every price → supply shifts LEFT. Step 4: new equilibrium has higher price and lower quantity. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Consumer incomes rise and the good is a normal good. What happens to equilibrium price and quantity?",
    options: [
      "Price falls, quantity falls",
      "Price rises, quantity falls",
      "Price rises, quantity rises",
      "Price falls, quantity rises",
    ],
    correct: 2,
    exp: "Income is a demand shifter. For a normal good, rising income → demand shifts RIGHT. New equilibrium: both price and quantity rise. Pattern: demand shifts → P and Q move together.",
  },
  {
    q: "New automation technology cuts the cost of making smartphones in half. What happens in the smartphone market?",
    options: ["Demand shifts right → price and quantity both rise", "Supply shifts right → price falls, quantity rises", "Supply shifts left → price rises, quantity falls", "Demand shifts left → price and quantity both fall"],
    correct: 1,
    exp: "Technology is a supply shifter. Lower production costs → supply shifts RIGHT. New equilibrium: lower price, higher quantity. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Demand for electric vehicles rises (due to higher gasoline prices) AND supply rises (due to a new battery factory opening) simultaneously. What can you conclude?",
    options: [
      "Quantity definitely rises; price change is ambiguous",
      "Price definitely rises; quantity is ambiguous",
      "Both price and quantity definitely rise",
      "Both price and quantity are ambiguous",
    ],
    correct: 0,
    exp: "Both shifts push quantity UP (demand-right → Q up; supply-right → Q up). On price: demand-right pushes P up, supply-right pushes P down — these work against each other. Which dominates depends on the relative size of the shifts, so price is ambiguous.",
  },
  {
    q: "A price ceiling is most accurately defined as:",
    options: [
      "A legal minimum price set above market equilibrium",
      "The highest price sellers are willing to accept",
      "A legal maximum price, typically set below market equilibrium to be binding",
      "A price set by the largest firm in the market",
    ],
    correct: 2,
    exp: "A price ceiling is a legal CAP — sellers cannot charge above it. To be binding (have any real effect), it must be set BELOW equilibrium. If set above equilibrium, the market clears below the ceiling and it has no effect.",
  },
  {
    q: "A city sets rent control at $900/month when market equilibrium is $1,400/month. The predictable result is:",
    options: [
      "A surplus of apartments as landlords rush to rent them out",
      "No effect — landlords will continue supplying apartments at any price",
      "Improved apartment quality as landlords compete for tenants",
      "A shortage of apartments as Qd exceeds Qs at the controlled price",
    ],
    correct: 3,
    exp: "At $900 (below equilibrium $1,400), Qd is high (cheap apartments attract many renters) while Qs is low (less profitable for landlords). The gap is a shortage. Landlords also reduce maintenance and convert units — 'the ceiling helps a few and hurts many more.'",
  },
  {
    q: "A government sets a price floor for sugar above the market equilibrium. The most predictable result is:",
    options: [
      "A surplus — Qs exceeds Qd at the above-equilibrium floor price",
      "A shortage — consumers demand more sugar at the lower price",
      "No effect — markets always clear at equilibrium regardless of floors",
      "Lower prices for consumers as producers compete for buyers",
    ],
    correct: 0,
    exp: "A floor above equilibrium is binding. The high guaranteed price encourages Qs (producers supply more) while discouraging Qd (consumers buy less). The gap is a surplus. Governments often purchase the surplus to maintain the floor — funded by taxpayers.",
  },
];

function QuizStation({ onPass, onFail }: { onPass: (score: number, results: { correct: boolean; exp: string }[]) => void; onFail: () => void }) {
  const [questions] = useState(() => shuffle(ALL_QUESTIONS).slice(0, 10));
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; exp: string }[]>([]);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const correct = sel === q.correct;
    setResults((r) => [...r, { correct, exp: q.exp }]);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  function handleFinish() {
    const score = results.filter((r) => r.correct).length;
    if (score >= 9) onPass(score, results);
    else onFail();
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground">Chapter 3 Quiz</p>
        <p className="text-muted-foreground text-xs">10 questions — score 9 or higher to pass.</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of 10</p>
          <span className="text-xs text-muted-foreground">{results.filter((r) => r.correct).length} correct</span>
        </div>
        <p className="text-sm font-semibold text-foreground">{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button key={`q${idx}-opt${i}`} disabled={checked} onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === q.correct ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== q.correct ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}>
              {opt}
            </button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === q.correct ? "✓ Correct — " : "✗ Incorrect — "}{q.exp}
          </div>
        )}
        {!checked && sel !== null && <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Check Answer</button>}
        {checked && !isLast && <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Question →</button>}
        {checked && isLast && <button onClick={handleFinish} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Submit Quiz</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Results Screen
// ─────────────────────────────────────────────
const STATION_LABELS_CH3: Record<string, string> = {
  pricemech:   "The Price Mechanism",
  laws:        "Laws of Demand & Supply",
  equilibrium: "Market Equilibrium",
  shifters:    "Demand & Supply Shifters",
  fourstep:    "Four-Step Analysis",
  controls:    "Price Controls",
  flash:       "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");

  const stationRows = Object.entries(STATION_LABELS_CH3)
    .filter(([id]) => sectionScores[id])
    .map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stationTableRows = stationRows.map(r =>
      `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score}/${r.total}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score === r.total ? "✓" : r.score >= r.total * 0.7 ? "Good" : "Review"}</td></tr>`
    ).join("");
    const quizRows = results.map((r, i) =>
      `<tr style="background:${r.correct ? "#f0fdf4" : "#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct ? "✓" : "✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`
    ).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch3 Results</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style>
      </head><body>
      <h1>${courseTitle}</h1><h2>Chapter 3 — Demand and Supply</h2>
      <p style="font-size:0.9rem;color:#475569"><strong>Student:</strong> ${name || "—"} &nbsp;&nbsp; <strong>Date:</strong> ${now}</p>
      <div class="score-box"><p>Quiz Score: ${score}/10 — ${score >= 9 ? "PASSED ✓" : "Not Yet"}</p></div>
      ${stationTableRows ? `<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stationTableRows}</tbody></table>` : ""}
      <h3>Quiz Question Review</h3>
      <table><thead><tr><th style="width:40px"></th><th>Question</th><th>Explanation</th></tr></thead><tbody>${quizRows}</tbody></table>
      ${exitTicket ? `<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:12px"><strong style="font-size:0.75rem;text-transform:uppercase;color:#64748b">Exit Ticket</strong><p style="font-size:0.85rem;margin:6px 0 0">${exitTicket}</p></div>` : ""}
      <footer>Access for free at https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction</footer>
      </body></html>`);
    setTimeout(() => w.print(), 600);
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-2xl p-5 text-center ${score >= 9 ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
        <p className="text-3xl font-bold">{score}/10</p>
        <p className={`text-lg font-semibold mt-1 ${score >= 9 ? "text-green-800" : "text-amber-800"}`}>{score >= 9 ? "Excellent — Chapter 3 Complete! ✓" : "Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 3 — Demand and Supply</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div>
          <label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e => setName(e.target.value)} placeholder="First and Last Name"
            className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In one sentence, explain why a price ceiling set below equilibrium creates a shortage.</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e => setExitTicket(e.target.value)} rows={2} placeholder="Your response..."
            className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
        </div>
      </div>
      {stationRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Station Scores</p>
          <div className="space-y-2">
            {stationRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-bold ${r.score === r.total ? "text-green-700" : r.score >= r.total * 0.7 ? "text-amber-700" : "text-red-600"}`}>{r.score}/{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Quiz Question Review</p>
        {results.map((r, i) => (
          <div key={i} className={`rounded-xl border p-3 ${r.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <p className="text-xs font-semibold">{r.correct ? "✓ Correct" : "✗ Incorrect"} — Question {i + 1}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{r.exp}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={printPDF} disabled={!name.trim()} className="flex-1 py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
        <button type="button" onClick={onRestart} className="flex-1 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stations list, Nav, and Order
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "pricemech"   as Station, label: "Price Mechanism",       desc: "How prices coordinate without a coordinator", icon: "📡" },
  { id: "laws"        as Station, label: "Laws of D & S",         desc: "The two laws and the curves they generate", icon: "📉" },
  { id: "equilibrium" as Station, label: "Market Equilibrium",    desc: "Where the curves meet and how markets self-correct", icon: "⚖️" },
  { id: "shifters"    as Station, label: "Shifters",              desc: "Non-price factors that move demand and supply", icon: "↔️" },
  { id: "fourstep"    as Station, label: "Four-Step Analysis",    desc: "A reusable method for predicting market changes", icon: "🔢" },
  { id: "controls"    as Station, label: "Price Controls",        desc: "Ceilings, floors, and their unintended consequences", icon: "🚧" },
  { id: "flash"       as Station, label: "Flashcard Review",      desc: "Master all 12 key Ch3 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",       label: "Dashboard" },
  { id: "pricemech",   label: "Price Mech" },
  { id: "laws",        label: "D & S Laws" },
  { id: "equilibrium", label: "Equilibrium" },
  { id: "shifters",    label: "Shifters" },
  { id: "fourstep",    label: "Four-Step" },
  { id: "controls",    label: "Controls" },
  { id: "flash",       label: "Flashcards" },
  { id: "quiz",        label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","pricemech","laws","equilibrium","shifters","fourstep","controls","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Chapter Summary Modal
// ─────────────────────────────────────────────
const CH3_SUMMARY = [
  { heading: "3.1 Demand, Supply, and Equilibrium in Markets for Goods and Services", body: "A demand schedule shows the relationship between price and quantity demanded. A supply schedule shows the relationship between price and quantity supplied. The point where the supply and demand schedules cross is called the equilibrium. The equilibrium price and quantity occur where the quantity supplied and quantity demanded are equal." },
  { heading: "3.2 Shifts in Demand and Supply for Goods and Services", body: "Economists distinguish between changes in demand or supply and changes in the quantity demanded or supplied. A change in demand or supply is caused by a factor other than price and results in a different demand or supply curve. Changes in the quantity demanded or supplied represent movements along existing curves." },
  { heading: "3.3 Changes in Equilibrium Price and Quantity: The Four-Step Process", body: "When analyzing how a change in the economy affects a market, use the four-step process: (1) Draw a demand and supply diagram to think about what the market looked like before the event. (2) Decide whether the event affects supply or demand. (3) Decide whether the effect on supply or demand is positive or negative, and draw the curve shift. (4) Read the new equilibrium price and quantity from the diagram." },
  { heading: "3.4 Price Ceilings and Price Floors", body: "Price ceilings prevent a price from rising above a certain level. When a price ceiling is set below the equilibrium price, quantity demanded exceeds quantity supplied, causing a shortage. Price floors prevent a price from falling below a certain level. When a price floor is set above the equilibrium price, quantity supplied exceeds quantity demanded, causing a surplus." },
];

function SummaryModal({ onClose, courseTitle }: { onClose: () => void; courseTitle: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 3 Summary — Demand and Supply</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Close">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH3_SUMMARY.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{s.heading}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">Access for free at <a href="https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction" target="_blank" rel="noopener noreferrer" className="underline text-primary">https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction</a></p>
        </div>
        <div className="p-4 border-t border-border">
          <button onClick={onClose} type="button" className="w-full py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold text-sm transition">Close &amp; Return to Lab</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Not Yet Screen
// ─────────────────────────────────────────────
function NotYetScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-4 text-center">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
        <p className="text-2xl mb-2">📚</p>
        <p className="text-lg font-bold text-amber-800">Not quite there yet</p>
        <p className="text-sm text-amber-700 mt-2">You need 9 out of 10 correct to complete the quiz. This screen cannot be submitted. Only the final Results screen counts.</p>
      </div>
      <button type="button" onClick={onRetry} className="w-full py-3 bg-amber-500 hover:opacity-90 text-white rounded-xl font-semibold transition">← Try the Quiz Again</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapter 3 — Demand and Supply</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progress / STATIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}/{STATIONS.length} stations complete</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted border border-border">
        <div className="flex items-center gap-2">
          <span className="text-base">📄</span>
          <span className="text-sm text-foreground">Need a refresher? View the chapter summary.</span>
        </div>
        <button onClick={onSummary} className="text-xs px-3 py-1.5 rounded-lg bg-card border border-border text-primary font-semibold hover:bg-accent transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Open Summary</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {STATIONS.map(s => {
          const done = completed.has(s.id);
          return (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)}
              className={`rounded-xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${done ? "border-green-400 bg-green-50" : "border-border bg-card hover:border-primary/40"}`}>
              <span className="text-lg">{done ? "✅" : s.icon}</span>
              <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onStartQuiz} disabled={!quizUnlocked}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${quizUnlocked ? "bg-primary hover:opacity-90 text-primary-foreground" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"}`}>
        {quizUnlocked ? "🎯 Take the Quiz" : "🔒 Complete all stations to unlock the Quiz"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function Header({ station, completed, onNav, courseTitle, courseSubtitle, hubUrl }: {
  station: Station; completed: Set<Station>; onNav: (s: Station) => void; courseTitle: string; courseSubtitle: string; hubUrl: string;
}) {
  const currentIdx = STATION_ORDER.indexOf(station);
  const allStationsDone = STATIONS.every(s => completed.has(s.id));
  return (
    <header role="banner" className="bg-secondary text-secondary-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Econ Lab logo">
            <rect width="32" height="32" rx="8" fill="hsl(38 95% 50%)"/>
            <path d="M8 22 L12 14 L16 18 L20 10 L24 16" stroke="hsl(222 30% 10%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="24" cy="16" r="2" fill="hsl(222 30% 10%)"/>
          </svg>
          <div>
            <div className="font-display font-semibold text-sm leading-none text-sidebar-foreground">{courseTitle}</div>
            <div className="text-xs text-sidebar-foreground/80 leading-none mt-0.5">{courseSubtitle}</div>
          </div>
        </div>
        <a href={hubUrl} target="_blank" rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">
          ← Course Hub
        </a>
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {NAV_STATIONS.map(s => {
            const idx = STATION_ORDER.indexOf(s.id);
            const done = completed.has(s.id);
            const active = s.id === station || (station === "not-yet" && s.id === "quiz") || (station === "results" && s.id === "quiz");
            if (s.id === "quiz" && !allStationsDone) {
              return <span key={s.id} title="Complete all stations first" className="px-3 py-1.5 rounded-full text-xs font-medium text-sidebar-foreground/35 cursor-not-allowed select-none">🔒 Quiz</span>;
            }
            return (
              <button key={s.id} onClick={() => onNav(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-sidebar-accent text-sidebar-foreground/90" : "text-sidebar-foreground/75 hover:text-white"
                }`}>
                {done && !active ? "✓ " : ""}{s.label}
              </button>
            );
          })}
        </div>
        <div className="sm:hidden text-sm font-medium text-sidebar-foreground/80">{currentIdx + 1} / {NAV_STATIONS.length}</div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Main EconLab
// ─────────────────────────────────────────────
export default function EconLab({ courseTitle, courseSubtitle, hubUrl }: {
  courseTitle: string; courseSubtitle: string; hubUrl: string;
}) {
  const [station, setStation] = useState<Station>("intro");
  const [completed, setCompleted] = useState<Set<Station>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Station[]); } catch { return new Set(); }
  });
  const [showSummary, setShowSummary] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correct: boolean; exp: string }[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});

  function markDone(s: Station, score?: number, total?: number) {
    const next = new Set(completed);
    next.add(s);
    setCompleted(next);
    if (score !== undefined && total !== undefined) {
      setSectionScores(prev => ({ ...prev, [s]: { score, total } }));
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
    setStation("intro");
  }

  const quizUnlocked = STATIONS.every(s => completed.has(s.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} courseTitle={courseTitle} />}
      <Header station={station} completed={completed} onNav={setStation} courseTitle={courseTitle} courseSubtitle={courseSubtitle} hubUrl={hubUrl} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {station === "intro"       && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "pricemech"   && <PriceMechStation   onComplete={(sc, t) => markDone("pricemech",   sc, t)} />}
        {station === "laws"        && <LawsStation        onComplete={(sc, t) => markDone("laws",        sc, t)} />}
        {station === "equilibrium" && <EquilibriumStation onComplete={(sc, t) => markDone("equilibrium", sc, t)} />}
        {station === "shifters"    && <ShiftersStation    onComplete={(sc, t) => markDone("shifters",    sc, t)} />}
        {station === "fourstep"    && <FourStepStation    onComplete={(sc, t) => markDone("fourstep",    sc, t)} />}
        {station === "controls"    && <ControlsStation    onComplete={(sc, t) => markDone("controls",    sc, t)} />}
        {station === "flash"       && <FlashcardStation   onComplete={(sc, t) => markDone("flash",       sc, t)} />}
        {station === "quiz" && (
          <QuizStation
            onPass={(score, results) => { setQuizScore(score); setQuizResults(results); markDone("quiz", score, 10); setStation("results"); }}
            onFail={() => setStation("not-yet")}
          />
        )}
        {station === "not-yet" && <NotYetScreen onRetry={() => setStation("quiz")} />}
        {station === "results" && <ResultsScreen score={quizScore} results={quizResults} sectionScores={sectionScores} onRestart={() => setStation("intro")} courseTitle={courseTitle} />}
      </main>
    </div>
  );
}
