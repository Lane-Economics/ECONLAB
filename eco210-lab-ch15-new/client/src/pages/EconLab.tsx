import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "fedroles"
  | "thermosort"
  | "toolsera"
  | "transmit"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch15";

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
// Station 1 — Fed Roles Classifier
// ─────────────────────────────────────────────
const FED_ITEMS = [
  { id: 1, text: "The Fed cuts the federal funds rate target to stimulate borrowing and spending during a slowdown.", role: "monetary", label: "Conduct Monetary Policy" },
  { id: 2, text: "After SVB's collapse in 2023, the Fed provided emergency lending to prevent a cascade of bank failures.", role: "lender", label: "Lender of Last Resort" },
  { id: 3, text: "The Fed examines First National Bank's loan portfolio and assigns it a CAMELS rating of 3.", role: "supervision", label: "Bank Supervision & Consumer Protection" },
  { id: 4, text: "The Federal Reserve Bank of New York processes $2 trillion in interbank payments daily.", role: "payments", label: "Payment Systems & Currency" },
  { id: 5, text: "The U.S. Treasury deposits tax revenues into its account at the Federal Reserve.", role: "bankgov", label: "Bank for the Government" },
  { id: 6, text: "The Fed monitors leverage ratios across large financial institutions to prevent systemic risk.", role: "stability", label: "Financial Stability" },
];

