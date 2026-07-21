import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "macrowhy"
  | "gdpclassify"
  | "components"
  | "realvnom"
  | "cyclephase"
  | "compare"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch6_v2";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
// Station 1 — Why Macro Matters (MC)
// ─────────────────────────────────────────────
const MACRO_QUESTIONS = [
  {
    q: "Which of the following is NOT a macroeconomic topic?",
    options: [
      "A) The national unemployment rate",
      "B) The price of a specific gallon of milk at one store",
      "C) The overall inflation rate in the economy",
      "D) The annual growth rate of real GDP",
    ],
    correct: 1,
    exp: "Microeconomics studies individual markets and prices. Macroeconomics studies economy-wide phenomena: unemployment, inflation, and GDP growth.",
  },
  {
    q: "GDP measures the value of:",
    options: [
      "A) All goods produced in the world in a given year",
      "B) All financial assets traded in a country",
      "C) All final goods and services produced within a country in a year",
      "D) Only goods produced by domestic companies",
    ],
    correct: 2,
    exp: "GDP measures the value of all final goods and services produced within a country's borders in a given year — including by foreign-owned firms operating domestically.",
  },
  {
    q: "Why do macroeconomists focus on 'final' goods and services rather than all goods?",
    options: [
      "A) Final goods are easier to count than intermediate goods",
      "B) To avoid double-counting intermediate inputs already embedded in final prices",
      "C) Final goods are more valuable than intermediate goods",
      "D) Intermediate goods are not produced in the United States",
    ],
    correct: 1,
    exp: "If we counted steel AND the car made from it, we'd count the steel twice. Counting only the final car avoids double-counting intermediate inputs.",
  },
];

function MacroWhyStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = MACRO_QUESTIONS[idx];
  const isLast = idx === MACRO_QUESTIONS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = sel === q.correct ? score + 1 : score;
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() {
    setIdx(i => i + 1);
    setSel(null);
    setChecked(false);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — Why Macroeconomics Matters</p>
        <p className="text-muted-foreground text-xs">Macroeconomics studies the economy as a whole — GDP, unemployment, inflation, and growth. Answer each question to complete this station.</p>
      </div>
      <SteppedQuiz
        q={q} idx={idx} total={MACRO_QUESTIONS.length}
        sel={sel} setSel={setSel} checked={checked}
        onCheck={handleCheck} onNext={handleNext}
        isLast={isLast} score={score} onComplete={onComplete}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — What Counts in GDP? Classifier
// ─────────────────────────────────────────────
const GDP_ITEMS = [
  { id: 1, text: "A new Toyota Camry sold at a dealership", counts: true, reason: "Final good sold new — counts in GDP this year." },
  { id: 2, text: "A used car purchased from a private seller", counts: false, reason: "Used goods are not new production — they were counted when first produced." },
  { id: 3, text: "Shares of Apple stock purchased on the NYSE", counts: false, reason: "Financial assets are not goods or services — they are ownership transfers, not production." },
  { id: 4, text: "A teacher's salary paid by the public school district", counts: true, reason: "Government purchases of services (education) count in GDP under G." },
  { id: 5, text: "Marijuana sold illegally on the street", counts: false, reason: "Illegal goods are not reported and not officially measured in GDP." },
  { id: 6, text: "Unpaid childcare by a stay-at-home parent", counts: false, reason: "Non-market production (no transaction) is not counted in GDP." },
  { id: 7, text: "Boeing delivers a new airplane to United Airlines", counts: true, reason: "New capital equipment (business investment) counts in GDP under I." },
  { id: 8, text: "Steel sold to an auto manufacturer to build cars", counts: false, reason: "Intermediate goods are not counted separately — their value is embedded in the final car." },
  { id: 9, text: "A new home built and sold to a family", counts: true, reason: "New residential construction counts as investment (I) in GDP." },
  { id: 10, text: "Social Security payments to retirees", counts: false, reason: "Transfer payments redistribute existing income — no new good or service is produced." },
];

function GDPClassifyStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = GDP_ITEMS.every(item => answers[item.id] !== undefined && answers[item.id] !== null);
  const correctCount = checked ? GDP_ITEMS.filter(item => answers[item.id] === item.counts).length : 0;

  function setAnswer(id: number, val: boolean) {
    setAnswers(a => ({ ...a, [id]: val }));
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — What Counts in GDP?</p>
        <p className="text-muted-foreground text-xs mb-2">For each item below, decide: does it count in this year's GDP? Remember: GDP counts only final goods and services produced this year within the country.</p>
        <div className="flex gap-3 text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800">✓ Counts in GDP</span>
          <span className="px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-800">✗ Does NOT Count</span>
        </div>
      </div>
      <div className="space-y-2">
        {GDP_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.counts;
          const isWrong = checked && ans !== undefined && ans !== item.counts;
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{item.text}</p>
              {!checked ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswer(item.id, true)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === true ? "border-green-500 bg-green-100 text-green-800" : "border-border bg-background text-foreground hover:border-green-400"}`}>
                    ✓ Counts
                  </button>
                  <button
                    onClick={() => setAnswer(item.id, false)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === false ? "border-red-500 bg-red-100 text-red-800" : "border-border bg-background text-foreground hover:border-red-400"}`}>
                    ✗ Does Not Count
                  </button>
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{item.reason}
                </p>
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {GDP_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, GDP_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — C + I + G + NX Component Sorter
// ─────────────────────────────────────────────
const COMPONENT_SCENARIOS = [
  { id: 1, text: "A family buys groceries at Walmart", component: "C", label: "Consumption (C)" },
  { id: 2, text: "Ford builds a new assembly plant in Michigan", component: "I", label: "Investment (I)" },
  { id: 3, text: "The federal government buys fighter jets for the Air Force", component: "G", label: "Government (G)" },
  { id: 4, text: "Germany buys American-made Boeing airplanes", component: "NX", label: "Net Exports (NX)" },
  { id: 5, text: "A college student pays tuition to a state university", component: "G", label: "Government (G)" },
  { id: 6, text: "A restaurant owner purchases new kitchen equipment", component: "I", label: "Investment (I)" },
  { id: 7, text: "A family buys a brand-new home from a contractor", component: "I", label: "Investment (I)" },
  { id: 8, text: "An American tourist purchases a flight on Air France from Paris to New York", component: "NX", label: "Net Exports (NX)" },
];

const COMPONENTS = [
  { id: "C", label: "Consumption (C)", color: "bg-blue-100 border-blue-300 text-blue-800", desc: "Households buying goods & services" },
  { id: "I", label: "Investment (I)", color: "bg-green-100 border-green-300 text-green-800", desc: "Business capital & new housing" },
  { id: "G", label: "Government (G)", color: "bg-purple-100 border-purple-300 text-purple-800", desc: "All levels of govt spending" },
  { id: "NX", label: "Net Exports (NX)", color: "bg-amber-100 border-amber-300 text-amber-800", desc: "Exports minus imports" },
];

function ComponentsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = COMPONENT_SCENARIOS.every(s => answers[s.id]);
  const correctCount = checked ? COMPONENT_SCENARIOS.filter(s => answers[s.id] === s.component).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — GDP = C + I + G + NX</p>
        <p className="text-muted-foreground text-xs mb-2">Sort each spending scenario into the correct GDP component. Reminder: Investment (I) means new capital — not financial investments!</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {COMPONENTS.map(c => (
            <span key={c.id} className={`px-2 py-1 rounded-lg border font-semibold ${c.color}`}>{c.label}</span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {COMPONENT_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.component;
          const isWrong = checked && ans && ans !== s.component;
          const compObj = COMPONENTS.find(c => c.id === s.component);
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 text-sm transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="font-medium text-foreground mb-2">{s.text}</p>
              <select
                disabled={checked}
                value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [s.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">— select component —</option>
                {COMPONENTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${s.label}` : `✗ Answer: ${compObj?.label}`}
                </p>
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {COMPONENT_SCENARIOS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, COMPONENT_SCENARIOS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Nominal vs. Real Stepped Calculation
// ─────────────────────────────────────────────
const DEFLATOR_STEPS = [
  {
    step: 1,
    title: "The Problem with Nominal GDP",
    content: "Suppose an economy produces only pizza. In Year 1, it makes 100 pizzas at $10 each: GDP = $1,000. In Year 2, it makes 100 pizzas at $15 each: GDP = $1,500. Did the economy grow? Nominal GDP says yes — but we made the same number of pizzas! The price increase fooled us.",
    question: "What does nominal GDP measure?",
    options: [
      "A) Output valued at current-year prices",
      "B) Output valued at base-year prices",
      "C) Only the physical quantity of output",
      "D) Output adjusted for population growth",
    ],
    correct: 0,
    exp: "Nominal GDP uses current-year prices, so inflation can make GDP look bigger even when real output hasn't changed.",
  },
  {
    step: 2,
    title: "The GDP Deflator Formula",
    content: "To strip out price increases, we use the GDP Deflator:\n\nReal GDP = (Nominal GDP / GDP Deflator) × 100\n\nThe GDP Deflator is a price index with a base year = 100. If prices rose 50%, the deflator = 150.",
    question: "The GDP deflator in Year 2 is 150 (base year = 100). Nominal GDP in Year 2 = $1,500. What is Real GDP in Year 2?",
    options: [
      "A) $2,250",
      "B) $1,500",
      "C) $1,000",
      "D) $750",
    ],
    correct: 2,
    exp: "Real GDP = ($1,500 / 150) × 100 = $1,000. The same as Year 1 — confirming no real growth occurred, only price inflation.",
  },
  {
    step: 3,
    title: "Interpreting the Result",
    content: "Real GDP = $1,000 in both years. That tells us the economy produced the same quantity of goods — 100 pizzas. The jump in nominal GDP was entirely due to price increases (inflation), not actual growth in output.",
    question: "Which best describes the difference between nominal and real GDP growth in our pizza example?",
    options: [
      "A) Both nominal and real GDP grew by 50%",
      "B) Nominal GDP grew 50% but real GDP grew 0% — inflation accounted for all the nominal gain",
      "C) Real GDP grew 50% while nominal GDP stayed constant",
      "D) The deflator makes no difference when the base year equals the current year",
    ],
    correct: 1,
    exp: "Nominal GDP grew from $1,000 to $1,500 (+50%), but real GDP stayed at $1,000 — all nominal growth was price inflation, no real output growth.",
  },
];

function RealVNomStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const step = DEFLATOR_STEPS[stepIdx];
  const isLast = stepIdx === DEFLATOR_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = sel === step.correct ? score + 1 : score;
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() {
    setStepIdx(i => i + 1);
    setSel(null);
    setChecked(false);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 4 — Nominal vs. Real GDP</p>
        <p className="text-muted-foreground text-xs">Walk through the deflator calculation step-by-step. Each step builds on the last.</p>
        <div className="flex gap-1 mt-2">
          {DEFLATOR_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-primary/20"}`} />
          ))}
        </div>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {step.step} of {DEFLATOR_STEPS.length} — {step.title}</p>
        <div className="bg-muted/60 rounded-lg p-3 text-xs text-foreground leading-relaxed whitespace-pre-line">{step.content}</div>
        <p className="text-sm font-semibold text-foreground">{step.question}</p>
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
              }`}>
              {opt}
            </button>
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
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Step →
          </button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score, DEFLATOR_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Business Cycle Phase Classifier
// ─────────────────────────────────────────────
const CYCLE_PHASES = [
  { id: "expansion", label: "Expansion", color: "bg-green-100 border-green-300 text-green-800", desc: "GDP rising, unemployment falling" },
  { id: "peak", label: "Peak", color: "bg-blue-100 border-blue-300 text-blue-800", desc: "GDP at highest point, turning point" },
  { id: "recession", label: "Recession", color: "bg-red-100 border-red-300 text-red-800", desc: "GDP declining (2+ quarters)" },
  { id: "trough", label: "Trough", color: "bg-amber-100 border-amber-300 text-amber-800", desc: "GDP at lowest point, turning point" },
];

const CYCLE_SCENARIOS = [
  { id: 1, text: "Real GDP has been falling for eight months. Unemployment is at 9% and still rising. Businesses are cutting hours and laying off workers.", phase: "recession", extra: "Unemployment: Rising | Prices: Falling or stagnant" },
  { id: 2, text: "Real GDP has grown steadily for two years. Employment is near historic lows. Consumer spending and business investment are both strong.", phase: "expansion", extra: "Unemployment: Falling | Prices: Rising moderately" },
  { id: 3, text: "GDP growth has just turned negative after a long boom. Unemployment has started ticking up from its low. Economists note it's the turning point from growth to contraction.", phase: "peak", extra: "Unemployment: Starting to rise | Prices: High" },
  { id: 4, text: "GDP has stopped declining. Unemployment is at its highest point of the cycle but has stopped rising. Output is at its lowest, and recovery appears to be starting.", phase: "trough", extra: "Unemployment: Highest point | Prices: Low" },
  { id: 5, text: "A severe recession has lasted 18 months. Real GDP fell 10% — the NBER calls it a depression. Unemployment exceeded 10%.", phase: "recession", extra: "Unemployment: Very high | Prices: Deflation possible" },
  { id: 6, text: "The economy has been recovering for one year. Jobs are returning, consumer confidence is rising, and GDP is growing again — though not yet at its previous peak.", phase: "expansion", extra: "Unemployment: Falling | Prices: Beginning to rise" },
];

function CyclePhaseStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = CYCLE_SCENARIOS.every(s => answers[s.id]);
  const correctCount = checked ? CYCLE_SCENARIOS.filter(s => answers[s.id] === s.phase).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Business Cycle Phases</p>
        <p className="text-muted-foreground text-xs mb-2">Read each economic scenario and classify it as one of the four business cycle phases. Think about what is happening to GDP AND unemployment.</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {CYCLE_PHASES.map(p => (
            <span key={p.id} className={`px-2 py-1 rounded-lg border font-medium ${p.color}`}>{p.label} — {p.desc}</span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {CYCLE_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.phase;
          const isWrong = checked && ans && ans !== s.phase;
          const correctPhase = CYCLE_PHASES.find(p => p.id === s.phase);
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 text-sm transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="font-medium text-foreground mb-1">{s.text}</p>
              {checked && <p className="text-xs text-muted-foreground mb-2 italic">{s.extra}</p>}
              <select
                disabled={checked}
                value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [s.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">— select phase —</option>
                {CYCLE_PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${correctPhase?.label}` : `✗ Answer: ${correctPhase?.label}`}
                </p>
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {CYCLE_SCENARIOS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, CYCLE_SCENARIOS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Comparing GDP Among Countries (MC)
// ─────────────────────────────────────────────
const COMPARE_QUESTIONS = [
  {
    q: "China has a larger total GDP than Switzerland, yet Switzerland has a much higher standard of living. The best explanation is:",
    options: [
      "A) China uses a different currency than Switzerland",
      "B) Switzerland's GDP is measured in real terms while China's is nominal",
      "C) Switzerland has a much smaller population, so GDP per capita is higher",
      "D) China includes government spending in GDP while Switzerland does not",
    ],
    correct: 2,
    exp: "GDP per capita (GDP ÷ population) is a much better indicator of living standards than total GDP. Switzerland's small population means its high total GDP is spread over fewer people.",
  },
  {
    q: "Purchasing Power Parity (PPP) adjustments are used when comparing GDP across countries because:",
    options: [
      "A) Exchange rates fluctuate daily and can distort comparisons",
      "B) Prices for the same goods vary across countries, so a dollar buys different amounts",
      "C) PPP converts nominal GDP to real GDP within one country",
      "D) Some countries do not report GDP in U.S. dollars",
    ],
    correct: 1,
    exp: "PPP adjusts for price differences across countries. A haircut costs $5 in India but $25 in the U.S. — PPP ensures we compare actual purchasing power, not just currency amounts.",
  },
  {
    q: "Which of the following is a well-known limitation of GDP as a measure of well-being?",
    options: [
      "A) GDP counts both goods and services, making it too broad",
      "B) GDP is adjusted for inflation, which understates growth",
      "C) GDP ignores leisure time, environmental quality, and non-market production",
      "D) GDP is calculated annually, missing monthly changes in welfare",
    ],
    correct: 2,
    exp: "GDP misses important aspects of well-being: leisure, environmental health, unpaid household work, income inequality, and quality of life improvements from technology.",
  },
];

function CompareStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = COMPARE_QUESTIONS[idx];
  const isLast = idx === COMPARE_QUESTIONS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = sel === q.correct ? score + 1 : score;
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() {
    setIdx(i => i + 1);
    setSel(null);
    setChecked(false);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 6 — Comparing GDP Among Countries</p>
        <p className="text-muted-foreground text-xs">GDP per capita and PPP adjustments make international comparisons meaningful. Answer each question to complete.</p>
      </div>
      <SteppedQuiz
        q={q} idx={idx} total={COMPARE_QUESTIONS.length}
        sel={sel} setSel={setSel} checked={checked}
        onCheck={handleCheck} onNext={handleNext}
        isLast={isLast} score={score} onComplete={onComplete}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcard Station
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Gross Domestic Product (GDP)", back: "The value of all final goods and services produced within a country in a given year. Measured as: C + I + G + NX." },
  { front: "Final Good", back: "A good sold to the end user. Only final goods count in GDP — intermediate goods (inputs used to make final goods) are excluded to avoid double-counting." },
  { front: "Consumption (C)", back: "Household spending on goods and services — food, clothing, cars, medical care. The largest component of U.S. GDP (~70%)." },
  { front: "Investment (I)", back: "Business spending on new capital (equipment, structures), plus new residential construction. Note: financial investments (stocks/bonds) are NOT counted in GDP." },
  { front: "Government Purchases (G)", back: "Federal, state, and local government spending on goods and services. Does NOT include transfer payments (Social Security, welfare)." },
  { front: "Net Exports (NX)", back: "Exports minus Imports (NX = X - M). When the U.S. exports more than it imports, NX is positive (trade surplus). Currently negative for the U.S. (trade deficit)." },
  { front: "Nominal GDP", back: "GDP measured at current-year prices. Can increase just because prices rose, even if actual output didn't change." },
  { front: "Real GDP", back: "GDP adjusted for inflation. Real GDP = (Nominal GDP / GDP Deflator) × 100. Real GDP tracks actual changes in output, not price changes." },
  { front: "GDP Deflator", back: "A price index that measures the overall level of prices in the economy. Base year = 100. Used to convert nominal GDP to real GDP." },
  { front: "Business Cycle", back: "The recurring pattern of expansion, peak, recession, and trough in real GDP over time. Every economy experiences business cycles." },
  { front: "Recession", back: "A significant decline in real GDP lasting at least two consecutive quarters. Officially declared by the NBER. Associated with rising unemployment." },
  { front: "Depression", back: "A very severe and prolonged recession. The Great Depression (1929–1933) saw U.S. GDP fall ~30% and unemployment reach ~25%." },
  { front: "GDP per Capita", back: "GDP divided by population. A much better measure of living standards than total GDP — accounts for the size of the population sharing that output." },
  { front: "Purchasing Power Parity (PPP)", back: "An exchange rate adjustment that equalizes the purchasing power of different currencies by accounting for price differences across countries." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [cards] = useState(() => shuffle(FLASHCARDS));
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 6 Key Terms</p>
        <p className="text-muted-foreground text-xs">Review all {cards.length} terms. Click each card to reveal the definition. You must view all cards before the Quiz unlocks.</p>
        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((seen.size) / cards.length) * 100}%` }} />
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
// Quiz
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "Which of the following would NOT be counted in GDP?", options: ["A) A new laptop sold at Best Buy", "B) A doctor's office visit paid by insurance", "C) A used Toyota purchased from a private seller", "D) New commercial real estate construction"], correct: 2, exp: "Used goods were already counted in GDP when first produced. Resales do not represent new production." },
  { q: "The expenditure approach to GDP is expressed as:", options: ["A) GDP = C + S + T + NX", "B) GDP = C + I + G + NX", "C) GDP = Wages + Profits + Rent + Interest", "D) GDP = Final goods – Intermediate goods"], correct: 1, exp: "The expenditure approach sums all spending: Consumption + Investment + Government + Net Exports." },
  { q: "Business investment (I) in GDP includes:", options: ["A) Purchasing shares of Tesla on the stock market", "B) A household buying a new refrigerator", "C) A firm building a new factory", "D) The government buying fighter jets"], correct: 2, exp: "Investment (I) means new capital goods — factories, equipment, and new housing. Stock purchases are financial transactions, not production." },
  { q: "If nominal GDP grew 6% but the GDP deflator rose 4%, then real GDP grew approximately:", options: ["A) 10%", "B) 6%", "C) 4%", "D) 2%"], correct: 3, exp: "Real growth ≈ Nominal growth − Inflation: 6% − 4% = 2%. The deflator strips out the price-level increase." },
  { q: "Which phase of the business cycle is characterized by two or more consecutive quarters of declining real GDP?", options: ["A) Peak", "B) Trough", "C) Recession", "D) Expansion"], correct: 2, exp: "A recession is defined as a significant decline in economic activity lasting more than a few months — often operationally defined as two consecutive quarters of negative real GDP growth." },
  { q: "The GDP deflator is used to:", options: ["A) Measure the size of the informal economy", "B) Convert nominal GDP into real GDP by adjusting for price changes", "C) Compare GDP across different countries", "D) Measure only consumer price changes"], correct: 1, exp: "The GDP deflator converts nominal GDP (at current prices) to real GDP (at base-year prices): Real GDP = (Nominal GDP / Deflator) × 100." },
  { q: "Country A has total GDP of $2 trillion and a population of 200 million. Country B has total GDP of $500 billion and a population of 10 million. Which country has a higher standard of living by GDP per capita?", options: ["A) Country A, because its total GDP is much larger", "B) Country B, because its GDP per capita ($50,000) exceeds Country A's ($10,000)", "C) They are equal since both use GDP", "D) Country A, because larger economies are always wealthier"], correct: 1, exp: "Country A: $2T / 200M = $10,000 per person. Country B: $500B / 10M = $50,000 per person. Per capita measures living standards far better than total GDP." },
  { q: "Transfer payments such as Social Security and unemployment insurance are:", options: ["A) Counted in GDP under government spending (G)", "B) Counted in GDP under consumption (C)", "C) Not counted in GDP because no new good or service is produced", "D) Counted in GDP as investment (I)"], correct: 2, exp: "Transfer payments redistribute existing income — they are not purchases of new goods or services, so they do not count in GDP." },
  { q: "Purchasing Power Parity (PPP) is most useful for:", options: ["A) Converting nominal GDP to real GDP within one country", "B) Measuring the business cycle phase of an economy", "C) Making meaningful comparisons of living standards across countries with different price levels", "D) Adjusting GDP for population differences"], correct: 2, exp: "PPP adjusts for the fact that prices differ across countries — a dollar buys more in Vietnam than in Switzerland. PPP makes cross-country welfare comparisons meaningful." },
  { q: "The 'peak' of a business cycle is:", options: ["A) The point at which unemployment is highest", "B) The turning point from expansion to recession — GDP is at its highest", "C) When the economy first begins recovering from a recession", "D) The point at which price inflation is zero"], correct: 1, exp: "The peak is the high point of the business cycle — the turning point where expansion ends and recession begins. GDP is at its cyclical maximum." },
  { q: "GDP counts only 'final' goods to avoid:", options: ["A) Measuring government spending twice", "B) Including goods that are exported", "C) Double-counting intermediate inputs already embedded in final prices", "D) Counting goods produced in prior years"], correct: 2, exp: "Steel used to make a car is an intermediate good. If we counted steel AND the car, we'd count steel twice. Counting only the final car prevents double-counting." },
  { q: "Which of the following is a known limitation of GDP as a measure of national well-being?", options: ["A) GDP only measures goods, not services", "B) GDP fails to account for leisure, environmental quality, and non-market production", "C) GDP cannot be measured in real terms", "D) GDP overstates inflation's impact on welfare"], correct: 1, exp: "GDP is a useful but incomplete welfare measure. It misses leisure, unpaid household work, environmental damage, income inequality, and quality-of-life improvements." },
  { q: "If nominal GDP is $15 trillion and the GDP deflator is 125, what is real GDP?", options: ["A) $18.75 trillion", "B) $15 trillion", "C) $12 trillion", "D) $11.25 trillion"], correct: 2, exp: "Real GDP = ($15T / 125) × 100 = $12 trillion. The deflator of 125 means prices are 25% higher than the base year, so we deflate nominal GDP to get real output." },
  { q: "Net exports (NX) are negative when:", options: ["A) The country exports more than it imports (trade surplus)", "B) The country imports more than it exports (trade deficit)", "C) Government spending exceeds tax revenue", "D) Investment exceeds saving"], correct: 1, exp: "NX = Exports − Imports. When imports exceed exports, NX is negative — this is a trade deficit and reduces GDP from the expenditure side." },
  { q: "During a trough in the business cycle:", options: ["A) GDP is at its highest point and unemployment is lowest", "B) GDP is declining and unemployment is rising rapidly", "C) GDP is at its lowest point and recovery is about to begin", "D) Inflation is at its highest level of the cycle"], correct: 2, exp: "The trough is the low point of the business cycle — GDP is at its cyclical minimum and unemployment at its peak. After the trough, the economy begins expanding again." },
];

function QuizStation({ onDone, onNotYet }: { onDone: (score: number, results: { correct: boolean; exp: string }[]) => void; onNotYet: () => void }) {
  const [questions] = useState(() => shuffle(ALL_QUESTIONS).slice(0, 10));
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; exp: string }[]>([]);
  const q = questions[idx];
  const isLast = idx === 9;

  function handleCheck() {
    if (sel === null) return;
    const newScore = sel === q.correct ? score + 1 : score;
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() {
    setResults(r => [...r, { correct: sel === q.correct, exp: q.exp }]);
    setIdx(i => i + 1);
    setSel(null);
    setChecked(false);
  }
  function handleFinish() {
    const finalResults = [...results, { correct: sel === q.correct, exp: q.exp }];
    const finalScore = sel === q.correct ? score + 1 : score;
    if (finalScore >= 9) { onDone(finalScore, finalResults); }
    else { onNotYet(); }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Chapter 6 Quiz — The Macroeconomic Perspective</p>
        <p className="text-muted-foreground text-xs">10 questions drawn from the full pool. You need 9/10 to complete the lab.</p>
        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(idx / 10) * 100}%` }} />
        </div>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of 10</p>
          {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
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
              }`}>{opt}</button>
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
// Summary Modal
// ─────────────────────────────────────────────
const CH6_SUMMARY = [
  { heading: "6.1 Measuring the Size of the Economy: Gross Domestic Product", body: "Economists generally express the size of a nation's economy as its gross domestic product (GDP), which measures the value of the output of all final goods and services produced within the country in a year. Economists measure GDP by taking the quantities of all goods and services produced, multiplying them by their prices, and summing the total. Since GDP measures what is bought and sold in the economy, we can measure it either by the sum of what is purchased in the economy or what is produced.\n\nWe can divide demand into consumption, investment, government, exports, and imports. We can divide what is produced in the economy into durable goods, nondurable goods, services, structures, and inventories. To avoid double counting, GDP counts only final output of goods and services, not the production of intermediate goods or the value of labor in the chain of production." },
  { heading: "6.2 Adjusting Nominal Values to Real Values", body: "The nominal value of an economic statistic is the commonly announced value. The real value is the value after adjusting for changes in inflation. To convert nominal economic data from several different years into real, inflation-adjusted data, the starting point is to choose a base year arbitrarily and then use a price index to convert the measurements so that economists measure them in the money prevailing in the base year." },
  { heading: "6.3 Tracking Real GDP over Time", body: "Over the long term, U.S. real GDP have increased dramatically. At the same time, GDP has not increased the same amount each year. The speeding up and slowing down of GDP growth represents the business cycle. When GDP declines significantly, a recession occurs. A longer and deeper decline is a depression. Recessions begin at the business cycle's peak and end at the trough." },
  { heading: "6.4 Comparing GDP among Countries", body: "Since we measure GDP in a country's currency, in order to compare different countries' GDPs, we need to convert them to a common currency. One way to do that is with the exchange rate, which is the price of one country's currency in terms of another. Once we express GDPs in a common currency, we can compare each country's GDP per capita by dividing GDP by population. Countries with large populations often have large GDPs, but GDP alone can be a misleading indicator of a nation's wealth. A better measure is GDP per capita." },
  { heading: "6.5 How Well GDP Measures the Well-Being of Society", body: "GDP is an indicator of a society's standard of living, but it is only a rough indicator. GDP does not directly take account of leisure, environmental quality, levels of health and education, activities conducted outside the market, changes in inequality of income, increases in variety, increases in technology, or the (positive or negative) value that society may place on certain types of output." },
];

function SummaryModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 6 Summary — The Macroeconomic Perspective</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH6_SUMMARY.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{s.heading}</p>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
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

const STATION_LABELS_CH6: Record<string, string> = {
  macrowhy:   "Why Macro Matters",
  gdpclassify:"What Counts in GDP?",
  components: "C+I+G+NX Sorter",
  realvnom:   "Nominal vs. Real GDP",
  cyclephase: "Business Cycle Phases",
  compare:    "Comparing Countries",
  flash:      "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH6).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r, i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch6 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 6 — The Macroeconomic Perspective</h2>
    <p style="font-size:0.9rem;color:#475569"><strong>Student:</strong> ${name || "—"} &nbsp;&nbsp; <strong>Date:</strong> ${now}</p>
    <div class="score-box"><p>Quiz Score: ${score}/10 — ${score >= 9 ? "PASSED ✓" : "Not Yet"}</p></div>
    ${stRows ? `<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stRows}</tbody></table>` : ""}
    <h3>Quiz Question Review</h3><table><thead><tr><th style="width:40px"></th><th>Question</th><th>Explanation</th></tr></thead><tbody>${qRows}</tbody></table>
    ${exitTicket ? `<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:12px"><strong style="font-size:0.75rem;text-transform:uppercase;color:#64748b">Exit Ticket</strong><p style="font-size:0.85rem;margin:6px 0 0">${exitTicket}</p></div>` : ""}
    <footer>Access for free at https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction</footer></body></html>`);
    setTimeout(() => w.print(), 600);
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-2xl p-5 text-center ${score >= 9 ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
        <p className="text-3xl font-bold">{score}/10</p>
        <p className={`text-lg font-semibold mt-1 ${score >= 9 ? "text-green-800" : "text-amber-800"}`}>{score >= 9 ? "Excellent — Chapter 6 Complete! ✓" : "Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 6 — The Macroeconomic Perspective</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div>
          <label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e => setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: Explain the difference between nominal and real GDP. Why does the distinction matter for measuring economic growth?</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e => setExitTicket(e.target.value)} rows={3} placeholder="Your response..." className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
        </div>
      </div>
      {stationRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Station Scores</p>
          <div className="space-y-2">
            {stationRows.map(r => (
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
      <button type="button" onClick={onRestart} className="w-full py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button>
      <button type="button" onClick={printPDF} disabled={!name.trim()} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stations Config
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "macrowhy" as Station,   icon: "🌍", label: "Why Macro Matters",    desc: "GDP, unemployment, inflation overview" },
  { id: "gdpclassify" as Station,icon: "✓✗", label: "What Counts in GDP?", desc: "Classify 10 items: counts or not?" },
  { id: "components" as Station, icon: "🧩", label: "C+I+G+NX Sorter",     desc: "Sort 8 spending scenarios" },
  { id: "realvnom" as Station,   icon: "📐", label: "Nominal vs. Real GDP", desc: "Stepped deflator calculation" },
  { id: "cyclephase" as Station, icon: "📈", label: "Business Cycle Phases",desc: "Classify 6 economic scenarios" },
  { id: "compare" as Station,    icon: "🌐", label: "Comparing Countries",  desc: "PPP and GDP per capita" },
  { id: "flash" as Station,      icon: "🃏", label: "Flashcard Review",     desc: "Review all 14 key terms" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "macrowhy",    label: "Macro Why" },
  { id: "gdpclassify", label: "GDP Counts?" },
  { id: "components",  label: "C+I+G+NX" },
  { id: "realvnom",    label: "Real vs Nom" },
  { id: "cyclephase",  label: "Cycle Phases" },
  { id: "compare",     label: "Compare" },
  { id: "flash",       label: "Flashcards" },
  { id: "quiz",        label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","macrowhy","gdpclassify","components","realvnom","cyclephase","compare","flash","quiz","results","not-yet"];

function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapter 6 — The Macroeconomic Perspective</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progress / STATIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}/{STATIONS.length} stations complete</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted border border-border">
        <div className="flex items-center gap-2"><span className="text-base">📄</span><span className="text-sm text-foreground">Need a refresher? View the chapter summary.</span></div>
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
        <a href={hubUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">← Course Hub</a>
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {NAV_STATIONS.map(s => {
            const done = completed.has(s.id);
            const active = s.id === station || (station === "not-yet" && s.id === "quiz") || (station === "results" && s.id === "quiz");
            if (s.id === "quiz" && !allStationsDone) return <span key={s.id} title="Complete all stations first" className="px-3 py-1.5 rounded-full text-xs font-medium text-sidebar-foreground/35 cursor-not-allowed select-none">🔒 Quiz</span>;
            return (
              <button key={s.id} onClick={() => onNav(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary text-primary-foreground" : done ? "bg-sidebar-accent text-sidebar-foreground/90" : "text-sidebar-foreground/75 hover:text-white"}`}>
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
export default function EconLab({ courseTitle, courseSubtitle, hubUrl }: { courseTitle: string; courseSubtitle: string; hubUrl: string }) {
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
    if (score !== undefined && total !== undefined) setSectionScores(prev => ({ ...prev, [s]: { score, total } }));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
    setStation("intro");
  }

  const quizUnlocked = STATIONS.every(s => completed.has(s.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
      <Header station={station} completed={completed} onNav={setStation} courseTitle={courseTitle} courseSubtitle={courseSubtitle} hubUrl={hubUrl} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {station === "intro"       && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "macrowhy"    && <MacroWhyStation   onComplete={(sc, t) => markDone("macrowhy",    sc, t)} />}
        {station === "gdpclassify" && <GDPClassifyStation onComplete={(sc, t) => markDone("gdpclassify", sc, t)} />}
        {station === "components"  && <ComponentsStation  onComplete={(sc, t) => markDone("components",  sc, t)} />}
        {station === "realvnom"    && <RealVNomStation    onComplete={(sc, t) => markDone("realvnom",    sc, t)} />}
        {station === "cyclephase"  && <CyclePhaseStation  onComplete={(sc, t) => markDone("cyclephase",  sc, t)} />}
        {station === "compare"     && <CompareStation     onComplete={(sc, t) => markDone("compare",     sc, t)} />}
        {station === "flash"       && <FlashcardStation   onComplete={(sc, t) => markDone("flash",       sc, t)} />}
        {station === "quiz"        && (
          <QuizStation
            onDone={(score, results) => { setQuizScore(score); setQuizResults(results); markDone("quiz"); setStation("results"); }}
            onNotYet={() => setStation("not-yet")}
          />
        )}
        {station === "results" && (
          <ResultsScreen score={quizScore} results={quizResults} sectionScores={sectionScores} onRestart={() => { setStation("intro"); }} courseTitle={courseTitle} />
        )}
        {station === "not-yet" && <NotYetScreen onRetry={() => setStation("quiz")} />}
      </main>
    </div>
  );
}
