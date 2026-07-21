import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "spendingclassify"
  | "taxsystems"
  | "fiscaltools"
  | "stabilizers"
  | "lagsverdicts"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch17";

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
// Station 1 — Spending Classifier: Mandatory / Discretionary / Supplemental
// ─────────────────────────────────────────────
const SPENDING_ITEMS = [
  { id: 1, text: "Social Security retirement benefit payments that automatically go out each month based on current law.", cat: "mandatory", label: "Mandatory" },
  { id: 2, text: "The annual Pentagon defense budget that Congress votes on each year.", cat: "discretionary", label: "Discretionary" },
  { id: 3, text: "The CARES Act of 2020 — $2.2 trillion in COVID-19 emergency relief passed outside the regular budget process.", cat: "supplemental", label: "Supplemental" },
  { id: 4, text: "Medicare and Medicaid healthcare payments governed by eligibility rules set in law.", cat: "mandatory", label: "Mandatory" },
  { id: 5, text: "Federal education grants that Congress appropriates each year.", cat: "discretionary", label: "Discretionary" },
  { id: 6, text: "Unemployment Insurance benefits that automatically expand as joblessness rises.", cat: "mandatory", label: "Mandatory" },
  { id: 7, text: "NASA science funding included in the annual congressional budget resolution.", cat: "discretionary", label: "Discretionary" },
  { id: 8, text: "The American Rescue Plan of 2021 — $1.9 trillion passed in response to the continued pandemic.", cat: "supplemental", label: "Supplemental" },
];

const SPEND_CATS = [
  { id: "mandatory",     label: "Mandatory",     color: "bg-teal-100 border-teal-300 text-teal-800",   desc: "Auto-pilot — set by law" },
  { id: "discretionary", label: "Discretionary", color: "bg-blue-100 border-blue-300 text-blue-800",   desc: "Annual congressional vote" },
  { id: "supplemental",  label: "Supplemental",  color: "bg-purple-100 border-purple-300 text-purple-800", desc: "Emergency add-on" },
];

function SpendingClassifyStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = SPENDING_ITEMS.every(i => answers[i.id]);
  const correctCount = checked ? SPENDING_ITEMS.filter(i => answers[i.id] === i.cat).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — Federal Spending: Mandatory, Discretionary, or Supplemental?</p>
        <p className="text-muted-foreground text-xs mb-2">~⅔ of the federal budget is mandatory (auto-pilot, set by law). ~⅓ is discretionary (Congress votes annually). Supplemental spending is emergency legislation passed outside the normal budget.</p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {SPEND_CATS.map(c => (
            <div key={c.id} className={`px-2 py-1 rounded-lg border font-semibold text-center ${c.color}`}>
              <div>{c.label}</div>
              <div className="font-normal text-xs opacity-80">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {SPENDING_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.cat;
          const isWrong = checked && ans && ans !== item.cat;
          const catObj = SPEND_CATS.find(c => c.id === item.cat);
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{item.text}</p>
              <select disabled={checked} value={ans || ""} onChange={e => setAnswers(a => ({ ...a, [item.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary">
                <option value="">— classify this spending —</option>
                {SPEND_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${catObj?.label}` : `✗ Answer: ${catObj?.label}`}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {SPENDING_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, SPENDING_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Tax Systems Classifier: Progressive / Proportional / Regressive
// ─────────────────────────────────────────────
const TAX_ITEMS = [
  { id: 1, text: "Federal income tax: earners pay 10% on the first bracket, 22% on the middle bracket, and up to 37% on the highest bracket.", type: "progressive", label: "Progressive" },
  { id: 2, text: "Medicare payroll tax: 2.9% of ALL wages with no income cap and no exemptions.", type: "proportional", label: "Proportional" },
  { id: 3, text: "Social Security payroll tax: 6.2% on earnings up to ~$168,600 (2024). Earnings above that cap pay zero.", type: "regressive", label: "Regressive" },
  { id: 4, text: "A flat sales tax of 7% applied equally to all purchases regardless of the buyer's income.", type: "regressive", label: "Regressive" },
  { id: 5, text: "A proposed flat income tax of 15% on all income levels — same rate for everyone from $20,000 to $2,000,000.", type: "proportional", label: "Proportional" },
  { id: 6, text: "A federal estate tax that applies only to estates above $13 million, with higher rates for larger estates.", type: "progressive", label: "Progressive" },
];

const TAX_TYPES = [
  { id: "progressive",  label: "Progressive",  color: "bg-teal-100 border-teal-300 text-teal-800",   desc: "Rate RISES with income" },
  { id: "proportional", label: "Proportional", color: "bg-blue-100 border-blue-300 text-blue-800",   desc: "Rate SAME at all levels" },
  { id: "regressive",   label: "Regressive",   color: "bg-amber-100 border-amber-300 text-amber-800", desc: "Rate FALLS as income rises" },
];

function TaxSystemsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = TAX_ITEMS.every(i => answers[i.id]);
  const correctCount = checked ? TAX_ITEMS.filter(i => answers[i.id] === i.type).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — Three Tax Systems</p>
        <p className="text-muted-foreground text-xs mb-2">Classify each tax as progressive, proportional, or regressive. The key is what happens to the effective tax rate as income rises.</p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {TAX_TYPES.map(t => (
            <div key={t.id} className={`px-2 py-1 rounded-lg border font-semibold text-center ${t.color}`}>
              <div>{t.label}</div>
              <div className="font-normal opacity-80">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {TAX_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.type;
          const isWrong = checked && ans && ans !== item.type;
          const typeObj = TAX_TYPES.find(t => t.id === item.type);
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{item.text}</p>
              <select disabled={checked} value={ans || ""} onChange={e => setAnswers(a => ({ ...a, [item.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary">
                <option value="">— classify this tax —</option>
                {TAX_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${typeObj?.label}` : `✗ Answer: ${typeObj?.label}`}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {TAX_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, TAX_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Fiscal Tools Sorter: Expansionary vs Contractionary
// ─────────────────────────────────────────────
const FISCAL_ACTIONS = [
  { id: 1, text: "Congress passes a $830 billion spending package including infrastructure and aid to states to fight a recession.", policy: "expansionary", reason: "↑G shifts AD right — expansionary. Direct government spending is the most powerful fiscal tool because the full dollar enters the economy immediately." },
  { id: 2, text: "The government raises income tax rates to reduce aggregate demand and fight inflation above potential output.", policy: "contractionary", reason: "↑T reduces disposable income → C falls → AD shifts left — contractionary. Used to cool an overheating economy." },
  { id: 3, text: "Congress cuts the corporate tax rate to stimulate business investment during a slowdown.", policy: "expansionary", reason: "↓T for businesses → I rises → AD shifts right — expansionary. Tax cuts stimulate but with some leakage (savings vs. spending)." },
  { id: 4, text: "The government reduces discretionary spending by cutting defense and education budgets to reduce the deficit.", policy: "contractionary", reason: "↓G shifts AD left — contractionary. Spending cuts reduce aggregate demand directly." },
  { id: 5, text: "A $1,400 direct stimulus check is sent to every qualifying household during a COVID-19 recession.", policy: "expansionary", reason: "↑Transfer payments (effectively ↓T net) → C rises → AD shifts right — expansionary. Direct transfers to households boost consumption." },
  { id: 6, text: "The Clinton administration runs budget surpluses in 1998–2001, taking more from the economy in taxes than it spends.", policy: "contractionary", reason: "Budget surplus = T > G → net contractionary. The economy was near or above potential in the late 1990s — surpluses helped cool mild inflationary pressure." },
];

function FiscalToolsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = FISCAL_ACTIONS.every(a => answers[a.id]);
  const correctCount = checked ? FISCAL_ACTIONS.filter(a => answers[a.id] === a.policy).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — Fiscal Policy Tools Sorter</p>
        <p className="text-muted-foreground text-xs mb-2">Fiscal policy has two tools: government spending (G) and taxes (T). Classify each action as expansionary (boosts AD to fight recession) or contractionary (reduces AD to fight inflation).</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="font-semibold text-green-800">↑ Expansionary</p>
            <p className="text-green-700">↑G or ↓T → AD shifts right → fights recession</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="font-semibold text-red-800">↓ Contractionary</p>
            <p className="text-red-700">↓G or ↑T → AD shifts left → fights inflation</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {FISCAL_ACTIONS.map(action => {
          const ans = answers[action.id];
          const isCorrect = checked && ans === action.policy;
          const isWrong = checked && ans && ans !== action.policy;
          return (
            <div key={action.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{action.text}</p>
              {!checked ? (
                <div className="flex gap-2">
                  <button onClick={() => setAnswers(a => ({ ...a, [action.id]: "expansionary" }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === "expansionary" ? "border-green-500 bg-green-100 text-green-800" : "border-border bg-background text-foreground hover:border-green-400"}`}>
                    ↑ Expansionary
                  </button>
                  <button onClick={() => setAnswers(a => ({ ...a, [action.id]: "contractionary" }))}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {FISCAL_ACTIONS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, FISCAL_ACTIONS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Automatic Stabilizers: Stepped Walkthrough
// ─────────────────────────────────────────────
const STABILIZER_STEPS = [
  {
    step: 1,
    title: "What Are Automatic Stabilizers?",
    content: "Automatic stabilizers are tax and spending rules that automatically cushion the economy during recessions and restrain it during booms — without Congress passing new legislation.\n\nRecession cushions: Unemployment Insurance (UI) expands as joblessness rises. SNAP/food stamps enrollment auto-rises as income falls. Progressive income tax: rates fall as incomes decline (less owed).\n\nBoom restraints: Rising incomes push households into higher brackets (more collected). UI payments fall as unemployment drops. SNAP enrollment falls as incomes rise.\n\nKey advantage: no recognition lag, no legislative lag — they activate immediately.",
    question: "What is the key advantage of automatic stabilizers over discretionary fiscal policy?",
    options: [
      "A) They are larger in scale than any discretionary spending bill",
      "B) They activate immediately without new legislation — no recognition or legislative lag",
      "C) They permanently shift the LRAS curve rightward",
      "D) They are funded by the Federal Reserve, not Congress",
    ],
    correct: 1,
    exp: "Automatic stabilizers require no new legislation — they fire automatically when economic conditions change. This eliminates the recognition lag (months to identify the problem) and legislative lag (months to pass a bill) that plague discretionary policy.",
  },
  {
    step: 2,
    title: "Discretionary vs. Automatic: The Trade-Off",
    content: "Automatic stabilizers: Trigger automatically. Speed = immediate. Example: UI kicks in as unemployment rises.\nLimitation: Modest effect — offsets only ~10% of any initial shock to output.\n\nDiscretionary policy: Requires new legislation. Speed = months to years. Example: 2009 ARRA ($830B) took months to design and pass.\nLimitation: Lags, political feasibility, may be pro-cyclical if poorly timed.\n\n'In extreme recessions, both are needed — stabilizers provide the floor; discretionary policy provides additional lift.'\n\nThe 2020 COVID shock is the clearest example: automatic stabilizers (expanded UI, SNAP) worked instantly; then CARES Act ($2.2T) and ARP ($1.9T) provided the additional lift.",
    question: "Why can't automatic stabilizers alone solve a severe recession like 2008-09 or 2020?",
    options: [
      "A) Automatic stabilizers are too slow — they take months to activate",
      "B) They only offset roughly 10% of any initial output shock — not enough for a severe contraction",
      "C) Automatic stabilizers are pro-cyclical — they make recessions worse",
      "D) They require Fed approval before activating",
    ],
    correct: 1,
    exp: "Research estimates automatic stabilizers offset roughly 10% of any initial shock. That's a meaningful floor but not sufficient in a severe recession. The 2020 COVID shock required $4T+ in additional discretionary relief on top of the automatic cushion.",
  },
  {
    step: 3,
    title: "Deficit vs. Debt: Two Different Things",
    content: "Budget Deficit (annual): Spending > Revenue in ONE year. The government overspends its annual budget — like overdrawing your checking account this month.\n\nNational Debt (cumulative): Sum of ALL past deficits minus surpluses. The running total on the national credit card.\n\nExample from slides:\nYear 1: Revenue $400B, Spending $500B → Deficit $100B → Debt $100B\nYear 2: Revenue $600B, Spending $800B → Deficit $200B → Debt $300B\nYear 3: Revenue $700B, Spending $650B → Surplus $50B → Debt $250B\n\nU.S. last had a surplus 1998–2001. Current debt/GDP ≈ 120%.",
    question: "The U.S. ran budget surpluses from 1998–2001, yet the national debt did not disappear. Why not?",
    options: [
      "A) The Fed was printing money to offset the surpluses",
      "B) Surpluses reduce the debt but decades of prior deficits had accumulated a large stock of debt that surpluses only partially reduced",
      "C) The surplus was fictional — it was calculated using off-budget items",
      "D) The national debt is separate from the budget and cannot be paid down by surpluses",
    ],
    correct: 1,
    exp: "The national debt is the cumulative total of all past deficits minus surpluses. A few years of surpluses (1998-2001) reduced the debt slightly but couldn't eliminate the stock built up over decades of deficits. Eliminating the debt would require sustained surpluses for many years.",
  },
];

function StabilizersStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const step = STABILIZER_STEPS[stepIdx];
  const isLast = stepIdx === STABILIZER_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    setScore(s => s + (sel === step.correct ? 1 : 0));
    setChecked(true);
  }
  function handleNext() { setStepIdx(i => i + 1); setSel(null); setChecked(false); }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 4 — Automatic Stabilizers & Deficits</p>
        <p className="text-muted-foreground text-xs">Walk through the mechanics of automatic stabilizers, how they compare to discretionary policy, and the deficit/debt distinction.</p>
        <div className="flex gap-1 mt-2">
          {STABILIZER_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-primary/20"}`} />
          ))}
        </div>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {step.step} of {STABILIZER_STEPS.length} — {step.title}</p>
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
              }`}>{opt}</button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Check Answer</button>}
        {checked && !isLast && <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Step →</button>}
        {checked && isLast && <button onClick={() => onComplete(score, STABILIZER_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Practical Limits: Verdict Cards
// ─────────────────────────────────────────────
const LIMITS_CARDS = [
  {
    id: "lags",
    icon: "⏱️",
    title: "The Three Lags",
    tag: "TIMING PROBLEM",
    tagColor: "bg-amber-100 border-amber-400 text-amber-800",
    body: "Recognition Lag: Economic data arrives with delay. GDP is measured quarterly and revised for months. By the time a recession is officially confirmed, the trough may already be past. Typically: months.\n\nLegislative Lag: Fiscal policy requires congressional action — committee hearings, floor votes, conference, signature. Major legislation takes substantial time. ARRA (2009) passed ~7 weeks after Obama took office — fast by historical standards. Typically: 3 months–2 years.\n\nImplementation Lag: Even after passage, funds must be disbursed. Stimulus checks: fast. Highway grants: years of planning, permits, contracting. Typically: months to years.",
    takeaway: "By the time fiscal policy is designed, passed, and implemented, the economy may have already recovered — or worsened further. Lags are why many economists prefer monetary policy (faster) or automatic stabilizers (instant) for short-run stabilization.",
  },
  {
    id: "crowding",
    icon: "📈",
    title: "Crowding Out",
    tag: "INTEREST RATE EFFECT",
    tagColor: "bg-red-100 border-red-400 text-red-800",
    body: "Government borrowing → Treasury sells bonds → demand for loanable funds rises → interest rates rise → private investment falls → household borrowing (mortgages, auto loans) also falls.\n\nThe 6-step mechanism: Gov runs deficit → Treasury sells bonds → demand for loanable funds ↑ → interest rates ↑ → private I falls → household borrowing falls.\n\nResearch estimate: A 1% of GDP increase in the deficit raises long-term interest rates by 0.5–1.0 percentage points.\n\nCrowding out is SMALLER in recessions (spare capacity; private investment already depressed) and LARGER near full employment (high demand for loanable funds). This is why fiscal stimulus is more effective in deep recessions.",
    takeaway: "Fiscal stimulus partially offsets itself through higher interest rates. The net effect on AD is smaller than the raw spending number suggests — especially when the economy is near potential output.",
  },
  {
    id: "bias",
    icon: "🗳️",
    title: "Political Bias Toward Expansion",
    tag: "POLITICAL ECONOMY",
    tagColor: "bg-purple-100 border-purple-400 text-purple-800",
    body: "Politicians can get re-elected by cutting taxes and raising spending. They cannot easily get re-elected by raising taxes and cutting spending.\n\nResult: expansionary fiscal policy gets enacted in recessions, but contractionary policy rarely follows in booms. Structural deficit bias: deficits expand in downturns but don't fully close in expansions.\n\nEvidence: The U.S. ran surpluses only 1998–2001 in the last 50+ years. Even in the boom years of the 2010s recovery, deficits continued.\n\n'By the mid-1990s, many economists concluded discretionary fiscal policy is more like a club than a scalpel — use in extreme situations only; rely on automatic stabilizers and monetary policy otherwise.'",
    takeaway: "The political incentive structure creates a systematic bias toward deficits. This is why rules (debt ceilings, balanced budget amendments, fiscal rules) are proposed — though each has its own limitations.",
  },
];

function LagsVerdictsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = LIMITS_CARDS.every(c => revealed.has(c.id));

  function toggle(id: string) {
    setRevealed(r => new Set([...r, id]));
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Why Fiscal Policy Is Harder Than It Looks</p>
        <p className="text-muted-foreground text-xs">Three real-world limits on discretionary fiscal policy. Open each card to explore the mechanism and takeaway.</p>
      </div>
      <div className="space-y-3">
        {LIMITS_CARDS.map(card => {
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
      <button disabled={!allRevealed} onClick={() => onComplete(LIMITS_CARDS.length, LIMITS_CARDS.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allRevealed ? "Mark Complete ✓" : `Open all cards to continue (${revealed.size}/${LIMITS_CARDS.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcard Station
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Fiscal Policy", back: "The government's use of spending (G) and taxation (T) to influence aggregate demand and stabilize the economy. Two tools: change G or change T." },
  { front: "Mandatory Spending", back: "Federal spending set by law that runs on auto-pilot — Social Security, Medicare, Medicaid, Unemployment Insurance. ~⅔ of the federal budget. Cannot be cut without passing new legislation." },
  { front: "Discretionary Spending", back: "Federal spending that Congress appropriates each year through the annual budget process — defense, education, NASA, transportation. ~⅓ of the federal budget." },
  { front: "Progressive Tax", back: "A tax in which the effective rate rises as income rises. Higher earners pay a larger share of income. Example: U.S. federal income tax (10%–37% brackets)." },
  { front: "Regressive Tax", back: "A tax in which the effective rate falls as income rises. Lower earners pay a larger share. Example: Social Security payroll tax, which only applies to the first ~$168,600 of earnings." },
  { front: "Marginal Tax Rate", back: "The rate applied to the NEXT dollar of income — the rate on your highest bracket only. Does NOT apply to all your income. A $60,000 earner in the 22% bracket does NOT pay 22% on all $60,000." },
  { front: "Budget Deficit", back: "When government spending exceeds tax revenue in a given year. An annual flow measure — like overdrawing your checking account this month." },
  { front: "National Debt", back: "The cumulative sum of all past budget deficits minus surpluses. The running total on the national credit card. U.S. debt/GDP ≈ 120% currently." },
  { front: "Expansionary Fiscal Policy", back: "↑G or ↓T → AD shifts right → boosts output and employment. Used when the economy is below potential (recessionary gap). Examples: 2009 ARRA, 2020 CARES Act." },
  { front: "Contractionary Fiscal Policy", back: "↓G or ↑T → AD shifts left → reduces inflation. Used when the economy is above potential (inflationary gap). Rare in practice due to political bias toward expansion." },
  { front: "Automatic Stabilizers", back: "Tax and spending rules that automatically stimulate AD in recessions and restrain it in booms without new legislation. Examples: Unemployment Insurance, SNAP, progressive income tax. Offset ~10% of any output shock." },
  { front: "Crowding Out", back: "Government borrowing raises interest rates → private investment falls → partially offsets the expansionary fiscal effect. Larger near full employment; smaller in deep recessions." },
  { front: "Recognition Lag", back: "The delay between when an economic problem develops and when policymakers officially recognize it. GDP data arrives with a delay and is revised for months. Typically: months." },
  { front: "Legislative Lag", back: "The time required for Congress to debate, draft, and pass fiscal legislation. Ranges from weeks (fast) to years (slow). Typically: 3 months to 2 years." },
  { front: "Debt/GDP Ratio", back: "National debt divided by GDP — the better measure of debt sustainability. A $33T debt in a $27T economy (~120%) is more meaningful than raw debt dollars. Post-WWII peak was ~120%; it fell as the economy grew." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 17 Key Terms</p>
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
        <button onClick={handlePrev} disabled={idx === 0} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground disabled:opacity-30 hover:bg-muted transition">← Prev</button>
        <button onClick={handleNext} disabled={idx === cards.length - 1} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground disabled:opacity-30 hover:bg-muted transition">Next →</button>
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
  { q: "Which of the following is an example of mandatory federal spending?", options: ["A) Annual Pentagon defense appropriations voted on by Congress", "B) NASA science grants in the annual budget", "C) Social Security retirement benefits paid automatically under current law", "D) Infrastructure grants in a discretionary spending bill"], correct: 2, exp: "Mandatory spending is set by law and runs automatically — Social Security, Medicare, Medicaid, and Unemployment Insurance. Congress must pass new legislation to cut it. Defense and NASA funding are discretionary — voted on annually." },
  { q: "A single filer earns $60,000 and is in the 22% tax bracket. Their marginal tax rate is 22%. What is their average (effective) tax rate?", options: ["A) 22% — the marginal rate applies to all income", "B) Less than 22% — the first brackets are taxed at lower rates (10% and 12%)", "C) More than 22% — payroll taxes add on top", "D) 0% — income below $60,000 is not taxable"], correct: 1, exp: "The marginal rate applies only to the LAST dollars earned above the threshold. Lower dollars are taxed at 10% and 12%. Total tax ≈ $8,114 on $60,000 = ~13.5% effective rate — well below the 22% marginal rate." },
  { q: "The Social Security payroll tax applies only to the first ~$168,600 of earnings. A worker earning $300,000 pays zero Social Security tax on earnings above that cap. This makes the Social Security payroll tax:", options: ["A) Progressive — higher earners pay more in total", "B) Proportional — everyone pays 6.2%", "C) Regressive — the effective rate falls as income rises above the cap", "D) Neutral — it has no effect on income distribution"], correct: 2, exp: "Regressive: the effective rate falls as income rises. A $50K earner pays 6.2% on all income. A $300K earner pays 6.2% only on the first $168,600 — a much lower effective rate. Total dollars paid are higher, but the share of income is lower." },
  { q: "The national debt is currently ~$33 trillion. A senator says 'We must balance the budget immediately to eliminate the debt.' What does economics say about this?", options: ["A) Correct — the debt must be eliminated to restore economic stability", "B) Balancing the budget stops adding to the debt but doesn't reduce the existing stock; elimination would require sustained surpluses for decades", "C) The debt is irrelevant — it is owed to ourselves so it doesn't matter", "D) Correct — a balanced budget amendment would automatically pay off the debt within 10 years"], correct: 1, exp: "Balancing the budget (T = G) stops new deficits from adding to the debt, but the existing $33T stock remains. Paying it down requires budget surpluses — T > G sustained for decades. The U.S. last had surpluses 1998–2001, and even those only slightly reduced the accumulated debt." },
  { q: "During a recession, Congress passes a large spending bill. According to the crowding-out argument, what partially offsets the expansionary effect?", options: ["A) The Fed automatically raises interest rates to counter the fiscal stimulus", "B) Government borrowing raises interest rates, reducing private investment and household borrowing", "C) Higher taxes are required to finance the spending, reducing the net effect to zero", "D) International investors pull money out of the country, weakening the dollar"], correct: 1, exp: "Crowding out: government borrowing increases demand for loanable funds → interest rates rise → private investment (I) falls → household borrowing for mortgages and auto loans also falls. This partially offsets the AD stimulus. The effect is smaller in deep recessions when private investment is already depressed." },
  { q: "Unemployment Insurance, SNAP, and the progressive income tax are all examples of:", options: ["A) Discretionary fiscal policy — Congress votes on them each year", "B) Monetary policy tools — controlled by the Federal Reserve", "C) Automatic stabilizers — they activate without new legislation as economic conditions change", "D) Supplemental spending — they require emergency legislation to operate"], correct: 2, exp: "Automatic stabilizers activate automatically as economic conditions change — no new legislation required. UI expands as unemployment rises. SNAP enrollment rises as incomes fall. Progressive income tax collects less automatically in recessions (incomes fall → lower brackets). No recognition or legislative lag." },
  { q: "The recognition lag in fiscal policy refers to:", options: ["A) The delay between when Congress passes a bill and when the President signs it", "B) The time between when an economic problem develops and when policymakers officially recognize it based on available data", "C) The time required for funds to reach the intended recipients after passage", "D) The delay between a Fed rate decision and its economic effect"], correct: 1, exp: "GDP is measured quarterly and revised for months. Recessions are often only officially dated after the trough has passed. By the time the problem is recognized in the data, conditions may already be changing — making the fiscal response potentially mistimed." },
  { q: "Expansionary fiscal policy is most effective (least crowding-out, largest multiplier) when:", options: ["A) The economy is near full employment and interest rates are low", "B) The economy is far below potential output — a deep recessionary gap with idle capacity", "C) The Federal Reserve is simultaneously raising interest rates", "D) The policy consists entirely of tax cuts rather than direct spending"], correct: 1, exp: "Crowding-out is smallest in deep recessions: private investment is already depressed, idle capacity means businesses don't bid aggressively for loanable funds, and the economy is in the Keynesian zone of SRAS where stimulus creates real output gains with little inflation." },
  { q: "Political bias toward fiscal expansion means:", options: ["A) Politicians prefer contractionary policy because it demonstrates fiscal discipline", "B) Politicians can win votes by cutting taxes and raising spending but face political costs from raising taxes or cutting spending — creating a structural deficit bias", "C) The Federal Reserve has a legal bias toward expansionary policy under the dual mandate", "D) Automatic stabilizers are always set too high because of congressional pressure"], correct: 1, exp: "Asymmetric political incentives: stimulus (cut taxes, raise spending) wins votes; austerity (raise taxes, cut spending) loses them. Result: expansionary policy happens in recessions but contractionary policy rarely follows in booms. The U.S. ran surpluses only 1998–2001 in the last 50+ years." },
  { q: "The debt/GDP ratio is a better measure of debt sustainability than raw debt dollars because:", options: ["A) It excludes intragovernmental debt held by Social Security trust funds", "B) GDP growth can reduce the ratio even without paying down the debt — and the ratio reflects the economy's capacity to service the debt", "C) It adjusts for inflation, which raw debt figures do not", "D) It only counts debt held by foreign governments, not domestic holders"], correct: 1, exp: "A $33T debt in a $27T economy (~120%) is more meaningful than the raw number. Post-WWII, the U.S. reduced its debt/GDP ratio from ~120% to ~35% largely through growth — not by running surpluses. If GDP grows faster than debt, the ratio falls automatically." },
  { q: "Which fiscal policy action would a Keynesian economist most strongly recommend during a severe recession?", options: ["A) Raise taxes to prevent the deficit from growing during the downturn", "B) Cut government spending to signal fiscal discipline to bond markets", "C) Increase government spending or cut taxes to shift AD rightward toward potential GDP", "D) Wait for the economy to self-correct through falling wages and prices"], correct: 2, exp: "Keynesian prescription: when AD collapses and the economy is far below potential, government must act to restore demand. Waiting for self-correction is too slow (wages are sticky); cutting spending or raising taxes would worsen the recession; stimulus (↑G or ↓T) shifts AD right toward Yp." },
  { q: "Why do many economists prefer automatic stabilizers and monetary policy over discretionary fiscal policy for routine stabilization?", options: ["A) Discretionary fiscal policy is constitutionally prohibited except during declared wars", "B) Automatic stabilizers and monetary policy act faster and without the recognition, legislative, and implementation lags that make discretionary fiscal policy hard to time correctly", "C) Fiscal policy has no effect on aggregate demand — only monetary policy does", "D) Discretionary fiscal policy always causes hyperinflation"], correct: 1, exp: "The three lags (recognition: months; legislative: months to years; implementation: months to years) mean discretionary fiscal policy often hits the economy after the problem has already changed. Automatic stabilizers act instantly; monetary policy (Fed rate decisions) acts in weeks. Discretionary fiscal policy is most clearly justified in severe, prolonged downturns like 2008-09 or 2020." },
  { q: "A new law eliminates the Social Security payroll tax wage cap, requiring all earnings — including above $168,600 — to be taxed at 6.2%. This change would make Social Security taxation:", options: ["A) More regressive — higher earners now pay more total dollars", "B) More progressive — the effective rate would now rise with income", "C) Proportional — everyone pays 6.2% of all earnings", "D) Unchanged in its distributional impact"], correct: 2, exp: "If 6.2% applies to ALL earnings with no cap, then every earner — regardless of income — pays the same 6.2% rate on all wages. This is proportional (flat rate). It eliminates the regressivity created by the cap while not making it progressive (rate doesn't rise with income)." },
  { q: "Automatic stabilizers offset roughly 10% of any initial output shock. During the 2020 COVID recession, GDP fell by about $2 trillion. What does this imply about the role of discretionary policy?", options: ["A) Automatic stabilizers were sufficient — the $200B cushion covered the shock fully", "B) Automatic stabilizers provided ~$200B of cushion — the remaining ~$1.8T gap required discretionary policy to fill", "C) Automatic stabilizers overstabilized the economy, causing inflation", "D) The 10% figure applies only to supply-side shocks, not demand shocks"], correct: 1, exp: "10% of $2T = $200B from automatic stabilizers. The remaining ~$1.8T contraction required discretionary action — CARES Act ($2.2T) and ARP ($1.9T) provided the additional lift. This illustrates why major crises require both automatic stabilizers AND discretionary fiscal policy." },
  { q: "The Balanced Budget Debate: A senator argues 'A balanced budget is always best.' An economist responds that a strict balanced budget rule would:", options: ["A) Eliminate the national debt within 10 years through automatic debt paydown", "B) Force spending cuts or tax hikes during recessions (when stabilizers expand), making automatic stabilizers pro-cyclical", "C) Prevent the Fed from conducting monetary policy independently", "D) Be easily achievable since the U.S. ran surpluses 1998–2001"], correct: 1, exp: "A strict balanced budget rule would require spending cuts or tax increases in recessions — precisely when automatic stabilizers naturally expand deficits. This would be pro-cyclical: deepening recessions when the economy needs stimulus. Most economists prefer fiscal rules targeting debt/GDP sustainability over strict year-by-year balance." },
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
    setScore(s => s + (sel === q.correct ? 1 : 0));
    setChecked(true);
  }
  function handleNext() {
    setResults(r => [...r, { correct: sel === q.correct, exp: q.exp }]);
    setIdx(i => i + 1); setSel(null); setChecked(false);
  }
  function handleFinish() {
    const finalResults = [...results, { correct: sel === q.correct, exp: q.exp }];
    const finalScore = score + (sel === q.correct ? 1 : 0);
    if (finalScore >= 9) { onDone(finalScore, finalResults); } else { onNotYet(); }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Chapter 17 Quiz — Government Budgets & Fiscal Policy</p>
        <p className="text-muted-foreground text-xs">10 questions from the full pool. You need 9/10 to complete the lab.</p>
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
        {checked && <div className={`rounded-lg p-3 text-xs ${sel === q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{sel === q.correct ? "✓ Correct — " : "✗ Incorrect — "}{q.exp}</div>}
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
const CH17_SUMMARY = [
  { heading: "17.1 Government Spending", body: "Fiscal policy is the set of policies relating to federal government spending, taxation, and borrowing. Federal spending and taxes as a share of GDP have typically fluctuated between 18–22% of GDP in recent decades. State and local spending has risen from about 12–13% to about 20% of GDP over the last four decades. The four main areas of federal spending are national defense, Social Security, healthcare, and interest payments, accounting for about 70% of all federal spending. A budget deficit occurs when spending exceeds taxes; a budget surplus when taxes exceed spending. The sum of all past deficits and surpluses makes up the government debt." },
  { heading: "17.2 Taxation", body: "The two main federal taxes are individual income taxes and payroll taxes (for Social Security and Medicare), together accounting for more than 80% of federal revenues. Other federal taxes include the corporate income tax, excise taxes, and the estate and gift tax. A progressive tax (e.g. federal income tax) requires those with higher incomes to pay a higher share. A proportional tax (e.g. Medicare payroll tax) applies the same rate to all income levels. A regressive tax (e.g. Social Security payroll tax above a threshold) results in higher-income earners paying a lower share of income in taxes." },
  { heading: "17.3 Federal Deficits and the National Debt", body: "For most of the twentieth century, the U.S. government took on debt during wartime and paid it down slowly in peacetime. Substantial peacetime deficits emerged in the 1980s and early 1990s, followed by budget surpluses from 1998 to 2001, then annual deficits since 2002, with very large deficits during the 2008–2009 recession. A budget deficit or surplus is measured annually; the national debt is the cumulative sum of all past deficits and surpluses." },
  { heading: "17.4 Using Fiscal Policy to Fight Recession and Inflation", body: "Expansionary fiscal policy increases aggregate demand through higher government spending or tax reductions. It is most appropriate when an economy is in recession and producing below potential GDP. Contractionary fiscal policy decreases aggregate demand through spending cuts or tax increases. It is most appropriate when an economy is producing above potential GDP." },
  { heading: "17.5 Automatic Stabilizers", body: "Fiscal policy operates through discretionary fiscal policy (government enacts changes in response to economic events) or through automatic stabilizers (taxing and spending mechanisms that shift automatically without new legislation). The standardized employment budget calculates what the deficit or surplus would have been if the economy had been producing at potential GDP. Critics of fiscal policy point to time lags, impacts on interest rates, and the inherently political nature of fiscal decisions." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 17 Summary — Government Budgets & Fiscal Policy</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH17_SUMMARY.map((s, i) => (
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

const STATION_LABELS_CH17: Record<string, string> = {
  spendingclassify: "Spending Classifier",
  taxsystems:       "Tax Systems",
  fiscaltools:      "Fiscal Tools Sorter",
  stabilizers:      "Automatic Stabilizers",
  lagsverdicts:     "Practical Limits",
  flash:            "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH17).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch17 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 17 — Government Budgets &amp; Fiscal Policy</h2>
    <p style="font-size:0.9rem;color:#475569"><strong>Student:</strong> ${name||"—"} &nbsp;&nbsp; <strong>Date:</strong> ${now}</p>
    <div class="score-box"><p>Quiz Score: ${score}/10 — ${score>=9?"PASSED ✓":"Not Yet"}</p></div>
    ${stRows?`<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stRows}</tbody></table>`:""}
    <h3>Quiz Question Review</h3><table><thead><tr><th style="width:40px"></th><th>Question</th><th>Explanation</th></tr></thead><tbody>${qRows}</tbody></table>
    ${exitTicket?`<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:12px"><strong style="font-size:0.75rem;text-transform:uppercase;color:#64748b">Exit Ticket</strong><p style="font-size:0.85rem;margin:6px 0 0">${exitTicket}</p></div>`:""}
    <footer>Access for free at https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction</footer></body></html>`);
    setTimeout(() => w.print(), 600);
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-2xl p-5 text-center ${score>=9?"bg-green-50 border-2 border-green-300":"bg-amber-50 border-2 border-amber-300"}`}>
        <p className="text-3xl font-bold">{score}/10</p>
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 17 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 17 — Government Budgets &amp; Fiscal Policy</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: Explain the difference between a budget deficit and the national debt. Why can't a balanced budget eliminate the existing national debt?</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e=>setExitTicket(e.target.value)} rows={3} placeholder="Your response..." className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none resize-none"/></div>
      </div>
      {stationRows.length>0&&(<div className="bg-card border border-border rounded-xl p-4"><p className="text-sm font-semibold text-foreground mb-3">Station Scores</p><div className="space-y-2">{stationRows.map(r=>(<div key={r.label} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{r.label}</span><span className={`font-bold ${r.score===r.total?"text-green-700":r.score>=r.total*0.7?"text-amber-700":"text-red-600"}`}>{r.score}/{r.total}</span></div>))}</div></div>)}
      <div className="space-y-2"><p className="text-sm font-semibold text-foreground">Quiz Question Review</p>{results.map((r,i)=>(<div key={i} className={`rounded-xl border p-3 ${r.correct?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}><p className="text-xs font-semibold">{r.correct?"✓ Correct":"✗ Incorrect"} — Question {i+1}</p><p className="text-xs text-muted-foreground mt-0.5">{r.exp}</p></div>))}</div>
      <button type="button" onClick={onRestart} className="w-full py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button>
      <button type="button" onClick={printPDF} disabled={!name.trim()} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stations Config
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "spendingclassify" as Station, icon: "🏛️", label: "Spending Classifier",  desc: "Mandatory, discretionary, or supplemental?" },
  { id: "taxsystems"       as Station, icon: "📊", label: "Tax Systems",           desc: "Progressive, proportional, or regressive?" },
  { id: "fiscaltools"      as Station, icon: "⚖️", label: "Fiscal Tools Sorter",  desc: "Expansionary vs. contractionary actions" },
  { id: "stabilizers"      as Station, icon: "🛡️", label: "Automatic Stabilizers",desc: "Built-in shock absorbers + deficit/debt" },
  { id: "lagsverdicts"     as Station, icon: "⏱️", label: "Practical Limits",     desc: "Three lags, crowding out, political bias" },
  { id: "flash"            as Station, icon: "🃏", label: "Flashcard Review",      desc: "Review all 15 key terms" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "spendingclassify", label: "Spending" },
  { id: "taxsystems",       label: "Taxes" },
  { id: "fiscaltools",      label: "Tools" },
  { id: "stabilizers",      label: "Stabilizers" },
  { id: "lagsverdicts",     label: "Limits" },
  { id: "flash",            label: "Flashcards" },
  { id: "quiz",             label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","spendingclassify","taxsystems","fiscaltools","stabilizers","lagsverdicts","flash","quiz","results","not-yet"];

function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapter 17 — Government Budgets &amp; Fiscal Policy</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progress / STATIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}/{STATIONS.length} stations complete</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted border border-border">
        <div className="flex items-center gap-2"><span className="text-base">📄</span><span className="text-sm text-foreground">Need a refresher? View the chapter summary.</span></div>
        <button onClick={onSummary} className="text-xs px-3 py-1.5 rounded-lg bg-card border border-border text-primary font-semibold hover:bg-accent transition-all shrink-0">Open Summary</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {STATIONS.map(s => {
          const done = completed.has(s.id);
          return (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)}
              className={`rounded-xl border-2 p-3 text-left transition ${done ? "border-green-400 bg-green-50" : "border-border bg-card hover:border-primary/40"}`}>
              <span className="text-lg">{done ? "✅" : s.icon}</span>
              <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onStartQuiz} disabled={!quizUnlocked}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition ${quizUnlocked ? "bg-primary hover:opacity-90 text-primary-foreground" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"}`}>
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground" : done ? "bg-sidebar-accent text-sidebar-foreground/90" : "text-sidebar-foreground/75 hover:text-white"}`}>
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
        {station === "intro"            && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "spendingclassify" && <SpendingClassifyStation onComplete={(sc,t) => markDone("spendingclassify", sc, t)} />}
        {station === "taxsystems"       && <TaxSystemsStation       onComplete={(sc,t) => markDone("taxsystems",       sc, t)} />}
        {station === "fiscaltools"      && <FiscalToolsStation      onComplete={(sc,t) => markDone("fiscaltools",      sc, t)} />}
        {station === "stabilizers"      && <StabilizersStation      onComplete={(sc,t) => markDone("stabilizers",      sc, t)} />}
        {station === "lagsverdicts"     && <LagsVerdictsStation     onComplete={(sc,t) => markDone("lagsverdicts",     sc, t)} />}
        {station === "flash"            && <FlashcardStation        onComplete={(sc,t) => markDone("flash",            sc, t)} />}
        {station === "quiz" && (
          <QuizStation
            onDone={(score, results) => { setQuizScore(score); setQuizResults(results); markDone("quiz"); setStation("results"); }}
            onNotYet={() => setStation("not-yet")}
          />
        )}
        {station === "results" && <ResultsScreen score={quizScore} results={quizResults} sectionScores={sectionScores} onRestart={() => setStation("intro")} courseTitle={courseTitle} />}
        {station === "not-yet" && <NotYetScreen onRetry={() => setStation("quiz")} />}
      </main>
    </div>
  );
}