const FED_ROLES = [
  { id: "monetary",   label: "Conduct Monetary Policy",          color: "bg-blue-100 border-blue-300 text-blue-800" },
  { id: "lender",     label: "Lender of Last Resort",            color: "bg-red-100 border-red-300 text-red-800" },
  { id: "supervision",label: "Bank Supervision & Consumer Protection", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { id: "payments",   label: "Payment Systems & Currency",       color: "bg-amber-100 border-amber-300 text-amber-800" },
  { id: "bankgov",    label: "Bank for the Government",          color: "bg-green-100 border-green-300 text-green-800" },
  { id: "stability",  label: "Financial Stability",              color: "bg-teal-100 border-teal-300 text-teal-800" },
];

function FedRolesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = FED_ITEMS.every(item => answers[item.id]);
  const correctCount = checked ? FED_ITEMS.filter(item => answers[item.id] === item.role).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — The Federal Reserve's Six Roles</p>
        <p className="text-muted-foreground text-xs mb-2">The Fed was founded in 1913 after the Panic of 1907. It performs six distinct roles. Match each action to the correct role.</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {FED_ROLES.map(r => (
            <span key={r.id} className={`px-2 py-0.5 rounded-lg border font-medium truncate ${r.color}`}>{r.label}</span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {FED_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.role;
          const isWrong = checked && ans && ans !== item.role;
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 text-sm transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="font-medium text-foreground mb-2">{item.text}</p>
              <select
                disabled={checked}
                value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [item.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">— select Fed role —</option>
                {FED_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${item.label}` : `✗ Answer: ${item.label}`}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {FED_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, FED_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Thermostat Sorter: Expansionary vs Contractionary
// ─────────────────────────────────────────────
const THERMO_ACTIONS = [
  { id: 1, text: "The FOMC votes to raise IORB from 5.25% to 5.50%.", policy: "contractionary", reason: "Raising IORB raises borrowing costs — it cools the economy to fight inflation." },
  { id: 2, text: "The Fed buys $80 billion in Treasury bonds on the open market.", policy: "expansionary", reason: "Buying bonds injects reserves, lowers rates, and stimulates borrowing and spending." },
  { id: 3, text: "The Fed lowers the ON RRP rate to reduce the floor on short-term rates.", policy: "expansionary", reason: "Lowering the ON RRP floor allows market rates to fall — an expansionary move." },
  { id: 4, text: "The FOMC begins Quantitative Tightening — reducing its balance sheet by $60B/month.", policy: "contractionary", reason: "QT withdraws reserves from the banking system, raising rates and cooling demand." },
  { id: 5, text: "In March 2020, the FOMC cut the federal funds rate target to 0–0.25%.", policy: "expansionary", reason: "An emergency rate cut to near-zero is maximum monetary stimulus — highly expansionary." },
  { id: 6, text: "The Fed sells Treasury securities to drain excess reserves from the banking system.", policy: "contractionary", reason: "Selling securities in OMO drains reserves, pushes rates up — contractionary policy." },
];

function ThermoSortStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = THERMO_ACTIONS.every(a => answers[a.id]);
  const correctCount = checked ? THERMO_ACTIONS.filter(a => answers[a.id] === a.policy).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — The Monetary Policy Thermostat</p>
        <p className="text-muted-foreground text-xs mb-2">The Fed acts like a thermostat — it turns up the heat (expansionary) during recessions or turns on the AC (contractionary) to fight inflation. Classify each action.</p>
        <div className="flex gap-3 text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800">↑ Expansionary (stimulus)</span>
          <span className="px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-800">↓ Contractionary (cooling)</span>
        </div>
      </div>
      <div className="space-y-2">
        {THERMO_ACTIONS.map(action => {
          const ans = answers[action.id];
          const isCorrect = checked && ans === action.policy;
          const isWrong = checked && ans && ans !== action.policy;
          return (
            <div key={action.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{action.text}</p>
              {!checked ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswers(a => ({ ...a, [action.id]: "expansionary" }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === "expansionary" ? "border-green-500 bg-green-100 text-green-800" : "border-border bg-background text-foreground hover:border-green-400"}`}>
                    ↑ Expansionary
                  </button>
                  <button
                    onClick={() => setAnswers(a => ({ ...a, [action.id]: "contractionary" }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === "contractionary" ? "border-red-500 bg-red-100 text-red-800" : "border-border bg-background text-foreground hover:border-red-400"}`}>
                    ↓ Contractionary
                  </button>
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{action.reason}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {THERMO_ACTIONS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, THERMO_ACTIONS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Tools Era Classifier: Pre-2008 vs Post-2008
// ─────────────────────────────────────────────
const TOOLS_ITEMS = [
  { id: 1, text: "Open Market Operations (OMO): buying/selling Treasuries to push the federal funds rate to target.", era: "pre", label: "Pre-2008 Framework" },
  { id: 2, text: "Interest on Reserve Balances (IORB): the rate banks earn on reserves held at the Fed — the primary modern rate tool.", era: "post", label: "Post-2008 Framework" },
  { id: 3, text: "The Fed adjusts reserve requirements to limit or expand bank lending capacity.", era: "pre", label: "Pre-2008 Framework" },
  { id: 4, text: "Overnight Reverse Repo (ON RRP): the Fed's rate floor for non-banks like money market funds.", era: "post", label: "Post-2008 Framework" },
  { id: 5, text: "Discount rate: a signaling tool; the rate the Fed charges banks to borrow at the discount window.", era: "pre", label: "Pre-2008 Framework" },
  { id: 6, text: "Quantitative Easing (QE): large-scale asset purchases of MBS and Treasuries to push long-term rates down.", era: "post", label: "Post-2008 Framework" },
];

function ToolsEraStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = TOOLS_ITEMS.every(item => answers[item.id]);
  const correctCount = checked ? TOOLS_ITEMS.filter(item => answers[item.id] === item.era).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — Tools by Era: Limited vs. Ample Reserves</p>
        <p className="text-muted-foreground text-xs mb-2">The 2008 financial crisis changed how the Fed implements policy. Before 2008, reserves were scarce — small OMO purchases moved rates. After 2008, $3.5T+ in excess reserves made traditional OMO ineffective. The Fed switched to a new toolkit.</p>
        <div className="flex gap-3 text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800">Pre-2008 (Limited Reserves)</span>
          <span className="px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-800">Post-2008 (Ample Reserves)</span>
        </div>
      </div>
      <div className="space-y-2">
        {TOOLS_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.era;
          const isWrong = checked && ans && ans !== item.era;
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{item.text}</p>
              {!checked ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswers(a => ({ ...a, [item.id]: "pre" }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === "pre" ? "border-slate-500 bg-slate-100 text-slate-800" : "border-border bg-background text-foreground hover:border-slate-400"}`}>
                    Pre-2008
                  </button>
                  <button
                    onClick={() => setAnswers(a => ({ ...a, [item.id]: "post" }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === "post" ? "border-teal-500 bg-teal-100 text-teal-800" : "border-border bg-background text-foreground hover:border-teal-400"}`}>
                    Post-2008
                  </button>
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${item.label}` : `✗ Answer: ${item.label}`}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {TOOLS_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, TOOLS_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Monetary Policy Transmission Chain (Stepped)
// ─────────────────────────────────────────────
const TRANSMIT_STEPS = [
  {
    step: 1,
    title: "The FOMC Decision",
    content: "Eight times a year, the FOMC meets and votes on its target for the federal funds rate (FFR). It expresses this as a target range (e.g., 5.25–5.50%). The FOMC doesn't directly set market rates — it sets the administered rates that pull market rates into alignment.",
    question: "How does the Fed influence the federal funds rate under the modern (post-2008) ample reserves framework?",
    options: [
      "A) It directly orders banks to charge a specific rate",
      "B) It sets IORB and ON RRP, which create a corridor that market rates stay within through arbitrage",
      "C) It prints money equal to the target rate",
      "D) It buys and sells small amounts of bonds to shift the FFR as in the pre-2008 era",
    ],
    correct: 1,
    exp: "Under ample reserves, the Fed sets IORB (ceiling — banks won't lend below it) and ON RRP (floor — non-banks won't lend below it). Arbitrage keeps the FFR pinned within this corridor.",
  },
  {
    step: 2,
    title: "Administered Rates Move Market Rates",
    content: "When IORB rises, banks have no incentive to lend at rates below IORB — they can earn more by parking reserves at the Fed risk-free. This pulls up the FFR. The FFR then cascades to all other short-term rates: Treasury bills, CD rates, commercial paper, and eventually longer-term rates.",
    question: "The Fed raises IORB from 5.00% to 5.25%. A bank currently lending overnight reserves at 5.10% will most likely:",
    options: [
      "A) Keep lending at 5.10% to maintain customer relationships",
      "B) Lower its lending rate to attract more borrowers",
      "C) Stop lending overnight at 5.10% — it now earns more by parking reserves at the Fed at 5.25%",
      "D) Reduce its reserve holdings to offset the rate change",
    ],
    correct: 2,
    exp: "This is arbitrage. Why lend at 5.10% when you can earn 5.25% risk-free from the Fed? Banks pull back from overnight lending, reducing supply and pushing market rates up to match IORB.",
  },
  {
    step: 3,
    title: "Market Rates Affect the Real Economy",
    content: "Higher short-term rates ripple through the financial system: mortgage rates rise, auto loan rates rise, corporate bond yields rise, and savings account APYs rise. These changes affect decisions:\n• Higher mortgage rates → fewer home purchases\n• Higher business borrowing costs → less investment\n• Higher savings returns → more saving, less spending\nThe result: lower aggregate demand.",
    question: "After the Fed raises its rate target, which of the following best describes the next link in the transmission chain?",
    options: [
      "A) The federal deficit automatically increases",
      "B) GDP immediately falls by the same percentage as the rate hike",
      "C) Borrowing costs for mortgages, auto loans, and corporate bonds rise, reducing investment and consumption",
      "D) The Fed buys bonds to offset the rate increase's contractionary effect",
    ],
    correct: 2,
    exp: "Higher administered rates raise market borrowing costs for households and businesses. This reduces investment (I) and consumption (C), leading to lower aggregate demand and eventually lower GDP growth and inflation.",
  },
  {
    step: 4,
    title: "Lags: Monetary Policy Is Slow",
    content: "The full economic effect of a rate change takes 12–18 months to work through the economy. This is why monetary policy pitfalls include 'long and variable lags' (Milton Friedman). The Fed had to raise rates aggressively in 2022–23 (from 0.25% to 5.25–5.50% in 16 months) to fight 9% inflation — the fastest hiking cycle since Volcker in the 1980s.",
    question: "A critic argues the Fed's 2022 rate hikes were too aggressive because the economy hadn't slowed yet. What does the concept of 'long and variable lags' suggest?",
    options: [
      "A) The Fed should wait to hike until inflation is completely gone before acting",
      "B) Rate hikes affect the economy immediately, so critics are wrong",
      "C) The Fed must act based on forecasts, not current data, because policy effects take 12–18 months to appear",
      "D) Monetary policy lags mean interest rate changes have no real economic effect",
    ],
    correct: 2,
    exp: "Long lags mean the Fed must act preemptively. If it waits for current data to show slowdown, its earlier hikes are already working — acting too late risks over-tightening. This is one of the hardest challenges in monetary policy.",
  },
];

function TransmitStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const step = TRANSMIT_STEPS[stepIdx];
  const isLast = stepIdx === TRANSMIT_STEPS.length - 1;

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
        <p className="font-semibold text-foreground mb-1">Station 4 — The Monetary Policy Transmission Chain</p>
        <p className="text-muted-foreground text-xs">Trace how an FOMC decision travels from administered rates → market rates → real economic activity. Each step builds on the last.</p>
        <div className="flex gap-1 mt-2">
          {TRANSMIT_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-primary/20"}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>FOMC</span><span>Rates</span><span>Economy</span><span>Lags</span>
        </div>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {step.step} of {TRANSMIT_STEPS.length} — {step.title}</p>
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
          <button onClick={() => onComplete(score, TRANSMIT_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Personal Finance Verdict Cards
// ─────────────────────────────────────────────
const PF_CARDS = [
  {
    id: "fomc",
    icon: "📅",
    title: "Watch the FOMC Calendar",
    verdict: "ACTION",
    verdictColor: "bg-blue-100 border-blue-400 text-blue-800",
    body: "The FOMC meets 8 times per year (roughly every 6–7 weeks). After each meeting, it releases a statement and — four times per year — the dot plot: each member's rate forecast. The dot plot is the best public signal of where rates are heading over the next 1–3 years.",
    takeaway: "If you have a variable-rate loan, a mortgage to refinance, or a CD to roll over — the FOMC calendar and dot plot are your roadmap. Check the next meeting date and the current dot plot before making any rate-sensitive financial decision.",
  },
  {
    id: "lockfloat",
    icon: "🔒",
    title: "Lock vs. Float Strategy",
    verdict: "STRATEGY",
    verdictColor: "bg-amber-100 border-amber-400 text-amber-800",
    body: "Rate cycle matters enormously for fixed vs. variable debt:\n• Hiking cycle (Fed raising rates): Lock in a fixed rate EARLY before rates rise further. Variable rates will cost you more each month as they track the FFR up.\n• Cutting cycle (Fed lowering rates): Consider a variable rate — your payments will fall as the FFR drops. Or wait to refinance your fixed mortgage at a lower rate.\nThe 2022–23 hiking cycle took rates from 0.25% to 5.50%. Borrowers who locked fixed in early 2022 saved significantly over those with floating rates.",
    takeaway: "Know where you are in the rate cycle. Early in a hiking cycle → lock fixed. Early in a cutting cycle → consider variable or plan to refinance.",
  },
  {
    id: "qeqt",
    icon: "📊",
    title: "QE, QT, and Asset Prices",
    verdict: "WATCH",
    verdictColor: "bg-purple-100 border-purple-400 text-purple-800",
    body: "Quantitative Easing (QE) = the Fed buys long-term Treasuries and mortgage-backed securities (MBS) → pushes long-term rates down → lowers 30-year mortgage rates → boosts home prices and equity valuations (stocks look more attractive when bonds yield less).\n\nQuantitative Tightening (QT) = the Fed shrinks its balance sheet → long-term rates rise → mortgage rates rise → headwind for housing and equities.\n\nFed balance sheet peaked at ~$9T in 2022. QT has been reducing it since. Watch the pace of QT — it affects your mortgage rate and your 401(k).",
    takeaway: "QE tailwind → asset prices rise. QT headwind → asset prices face pressure. The Fed's balance sheet decisions affect your mortgage rate, home value, and investment portfolio.",
  },
];

function PersonalFinanceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const allRevealed = PF_CARDS.every(c => revealed.has(c.id));

  function toggleCard(id: string) {
    setRevealed(r => new Set([...r, id]));
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Personal Finance: The Fed and Your Money</p>
        <p className="text-muted-foreground text-xs">The Fed's decisions affect your mortgage, car loan, savings rate, and investment portfolio. Read each card and explore the takeaway.</p>
      </div>
      <div className="space-y-3">
        {PF_CARDS.map(card => {
          const isOpen = expanded === card.id;
          const seen = revealed.has(card.id);
          return (
            <div key={card.id} className={`rounded-2xl border-2 transition overflow-hidden ${seen ? "border-primary/40 bg-card" : "border-border bg-card"}`}>
              <button
                onClick={() => toggleCard(card.id)}
                className="w-full flex items-center justify-between p-4 text-left gap-3 hover:bg-muted/40 transition">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mr-2 ${card.verdictColor}`}>{card.verdict}</span>
                    <span className="text-sm font-semibold text-foreground">{card.title}</span>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="bg-muted/50 rounded-xl p-3 text-xs text-foreground leading-relaxed whitespace-pre-line">{card.body}</div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Key Takeaway</p>
                    <p className="text-xs text-foreground">{card.takeaway}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button disabled={!allRevealed} onClick={() => onComplete(PF_CARDS.length, PF_CARDS.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allRevealed ? "Mark Complete ✓" : `Open all cards to continue (${revealed.size}/${PF_CARDS.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcard Station
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Federal Reserve System", back: "The central bank of the United States, established in 1913. Comprises the Board of Governors in Washington D.C. and 12 regional Federal Reserve Banks. Operationally independent from elected government." },
  { front: "Federal Open Market Committee (FOMC)", back: "The Fed's monetary policy body. 19 members (7 governors + 12 district presidents), 12 votes per meeting. Meets 8 times per year. Sets the target federal funds rate." },
  { front: "Federal Funds Rate (FFR)", back: "The interest rate at which banks lend reserves to each other overnight. The FOMC's primary target rate. Under the modern framework, it's pinned by IORB and ON RRP through arbitrage." },
  { front: "Dual Mandate", back: "Congress gave the Fed two goals in the Federal Reserve Reform Act of 1977: (1) price stability (2% PCE inflation target) and (2) maximum employment (roughly 3.5–4.5% unemployment)." },
  { front: "IORB — Interest on Reserve Balances", back: "The rate the Fed pays banks on all reserves held at the Fed. Primary policy tool post-2008. Acts as a ceiling — banks won't lend overnight at rates below what the Fed pays risk-free." },
  { front: "ON RRP — Overnight Reverse Repo Rate", back: "The rate the Fed pays non-bank institutions (money market funds, GSEs) to park cash overnight. Acts as a floor on short-term rates — non-banks won't lend below this rate." },
  { front: "Ample Reserves Framework (Post-2008)", back: "The Fed's current operating system. With $3.5T+ in excess reserves, OMO cannot move the FFR. Instead, IORB + ON RRP form a corridor that pins the FFR through arbitrage." },
  { front: "Quantitative Easing (QE)", back: "Large-scale Fed purchases of long-term Treasuries and mortgage-backed securities. Used post-2008 and in 2020 to push long-term rates down and stimulate the economy when short-term rates hit zero." },
  { front: "Quantitative Tightening (QT)", back: "The Fed shrinking its balance sheet by allowing bonds to mature without reinvestment (or outright selling). Reduces reserves, puts upward pressure on long-term rates. Contractionary." },
  { front: "Lender of Last Resort", back: "The Fed provides emergency liquidity to solvent banks facing short-term funding crises. Prevents bank runs from becoming systemic collapses. Provides liquidity, not solvency — it doesn't rescue insolvent institutions." },
  { front: "FDIC", back: "Federal Deposit Insurance Corporation. Insures bank deposits up to $250,000 per depositor per bank per ownership category. Established in 1933 after bank runs of the Great Depression." },
  { front: "CAMELS Rating", back: "A supervisory rating system (Capital, Assets, Management, Earnings, Liquidity, Sensitivity) assigned to banks by regulators. Ratings 1–5; 1 is best. A CAMELS 4 or 5 triggers enhanced regulatory scrutiny." },
  { front: "Expansionary Monetary Policy", back: "The Fed lowers rates and expands credit → stimulates borrowing, investment, and consumption → boosts aggregate demand → raises GDP and lowers unemployment. Used during recessions." },
  { front: "Contractionary Monetary Policy", back: "The Fed raises rates and tightens credit → reduces borrowing and spending → cools aggregate demand → lowers inflation. Used when inflation is above target. Risk: if overdone, can cause recession." },
  { front: "Monetary Policy Transmission Lag", back: "The full economic effect of a Fed rate change takes 12–18 months to work through the economy (Milton Friedman's 'long and variable lags'). This forces the Fed to act on forecasts, not current data." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 15 Key Terms</p>
        <p className="text-muted-foreground text-xs">Review all {cards.length} terms. Click each card to reveal the definition. You must view all cards before the Quiz unlocks.</p>
        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" role="progressbar" aria-valuenow={seen.size} aria-valuemin={0} aria-valuemax={cards.length} style={{ width: `${(seen.size / cards.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{seen.size}/{cards.length} cards reviewed</p>
      </div>
      <div onClick={handleFlip} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlip(); }}} role="button" tabIndex={0} aria-label={flipped ? "Card showing definition. Press to see term." : "Card showing term. Press to reveal definition."} className="cursor-pointer select-none bg-card border-2 border-border rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span aria-live="polite" aria-atomic="true" className="sr-only">{flipped ? cards[idx].back : cards[idx].front}</span>
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
  { q: "The Federal Reserve was established in 1913 primarily in response to:", options: ["A) World War I financing needs", "B) The Panic of 1907, which showed the U.S. needed a lender of last resort", "C) The Great Depression bank failures", "D) Excessive government deficit spending"], correct: 1, exp: "The Panic of 1907 nearly collapsed the financial system. J.P. Morgan personally had to bail out banks. Congress responded by creating the Federal Reserve in 1913 to provide a permanent lender of last resort." },
  { q: "The Fed's dual mandate — set by Congress in 1977 — requires the Fed to pursue:", options: ["A) Low interest rates and a strong dollar", "B) 2% inflation and a balanced federal budget", "C) Price stability (2% PCE inflation) and maximum employment", "D) Low unemployment and a positive trade balance"], correct: 2, exp: "The Federal Reserve Reform Act of 1977 gave the Fed two goals: price stability (operationalized as ~2% PCE inflation) and maximum employment (roughly 3.5–4.5% unemployment rate)." },
  { q: "Under the post-2008 ample reserves framework, the Fed's primary rate tool is:", options: ["A) Open Market Operations (OMO) — buying and selling small amounts of bonds", "B) Reserve requirements — changing how much banks must hold", "C) Interest on Reserve Balances (IORB) — the rate the Fed pays banks on reserves", "D) The discount rate — the rate charged to banks at the discount window"], correct: 2, exp: "With trillions in excess reserves, small OMO purchases can't move the FFR. Instead, IORB acts as a ceiling — banks won't lend overnight below what the Fed pays risk-free." },
  { q: "The ON RRP (Overnight Reverse Repo) rate functions as:", options: ["A) The Fed's main tool for setting long-term interest rates", "B) A floor on short-term rates for non-bank institutions like money market funds", "C) The rate the Fed charges banks to borrow at the discount window", "D) The reserve requirement for money market funds"], correct: 1, exp: "ON RRP lets non-banks (money market funds, GSEs) lend to the Fed overnight at this rate. Since they won't lend below it, ON RRP sets the floor of the FFR corridor." },
  { q: "Expansionary monetary policy is designed to:", options: ["A) Reduce the money supply and raise interest rates to fight inflation", "B) Increase the money supply, lower rates, and boost aggregate demand to counter recession", "C) Raise the federal funds rate to attract foreign investment", "D) Reduce government borrowing costs by buying Treasury bonds only"], correct: 1, exp: "Expansionary (loose) policy lowers rates and expands credit availability → encourages borrowing, investment, and consumption → raises aggregate demand → boosts GDP and reduces unemployment." },
  { q: "The FDIC insures bank deposits up to:", options: ["A) $100,000 per depositor per bank", "B) $500,000 per depositor per bank", "C) $250,000 per depositor per bank per ownership category", "D) The entire deposit regardless of amount"], correct: 2, exp: "FDIC deposit insurance covers $250,000 per depositor per bank per ownership category. Different account types (individual, joint, retirement) are insured separately." },
  { q: "Why did traditional Open Market Operations (OMO) become ineffective after 2008?", options: ["A) Congress banned the Fed from buying Treasury bonds", "B) Banks stopped participating in the federal funds market", "C) The federal funds rate hit zero and could not go lower", "D) With $3.5T+ in excess reserves, small bond purchases could not move the price of reserves"], correct: 3, exp: "Pre-2008, reserves were scarce — a small OMO purchase meaningfully changed the supply and moved the FFR. Post-2008, excess reserves were so abundant that small purchases had no effect on the rate." },
  { q: "Quantitative Easing (QE) differs from traditional monetary policy because:", options: ["A) QE raises short-term rates while OMO lowers them", "B) QE involves large-scale purchases of long-term bonds to reduce long-term rates, especially when short-term rates are already near zero", "C) QE is used only by the European Central Bank, not the Federal Reserve", "D) QE targets inflation directly while OMO targets unemployment"], correct: 1, exp: "QE was deployed when the FFR hit zero (zero lower bound) and normal rate cuts were exhausted. By buying long-term Treasuries and MBS, the Fed pushed long-term rates down to further stimulate the economy." },
  { q: "The SVB (Silicon Valley Bank) failure in March 2023 illustrated which Fed role?", options: ["A) Conducting monetary policy", "B) Operating payment systems and currency distribution", "C) Acting as lender of last resort to prevent contagion from a bank run", "D) Setting consumer protection standards for mortgage lending"], correct: 2, exp: "SVB experienced $42B in withdrawals in one day — a classic bank run. The Fed's lender of last resort function was activated to provide emergency liquidity and prevent the panic from spreading to other banks." },
  { q: "The 'long and variable lags' of monetary policy mean that:", options: ["A) The Fed should change rates every month to keep up with economic changes", "B) Rate changes affect prices immediately but employment with a delay", "C) The full economic effect of a rate change takes 12–18 months, forcing the Fed to act on forecasts", "D) Monetary policy lags are so long that the Fed prefers fiscal policy tools instead"], correct: 2, exp: "Milton Friedman identified that monetary policy affects the economy with lags of 12–18 months. The Fed must act based on forecasted conditions, not current data — making policy both an art and a science." },
  { q: "In a hiking cycle, the best personal finance strategy for a new fixed-rate mortgage is:", options: ["A) Wait for rates to peak before locking in", "B) Lock in a fixed rate early before rates rise further", "C) Choose a variable rate because it will track rates down", "D) Pay off the mortgage immediately to avoid rate risk"], correct: 1, exp: "In a hiking cycle (Fed raising rates), lock in fixed early — variable rates will rise with each Fed hike. Borrowers who locked fixed in early 2022 saved significantly vs. those with floating rates by mid-2023." },
  { q: "The CAMELS rating system is used by bank regulators to:", options: ["A) Determine how much FDIC insurance coverage a bank receives", "B) Set the discount rate for individual banks based on their risk", "C) Assess bank health across six dimensions: Capital, Assets, Management, Earnings, Liquidity, Sensitivity", "D) Calculate the reserve requirements each bank must maintain"], correct: 2, exp: "CAMELS is a supervisory rating (1–5, with 1 being best) that regulators assign during bank examinations. Banks rated 4 or 5 face enhanced scrutiny and possible corrective action requirements." },
  { q: "When the Fed raises IORB, the federal funds rate rises because:", options: ["A) The Fed legally requires banks to charge higher rates to businesses", "B) Banks arbitrage — they stop lending overnight at rates below IORB and earn the higher risk-free rate at the Fed instead", "C) The Treasury raises its own bond rates in response", "D) The discount window rate automatically follows IORB"], correct: 1, exp: "Arbitrage: if IORB is 5.25%, banks won't lend overnight reserves at 5.10% when they can earn more from the Fed with zero credit risk. This reduces overnight lending supply and pushes the FFR up toward IORB." },
  { q: "Contractionary monetary policy is appropriate when:", options: ["A) Unemployment is rising above the natural rate", "B) GDP growth has turned negative for two consecutive quarters", "C) Inflation is persistently above the 2% target and the economy is overheating", "D) The federal government is running a large deficit"], correct: 2, exp: "Contractionary (tight) policy — raising rates, reducing credit — is the cure for above-target inflation. It cools demand by raising borrowing costs, slowing spending and investment until inflation returns to target." },
  { q: "Quantitative Tightening (QT) affects financial markets by:", options: ["A) Lowering short-term interest rates to stimulate borrowing", "B) Reducing the Fed's balance sheet, which tends to put upward pressure on long-term rates and is a headwind for asset prices", "C) Increasing the money supply to offset inflation", "D) Buying mortgage-backed securities to support housing markets"], correct: 1, exp: "QT reverses QE — the Fed lets bonds mature without reinvestment, shrinking its balance sheet. Fewer Fed purchases mean less demand for Treasuries and MBS, pushing their yields up and creating headwinds for stocks and housing." },
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
        <p className="font-semibold text-foreground mb-1">Chapter 15 Quiz — Monetary Policy & Bank Regulation</p>
        <p className="text-muted-foreground text-xs">10 questions drawn from the full pool. You need 9/10 to complete the lab.</p>
        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" role="progressbar" aria-valuenow={idx} aria-valuemin={0} aria-valuemax={10} style={{ width: `${(idx / 10) * 100}%` }} />
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
              aria-pressed={sel === i}
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
const CH15_SUMMARY = [
  { heading: "15.1 The Federal Reserve Banking System and Central Bank Independence", body: "Every country's central bank has the primary task of conducting monetary policy through interest rates and credit conditions. Other prominent central banks include the European Central Bank, the Bank of Japan, and the Bank of England. All these central banks are semi-independent governmental institutions." },
  { heading: "15.2 Bank Regulation", body: "Banks are regulated to prevent bank runs. Deposit insurance, such as that provided by the FDIC, insures bank customers' deposits up to $250,000. Bank supervision involves inspections to ensure banks comply with laws and regulations. The main bank supervisors are the OCC (Office of the Comptroller of the Currency), the NCUA (National Credit Union Administration), the FDIC, and the Federal Reserve. The lender of last resort function provides liquidity, not solvency, to solvent banks facing short-term funding crises to prevent contagion." },
  { heading: "15.3 How a Central Bank Executes Monetary Policy", body: "A central bank has three traditional tools to implement monetary policy: open market operations, reserve requirements, and discount rates. The most important of these is open market operations. When the central bank injects money into the economy, it is conducting expansionary monetary policy. When the central bank reduces the money supply, it is conducting contractionary monetary policy. However, when the banking system holds large amounts of excess reserves, as it has since the 2008 recession, open market operations don't work well. The Fed's current approach uses the interest rate on reserves (IORB) as the primary policy tool." },
  { heading: "15.4 Monetary Policy and Economic Outcomes", body: "Expansionary monetary policy is a loosening of monetary policy to stimulate the economy by raising the quantity of money and credit and decreasing interest rates. Expansionary policy decreases interest rates, which increases aggregate demand for goods and services, raises GDP, and reduces unemployment. Contractionary monetary policy is a tightening of monetary policy that decreases the quantity of money and raises interest rates. It reduces aggregate demand, which reduces inflationary pressure. Quantitative easing (QE), where the central bank creates new bank reserves to purchase long-term securities, was used after the 2008–2009 recession to lower long-term rates." },
  { heading: "15.5 Pitfalls for Monetary Policy", body: "Monetary policy pitfalls include: (a) long and variable lags in policy effects — roughly 12–18 months; (b) banks can choose to hold excess reserves rather than lending them out; and (c) the velocity of money can shift unpredictably, undermining the quantity theory relationship MV = PQ. The ECB explicitly targets an inflation rate of 2% per year, while the U.S. Federal Reserve operates under a dual mandate — both price stability and maximum employment." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 15 Summary — Monetary Policy & Bank Regulation</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH15_SUMMARY.map((s, i) => (
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

const STATION_LABELS_CH15: Record<string, string> = {
  fedroles:       "Fed Roles Classifier",
  thermosort:     "Thermostat Sorter",
  toolsera:       "Tools by Era",
  transmit:       "Transmission Chain",
  personalfinance:"Personal Finance",
  flash:          "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH15).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r, i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch15 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 15 — Monetary Policy &amp; Bank Regulation</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score >= 9 ? "text-green-800" : "text-amber-800"}`}>{score >= 9 ? "Excellent — Chapter 15 Complete! ✓" : "Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 15 — Monetary Policy &amp; Bank Regulation</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div>
          <label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e => setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: Explain why the Fed switched from Open Market Operations to IORB as its primary rate-setting tool after 2008. What changed in the banking system?</label>
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
  { id: "fedroles" as Station,       icon: "🏛️", label: "Fed Roles Classifier",    desc: "Match 6 Fed actions to their role" },
  { id: "thermosort" as Station,     icon: "🌡️", label: "Thermostat Sorter",        desc: "Expansionary vs. contractionary" },
  { id: "toolsera" as Station,       icon: "🔧", label: "Tools by Era",             desc: "Pre-2008 vs. post-2008 toolkit" },
  { id: "transmit" as Station,       icon: "⛓️", label: "Transmission Chain",       desc: "FOMC → rates → economy (4 steps)" },
  { id: "personalfinance" as Station,icon: "💵", label: "Personal Finance",         desc: "FOMC, lock vs float, QE/QT" },
  { id: "flash" as Station,          icon: "🃏", label: "Flashcard Review",         desc: "Review all 15 key terms" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "fedroles",       label: "Fed Roles" },
  { id: "thermosort",     label: "Thermostat" },
  { id: "toolsera",       label: "Tools Era" },
  { id: "transmit",       label: "Transmit" },
  { id: "personalfinance",label: "Pers. Finance" },
  { id: "flash",          label: "Flashcards" },
  { id: "quiz",           label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","fedroles","thermosort","toolsera","transmit","personalfinance","flash","quiz","results","not-yet"];

function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapter 15 — Monetary Policy &amp; Bank Regulation</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={STATIONS.length} style={{ width: `${(progress / STATIONS.length) * 100}%` }} />
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
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold">Skip to main content</a>
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
        <a href={hubUrl} target="_top" className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">← Course Hub</a>
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
    </>
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
        {station === "intro"          && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "fedroles"       && <FedRolesStation       onComplete={(sc, t) => markDone("fedroles",       sc, t)} />}
        {station === "thermosort"     && <ThermoSortStation     onComplete={(sc, t) => markDone("thermosort",     sc, t)} />}
        {station === "toolsera"       && <ToolsEraStation       onComplete={(sc, t) => markDone("toolsera",       sc, t)} />}
        {station === "transmit"       && <TransmitStation       onComplete={(sc, t) => markDone("transmit",       sc, t)} />}
        {station === "personalfinance"&& <PersonalFinanceStation onComplete={(sc, t) => markDone("personalfinance",sc, t)} />}
        {station === "flash"          && <FlashcardStation      onComplete={(sc, t) => markDone("flash",          sc, t)} />}
        {station === "quiz"           && (
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
