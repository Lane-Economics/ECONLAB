import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Station =
  | "intro"
  | "macro"
  | "whatgdp"
  | "components"
  | "realvnom"
  | "cycle"
  | "compare"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch6";

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
// Station 1 — Why Macro Matters + Economic Dashboard
// ─────────────────────────────────────────────
const MACRO_QS = [
  {
    q: "Your slides open with the question: 'How is the economy doing right now — and how would we know?' Why can't we rely on personal experience alone to answer this?",
    options: [
      "Personal experience is always accurate because people know their own situation best",
      "Your job may be great while the broader economy struggles — or vice versa. We need shared, objective measures to have an honest conversation beyond any one person's situation",
      "Personal experience is too emotional to be useful in economic analysis",
      "Only government officials have enough information to assess the economy",
    ],
    correct: 1,
    exp: "Macroeconomics gives us shared, objective measures — data, not vibes. Your personal situation can diverge sharply from the broader economy. GDP, unemployment, and inflation let everyone evaluate economic performance using the same yardstick.",
  },
  {
    q: "Your slides identify three macroeconomic goals. Which of the following is the correct set?",
    options: [
      "Low taxes, high exports, and full employment",
      "Steady economic growth, low unemployment, and stable prices (low inflation)",
      "Balanced government budget, high GDP, and low interest rates",
      "Full employment, zero inflation, and positive trade balance",
    ],
    correct: 1,
    exp: "The three macro goals from your slides: (1) Steady economic growth, (2) Low unemployment, (3) Stable prices / low inflation. These three goals are sometimes in tension — the rest of the course explores how policymakers balance them.",
  },
  {
    q: "Your slides describe a 'Goals → Framework → Policy Tools' structure. Which of the following correctly matches each column?",
    options: [
      "Goals: AD/AS model | Framework: Monetary policy | Tools: Low unemployment",
      "Goals: Steady growth, low unemployment, stable prices | Framework: AD/AS, Keynesian, Neoclassical models | Tools: Monetary policy (Fed) and Fiscal policy (Congress + President)",
      "Goals: Federal Reserve targets | Framework: Budget deficits | Tools: Tax cuts",
      "Goals: Trade surplus | Framework: Exchange rates | Tools: Tariffs and quotas",
    ],
    correct: 1,
    exp: "Macro follows a three-step logic: Goals (what we want) → Framework (how we analyze: AD/AS, Keynesian, Neoclassical) → Policy Tools (how we respond: monetary policy by the Fed, fiscal policy by Congress and the President). This structure organizes the entire course.",
  },
  {
    q: "The economic dashboard slide shows six key indicators. Which indicator is described as 'our anchor for this chapter'?",
    options: [
      "Unemployment rate",
      "Federal Funds Rate",
      "Gross Domestic Product (GDP)",
      "Federal debt as % of GDP",
    ],
    correct: 2,
    exp: "GDP — total output of final goods and services — is the anchor for Chapter 6. The other five indicators (unemployment rate, labor force participation, inflation rate, federal funds rate, and debt/GDP) each get their own chapters in this course.",
  },
];

function MacroStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = MACRO_QS[idx];
  const isLast = idx === MACRO_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-1">Why Macroeconomics Matters</p>
        <p className="text-muted-foreground text-xs">Macroeconomics asks the big-picture questions: What causes recessions? Why does unemployment persist? Why do living standards differ across countries? We need shared, objective data — not just personal experience — to answer them.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {[["Goals", "What we want", "Steady growth · Low unemployment · Stable prices"],
            ["Framework", "How we analyze", "AD/AS · Keynesian · Neoclassical"],
            ["Policy Tools", "How we respond", "Fed (monetary) · Congress (fiscal)"]
          ].map(([title, sub, items]) => (
            <div key={title} className="bg-background border border-border rounded-lg p-2">
              <p className="font-semibold text-foreground text-xs">{title}</p>
              <p className="text-muted-foreground text-xs italic">{sub}</p>
              <p className="text-muted-foreground text-xs mt-1">{items}</p>
            </div>
          ))}
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MACRO_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — What GDP Is (definition, what counts/doesn't, geography)
// ─────────────────────────────────────────────
const WHATGDP_QS = [
  {
    q: "Which of the following is the correct definition of GDP from your slides?",
    options: [
      "The total income earned by U.S. citizens anywhere in the world",
      "The market value of all final goods and services produced within a country's borders in a given time period",
      "The total value of all goods traded in domestic markets, including used goods",
      "The sum of all wages, profits, and rents earned by U.S. residents",
    ],
    correct: 1,
    exp: "GDP = market value + final goods and services + within a country's borders + given time period. As of Q1 2026, U.S. GDP was approximately $30.2 trillion — the total output of about 330 million people in a single quarter.",
  },
  {
    q: "A tire manufacturer sells tires to Ford, which installs them on a new F-150 truck sold to a consumer. According to your slides, what gets counted in GDP?",
    options: [
      "Both the tire sale to Ford and the truck sale to the consumer",
      "Only the truck's final sale price — which already includes the tires' value",
      "Only the tire — it is the primary component",
      "Neither — vehicle production uses intermediate goods throughout",
    ],
    correct: 1,
    exp: "Only the final sale (the truck to the consumer) counts. The tire sold to Ford is an intermediate good — already embedded in the truck's sticker price. Counting both would be double-counting. The bread chain works the same way: wheat and flour are intermediate; only the bread sold to you is counted.",
  },
  {
    q: "Which of the following is NOT counted in U.S. GDP?",
    options: [
      "A new home purchased by a family",
      "Roads built by the federal government",
      "Social Security payments sent to retirees",
      "Healthcare services purchased by households",
    ],
    correct: 2,
    exp: "Social Security payments are transfer payments — redistribution, not new production. No good or service was produced in exchange. GDP measures production. Also excluded: used goods (already counted when first produced), stocks and bonds (financial trades, not production), and illegal markets.",
  },
  {
    q: "BMW manufactures cars in Spartanburg, South Carolina using U.S. workers. Apple assembles iPhones in China. A Toyota Camry is built in Georgetown, Kentucky. Which of the following correctly applies the 'geography, not nationality' rule?",
    options: [
      "BMW counts in German GDP; Toyota counts in Japanese GDP; Apple counts in U.S. GDP",
      "BMW counts in U.S. GDP; iPhone assembly counts in Chinese GDP; Toyota Camry counts in U.S. GDP",
      "All three count in U.S. GDP because they are sold to American consumers",
      "None count in U.S. GDP because none are American-owned companies",
    ],
    correct: 1,
    exp: "GDP follows production location, not company nationality. BMW in South Carolina = U.S. GDP (production on U.S. soil). iPhone assembled in China = Chinese GDP (the assembly value added there). Toyota Camry in Kentucky = U.S. GDP — trick question, but it IS counted because it's made on U.S. soil, regardless of Toyota being Japanese.",
  },
];

function WhatGDPStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = WHATGDP_QS[idx];
  const isLast = idx === WHATGDP_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-1">What GDP Is — and Isn't</p>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-green-700 mb-1">✓ Counted</p>
            <p className="text-muted-foreground">Consumption · Investment · Government purchases · Net exports</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-red-600 mb-1">✗ Not Counted</p>
            <p className="text-muted-foreground">Intermediate goods · Transfer payments · Used goods · Stocks/bonds · Illegal markets</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Geography rule: GDP follows where production happens, not who owns the company. U.S. GDP ≈ $30.2 trillion (Q1 2026).</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={WHATGDP_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — The Expenditure Components (C + I + G + NX)
// ─────────────────────────────────────────────
const COMPONENTS_QS = [
  {
    q: "GDP = C + I + G + NX. Which component is the largest, and approximately what share of GDP does it represent?",
    options: [
      "Government purchases (G) — about 40%",
      "Consumption (C) — about 68%",
      "Investment (I) — about 45%",
      "Net Exports (NX) — about 25%",
    ],
    correct: 1,
    exp: "Consumption (C) is by far the largest component at ~68% of GDP. It includes services (~45% — healthcare, education, streaming, restaurants), non-durable goods (~15% — food, clothing, gasoline), and durable goods (~8% — cars, appliances, electronics). The U.S. is a service economy.",
  },
  {
    q: "In macroeconomics, 'Investment (I)' means something specific. Which of the following is the correct definition?",
    options: [
      "Buying stocks and bonds on Wall Street",
      "Creating new physical capital: business equipment, new housing, and inventory changes",
      "Saving money in a bank account for future use",
      "Government spending on infrastructure",
    ],
    correct: 1,
    exp: "In macro, Investment = creating NEW physical capital. Business fixed (factories, equipment, software — like Amazon building a fulfillment center or a hospital buying MRIs), residential (new homes and condos), and inventory changes. Buying stocks is a financial transaction — NOT investment in the GDP sense.",
  },
  {
    q: "You buy a $1,000 iPhone assembled in China. Your slides show a worked example of how this affects U.S. GDP. What is the net effect on U.S. GDP?",
    options: [
      "+$1,000 — it counts as consumption",
      "−$1,000 — imports reduce GDP",
      "$0 — it is counted in C (+$1,000) but subtracted as an import in NX (−$1,000)",
      "+$1,000 initially, then adjusted next quarter",
    ],
    correct: 2,
    exp: "Your purchase is counted in C (+$1,000) because you spent on consumption. But it's immediately offset in NX (−$1,000) because it was produced in China, not the U.S. Net effect on U.S. GDP = $0. Imports are subtracted not because they're 'bad' — but to back out what was NOT produced domestically. GDP measures domestic production.",
  },
  {
    q: "The U.S. has run a trade deficit (negative NX) for decades. Your slides note this is 'not a problem in itself, just an accounting fact.' What does a negative NX mean?",
    options: [
      "The U.S. is losing jobs to foreign countries",
      "American consumers and businesses are buying more from abroad than foreigners buy from the U.S. — imports exceed exports",
      "The U.S. government is spending more than it collects in taxes",
      "The U.S. dollar is declining in value relative to other currencies",
    ],
    correct: 1,
    exp: "NX = Exports − Imports. When imports exceed exports, NX is negative. The U.S. NX is currently around −3% of GDP. This reflects American consumers' purchasing power and appetite for foreign goods — not inherently harmful. The slides emphasize it's an accounting fact, not a verdict on trade policy.",
  },
];

function ComponentsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = COMPONENTS_QS[idx];
  const isLast = idx === COMPONENTS_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-2">GDP = C + I + G + NX</p>
        <div className="grid grid-cols-4 gap-1.5 text-xs text-center">
          {[["C", "Consumption", "~68%", "Households buying for own use"],
            ["I", "Investment", "~17%", "New physical capital, housing, inventory"],
            ["G", "Government", "~18%", "Goods & services (not transfers)"],
            ["NX", "Net Exports", "~−3%", "Exports minus imports"]
          ].map(([letter, name, pct, desc]) => (
            <div key={letter} className="bg-background border border-border rounded-lg p-2">
              <p className="text-primary font-bold text-base">{letter}</p>
              <p className="font-semibold text-foreground text-xs">{name}</p>
              <p className="text-primary text-xs font-semibold">{pct}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Spending = Income: every dollar spent on production is a dollar earned by someone.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={COMPONENTS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Nominal vs. Real GDP
// ─────────────────────────────────────────────
const REALNOM_QS = [
  {
    q: "GDP rose 10% last year. Your slides ask: 'Did we produce more — or just charge more?' What is the difference between nominal and real GDP?",
    options: [
      "Nominal GDP uses constant prices; real GDP uses current prices",
      "Nominal GDP uses current-year prices (not adjusted for inflation); real GDP uses constant prices from a base year, so it only rises when actual production rises",
      "Nominal GDP measures only goods; real GDP measures goods and services",
      "Real GDP is always larger than nominal GDP",
    ],
    correct: 1,
    exp: "Nominal GDP can rise because we produced more OR because prices rose — you can't tell which. Real GDP strips out inflation using base-year prices, so it only rises when actual production (output) increases. When economists say 'the economy grew 2.4%,' they mean real GDP grew 2.4%.",
  },
  {
    q: "Your slides show the formula: Real GDP = Nominal GDP ÷ Price Index × 100. If nominal GDP is $22 trillion and the price index is 110, what is real GDP?",
    options: [
      "$24.2 trillion",
      "$20 trillion",
      "$22 trillion",
      "$2 trillion",
    ],
    correct: 1,
    exp: "Real GDP = $22T ÷ 110 × 100 = $20 trillion. The price index of 110 means prices are 10% higher than the base year. Dividing by 110 and multiplying by 100 removes that 10% price inflation, leaving only the real production value.",
  },
  {
    q: "Your slides show two personal scenarios. Scenario 1: you get a +5% raise but inflation is 3%. Scenario 2: your savings earn 2% interest but inflation is 8%. What is your real outcome in each scenario?",
    options: [
      "Scenario 1: +5% real; Scenario 2: +2% real",
      "Scenario 1: +2% real (you can buy 2% more); Scenario 2: −6% real (purchasing power fell — this happened to many savers in 2021–22)",
      "Scenario 1: +3% real; Scenario 2: +8% real",
      "Real outcomes equal nominal outcomes when the base year is current",
    ],
    correct: 1,
    exp: "Real value ≈ Nominal − Inflation rate. Scenario 1: 5% raise − 3% inflation = +2% real purchasing power gain. Scenario 2: 2% interest − 8% inflation = −6% real — each dollar in savings buys 6% less. This is exactly what happened to savers in 2021–22 during the post-COVID inflation surge.",
  },
];

function RealNomStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = REALNOM_QS[idx];
  const isLast = idx === REALNOM_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-1">Nominal vs. Real GDP</p>
        <p className="text-muted-foreground text-xs mb-2">GDP rose 10% — did we produce more, or just charge more? Nominal GDP can't tell you. Real GDP can.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-foreground">Nominal GDP</p>
            <p className="text-muted-foreground">Current-year prices. NOT adjusted. Can rise due to more output OR higher prices.</p>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2">
            <p className="font-semibold text-foreground">Real GDP — Use This</p>
            <p className="text-muted-foreground">Constant base-year prices. Rises ONLY when production rises.</p>
            <p className="text-primary text-xs font-semibold mt-1">= Nominal ÷ Price Index × 100</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Real value ≈ Nominal value − Inflation rate</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={REALNOM_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — The Business Cycle
// ─────────────────────────────────────────────
const CYCLE_QS = [
  {
    q: "Your slides show the four phases of the business cycle. Which correctly matches each term to its definition?",
    options: [
      "Peak = lowest GDP; Trough = highest GDP; Recession = growth; Expansion = decline",
      "Peak = highest GDP before a downturn; Recession = declining real GDP and rising unemployment; Trough = the bottom of the recession; Expansion = growth from trough back to a new peak",
      "Peak = government spending high; Trough = government spending low; Recession = trade deficit; Expansion = trade surplus",
      "Peak = low unemployment; Trough = high unemployment; Recession = high inflation; Expansion = low inflation",
    ],
    correct: 1,
    exp: "Business cycle vocabulary from your slides: Peak = highest GDP before a downturn begins. Recession = declining real GDP + rising unemployment. Trough = lowest GDP — the bottom of the recession. Expansion = growth from trough back to a new peak. The NBER officially dates these phases — not a strict two-quarter rule.",
  },
  {
    q: "Your slides show the FRED real GDP chart since 1950. Three things to notice: long-run growth, recessions are visible as dips, and 12 recessions since WWII. Which recession produced the steepest short-term drop on the chart?",
    options: [
      "The Great Recession of 2008–09",
      "The COVID-19 recession of 2020",
      "The 1981–82 recession under Volcker",
      "The dot-com recession of 2001",
    ],
    correct: 1,
    exp: "The 2020 COVID recession produced the steepest short-term drop in real GDP on record — a near-vertical plunge in Q2 2020 followed by a sharp recovery. The 2008 Great Recession was deeper in total output lost but slower. Your slide notes 12 recessions since WWII, including both.",
  },
  {
    q: "Your slides note that real GDP roughly doubles every 25–30 years. What does this long-run growth trend tell us about the business cycle recessions visible on the chart?",
    options: [
      "Recessions permanently reduce the economy's growth path",
      "Despite short-term recessions, the long-run trend of real GDP is upward — the economy grows significantly over decades",
      "The long-run trend is flat — growth only comes from population increases",
      "Each recession is larger than the previous one, threatening the long-run trend",
    ],
    correct: 1,
    exp: "The big picture from slide 16: despite 12 recessions since WWII, real GDP has grown dramatically over the long run — roughly doubling every 25–30 years. The recessions appear as small dips on the long-run upward trend. Short-run pain, long-run gain.",
  },
];

function CycleStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = CYCLE_QS[idx];
  const isLast = idx === CYCLE_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-2">The Business Cycle</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[["Peak", "Highest GDP before a downturn begins"],
            ["Recession", "Declining real GDP · rising unemployment · dated by NBER"],
            ["Trough", "Lowest GDP — the bottom of the recession"],
            ["Expansion", "Growth from trough back to a new peak"]
          ].map(([term, def]) => (
            <div key={term} className="bg-background border border-border rounded-lg p-2">
              <p className="font-semibold text-foreground text-xs">{term}</p>
              <p className="text-muted-foreground text-xs">{def}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">12 recessions since WWII (including 2008 and 2020). NBER — not a strict 2-quarter rule — officially dates them.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={CYCLE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Comparing Countries (PPP + per capita)
// ─────────────────────────────────────────────
const COMPARE_QS = [
  {
    q: "In 2026, China's total GDP (PPP) was $36.3 trillion vs. the U.S. at $28.8 trillion. Does this mean the average Chinese citizen has a higher standard of living than the average American?",
    options: [
      "Yes — larger total GDP means more production and therefore higher living standards",
      "No — China's population is about 4× larger (1,420M vs. 340M), so GDP per capita is much lower: U.S. $84,700 vs. China $25,600",
      "Yes — PPP adjustment already accounts for population differences",
      "No — Chinese GDP figures are unreliable due to different accounting methods",
    ],
    correct: 1,
    exp: "Total GDP = the size of the pie. GDP per capita = the average slice. China's pie is bigger, but with 4× the population, the average slice is much smaller. U.S. GDP per capita ≈ $84,700 vs. China ≈ $25,600. Per capita is what matters for comparing living standards.",
  },
  {
    q: "Why do economists use Purchasing Power Parity (PPP) exchange rates rather than market exchange rates when comparing GDPs across countries?",
    options: [
      "PPP rates change less frequently, making comparisons more stable",
      "PPP adjusts for cost-of-living differences — a haircut in Mumbai costs far less than one in Manhattan, so a dollar goes much further in India than in the U.S.",
      "Market exchange rates are set by governments, which makes them unreliable",
      "PPP is required by the IMF for all official GDP comparisons",
    ],
    correct: 1,
    exp: "PPP adjusts for the fact that the same dollar buys different amounts in different countries. A haircut in Mumbai costs a fraction of one in Manhattan. Without PPP adjustment, we'd understate living standards in low-cost countries. PPP gives a fairer 'apples-to-apples' comparison of what incomes actually buy.",
  },
  {
    q: "Your slides note GDP's limits: 'GDP does not include leisure, household production, environmental quality, inequality, and well-being.' What is the practical takeaway?",
    options: [
      "GDP is a flawed measure and should be replaced immediately",
      "GDP is a useful measure of productive economic activity, but don't mistake it for everything that matters — health, education, life satisfaction, and opportunity also rise with GDP per capita, but GDP alone doesn't capture the full picture",
      "All of these factors are included in GDP through the services component",
      "Countries with higher GDP always have better outcomes on all quality-of-life measures",
    ],
    correct: 1,
    exp: "GDP correlates with many good outcomes — health, education, life satisfaction, opportunity all tend to rise with GDP per capita. But it misses leisure, household production (cooking, childcare), environmental quality, inequality, and subjective well-being. Use it — but don't mistake it for everything that matters.",
  },
];

function CompareStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = COMPARE_QS[idx];
  const isLast = idx === COMPARE_QS.length - 1;

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
        <p className="font-semibold text-foreground mb-2">Comparing Countries — 2026</p>
        <div className="rounded-lg overflow-hidden border border-border text-xs">
          <table className="w-full">
            <thead><tr className="bg-primary text-primary-foreground"><th className="text-left px-3 py-2">Country</th><th className="text-center px-3 py-2">GDP (PPP)</th><th className="text-center px-3 py-2">Population</th><th className="text-center px-3 py-2">GDP/Capita</th></tr></thead>
            <tbody>
              <tr className="border-t border-border bg-background"><td className="px-3 py-2 font-semibold">United States</td><td className="text-center px-3 py-2">$28.8T</td><td className="text-center px-3 py-2">340M</td><td className="text-center px-3 py-2 font-semibold text-green-700">$84,700</td></tr>
              <tr className="border-t border-border bg-muted/30"><td className="px-3 py-2 font-semibold">China</td><td className="text-center px-3 py-2">$36.3T</td><td className="text-center px-3 py-2">1,420M</td><td className="text-center px-3 py-2 font-semibold text-amber-700">$25,600</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">China's pie is bigger. But with 4× the population, the average slice is much smaller. Per capita is what matters for living standards.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={COMPARE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
type Flashcard = { id: number; type: "standard" | "cloze"; front: string; back: string; hint: string };

const CH6_CARDS: Flashcard[] = [
  { id: 1, type: "standard", front: "What are the three macroeconomic goals?", back: "1. Steady economic growth\n2. Low unemployment\n3. Stable prices (low inflation)\n\nThese three goals are sometimes in tension. The course explores the frameworks (AD/AS, Keynesian, Neoclassical) and policy tools (monetary policy by the Fed, fiscal policy by Congress and the President) used to pursue them.", hint: "Growth · Jobs · Prices" },
  { id: 2, type: "cloze", front: "Complete: GDP = the _______ of all _______ goods and services produced _______ a country's borders in a given time period.", back: "GDP = the MARKET VALUE of all FINAL goods and services produced WITHIN a country's borders in a given time period.\n\nU.S. GDP ≈ $30.2 trillion (Q1 2026) — the total output of about 330 million people in one quarter.", hint: "Market value · Final · Within borders" },
  { id: 3, type: "standard", front: "What is the difference between a final good and an intermediate good?", back: "Final good: sold to its end user — counts in GDP.\nIntermediate good: used to make something else — already embedded in the final price.\n\nExamples from slides:\n• Wheat → Flour → Bread. Only the bread (sold to you) counts. Counting wheat and flour too = triple counting.\n• Tire sold to Ford = intermediate (not counted). New F-150 sold to buyer = final (counted — includes the tire).", hint: "Final = sold to end user. Intermediate = already in the final price." },
  { id: 4, type: "standard", front: "What is NOT counted in GDP? (4 categories)", back: "1. Intermediate goods — already embedded in final goods' price\n2. Transfer payments — Social Security, welfare, UI — redistribution, not production\n3. Used goods — already counted when first produced (a 2015 Civic was counted in 2015)\n4. Stocks and bonds — financial trades, not production (brokerage fees DO count)\n5. Illegal markets — off the books, not officially measured", hint: "Intermediate · Transfers · Used · Financial · Illegal" },
  { id: 5, type: "standard", front: "Geography vs. nationality rule in GDP", back: "GDP follows WHERE production happens, not who owns the company.\n\n✓ Counted in U.S. GDP:\n• BMW made in South Carolina (German company, U.S. production)\n• iPhone software designed in California\n• Toyota Camry built in Kentucky (Japanese company — but made on U.S. soil)\n\n✗ Not counted in U.S. GDP:\n• iPhone assembled in China (value added in China → Chinese GDP)", hint: "Production location matters, not company nationality." },
  { id: 6, type: "cloze", front: "Complete: GDP = C + I + G + NX, where C ≈ ___%, I ≈ ___%, G ≈ ___%, NX ≈ ____%.", back: "C ≈ 68% (Consumption — households buying for own use)\nI ≈ 17% (Investment — new physical capital, housing, inventories)\nG ≈ 18% (Government purchases of goods and services — not transfer payments)\nNX ≈ −3% (Net Exports = Exports − Imports)\n\nSpending = Income: every dollar spent on production is earned by someone.", hint: "C biggest at 68%. NX is negative (trade deficit)." },
  { id: 7, type: "standard", front: "What does 'Investment' mean in macroeconomics? How is it different from everyday use?", back: "In macro, Investment = creating NEW physical capital.\n\n3 types:\n1. Business fixed: factories, equipment, software (Amazon builds a fulfillment center)\n2. Residential: new homes, condos, apartments\n3. Inventory changes: unsold goods in warehouses (counted when produced, subtracted when sold)\n\nNOT investment: buying stocks or bonds. That's a financial transaction — the GDP sense is strictly about new capital creation.", hint: "New physical capital only. Stocks ≠ investment in macro." },
  { id: 8, type: "standard", front: "Why do we subtract imports in GDP? The iPhone example.", back: "C, I, and G already include imported goods. We subtract imports to back out what was NOT produced domestically.\n\nExample: You buy a $1,000 iPhone made in China.\n+ $1,000 counted in C (you spent it)\n− $1,000 subtracted in NX (it was produced in China, not the U.S.)\n= $0 net effect on U.S. GDP\n\nImports aren't subtracted because they're 'bad' — they're subtracted to avoid counting non-domestic production.", hint: "Imports cancel out of C. Net effect on GDP = $0 for imported goods." },
  { id: 9, type: "standard", front: "Nominal vs. Real GDP — what's the difference and why does it matter?", back: "Nominal GDP: current-year prices. Can rise because we produced MORE or because prices ROSE — you can't tell which.\n\nReal GDP: constant base-year prices. Rises ONLY when actual production (output) rises.\n\nFormula: Real GDP = Nominal GDP ÷ Price Index × 100\n\nPersonal analogy:\n+5% raise, 3% inflation = +2% real (you can buy 2% more)\n2% savings, 8% inflation = −6% real (happened to savers in 2021–22)", hint: "Real beats nominal. Nominal = current prices. Real = inflation removed." },
  { id: 10, type: "standard", front: "Business cycle vocabulary: Peak, Recession, Trough, Expansion", back: "Peak: highest GDP before a downturn begins\nRecession: declining real GDP + rising unemployment (dated by NBER, not a strict 2-quarter rule)\nTrough: lowest GDP — the bottom of the recession\nExpansion: growth from trough back to a new peak\n\nFRED data facts: 12 recessions since WWII (including 2008 and 2020). Real GDP roughly doubles every 25–30 years despite recessions.", hint: "Peak → Recession → Trough → Expansion. 12 since WWII." },
  { id: 11, type: "standard", front: "How do we compare GDP across countries fairly?", back: "Two adjustments needed:\n1. Different currencies → use Purchasing Power Parity (PPP) exchange rates, which adjust for cost-of-living differences (a haircut in Mumbai costs far less than in Manhattan)\n2. Different population sizes → use GDP per capita = total GDP ÷ population\n\n2026 example:\nU.S.: $28.8T PPP / 340M people = $84,700 per capita\nChina: $36.3T PPP / 1,420M people = $25,600 per capita\nChina's pie is bigger — but the average slice is much smaller.", hint: "PPP for currency. Per capita for population. Both needed." },
  { id: 12, type: "standard", front: "What does GDP miss? The limits of GDP as a measure.", back: "GDP does NOT measure:\n• Leisure time\n• Household production (cooking, childcare, DIY)\n• Environmental quality\n• Income inequality\n• Subjective well-being\n\nYet GDP per capita correlates with: health, education, life satisfaction, and opportunity.\n\nKey takeaway from slides: 'Use it — but don't mistake it for everything that matters.' GDP isn't everything, but it correlates with much of what matters.", hint: "Misses leisure, household work, environment, inequality, well-being." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH6_CARDS]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const total = deck.length;
  const masteredCount = masteredIds.size;
  const allDone = masteredIds.size + reviewIds.size === total;
  const card = deck[cardIdx];

  function stripCloze(text: string) { return text.replace(/\{\{c\d+::([^}]+)\}\}/g, "____"); }

  function handleMastered() {
    setMasteredIds(prev => new Set([...prev, card.id]));
    setFlipped(false);
    if (cardIdx < deck.length - 1) setCardIdx(i => i + 1);
  }

  function handleReview() {
    setReviewIds(prev => new Set([...prev, card.id]));
    setFlipped(false);
    if (cardIdx < deck.length - 1) setCardIdx(i => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch6 GDP</p>
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
          <div onClick={() => setFlipped(f => !f)}
            className="bg-card border-2 border-border rounded-2xl p-6 min-h-[180px] cursor-pointer flex flex-col justify-between hover:border-primary transition">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {flipped ? "Answer" : card.type === "cloze" ? "Fill in the blank" : "Question"}
              </p>
              <p className="text-sm font-semibold text-foreground whitespace-pre-line">
                {flipped ? card.back : stripCloze(card.front)}
              </p>
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
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch6 deck. The quiz is now unlocked.</p>
          </div>
          <button type="button" onClick={() => onComplete(masteredCount, total)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz pool
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "Which of the following is the correct definition of GDP?", options: ["Total income earned by U.S. citizens worldwide", "Market value of all final goods and services produced within a country's borders in a given time period", "Total value of all goods and services consumed by households", "Sum of all wages and profits earned inside the country"], correct: 1, exp: "GDP = market value + final goods/services + within borders + given time period. U.S. GDP ≈ $30.2 trillion as of Q1 2026 — the output of ~330 million people in one quarter." },
  { q: "Which of the following is NOT counted in GDP?", options: ["A new home purchased by a family", "A government road construction project", "Social Security payments to retirees", "Healthcare services at a hospital"], correct: 2, exp: "Social Security is a transfer payment — redistribution of income, not new production. GDP measures production of goods and services. Also excluded: intermediate goods, used goods, stocks and bonds, and illegal markets." },
  { q: "A flour mill sells flour to a bakery for $0.50. The bakery uses it to bake a loaf of bread sold to a consumer for $3.00. How much does GDP increase?", options: [
      "$3.50 (both the flour and the bread)",
      "$0.50 (the flour is the primary input)",
      "$2.50 (the value added by the bakery only)",
      "$3.00 (only the final sale to the consumer)",
    ], correct: 3, exp: "Only the final sale to the consumer ($3.00) counts. The flour sold to the bakery is an intermediate good — already embedded in the bread's price. Counting both would be double-counting." },
  { q: "BMW manufactures cars in South Carolina using U.S. workers. Does this production count in U.S. GDP?", options: [
      "Yes — production happens on U.S. soil, so it counts in U.S. GDP regardless of who owns BMW",
      "No — BMW is a German company, so it counts in German GDP",
      "Only the U.S. workers' wages count, not the full production value",
      "Only if BMW exports the cars outside the U.S.",
    ], correct: 0, exp: "GDP follows geography, not nationality. Production on U.S. soil = U.S. GDP. It doesn't matter that BMW is a German company — the production (and the workers, machinery, and value added) occurred within U.S. borders." },
  { q: "In macroeconomics, 'Investment' (I) in GDP = C + I + G + NX refers to:", options: ["Buying stocks and bonds on financial markets", "Households saving money for retirement", "Creating new physical capital: business equipment, new housing, and inventory changes", "Government spending on social programs"], correct: 2, exp: "Investment in macro = new physical capital creation. Business fixed (factories, equipment, software), residential (new homes), and inventory changes. Buying stocks is a financial transaction — NOT investment in the GDP sense." },
  { q: "You buy a $1,500 laptop assembled in Taiwan. What is the net effect on U.S. GDP?", options: [
      "+$1,500 — it counts fully as consumption",
      "−$1,500 — imports reduce GDP by the full amount",
      "+$1,500 only if you are a U.S. citizen",
      "$0 — it is counted in C (+$1,500) but subtracted in NX (−$1,500)",
    ], correct: 3, exp: "Your purchase is counted in C (+$1,500). But since it was produced in Taiwan (not the U.S.), it is subtracted as an import in NX (−$1,500). Net effect = $0. Imports are subtracted to back out non-domestic production — not because imports are bad." },
  { q: "Nominal GDP rose from $20 trillion to $22 trillion. The price index rose from 100 to 110. What happened to real GDP?", options: ["Rose from $20T to $22T — same as nominal", "Rose from $20T to $20T — no real change (prices rose, not output)", "Rose from $20T to $24.2T", "Fell from $20T to $18T"], correct: 1, exp: "Real GDP = Nominal ÷ Price Index × 100. Year 1: $20T ÷ 100 × 100 = $20T. Year 2: $22T ÷ 110 × 100 = $20T. Real GDP didn't change — the entire nominal increase was due to higher prices (inflation), not more production." },
  { q: "You get a +4% raise but inflation is 6%. What happened to your real purchasing power?", options: [
      "−2% — inflation exceeded your raise; you can buy less than before",
      "+4% — your raise raised your purchasing power",
      "+2% — your real gain is the difference",
      "0% — inflation and wages always offset each other",
    ], correct: 0, exp: "Real value ≈ Nominal − Inflation. 4% − 6% = −2%. You can buy 2% less than before despite earning more in nominal terms. This is exactly the situation many workers faced during the 2021–22 inflation surge." },
  { q: "In the business cycle, what is a 'trough'?", options: [
      "The highest point of GDP before a downturn",
      "The period of declining GDP and rising unemployment",
      "The period of recovery and growth after a recession",
      "The lowest point of GDP — the bottom of a recession",
    ], correct: 3, exp: "Trough = the lowest point of GDP in a business cycle — the bottom of the recession. After the trough, the economy enters expansion. The NBER officially dates business cycle peaks and troughs — not a strict two-quarter rule." },
  { q: "Real GDP in the U.S. has roughly doubled every 25–30 years since WWII, despite 12 recessions. What does this tell us?", options: [
      "Recessions are getting longer and more severe over time",
      "GDP growth is driven entirely by population growth",
      "The long-run growth trend of real GDP is upward — recessions are temporary setbacks, not permanent losses",
      "Only government policy can sustain long-run GDP growth",
    ], correct: 2, exp: "Despite 12 recessions, the long-run real GDP trend is strongly upward — doubling roughly every 25–30 years. Recessions appear as temporary dips on the FRED chart's long upward trend. Short-run pain, long-run gain." },
  { q: "China's total GDP (PPP) is larger than the U.S. Does this mean China has a higher standard of living per person?", options: ["Yes — more total output means more for everyone", "No — with ~4× the U.S. population, China's GDP per capita ($25,600) is far lower than the U.S. ($84,700)", "Yes — PPP adjustment already accounts for population", "No — Chinese GDP data cannot be trusted"], correct: 1, exp: "Total GDP = size of the pie. GDP per capita = the average slice. China's pie is bigger, but with 1,420M people vs. the U.S.'s 340M, the average slice is much smaller: $25,600 vs. $84,700. Per capita is what matters for comparing living standards." },
  { q: "Why do economists use Purchasing Power Parity (PPP) rather than market exchange rates to compare GDP across countries?", options: [
      "PPP adjusts for cost-of-living differences — a dollar buys far more in India than in Manhattan, so PPP gives a fairer comparison of what incomes actually purchase",
      "PPP exchange rates are set by international agreement and are more stable",
      "Market exchange rates fluctuate too much to be useful for any comparison",
      "PPP is required by law for all international comparisons",
    ], correct: 0, exp: "Market exchange rates reflect currency supply and demand — not what money actually buys in daily life. PPP adjusts for cost-of-living: a haircut in Mumbai costs a fraction of one in Manhattan. PPP gives a 'real purchasing power' comparison rather than just a currency conversion." },
  { q: "Your slides note that GDP misses leisure, household production, and environmental quality, but 'GDP correlates with what matters.' Which statement best captures this nuance?", options: [
      "GDP is a fundamentally flawed measure and should be abandoned",
      "GDP perfectly captures all dimensions of economic well-being",
      "GDP is a useful measure of productive activity but is not a complete measure of well-being — health, education, and life satisfaction tend to rise with per-capita GDP, but GDP alone doesn't capture everything",
      "GDP should be replaced with a 'happiness index'",
    ], correct: 2, exp: "The key takeaway: use GDP as the powerful, imperfect tool it is. It correlates strongly with health, education, opportunity, and life satisfaction. But it misses leisure, household work, environmental quality, and inequality. Don't mistake it for everything — but don't dismiss it either." },
  { q: "Which of the three macroeconomic goals from your slides does Chapter 6's GDP topic most directly address?", options: [
      "Low unemployment",
      "Stable prices (low inflation)",
      "Balanced government budget",
      "Steady economic growth",
    ], correct: 3, exp: "GDP is the primary measure of economic output and growth. Steady economic growth — rising real GDP over time — is the macro goal most directly tracked by GDP. The other indicators (unemployment rate, inflation rate, etc.) get their own chapters." },
  { q: "The NBER (National Bureau of Economic Research) officially dates U.S. recessions. Your slides note this is NOT based on a strict two-quarter rule. What does this mean?", options: [
      "The NBER looks at the breadth, depth, and duration of economic decline across multiple indicators — not just whether GDP fell for two consecutive quarters",
      "The NBER uses only unemployment data, not GDP",
      "A recession requires exactly six months of negative GDP growth",
      "Only Congress can officially declare a recession",
    ], correct: 0, exp: "The NBER uses a holistic judgment: breadth (how many sectors are affected), depth (how severe), and duration. A recession can be declared even without two full consecutive quarters of negative GDP growth — as in the 2020 COVID recession, which was brutal but brief." },
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
        <p className="font-semibold text-foreground">Chapter 6 Quiz</p>
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
const STATION_LABELS_CH6: Record<string, string> = {
  macro: "Why Macro Matters & Dashboard",
  whatgdp: "What GDP Is",
  components: "Expenditure Components (C+I+G+NX)",
  realvnom: "Nominal vs. Real GDP",
  cycle: "The Business Cycle",
  compare: "Comparing Countries",
  flash: "Flashcard Review",
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
    const stationTableRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score}/${r.total}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score === r.total ? "✓" : r.score >= r.total * 0.7 ? "Good" : "Review"}</td></tr>`).join("");
    const quizRows = results.map((r, i) => `<tr style="background:${r.correct ? "#f0fdf4" : "#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct ? "✓" : "✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch6 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 6 — The Macroeconomic Perspective</h2>
    <p style="font-size:0.9rem;color:#475569"><strong>Student:</strong> ${name || "—"} &nbsp;&nbsp; <strong>Date:</strong> ${now}</p>
    <div class="score-box"><p>Quiz Score: ${score}/10 — ${score >= 9 ? "PASSED ✓" : "Not Yet"}</p></div>
    ${stationTableRows ? `<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stationTableRows}</tbody></table>` : ""}
    <h3>Quiz Question Review</h3><table><thead><tr><th style="width:40px"></th><th>Question</th><th>Explanation</th></tr></thead><tbody>${quizRows}</tbody></table>
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
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e => setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" /></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In one sentence, explain why economists use real GDP rather than nominal GDP to measure economic growth.</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e => setExitTicket(e.target.value)} rows={2} placeholder="Your response..." className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" /></div>
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
      <div className="flex gap-3">
        <button type="button" onClick={printPDF} disabled={!name.trim()} className="flex-1 py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition text-sm">🖨️ Print PDF</button>
        <button type="button" onClick={onRestart} className="flex-1 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-xl font-semibold transition text-sm">↺ Start Over</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stations, Nav, Order
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "macro"    as Station, label: "Why Macro Matters",    desc: "Three goals, economic dashboard, Goals→Framework→Tools", icon: "📊" },
  { id: "whatgdp"  as Station, label: "What GDP Is",          desc: "Definition, what counts/doesn't, geography rule", icon: "🌐" },
  { id: "components" as Station, label: "C + I + G + NX",     desc: "The four expenditure components and their shares", icon: "🔢" },
  { id: "realvnom" as Station, label: "Nominal vs. Real",     desc: "Adjusting for inflation to see true production growth", icon: "📈" },
  { id: "cycle"    as Station, label: "The Business Cycle",   desc: "Peaks, recessions, troughs, expansions, NBER", icon: "🔄" },
  { id: "compare"  as Station, label: "Comparing Countries",  desc: "PPP, GDP per capita, and the limits of GDP", icon: "🌍" },
  { id: "flash"    as Station, label: "Flashcard Review",     desc: "Master all 12 key Ch6 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",      label: "Dashboard" },
  { id: "macro",      label: "Why Macro" },
  { id: "whatgdp",    label: "What GDP Is" },
  { id: "components", label: "C+I+G+NX" },
  { id: "realvnom",   label: "Real/Nom" },
  { id: "cycle",      label: "Business Cycle" },
  { id: "compare",    label: "Countries" },
  { id: "flash",      label: "Flashcards" },
  { id: "quiz",       label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","macro","whatgdp","components","realvnom","cycle","compare","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Summary Modal
// ─────────────────────────────────────────────
const CH6_SUMMARY = [
  { heading: "6.1 Measuring the Size of the Economy: Gross Domestic Product", body: "Economists generally express the size of a nation\'s economy as its gross domestic product (GDP), which measures the value of the output of all final goods and services produced within the country in a year. Economists measure GDP by taking the quantities of all goods and services produced, multiplying them by their prices, and summing the total. Since GDP measures what is bought and sold in the economy, we can measure it either by the sum of what is purchased in the economy or what is produced.\n\nWe can divide demand into consumption, investment, government, exports, and imports. We can divide what is produced in the economy into durable goods, nondurable goods, services, structures, and inventories. To avoid double counting, GDP counts only final output of goods and services, not the production of intermediate goods or the value of labor in the chain of production." },
  { heading: "6.2 Adjusting Nominal Values to Real Values", body: "The nominal value of an economic statistic is the commonly announced value. The real value is the value after adjusting for changes in inflation. To convert nominal economic data from several different years into real, inflation-adjusted data, the starting point is to choose a base year arbitrarily and then use a price index to convert the measurements so that economists measure them in the money prevailing in the base year." },
  { heading: "6.3 Tracking Real GDP over Time", body: "Over the long term, U.S. real GDP have increased dramatically. At the same time, GDP has not increased the same amount each year. The speeding up and slowing down of GDP growth represents the business cycle. When GDP declines significantly, a recession occurs. A longer and deeper decline is a depression. Recessions begin at the business cycle\'s peak and end at the trough." },
  { heading: "6.4 Comparing GDP among Countries", body: "Since we measure GDP in a country\'s currency, in order to compare different countries\' GDPs, we need to convert them to a common currency. One way to do that is with the exchange rate, which is the price of one country\'s currency in terms of another. Once we express GDPs in a common currency, we can compare each country\'s GDP per capita by dividing GDP by population. Countries with large populations often have large GDPs, but GDP alone can be a misleading indicator of a nation\'s wealth. A better measure is GDP per capita." },
  { heading: "6.5 How Well GDP Measures the Well-Being of Society", body: "GDP is an indicator of a society\'s standard of living, but it is only a rough indicator. GDP does not directly take account of leisure, environmental quality, levels of health and education, activities conducted outside the market, changes in inequality of income, increases in variety, increases in technology, or the (positive or negative) value that society may place on certain types of output." },
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
            const idx = STATION_ORDER.indexOf(s.id);
            const done = idx < currentIdx || completed.has(s.id);
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
        {station === "intro"      && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "macro"      && <MacroStation      onComplete={(sc, t) => markDone("macro",      sc, t)} />}
        {station === "whatgdp"    && <WhatGDPStation    onComplete={(sc, t) => markDone("whatgdp",    sc, t)} />}
        {station === "components" && <ComponentsStation onComplete={(sc, t) => markDone("components", sc, t)} />}
        {station === "realvnom"   && <RealNomStation    onComplete={(sc, t) => markDone("realvnom",   sc, t)} />}
        {station === "cycle"      && <CycleStation      onComplete={(sc, t) => markDone("cycle",      sc, t)} />}
        {station === "compare"    && <CompareStation    onComplete={(sc, t) => markDone("compare",    sc, t)} />}
        {station === "flash"      && <FlashcardStation  onComplete={(sc, t) => markDone("flash",      sc, t)} />}
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
