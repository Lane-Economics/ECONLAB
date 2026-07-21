import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "whatisit"
  | "basket"
  | "biases"
  | "history"
  | "matters"
  | "indexing"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch9";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
// Station 1 — What Is Inflation? Classifier
// ─────────────────────────────────────────────
const INFLATION_SCENARIOS = [
  { id: 1, text: "The overall price level rises 4% this year — groceries, rent, gas, and clothing all cost more across the economy.", category: "inflation", label: "Inflation", reason: "General (economy-wide) AND ongoing — the whole price level rose. This is the textbook definition: all boats rising with the tide." },
  { id: 2, text: "College tuition rises 8% while laptop prices fall 15% — two prices moving in opposite directions.", category: "relative", label: "Relative Price Change", reason: "Some prices rise, others fall. The overall price level may not have changed at all. Relative price changes are signals from supply and demand, not inflation." },
  { id: 3, text: "After Hurricane Katrina, gas prices spike 40¢/gallon for two weeks, then return to normal.", category: "shock", label: "One-Time Shock", reason: "Temporary supply disruption — prices spiked then reversed. Not ongoing. Core CPI barely moved. The Fed correctly held rates steady." },
  { id: 4, text: "For five consecutive years, the CPI rises 3–4% annually as wages, rents, and food prices all trend higher.", category: "inflation", label: "Inflation", reason: "General (economy-wide) AND ongoing (five consecutive years). Persistent, broad-based price level increases = inflation." },
  { id: 5, text: "Austin apartment rents rose 18% last year while national rents rose only 3% on average.", category: "relative", label: "Relative Price Change", reason: "One city's rents rising faster than the national average is a relative price change — local supply/demand at work. National inflation is 3%, not 18%." },
  { id: 6, text: "A semiconductor shortage causes used car prices to surge 30% for eight months. Prices then fall as chip supply normalizes.", category: "shock", label: "One-Time Shock", reason: "Supply disruption (chip shortage) caused a temporary spike that reversed when supply normalized. Not a general, ongoing rise in the price level." },
];

const INFLATION_CATS = [
  { id: "inflation", label: "Inflation",            color: "bg-red-100 border-red-400 text-red-800",    desc: "General AND ongoing rise" },
  { id: "relative",  label: "Relative Price Change",color: "bg-blue-100 border-blue-400 text-blue-800",  desc: "One sector vs. another" },
  { id: "shock",     label: "One-Time Shock",       color: "bg-amber-100 border-amber-400 text-amber-800",desc: "Temporary disruption" },
];

function WhatIsItStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = INFLATION_SCENARIOS.every(s => answers[s.id]);
  const correctCount = checked ? INFLATION_SCENARIOS.filter(s => answers[s.id] === s.category).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — What Is Inflation? (and What Isn&apos;t)</p>
        <p className="text-muted-foreground text-xs mb-2">Inflation requires TWO conditions: <strong className="text-foreground">general</strong> (economy-wide) AND <strong className="text-foreground">ongoing</strong> (persistent trend). Classify each scenario.</p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {INFLATION_CATS.map(c => (
            <div key={c.id} className={`px-2 py-1 rounded-lg border font-semibold text-center ${c.color}`}>
              <div>{c.label}</div>
              <div className="font-normal opacity-80 text-xs">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {INFLATION_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.category;
          const isWrong = checked && ans && ans !== s.category;
          const catObj = INFLATION_CATS.find(c => c.id === s.category);
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{s.text}</p>
              {!checked ? (
                <div className="flex gap-1.5">
                  {INFLATION_CATS.map(c => (
                    <button key={c.id} onClick={() => setAnswers(a => ({ ...a, [s.id]: c.id }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === c.id ? `${c.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{catObj?.label} — {s.reason}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {INFLATION_SCENARIOS.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, INFLATION_SCENARIOS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — The Basket & CPI
// ─────────────────────────────────────────────
const BASKET_QS = [
  {
    q: "The BLS builds the CPI basket from a Consumer Expenditure Survey of ~7,000 households. Housing gets the largest weight at 42%. Why do weights matter for measuring inflation?",
    options: [
      "Weights ensure that every product in the basket is counted equally, regardless of how often consumers buy it",
      "Weights are set by Congress to reflect political priorities rather than actual spending patterns",
      "Weights only matter for the PPI — the CPI treats all items equally since it measures consumer prices",
      "Weights reflect actual spending shares — a 5% rent increase matters far more than a 50% sock increase because rent is ~30% of budgets while socks are less than 0.1%",
    ],
    correct: 3,
    exp: "Weights = actual quantities/spending shares consumers use. The grocery receipt analogy: saffron triples in price but you buy one jar a year — barely affects your budget. Chicken rises 20% and you buy it weekly — you feel it immediately. Weighted averages reflect real spending impact, not just the count of price changes. Housing (42%) dominates because it dominates real budgets.",
  },
  {
    q: "Using your slides' 3-item basket: Coffee (12 cups/yr), T-shirt (2/yr), Gasoline (10 gal/yr). Year 1 prices: Coffee $2.50, T-shirt $18.00, Gas $3.20. Year 2 prices: Coffee $2.75, T-shirt $19.50, Gas $3.30. What is the inflation rate?",
    options: [
      "About 3.6% — average of the three individual price increases",
      "About 5.0% — unweighted sum of price changes divided by 3 items",
      "About 7.1% — (Year 2 basket cost − Year 1 basket cost) ÷ Year 1 basket cost × 100",
      "About 9.4% — sum of all price increases across all three items",
    ],
    correct: 2,
    exp: "Year 1 basket: (12×$2.50) + (2×$18.00) + (10×$3.20) = $30 + $36 + $32 = $98.00. Year 2 basket: (12×$2.75) + (2×$19.50) + (10×$3.30) = $33 + $39 + $33 = $105.00. Inflation = (105 − 98) / 98 × 100 = 7/98 × 100 ≈ 7.14%. The key: use the SAME quantities (fixed basket) at each year's prices — that isolates the price change from any quantity change.",
  },
  {
    q: "The CPI is set to 100 for the base period 1982–84. In June 2024 the CPI was 313.1; in June 2025 it was 321.5. What does this tell you?",
    options: [
      "The annual inflation rate from June 2024 to June 2025 was approximately 2.68%",
      "Prices in June 2025 were 321.5% higher than in June 2024",
      "The price level in June 2025 was 321.5 times higher than in the base period",
      "Prices fell between June 2024 and June 2025 because the index number decreased",
    ],
    correct: 0,
    exp: "Inflation rate = (321.5 − 313.1) / 313.1 × 100 = 8.4 / 313.1 × 100 ≈ 2.68%. The index itself (321.5) means prices are 221.5% higher than the 1982–84 base — a 1982 dollar buys what 32¢ buys today. But year-over-year inflation is the % change in the index, not the index level. The index went UP (321.5 > 313.1), so prices rose — not fell.",
  },
  {
    q: "Your slides list PPI, GDP Deflator, and ECI as alternatives to the CPI. What is the key difference between the CPI and the GDP Deflator?",
    options: [
      "The CPI is published monthly; the GDP Deflator is published annually",
      "The CPI measures producer input costs; the GDP Deflator measures consumer prices",
      "The CPI is more accurate than the GDP Deflator because it surveys more products",
      "The CPI uses a fixed basket of consumer goods; the GDP Deflator covers all GDP components and is not limited to a fixed basket",
    ],
    correct: 3,
    exp: "CPI = fixed basket of ~80,000 consumer goods, weighted by consumer spending shares. GDP Deflator = all goods and services in GDP — not just consumer goods, and not a fixed basket. It adjusts as the composition of GDP changes. The Fed often prefers the PCE (Personal Consumption Expenditures) deflator, which is similar to the GDP Deflator but covers consumer spending more broadly than the CPI.",
  },
];

function BasketStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = BASKET_QS[idx];
  const isLast = idx === BASKET_QS.length - 1;
  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">The Basket & CPI — Key Numbers</p>
        <div className="grid grid-cols-4 gap-1.5 text-xs text-center mb-2">
          {[["~80,000","Products tracked"],["200+","Categories"],["23,000","Stores surveyed"],["87","Urban areas"]].map(([val,label]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-1.5">
              <p className="font-bold text-primary">{val}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-background border border-border rounded-lg p-2 text-xs">
          <p className="font-semibold text-foreground mb-1">Basket weights (spending shares)</p>
          <p className="text-muted-foreground">Housing 42% · Transport 15% · Food/Bev 15% · Medical 9% · Education 7% · Recreation 6% · Apparel 3%</p>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Formula: Inflation Rate = [(New − Old) / Old] × 100 · Base period: 1982–84 = 100</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={BASKET_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — CPI Biases Classifier + Core CPI
// ─────────────────────────────────────────────
const BIAS_EXAMPLES = [
  { id: 1, text: "Beef prices jump 20%. Instead of buying the same amount of beef as last year, consumers switch to buying more chicken, which stayed the same price.", bias: "substitution", label: "Substitution Bias", reason: "Fixed basket keeps beef quantities constant — it overstates actual spending because it ignores the consumer switch to cheaper chicken." },
  { id: 2, text: "A 2024 smartphone costs $999 — the same as a 2020 model. But the 2024 version has a dramatically better camera, longer battery, and faster processor.", bias: "quality", label: "Quality Bias", reason: "You get far more value per dollar from the 2024 phone. The real price of 'a unit of phone quality' has fallen — but CPI records this as zero inflation." },
  { id: 3, text: "Streaming services like Netflix launched at premium prices in 2007, then became affordable as competition grew. They weren't in the CPI basket until years after launch.", bias: "newgoods", label: "New Goods Bias", reason: "New products enter the basket slowly. CPI misses the early high prices AND the subsequent price drops as the market matures." },
  { id: 4, text: "Egg prices surge 60% due to avian flu. Families that normally buy eggs three times a week start buying them once a week and eating more oatmeal instead.", bias: "substitution", label: "Substitution Bias", reason: "The fixed basket assumes families keep buying the same egg quantities. In reality they substitute — their true cost increase is less than the basket implies." },
  { id: 5, text: "Electric vehicles entered the consumer market at $70,000+, then fell to $35,000 as battery technology improved and scale increased. CPI added EVs to its basket slowly.", bias: "newgoods", label: "New Goods Bias", reason: "CPI added EVs to the basket after significant price declines had already occurred — missing the large early price drop that benefited early adopters." },
];

const BIAS_CATS = [
  { id: "substitution", label: "Substitution Bias", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "quality",      label: "Quality Bias",      color: "bg-green-100 border-green-400 text-green-800" },
  { id: "newgoods",     label: "New Goods Bias",    color: "bg-purple-100 border-purple-400 text-purple-800" },
];

const CORE_CPI_Q = {
  q: "Hurricane Katrina (2005) caused gas prices to spike 40¢/gallon in a single day. Headline CPI jumped sharply. Core CPI barely moved. The Fed held rates steady. Which statement correctly interprets this episode?",
  options: [
    "A) The Fed made the wrong call — any 40¢ spike is serious inflation requiring rate hikes",
    "B) Core CPI correctly signaled the gas spike was a temporary supply disruption, not a persistent trend — holding rates steady proved right as headline inflation reversed within weeks",
    "C) Core CPI is always more accurate than headline CPI regardless of cause",
    "D) The Fed held rates because it monitors the GDP Deflator, not the CPI",
  ],
  correct: 1,
  exp: "Core CPI (CPI minus food and energy) barely moved because the underlying trend hadn't changed. The spike was a supply disruption — temporary and reversible. Headline came back down within weeks as refineries reopened. The Fed's call was validated. Core strips the noise to reveal the signal — that's its entire purpose.",
};

function BiasesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [classifyChecked, setClassifyChecked] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [coreChecked, setCoreChecked] = useState(false);
  const [coreScore, setCoreScore] = useState(0);
  const allAnswered = BIAS_EXAMPLES.every(b => answers[b.id]);
  const classifyCorrect = classifyChecked ? BIAS_EXAMPLES.filter(b => answers[b.id] === b.bias).length : 0;
  const totalScore = classifyCorrect + coreScore;
  const totalQs = BIAS_EXAMPLES.length + 1;

  function handleCoreCheck() {
    if (sel === null) return;
    setCoreScore(sel === CORE_CPI_Q.correct ? 1 : 0);
    setCoreChecked(true);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — CPI Biases & Core Inflation</p>
        <p className="text-muted-foreground text-xs mb-2">All three biases cause CPI to <strong className="text-foreground">overstate</strong> the true cost-of-living increase. BLS corrections reduced total overstatement to ~0.5%/yr.</p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {BIAS_CATS.map(c => <span key={c.id} className={`px-2 py-1 rounded-lg border font-semibold text-center ${c.color}`}>{c.label}</span>)}
        </div>
      </div>
      <div className="space-y-2">
        {BIAS_EXAMPLES.map(b => {
          const ans = answers[b.id];
          const isCorrect = classifyChecked && ans === b.bias;
          const isWrong = classifyChecked && ans && ans !== b.bias;
          const catObj = BIAS_CATS.find(c => c.id === b.bias);
          return (
            <div key={b.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{b.text}</p>
              {!classifyChecked ? (
                <div className="flex gap-1.5">
                  {BIAS_CATS.map(c => (
                    <button key={c.id} onClick={() => setAnswers(a => ({ ...a, [b.id]: c.id }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === c.id ? `${c.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{catObj?.label} — {b.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!classifyChecked ? (
        <button disabled={!allAnswered} onClick={() => setClassifyChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Classifications
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-blue-800">Classifications: {classifyCorrect}/{BIAS_EXAMPLES.length} correct</p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Core CPI Question</p>
            <p className="text-sm font-semibold text-foreground">{CORE_CPI_Q.q}</p>
            <div className="space-y-2">
              {CORE_CPI_Q.options.map((opt, i) => (
                <button key={i} disabled={coreChecked} onClick={() => setSel(i)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                    coreChecked
                      ? i === CORE_CPI_Q.correct ? "border-green-500 bg-green-50 text-green-900"
                        : i === sel && sel !== CORE_CPI_Q.correct ? "border-red-400 bg-red-50 text-red-900"
                        : "border-border text-muted-foreground opacity-60"
                      : sel === i ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}>{opt}</button>
              ))}
            </div>
            {coreChecked && (
              <div className={`rounded-lg p-3 text-xs ${sel === CORE_CPI_Q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {sel === CORE_CPI_Q.correct ? "✓ Correct — " : "✗ Incorrect — "}{CORE_CPI_Q.exp}
              </div>
            )}
            {!coreChecked && sel !== null && (
              <button onClick={handleCoreCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
                Check Answer
              </button>
            )}
            {coreChecked && (
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
// Station 4 — The Historical Record
// ─────────────────────────────────────────────
const HISTORY_QS = [
  {
    q: "Your slides show the FRED CPIAUCSL chart from 1950 to today with four labeled eras. Which sequence correctly describes them?",
    options: [
      "1970s Great Inflation ~13% → Volcker disinflation 1980–82 → 1990–2020 moderation 2–4% → post-COVID ~9% peak",
      "1950s deflation → 1960s moderation → 1970s Great Inflation → 1980–2020 steady decline to zero",
      "Post-WWII ~20% → 1970s deflation → Reagan boom 5–8% → 1990–2020 near-zero inflation",
      "Volcker disinflation 1970–75 → Great Inflation 1975–85 → moderation 1985–2020 → COVID deflation 2020–22",
    ],
    correct: 0,
    exp: "The four eras from your slides: (1) 1970s Great Inflation ≈13% — oil shocks, loose monetary policy, wage-price spiral; (2) Volcker disinflation 1980–82 — Fed raised rates to ~20%, painful recession but broke inflation; (3) 1990–2020 moderation 2–4% — Fed credibility anchored expectations; (4) Post-COVID ~9% peak 2021–22 — demand surge + supply crunch + monetary expansion. '$1 in 2021 ≈ 15¢ in 1972.'",
  },
  {
    q: "Venezuela's inflation peaked at approximately 130,000% in 2018. More than 7 million Venezuelans emigrated between 2015–2023. Your slides identify the root cause as:",
    options: [
      "A global oil price collapse that reduced Venezuela's export revenues, causing unavoidable inflation",
      "Sanctions from the U.S. and EU that blocked Venezuela from importing goods, creating shortages",
      "A natural disaster that destroyed agricultural capacity, triggering food price hyperinflation",
      "The government printing money to fund fiscal deficits as oil revenue (95% of exports) collapsed — a classic monetary overexpansion",
    ],
    correct: 3,
    exp: "Venezuela is a textbook monetary overexpansion case: oil revenue (95% of exports) collapsed after 2014 → government printed money to fund deficits → Bolívar lost virtually all value → 3+ currency redenominations (cutting off 5 zeros, then 6 zeros) didn't fix the underlying problem. Lesson from your slides: 'Hyperinflation is a fiscal and monetary policy failure — not an act of nature. Friedman's law holds: too much money chasing too few goods.'",
  },
  {
    q: "Your slides note that '$1 in 2021 ≈ 15¢ in 1972.' The CPI in June 2025 is 321.5 (base: 1982–84 = 100). What does the index level of 321.5 mean?",
    options: [
      "The overall price level is 221.5% higher than in the 1982–84 base period — a 1982 dollar now buys what 31¢ bought then",
      "Prices rose 321.5% in a single year — a hyperinflationary episode",
      "Prices today are 321.5 times higher than in 1982–84",
      "The CPI has been overestimating inflation by 321.5 basis points since 1982",
    ],
    correct: 0,
    exp: "An index of 321.5 (base = 100) means prices are 221.5% higher than the base period — i.e., the price level has risen by a factor of 3.215. Equivalently, a 1982 dollar now buys roughly 1/3.215 ≈ 31¢ worth of goods. This is NOT a 321.5% annual increase — that would be hyperinflation. It's cumulative inflation over ~40 years, which at 2–3%/yr compounds to this level through the Rule of 70.",
  },
];

function HistoryStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = HISTORY_QS[idx];
  const isLast = idx === HISTORY_QS.length - 1;
  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
  }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Inflation Through History — Key Benchmarks</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["~13%","Great Inflation 1970s"],
            ["~20% rates","Volcker disinflation 1980–82"],
            ["2–4%","Moderation 1990–2020"],
            ["~9% peak","Post-COVID 2021–22"],
          ].map(([val,label]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2 flex gap-2 items-center">
              <p className="font-bold text-primary text-sm shrink-0">{val}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"$1 in 2021 ≈ 15¢ in 1972" — purchasing power compounds over time. FRED: CPIAUCSL</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={HISTORY_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Why Inflation Matters: Who Wins / Who Loses
// ─────────────────────────────────────────────
const INFLATION_PEOPLE = [
  { id: 1, text: "Maria keeps $20,000 cash under her mattress. Inflation runs 6% this year.", outcome: "loses", reason: "Cash holders lose — $20,000 today buys 6% less next year. Real value erodes every year inflation runs above zero." },
  { id: 2, text: "Carlos borrowed $200,000 at a fixed 4% mortgage rate. Inflation unexpectedly surges to 8%.", outcome: "wins", reason: "Fixed-rate borrowers win — he repays with cheaper dollars. Real rate = 4% − 8% = −4%. He is effectively being paid to borrow." },
  { id: 3, text: "A bank loaned $200,000 at a fixed 4% rate. Inflation unexpectedly surges to 8%.", outcome: "loses", reason: "Lenders lose — the bank is repaid in dollars worth less than when it lent them. Real return = 4% − 8% = −4%. Inflation transferred wealth from the lender to the borrower." },
  { id: 4, text: "Susan retired with a fixed pension of $3,000/month. Inflation runs 5% per year.", outcome: "loses", reason: "Fixed-income retirees lose — her $3,000 buys less each year. At 5% inflation, purchasing power falls ~33% over 8 years. No COLA = real pay cut every year." },
  { id: 5, text: "A homeowner bought a house for $300,000. Inflation pushes home values and construction costs up 6% per year.", outcome: "wins", reason: "Homeowners win — nominal home value rises with inflation while the fixed mortgage payment stays constant. Home equity grows in real terms." },
  { id: 6, text: "A worker's wage contract gives a 3% raise. Inflation runs at 5% this year.", outcome: "loses", reason: "Workers with nominal raises below inflation lose — real wage = 3% − 5% = −2%. They are effectively getting a pay cut in purchasing power terms, even as their paycheck grows." },
];

const OUTCOME_OPTS_CH9 = [
  { id: "wins",  label: "Benefits from Inflation", color: "bg-green-100 border-green-400 text-green-800" },
  { id: "loses", label: "Hurt by Inflation",       color: "bg-red-100 border-red-400 text-red-800" },
];

function MattersStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const allAnswered = INFLATION_PEOPLE.every(p => answers[p.id]);
  const correctCount = checked ? INFLATION_PEOPLE.filter(p => answers[p.id] === p.outcome).length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Who Wins and Who Loses from Inflation?</p>
        <p className="text-muted-foreground text-xs mb-2">If wages and prices rose at the same rate for everyone simultaneously, inflation would be harmless. They don&apos;t — and the mismatch creates real winners and losers.</p>
        <div className="bg-muted/50 rounded-lg p-2 text-xs font-mono text-center font-semibold text-foreground">
          Real Rate = Nominal Rate − Inflation Rate
        </div>
      </div>
      <div className="space-y-2">
        {INFLATION_PEOPLE.map(person => {
          const ans = answers[person.id];
          const isCorrect = checked && ans === person.outcome;
          const isWrong = checked && ans && ans !== person.outcome;
          const optObj = OUTCOME_OPTS_CH9.find(o => o.id === person.outcome);
          return (
            <div key={person.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{person.text}</p>
              {!checked ? (
                <div className="flex gap-2">
                  {OUTCOME_OPTS_CH9.map(o => (
                    <button key={o.id} onClick={() => setAnswers(a => ({ ...a, [person.id]: o.id }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${ans === o.id ? `${o.color} border-current` : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "✓ " : "✗ "}{optObj?.label} — {person.reason}
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
            <p className="text-sm font-bold text-blue-800">You got {correctCount} of {INFLATION_PEOPLE.length} correct!</p>
          </div>
          <button onClick={() => onComplete(correctCount, INFLATION_PEOPLE.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Indexing, Deflation & You: Verdict Cards
// ─────────────────────────────────────────────
const INFLATION_PF_CARDS = [
  {
    id: "deflation",
    icon: "📉",
    title: "Good vs. Bad Deflation",
    tag: "CONCEPT",
    tagColor: "bg-slate-100 border-slate-400 text-slate-800",
    body: "Not all falling prices are created equal.\n\nGood deflation — driven by productivity and innovation:\n• Flat-screen TVs: $10,000 → $300\n• Solar panels: −90% since 2010\n• Computing power: 1/1,000th the cost of 20 years ago\nPrices fall because supply increases and costs drop. More goods for everyone. McCloskey\'s Bourgeois Deal.\n\nBad deflation — driven by collapsing demand:\n• Consumers delay purchases (\'cheaper tomorrow\')\n• Firms cut revenue → cut workers\n• Workers earn less → spend less → firms cut more\n• Deflationary spiral — made the Great Depression devastating\n• Japan\'s Lost Decade (1990s): property/stock crash → persistent deflation → stagnation",
    takeaway: "Ask WHY prices are falling. Productivity deflation = good. Demand-collapse deflation = dangerous. The Fed targets 2% inflation partly to stay far away from the deflationary spiral zone.",
  },
  {
    id: "indexing",
    icon: "🔗",
    title: "Indexing: Inflation Protection Tools",
    tag: "TOOLS",
    tagColor: "bg-teal-100 border-teal-400 text-teal-800",
    body: "Indexing = automatically adjusting a price, wage, or rate for inflation.\n\nPrivate market tools:\n• COLAs (Cost-of-Living Adjustments): wage = base + CPI adjustment. Union contracts, some employment agreements.\n• ARMs (Adjustable-Rate Mortgages): rate adjusts with market — lower initial rate because lender bears less inflation risk.\n\nGovernment programs:\n• Social Security: annual CPI adjustment. 2022–23 COLA = 8.7% — largest in 40 years.\n• Tax brackets: indexed since 1981. Prevents \'bracket creep\' — without indexing, inflation pushes you into higher brackets even when your real income is flat.\n• TIPS bonds: principal adjusts with CPI. Guaranteed real return above inflation.\n\nLimitation: indexing is always partial. Not every employer offers COLAs. As indexing spreads, political pressure to fight inflation may decrease.",
    takeaway: "The financially savvy protect themselves with indexed instruments. The less sophisticated bear the full brunt of inflation. Know your tools.",
  },
  {
    id: "personalfinance",
    icon: "💡",
    title: "Your 3 Personal Finance Moves",
    tag: "ACTION",
    tagColor: "bg-amber-100 border-amber-400 text-amber-800",
    body: "1. Watch REAL raises, not nominal raises.\nA 3% raise with 5% inflation = −2% real pay cut. Always ask: is my raise above CPI? Negotiate with real purchasing power in mind, not dollar amounts.\n\n2. Use inflation-indexed savings.\n• TIPS bonds: principal adjusts with CPI — guaranteed real return.\n• I-bonds: interest rate = fixed rate + CPI. Capped at $10K/yr but excellent inflation hedge.\n• Stocks and real estate: historically beat inflation over long horizons (not guaranteed short-term).\n• Cash: loses to inflation every year. Inflation is a tax on cash and on lazy money.\n\n3. Avoid long fixed-income lock-ins when inflation expectations are rising.\nWhen inflation rises, long-duration bond prices fall sharply. Short-duration bonds and floating-rate instruments adjust faster. In a rising-rate environment, being locked into a 30-year fixed-income instrument is painful.",
    takeaway: "Indexing is the simplest defense. You don't need to beat inflation — you just need to not lose to it. TIPS, I-bonds, and equities are your three main shields.",
  },
];

function IndexingStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = INFLATION_PF_CARDS.every(c => revealed.has(c.id));

  function toggle(id: string) {
    setRevealed(r => new Set([...r, id]));
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 6 — Indexing, Deflation & Your Finances</p>
        <p className="text-muted-foreground text-xs">Open each card to explore good vs. bad deflation, inflation protection tools, and your personal finance action plan.</p>
      </div>
      <div className="space-y-3">
        {INFLATION_PF_CARDS.map(card => {
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
      <button disabled={!allRevealed} onClick={() => onComplete(INFLATION_PF_CARDS.length, INFLATION_PF_CARDS.length)}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
        {allRevealed ? "Mark Complete ✓" : `Open all cards to continue (${revealed.size}/${INFLATION_PF_CARDS.length})`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Inflation", back: "A general and ongoing rise in the overall price level across an entire economy. Not a relative price change (one good rising) and not a one-time shock." },
  { front: "Inflation Rate", back: "[(New Price Level − Old Price Level) / Old Price Level] × 100. Measures the percentage change in a price index over a given period." },
  { front: "Consumer Price Index (CPI)", back: "A price index measuring the cost of a fixed basket of ~80,000 goods and services purchased by a typical urban consumer. Published monthly by the BLS. Base period = 1982–84 = 100." },
  { front: "CPI Basket Weights", back: "The spending shares in the CPI: Housing 42%, Transportation 15%, Food & Beverages 15%, Medical Care 9%, Education 7%, Recreation 6%, Apparel 3%." },
  { front: "Core CPI", back: "CPI minus food and energy prices. Strips out volatile short-term swings to reveal the underlying, persistent inflation trend. FRED series: CPILFESL." },
  { front: "CPI Biases", back: "Three biases that cause CPI to overstate true inflation: (1) Substitution bias — ignores switching to cheaper alternatives, (2) Quality bias — misses product improvements, (3) New goods bias — adds new products slowly." },
  { front: "Nominal Interest Rate", back: "The stated interest rate on a loan or savings account before adjusting for inflation. What the bank advertises." },
  { front: "Real Interest Rate", back: "Nominal Interest Rate − Inflation Rate. The actual purchasing-power return on savings or the true cost of borrowing after accounting for inflation." },
  { front: "Deflation", back: "A general and ongoing fall in the overall price level. Can be 'good' (driven by productivity gains) or 'bad' (driven by collapsing demand, risking a deflationary spiral)." },
  { front: "Hyperinflation", back: "Extremely rapid inflation — typically defined as exceeding 50% per month. Caused by governments printing money to fund deficits. Destroys the currency's store-of-value function. Example: Venezuela 2018 (~130,000%/yr)." },
  { front: "Indexing", back: "Automatic adjustment of wages, benefits, or financial instruments to track inflation. Examples: Social Security COLAs, TIPS bonds, adjustable-rate mortgages, and indexed tax brackets." },
  { front: "TIPS (Treasury Inflation-Protected Securities)", back: "U.S. government bonds whose principal automatically adjusts with CPI. Guarantee a real return above inflation, protecting savers from purchasing-power erosion." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 9 Key Terms</p>
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
// Quiz pool — 15 questions, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "Apartment rents in Austin rose 18% last year. Nationally, the overall price level rose 3%. Which statement is correct?", options: ["Austin rents rising faster than the national price level is inflation", "A single category rising faster than others is a relative price change, not inflation — inflation requires a general rise across the whole economy", "This is inflation only if rents are included in the CPI basket", "This proves the CPI understates true inflation"], correct: 1, exp: "Inflation = a general AND ongoing rise in the whole price level. One sector — even a big one like rent — rising faster than others is a relative price change. Other prices may be flat or falling while Austin rents surge. Inflation is the tide rising for all boats together, not one wave." },
  { q: "A factory town's only employer shuts down. Within weeks, grocery prices jump 25% as suppliers exploit reduced competition. Six months later, a new employer arrives and grocery prices return to normal. This was:", options: ["Inflation — any price increase counts as inflation", "Deflation — prices eventually fell back, so the net effect was deflationary", "A one-time price shock — it was temporary and localized, not a general ongoing rise in the price level", "Core inflation — food prices are excluded from headline CPI"], correct: 2, exp: "Inflation requires two conditions: general (across the whole economy) and ongoing (persistent trend). This price jump was localized (one town, one sector) and temporary (reversed in 6 months). It's a supply disruption — a shock, not inflation. The same logic applies to hurricane-driven gas spikes: temporary supply disruption ≠ inflation." },
  { q: "The BLS Consumer Expenditure Survey underpins the CPI basket. Approximately how many households does it survey, and how often is about one-quarter of the basket updated?", options: ["~700 households, updated every 10 years", "~7,000 households, with about one-quarter of basket products rotated yearly", "~70,000 households, with the full basket replaced every 5 years", "~7,000 businesses, with prices updated quarterly"], correct: 1, exp: "The BLS bases the basket on the Consumer Expenditure Survey of ~7,000 households. To keep the basket current — reflecting new products and shifting spending habits — about one-quarter of the ~80,000 tracked products are rotated each year. This is how streaming services, electric vehicles, and new food categories eventually enter the basket." },
  { q: "A simple 2-item basket: 10 gallons of milk at $4.00 and 5 movie tickets at $12.00 in Year 1. In Year 2: milk rises to $4.40 and movie tickets rise to $13.20. What is the inflation rate?", options: ["About 9% — add the two price increases (10% + 10%)", "About 7% — weight milk more because you buy more of it", "About 5% — average the quantity-weighted dollar increases", "About 10% — both items rose exactly 10%"], correct: 3, exp: "Year 1 basket: (10×$4.00)+(5×$12.00) = $40+$60 = $100. Year 2 basket: (10×$4.40)+(5×$13.20) = $44+$66 = $110. Inflation = (110−100)/100×100 = 10%. Both items rose exactly 10%, so regardless of weights, the basket total rose 10%. The formula: [(New−Old)/Old]×100 applied to total basket cost." },
  { q: "In 2022, egg prices surged 60% due to an avian flu outbreak. Ground beef rose only 8%. A family that normally eats 3 eggs/week switches to eating ground beef more often. How does the fixed-basket CPI handle this?", options: ["The CPI keeps egg quantities fixed — it overstates the family's true cost increase because it doesn't allow for switching to cheaper protein", "The CPI automatically adjusts egg quantities downward to reflect the family's actual behavior", "The CPI excludes food price shocks from its calculation to avoid bias", "The family's behavior change is captured through the monthly BLS price surveys"], correct: 0, exp: "This is substitution bias. The fixed-basket CPI assumes the family keeps buying the same egg quantities year after year. In reality they switch to beef. Their true cost-of-living increase is less than what the fixed basket implies — because they adapted. The CPI overstates their real spending increase. The BLS's Chained CPI-U attempts to partially correct this by updating quantities more frequently." },
  { q: "A 50-inch 4K television cost $2,500 in 2015. In 2025 an equivalent display costs $400, but the 2025 model also has built-in streaming, HDR, and a faster processor. Which CPI bias best describes the measurement challenge this creates?", options: ["Quality bias — the CPI may record this as deflation without fully crediting the additional quality improvements, understating how much more value consumers get per dollar", "Substitution bias — consumers switched from TVs to streaming devices", "New goods bias — flat-screen TVs are a new product not yet in the basket", "Outlet bias — consumers now buy TVs online rather than in stores the BLS surveys"], correct: 0, exp: "Quality bias: the 2025 TV is dramatically better than the 2015 model, yet costs far less. The real price of 'a unit of TV quality' has fallen even more than the sticker price suggests. If the BLS doesn't fully account for quality improvements, it either understates deflation or overstates how much inflation consumers experience. Hedonic adjustment attempts to correct this but is incomplete." },
  { q: "A major drought in the Midwest causes corn and soybean prices to spike 35% over three months. Economists expect prices to normalize once the next harvest arrives. The Federal Reserve is deciding whether to raise interest rates. What should guide the decision?", options: ["Headline CPI — any inflation, regardless of cause, requires a policy response", "Core CPI — it strips out the food price spike to reveal whether underlying demand-driven inflation is actually accelerating", "The PPI — producer prices are more relevant than consumer prices for Fed decisions", "The GDP Deflator — it covers all goods and services, not just consumer items"], correct: 1, exp: "This is exactly why core CPI exists. A drought-driven food spike is a supply shock — temporary and supply-side. Core CPI (minus food and energy) filters this out to reveal whether the persistent, demand-driven inflation trend is changing. If core is stable, the Fed should hold steady — raising rates to fight a temporary supply disruption would cause unnecessary economic damage, exactly as in the Hurricane Katrina (2005) case." },
  { q: "The CPI was 100 in the base period (1982–84). In 2000 it was 172. In 2024 it was 313. What can you correctly conclude?", options: ["Annual inflation between 2000 and 2024 averaged 313%", "Prices in 2024 were 313 times higher than in 1982–84", "You cannot compare CPI values across different years — each index is independent", "Prices in 2024 were 213% higher than in 1982–84, and the annual inflation rate from 2000 to 2024 was (313−172)/172×100 ≈ 82% total over 24 years — about 2.5%/yr"], correct: 3, exp: "The index level (313) means prices are 213% higher than the 1982–84 base. To find annual inflation over 2000–2024: (313−172)/172×100 ≈ 82% cumulative over 24 years, or roughly 2.5%/yr annualized. The common error: treating the index level as a percentage change. The level is a reference point; inflation is always the % change between two points." },
  { q: "U.S. inflation ran at ~13% in the late 1970s, then fell to ~3% by the mid-1980s. Your slides attribute the decline to Fed Chair Paul Volcker. What did Volcker actually do?", options: ["He raised the federal funds rate to approximately 20%, deliberately causing a recession to break inflationary expectations", "He negotiated price controls with major corporations to directly cap prices", "He reduced the money supply by printing new currency to replace old bills at a lower face value", "He convinced Congress to pass balanced-budget legislation that eliminated federal deficits"], correct: 0, exp: "Volcker's disinflation (1980–82): the Fed raised the federal funds rate to ~20% — the highest in modern U.S. history. This dramatically reduced borrowing and spending, caused a sharp recession (unemployment peaked ~10.8%), and broke the inflationary expectations that had embedded 10%+ inflation into wage and price decisions. It was painful but it worked. Inflation fell from ~13% to ~3% by 1983." },
  { q: "Zimbabwe in 2008 experienced inflation exceeding 89 sextillion percent (89,700,000,000,000,000,000,000%). The government printed $100 trillion banknotes. What fundamental economic principle does this illustrate?", options: ["Hyperinflation is caused by foreign currency speculation attacking weak economies", "Price controls failed — the government should have fixed prices rather than printing money", "Friedman's rule: inflation is always a monetary phenomenon — too much money chasing too few goods. Printing money to fund deficits without output growth destroys the currency", "International trade deficits cause hyperinflation when import prices rise uncontrollably"], correct: 2, exp: "Zimbabwe is the textbook case of Friedman's rule. The government printed money to fund fiscal deficits after land reform collapsed agricultural output. Money supply grew far faster than goods production — too much money chasing too few goods. Every historical hyperinflation (Germany 1923, Hungary 1946, Venezuela 2018, Zimbabwe 2008) shares this root cause: monetizing deficits when the real economy can't keep up." },
  { q: "A landlord holds a 30-year fixed-rate mortgage at 3.5%. Unexpectedly, inflation runs at 6% for the next decade. What is the landlord's real interest rate, and is this good or bad for the landlord?", options: ["Real rate = 9.5% — inflation and nominal rates add together, harming the landlord", "Real rate = +3.5% — the nominal rate is unaffected by inflation", "Real rate = −2.5% — the landlord benefits because she is effectively being paid to borrow, repaying the bank in cheaper dollars while her property value rises", "Real rate = 6% — inflation fully offsets the nominal rate, leaving the landlord at breakeven"], correct: 2, exp: "Real Rate = Nominal − Inflation = 3.5% − 6% = −2.5%. The landlord benefits: she borrowed at 3.5% but inflation runs 6%, so she repays in dollars worth less than when she borrowed. Her property's nominal value rises with inflation. The bank (lender) loses — it is repaid in depreciated dollars. This redistribution from lenders to fixed-rate borrowers is Harm #1 of inflation." },
  { q: "A retiree living on a fixed pension of $4,000/month notices her grocery bill, utilities, and healthcare costs are all rising. Her pension never adjusts. Meanwhile, her neighbor has a Social Security benefit that adjusts with CPI each year. What economic mechanism protects the neighbor but not the retiree?", options: ["The neighbor benefits from substitution bias — she can switch to cheaper goods", "The neighbor benefits because Social Security is a government program that always outpaces inflation", "The retiree could protect herself by investing her pension in Treasury bills", "The neighbor is protected by indexing (COLA) — her benefit automatically rises with inflation, preserving purchasing power. The retiree's fixed pension loses real value every year inflation is positive"], correct: 3, exp: "Indexing (COLA — Cost-of-Living Adjustment): Social Security benefits are adjusted annually by CPI, preserving real purchasing power. The retiree's fixed private pension has no such adjustment — every year inflation is positive, it buys less. In 2022–23, Social Security's COLA was 8.7% (largest in 40 years) because post-COVID CPI spiked. This is why the slide says 'indexing is the simplest defense' — but it's partial, not universal." },
  { q: "An investor buys a 10-year Treasury bond paying 2% annually when inflation expectations are 1.5%. Two years later, inflation surges to 5% and stays there. What happens to the real return on this bond?", options: ["The nominal return stays at 2%, but the real return falls to approximately 2%−5% = −3%, meaning the investor is losing purchasing power every year", "The real return rises to 5% — bond returns always track inflation", "The bond automatically adjusts its coupon rate to match CPI, keeping the real return at 2%", "The real return is unaffected — nominal bond contracts are legally protected from inflation losses"], correct: 0, exp: "This is exactly why your slides say 'avoid long fixed-income lock-ins when inflation expectations rise.' The 2% nominal coupon is fixed for 10 years. If inflation runs 5%, real return = 2%−5% = −3%/yr. The investor is legally owed 2%, but that 2% buys 3% less purchasing power each year. TIPS (Treasury Inflation-Protected Securities) solve this by adjusting the principal with CPI — but ordinary Treasury bonds don't." },
  { q: "Your slides show that in the 1970s, U.S. inflation hit ~10% and productivity growth slowed from ~2%/yr to ~0.8%/yr. When inflation fell in the 1980s–90s, productivity recovered. What causal mechanism does this suggest?", options: ["High inflation causes workers to become less motivated and work fewer hours", "Productivity slowdowns always precede inflation — the causation runs from productivity to prices, not vice versa", "The productivity slowdown was caused by the oil shocks, not by inflation itself — the two trends are coincidental", "High inflation converts productive investment decisions into inflation-hedging exercises — businesses spend management time and capital on financial arbitrage rather than on real innovation and capacity expansion"], correct: 3, exp: "Your slides' Planning Problems harm: unpredictable high inflation makes real investment decisions harder. Capital-intensive, long-horizon projects become too risky to greenlight when you can't predict costs 5–10 years out. Management attention shifts to inflation hedging and financial arbitrage. High inflation rewards financial engineering over real value creation. Moderate stable inflation (<3%) need not impede growth — but high unpredictable inflation does, as the 1970s showed." },
  { q: "Which statement about deflation is CORRECT according to your slides?", options: ["All deflation is harmful — falling prices always reduce business revenues and cause layoffs", "Deflation is always beneficial — consumers gain purchasing power whenever prices fall", "Productivity-driven deflation (computing, solar panels) is beneficial; demand-collapse deflation triggers a spiral of falling prices, layoffs, and reduced spending that can be very damaging", "Deflation is only a concern when it exceeds −5% annually — mild deflation is harmless in all cases"], correct: 2, exp: "Your slides distinguish two types. Good deflation: driven by productivity and innovation — more output at lower cost. Flat-screen TVs ($10,000→$300), solar panels (−90%), genome sequencing ($100M→$500). McCloskey's Bourgeois Deal — innovation making everyone better off. Bad deflation: demand collapses → firms cut prices, then wages, then workers → consumers delay purchases ('cheaper tomorrow') → less spending → more cuts. The deflationary spiral made the Great Depression devastating and Japan's Lost Decade persistent." },
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
        <p className="font-semibold text-foreground">Chapter 9 Quiz</p>
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

// ─────────────────────────────────────────────
// Results Screen
// ─────────────────────────────────────────────
const STATION_LABELS_CH9: Record<string, string> = {
  whatisit:  "What Is Inflation?",
  basket:    "The Basket & CPI",
  biases:    "Biases & Core CPI",
  history:   "The Historical Record",
  matters:   "Why Inflation Matters",
  indexing:  "Indexing, Deflation & You",
  flash:     "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH9).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch9 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 9 — Inflation</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 9 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 9 — Inflation</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In your own words, why does core CPI exclude food and energy, and what does that tell us about how to read inflation data?</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e=>setExitTicket(e.target.value)} rows={2} placeholder="Your response..." className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"/></div>
      </div>
      {stationRows.length>0&&(<div className="bg-card border border-border rounded-xl p-4"><p className="text-sm font-semibold text-foreground mb-3">Station Scores</p><div className="space-y-2">{stationRows.map(r=>(<div key={r.label} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{r.label}</span><span className={`font-bold ${r.score===r.total?"text-green-700":r.score>=r.total*0.7?"text-amber-700":"text-red-600"}`}>{r.score}/{r.total}</span></div>))}</div></div>)}
      <div className="space-y-2"><p className="text-sm font-semibold text-foreground">Quiz Question Review</p>{results.map((r,i)=>(<div key={i} className={`rounded-xl border p-3 ${r.correct?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}><p className="text-xs font-semibold">{r.correct?"✓ Correct":"✗ Incorrect"} — Question {i+1}</p><p className="text-xs text-muted-foreground mt-0.5">{r.exp}</p></div>))}</div>
      <div className="flex gap-3">
        <button type="button" onClick={onRestart} className="flex-1 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button>
      </div>
      <button type="button" onClick={printPDF} disabled={!name.trim()} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stations, Nav, Order
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "whatisit"  as Station, label: "What Is Inflation?",       desc: "General vs. relative price change vs. one-time shock — and when deflation is bad", icon: "🌊" },
  { id: "basket"    as Station, label: "The Basket & CPI",         desc: "How BLS builds the price index, weights, the 3-item calculation, and other indices", icon: "🛒" },
  { id: "biases"    as Station, label: "Biases & Core CPI",        desc: "Three overstatement biases and why core strips food & energy noise", icon: "📡" },
  { id: "history"   as Station, label: "The Historical Record",    desc: "Seven inflation eras from the 1970s to post-COVID, Venezuela hyperinflation", icon: "📜" },
  { id: "matters"   as Station, label: "Why Inflation Matters",    desc: "Redistribution, blurred price signals, and long-term planning problems", icon: "⚖️" },
  { id: "indexing"  as Station, label: "Indexing, Deflation & You",desc: "COLAs, TIPS, good vs. bad deflation, and 3 personal-finance moves", icon: "🛡️" },
  { id: "flash"     as Station, label: "Flashcard Review",         desc: "Master all 12 key Ch9 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",    label: "Dashboard" },
  { id: "whatisit", label: "What Is It?" },
  { id: "basket",   label: "Basket & CPI" },
  { id: "biases",   label: "Biases" },
  { id: "history",  label: "History" },
  { id: "matters",  label: "Why It Matters" },
  { id: "indexing", label: "Indexing" },
  { id: "flash",    label: "Flashcards" },
  { id: "quiz",     label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","whatisit","basket","biases","history","matters","indexing","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Summary Modal
// ─────────────────────────────────────────────
const CH9_SUMMARY = [
  { heading: "9.1 Tracking Inflation", body: "Inflation is a general and ongoing rise in the level of prices across an entire economy. It is not a relative price change (one price rising while another falls) nor a one-time price shock. The Bureau of Labor Statistics tracks inflation using the Consumer Price Index (CPI), built from a basket of ~80,000 goods and services weighted by actual consumer spending shares. The most important weight is housing (42%). The formula is: Inflation Rate = [(New − Old) / Old] × 100." },
  { heading: "9.2 Adjusting Nominal Values to Real Values", body: "The CPI has three measurement biases that cause it to overstate true cost-of-living increases by about 0.5% per year. Substitution bias occurs because consumers switch to cheaper alternatives when prices rise, but the fixed basket does not allow for this. Quality bias arises because products improve over time — a 2024 smartphone for the same price as a 2020 model delivers more value. New goods bias occurs because new products enter the basket slowly, missing early price declines. Core CPI (CPI minus food and energy) strips out volatile categories to reveal the underlying inflation trend. The Federal Reserve watches core CPI because it signals persistent, demand-driven inflation rather than temporary supply shocks." },
  { heading: "9.3 Tracking Inflation across the Economy", body: "U.S. inflation history includes several distinct episodes: the Great Inflation of the 1970s (~13%), the Volcker disinflation of 1980–82 (Fed funds rate raised to ~20%), the Great Moderation of 1990–2020 (2–4%), and the post-COVID surge of 2021–22 (~9% peak). Hyperinflation — extreme cases like Venezuela (~130,000% in 2018) — is always a fiscal and monetary policy failure caused by governments printing money to fund deficits. Friedman's rule: inflation is always and everywhere a monetary phenomenon." },
  { heading: "9.4 The Confusion Over Inflation", body: "Inflation causes three real-economy harms. First, redistribution of purchasing power: savers, cash holders, and lenders lose while borrowers with fixed-rate debt gain. Real interest rate = nominal rate minus inflation. Second, blurred price signals: inflation adds static to the price system, making it hard for firms and consumers to distinguish genuine scarcity from general price noise. Third, long-term planning problems: retirement savings, business investment, and capital allocation all require stable price expectations. High or unpredictable inflation diverts resources from productive decisions to inflation-hedging activities." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 9 Summary — Inflation</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH9_SUMMARY.map((s,i) => (
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
        <p className="font-semibold mb-1">Chapter 9 — Inflation</p>
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
            const idx = STATION_ORDER.indexOf(s.id);
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

// ─────────────────────────────────────────────
// Main EconLab
// ─────────────────────────────────────────────
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
        {station==="intro"     && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="whatisit"  && <WhatIsItStation  onComplete={(sc,t)=>markDone("whatisit", sc,t)} />}
        {station==="basket"    && <BasketStation    onComplete={(sc,t)=>markDone("basket",   sc,t)} />}
        {station==="biases"    && <BiasesStation    onComplete={(sc,t)=>markDone("biases",   sc,t)} />}
        {station==="history"   && <HistoryStation   onComplete={(sc,t)=>markDone("history",  sc,t)} />}
        {station==="matters"   && <MattersStation   onComplete={(sc,t)=>markDone("matters",  sc,t)} />}
        {station==="indexing"  && <IndexingStation  onComplete={(sc,t)=>markDone("indexing", sc,t)} />}
        {station==="flash"     && <FlashcardStation onComplete={(sc,t)=>markDone("flash",    sc,t)} />}
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
