import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "whocounts"
  | "measuring"
  | "iceberg"
  | "patterns"
  | "types"
  | "nairu"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch8";

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
// Station 1 — Who Counts?
// ─────────────────────────────────────────────
const WHOCOUNTS_QS = [
  {
    q: "Maria works 20 hours a week at a coffee shop for pay. How is she classified in the labor market?",
    options: [
      "Employed — she is working for pay, regardless of hours",
      "Unemployed — she is not working full-time",
      "Not in the labor force — she works fewer than 35 hours",
      "Underemployed — counted as unemployed in official statistics",
    ],
    correct: 0,
    exp: "Employed means working for pay at any number of hours. Maria earns a wage, so she is employed. The BLS does not require full-time status — even one paid hour qualifies. Part-time and full-time workers are both counted as employed.",
  },
  {
    q: "James lost his job six months ago. He sent out résumés for the first three months, but became discouraged and stopped looking two months ago. How is James classified today?",
    options: [
      "Unemployed — he still wants a job",
      "Not in the labor force — he is not actively looking for work",
      "Cyclically unemployed — counted in the official U-3 rate",
      "Structurally unemployed — counted in the official U-3 rate",
    ],
    correct: 1,
    exp: "To be counted as unemployed (U-3), a person must be actively looking for work in the past four weeks. James stopped looking two months ago, so he is classified as Not in the Labor Force — specifically a discouraged worker. He appears only in the broader U-6 measure.",
  },
  {
    q: "Which of the following people is classified as NOT IN THE LABOR FORCE?",
    options: [
      "A nurse working night shifts at a hospital",
      "A factory worker on temporary layoff awaiting recall",
      "An active-duty member of the U.S. military",
      "A laid-off worker who applied for jobs last week",
    ],
    correct: 2,
    exp: "Active military are classified as Not in the Labor Force — not as employed. Also NILF: people under 16, retirees, full-time students not working, stay-at-home parents, and discouraged workers. The factory worker on layoff awaiting recall is counted as unemployed.",
  },
  {
    q: "The unemployment rate is calculated by dividing the number of unemployed by:",
    options: [
      "The entire adult population (everyone 16 and older)",
      "Only full-time workers",
      "All adults who are not in school or the military",
      "The labor force — employed plus unemployed",
    ],
    correct: 3,
    exp: "Labor Force = Employed + Unemployed. The unemployment rate = Unemployed ÷ Labor Force × 100. The common error is dividing by the adult population (262M in Nov 2021) instead of the labor force (162M). Those not in the labor force — retirees, discouraged workers, military, etc. — are excluded from the denominator.",
  },
];

function WhoCountsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = WHOCOUNTS_QS[idx];
  const isLast = idx === WHOCOUNTS_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Sorting the Adult Population — Three Buckets</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {[
            ["Employed", "Working for pay (any hours), 15+ hrs unpaid family business, or temporarily absent"],
            ["Unemployed", "Not working AND actively looked past 4 weeks AND available to work"],
            ["Not in Labor Force", "Under 16, military, institutionalized, retirees, students, stay-at-home parents, discouraged workers"],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Nov 2021: 155.2M Employed · 6.9M Unemployed · 100.0M Not in Labor Force</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={WHOCOUNTS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Measuring Unemployment
// ─────────────────────────────────────────────
const MEASURING_QS = [
  {
    q: "Using November 2021 data (155.175M employed, 6.877M unemployed, 262.029M adult population), what is the unemployment rate?",
    options: [
      "About 4.2% — unemployed ÷ labor force",
      "About 2.6% — unemployed ÷ adult population",
      "About 6.8% — unemployed ÷ employed",
      "About 8.1% — unemployed ÷ (adult population minus employed)",
    ],
    correct: 0,
    exp: "UR = Unemployed ÷ Labor Force × 100 = 6.877 ÷ (155.175 + 6.877) × 100 = 6.877 ÷ 162.052 × 100 ≈ 4.2%. The key mistake: dividing by adult population (262M) instead of the labor force (162M). Those not in the labor force are excluded from the denominator.",
  },
  {
    q: "Using the same November 2021 data, what is the Labor Force Participation Rate (LFPR)?",
    options: [
      "About 61.8% — labor force ÷ adult population",
      "About 59.2% — labor force ÷ employed",
      "About 95.8% — employed ÷ labor force",
      "About 71.4% — employed ÷ adult population",
    ],
    correct: 0,
    exp: "LFPR = Labor Force ÷ Adult Population × 100 = 162.052 ÷ 262.029 × 100 ≈ 61.8%. This tells us what share of adults are either working or actively looking for work. About 38.2% of adults were not in the labor force at all in November 2021.",
  },
  {
    q: "The BLS reports the unemployment rate rose 0.1 percentage point this month. Your slides note that 0.1% ≈ 160,000 people — roughly the population of Syracuse, NY. What is the main lesson of this scale check?",
    options: [
      "Small changes in the unemployment rate are economically unimportant",
      "The BLS should report absolute numbers rather than percentages",
      "Even tiny-sounding percentage changes represent enormous numbers of real people — scale matters when reading economic data",
      "The unemployment rate is too imprecise to use for policy",
    ],
    correct: 2,
    exp: "A 0.1 percentage-point move sounds trivial, but with a 162-million-person labor force it represents ~160,000 workers — an entire mid-size city entering or leaving unemployment. Scale checks like this build economic intuition: never let a small-sounding decimal lull you into underestimating what it means in human terms.",
  },
  {
    q: "The LFPR rose steadily from 1960 to 1999, then declined from 2000 to 2015, then dropped sharply in 2020. What best explains the 1960–1999 rise?",
    options: [
      "A surge in immigration increased the adult population faster than the labor force",
      "Baby boomers retired in large numbers, reducing the NILF population",
      "The U.S. military downsized after Vietnam, moving millions into the civilian labor force",
      "Women entered the workforce in large numbers, steadily raising the share of adults participating",
    ],
    correct: 3,
    exp: "The 1960–1999 LFPR rise is primarily explained by women entering the workforce in large numbers — female labor force participation roughly doubled over those four decades. The 2000–2015 decline reflects aging baby boomers retiring. The 2020 COVID drop was the largest single-year fall on record.",
  },
];

function MeasuringStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = MEASURING_QS[idx];
  const isLast = idx === MEASURING_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">The Two Key Formulas</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Unemployment Rate</p>
            <p className="text-foreground font-mono text-xs">UR = (Unemployed ÷ Labor Force) × 100</p>
            <p className="text-muted-foreground mt-1">Nov 2021: 4.2%</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">LFPR</p>
            <p className="text-foreground font-mono text-xs">LFPR = (Labor Force ÷ Adult Pop.) × 100</p>
            <p className="text-muted-foreground mt-1">Nov 2021: 61.8%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Scale check: 0.1% change ≈ 160,000 people — the population of Syracuse, NY</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MEASURING_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Beyond the Headline Rate (U-3 vs U-6)
// ─────────────────────────────────────────────
const ICEBERG_QS = [
  {
    q: "Teresa has a master's degree in accounting but can only find work as a barista. She works 35 hours a week. How is she counted in official U-3 unemployment statistics?",
    options: [
      "Employed — she has a paying job, regardless of skill match",
      "Unemployed — her skills are mismatched with her job",
      "Not in the labor force — she is overqualified and not counted",
      "Structurally unemployed — captured in U-3",
    ],
    correct: 0,
    exp: "Teresa is employed in U-3 because she is working for pay. Her situation — skills far exceeding her job — makes her underemployed, which only appears in the broader U-6 measure. This is the 'iceberg' insight: official unemployment counts only those not working at all who are actively looking.",
  },
  {
    q: "U-6 is typically about double U-3 in normal times. What three groups does U-6 add that U-3 misses?",
    options: [
      "Retirees, students, and stay-at-home parents who want to return to work",
      "Gig workers, independent contractors, and unpaid family business workers",
      "Workers on temporary layoff, seasonal workers, and workers on strike",
      "Underemployed workers, discouraged workers, and involuntary part-time workers",
    ],
    correct: 3,
    exp: "U-6 adds three groups U-3 misses: (1) Underemployed — college grad working at Starbucks using none of their skills; (2) Discouraged workers — gave up looking, not counted in U-3 at all; (3) Involuntary part-time — want full-time work but can only get 20 hours. U-6 ≈ 2× U-3 normally; the gap widens in recessions as all three groups swell.",
  },
  {
    q: "During the Great Recession (2007–09), U-3 peaked around 10%. What would you expect U-6 to have been at the same time?",
    options: [
      "About 10.5% — U-6 is always very close to U-3",
      "About 12–13% — U-6 adds a fixed 2–3 percentage points",
      "About 17–18% — the gap widens significantly in recessions",
      "About 25% — U-6 captures nearly all adults not fully employed",
    ],
    correct: 2,
    exp: "U-6 peaked around 17% during the Great Recession, roughly 7 points above the 10% U-3 peak. The gap widens in recessions because all three hidden groups swell simultaneously: more workers get discouraged, more involuntary part-timers appear, and more overqualified workers take survival jobs. In normal times the gap is ~5 points; in downturns it can reach 7–8.",
  },
];

function IcebergStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ICEBERG_QS[idx];
  const isLast = idx === ICEBERG_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">The Official Rate Is Just the Tip of the Iceberg</p>
        <div className="space-y-2 text-xs">
          <div className="bg-background rounded-lg p-2 border border-border">
            <span className="font-bold text-primary">U-3 (Official):</span>
            <span className="text-muted-foreground ml-1">Not working + actively looked past 4 weeks + available</span>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
            <p className="font-bold text-amber-800 mb-1">U-6 adds three hidden groups:</p>
            <ul className="space-y-0.5 text-amber-900">
              <li>• <span className="font-semibold">Underemployed</span> — college grad at Starbucks; skills unused</li>
              <li>• <span className="font-semibold">Discouraged workers</span> — gave up looking; not counted in U-3</li>
              <li>• <span className="font-semibold">Involuntary part-time</span> — want full-time, can only get 20 hrs</li>
            </ul>
          </div>
          <p className="text-muted-foreground italic">U-6 ≈ 2× U-3 in good times; gap widens in recessions. FRED: UNRATE and U6RATE</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ICEBERG_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Patterns Over Time
// ─────────────────────────────────────────────
const PATTERNS_QS = [
  {
    q: "Which observation about the long-run U.S. unemployment rate is NOT supported by the historical data?",
    options: [
      "The rate rises sharply during recessions and falls during expansions",
      "The rate always returns to a 4–6% normal range, like a rubber band snapping back",
      "The rate shows a clear long-run upward trend — each recession peak is higher than the last",
      "The rate almost never falls below 3%, even in the strongest expansions",
    ],
    correct: 2,
    exp: "A long-run upward trend is NOT what the data shows. Despite population growth, globalization, and technological disruption, the unemployment rate shows no rising trend. It fluctuates with the business cycle but returns to its 4–6% normal range. Each recession raises it temporarily; each recovery brings it back.",
  },
  {
    q: "COVID-19 caused unemployment to jump from 4.4% to 14.8% in a single month (March–April 2020). What makes this the most extraordinary labor market event in recorded U.S. history?",
    options: [
      "14.8% is the highest unemployment rate ever recorded in U.S. history",
      "It was the largest single-month jump on record — 10.4 percentage points in 30 days — caused by a sudden shutdown rather than a gradual downturn",
      "It was the first time unemployment rose above 10% since World War II",
      "The rate stayed above 10% for over two years",
    ],
    correct: 1,
    exp: "The COVID spike was extraordinary not because of its peak level (14.8% vs. ~25% in the Great Depression) but because of its speed — 10.4 percentage points in a single month. Normal recessions build over quarters; this was a sudden administrative shutdown. The rate then recovered faster than any previous recession.",
  },
  {
    q: "Which statement about unemployment rates across groups is correct, according to your slides?",
    options: [
      "Black unemployment rates have converged to white rates since 1980",
      "Teen unemployment rates (16–19) are typically 3–5%, similar to prime-age workers",
      "Women now face significantly higher unemployment than men in all recent years",
      "College graduates face approximately 2.3% unemployment vs. ~5.7% for those without a diploma — education is the best unemployment insurance",
    ],
    correct: 3,
    exp: "Your slides show a persistent education gradient: college degree ≈ 2.3%, some college ≈ 3.7%, HS diploma ≈ 5.2%, no diploma ≈ 5.7%. 'Education is the best unemployment insurance.' Teen rates run 15–30%. Black unemployment runs roughly 2× white rates — that gap has not closed. Men's and women's rates have converged since ~1980.",
  },
];

function PatternsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = PATTERNS_QS[idx];
  const isLast = idx === PATTERNS_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Historical Benchmarks</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {[["4–6%","Normal range"],["14.8%","COVID peak Apr 2020"],["~25%","Great Depression peak"]].map(([val,label]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-sm">{val}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p>• Rises in recessions, returns to 4–6% (rubber band effect)</p>
          <p>• Almost never falls below 3%</p>
          <p>• No long-run upward trend despite population growth and globalization</p>
          <p>• COVID: largest single-month jump on record (4.4% → 14.8%)</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PATTERNS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Three Types + Sticky Wages
// ─────────────────────────────────────────────
const TYPES_QS = [
  {
    q: "In 2022–23, Meta, Google, and Amazon laid off tens of thousands of workers as rising interest rates slowed the economy. What type of unemployment is this?",
    options: [
      "Cyclical — it rose with a business-cycle downturn and will fall when the economy recovers",
      "Frictional — these workers will find new tech jobs quickly",
      "Structural — technology is replacing software engineers with AI",
      "Natural — this is the unavoidable baseline level of unemployment",
    ],
    correct: 0,
    exp: "Tech layoffs tied to rising rates and slowing growth are cyclical unemployment — they rise with the business cycle and fall in recoveries. Structural would mean the skills are permanently obsolete. The 2022–23 tech layoffs were cyclical: they followed rate hikes and many workers were quickly rehired as conditions stabilized.",
  },
  {
    q: "Which of the following is NOT one of the reasons your slides give for why wages are 'sticky downward'?",
    options: [
      "Efficiency wages — firms pay above-market wages to attract higher productivity",
      "Tax policy — wage cuts trigger higher payroll tax obligations for the firm",
      "Adverse selection — cutting wages causes the best workers to leave first",
      "Morale — a 10% pay cut feels worse than never receiving a 10% raise",
    ],
    correct: 1,
    exp: "Tax policy is not one of the four reasons your slides give. The four are: (1) Laws/contracts — minimum wage and union contracts floor wages; (2) Efficiency wages — higher pay drives productivity and loyalty; (3) Adverse selection — wage cuts drive away your best workers first; (4) Morale — loss aversion makes cuts feel worse than foregone raises. Result: firms lay off headcount rather than cut wages.",
  },
  {
    q: "A paralegal loses her job when her firm adopts AI document-review software. Her legal-research skills are not in demand elsewhere. What type of unemployment is this?",
    options: [
      "Frictional — she just needs time to find another firm that still uses human paralegals",
      "Cyclical — when the economy recovers, law firms will need more paralegals",
      "Structural — AI has permanently shifted demand away from her skill set; retraining is the appropriate response",
      "Natural — this is expected baseline churn in a healthy labor market",
    ],
    correct: 2,
    exp: "Structural unemployment occurs when demand permanently shifts away from a skill or job type. AI replacing document review is permanent. Policy implication: cyclical tools (stimulus, rate cuts) won't help — she needs retraining. 'Policy targeting one type of unemployment doesn't help the others.'",
  },
  {
    q: "Frictional unemployment is always present at 1–2% of the labor force. Which scenario best illustrates it?",
    options: [
      "A coal miner whose mine closed and whose skills don't transfer to available jobs",
      "An autoworker laid off when the economy enters recession and car demand drops",
      "A factory worker whose entire plant moved overseas",
      "A recent college graduate spending two months searching for the right entry-level marketing job",
    ],
    correct: 3,
    exp: "Frictional unemployment is the normal, short-term job-search process — matching workers to jobs takes time even in a healthy economy. A new grad taking 2 months to land a first job is the textbook example. The coal miner and factory worker face structural unemployment. The autoworker laid off in recession faces cyclical. Frictional unemployment is healthy labor market churn.",
  },
];

function TypesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = TYPES_QS[idx];
  const isLast = idx === TYPES_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Three Types of Unemployment</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["Cyclical","Rises/falls with business cycle. Meta/Google layoffs 2022–23."],
            ["Frictional","Normal job-search churn. Always 1–2%. New grad finding first job."],
            ["Structural","Skills mismatch. AI replacing data entry, travel agents."],
          ].map(([type,desc]) => (
            <div key={type} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary mb-1 text-xs">{type}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"Policy targeting one type of unemployment doesn't help the others."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={TYPES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — NAIRU & Natural Rate
// ─────────────────────────────────────────────
const NAIRU_QS = [
  {
    q: "The natural rate of unemployment equals zero cyclical unemployment. Which formula correctly describes it?",
    options: [
      "Natural Rate = Cyclical + Frictional",
      "Natural Rate = Frictional + Structural",
      "Natural Rate = Total Unemployment − Cyclical − Structural",
      "Natural Rate = Unemployment Rate when GDP equals potential GDP minus frictional",
    ],
    correct: 1,
    exp: "Natural Rate = Frictional + Structural. These two components exist even in a healthy, non-recessionary economy. Cyclical unemployment equals zero at the natural rate. The U.S. natural rate is estimated at approximately 4.5–5.5%, though it drifts over time as structural conditions change.",
  },
  {
    q: "In 2017–2019, U.S. unemployment fell below 4% — below most estimates of the natural rate. What economic consequence does the speed-limit analogy predict?",
    options: [
      "Deflation — too many workers competing for jobs drives prices down",
      "Faster GDP growth — below-natural unemployment means extra production",
      "Accelerating wage and price inflation — employers bid for scarce workers, pushing wages and prices up",
      "A recession — the Fed raises rates aggressively, causing an immediate downturn",
    ],
    correct: 2,
    exp: "When unemployment falls below the natural rate (NAIRU), employers scramble for scarce workers, bidding wages up. Higher wages flow into prices — inflation accelerates. In 2017–19, wage growth picked up and the Fed raised rates in response. The speed-limit analogy: driving faster doesn't immediately crash, but it raises the risk of overheating.",
  },
  {
    q: "Which of the following would LOWER the natural rate of unemployment over time?",
    options: [
      "A large cohort of young workers (ages 16–24) entering the labor force",
      "Generous unemployment benefits that allow workers to search longer",
      "The spread of internet job boards like LinkedIn that speed up job matching",
      "Burdensome hiring-and-firing regulations that discourage firms from creating jobs",
    ],
    correct: 2,
    exp: "Internet job boards and LinkedIn lower the natural rate by reducing frictional unemployment — workers and employers find each other faster, shortening search time. Factors that RAISE the natural rate: large young-worker cohorts (high frictional churn), generous UI benefits (longer search), burdensome regulations (fewer jobs created). The natural rate drifts as these structural conditions change.",
  },
];

function NairuStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = NAIRU_QS[idx];
  const isLast = idx === NAIRU_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-1">The Natural Rate — The Economy's Speed Limit</p>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <div className="bg-background rounded-lg p-2 border border-border">
            <p className="font-bold text-primary mb-1">NAIRU</p>
            <p className="text-muted-foreground">Non-Accelerating Inflation Rate of Unemployment</p>
            <p className="text-foreground font-semibold mt-1 text-xs">Natural Rate = Frictional + Structural</p>
            <p className="text-muted-foreground mt-1">U.S. estimate: ~4.5–5.5%</p>
          </div>
          <div className="bg-background rounded-lg p-2 border border-border">
            <p className="font-bold text-primary mb-1">What Shifts It</p>
            <p className="text-green-700 font-semibold text-xs">▼ Lowers: LinkedIn/job boards, aging population, productivity booms, retraining</p>
            <p className="text-red-700 font-semibold mt-1 text-xs">▲ Raises: Generous UI, heavy regulations, large youth cohorts, productivity slowdowns</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Speed limit analogy: push below NAIRU and the economy overheats — wages and prices accelerate</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={NAIRU_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 7 — Personal Finance & Costs
// ─────────────────────────────────────────────
const PERSONALFINANCE_QS = [
  {
    q: "The median unemployment spell lasts about 2 months, but many workers remain unemployed for 6 months or more. What does this distribution imply for emergency savings?",
    options: [
      "1 month of expenses — the median spell is 2 months so 1 month provides ample cushion",
      "Exactly 2 months — match the median spell length",
      "12+ months — any spell could become permanent structural unemployment",
      "3–6 months of expenses — the median matters less than the tail risk of a long spell",
    ],
    correct: 3,
    exp: "Your slides recommend 3–6 months of living expenses. The median spell of ~2 months is the typical outcome, but averages mask a long tail: recessions lengthen spells, and structural unemployment can stretch over a year. You size insurance for the tail, not the middle — that's why the recommendation exceeds the median.",
  },
  {
    q: "'Unemployment is not just an economic statistic — it is a deeply human experience.' Which of the following is listed as a human cost beyond lost income?",
    options: [
      "Reduced government tax revenue and lower public investment",
      "Worse physical and mental health, strained marriages, and loss of identity and social connection",
      "Lower consumer spending that reduces GDP and delays recovery",
      "Skills atrophy as workers fall behind on industry practices",
    ],
    correct: 1,
    exp: "The human costs your slides emphasize: worse physical and mental health outcomes, strained marriages and family relationships, children's future earnings reduced by a parent's spell, and loss of identity and social connection that work provides. The other options (tax revenue, GDP drag, skills atrophy) are real economic costs — but the question asks specifically about the human dimension.",
  },
  {
    q: "'Macro happens to all of us — but how prepared you are when it does is mostly micro.' What is the practical personal-finance takeaway?",
    options: [
      "Rely on unemployment insurance — it is designed to replace income during job loss",
      "Avoid industries vulnerable to cyclical downturns",
      "Diversify income streams so no single employer accounts for more than 50% of income",
      "Build an emergency fund, invest in education as the best unemployment insurance, and maintain your network before you need it",
    ],
    correct: 3,
    exp: "The three micro-level tools your slides recommend: (1) 3–6 month emergency fund — build before you need it; (2) Education is the best unemployment insurance — the degree/no-diploma gap (2.3% vs. 5.7%) is persistent; (3) Maintain your professional network always — connections built before a layoff are far more valuable than those built after.",
  },
];

function PersonalFinanceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = PERSONALFINANCE_QS[idx];
  const isLast = idx === PERSONALFINANCE_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Unemployment Is Personal — Economic + Human Costs</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background rounded-lg p-2 border border-border">
            <p className="font-bold text-primary mb-1">Economic Costs</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Lost output never recovered</li>
              <li>• Skills atrophy over time</li>
              <li>• Lower tax revenue</li>
              <li>• Reduced future investment</li>
            </ul>
          </div>
          <div className="bg-background rounded-lg p-2 border border-border">
            <p className="font-bold text-primary mb-1">Human Costs</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Worse physical &amp; mental health</li>
              <li>• Strained marriages</li>
              <li>• Children's future earnings affected</li>
              <li>• Loss of identity &amp; social connection</li>
            </ul>
          </div>
        </div>
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
          <p className="font-semibold text-amber-800">Your 3 Personal-Finance Tools:</p>
          <p className="text-amber-900">① 3–6 month emergency fund &nbsp;② Education = best insurance &nbsp;③ Maintain network before you need it</p>
          <p className="text-amber-700 italic mt-1">"Macro happens to all of us — but how prepared you are is mostly micro."</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PERSONALFINANCE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Employed", back: "Working for pay (any hours), working 15+ hours in an unpaid family business, or temporarily absent from a job. Classified by the BLS monthly household survey." },
  { front: "Unemployed", back: "Not currently working AND actively searched for work in the past 4 weeks AND available to work. All three conditions must be met." },
  { front: "Not in Labor Force (NILF)", back: "All adults not classified as employed or unemployed — retirees, students, stay-at-home parents, active military, the institutionalized, and discouraged workers." },
  { front: "Unemployment Rate (U-3)", back: "(Unemployed ÷ Labor Force) × 100. The official unemployment rate. The denominator is only the labor force — not the full adult population." },
  { front: "Labor Force Participation Rate (LFPR)", back: "(Labor Force ÷ Adult Population) × 100. Measures the share of adults either working or actively looking for work." },
  { front: "U-6 Unemployment", back: "The broadest unemployment measure. Adds to U-3: (1) discouraged workers, (2) marginally attached workers, and (3) involuntary part-time workers. Typically about twice the U-3 rate." },
  { front: "Discouraged Worker", back: "A person who has stopped looking for work because they believe no jobs are available for them. Classified as Not in Labor Force in U-3 but captured in U-6." },
  { front: "Frictional Unemployment", back: "Short-term unemployment from the normal process of searching for a job. Always present (1–2%) and considered healthy — reflects worker choice and job matching." },
  { front: "Structural Unemployment", back: "Unemployment from a permanent mismatch between workers' skills and available jobs, often caused by technology or industry change. Requires retraining, not just stimulus." },
  { front: "Cyclical Unemployment", back: "Unemployment caused by a downturn in the business cycle. Rises in recessions, falls in expansions. The target of macroeconomic stabilization policy." },
  { front: "Natural Rate of Unemployment (NAIRU)", back: "The unemployment rate when the economy is at full employment — equal to frictional + structural unemployment. For the U.S., approximately 4–5%. Cyclical unemployment is zero at the natural rate." },
  { front: "Sticky Wages", back: "The tendency of wages to resist downward adjustment even in recessions. Caused by contracts, efficiency wage theory, adverse selection, and worker morale. Results in layoffs rather than pay cuts during downturns." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 8 Key Terms</p>
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
// Quiz pool — 15 questions, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "Kevin is 17 years old and mows lawns for cash on weekends. He works about 6 hours per week and is not looking for any other job. How is Kevin classified by the BLS?", options: ["Not in the labor force — he is under 18 and part-time", "Employed — he works for pay, any hours qualify, and there is no minimum age above 16", "Unemployed — 6 hours/week is not enough to count as employment", "Underemployed — part-time workers under 20 hours are classified as unemployed"], correct: 1, exp: "Employed means working for pay at any number of hours. Kevin is 17 (over 16, the BLS minimum) and earns money for mowing lawns — he is employed. The BLS does not require full-time status, a formal employer, or a set number of hours. Even one paid hour per week qualifies. He is not NILF because he is actively working, not merely available." },
  { q: "A country has 180 million employed, 9 million unemployed, and 60 million not in the labor force. What is the unemployment rate?", options: ["About 5.0% — 9M ÷ (180M+9M)", "About 3.8% — 9M ÷ (180M+60M+9M)", "About 4.8% — 9M ÷ (180M+9M+60M÷2)", "About 6.0% — 9M ÷ (180M−9M)"], correct: 0, exp: "UR = Unemployed ÷ Labor Force × 100 = 9 ÷ (180+9) × 100 = 9 ÷ 189 × 100 ≈ 4.76% ≈ 5%. The labor force = employed + unemployed = 189M. The 60M not in the labor force are excluded from the denominator. A common mistake is including NILF in the denominator — that would give ~3.7%, which understates the unemployment rate." },
  { q: "Using the same country (180M employed, 9M unemployed, 249M adult population), what is the Labor Force Participation Rate?", options: ["About 75.9% — labor force ÷ adult population", "About 95.2% — employed ÷ labor force", "About 72.3% — employed ÷ adult population", "About 24.1% — NILF ÷ adult population"], correct: 0, exp: "LFPR = Labor Force ÷ Adult Population × 100 = (180+9) ÷ 249 × 100 = 189 ÷ 249 × 100 ≈ 75.9%. This tells us 75.9% of adults are either working or actively looking — 24.1% are not in the labor force at all (retired, students, stay-at-home parents, discouraged workers, military, institutionalized)." },
  { q: "The BLS reports that the unemployment rate rose from 3.8% to 4.2% over the past year — a 0.4 percentage point increase. With a labor force of ~165 million, approximately how many additional workers became unemployed?", options: ["About 660 workers — 0.4% of 165 million is tiny", "About 66,000 workers — one medium-sized factory town", "About 660,000 workers — the population of a large city like Baltimore or Memphis", "About 6.6 million workers — the population of a major metro area"], correct: 2, exp: "0.4% × 165,000,000 = 660,000 workers. Your slides use the benchmark that 0.1% ≈ 160,000 people (Syracuse, NY). So 0.4% ≈ 640,000–660,000 — the population of a city the size of Baltimore or Memphis entering unemployment. This scale check reminds us that what sounds like a tiny decimal shift represents a massive human reality." },
  { q: "The LFPR for prime-age men (ages 25–54) has been declining gradually since the 1960s, even during economic expansions. Which factor best explains this long-run trend?", options: ["Prime-age men are retiring earlier due to improved pension benefits", "Immigration has replaced prime-age male workers in most industries", "Prime-age men increasingly choose full-time education over work", "Declining demand for manufacturing and middle-skill jobs has discouraged some prime-age men from participating, combined with the rise of disability program enrollment"], correct: 3, exp: "The prime-age male LFPR decline is a long-documented puzzle. The leading explanations: (1) manufacturing and middle-skill job losses reduced the wage premium for these workers; (2) growth in disability program enrollment created an alternative to low-wage work; (3) some evidence of opioid epidemic effects. This is structural, not cyclical — it persists even in strong labor markets. It's a key reason overall LFPR has trended down even as women's participation rose." },
  { q: "Sophia graduated college in May, spent the summer traveling, and in September began applying for marketing jobs. By December she still hasn't found one and has submitted 50 applications. She is classified as:", options: ["Not in the labor force — she was not looking in the summer, so she never re-entered", "Structurally unemployed — marketing skills are no longer in demand", "Frictionally unemployed and counted in U-3 — she is actively looking, available, and not working", "Underemployed — she is overqualified for entry-level positions"], correct: 2, exp: "Sophia meets all three U-3 criteria: not working, actively searching (50 applications), and available to start. She is unemployed — specifically frictionally unemployed because she is a new entrant searching for a first job in a healthy economy. She is NOT NILF because she is actively looking. She is NOT structurally unemployed because her skills (marketing) are still in demand — she just hasn't matched yet." },
  { q: "During the 2001 dot-com recession, U-3 rose from 4% to 6%. Research shows U-6 rose from approximately 7% to 11% over the same period. What accounts for the larger U-6 increase?", options: ["In downturns, all three U-6 groups grow at once: more workers take jobs below their skills, more give up searching, and more firms cut hours instead of laying off — widening the gap from the normal ~3 points to ~5 points", "The BLS revised its methodology during 2001 to count more people as unemployed", "U-6 includes retirees and students, whose numbers grew unusually fast in 2001", "The dot-com bust specifically affected tech workers who were already counted in U-6 but not U-3"], correct: 0, exp: "When recessions hit, the U-6/U-3 gap widens because all three hidden groups expand simultaneously: (1) displaced dot-com workers took survival jobs (underemployed); (2) tech workers who searched for 6+ months gave up (discouraged, now NILF for U-3 but visible in U-6); (3) firms cut contractor hours rather than layoffs (involuntary part-time). Normal times: gap ~3pts. Mild recession: gap ~5pts. Great Recession peak: gap ~7pts." },
  { q: "A historian notes that U.S. unemployment was 3.5% in 1969, 6.1% in 1994, and 3.5% again in 2019 — 50 years apart at essentially the same rate. What does this illustrate?", options: ["Unemployment policy has been perfectly calibrated for 50 years — government intervention kept rates stable", "The 2019 rate was artificially low due to measurement changes — true unemployment was much higher", "Identical rates in 1969 and 2019 prove that unemployment is determined entirely by structural factors", "Despite a half-century of technological change, globalization, and demographic shifts, the unemployment rate shows no long-run trend — it fluctuates with cycles but returns to a stable range"], correct: 3, exp: "This perfectly illustrates the no-long-run-trend finding. From 1969 to 2019: computers replaced typewriters, China entered global trade, women's workforce participation doubled, baby boomers entered and retired — yet the rate returned to the same level. The rubber band snaps back. Cyclical forces (recessions, recoveries) create the up-and-down, but the long-run equilibrium (the natural rate) stays roughly stable around 4–6%." },
  { q: "In April 2020, 22 million Americans lost jobs in a single month as businesses shut down due to COVID-19. By April 2022 — just two years later — unemployment was back below 4%. What does this recovery pattern reveal about COVID-19 vs. typical recessions?", options: ["It proves the pandemic had no lasting economic damage", "The COVID spike was driven by a temporary administrative shutdown, not a structural change in the economy — once restrictions lifted, demand and hiring snapped back far faster than in recessions caused by underlying financial or structural imbalances", "Government stimulus fully replaced the lost jobs, explaining the fast recovery", "The 2022 numbers were revised down artificially to hide ongoing unemployment"], correct: 1, exp: "COVID was unique: the shock was administrative (businesses ordered to close), not structural (broken balance sheets, obsolete industries). When restrictions lifted, pent-up demand surged and employers hired rapidly. Compare to the Great Recession (2007–09): unemployment peaked at 10% and took 6+ years to return to pre-recession levels because the financial system was broken and household balance sheets needed years of repair. A shutdown shock vs. a structural shock produces very different recoveries." },
  { q: "Among the following groups, which comparison of unemployment rates is most consistent with your slides' data?", options: ["Workers aged 55+ have higher unemployment rates than workers aged 25–34", "Hispanic workers have lower unemployment rates than white workers on average", "Workers with a professional degree face roughly similar unemployment to those with only a high school diploma", "Workers aged 16–19 face unemployment rates many times higher than prime-age workers (25–54), often running 15–30% vs. 3–5%"], correct: 3, exp: "Teen unemployment (16–19) runs 15–30% — many times the prime-age rate of 3–5%. This reflects inexperience, high job turnover, seasonal work patterns, and the challenge of entering the labor market. By contrast: workers 55+ exit via retirement (low unemployment); Hispanic workers face higher rates than white workers (not lower); education creates a large gradient (college ~2.3% vs. no diploma ~5.7%). The age gradient is the most dramatic cross-group difference." },
  { q: "A town that built its economy around call centers sees those jobs eliminated as companies adopt AI customer service. The displaced workers' phone-support skills don't transfer easily to available warehouse or healthcare jobs. This is:", options: ["Cyclical unemployment — it will reverse when the economy picks up", "Frictional unemployment — workers just need time to find new call centers", "Structural unemployment — technology permanently shifted demand away from this skill set, requiring retraining rather than waiting for recovery", "Seasonal unemployment — call center demand fluctuates with holiday shopping patterns"], correct: 2, exp: "Structural unemployment: demand permanently shifted away from phone-support skills due to AI — this is not a temporary recession, it's a lasting change in what employers need. Policy implication: stimulus and rate cuts (cyclical tools) won't bring back the jobs. Workers need retraining for available roles. 'Policy targeting one type of unemployment doesn't help the others.' This mirrors travel agents displaced by internet booking or data-entry workers displaced by software." },
  { q: "A pharmaceutical company is considering laying off 200 research scientists during a temporary revenue shortfall. The HR director argues against layoffs, noting that these scientists took years to hire and train, and that cutting their pay would cause the best ones to leave immediately for competitors. Which sticky-wage theory does this argument invoke?", options: ["Minimum wage laws — the scientists' salaries are legally protected", "Efficiency wages — the firm pays above-market to attract and retain top talent, and cutting that premium would destroy the productivity advantage", "Adverse selection — cutting wages causes the highest-productivity workers (who have the most outside options) to leave first, leaving a worse workforce", "Both B and C — the firm faces both the efficiency wage and adverse selection problems simultaneously"], correct: 3, exp: "Both efficiency wages AND adverse selection apply here. Efficiency wages: the above-market pay was specifically designed to attract and motivate top scientists — cut it and you lose the productivity premium. Adverse selection: the best scientists have outside offers; a pay cut causes exactly the wrong people to leave first. Together these are two of the four reasons wages are sticky downward — the firm ends up laying off headcount rather than cutting pay." },
  { q: "The U.S. economy in 2017–2019 ran unemployment below 4% — below NAIRU estimates of 4.5–5.5%. The Fed raised rates three times in 2018. What were they reacting to?", options: ["Wage growth picking up as employers competed for scarce workers — consistent with below-NAIRU unemployment pushing toward accelerating inflation", "A stock market bubble that threatened financial stability", "Rising unemployment in manufacturing states that required pre-emptive action", "Congressional pressure to slow immigration-driven labor force growth"], correct: 0, exp: "Below NAIRU, employers compete for scarce workers → wages bid up → labor costs rise → prices follow. In 2017–19, wage growth accelerated from ~2.5% to ~3.5%/yr as unemployment fell below 4%. The Fed raised rates to cool demand and prevent inflation from accelerating — the speed-limit analogy in action. They were not reacting to a crisis but to the predictable consequence of running below the natural rate: incipient wage-price pressure." },
  { q: "Which of the following policy changes would economists expect to RAISE the natural rate of unemployment?", options: ["A new federal job-matching website that lists every open position nationwide in real time", "Extending maximum unemployment benefit duration from 26 weeks to 52 weeks, with no work-search requirements", "A baby boom 20 years ago that is now producing large cohorts of young workers entering the labor force", "Both B and C — extended UI reduces search intensity while large youth cohorts increase churning"], correct: 3, exp: "Both B and C raise the natural rate. Extended UI with no search requirements: workers can afford to search longer → average search duration rises → frictional unemployment is higher at any given time. Large youth cohorts: young workers (16–24) have high job turnover and quit rates → more frictional flows → higher natural rate. The job-matching website would LOWER the natural rate by speeding up matches. Things that slow matching or increase churning raise the natural rate; things that speed matching lower it." },
  { q: "A financial planner tells her client: 'Build your emergency fund before you invest.' Her client asks why not just use a credit card or borrow from family during a job loss. What is the strongest economic argument for a dedicated emergency fund?", options: ["Emergency funds earn higher interest than other savings vehicles", "The median unemployment spell is 2 months, but the distribution has a long tail — recessions, structural displacement, or health issues can push spells to 6–12 months, making pre-built liquidity far more valuable than scrambling for credit when already financially stressed", "Credit cards charge interest, making them mathematically inferior in all scenarios", "Borrowing from family creates social obligations that are more costly than financial ones"], correct: 1, exp: "Your slides' key point: size the fund for the tail, not the median. The median spell (~2 months) sounds manageable. But structural unemployment, recessions, or age/industry mismatches can produce spells of 6–12+ months — and that's when you need the cushion most. Trying to establish credit or borrow when unemployed and financially stressed is harder and more expensive than having liquidity already in place. 'Macro happens to all of us — but how prepared you are is mostly micro.'" },
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
        <p className="font-semibold text-foreground">Chapter 8 Quiz</p>
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
const STATION_LABELS_CH8: Record<string, string> = {
  whocounts:       "Who Counts?",
  measuring:       "Measuring Unemployment",
  iceberg:         "Beyond the Headline Rate",
  patterns:        "Patterns Over Time",
  types:           "Three Types + Sticky Wages",
  nairu:           "NAIRU & Natural Rate",
  personalfinance: "Personal Finance & Costs",
  flash:           "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH8).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch8 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 8 — Unemployment</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 8 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 8 — Unemployment</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In your own words, what is the difference between U-3 and U-6, and why does it matter?</label>
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
  { id: "whocounts"        as Station, label: "Who Counts?",               desc: "Classify employed, unemployed, and not in the labor force", icon: "👥" },
  { id: "measuring"        as Station, label: "Measuring Unemployment",    desc: "UR and LFPR formulas, worked examples, LFPR trends", icon: "📐" },
  { id: "iceberg"          as Station, label: "Beyond the Headline Rate",  desc: "U-3 vs U-6 — the hidden unemployment beneath the surface", icon: "🧊" },
  { id: "patterns"         as Station, label: "Patterns Over Time",        desc: "Historical benchmarks, COVID spike, who gets hit hardest", icon: "📊" },
  { id: "types"            as Station, label: "Three Types + Sticky Wages",desc: "Cyclical, frictional, structural — and why wages don't fall", icon: "⚙️" },
  { id: "nairu"            as Station, label: "NAIRU & Natural Rate",      desc: "The economy's speed limit — what shifts it up and down", icon: "🚦" },
  { id: "personalfinance"  as Station, label: "Personal Finance & Costs",  desc: "Emergency funds, education, network — macro happens to all of us", icon: "💼" },
  { id: "flash"            as Station, label: "Flashcard Review",          desc: "Master all 12 key Ch8 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",           label: "Dashboard" },
  { id: "whocounts",       label: "Who Counts?" },
  { id: "measuring",       label: "Measuring UR" },
  { id: "iceberg",         label: "U-3 vs U-6" },
  { id: "patterns",        label: "Patterns" },
  { id: "types",           label: "Types" },
  { id: "nairu",           label: "NAIRU" },
  { id: "personalfinance", label: "Personal Finance" },
  { id: "flash",           label: "Flashcards" },
  { id: "quiz",            label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","whocounts","measuring","iceberg","patterns","types","nairu","personalfinance","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Summary Modal
// ─────────────────────────────────────────────
const CH8_SUMMARY = [
  { heading: "8.1 How Economists Define and Compute Unemployment Rate", body: "Unemployment imposes high costs. Unemployed individuals experience loss of income and stress. An economy with high unemployment suffers an opportunity cost of unused resources. We can divide the adult population into those in the labor force and those out of the labor force. In turn, we divide those in the labor force into employed and unemployed. A person without a job must be willing and able to work and actively looking for work to be counted as unemployed; otherwise, a person without a job is counted as out of the labor force. Economists define the unemployment rate as the number of unemployed persons divided by the number of persons in the labor force (not the overall adult population). The Current Population Survey (CPS) conducted by the United States Census Bureau measures the percentage of the labor force that is unemployed. The establishment payroll survey by the Bureau of Labor Statistics measures the net change in jobs created for the month." },
  { heading: "8.2 Patterns of Unemployment", body: "The U.S. unemployment rate rises during periods of recession and depression, but falls back to the range of 4% to 6% when the economy is strong. The unemployment rate never falls to zero. Despite enormous growth in the size of the U.S. population and labor force in the twentieth century, along with other major trends like globalization and new technology, the unemployment rate shows no long-term rising trend.\n\nUnemployment rates differ by group: higher for African-Americans and Hispanic people than for White people; higher for less educated than more educated; higher for the young than the middle-aged. Women's unemployment rates used to be higher than men's, but in recent years men's and women's unemployment rates have been very similar. In recent years, unemployment rates in the United States have compared favorably with unemployment rates in most other high-income economies." },
  { heading: "8.3 What Causes Changes in Unemployment over the Short Run", body: "Cyclical unemployment rises and falls with the business cycle. In a labor market with flexible wages, wages will adjust in such a market so that quantity demanded of labor always equals the quantity supplied of labor at the equilibrium wage. Economists have proposed many theories for why wages might not be flexible, but instead may adjust only in a \"sticky\" way, especially when it comes to downward adjustments: implicit contracts, efficiency wage theory, adverse selection of wage cuts, insider-outsider model, and relative wage coordination." },
  { heading: "8.4 What Causes Changes in Unemployment over the Long Run", body: "The natural rate of unemployment is the rate of unemployment that the economic, social, and political forces in the economy would cause even when the economy is not in a recession. These factors include the frictional unemployment that occurs when people either choose to change jobs or are put out of work for a time by the shifts of a dynamic and changing economy. They also include any laws concerning conditions of hiring and firing that have the undesired side effect of discouraging job formation. They also include structural unemployment, which occurs when demand shifts permanently away from a certain type of job skill." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 8 Summary — Unemployment</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH8_SUMMARY.map((s,i) => (
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
        <p className="font-semibold mb-1">Chapter 8 — Unemployment</p>
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
        {station==="intro"          && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="whocounts"      && <WhoCountsStation      onComplete={(sc,t)=>markDone("whocounts",      sc,t)} />}
        {station==="measuring"      && <MeasuringStation      onComplete={(sc,t)=>markDone("measuring",      sc,t)} />}
        {station==="iceberg"        && <IcebergStation        onComplete={(sc,t)=>markDone("iceberg",        sc,t)} />}
        {station==="patterns"       && <PatternsStation       onComplete={(sc,t)=>markDone("patterns",       sc,t)} />}
        {station==="types"          && <TypesStation          onComplete={(sc,t)=>markDone("types",          sc,t)} />}
        {station==="nairu"          && <NairuStation          onComplete={(sc,t)=>markDone("nairu",          sc,t)} />}
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
