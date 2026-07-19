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
// Station 1 — What Is Inflation?
// ─────────────────────────────────────────────
const WHATISIT_QS = [
  {
    q: "Your slides define inflation as 'a general and ongoing rise in the level of prices across an entire economy.' Which of the following is NOT inflation?",
    options: [
      "The overall price level rises 4% this year — groceries, rent, gas, and clothing all cost more",
      "College tuition rises 8% while laptop prices fall 15% — the two prices move in opposite directions",
      "After a hurricane, gas prices spike 40¢/gallon for two weeks, then return to normal",
      "Both B and C — a relative price change and a one-time shock are not inflation",
    ],
    correct: 3,
    exp: "Inflation requires two things: it must be general (the whole price level, not just one item) AND ongoing (a persistent trend, not a temporary shock). A relative price change (tuition up, laptops down) means some prices move differently — that's not inflation. A hurricane gas spike is a one-time supply disruption — not ongoing. Inflation is the whole ocean rising, not one wave splashing higher.",
  },
  {
    q: "Your slides use the analogy: 'Think of the ocean tide rising — all boats go up, not just one wave splashing higher.' What does this analogy capture about inflation?",
    options: [
      "Inflation is a general rise in the overall price level — the whole economy, not just one sector or item",
      "Inflation affects everyone equally — no one benefits and no one loses",
      "Inflation is caused by tidal forces in the global economy that no government can control",
      "Inflation always arrives suddenly, like a tidal wave, rather than building gradually",
    ],
    correct: 0,
    exp: "The ocean tide analogy captures generality: all boats rise together — that's the overall price level going up. One wave splashing higher (a single price spike) is a relative change, not inflation. The analogy deliberately distinguishes a general phenomenon from a sector-specific one. It says nothing about who wins or loses, or about causes — just what inflation is.",
  },
  {
    q: "Your slides note 'deflation ≠ always good news' and warn it can 'trigger a deflationary spiral.' Why might falling prices be harmful?",
    options: [
      "Deflation is always harmful — there is no scenario in which falling prices benefit consumers",
      "Deflation driven by collapsing demand causes consumers to delay purchases, firms to cut costs and workers, incomes to fall, and spending to drop further — a self-reinforcing spiral",
      "Deflation is only harmful when caused by falling oil prices, which reduce energy sector employment",
      "Deflation reduces tax revenues, which forces governments to cut spending and raise taxes simultaneously",
    ],
    correct: 1,
    exp: "Bad deflation is driven by collapsing demand: prices fall because nobody is buying → firms cut costs and workers → incomes fall → less spending → prices fall further. This self-reinforcing spiral made the Great Depression devastating and contributed to Japan's 'Lost Decade.' Good deflation (driven by productivity — flat-screen TVs, solar panels) is fine. The harm comes from the demand-collapse version.",
  },
];

function WhatIsItStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = WHATISIT_QS[idx];
  const isLast = idx === WHATISIT_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">What Inflation Is (and Isn't)</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["✓ Inflation", "General AND ongoing rise in the overall price level — all boats rising with the tide"],
            ["✗ Relative price change", "Tuition up 8%, laptops down 15% — some prices move differently from others"],
            ["✗ One-time shock", "Hurricane spikes gas 40¢/gallon for 2 weeks — temporary supply disruption, not a trend"],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Deflation = price level falls overall. Can signal collapsing demand — not always good news.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={WHATISIT_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
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
// Station 3 — Biases & Core CPI
// ─────────────────────────────────────────────
const BIASES_QS = [
  {
    q: "The CPI uses a fixed basket, but when beef prices jump 20% consumers switch to buying more chicken. Which CPI bias does this illustrate, and how does it affect measured inflation?",
    options: [
      "Quality bias — the CPI misses improvements in product quality over time",
      "New goods bias — beef is a new product not yet fully captured in the basket",
      "Substitution bias — the fixed basket overstates actual spending increases because consumers adapt by switching to cheaper alternatives",
      "Outlet bias — consumers switch to discount stores, but the CPI still surveys full-price retailers",
    ],
    correct: 2,
    exp: "Substitution bias: the CPI assumes you keep buying the same quantities year after year. In reality, if beef rises 20% and chicken stays flat, you buy more chicken. Your actual spending increase is less than what the fixed basket implies. The CPI overstates your true cost-of-living increase because it doesn't allow for this substitution. BLS corrections since the early 2000s have reduced total overstatement to ~0.5%/yr.",
  },
  {
    q: "A 2024 smartphone costs $999 — the same as a 2020 model. But the 2024 version has a dramatically better camera, longer battery, and faster processor. Which CPI bias does this represent?",
    options: [
      "Quality bias — the CPI may record this as zero inflation on phones, missing that you get far more value per dollar",
      "Substitution bias — consumers switched from phones to other devices",
      "New goods bias — smartphones were not in the original CPI basket",
      "There is no bias here — same price means zero inflation, by definition",
    ],
    correct: 0,
    exp: "Quality bias: if the 2024 phone costs the same but delivers dramatically more value, the true price of 'a unit of phone quality' has actually fallen — you get more for your money. But the CPI may record this as zero inflation since the sticker price didn't change. The BLS attempts hedonic adjustments (adjusting for quality changes) but doesn't fully capture all improvements, so CPI tends to overstate true cost-of-living increases.",
  },
  {
    q: "In August 2005, Hurricane Katrina caused Gulf Coast refineries to shut down. Gas prices spiked 40¢/gallon in a single day — headline CPI jumped. Core CPI barely moved. The Fed held rates steady. Which statement correctly interprets this episode?",
    options: [
      "The Fed made the wrong call — a 40¢ gas spike is serious inflation that required rate hikes",
      "Core CPI correctly signaled that the gas spike was a temporary supply disruption, not a persistent inflation trend — the Fed's steady hand proved right as headline inflation came back down within weeks",
      "Core CPI is always more accurate than headline CPI, regardless of the cause of price changes",
      "The Fed held rates because it only monitors the GDP Deflator, not the CPI",
    ],
    correct: 1,
    exp: "This is the canonical case for core CPI. Core (CPI minus food and energy) barely moved because the underlying trend — driven by too much money chasing too few goods — hadn't changed. The gas spike was a supply disruption: temporary and reversible. Headline inflation came back down within weeks as refineries reopened. The Fed's steady hand was the right call, validated by subsequent data. Core CPI strips the noise to reveal the signal.",
  },
];

function BiasesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = BIASES_QS[idx];
  const isLast = idx === BIASES_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Three Biases — CPI Overstates True Cost-of-Living Change</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["Substitution Bias","Fixed basket ignores switching. Beef up → buy chicken. CPI overstates your actual spending increase."],
            ["Quality Bias","Better products cost 'the same.' 2024 phone = $999 same as 2020, but far better. CPI misses real-value gain."],
            ["New Goods Bias","Streaming/smartwatches entered expensive, then dropped. CPI basket adds them slowly, misses early price falls."],
          ].map(([type, desc]) => (
            <div key={type} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{type}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
          <p className="font-semibold text-amber-800">Core CPI = CPI minus food &amp; energy</p>
          <p className="text-amber-900">Strips volatile categories to reveal the underlying trend. The Fed watches core. Hurricane Katrina (2005): headline spiked, core barely moved → Fed held steady → right call.</p>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">BLS corrections since early 2000s reduced total overstatement to ~0.5%/yr. FRED: CPIAUCSL and CPILFESL</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={BIASES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
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
// Station 5 — Why Inflation Matters
// ─────────────────────────────────────────────
const MATTERS_QS = [
  {
    q: "A saver earns 2% interest on her bank account, but inflation runs at 6%. What is her real interest rate, and what does it mean for her purchasing power?",
    options: [
      "Real rate = −4% — her purchasing power is falling even though her balance is growing in dollar terms",
      "Real rate = 8% — inflation and nominal interest compound together",
      "Real rate = +2% — she earns 2% regardless of inflation",
      "Real rate = 6% — inflation cancels out the nominal rate, leaving her with inflation's rate of return",
    ],
    correct: 0,
    exp: "Real Rate = Nominal Rate − Inflation = 2% − 6% = −4%. Her balance grows in nominal dollars, but each dollar buys less than before. After one year she has more dollars but can buy 4% less with them. This is how inflation redistributes wealth from savers (who lend money) to borrowers (who repay in cheaper dollars). 'Inflation is a tax on cash and on lazy money.'",
  },
  {
    q: "In 1985, Israel had 500% annual inflation. Stores stopped posting prices — they changed every few hours. What economic harm does your slides' 'blurred price signals' category describe?",
    options: [
      "Inflation reduces the quantity of goods available because firms reduce production when prices rise",
      "High inflation destroys the price system's ability to convey information — firms and consumers can't distinguish genuine scarcity signals from general price noise, leading to worse decisions by everyone",
      "Blurred price signals only affect stock markets, not real-economy decisions by businesses and consumers",
      "Stores posting prices is a legal requirement, so the real harm was the violation of consumer protection laws",
    ],
    correct: 1,
    exp: "Prices are the economy's GPS: a rising price signals scarcity and attracts resources. But when everything is rising, you can't tell if that $18 burger is expensive because beef is genuinely scarce or because the overall price level is up. Israel 1985 — stores stopped posting prices because they changed every few hours. Shoppers couldn't compare costs; businesses couldn't plan inventory. The economy's GPS was broken — firms and households navigated blind.",
  },
  {
    q: "Your slides note: 'Even 2% inflation compresses fixed pension spending power by ~33% over 20 years.' A retiree's fixed pension is $3,000/month in 2005. Using the Rule of 70, approximately what is the real purchasing power of that same $3,000 in 2025 (20 years later at 2% inflation)?",
    options: [
      "About $3,000 — 2% is so low it barely affects purchasing power over 20 years",
      "About $2,700 — a modest 10% reduction over 20 years",
      "About $1,500 — purchasing power is cut in half at 2% inflation over 20 years",
      "About $2,000 — roughly 33% less purchasing power, because at 2% the price level doubles in ~35 years, so in 20 years it rises ~50%",
    ],
    correct: 3,
    exp: "Rule of 70: at 2% inflation, prices double every 35 years. Over 20 years, prices rise by about (1.02)^20 ≈ 1.49 — roughly 50%. So $3,000 in 2005 dollars buys what $3,000 ÷ 1.49 ≈ $2,015 buys in 2025 terms — a ~33% real loss. The pension buys a third less in real goods. This is why your slides say 'even moderate, stable inflation (<3%) can impede long-term planning for fixed-income recipients.'",
  },
  {
    q: "Your slides show that borrowers with fixed-rate loans benefit from unexpected inflation. A homeowner borrows $200,000 at a fixed 4% 30-year mortgage. Inflation unexpectedly surges to 8%. Who gains and who loses?",
    options: [
      "The homeowner loses — rising inflation will force the bank to raise the mortgage rate",
      "Both the homeowner and the bank are harmed equally — inflation hurts everyone the same way",
      "The homeowner gains — she repays the loan in dollars worth less than when she borrowed, while her home value rises. The bank (lender) loses — it is repaid in cheaper dollars",
      "The bank gains — it can charge higher interest rates as inflation rises, increasing its revenue",
    ],
    correct: 2,
    exp: "Fixed-rate borrowers win from unexpected inflation: the homeowner's mortgage payment stays at $X/month, but her home's nominal value rises with inflation, and her wages (likely) rise too. She's effectively repaying with cheaper dollars — real rate = 4% − 8% = −4%, meaning she's effectively being paid to borrow. The bank loses: it receives repayments in dollars worth less than anticipated. This is the redistribution mechanism — inflation transfers wealth from lenders to borrowers.",
  },
];

function MattersStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = MATTERS_QS[idx];
  const isLast = idx === MATTERS_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-1">Why Inflation Matters — Three Real-Economy Harms</p>
        <p className="text-xs text-muted-foreground mb-2 italic">"If wages and prices rose at the same rate, at the same time, inflation would be harmless. They don't."</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["1 — Redistribution","Savers/cash-holders/lenders lose. Borrowers with fixed rates gain. Real Rate = Nominal − Inflation."],
            ["2 — Blurred Signals","Prices carry information. High inflation adds static — can't tell genuine scarcity from general noise. Israel 1985."],
            ["3 — Planning Problems","Retirement savings, business investment depend on stable price expectations. High inflation crowds out real activity."],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MATTERS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Indexing, Deflation & You
// ─────────────────────────────────────────────
const INDEXING_QS = [
  {
    q: "A union contract includes a COLA clause: base wage + 3%, plus CPI adjustment. If inflation runs at 5%, what is the total raise and what does it protect?",
    options: [
      "Total raise = 3% — the CPI adjustment cancels out the base raise",
      "Total raise = 8% — and it protects the worker's real purchasing power by keeping wages tied to prices",
      "Total raise = 5% — the COLA replaces the base raise rather than adding to it",
      "Total raise = 3% — the CPI adjustment only applies to government workers, not union contracts",
    ],
    correct: 1,
    exp: "COLA (Cost-of-Living Adjustment) = base raise + inflation adjustment. If base = 3% and inflation = 5%, total raise = 8%. This keeps the worker's real wage roughly constant — the nominal raise matches inflation, preserving purchasing power. Without a COLA, a 3% raise in a 5% inflation environment is a 2% real pay cut. Your slides note that in 2022–23, Social Security's COLA was 8.7% — the largest in 40 years — because CPI spiked post-COVID.",
  },
  {
    q: "Your slides distinguish 'good deflation' from 'bad deflation.' Flat-screen TVs dropped from $10,000 to $300; solar panels fell 90% since 2010. These are examples of good deflation. What makes them 'good'?",
    options: [
      "Good deflation is driven by productivity and innovation — prices fall because supply increases and costs drop, not because demand collapses",
      "Good deflation only occurs in luxury goods — essentials like food and housing never experience it",
      "Good deflation occurs when the government subsidizes industries, reducing prices artificially",
      "Good deflation is only 'good' if it is accompanied by rising wages — otherwise it is always harmful",
    ],
    correct: 0,
    exp: "Good deflation = driven by productivity and innovation: more output at lower cost through better technology, learning curves, and scale. Flat-screen TVs, computing power (1/1,000th the cost of 20 years ago), solar panels, genome sequencing ($100M in 2001 → ~$500 today). These are McCloskey's 'Bourgeois Deal' — innovation making everyone better off. Bad deflation = collapsing demand → deflationary spiral (Great Depression, Japan's Lost Decade).",
  },
  {
    q: "Your slides give three personal-finance takeaways for living with inflation. Which correctly states all three?",
    options: [
      "Watch nominal raises not real raises; avoid all debt during inflation; hold cash as a hedge",
      "Move savings into gold; avoid adjustable-rate mortgages; maximize Social Security benefits early",
      "Spend now rather than saving; borrow at fixed rates only if inflation is already high; avoid stocks during inflation",
      "Watch real raises not nominal raises; use inflation-indexed savings (TIPS, I-bonds, stocks/real estate); avoid long fixed-income lock-ins when inflation expectations rise",
    ],
    correct: 3,
    exp: "Your slides' three takeaways: (1) Watch real raises, not nominal — a 3% raise with 5% inflation is a 2% real pay cut; always ask 'is my raise above CPI?'; (2) Use inflation-indexed savings — TIPS and I-bonds protect principal, stocks and real estate have historically beaten inflation over long horizons, cash does not; (3) Avoid long fixed-income lock-ins — when inflation expectations rise, long-duration bonds lose value rapidly; short-duration and floating-rate instruments adjust faster. 'Inflation is a tax on cash and on lazy money. Indexing is the simplest defense.'",
  },
];

function IndexingStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = INDEXING_QS[idx];
  const isLast = idx === INDEXING_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Indexing, Deflation & You</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Indexing tools</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• COLAs — wages tied to CPI</li>
              <li>• ARMs — mortgage rate adjusts</li>
              <li>• Social Security — CPI adjustment (8.7% in 2022–23)</li>
              <li>• Tax brackets — since 1981</li>
              <li>• TIPS bonds — principal adjusts with CPI</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Good vs. Bad Deflation</p>
            <p className="text-green-700 font-semibold text-xs">✓ Good: productivity-driven (TVs $10K→$300, solar −90%)</p>
            <p className="text-red-700 font-semibold mt-1 text-xs">✗ Bad: demand-collapse → spiral → Great Depression, Japan's Lost Decade</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
          <p className="font-semibold text-amber-800">Your 3 Personal-Finance Moves:</p>
          <p className="text-amber-900">① Watch REAL raises (nominal − inflation) &nbsp;② Use indexed savings (TIPS, stocks, real estate) &nbsp;③ Avoid long fixed-income lock-ins when inflation is rising</p>
          <p className="text-amber-700 italic mt-1">"Inflation is a tax on cash and on lazy money. Indexing is the simplest defense."</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={INDEXING_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
type Flashcard = { id: number; type: "standard" | "cloze"; front: string; back: string; hint: string };

const CH9_CARDS: Flashcard[] = [
  { id: 1, type: "standard", front: "Define inflation and give the two key distinctions your slides make.", back: "Inflation: a general AND ongoing rise in the level of prices across an entire economy.\n\nDistinction 1 — Not a relative price change: tuition rises 8% while laptops fall 15%. That's two prices moving differently — not inflation.\n\nDistinction 2 — Not a one-time shock: a hurricane spikes gas prices for two weeks. That's a temporary supply disruption — not ongoing.\n\nAnalogy: 'Think of the ocean tide rising — all boats go up, not just one wave splashing higher.'", hint: "General + ongoing. Not relative change. Not one-time shock. Ocean tide." },
  { id: 2, type: "cloze", front: "Complete: Inflation Rate = [(_______ − _______) / _______] × 100", back: "Inflation Rate = [(New − Old) / Old] × 100\n\nWorked example from slides — 3-item basket:\nYear 1: Coffee (12×$2.50) + T-shirt (2×$18) + Gas (10×$3.20) = $98.00\nYear 2: Coffee (12×$2.75) + T-shirt (2×$19.50) + Gas (10×$3.30) = $105.00\nInflation = (105 − 98) / 98 × 100 = 7.14%", hint: "[(New − Old) / Old] × 100. Basket: $98→$105 = 7.14%." },
  { id: 3, type: "standard", front: "How is the CPI basket built? Give the four key scale numbers and the top weights.", back: "Built from Consumer Expenditure Survey of ~7,000 households.\n\nScale: ~80,000 products · 200+ categories · 23,000 stores · 87 urban areas. ~¼ of basket rotated yearly.\n\nTop weights (spending shares):\nHousing 42% · Transportation 15% · Food & Bev 15% · Medical 9% · Education 7% · Recreation 6% · Apparel 3%\n\nBase period: 1982–84 = 100. Published monthly by BLS.", hint: "80K products, 200+ categories, 23K stores, 87 cities. Housing 42%." },
  { id: 4, type: "standard", front: "Name the three CPI biases and explain each briefly.", back: "All three cause CPI to OVERSTATE true cost-of-living increases. BLS corrections reduced total to ~0.5%/yr.\n\n1. Substitution bias: Fixed basket ignores switching. Beef rises → buy chicken. Actual spending increase < what fixed basket implies.\n\n2. Quality bias: Better products cost 'the same.' 2024 smartphone = 2020 price but far better camera/battery. CPI may count as zero inflation — misses real-value gain.\n\n3. New goods bias: Streaming, smartwatches started expensive and dropped rapidly. CPI basket adds them slowly, misses early price declines.", hint: "Substitution · Quality · New goods. All overstate inflation. ~0.5%/yr total." },
  { id: 5, type: "standard", front: "What is Core CPI, why does it exist, and what does the Hurricane Katrina case show?", back: "Core CPI = CPI minus food and energy.\n\nWhy: Food and energy prices swing wildly due to weather, geopolitics, and commodity markets — short-term noise that obscures the underlying trend.\n\nCore reveals the persistent, demand-driven inflation trend — 'the part caused by too much money chasing too few goods, not by a cold winter.'\n\nKatrina (2005): Gas spiked 40¢/gallon in a day. Headline CPI jumped. Core barely moved — correctly signaling a supply disruption, not a trend. Fed held steady → right call. Headline came back down within weeks.\n\nAnalogy: 'Weighing yourself while holding grocery bags — Core CPI removes the bags.' FRED: CPILFESL", hint: "CPI minus food & energy. Strips noise. Katrina: headline spiked, core flat → Fed held → correct." },
  { id: 6, type: "standard", front: "What are the three harms inflation causes? (Your slides' framework)", back: "Framing: 'If wages and prices rose at the same rate, at the same time, inflation would be harmless. They don't.'\n\n1. Redistribution of purchasing power — cash holders/savers/lenders/fixed-pension retirees lose. Borrowers with fixed rates benefit (Real Rate = Nominal − Inflation). Unintended and arbitrary.\n\n2. Blurred price signals — prices are the economy's GPS. Inflation adds static. Can't tell genuine scarcity from noise. Israel 1985: 500% inflation → stores stopped posting prices → GPS broken.\n\n3. Long-term planning problems — retirement savings, business investment require stable price expectations. High inflation converts productive decisions into inflation-hedging exercises.", hint: "Redistribution · Blurred signals · Planning problems. Real Rate = Nominal − Inflation." },
  { id: 7, type: "cloze", front: "Complete: Real Interest Rate = _______ − _______", back: "Real Interest Rate = Nominal Rate − Inflation Rate\n\nExamples:\n• Saver earns 2% nominal, inflation = 6% → Real return = −4% (losing purchasing power)\n• Borrower pays 4% fixed, inflation = 8% → Real rate = −4% (effectively paid to borrow)\n• Homeowner: home value rises with inflation, mortgage stays fixed → net real wealth grows\n\n'Inflation transfers wealth from savers and lenders to borrowers and asset owners.'", hint: "Real = Nominal − Inflation. Saver at 2% with 6% inflation = −4% real." },
  { id: 8, type: "standard", front: "What happened in Israel 1985 and what does it illustrate?", back: "Israel 1985: 500% annual inflation.\n\n— Stores stopped posting prices — they changed every few hours, then every few hours.\n— Shoppers couldn't compare costs or make informed decisions.\n— Businesses couldn't plan inventory.\n— The economy's GPS was broken — firms and households navigated blind.\n\nIllustrates Harm #2: Blurred price signals. In a market economy, prices convey supply/demand information. High inflation adds so much static that even basic allocation decisions become unreliable.\n\nIsrael's stabilization plan (June 1985) cut inflation to ~20% within a year, then to single digits. Economic normalization followed.", hint: "500% inflation. Stores stopped posting prices. Economy's GPS broken. 1985 stabilization plan worked." },
  { id: 9, type: "standard", front: "Name all the indexing tools your slides cover — private and government.", back: "Private markets:\n• COLAs (Cost-of-Living Adjustments) — wages rise automatically with CPI. Example: COLA + 3% base; if inflation = 5%, total raise = 8%.\n• ARMs (Adjustable-Rate Mortgages) — interest rates adjust with inflation; borrowers get lower initial rates since lender bears less inflation risk.\n\nGovernment programs:\n• Social Security — benefits adjusted annually by CPI. 2022–23 COLA = 8.7% (largest in 40 years).\n• Tax brackets — indexed since 1981 to prevent 'bracket creep.'\n• TIPS bonds — Treasury Inflation-Protected Securities; principal adjusts with CPI, guaranteeing real return above inflation.\n\nCaveat: indexing is partial — not every employer offers COLAs, not every saver has access to TIPS.", hint: "COLAs · ARMs · Social Security · Tax brackets (1981) · TIPS. Partial — not universal." },
  { id: 10, type: "standard", front: "What is Venezuela's hyperinflation case, and what is the lesson?", back: "Venezuela 2018 peak: ~130,000% annual inflation (IMF estimate)\n• 7M+ Venezuelans emigrated 2015–2023\n• 3+ currency redenominations (cutting off 5 zeros, then 6 zeros)\n\nCause: Oil revenue (95% of exports) collapsed after 2014 → government printed money to fund fiscal deficits → Bolívar lost virtually all value → informal dollarization (businesses switched to USD/euros) → legalized in 2021.\n\nLesson: 'Hyperinflation is a fiscal and monetary policy failure — not an act of nature. Friedman's law holds: too much money chasing too few goods always ends the same way.'", hint: "~130,000% (2018). Money printing to fund deficits. 7M+ emigrated. Policy failure, not nature." },
  { id: 11, type: "standard", front: "Distinguish good deflation from bad deflation with examples of each.", back: "Good deflation — driven by productivity and innovation:\n• Prices fall because supply increases and costs drop\n• Flat-screen TVs: $10,000 → $300\n• Computing power: 1/1,000th the cost of 20 years ago\n• Solar panels: 90% cost reduction since 2010\n• Genome sequencing: $100M (2001) → ~$500 today\n• McCloskey's 'Bourgeois Deal' — innovation making everyone better off\n\nBad deflation — driven by collapsing demand:\n• Nobody is buying → firms cut prices, then wages, then workers\n• Deflationary spiral: consumers delay ('cheaper tomorrow') → less revenue → layoffs → less income → less spending → repeat\n• Debts harder to repay in real terms\n• Made the Great Depression devastating; Japan's 'Lost Decade' shows it can persist for years", hint: "Good: productivity (TVs/solar). Bad: demand collapse → spiral. Great Depression. Japan." },
  { id: 12, type: "standard", front: "What are your slides' three personal-finance takeaways for living with inflation?", back: "1. Watch REAL raises, not nominal raises\n— A 3% raise with 5% inflation is a 2% real pay cut\n— Always ask: 'Is my raise above CPI?' If not, standard of living is declining even as paycheck grows\n\n2. Use inflation-indexed savings\n— TIPS and I-Bonds protect principal from inflation\n— High-yield savings prevents cash from 'rotting'\n— Stocks and real estate have historically beaten inflation over long horizons — cash does not\n\n3. Avoid long fixed-income lock-ins when inflation expectations rise\n— Long-duration bonds lose value rapidly when inflation rises\n— Short-duration bonds and floating-rate instruments adjust faster\n— Don't lock in 3% for 30 years if inflation might run 5%\n\n'Inflation is a tax on cash and on lazy money. Indexing is the simplest defense.'", hint: "Watch real raises · Indexed savings (TIPS/stocks) · Avoid long fixed-income lock-ins." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH9_CARDS]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const total = deck.length;
  const masteredCount = masteredIds.size;
  const allDone = masteredIds.size + reviewIds.size === total;
  const card = deck[cardIdx];
  function stripCloze(text: string) { return text.replace(/\{\{c\d+::([^}]+)\}\}/g, "____"); }
  function handleMastered() { setMasteredIds(prev => new Set([...prev, card.id])); setFlipped(false); if (cardIdx < deck.length - 1) setCardIdx(i => i + 1); }
  function handleReview() { setReviewIds(prev => new Set([...prev, card.id])); setFlipped(false); if (cardIdx < deck.length - 1) setCardIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch9 Inflation</p>
        <p className="text-muted-foreground text-xs">Work through all {total} cards. Mark each Mastered or Review. Complete all cards to unlock the quiz.</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-green-700 font-semibold">✓ Mastered: {masteredCount}</span>
          <span className="text-amber-700 font-semibold">↩ Review: {reviewIds.size}</span>
          <span className="text-muted-foreground">Remaining: {total - masteredIds.size - reviewIds.size}</span>
        </div>
      </div>
      {!allDone ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">Card {cardIdx + 1} of {total}</p>
          <div onClick={() => setFlipped(f => !f)} className="bg-card border-2 border-border rounded-2xl p-6 min-h-[180px] cursor-pointer flex flex-col justify-between hover:border-primary transition">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{flipped ? "Answer" : card.type === "cloze" ? "Fill in the blank" : "Question"}</p>
              <p className="text-sm font-semibold text-foreground whitespace-pre-line">{flipped ? card.back : stripCloze(card.front)}</p>
            </div>
            {!flipped && <p className="text-xs text-muted-foreground italic mt-3">Hint: {card.hint}</p>}
            <p className="text-xs text-primary mt-3 text-right">{flipped ? "Click to flip back" : "Click to reveal answer"}</p>
          </div>
          {flipped && (
            <div className="flex gap-3">
              <button onClick={handleReview} className="flex-1 py-2.5 border-2 border-amber-400 text-amber-700 rounded-xl font-semibold text-sm hover:bg-amber-50 transition">↩ Review Again</button>
              <button onClick={handleMastered} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition">✓ Mastered</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold text-sm">All {total} cards complete!</p>
            <p className="text-green-700 text-xs mt-1">{masteredCount}/{total} mastered · {reviewIds.size} flagged for review</p>
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch9 deck. The quiz is now unlocked.</p>
          </div>
          <button type="button" onClick={() => onComplete(masteredCount, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz pool — 15 questions, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "Which of the following is NOT inflation, according to your slides?", options: ["The overall price level rises 4% — groceries, rent, gas, and clothing all cost more", "Tuition rises 8% while laptop prices fall 15% — that is a relative price change, not a general rise", "A hurricane spikes gas prices for two weeks, then prices return to normal — a one-time shock, not ongoing", "Both B and C — a relative price change and a one-time shock are not inflation"], correct: 3, exp: "Inflation must be general (whole price level, not one item) AND ongoing (persistent trend, not temporary). A relative price change means some prices move differently from others — not inflation. A hurricane gas spike is a supply disruption — not ongoing. Both B and C fail the inflation test. Inflation is the whole ocean rising, not one wave." },
  { q: "The BLS CPI basket tracks approximately how many products across how many stores?", options: ["~80,000 products across 23,000 stores in 87 urban areas", "~8,000 products across 2,300 stores in 50 states", "~800,000 products across 230,000 stores nationwide", "~8,000 products tracked annually using IRS tax data"], correct: 0, exp: "From your slides: ~80,000 products tracked monthly, 200+ categories, 23,000 stores surveyed, 87 urban areas, based on Consumer Expenditure Survey of ~7,000 households. About one-quarter of basket products are rotated each year. The scale ensures the CPI reflects actual prices across the full geographic and retail diversity of the U.S." },
  { q: "Using the 3-item basket from your slides (Coffee 12 cups/yr at $2.50→$2.75, T-shirt 2/yr at $18.00→$19.50, Gasoline 10 gal/yr at $3.20→$3.30): what is the inflation rate?", options: ["About 3.6% — simple average of the three price changes", "About 5.0% — unweighted sum divided by 3", "About 7.1% — (Year 2 total − Year 1 total) ÷ Year 1 total × 100", "About 9.4% — total dollar increase across all items"], correct: 2, exp: "Year 1: (12×$2.50)+(2×$18)+(10×$3.20) = $30+$36+$32 = $98. Year 2: (12×$2.75)+(2×$19.50)+(10×$3.30) = $33+$39+$33 = $105. Inflation = (105−98)/98×100 = 7/98×100 ≈ 7.14%. Use the SAME fixed quantities at each year's prices — that isolates price changes from quantity changes." },
  { q: "Housing receives a 42% weight in the CPI basket. Socks receive less than 0.1%. If rent rises 5% and socks rise 50%, which has more impact on measured CPI?", options: ["Rent — because it has a far larger spending weight (42%), its 5% increase contributes far more to CPI than the 50% sock increase", "Socks — the 50% price increase is much larger than the 5% rent increase", "They contribute equally — CPI weights all price changes the same regardless of spending share", "Socks — because the BLS counts the number of price changes, and socks qualify as a separate price change"], correct: 0, exp: "Weight × price change = contribution. Rent: 0.42 × 5% = 2.1 percentage points. Socks: ~0.001 × 50% ≈ 0.05 percentage points. Rent's contribution is 42 times larger despite its smaller percentage increase. This is the grocery receipt analogy — saffron triples but you buy one jar a year; chicken rises 20% and you feel it weekly. Weighted averages reflect real spending impact." },
  { q: "The CPI assumes you buy the same quantities of beef and chicken year after year. When beef prices jump 20% and consumers switch to chicken, which bias does this create?", options: ["Quality bias — the switch implies consumers think chicken quality improved", "Substitution bias — the fixed basket overstates actual cost increases because it ignores consumer switching", "New goods bias — chicken is a new entrant to the basket displacing beef", "Outlet bias — consumers switching to discount butchers rather than supermarkets"], correct: 1, exp: "Substitution bias: consumers adapt when relative prices change — buy more chicken when beef gets expensive. But the CPI's fixed basket assumes you keep buying the same beef quantities. This overstates your actual cost-of-living increase. BLS corrections (including the Chained CPI-U) partially address this. Total CPI overstatement from all biases is now ~0.5%/yr after BLS corrections since the early 2000s." },
  { q: "In August 2005, Hurricane Katrina caused gas prices to spike 40¢/gallon overnight. Headline CPI jumped; Core CPI barely moved. The Fed held rates steady. What does this episode teach about core inflation?", options: ["The Fed was wrong — a 40¢ gas spike always signals persistent inflation requiring rate hikes", "Core CPI correctly identified the spike as a temporary supply disruption, not a demand-driven trend — the Fed's steady hand proved right as headline inflation quickly reversed", "Core CPI is flawed because it excluded the most important price change consumers faced that month", "The Fed held rates because it was legally prohibited from raising rates during declared federal disasters"], correct: 1, exp: "Katrina is the canonical core CPI case. Core (CPI minus food & energy) barely moved because underlying demand pressure hadn't changed. The gas spike was supply-side and temporary — refineries were shut, not the whole economy. Headline came back down within weeks as refineries reopened. The Fed's steady hand was vindicated. Core strips noise to reveal the signal: 'weighing yourself without holding grocery bags.'" },
  { q: "The CPI in June 2024 was 313.1 and in June 2025 was 321.5. What is the annual inflation rate and what does the index level of 321.5 mean?", options: ["Inflation rate = 321.5%; prices are 321 times higher than last year", "Inflation rate ≈ 2.68%; the index level of 321.5 means prices are 221.5% higher than the 1982–84 base", "Inflation rate = 8.4%; prices rose by exactly $8.40 per basket item", "Inflation rate ≈ 2.68%; the index level means prices rose 321.5% since last year"], correct: 1, exp: "Inflation rate = (321.5−313.1)/313.1×100 = 8.4/313.1×100 ≈ 2.68%. The index LEVEL of 321.5 (base=100) means prices are 221.5% higher than in 1982–84 — the price level has multiplied by 3.215 since then. This is cumulative inflation compounded over ~40 years at 2–3%/yr. The annual rate is the % change in the index, not the index level itself." },
  { q: "Venezuela's inflation peaked at ~130,000% in 2018. Your slides identify the root cause as:", options: ["U.S. and EU sanctions blocking Venezuelan imports, creating unavoidable shortages", "The government printing money to fund fiscal deficits as oil revenue (95% of exports) collapsed — classic monetary overexpansion", "A natural disaster destroying agricultural capacity, triggering food-price hyperinflation", "Currency speculation by foreign hedge funds that deliberately collapsed the Bolívar"], correct: 1, exp: "Venezuela: oil revenue (95% of exports) collapsed after 2014 → government printed money to fund deficits → Bolívar lost virtually all value → 3+ redenominations (5 zeros, then 6 zeros) didn't fix the underlying printing problem → informal dollarization → legalized 2021. Lesson: 'Hyperinflation is a fiscal and monetary policy failure — not an act of nature. Friedman: too much money chasing too few goods always ends the same way.'" },
  { q: "A saver earns 2% interest; inflation runs 6%. A borrower pays 4% fixed interest; inflation runs 8%. What are their real interest rates and who wins from the inflation?", options: ["Saver: real +2%; Borrower: real +4% — both earn positive real returns regardless of inflation", "Saver: real +8%; Borrower: real −4% — savers always outperform borrowers during inflation", "Saver: real 0%; Borrower: real 0% — inflation cancels out for both parties symmetrically", "Saver: real −4% (loses); Borrower: real −4% (effectively paid to borrow) — inflation transfers wealth from saver/lender to borrower"], correct: 3, exp: "Saver: Real = 2% − 6% = −4% (purchasing power falling). Borrower: Real = 4% − 8% = −4% (effectively paid to borrow — repaying in cheaper dollars). The lender who gave the borrower the 4% loan is the loser — repaid in dollars worth less than anticipated. Inflation redistributes from savers/lenders/cash-holders to borrowers/debtors/asset-owners. 'Inflation is a tax on cash and on lazy money.'" },
  { q: "Israel experienced 500% annual inflation in 1985. Stores stopped posting prices because they changed every few hours. This illustrates which harm of inflation?", options: ["Redistribution — savers lost purchasing power to borrowers", "Blurred price signals — inflation added so much static to the price system that consumers and firms couldn't make informed decisions", "Long-term planning problems — businesses couldn't plan multi-year capital investments", "Hyperinflation always causes stores to close — the retail sector collapses first"], correct: 1, exp: "Israel 1985 illustrates Harm #2: blurred price signals. In a market economy, a rising price signals scarcity and attracts resources. At 500% inflation, no one could tell if prices were rising because of genuine scarcity or because the price level was just up. Stores stopped posting prices. Shoppers couldn't compare costs. Businesses couldn't plan inventory. The economy's GPS was broken. Israel's 1985 stabilization plan cut inflation to ~20% within a year." },
  { q: "Your slides note that '2% inflation compresses fixed pension spending power by ~33% over 20 years.' Which calculation best supports this?", options: ["(1.02)^20 ≈ 1.49 — prices rise ~49% over 20 years, so the real value of a fixed pension falls to about 1/1.49 ≈ 67 cents on the dollar", "2% × 20 years = 40% reduction — simple multiplication gives the answer", "(1.02)^20 ≈ 2.0 — prices double in 20 years at 2%, so purchasing power is cut in half", "0.02 × 20 = 0.40 — purchasing power falls by 40 cents per dollar"], correct: 0, exp: "(1.02)^20 ≈ 1.486. Prices rise ~49% over 20 years at 2% inflation. A fixed $3,000/month pension in 2005 buys $3,000 ÷ 1.486 ≈ $2,018 worth of goods in 2025 — about a 33% real reduction. Rule of 70: at 2%, prices double every 35 years; over 20 years that's about 57% of a doubling. Even 'low' moderate inflation significantly erodes the real value of fixed incomes over long periods." },
  { q: "A union contract adds COLA + 3% base. If CPI rises 5%, what is the total raise and why does indexing matter?", options: ["Total raise = 8% — COLA preserves real purchasing power by keeping wages tied to the price level", "Total raise = 3% — the COLA replaces the base rather than adding to it", "Total raise = 5% — the base is irrelevant once COLA kicks in", "Total raise = 2% — COLA subtracts inflation from the base raise"], correct: 0, exp: "Total raise = base (3%) + COLA adjustment (5% inflation) = 8%. This keeps real purchasing power roughly constant: nominal wages rise with prices. Without a COLA, a 3% raise with 5% inflation is a 2% real pay cut. Social Security's 2022–23 COLA was 8.7% — the largest in 40 years — because post-COVID CPI spiked. Indexing is the defense against inflation eroding the real value of fixed incomes." },
  { q: "Flat-screen TVs fell from $10,000 to $300. Solar panels cost 90% less than in 2010. Your slides call this 'good deflation.' What makes it good?", options: ["Good deflation only occurs when the government subsidizes production to reduce prices", "These price drops are driven by productivity and innovation — supply increases as costs drop, making everyone better off without the demand-collapse spiral", "Good deflation is only 'good' when it occurs in luxury goods that most consumers don't need", "These are examples of deflation that the BLS doesn't measure, so they don't count as real deflation"], correct: 1, exp: "Good deflation = supply-side productivity: more output at lower cost through technology and innovation. Flat-screen TVs, solar panels, computing power (1/1,000th the cost of 20 years ago), genome sequencing ($100M → $500). McCloskey's 'Bourgeois Deal': innovation making everyone better off. Bad deflation = demand-collapse → deflationary spiral → firms cut prices then workers → less income → less spending → repeat (Great Depression, Japan's Lost Decade)." },
  { q: "Which of the following personal-finance moves does your chapter recommend for managing inflation risk?", options: ["Hold cash as a hedge — cash is the safest asset during inflation", "Avoid all debt during inflation — fixed-rate loans become more expensive in real terms", "Lock in long-term bond rates early — locking in before inflation rises protects your return", "Watch real raises not nominal; use TIPS/I-bonds/stocks; avoid long fixed-income lock-ins when inflation is rising"], correct: 3, exp: "Three takeaways: (1) Watch REAL raises — 3% raise with 5% inflation = −2% real; (2) Use indexed savings — TIPS and I-Bonds protect principal, stocks and real estate beat inflation over long horizons, cash does not; (3) Avoid long fixed-income lock-ins — when inflation expectations rise, long-duration bonds lose value rapidly, short-duration and floating-rate instruments adjust faster. 'Inflation is a tax on cash and on lazy money. Indexing is the simplest defense.'" },
  { q: "Your slides state: 'Price stability requires money growth ≈ output growth.' (Friedman). Which scenario violates this rule and causes inflation?", options: ["The money supply grows 3% per year while real GDP also grows 3% per year", "The government prints money to fund fiscal deficits while real output stagnates or falls — too much money chasing too few goods", "The central bank raises interest rates to reduce lending and slow money creation", "Productivity booms increase real output faster than the money supply grows"], correct: 1, exp: "Friedman's quantity theory: inflation = money growth − output growth. If money grows 3% and output grows 3%, prices are stable. If money grows 20% and output falls 5% (Venezuela), inflation = 25%+ and accelerates. Printing money to fund deficits without corresponding output growth is the direct cause of hyperinflation in every historical case — Venezuela, Zimbabwe, Germany 1923, Hungary 1946. The Fed's job is to keep money growth roughly in line with real output growth." },
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
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progress/STATIONS.length)*100}%` }} /></div>
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
            const idx = STATION_ORDER.indexOf(s.id);
            const done = idx < currentIdx || completed.has(s.id);
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
        <div className="w-24 hidden md:block shrink-0">
          <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(currentIdx/(NAV_STATIONS.length-1))*100}%` }} />
          </div>
        </div>
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
