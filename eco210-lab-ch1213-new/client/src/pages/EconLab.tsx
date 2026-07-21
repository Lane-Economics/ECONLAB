import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "twolenses"
  | "advolatility"
  | "multiplier"
  | "phillipscurve"
  | "neoclassical"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch1213";

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
// Station 1 — Two Lenses: Schools Classifier
// ─────────────────────────────────────────────
const SCHOOLS_ITEMS = [
  { id: 1, text: "Wages and prices adjust slowly in recessions, so demand shortfalls persist and require active government response.", school: "keynesian", label: "Keynesian" },
  { id: 2, text: "The economy's long-run productive capacity is determined by physical capital, human capital, technology, and institutions — not by aggregate demand.", school: "neoclassical", label: "Neoclassical" },
  { id: 3, text: "If the government runs a large deficit, it borrows in financial capital markets, raising interest rates and crowding out private investment.", school: "neoclassical", label: "Neoclassical" },
  { id: 4, text: "Animal spirits — waves of business confidence and pessimism — drive investment volatility and can cause AD to collapse independently of interest rates.", school: "keynesian", label: "Keynesian" },
  { id: 5, text: "The economy will eventually return to potential GDP — the disagreement is how long it takes and whether the human cost of waiting is acceptable.", school: "both", label: "Both Agree" },
  { id: 6, text: "Rules are better than discretion — predictable, credible policy (like the Fed's 2% inflation target) produces better outcomes than case-by-case decisions.", school: "neoclassical", label: "Neoclassical" },
];

const SCHOOL_OPTS = [
  { id: "keynesian",   label: "Keynesian",  color: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "neoclassical",label: "Neoclassical",color: "bg-green-100 border-green-400 text-green-800" },
  { id: "both",        label: "Both Agree", color: "bg-purple-100 border-purple-400 text-purple-800" },
];

function TwoLensesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = SCHOOLS_ITEMS.every(s => answers[s.id]);
  const correctCount = checked ? SCHOOLS_ITEMS.filter(s => answers[s.id] === s.school).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — Two Lenses: Keynesian vs. Neoclassical</p>
        <p className="text-muted-foreground text-xs mb-2">Same goal, different mechanisms. Classify each statement. Solow: "Both capture something real — the time horizon determines which law governs."</p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {SCHOOL_OPTS.map(o => <span key={o.id} className={`px-2 py-1 rounded-lg border font-semibold text-center ${o.color}`}>{o.label}</span>)}
        </div>
      </div>
      <div className="space-y-2">
        {SCHOOLS_ITEMS.map(item => {
          const ans = answers[item.id];
          const isCorrect = checked && ans === item.school;
          const isWrong = checked && ans && ans !== item.school;
          const optObj = SCHOOL_OPTS.find(o => o.id === item.school);
          return (
            <div key={item.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{item.text}</p>
              {!checked ? (
                <div className="flex gap-1.5">
                  {SCHOOL_OPTS.map(o => (
                    <button key={o.id} onClick={() => setAnswers(a => ({ ...a, [item.id]: o.id }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === o.id ? `${o.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{optObj?.label}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {SCHOOLS_ITEMS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, SCHOOLS_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — AD Components & Volatility Sorter
// ─────────────────────────────────────────────
const AD_EVENTS = [
  { id: 1, text: "A family spends roughly the same amount on groceries this month as last month, despite mild economic uncertainty.", component: "C", label: "Consumption (C)", stability: "stable", reason: "Consumption is the most stable AD component — households smooth spending over time. Even in mild downturns, food, housing, and essential services hold up. ~70% of U.S. GDP." },
  { id: 2, text: "A tech CEO cancels a planned $500M factory expansion because Q3 demand data came in soft and the board grew nervous.", component: "I", label: "Investment (I)", stability: "volatile", reason: "Investment is the most volatile AD component — driven by confidence about future profits ('animal spirits'). Can collapse rapidly when expectations shift, regardless of interest rates." },
  { id: 3, text: "Congress passes the annual defense appropriations bill — essentially the same funding as last year.", component: "G", label: "Government (G)", stability: "stable", reason: "Government spending is set by policy and tends to be stable year-to-year. It can be used counter-cyclically — making it the Keynesian stabilization tool." },
  { id: 4, text: "Business investment across the U.S. economy fell ~20% in a single year as the financial crisis triggered a collapse in business confidence.", component: "I", label: "Investment (I)", stability: "volatile", reason: "2008-09: business investment collapsed ~20% — the sharpest single component drop. Animal spirits failed simultaneously across the entire economy. This is why Keynesians say AD is inherently unstable." },
  { id: 5, text: "U.S. exports to China fall as the dollar strengthens, while imports rise as consumers buy more foreign goods.", component: "NX", label: "Net Exports (NX)", stability: "moderate", reason: "Net exports fluctuate with exchange rates, trading partner growth, and trade policy — more volatile than C or G, less volatile than I. Currently negative for the U.S. (trade deficit)." },
];

const STABILITY_OPTS = [
  { id: "stable",   label: "Most Stable",      color: "bg-green-100 border-green-400 text-green-800" },
  { id: "moderate", label: "Moderately Stable", color: "bg-amber-100 border-amber-400 text-amber-800" },
  { id: "volatile", label: "Most Volatile",     color: "bg-red-100 border-red-400 text-red-800" },
];

const COORD_Q = {
  q: "Workers would accept a wage cut in a recession IF everyone else did too. But no market mechanism coordinates this. What is the result according to Keynesian theory?",
  options: [
    "A) Wages fall rapidly as rational workers recognize cuts are necessary for the economy",
    "B) Each firm that cuts wages alone loses its best workers first (adverse selection) and destroys morale — so no firm cuts wages, wages stay sticky, and unemployment persists instead of clearing through wage adjustment",
    "C) The government coordinates wage cuts through minimum wage legislation during downturns",
    "D) Coordination failure only applies to prices, not wages — wages always adjust freely in recessions",
  ],
  correct: 1,
  exp: "Keynesian coordination failure: wages are sticky downward not because workers are irrational — but because no firm can cut wages without suffering adverse selection (best workers leave first). The result: firms lay off workers rather than cut wages, unemployment persists, and government must restore aggregate demand because the market cannot self-coordinate.",
};

function AdVolatilityStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sortChecked, setSortChecked] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [coordChecked, setCoordChecked] = useState(false);
  const [coordScore, setCoordScore] = useState(0);
  const allAnswered = AD_EVENTS.every(e => answers[e.id]);
  const sortCorrect = sortChecked ? AD_EVENTS.filter(e => answers[e.id] === e.stability).length : 0;
  const totalScore = sortCorrect + coordScore;
  const totalQs = AD_EVENTS.length + 1;

  function handleCoordCheck() {
    if (sel === null) return;
    setCoordScore(sel === COORD_Q.correct ? 1 : 0);
    setCoordChecked(true);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — AD Volatility & Coordination Failure</p>
        <p className="text-muted-foreground text-xs mb-2">Classify each spending event by stability. Investment (I) is driven by animal spirits — confidence about future profits. When it collapses, AD collapses.</p>
        <div className="flex gap-1 text-xs">
          {STABILITY_OPTS.map(o => <span key={o.id} className={`flex-1 px-2 py-1 rounded-lg border font-semibold text-center ${o.color}`}>{o.label}</span>)}
        </div>
      </div>
      <div className="space-y-2">
        {AD_EVENTS.map(ev => {
          const ans = answers[ev.id];
          const isCorrect = sortChecked && ans === ev.stability;
          const isWrong = sortChecked && ans && ans !== ev.stability;
          const optObj = STABILITY_OPTS.find(o => o.id === ev.stability);
          return (
            <div key={ev.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{ev.text}</p>
              {!sortChecked ? (
                <div className="flex gap-1.5">
                  {STABILITY_OPTS.map(o => (
                    <button key={o.id} onClick={() => setAnswers(a => ({ ...a, [ev.id]: o.id }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === o.id ? `${o.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{optObj?.label} — {ev.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!sortChecked ? (
        <button disabled={!allAnswered} onClick={() => setSortChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Stability Ratings
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-blue-800">Stability ratings: {sortCorrect}/{AD_EVENTS.length} correct</p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Coordination Failure Question</p>
            <p className="text-sm font-semibold text-foreground">{COORD_Q.q}</p>
            <div className="space-y-2">
              {COORD_Q.options.map((opt, i) => (
                <button key={i} disabled={coordChecked} onClick={() => setSel(i)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                    coordChecked
                      ? i === COORD_Q.correct ? "border-green-500 bg-green-50 text-green-900"
                        : i === sel && sel !== COORD_Q.correct ? "border-red-400 bg-red-50 text-red-900"
                        : "border-border text-muted-foreground opacity-60"
                      : sel === i ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}>{opt}</button>
              ))}
            </div>
            {coordChecked && (
              <div className={`rounded-lg p-3 text-xs ${sel === COORD_Q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {sel === COORD_Q.correct ? "✓ Correct — " : "✗ Incorrect — "}{COORD_Q.exp}
              </div>
            )}
            {!coordChecked && sel !== null && (
              <button onClick={handleCoordCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
                Check Answer
              </button>
            )}
            {coordChecked && (
              <button onClick={() => onComplete(totalScore, totalQs)}
                className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
                Mark Complete ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — The Multiplier
// ─────────────────────────────────────────────
const MULTIPLIER_QS = [
  {
    q: "The expenditure multiplier formula is: Multiplier = 1 / (1 − MPC). If the Marginal Propensity to Consume (MPC) is 0.75, what is the multiplier and what does it mean?",
    options: [
      "Multiplier = 0.25 — meaning $1 of government spending creates $0.25 of GDP",
      "Multiplier = 1.75 — meaning $1 of spending creates $1.75 of GDP",
      "Multiplier = 4 — meaning $1 of government spending creates $4 of total GDP through successive rounds of spending",
      "Multiplier = 7.5 — meaning $1 of spending creates $7.50 of GDP",
    ],
    correct: 2,
    exp: "Multiplier = 1/(1−MPC) = 1/(1−0.75) = 1/0.25 = 4. Meaning: $1 of new government spending becomes someone's income → they spend 75¢ of it → that 75¢ becomes someone else's income → they spend 75% of that → and so on. Each round: $1.00 + $0.75 + $0.5625 + ... sums to $4.00 total GDP. A $1,000 infrastructure injection with MPC=0.75 creates $4,000 in new GDP. From your slides: if MPC=0.8, multiplier=5, so $1,000→$5,000.",
  },
  {
    q: "Your slides note that the multiplier 'works in reverse.' The 1929 stock market crash caused a collapse in business investment. With MPC = 0.8 (multiplier = 5), if investment fell by $10 billion, what was the approximate GDP impact?",
    options: [
      "$50 billion — the negative multiplier amplified the initial collapse through successive rounds of reduced spending",
      "$10 billion — the multiplier only applies to government spending, not private investment",
      "$2 billion — investment is only 20% of GDP so the impact is proportionally smaller",
      "$8 billion — the MPC of 0.8 means 80% of the drop was absorbed by the economy",
    ],
    correct: 0,
    exp: "The multiplier works symmetrically in both directions. A $10B investment collapse with multiplier=5 produces a $50B GDP contraction: the initial $10B loss → income falls → spending falls 80% of that → income falls again → and so on through successive rounds. This is why the 1929 investment collapse ($10B initial drop) amplified into the Great Depression (~25% GDP contraction). Your slides: 'Contractions compound.' The negative multiplier is the mechanism behind deflationary spirals — small initial shocks become catastrophic through rounds of spending reduction.",
  },
  {
    q: "Your slides note that the multiplier is 'smaller for tax cuts' than for direct government spending. Why?",
    options: [
      "Tax cuts are less effective because they require Congressional approval, which takes longer than direct spending",
      "Tax cuts reduce government revenue, which crowds out private investment through higher interest rates",
      "Tax cuts boost disposable income, but some of each dollar is saved rather than spent — especially by higher earners with lower MPC. Direct spending puts the full dollar into the economy immediately",
      "Tax cuts only affect corporations, not households, so they have minimal impact on consumer spending",
    ],
    correct: 2,
    exp: "From your slides: tax cuts increase disposable income, but households save some fraction (1−MPC). With MPC=0.8, a $1 tax cut → 80¢ spent → multiplier effect. But direct government spending puts the full $1 into the economy immediately (no saving leakage in the first round). Higher-income households have lower MPC (save more), so tax cuts targeted at wealthy earners have an even smaller multiplier. The 2009 ARRA (~$800B) combined both: direct spending (higher multiplier) and tax cuts (lower multiplier). CBO estimated the combined multiplier at 0.8–2.5 depending on the mechanism.",
  },
  {
    q: "The 2009 American Recovery and Reinvestment Act (ARRA) was approximately $800 billion. Your slides cite CBO estimates of a multiplier of 0.8–2.5 depending on the mechanism. What explains this wide range?",
    options: [
      "The range reflects political disagreement — Keynesian economists estimated 2.5 while Neoclassical economists estimated 0.8",
      "The range reflects measurement uncertainty — economists couldn't agree on how to count GDP",
      "Different components have different multipliers: direct spending on infrastructure and transfers to low-income households (high MPC, high multiplier) vs. tax cuts to higher-income households (lower MPC, lower multiplier), plus crowding-out effects at different points on SRAS",
      "The multiplier was 2.5 in 2009 but fell to 0.8 by 2010 as the economy recovered",
    ],
    correct: 2,
    exp: "The multiplier varies by mechanism: (1) Direct spending on infrastructure or transfers to low-income households (high MPC → spend most of each dollar → higher multiplier, up to 2.5). (2) Tax cuts to higher earners (lower MPC → save more → lower multiplier, ~0.8). (3) Crowding out: if government borrowing raises interest rates, some private investment is displaced, reducing the net multiplier. (4) Zone of SRAS matters: the multiplier is higher in the Keynesian zone (massive idle capacity) than in the Intermediate zone. The CBO range captures all these real differences.",
  },
];

function MultiplierStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = MULTIPLIER_QS[idx];
  const isLast = idx === MULTIPLIER_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">The Expenditure Multiplier</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="font-bold text-primary mb-1">The Formula</p>
            <p className="text-foreground font-mono">Multiplier = 1 / (1 − MPC)</p>
            <p className="text-muted-foreground mt-1">MPC = Marginal Propensity to Consume</p>
            <p className="text-foreground font-semibold mt-2">If MPC = 0.8:</p>
            <p className="text-foreground">Multiplier = 1/0.2 = <span className="font-bold text-primary">5</span></p>
            <p className="text-muted-foreground">$1,000 → $5,000 GDP</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2 text-xs space-y-1.5">
            <p className="font-bold text-primary">Key facts</p>
            <p className="text-muted-foreground">• Works in reverse: investment collapse amplifies downturns</p>
            <p className="text-muted-foreground">• Smaller for tax cuts (saving leakage)</p>
            <p className="text-muted-foreground">• Larger in Keynesian zone (idle capacity)</p>
            <p className="text-muted-foreground">• 2009 ARRA $800B → CBO est. multiplier 0.8–2.5</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">"The multiplier is the centerpiece of Keynesian fiscal policy — and one of its most-debated empirical claims."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MULTIPLIER_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Phillips Curve: Era Classifier
// ─────────────────────────────────────────────
const PHILLIPS_ERAS = [
  { id: 1, text: "1960s: Vietnam War spending boosts AD. Unemployment falls from 5.5% to 3.5%. Inflation rises from 1.5% to 5%. The data tracks neatly along a downward-sloping curve.", era: "srpc", label: "Consistent with SRPC", reason: "Classic SRPC movement: AD boost → unemployment falls, inflation rises. Policy could exploit the tradeoff. The 1960s were the Phillips Curve's greatest empirical success." },
  { id: 2, text: "1973–75: OPEC quadruples oil prices. Unemployment rises to 8.5% AND inflation exceeds 12% simultaneously — stagflation.", era: "breaks", label: "Breaks Simple SRPC", reason: "Supply shock shifted the entire SRPC outward — both inflation and unemployment rose together. This is impossible on a stable, downward-sloping SRPC. Stagflation shattered the 1960s consensus." },
  { id: 3, text: "1980–82: Fed Chair Volcker raises rates to 20%. Unemployment hits 10.8% — the highest since the Depression. Inflation falls from 13% to 3%.", era: "srpc", label: "Consistent with SRPC", reason: "Volcker moved up-left along the SRPC: tight monetary policy reduced AD → unemployment rose sharply, inflation fell sharply. A painful movement along the curve, not a break from it." },
  { id: 4, text: "2015–19: Unemployment falls from 5.7% to 3.5% — well below most estimates of the natural rate. Core inflation barely moves, staying near 2%.", era: "breaks", label: "Breaks Simple SRPC", reason: "The SRPC predicted that falling unemployment below the natural rate would accelerate inflation. It didn't — puzzling economists. A very flat Phillips Curve. Possible explanations: well-anchored expectations, globalization dampening price pressure, measurement issues." },
  { id: 5, text: "2021–22: COVID reopening + massive stimulus + supply chain disruptions. Unemployment falls rapidly from 14.8% to 3.5% while inflation surges to 9%.", era: "lrpc", label: "Long-Run Expectations Shifted", reason: "Inflation expectations unanchored after decades of stability — moving from the flat post-2008 era to a sharp SRPC movement as expectations shifted. The LRPC was tested: did the Fed act quickly enough to prevent a new higher-inflation equilibrium?" },
];

const ERA_OPTS = [
  { id: "srpc",   label: "Consistent with SRPC",        color: "bg-green-100 border-green-400 text-green-800" },
  { id: "breaks", label: "Breaks Simple SRPC",          color: "bg-red-100 border-red-400 text-red-800" },
  { id: "lrpc",   label: "Long-Run Expectations Shifted",color: "bg-purple-100 border-purple-400 text-purple-800" },
];

function PhillipsCurveStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = PHILLIPS_ERAS.every(e => answers[e.id]);
  const correctCount = checked ? PHILLIPS_ERAS.filter(e => answers[e.id] === e.era).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 4 — The Phillips Curve Through History</p>
        <p className="text-muted-foreground text-xs mb-2">Classify each historical episode. Does it move along the SRPC, break it, or reflect long-run expectation shifts?</p>
        <div className="space-y-1 text-xs">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1"><span className="font-semibold text-green-800">SRPC:</span><span className="text-green-700 ml-1">Lower unemployment ↔ higher inflation. Movement along a stable curve.</span></div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1"><span className="font-semibold text-red-800">Breaks SRPC:</span><span className="text-red-700 ml-1">Both high simultaneously (supply shock) or neither moves when expected.</span></div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1"><span className="font-semibold text-purple-800">LRPC:</span><span className="text-purple-700 ml-1">Inflation expectations shift — SRPC itself moves to new equilibrium.</span></div>
        </div>
      </div>
      <div className="space-y-3">
        {PHILLIPS_ERAS.map(era => {
          const ans = answers[era.id];
          const isCorrect = checked && ans === era.era;
          const isWrong = checked && ans && ans !== era.era;
          const optObj = ERA_OPTS.find(o => o.id === era.era);
          return (
            <div key={era.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{era.text}</p>
              {!checked ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-1.5">
                    {ERA_OPTS.slice(0, 2).map(o => (
                      <button key={o.id} onClick={() => setAnswers(a => ({ ...a, [era.id]: o.id }))}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === o.id ? `${o.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setAnswers(a => ({ ...a, [era.id]: ERA_OPTS[2].id }))}
                    className={`w-full py-1.5 rounded-lg border text-xs font-semibold transition ${ans === ERA_OPTS[2].id ? `${ERA_OPTS[2].color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                    {ERA_OPTS[2].label}
                  </button>
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{optObj?.label} — {era.reason}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {PHILLIPS_ERAS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, PHILLIPS_ERAS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Neoclassical Foundations & Synthesis
// ─────────────────────────────────────────────
const NEOCLASSICAL_QS = [
  {
    q: "The Neoclassical school says potential GDP (LRAS) is determined by four factors: K, H, T, and I. Your slides say 'these are the only ways an economy can grow richer in the LONG run.' What do K, H, T, and I stand for?",
    options: [
      "Physical Capital (machines/factories), Human Capital (education/skills), Technology (productivity), Institutions (rule of law, property rights, stable money)",
      "Keynesian policy, Housing investment, Trade balance, Interest rates",
      "Government spending (Krugman variable), Health expenditure, Tariffs, Immigration",
      "Capital controls, Housing starts, Tax rates, Infrastructure spending",
    ],
    correct: 0,
    exp: "K, H, T, I from your slides: Physical Capital (machines, factories, infrastructure — raises productivity per worker), Human Capital (education and skills — GI Bill sent 2M veterans to college → one of largest LRAS boosts in U.S. history), Technology (GPS, computers, AI — shifts LRAS right without needing more workers or capital), Institutions (property rights, contract enforcement, stable money, rule of law — enables long-horizon investment). These shift LRAS right permanently. No demand-side policy can substitute for them long-run.",
  },
  {
    q: "The Neoclassical school warns about 'crowding out.' Government borrows $500 billion to fund a stimulus package. What is the crowding-out mechanism and what does it imply about the stimulus's net effectiveness?",
    options: [
      "Crowding out means higher taxes crowd workers out of the labor force, reducing GDP",
      "Government borrowing competes for loanable funds → interest rates rise → private investment (I) falls → the net stimulus is less than the gross spending, potentially approaching zero in extreme cases",
      "Crowding out refers to government agencies taking market share from private firms in the same industry",
      "Crowding out only occurs when the government borrows from foreign investors — domestic borrowing has no crowding-out effect",
    ],
    correct: 1,
    exp: "Crowding out from your slides: Government borrowing → increased demand for loanable funds → interest rates rise → private investment becomes more expensive → I falls. The fiscal stimulus that was supposed to shift AD right is partly or fully offset by the private investment reduction. At low interest rates (Keynesian zone, zero lower bound), crowding out is small — government can borrow cheaply and the multiplier is large. Near full employment (Neoclassical zone), crowding out is larger — the stimulus mainly shifts who spends, not how much is spent. The 2009 ARRA at near-zero rates: minimal crowding out. The concern is larger in expansions.",
  },
  {
    q: "Your slides present the empirical verdict on the long-run self-correction debate: '2–5 years typical; both views capture something real.' What do the data actually show about recovery speed?",
    options: [
      "The data fully support the Neoclassical view — economies always recover in under 2 years without intervention",
      "The data fully support the Keynesian view — economies never self-correct without active government policy",
      "The empirical verdict is that neither school is correct — recoveries are purely random with no predictable pattern",
      "Recovery typically takes 2–5 years; deeper financial crises take longer; longer recessions → more Keynesian prescription; both schools capture real insights, and the policy mix matters for recovery speed",
    ],
    correct: 3,
    exp: "From your slides' empirical verdict: 2–5 years is typical for modern economies. Deeper financial crises → slower self-correction (2008–09 took 8–9 years for full recovery without complete intervention — supporting the Keynesian 'adjustment is dangerously slow' view). 1983–90 rapid recovery after Volcker with minimal intervention — supporting the Neoclassical 'self-correction is faster than Keynesians claim.' IMF research: fiscal multiplier is larger in recessions than in booms — consistent with both views. 'The argument is about TIME — how long the long run takes — not about whether markets eventually clear.'",
  },
  {
    q: "The Neoclassical toolkit includes 'rules over discretion' — the Fed's 2% inflation target is the primary modern example. Why do Neoclassicals prefer rules to discretionary policy?",
    options: [
      "Rules are preferred because they are simpler to implement and require less economic expertise from policymakers",
      "Credible rules anchor expectations, prevent wage-price spirals, remove policy uncertainty, and resist political pressure — discretionary policy is unpredictable and often poorly timed",
      "Rules over discretion means the Fed should never change interest rates — keeping rates fixed permanently",
      "Rules are preferred because they always produce better economic outcomes than active management in all economic conditions",
    ],
    correct: 1,
    exp: "Neoclassical rules rationale from your slides: (1) Credible rules anchor expectations — businesses and workers plan around 2% inflation, preventing wage-price spirals before they start. (2) Policy uncertainty reduced — firms can make long-horizon investment plans when monetary policy is predictable. (3) Removes political pressure — discretionary policy tempts governments to inflate before elections (time-inconsistency problem). (4) The Taylor Rule formalizes this: Fed should raise rates when inflation exceeds 2% or output exceeds potential. The Fed's 2% target is the modern synthesis of Neoclassical rules-based thinking.",
  },
];

function NeoclassicalStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = NEOCLASSICAL_QS[idx];
  const isLast = idx === NEOCLASSICAL_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Neoclassical Foundations & Modern Synthesis</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Four Neoclassical Pillars</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>① Vertical LRAS — potential GDP is the anchor</li>
              <li>② Flexible wages — markets self-correct</li>
              <li>③ Rational expectations — policy anticipated</li>
              <li>④ Crowding out — gov't borrowing → ↑ rates → ↓ I</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Grow Potential GDP: K, H, T, I</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>K — Physical capital (machines, infra)</li>
              <li>H — Human capital (education, skills)</li>
              <li>T — Technology (GPS, AI, internet)</li>
              <li>I — Institutions (rule of law, stable money)</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">"Neoclassical policy is rules-based and patient — build the foundation; let the building grow."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={NEOCLASSICAL_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Personal Finance: Verdict Cards
// ─────────────────────────────────────────────
const PF_CARDS_CH1213 = [
  {
    id: "keynesian",
    icon: "📉",
    title: "The Keynesian Recession Playbook",
    tag: "RECESSION",
    tagColor: "bg-blue-100 border-blue-400 text-blue-800",
    body: "When the FOMC cuts rates and Congress passes stimulus, recognize the Keynesian intervention signal.\n\nWhat happens next:\n• Rate cuts → existing bonds rise in value (prices move opposite to rates)\n• Cheap borrowing → historically low mortgage rates appear\n• Fiscal stimulus → AD will eventually recover → equities overshoot downward then recover\n• Markets typically overshoot on the downside — the best buying opportunities appear at peak pessimism\n\n2009 case: S&P 500 bottomed March 2009 — then tripled over the next decade. 30-year mortgage rates hit record lows. Those who recognized the Keynesian intervention signal and acted — bought homes, bought equities, locked in fixed debt — captured that recovery.\n\nCounterpoint: not every intervention succeeds, and timing the bottom is impossible. The lesson is positioning — not trading.",
    takeaway: "In recessions: lock in cheap fixed-rate debt, consider quality bonds (rate cuts boost prices), and resist panic-selling equities. Recessions end. Markets recover. The intervention signal tells you the direction.",
  },
  {
    id: "neoclassical",
    icon: "🏗️",
    title: "Build Your Own Potential GDP",
    tag: "LONG-TERM",
    tagColor: "bg-green-100 border-green-400 text-green-800",
    body: "The Neoclassical personal lesson: your long-run earning power = f(K, H, T, I).\n\nK — Physical Capital (Savings):\nBuilding savings is building your own capital stock. $1 saved and invested compounds for decades. At 7%: $10K → $160K in 40 years. Start early.\n\nH — Human Capital (Education & Skills):\n'Each additional year of schooling raises earnings ~10%.' Skills are permanently embedded — unlike physical capital, they don\'t depreciate. Tech literacy (staying current with AI tools) is the modern equivalent of the GI Bill.\n\nT — Technology (Tools & Processes):\nThe people who adapt to new technology capture its gains; those who resist get displaced. Your \'T\' is staying current with productive tools in your field.\n\nI — Institutions (Network, Habits, Systems):\nYour personal institutions: the network you\'ve built (who can vouch for you?), the routines that compound over time, the professional systems you\'ve created.",
    takeaway: "Don't just spend time — invest it. Every hour in education, skill-building, and network is K, H, T, I compounding in your personal production function.",
  },
  {
    id: "fedcycle",
    icon: "🧭",
    title: "Don't Fight the Fed or the Fiscal Cycle",
    tag: "STRATEGY",
    tagColor: "bg-amber-100 border-amber-400 text-amber-800",
    body: "Policy stance is your investment compass. Track three signals:\n1. Federal funds rate direction (rising or falling?)\n2. Federal deficit trajectory (expanding or contracting?)\n3. Output gap (above or below potential GDP?)\n\nExpansionary regime (2020–21):\nFed near zero + massive fiscal stimulus → cheap credit, rising asset prices, inflation eventually\nPosition: equities, real assets, fixed-rate debt (lock in low rates)\n\nContractionary regime (2022–23):\nFed 0.25%→5.25% + deficit reduction → rising discount rates, falling bond prices, equity headwinds\nPosition: short-duration bonds (adjust to new rates), cash optionality, defensive equities (staples, utilities)\n\n\'The Keynesian-Neoclassical academic debate is interesting. The real-time policy stance is your actual investment compass.\'",
    takeaway: "Read the moment. Align with policy direction. When both monetary and fiscal policy point the same way — pay attention. The 2020-21 and 2022-23 pivots rewarded those who recognized the regime change.",
  },
];

function PersonalFinanceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = PF_CARDS_CH1213.every(c => revealed.has(c.id));

  function toggle(id: string) {
    setRevealed(r => new Set([...r, id]));
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 6 — Personal Finance: Read the Moment</p>
        <p className="text-muted-foreground text-xs">"You don&apos;t have to pick a school — but you do have to read the moment." Open all three cards to complete the station.</p>
      </div>
      <div className="space-y-3">
        {PF_CARDS_CH1213.map(card => {
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
      <button disabled={!allRevealed} onClick={() => onComplete(PF_CARDS_CH1213.length, PF_CARDS_CH1213.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allRevealed ? "Mark Complete ✓" : `Open all cards to continue (${revealed.size}/${PF_CARDS_CH1213.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Keynesian Economics", back: "Short-run focused school holding that aggregate demand drives output and employment. Wages and prices are sticky, so demand shortfalls cause recessions. Recommends active government stabilization policy." },
  { front: "Neoclassical Economics", back: "Long-run focused school holding that wages and prices are flexible, markets self-correct, and potential GDP (LRAS) is the output anchor. Favors rules-based policy and supply-side reform over discretionary stimulus." },
  { front: "Sticky Wages and Prices", back: "The Keynesian idea that wages and prices adjust slowly downward in recessions, preventing rapid self-correction. Wages are sticky because of contracts, efficiency wages, morale, and adverse selection." },
  { front: "Expenditure Multiplier", back: "1 ÷ (1 − MPC). A $1 increase in government spending generates more than $1 in GDP because each round of spending becomes income for another person. MPC = 0.8 → multiplier = 5." },
  { front: "Marginal Propensity to Consume (MPC)", back: "The fraction of each additional dollar of income that a household spends (rather than saves). If MPC = 0.8, households spend 80¢ of every new dollar and save 20¢." },
  { front: "Animal Spirits", back: "Keynes' term for the psychological confidence and optimism driving business investment. Because confidence is volatile, investment (I) is the most unstable component of AD." },
  { front: "Crowding Out", back: "The neoclassical argument that government borrowing raises interest rates, reducing private investment. Fiscal stimulus is partly offset because higher government demand for loanable funds crowds out private borrowers." },
  { front: "Rational Expectations", back: "The neoclassical idea that people anticipate and adjust to predictable government policy before it takes effect, reducing the impact of discretionary stabilization policy." },
  { front: "Short-Run Phillips Curve (SRPC)", back: "Downward-sloping curve showing the short-run tradeoff between inflation and unemployment. Lower unemployment is associated with higher inflation as tight labor markets push up wages and prices." },
  { front: "Long-Run Phillips Curve (LRPC)", back: "Vertical line at the natural rate of unemployment. In the long run, inflation expectations adjust, eliminating any lasting tradeoff. Permanently pushing unemployment below the natural rate only accelerates inflation." },
  { front: "Natural Rate of Unemployment", back: "The unemployment rate consistent with stable inflation — equal to frictional + structural unemployment. The LRPC is vertical at this rate. For the U.S., approximately 4–5%." },
  { front: "Coordination Failure", back: "The Keynesian argument that wages are sticky because individual wage cuts are self-defeating — a firm that cuts wages alone loses its best workers. Government stimulus can restore demand without requiring coordinated wage cuts." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 12/13 Key Terms</p>
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
// Quiz pool — 15 questions, fresh scenarios, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "A policy debate erupts: one economist says 'cut interest rates and increase government spending — the economy needs a demand boost.' Another says 'let markets adjust — prices and wages will fall until equilibrium restores itself.' Which schools do these economists represent, and on what do they AGREE?", options: ["First = Neoclassical; Second = Keynesian. They agree on the short-run mechanism.", "Both are Keynesian — they just disagree on the mix of fiscal vs. monetary tools.", "First = Keynesian; Second = Neoclassical. They agree the economy will eventually return to potential GDP — they disagree on how long that takes and whether active policy is needed in the meantime.", "Both are Neoclassical — they just disagree on how flexible wages are in practice."], correct: 2, exp: "First economist = Keynesian (boost AD, countercyclical policy). Second = Neoclassical (self-correcting, let markets work). Both agree the economy will eventually reach potential GDP — the disagreement is about speed and the cost of waiting. Keynesian: adjustment is dangerously slow, human cost unacceptable. Neoclassical: intervention creates new problems (inflation, crowding out, distortions). Solow: both capture something real — empirical recovery takes 2–5 years typically." },
  { q: "A tech CEO says: 'We were planning a $500M expansion — new factory, 2,000 jobs. But last quarter's demand data was soft, consumer confidence fell, and our board got nervous. We shelved it.' This illustrates which Keynesian concept?", options: ["Animal spirits — investment decisions driven by confidence and expectations about future profits, not just current interest rates", "The multiplier — the $500M would have created far more than $500M in GDP", "Crowding out — government borrowing raised rates and made the factory expansion unprofitable", "Rational expectations — the board correctly anticipated a policy response and adjusted in advance"], correct: 0, exp: "Animal spirits: the board shelved a profitable investment not because interest rates changed or the math failed — but because confidence about future demand fell. This is precisely the Keynesian insight: investment (I) is driven by psychological expectations of future profit, not just cold expected-return calculations. When animal spirits collapse, investment falls regardless of current interest rates — even if rates are low. This is why the 2009 near-zero Fed funds rate didn't immediately revive investment: confidence was the missing ingredient." },
  { q: "An economy has MPC = 0.9. Congress passes a $200 billion infrastructure bill. Using the multiplier formula, what is the approximate total GDP impact?", options: ["$200 billion — the multiplier is 1 when MPC = 0.9", "$180 billion — only 90% of spending circulates", "$1,000 billion ($1 trillion) — multiplier = 1/(1−0.9) = 10, so $200B × 10 = $2T", "$2 trillion — multiplier = 1/(1−0.9) = 10, so $200B × 10 = $2T"], correct: 3, exp: "Multiplier = 1/(1−MPC) = 1/(1−0.9) = 1/0.1 = 10. GDP impact = $200B × 10 = $2 trillion. Each $200B of initial spending becomes $200B of income → households spend 90% ($180B) → that becomes income → 90% spent again → and so on. MPC=0.9 means a very high multiplier because almost all income gets spent rather than saved. Note: this is the theoretical maximum — crowding out, leakages to imports, and the SRAS zone all reduce the real-world multiplier below this." },
  { q: "Congress is debating two stimulus options: (A) $500B in direct payments to unemployed workers, or (B) $500B in tax cuts for households earning over $400,000. According to the multiplier framework, which has a larger GDP impact and why?", options: ["Option A — direct payments to unemployed workers (who have high MPC, spending nearly every dollar) produce a larger multiplier than tax cuts to high-income households (who have lower MPC, saving more of each dollar)", "Both have identical GDP impact — the total dollar amount is the same in both options", "Option B — tax cuts for wealthy households have a larger multiplier because wealthy people invest more", "Option B — reducing taxes on productive entrepreneurs creates supply-side incentives that raise LRAS"], correct: 0, exp: "From your slides: 'The multiplier is smaller for tax cuts. Wealthy households save more (lower MPC).' Unemployed workers have high MPC — they spend nearly every dollar of relief immediately (food, rent, bills). High-income households have lower MPC — they save or invest much of the tax cut. The multiplier is higher when money flows immediately into spending. Option A also has a direct spending advantage: the full $500B enters the economy in round 1, while Option B's tax cut first reduces household tax liability with a saving leakage before any spending begins." },
  { q: "It's 1966. U.S. unemployment is 3.8% and inflation is rising from 1.5% to 3.5%. An economist draws a downward-sloping curve showing this inflation-unemployment tradeoff. What is this curve and what does its shape imply for policy?", options: ["Long-Run Phillips Curve — its shape implies there is no lasting tradeoff; policymakers should not try to exploit it", "Aggregate Demand curve — its shape shows that higher inflation reduces spending, lowering unemployment", "Laffer Curve — its shape shows the relationship between tax rates and government revenue", "Short-Run Phillips Curve — its downward slope implies policymakers face a temporary tradeoff: they can accept higher inflation to achieve lower unemployment, or vice versa, by shifting AD"], correct: 3, exp: "Short-Run Phillips Curve (1966 context): downward sloping tradeoff between inflation and unemployment. The 1960s consensus: policymakers could 'exploit' this — boost AD to lower unemployment at the cost of more inflation, or tighten to reduce inflation at the cost of more unemployment. The curve held remarkably well through the late 1960s. BUT: Friedman and Phelps warned in 1968 that once expectations adapt, the curve shifts up — the tradeoff is temporary, not permanent. 1973 stagflation proved them right: the SRPC shifted outward when oil shocked SRAS, producing both high inflation AND high unemployment." },
  { q: "In 1975, U.S. unemployment was 8.5% AND CPI inflation exceeded 12%. A simple Keynesian policymaker following the 1960s Phillips Curve framework would be confused. Why?", options: ["The policymaker expected low unemployment to accompany high inflation — but 1975 showed high unemployment AND high inflation, which the simple SRPC said was impossible", "The policymaker expected the Fed to solve the problem automatically through interest rate adjustments", "The 1960s Phillips Curve predicted stagflation would occur — the policymaker was not confused, just surprised by the magnitude", "High inflation and high unemployment can coexist in the short run according to the simple Keynesian model"], correct: 0, exp: "Simple Keynesian SRPC: you can have high inflation or high unemployment — but not both simultaneously. Moving along the SRPC: lower unemployment ↔ higher inflation. Stagflation (both high) is off the curve. In 1975, the OPEC oil shock shifted SRAS left → a new, worse SRPC appeared where every inflation-unemployment combination was worse. The simple 1960s model had no explanation for this. 'Stagflation — simple Keynesian theory had no explanation.' Friedman/Phelps' expectations-augmented model did predict it: supply shocks shift the curve outward." },
  { q: "Friedman and Phelps predicted in 1968 — before the 1970s inflation — that the Short-Run Phillips Curve tradeoff was not permanent. What was their key insight?", options: ["They argued that workers and firms eventually adapt their inflation expectations — once they do, the SRPC shifts up and the short-run tradeoff disappears, making the Long-Run Phillips Curve vertical at the natural rate", "They predicted that supply shocks like oil embargoes would always disrupt the Phillips Curve relationship", "They predicted that monetary policy would become more effective over time, permanently reducing the natural rate of unemployment", "They argued that the Phillips Curve was always a statistical illusion with no real economic mechanism"], correct: 0, exp: "Friedman/Phelps expectations-augmented Phillips Curve: Workers negotiate wages based on expected inflation. If government keeps unemployment below NRU through stimulus, labor markets tighten → wages get bid up → firms realize real wages haven't fallen → SRPC shifts up → now need even more inflation to hold unemployment below NRU → ever-accelerating inflation. LRPC is vertical at NRU: 'You can buy lower unemployment with inflation — once. Then expectations adjust and the bargain disappears.' This won Friedman the Nobel in 1976 and became the foundation for modern inflation targeting." },
  { q: "The U.S. government borrows $1 trillion to fund a stimulus package during an expansion when unemployment is already at 4%. A Neoclassical economist argues the stimulus will have limited real impact. What is the mechanism?", options: ["Crowding out — government borrowing competes for loanable funds, raises interest rates, and private investment falls, partially or fully offsetting the stimulus's AD boost", "Rational expectations — households will save every dollar of stimulus anticipating future tax increases, making fiscal policy completely ineffective", "Automatic stabilizers — the existing tax system will automatically offset any government spending through reduced revenue", "The multiplier is negative during expansions — government spending reduces GDP when unemployment is already low"], correct: 0, exp: "Crowding out from your slides: Government borrows $1T → increased demand for loanable funds → interest rates rise → private investment (I) becomes more expensive → I falls. The fiscal stimulus is partly or fully offset by reduced private capital formation. Near full employment (4% unemployment, Neoclassical zone of SRAS), the economy has little idle capacity: stimulus mostly shifts who spends rather than how much is spent, and crowding out is larger. Compare: 2009 stimulus at near-zero rates had minimal crowding out (Keynesian zone); 2021 stimulus at low rates with tight labor market had more inflationary impact." },
  { q: "What does the K, H, T, I framework identify as the 'biggest lever' for long-run economic growth, and why?", options: ["K — Physical capital, because factories and machines are the most visible form of productive investment", "T — Technology, because it shifts LRAS right without requiring more workers or capital — pure productivity gains that compound through knowledge spillovers across the entire economy", "H — Human capital, because education has the most predictable return at ~10% per year of schooling", "I — Institutions, because property rights and rule of law are the preconditions for all other investment"], correct: 1, exp: "From your slides: Technology is 'the biggest lever' — it shifts LRAS right without needing more workers or capital. GPS, computers, internet, and AI each created permanent productivity gains that rippled across every industry. R&D generates knowledge spillovers: one firm's innovation reduces costs for others. Total Factor Productivity (TFP) captures this residual — what can't be explained by more K or H must be A (technology/ideas). U.S. TFP growth 1996–2004: the IT boom raised potential GDP by ~0.5–1% per year above pre-trend. This is also why McCloskey's Bourgeois Deal centers on innovation: technology is the wellspring of long-run prosperity." },
  { q: "Your slides identify the 1990s U.S. economic performance as a 'Neoclassical moment.' Unemployment fell to 4%, inflation stayed low, and a budget surplus emerged. What combination of policies produced this outcome?", options: ["Massive Keynesian fiscal stimulus — tax cuts and infrastructure spending closed the output gap from the early 1990s recession", "Deficit reduction (balanced budget) + deregulation + NAFTA trade liberalization → productivity boom + low inflation + budget surplus — supply-side structural reform with Neoclassical foundations", "Federal Reserve money printing funded the expansion — monetary expansion is the primary driver of long-run growth", "The 1990s boom was driven entirely by the dot-com bubble — there was no policy component"], correct: 1, exp: "1990s Neoclassical moment from your slides: Deficit reduction under Clinton (shifting from deficits to surplus) + deregulation + NAFTA (trade liberalization) → productivity boom in the late 1990s (IT revolution raised TFP) + 4% unemployment + low inflation + budget surplus. This is the Neoclassical prescription working: structural supply-side reform, fiscal discipline, and market liberalization raised potential GDP permanently rather than just closing a recessionary gap. Compare with 2009 ARRA (Keynesian moment — demand collapsed, needed direct stimulus) vs. 1990s (near potential, needed structural reform)." },
  { q: "A student argues: 'Keynesian economics is for recessions and Neoclassical economics is for normal times — they never apply at the same time.' Your slides suggest this is an oversimplification. Why?", options: ["The student is correct — the two schools are mutually exclusive by design and apply at strictly different times", "Keynesian economics applies only when unemployment is above 8%; below 8%, only Neoclassical applies", "The two schools are identical in practice — the debate is purely academic", "In practice, all economies blend both simultaneously: the Fed pursues price stability (Neoclassical rules) while also using countercyclical rate adjustments (Keynesian tool) — the 2008–09 response combined Keynesian fiscal stimulus with Neoclassical supply-side reforms like TARP bank stabilization"], correct: 3, exp: "Your slides' synthesis: 'Good policy borrows from both.' Modern central banks simultaneously: (1) Pursue rules-based inflation targeting — Neoclassical (anchor expectations, prevent wage-price spirals). (2) Adjust rates countercyclically — Keynesian (cut in recessions, raise in expansions). The Fed's dual mandate literally requires both. 2008–09: Keynesian fiscal stimulus (ARRA $800B) + Neoclassical bank reform (TARP stabilization). Even structural supply-side reforms happen during expansions while Keynesian automatic stabilizers remain in place. Solow: at any given time, both are partly operating — the weight shifts with the time horizon and the economic condition." },
  { q: "An investor hears the Fed announce it is raising rates from 2% to 4.5% over 12 months. According to your slides' 'Don't fight the Fed' principle, which asset class would be LEAST attractive during this period?", options: ["Short-duration Treasury bills — they reprice quickly as rates rise and maintain purchasing power", "Long-duration government bonds — when rates rise, long bond prices fall sharply because their fixed coupons are discounted at the new, higher rate", "Cash and money market funds — rising rates increase their yield", "Energy stocks — tighter policy tends to reduce borrowing costs for oil companies"], correct: 1, exp: "Your slides: 'When both monetary and fiscal policy turn contractionary, be defensive.' Rising rates → long-duration bond prices fall (inverse relationship: price = present value of fixed coupons discounted at the new, higher rate — the longer the duration, the larger the price decline). A 30-year Treasury with a 2% coupon becomes deeply unattractive when new bonds yield 4.5%. Short-duration bills reprice quickly to new yields. Cash and money market funds benefit directly from higher short-term rates. Energy stocks aren't directly related to rate duration. 'Track the federal funds rate to anticipate the regime.'" },
  { q: "Your slides describe the Great Depression self-correction debate. It took 8+ years (1929–1937) without full recovery. Which view does this support and what does it imply?", options: ["Neoclassical view — 8 years is fast for a self-correction, confirming markets work efficiently", "Neither view — the Great Depression was caused by policy errors (Smoot-Hawley tariff) not market failure, so it doesn't test either theory", "Keynesian view — 8+ years of adjustment is 'dangerously slow': unemployed workers lose skills, firms lose capacity, scarred workers exit the labor force permanently — active policy was needed to shorten the adjustment", "The empirical verdict is neutral — 8 years is within the 2–5 year range your slides describe as typical"], correct: 2, exp: "Keynesian view: 'Adjustment is dangerously slow — unemployed workers lose skills; firms lose capacity; scarred workers may exit the labor force permanently.' The Great Depression took 8+ years even WITH New Deal intervention. Without intervention, deflation (prices falling → debt burdens rising → less spending → more deflation) threatened an even longer spiral. Hysteresis: workers unemployed 3+ years lose skills and employer contacts → permanently reduced LRAS even after recovery. 'In the long run we are all dead' — Keynes. This supports the Keynesian prescription that active policy to shorten severe recessions is worthwhile to prevent permanent structural damage." },
  { q: "The Fed's 2% inflation target exemplifies the Neoclassical 'rules over discretion' principle. What would a Keynesian critique of this rigid target be?", options: ["Keynesians would argue the 2% target is too high — they prefer zero inflation for maximum purchasing power", "Keynesians might argue that rigid rules prevent the active demand management needed to close recessionary gaps quickly — sometimes accepting 3–4% inflation temporarily is worth closing a large output gap faster and preventing hysteresis", "Keynesians fully endorse inflation targeting — there is no Keynesian critique of the 2% target", "Keynesians argue rules only work in developed economies — developing countries need discretionary policy"], correct: 1, exp: "The Keynesian critique of rigid rules: in a severe recession (unemployment 10%, output gap $2T), mechanically targeting 2% inflation might prevent the Fed from pursuing enough stimulus to close the gap quickly. Accepting temporarily higher inflation (3–4%) to restore full employment faster could reduce the cumulative economic harm (hysteresis, lost skills, reduced LRAS). The countercyclical instinct says 'lean against the wind' — which requires discretion, not rigid rules. Modern synthesis: the Fed does target 2% (Neoclassical rule) but also allows 'average inflation targeting' (AIT) — tolerating some overshoot after undershoots — a compromise that adds some Keynesian flexibility to the Neoclassical framework." },
  { q: "Apply the K, H, T, I framework to a personal career decision. A 28-year-old engineer is deciding between: (A) taking 2 years off to get a master's degree in AI, or (B) staying in her current job for 2 more years and investing her salary in index funds. Using the Neoclassical framework, what does K, H, T, I analysis suggest?", options: ["Option A — human capital (H) investment: skills are permanently embedded, compound over 30+ years of career, generate ~10% earnings premium per year of schooling, and AI skills specifically represent the Technology (T) frontier where demand is growing rapidly", "Option B — physical capital (index fund investment, which is K) always dominates human capital investment (H) in present-value terms", "Both are equivalent — K and H investments have identical long-run returns", "Option B — current job experience provides more human capital than a degree"], correct: 0, exp: "K, H, T, I applied personally: Option A invests in H (human capital) and T (technology frontier). Your slides: 'Skills are permanently embedded; compound over careers. Each additional year of schooling raises earnings ~10%.' An AI master's degree represents H + T simultaneously — skills at the technology frontier where demand is growing. Compare: index funds (K — financial capital) return historically 7–10%/yr but plateau; AI skills may appreciate over a career as the technology diffuses. The Neoclassical lesson: 'Long-run prosperity comes from K, H, T, I — personal capital, human capital, tech literacy, and the institutions you build.' The degree likely has higher NPV over a 30-year career." },
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
    setResults(r => [...r, { correct: sel === q.correct, exp: q.exp }]);
    setChecked(true);
  }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  function handleFinish() {
    const score = results.filter(r => r.correct).length;
    if (score >= 9) onPass(score, results);
    else onFail();
  }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground">Chapters 12 &amp; 13 Quiz</p>
        <p className="text-muted-foreground text-xs">10 questions — score 9 or higher to pass.</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of 10</p>
          <span className="text-xs text-muted-foreground">{results.filter(r => r.correct).length} correct</span>
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

const STATION_LABELS_CH1213: Record<string, string> = {
  twolenses:      "Two Lenses",
  advolatility:   "AD Components & Volatility",
  multiplier:     "The Multiplier",
  phillipscurve:  "The Phillips Curve",
  neoclassical:   "Neoclassical Foundations",
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
  const stationRows = Object.entries(STATION_LABELS_CH1213).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch12/13 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapters 12 &amp; 13 — Keynesian &amp; Neoclassical Perspectives</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapters 12 & 13 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapters 12 &amp; 13 — Keynesian &amp; Neoclassical Perspectives</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: A recession hits. A Keynesian and Neoclassical economist both agree the economy will eventually recover. What do they disagree about, and what does the empirical evidence suggest?</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e=>setExitTicket(e.target.value)} rows={3} placeholder="Your response..." className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"/></div>
      </div>
      {stationRows.length>0&&(<div className="bg-card border border-border rounded-xl p-4"><p className="text-sm font-semibold text-foreground mb-3">Station Scores</p><div className="space-y-2">{stationRows.map(r=>(<div key={r.label} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{r.label}</span><span className={`font-bold ${r.score===r.total?"text-green-700":r.score>=r.total*0.7?"text-amber-700":"text-red-600"}`}>{r.score}/{r.total}</span></div>))}</div></div>)}
      <div className="space-y-2"><p className="text-sm font-semibold text-foreground">Quiz Question Review</p>{results.map((r,i)=>(<div key={i} className={`rounded-xl border p-3 ${r.correct?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}><p className="text-xs font-semibold">{r.correct?"✓ Correct":"✗ Incorrect"} — Question {i+1}</p><p className="text-xs text-muted-foreground mt-0.5">{r.exp}</p></div>))}</div>
      <div className="flex gap-3"><button type="button" onClick={onRestart} className="flex-1 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button></div>
      <button type="button" onClick={printPDF} disabled={!name.trim()} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
    </div>
  );
}

const STATIONS = [
  { id: "twolenses"      as Station, label: "Two Lenses",                desc: "Keynesian vs. Neoclassical comparison, Solow synthesis, animal spirits", icon: "🔭" },
  { id: "advolatility"   as Station, label: "AD Components & Volatility",desc: "Why investment is most volatile, animal spirits, coordination failure, Keynesian zone", icon: "📉" },
  { id: "multiplier"     as Station, label: "The Multiplier",            desc: "Formula 1/(1−MPC), worked calculation, works in reverse, tax cuts vs. direct spending", icon: "✖️" },
  { id: "phillipscurve"  as Station, label: "The Phillips Curve",        desc: "SRPC tradeoff, supply shocks shift the curve, LRPC vertical, Friedman/Phelps, FRED data", icon: "📊" },
  { id: "neoclassical"   as Station, label: "Neoclassical Foundations",  desc: "K,H,T,I levers, crowding out, rational expectations, rules over discretion, synthesis", icon: "🏛️" },
  { id: "personalfinance"as Station, label: "Personal Finance",          desc: "Read the policy moment, build your own K,H,T,I, don't fight the Fed", icon: "💼" },
  { id: "flash"          as Station, label: "Flashcard Review",          desc: "Master all 12 key Ch12/13 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",          label: "Dashboard" },
  { id: "twolenses",      label: "Two Lenses" },
  { id: "advolatility",   label: "AD & Volatility" },
  { id: "multiplier",     label: "Multiplier" },
  { id: "phillipscurve",  label: "Phillips Curve" },
  { id: "neoclassical",   label: "Neoclassical" },
  { id: "personalfinance",label: "Personal Finance" },
  { id: "flash",          label: "Flashcards" },
  { id: "quiz",           label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","twolenses","advolatility","multiplier","phillipscurve","neoclassical","personalfinance","flash","quiz","results","not-yet"];

const CH1213_SUMMARY = [
  { heading: "12.1 Aggregate Demand in Keynesian Analysis", body: "Aggregate demand is the sum of four components: consumption, investment, government spending, and net exports. Consumption will change for a number of reasons, including movements in income, taxes, expectations about future income, and changes in wealth levels. Investment will change in response to its expected profitability, which in turn is shaped by expectations about future economic growth, the creation of new technologies, the price of key inputs, and tax incentives for investment. Investment will also change when interest rates rise or fall. Political considerations determine government spending and taxes. Exports and imports change according to relative growth rates and prices between two economies." },
  { heading: "12.2 The Building Blocks of Keynesian Analysis", body: "Keynesian economics is based on two main ideas: (1) aggregate demand is more likely than aggregate supply to be the primary cause of a short-run economic event like a recession; (2) wages and prices can be sticky, and so, in an economic downturn, unemployment can result. The latter is an example of a macroeconomic externality. While surpluses cause prices to fall at the micro level, they do not necessarily at the macro level. Instead the adjustment to a decrease in demand occurs only through decreased quantities. One reason why prices may be sticky is menu costs, the costs of changing prices. These include internal costs a business faces in changing prices in terms of labeling, recordkeeping, and accounting, and also the costs of communicating the price change to (possibly unhappy) customers. Keynesians also believe in the existence of the expenditure multiplier—the notion that a change in autonomous expenditure causes a more than proportionate change in GDP." },
  { heading: "12.3 The Phillips Curve", body: "A Phillips curve shows the tradeoff between unemployment and inflation in an economy. From a Keynesian viewpoint, the Phillips curve should slope down so that higher unemployment means lower inflation, and vice versa. However, a downward-sloping Phillips curve is a short-term relationship that may shift after a few years. Keynesian macroeconomics argues that the solution to a recession is expansionary fiscal policy, such as tax cuts to stimulate consumption and investment, or direct increases in government spending that would shift the aggregate demand curve to the right. The other side of Keynesian policy occurs when the economy is operating above potential GDP. In this situation, unemployment is low, but inflationary rises in the price level are a concern. The Keynesian response would be contractionary fiscal policy, using tax increases or government spending cuts to shift AD to the left." },
  { heading: "12.4 The Keynesian Perspective on Market Forces", body: "The Keynesian prescription for stabilizing the economy implies government intervention at the macroeconomic level—increasing aggregate demand when private demand falls and decreasing aggregate demand when private demand rises. This does not imply that the government should be passing laws or regulations that set prices and quantities in microeconomic markets." },
  { heading: "13.1 The Building Blocks of Neoclassical Analysis", body: "The neoclassical perspective argues that, in the long run, the economy will adjust back to its potential GDP level of output through flexible price levels. Thus, the neoclassical perspective views the long-run AS curve as vertical. A rational expectations perspective argues that people have excellent information about economic events and how the economy works and that, as a result, price and other economic adjustments will happen very quickly. In adaptive expectations theory, people have limited information about economic information and how the economy works, and so price and other economic adjustments can be slow." },
  { heading: "13.2 The Policy Implications of the Neoclassical Perspective", body: "Neoclassical economists tend to put relatively more emphasis on long-term growth than on fighting recession, because they believe that recessions will fade in a few years and long-term growth will ultimately determine the standard of living. They tend to focus more on reducing the natural rate of unemployment caused by economic institutions and government policies than the cyclical unemployment caused by recession. Neoclassical economists also see no social benefit to inflation. With an upward-sloping Keynesian AS curve, inflation can arise because an economy is approaching full employment. With a vertical long-run neoclassical AS curve, inflation does not accompany any rise in output. If aggregate supply is vertical, then aggregate demand does not affect the quantity of output. Instead, aggregate demand can only cause inflationary changes in the price level. A vertical aggregate supply curve, where the quantity of output is consistent with many different price levels, also implies a vertical Phillips curve." },
  { heading: "13.3 Balancing Keynesian and Neoclassical Models", body: "The Keynesian perspective considers changes to aggregate demand to be the cause of business cycle fluctuations. Keynesians are likely to advocate that policy makers actively attempt to reverse recessionary and inflationary periods because they are not convinced that the self-correcting economy can easily return to full employment. The neoclassical perspective places more emphasis on aggregate supply. Neoclassical economists believe that long term productivity growth determines the potential GDP level and that the economy typically will return to full employment after a change in aggregate demand. Skeptical of the effectiveness and timeliness of Keynesian policy, neoclassical economists are more likely to advocate a hands-off, or fairly limited, role for active stabilization policy. While Keynesians would tend to advocate an acceptable tradeoff between inflation and unemployment when counteracting a recession, neoclassical economists argue that no such tradeoff exists. Any short-term gains in lower unemployment will eventually vanish and the result of active policy will only be inflation." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapters 12 &amp; 13 — Keynesian &amp; Neoclassical Perspectives</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH1213_SUMMARY.map((s,i) => (
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

function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapters 12 &amp; 13 — Keynesian &amp; Neoclassical Perspectives</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={STATIONS.length} style={{ width: `${(progress/STATIONS.length)*100}%` }} /></div>
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
              className={`rounded-xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${done?"border-green-400 bg-green-50":"border-border bg-card hover:border-primary/40"}`}>
              <span className="text-lg">{done?"✅":s.icon}</span>
              <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onStartQuiz} disabled={!quizUnlocked}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${quizUnlocked?"bg-primary hover:opacity-90 text-primary-foreground":"bg-muted text-muted-foreground opacity-50 cursor-not-allowed"}`}>
        {quizUnlocked?"🎯 Take the Quiz":"🔒 Complete all stations to unlock the Quiz"}
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
        <a href={hubUrl} target="_self" className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">← Course Hub</a>
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {NAV_STATIONS.map(s => {
            const done = completed.has(s.id);
            const active = s.id === station || (station==="not-yet"&&s.id==="quiz") || (station==="results"&&s.id==="quiz");
            if (s.id==="quiz"&&!allStationsDone) return <span key={s.id} title="Complete all stations first" className="px-3 py-1.5 rounded-full text-xs font-medium text-sidebar-foreground/35 cursor-not-allowed select-none">🔒 Quiz</span>;
            return (
              <button key={s.id} onClick={() => onNav(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active?"bg-primary text-primary-foreground":done?"bg-sidebar-accent text-sidebar-foreground/90":"text-sidebar-foreground/75 hover:text-white"}`}>
                {done&&!active?"✓ ":""}{s.label}
              </button>
            );
          })}
        </div>
        <div className="sm:hidden text-sm font-medium text-sidebar-foreground/80">{currentIdx+1} / {NAV_STATIONS.length}</div>
      </div>
    </header>
    </>
  );
}

export default function EconLab({ courseTitle, courseSubtitle, hubUrl }: { courseTitle: string; courseSubtitle: string; hubUrl: string }) {
  const [station, setStation] = useState<Station>("intro");
  const [completed, setCompleted] = useState<Set<Station>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]") as Station[]); } catch { return new Set(); }
  });
  const [showSummary, setShowSummary] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correct: boolean; exp: string }[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});

  function markDone(s: Station, score?: number, total?: number) {
    const next = new Set(completed);
    next.add(s);
    setCompleted(next);
    if (score!==undefined&&total!==undefined) setSectionScores(prev=>({...prev,[s]:{score,total}}));
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify([...next])); } catch {}
    setStation("intro");
  }

  const quizUnlocked = STATIONS.every(s => completed.has(s.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
      <Header station={station} completed={completed} onNav={setStation} courseTitle={courseTitle} courseSubtitle={courseSubtitle} hubUrl={hubUrl} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {station==="intro"          && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="twolenses"      && <TwoLensesStation      onComplete={(sc,t)=>markDone("twolenses",      sc,t)} />}
        {station==="advolatility"   && <AdVolatilityStation   onComplete={(sc,t)=>markDone("advolatility",   sc,t)} />}
        {station==="multiplier"     && <MultiplierStation     onComplete={(sc,t)=>markDone("multiplier",     sc,t)} />}
        {station==="phillipscurve"  && <PhillipsCurveStation  onComplete={(sc,t)=>markDone("phillipscurve",  sc,t)} />}
        {station==="neoclassical"   && <NeoclassicalStation   onComplete={(sc,t)=>markDone("neoclassical",   sc,t)} />}
        {station==="personalfinance"&& <PersonalFinanceStation onComplete={(sc,t)=>markDone("personalfinance",sc,t)} />}
        {station==="flash"          && <FlashcardStation      onComplete={(sc,t)=>markDone("flash",          sc,t)} />}
        {station==="quiz" && (
          <QuizStation
            onPass={(score,results)=>{setQuizScore(score);setQuizResults(results);markDone("quiz",score,10);setStation("results");}}
            onFail={()=>setStation("not-yet")}
          />
        )}
        {station==="not-yet"  && <NotYetScreen onRetry={()=>setStation("quiz")} />}
        {station==="results"  && <ResultsScreen score={quizScore} results={quizResults} sectionScores={sectionScores} onRestart={()=>setStation("intro")} courseTitle={courseTitle} />}
      </main>
    </div>
  );
}
