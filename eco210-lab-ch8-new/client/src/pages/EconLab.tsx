import { useState } from "react";

type Station =
  | "intro" | "whocounts" | "measuring" | "iceberg" | "patterns"
  | "types" | "nairu" | "personalfinance" | "flash" | "quiz" | "results" | "not-yet";

const STORAGE_KEY = "econlab_done_ch8";

// ─── Shared helpers ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface QItem { q: string; options: string[]; correct: number; exp: string; }

// ─── SteppedQuiz shared component ──────────────────────────────────────────────
function SteppedQuiz({
  q, idx, total, sel, setSel, checked, onCheck, onNext, isLast, score, onComplete,
}: {
  q: QItem; idx: number; total: number; sel: number | null; setSel: (n: number) => void;
  checked: boolean; onCheck: () => void; onNext: () => void; isLast: boolean;
  score: number; onComplete: (score: number, total: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Question {idx + 1} of {total}</p>
      <p className="font-medium text-foreground text-sm leading-relaxed">{q.q}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ";
          if (!checked) {
            cls += sel === i
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-foreground hover:bg-muted/50";
          } else {
            if (i === q.correct) cls += "border-green-500 bg-green-50 text-green-800 font-semibold";
            else if (i === sel && sel !== q.correct) cls += "border-red-400 bg-red-50 text-red-700";
            else cls += "border-border bg-card text-muted-foreground";
          }
          return (
            <button key={i} className={cls} disabled={checked} onClick={() => setSel(i)}>
              <span className="font-semibold mr-2">{["A","B","C","D"][i]}.</span>{opt}
            </button>
          );
        })}
      </div>
      {checked && (
        <div className={`rounded-lg px-4 py-3 text-sm ${sel === q.correct ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          <p className="font-semibold mb-1">{sel === q.correct ? "✓ Correct!" : "✗ Not quite."}</p>
          <p className="leading-relaxed">{q.exp}</p>
        </div>
      )}
      <div className="flex gap-3 pt-1">
        {!checked && (
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
            disabled={sel === null}
            onClick={onCheck}
          >Check</button>
        )}
        {checked && !isLast && (
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium" onClick={onNext}>
            Next →
          </button>
        )}
        {checked && isLast && (
          <button
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium"
            onClick={() => onComplete(score, total)}
          >Mark Complete ✓</button>
        )}
      </div>
    </div>
  );
}

// ─── Station 1 — Who Counts? ──────────────────────────────────────────────────
const WHOCOUNTS_QS: QItem[] = [
  {
    q: "Maria works 20 hours a week at a coffee shop for pay. How is she classified in the labor market?",
    options: [
      "Employed, because she is working for pay",
      "Unemployed, because she is not working full-time",
      "Not in the labor force, because she works fewer than 35 hours",
      "Underemployed, and therefore counted as unemployed in official statistics",
    ],
    correct: 0,
    exp: "Employed means working for pay at any number of hours. Maria earns a wage, so she is employed. The BLS does not require full-time status — even one paid hour qualifies.",
  },
  {
    q: "James lost his job six months ago. He sent out résumés for the first three months, but became discouraged and stopped looking two months ago. How is James classified today?",
    options: [
      "Unemployed, because he still wants a job",
      "Not in the labor force, because he is not actively looking for work",
      "Cyclically unemployed, counted in the official U-3 rate",
      "Structurally unemployed, counted in the official U-3 rate",
    ],
    correct: 1,
    exp: "To be counted as unemployed (U-3), a person must be actively looking for work in the past four weeks. James stopped looking two months ago, so he is classified as not in the labor force — specifically a discouraged worker. He is visible only in the broader U-6 measure.",
  },
  {
    q: "Which of the following people is classified as NOT IN THE LABOR FORCE?",
    options: [
      "A nurse working night shifts at a hospital",
      "A college student who also works part-time as a tutor",
      "An active-duty member of the U.S. military",
      "A factory worker on temporary layoff awaiting recall",
    ],
    correct: 2,
    exp: "Active military are classified as Not in the Labor Force — not as employed. Also NILF: people under 16, retirees, full-time students not working, stay-at-home parents, and discouraged workers. The factory worker on layoff awaiting recall is counted as unemployed.",
  },
  {
    q: "The labor force equals:",
    options: [
      "The entire adult population (everyone 16 and older)",
      "Only full-time workers — part-time workers are excluded",
      "All adults who are not in school or the military",
      "Employed + Unemployed — it excludes those not actively participating",
    ],
    correct: 3,
    exp: "Labor Force = Employed + Unemployed. It excludes people not in the labor force (retirees, stay-at-home parents, discouraged workers, military, institutionalized, etc.). The unemployment rate is the number unemployed divided by the labor force — not by the entire adult population.",
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
        <p className="font-semibold text-foreground mb-2">The Three Buckets — Sorting the Adult Population</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {[
            ["Employed", "Working for pay (any hours), 15+ hrs unpaid family business, or temporarily absent"],
            ["Unemployed", "Not working AND actively looked past 4 weeks AND available to work"],
            ["Not in Labor Force", "Under 16, military, institutionalized, retirees, students, stay-at-home parents, discouraged workers"],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background rounded-lg p-2 border border-border">
              <p className="font-bold text-primary mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Nov 2021: 155.2M Employed · 6.9M Unemployed · 100.0M Not in Labor Force</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={WHOCOUNTS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 2 — Measuring Unemployment ──────────────────────────────────────
const MEASURING_QS: QItem[] = [
  {
    q: "Using the November 2021 data (155.175M employed, 6.877M unemployed, 262.029M adult population), what is the unemployment rate?",
    options: [
      "About 2.6% — divide unemployed by adult population",
      "About 4.2% — divide unemployed by the labor force",
      "About 6.8% — divide unemployed by employed",
      "About 8.1% — divide unemployed by adult population minus employed",
    ],
    correct: 1,
    exp: "UR = Unemployed ÷ Labor Force × 100 = 6.877 ÷ (155.175 + 6.877) × 100 = 6.877 ÷ 162.052 × 100 ≈ 4.2%. The key mistake to avoid: dividing by the adult population (262M) instead of the labor force (162M). The unemployment rate is NOT a share of all adults.",
  },
  {
    q: "Using the same November 2021 data, what is the Labor Force Participation Rate (LFPR)?",
    options: [
      "About 61.8% — labor force divided by adult population",
      "About 59.2% — labor force divided by employed",
      "About 95.8% — employed divided by labor force",
      "About 71.4% — employed divided by adult population",
    ],
    correct: 0,
    exp: "LFPR = Labor Force ÷ Adult Population × 100 = 162.052 ÷ 262.029 × 100 ≈ 61.8%. This tells us what share of the adult population is either working or actively looking for work. In November 2021, about 38.2% of adults were not in the labor force at all.",
  },
  {
    q: "The Bureau of Labor Statistics reports that the unemployment rate rose by 0.1 percentage point this month. Your slides note that 0.1% ≈ 160,000 people — roughly the population of Syracuse, NY. What is the main lesson of that scale check?",
    options: [
      "Small changes in the unemployment rate are economically unimportant",
      "The unemployment rate is imprecise and should not be used for policy",
      "Even small percentage-point changes represent enormous numbers of real people — scale matters when interpreting economic data",
      "The BLS should report absolute numbers of unemployed rather than percentages",
    ],
    correct: 2,
    exp: "A 0.1 percentage-point move sounds tiny, but it represents about 160,000 workers — an entire mid-size city entering or leaving unemployment. Scale checks like this build economic intuition: percentages can lull us into underestimating what the numbers mean in human terms.",
  },
  {
    q: "The LFPR trended upward from 1960 to 1999, then declined from 2000 to 2015, then dropped sharply in 2020 before partially recovering. What best explains the 1960–1999 rise?",
    options: [
      "A surge in immigration increased the adult population faster than the labor force",
      "Baby boomers retired in large numbers, reducing the NILF population",
      "The U.S. military downsized after Vietnam, moving millions into the civilian labor force",
      "Women entered the workforce in large numbers, steadily raising the share of adults participating",
    ],
    correct: 3,
    exp: "The 1960–1999 LFPR rise is primarily explained by women entering the workforce in large numbers. Female labor force participation roughly doubled over those four decades. The 2000–2015 decline reflects aging baby boomers retiring. The 2020 COVID drop was the largest single-year fall on record, with only partial recovery since.",
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
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="font-bold text-primary mb-1">Unemployment Rate</p>
            <p className="text-foreground font-mono">UR = (Unemployed ÷ Labor Force) × 100</p>
            <p className="text-muted-foreground mt-1">Nov 2021: 4.2%</p>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="font-bold text-primary mb-1">Labor Force Participation Rate</p>
            <p className="text-foreground font-mono">LFPR = (Labor Force ÷ Adult Pop.) × 100</p>
            <p className="text-muted-foreground mt-1">Nov 2021: 61.8%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Scale check: A 0.1% change ≈ 160,000 people — the entire population of Syracuse, NY</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MEASURING_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 3 — Beyond the Headline Rate (U-3 vs U-6) ───────────────────────
const ICEBERG_QS: QItem[] = [
  {
    q: "Teresa has a master's degree in accounting but can only find work as a barista. She works 35 hours a week and has stopped searching for accounting positions. How is she counted in official unemployment statistics?",
    options: [
      "Unemployed — her skills are mismatched with her job",
      "Not in the labor force — she stopped searching for better work",
      "Employed — she has a paying job, regardless of skill match",
      "Structurally unemployed — captured in U-3",
    ],
    correct: 2,
    exp: "Teresa is employed in the official U-3 measure because she is working for pay. Her situation — having skills far above her job — makes her underemployed, which only appears in the broader U-6 measure. This is the 'iceberg' insight: official unemployment counts only those not working at all who are actively looking.",
  },
  {
    q: "The U-6 unemployment rate is typically about double the official U-3 rate in normal times, and the gap widens during recessions. What three groups does U-6 add that U-3 misses?",
    options: [
      "Underemployed workers, discouraged workers, and involuntary part-time workers",
      "Retirees, students, and stay-at-home parents who want to return to work",
      "Gig workers, independent contractors, and unpaid family business workers",
      "Workers on temporary layoff, seasonal workers, and workers on strike",
    ],
    correct: 0,
    exp: "U-6 adds three groups U-3 misses: (1) Underemployed — college grad working at Starbucks using none of their skills; (2) Discouraged workers — gave up looking, so U-3 doesn't count them at all; (3) Involuntary part-time — want full-time work but can only get 20 hours. In good times U-6 ≈ 2× U-3. The gap widens in recessions as all three groups grow.",
  },
  {
    q: "During the Great Recession (2007–09), the U-3 rate peaked around 10%. Based on your slides' description of U-6, approximately what would you expect the U-6 rate to have been?",
    options: [
      "About 10.5% — U-6 is always very close to U-3",
      "About 12–13% — U-6 adds a fixed 2–3 percentage points",
      "About 17–18% — the gap between U-3 and U-6 widens significantly in recessions",
      "About 25% — U-6 captures nearly all adults who are not fully employed",
    ],
    correct: 2,
    exp: "U-6 peaked around 17% during the Great Recession, roughly 7 percentage points above the 10% U-3 peak. The gap widens in recessions because all three hidden-unemployment groups swell simultaneously: more workers get discouraged, more involuntary part-timers appear, and more overqualified workers take survival jobs. In normal times the gap is ~5 points; in downturns it can reach 7–8.",
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
            <ul className="space-y-1 text-amber-900">
              <li>• <span className="font-semibold">Underemployed</span> — college grad working at Starbucks; skills unused</li>
              <li>• <span className="font-semibold">Discouraged workers</span> — gave up looking; not counted in U-3 at all</li>
              <li>• <span className="font-semibold">Involuntary part-time</span> — want full-time, can only get 20 hours</li>
            </ul>
          </div>
          <p className="text-muted-foreground italic">U-6 ≈ 2× U-3 in good times; gap widens in recessions. FRED: UNRATE and U6RATE</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ICEBERG_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 4 — Patterns Over Time ──────────────────────────────────────────
const PATTERNS_QS: QItem[] = [
  {
    q: "The chart below shows the U.S. unemployment rate from 1950 to today. Which observation is NOT consistent with the long-run pattern your slides describe?",
    options: [
      "The rate rises sharply during recessions and falls during expansions",
      "The rate always returns to a 4–6% normal range, like a rubber band snapping back",
      "The rate shows a clear long-run upward trend — each recession peak is higher than the last",
      "The rate almost never falls below 3%, even in the strongest expansions",
    ],
    correct: 2,
    exp: "A long-run upward trend is NOT what the data shows. Despite population growth, globalization, technological disruption, and women entering the workforce, the unemployment rate shows no rising trend. It fluctuates with the business cycle but returns to its 4–6% normal range. Each recession raises it temporarily; each recovery brings it back.",
  },
  {
    q: "COVID-19 caused the unemployment rate to jump from 4.4% to 14.8% in a single month (March to April 2020). What makes this the most extraordinary labor market event in recorded U.S. history?",
    options: [
      "14.8% is the highest unemployment rate ever recorded in U.S. history, surpassing even the Great Depression",
      "It was the largest single-month jump on record — 10.4 percentage points in 30 days — caused by a sudden economic shutdown rather than a gradual downturn",
      "It was the first time unemployment rose above 10% since World War II",
      "The rate stayed above 10% for over two years, making it the longest high-unemployment period since the 1930s",
    ],
    correct: 1,
    exp: "The COVID spike was extraordinary not because of its peak level (14.8% vs. ~25% in the Great Depression) but because of its speed — 10.4 percentage points in a single month. Normal recessions build over quarters; this was a sudden administrative shutdown. The rate then recovered faster than any previous recession, dropping back below 4% within two years.",
  },
  {
    q: "Which of the following correctly describes the unemployment rate's long-run behavior across groups, according to your slides?",
    options: [
      "Black unemployment rates have converged to white rates since 1980 due to anti-discrimination laws",
      "Teen unemployment rates (16–19) are typically 3–5%, similar to prime-age workers",
      "College graduates face approximately 2.3% unemployment vs. ~5.7% for those without a diploma — education is the best unemployment insurance",
      "Women now face significantly higher unemployment than men due to their concentration in service industries",
    ],
    correct: 2,
    exp: "Your slides show a persistent education gradient: college degree ≈ 2.3%, some college ≈ 3.7%, HS diploma ≈ 5.2%, no diploma ≈ 5.7%. 'Education is the best unemployment insurance.' Teen rates run 15–30%. Black unemployment runs roughly 2× white rates, and that gap has not closed. Men's and women's rates have converged since ~1980, with women hit harder in the 2020 COVID recession.",
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
          {[
            ["4–6%", "Normal range"],
            ["14.8%", "COVID peak Apr 2020"],
            ["~25%", "Great Depression peak"],
          ].map(([val, label]) => (
            <div key={label} className="bg-background rounded-lg p-2 border border-border">
              <p className="font-bold text-primary text-base">{val}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p>• Rises in recessions, returns to 4–6% range (rubber band effect)</p>
          <p>• Almost never falls below 3%</p>
          <p>• No long-run upward trend despite population growth and globalization</p>
          <p>• COVID: largest single-month jump on record (4.4% → 14.8%)</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PATTERNS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 5 — Three Types + Sticky Wages ───────────────────────────────────
const TYPES_QS: QItem[] = [
  {
    q: "In 2022–23, Meta, Google, and Amazon laid off tens of thousands of workers as rising interest rates slowed the tech sector. What type of unemployment does this represent, and why?",
    options: [
      "Cyclical — it rose with a business-cycle downturn and will fall when the economy recovers",
      "Frictional — these workers will find new tech jobs quickly because their skills are in demand",
      "Structural — technology is replacing software engineers with AI",
      "Natural — this is the unavoidable baseline level of unemployment in any economy",
    ],
    correct: 0,
    exp: "Tech layoffs tied to rising rates and slowing growth are cyclical unemployment — they rise with the business cycle and fall in recoveries. Structural unemployment would mean the skills are permanently obsolete (e.g., travel agents replaced by the internet). Frictional is short-term job-to-job transitions. The 2022–23 tech layoffs fit cyclical: they followed rate hikes and many workers were quickly rehired as conditions stabilized.",
  },
  {
    q: "In theory, if wages were perfectly flexible, a recession should cause wages to fall until every worker who wants a job has one. In reality, we see mass layoffs instead of across-the-board pay cuts. Which of the following is NOT one of the reasons your slides give for why wages are 'sticky downward'?",
    options: [
      "Efficiency wages: firms pay above-market wages to attract higher productivity and reduce turnover",
      "Adverse selection: cutting wages causes the best workers — who have the most outside options — to leave first",
      "Tax policy: wage cuts trigger higher payroll tax obligations for the firm",
      "Morale: a 10% wage cut feels much worse to workers than never receiving a 10% raise",
    ],
    correct: 2,
    exp: "Tax policy is not one of the four reasons your slides give. The four are: (1) Laws/contracts — minimum wage and union contracts floor wages; (2) Efficiency wages — higher pay = harder work and less turnover; (3) Adverse selection — wage cuts drive away your best workers first; (4) Morale — loss aversion makes cuts feel worse than equivalent foregone raises. Result: firms lay off headcount rather than cut wages.",
  },
  {
    q: "A software developer loses her job because her company replaced her role with an AI coding assistant. Her skills in legacy COBOL programming are no longer in demand anywhere. What type of unemployment is this, and what does it imply for policy?",
    options: [
      "Frictional — she just needs time to find another employer who uses COBOL",
      "Cyclical — when the economy recovers, demand for COBOL will return",
      "Natural — this is an expected and healthy feature of any dynamic economy",
      "Structural — demand has permanently shifted away from her skill set; retraining, not stimulus, is the appropriate response",
    ],
    correct: 3,
    exp: "Structural unemployment occurs when demand permanently shifts away from a skill or industry. COBOL expertise is not coming back. Policy that targets cyclical unemployment (stimulus, rate cuts) won't help — the worker needs retraining or education. Your slides' key insight: 'Policy that targets one type of unemployment doesn't help the others.' Structural problems require structural solutions.",
  },
  {
    q: "Frictional unemployment is described in your slides as always present at 1–2% of the labor force. Which scenario best illustrates frictional unemployment?",
    options: [
      "A 55-year-old coal miner whose mine closed and whose skills don't transfer to available jobs",
      "A recent college graduate spending two months searching for the right entry-level marketing job",
      "An autoworker laid off when the economy enters recession and demand for cars drops",
      "A factory worker whose entire plant moved overseas and cannot find comparable work locally",
    ],
    correct: 1,
    exp: "Frictional unemployment is the normal, short-term job-search process — matching workers to jobs takes time even in a healthy economy. A new grad taking 2 months to land a first job is the textbook example. The coal miner and factory worker facing obsolete skills are structural. The autoworker laid off in a recession is cyclical. Frictional unemployment is not a problem to be solved — it is healthy labor market churn.",
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
            ["Cyclical", "Rises/falls with business cycle. Meta/Google layoffs 2022–23. Target: stimulus, rate cuts."],
            ["Frictional", "Normal job-search churn. Always 1–2%. New grad finding first job. Healthy."],
            ["Structural", "Skills mismatch. AI replacing data entry, travel agents. Target: retraining."],
          ].map(([type, desc]) => (
            <div key={type} className="bg-background rounded-lg p-2 border border-border">
              <p className="font-bold text-primary mb-1">{type}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"Policy that targets one type of unemployment doesn't help the others."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={TYPES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 6 — NAIRU & What Shifts the Natural Rate ────────────────────────
const NAIRU_QS: QItem[] = [
  {
    q: "The natural rate of unemployment is the rate at which cyclical unemployment equals zero. Which formula correctly describes it?",
    options: [
      "Natural Rate = Cyclical + Frictional",
      "Natural Rate = Frictional + Structural",
      "Natural Rate = Total Unemployment − Cyclical − Structural",
      "Natural Rate = Unemployment Rate when GDP = potential GDP minus frictional",
    ],
    correct: 1,
    exp: "Natural Rate = Frictional + Structural. These are the two components that exist even in a healthy, non-recessionary economy. Cyclical unemployment equals zero at the natural rate. The U.S. natural rate is estimated at approximately 4.5–5.5%, though it drifts over time as structural conditions change.",
  },
  {
    q: "In 2017–2019, the U.S. unemployment rate fell below 4% — below most estimates of the natural rate. According to your slides' speed-limit analogy, what economic consequence does this predict?",
    options: [
      "Accelerating wage and price inflation — employers bidding for scarce workers push wages up, which feeds into prices",
      "Deflation — too many workers competing for jobs drives prices down",
      "Faster GDP growth — below-natural unemployment means the economy is producing more than usual",
      "A recession — the Fed is forced to raise rates aggressively, causing an immediate downturn",
    ],
    correct: 0,
    exp: "When unemployment falls below the natural rate (NAIRU), employers scramble for scarce workers, bidding wages up. Higher wages flow into prices — inflation accelerates. This is exactly what happened: 2017–19 saw wage growth pick up, and the Fed raised rates in response. The speed-limit analogy: driving faster than the speed limit doesn't immediately crash the car, but it raises risk — here, the risk is inflation.",
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
    exp: "Internet job boards and platforms like LinkedIn lower the natural rate by reducing frictional unemployment — workers and employers find each other faster, shortening search time. Factors that RAISE the natural rate: large young-worker cohorts (high frictional churn), generous UI benefits (longer search), burdensome regulations (fewer jobs created). The natural rate is not fixed — it drifts as these structural conditions change.",
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
            <p className="text-foreground font-semibold mt-1">Natural Rate = Frictional + Structural</p>
            <p className="text-muted-foreground mt-1">U.S. estimate: ~4.5–5.5%</p>
          </div>
          <div className="bg-background rounded-lg p-2 border border-border">
            <p className="font-bold text-primary mb-1">What Shifts It</p>
            <p className="text-green-700 font-semibold">▼ Lowers: LinkedIn/job boards, aging population, productivity booms, retraining</p>
            <p className="text-red-700 font-semibold mt-1">▲ Raises: Generous UI, heavy hiring/firing regs, large youth cohorts, productivity slowdowns</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Speed limit analogy: push below NAIRU and the economy overheats — wages and prices accelerate</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={NAIRU_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─── Station 7 — Personal Finance & Costs ─────────────────────────────────────
const PERSONALFINANCE_QS: QItem[] = [
  {
    q: "The median unemployment spell lasts about 2 months, but a meaningful share of workers remain unemployed for 6 months or more. What does this distribution imply for how much emergency savings you should target?",
    options: [
      "1 month of expenses — the median spell is 2 months, so 1 month provides ample cushion",
      "Exactly 2 months — match the median spell length",
      "12+ months — any spell could become permanent structural unemployment",
      "3–6 months of expenses — the median matters less than the tail risk of a long spell",
    ],
    correct: 3,
    exp: "Your slides recommend 3–6 months of living expenses. The median spell of ~2 months is the typical outcome, but averages mask a long tail: recessions lengthen spells, and structural unemployment can stretch for over a year. The goal is not to cover the median case but to survive the bad cases. Emergency funds are insurance against low-probability, high-cost events — you size insurance for the tail, not the middle.",
  },
  {
    q: "Your slides state: 'Unemployment is not just an economic statistic — it is a deeply human experience.' Which of the following is listed as a human cost of unemployment beyond lost income?",
    options: [
      "Reduced government tax revenue and lower public investment",
      "Skills atrophy as workers fall behind on the latest industry practices",
      "Worse physical and mental health, strained marriages, and loss of identity and social connection",
      "Lower consumer spending that reduces GDP and delays the recovery",
    ],
    correct: 2,
    exp: "The human costs your slides emphasize: worse physical and mental health outcomes, strained marriages and family relationships, children's future earnings affected by a parent's unemployment spell, and loss of identity and social connection that work provides. The other options (tax revenue, skills atrophy, GDP drag) are real economic costs — but the question asks specifically about the human costs beyond income loss.",
  },
  {
    q: "Your slides argue: 'Macro happens to all of us — but how prepared you are when it does is mostly micro.' What is the practical personal-finance takeaway?",
    options: [
      "Avoid industries that are vulnerable to cyclical downturns",
      "Rely on unemployment insurance — it is designed to replace income during job loss",
      "Diversify your income streams so that no single employer accounts for more than 50% of income",
      "Build an emergency fund, invest in education as the best unemployment insurance, and maintain your professional network before you need it",
    ],
    correct: 3,
    exp: "The three micro-level tools your slides recommend: (1) Build 3–6 months of emergency savings — don't wait until you need it; (2) Education is the best unemployment insurance — the college-to-no-diploma rate gap (2.3% vs. 5.7%) is persistent; (3) Maintain your professional network always — connections built before a layoff are far more valuable than connections built after. Macro shocks are largely outside your control; your preparation for them is not.",
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

// ─── Flashcard Station ─────────────────────────────────────────────────────────
const FLASHCARDS = [
  { id: 1, type: "standard", front: "What are the three categories of the adult population in BLS labor statistics?", back: "Employed: working for pay (any hours), 15+ hrs unpaid family business, or temporarily absent.\n\nUnemployed: not working AND actively looked past 4 weeks AND available.\n\nNot in Labor Force: everyone else — under 16, military, institutionalized, retirees, students, stay-at-home parents, discouraged workers.", hint: "Employed · Unemployed · Not in Labor Force" },
  { id: 2, type: "cloze", front: "Complete: Unemployment Rate = (_______ ÷ _______) × 100", back: "Unemployment Rate = (Unemployed ÷ Labor Force) × 100\n\nNOT divided by adult population — only by the labor force (employed + unemployed).\nNov 2021 example: 6.877 ÷ 162.052 × 100 = 4.2%", hint: "Denominator = Labor Force, not adult population" },
  { id: 3, type: "cloze", front: "Complete: Labor Force Participation Rate = (_______ ÷ _______) × 100", back: "LFPR = (Labor Force ÷ Adult Population) × 100\n\nNov 2021: 162.052 ÷ 262.029 × 100 = 61.8%\n\nMeasures what share of adults are either working or actively looking.", hint: "LFPR denominator = adult population" },
  { id: 4, type: "standard", front: "What is a discouraged worker and how are they counted?", back: "A discouraged worker has given up looking for work because they believe no jobs are available for them.\n\nThey are NOT counted as unemployed in U-3 — they are classified as Not in the Labor Force.\n\nThey DO appear in the broader U-6 measure, which captures the full extent of labor market slack.", hint: "NILF in U-3 · Visible in U-6" },
  { id: 5, type: "standard", front: "What three groups does U-6 add that U-3 misses?", back: "U-6 = U-3 plus:\n1. Underemployed — workers whose skills far exceed their jobs (college grad at Starbucks)\n2. Discouraged workers — gave up looking, not counted in U-3 at all\n3. Involuntary part-time — want full-time work, can only get 20 hours\n\nU-6 ≈ 2× U-3 in normal times; gap widens in recessions.", hint: "Underemployed · Discouraged · Involuntary part-time" },
  { id: 6, type: "standard", front: "Define cyclical, frictional, and structural unemployment.", back: "Cyclical: rises/falls with the business cycle. Meta/Google layoffs in 2022–23. Policy: stimulus, rate cuts.\n\nFrictional: normal job-search time. Always 1–2%. New grad finding first job. Healthy and unavoidable.\n\nStructural: permanent skills mismatch. Travel agents replaced by internet, data-entry replaced by AI. Policy: retraining.\n\n'Policy targeting one type doesn't help the others.'", hint: "Cyclical=cycle · Frictional=search · Structural=mismatch" },
  { id: 7, type: "standard", front: "Why are wages 'sticky downward'? Give all four reasons.", back: "1. Laws & contracts — minimum wage laws and union contracts floor wages\n2. Efficiency wages — firms pay above-market to attract productivity and cut turnover\n3. Adverse selection — cutting wages drives away the best workers first (they have outside options)\n4. Morale — a 10% pay cut feels worse than never getting a 10% raise (loss aversion)\n\nResult: firms lay off headcount rather than cut wages in downturns.", hint: "Laws · Efficiency wages · Adverse selection · Morale" },
  { id: 8, type: "standard", front: "What is NAIRU and what does it equal?", back: "NAIRU = Non-Accelerating Inflation Rate of Unemployment\n\nAlso called the 'natural rate' of unemployment.\n\nNatural Rate = Frictional + Structural (cyclical = 0)\n\nU.S. estimate: ~4.5–5.5%, but it drifts over time.\n\nSpeed-limit analogy: push unemployment below NAIRU and wages accelerate → inflation accelerates → Fed must raise rates.", hint: "Natural Rate = Frictional + Structural · US ≈ 4.5–5.5%" },
  { id: 9, type: "standard", front: "What factors LOWER the natural rate of unemployment over time?", back: "↓ Internet job boards & LinkedIn — faster job matching reduces frictional unemployment\n↓ Growth of temp staffing — workers find quicker bridges between jobs\n↓ Aging population — older workers churn less, reducing frictional flows\n↓ Productivity booms — create new jobs faster\n↓ Retraining programs — reduce structural unemployment", hint: "LinkedIn · Temp staffing · Aging pop · Productivity · Retraining" },
  { id: 10, type: "standard", front: "What factors RAISE the natural rate of unemployment over time?", back: "↑ Generous/long-lasting UI benefits — workers search longer before accepting jobs\n↑ Burdensome hiring/firing regulations — firms create fewer permanent jobs\n↑ Productivity slowdowns — fewer new jobs created (1970s: 3.3% → 0.8%/yr)\n↑ Large youth cohorts — young workers churn at high rates, raising frictional flow\n↑ High minimum wages above equilibrium — fewer entry-level jobs created", hint: "UI · Regulations · Productivity slowdown · Youth cohorts · Min wage" },
  { id: 11, type: "standard", front: "What are the human costs of unemployment beyond lost income?", back: "• Worse physical and mental health outcomes\n• Strained marriages and family relationships\n• Children's future earnings reduced by parent's unemployment spell\n• Loss of identity — work provides structure, purpose, and social connection\n\n'Unemployment is not just an economic statistic — it is a deeply human experience.'\n\nEconomic costs: lost output never recovered, skills atrophy, lower tax revenue, reduced investment.", hint: "Health · Marriage · Children · Identity & routine" },
  { id: 12, type: "standard", front: "What are the three personal-finance takeaways from the unemployment chapter?", back: "1. Build a 3–6 month emergency fund — median spell ≈ 2 months but the tail is long; size insurance for bad cases\n\n2. Education is the best unemployment insurance — college degree ≈ 2.3% vs. no diploma ≈ 5.7% unemployment rate; the gap is persistent\n\n3. Maintain your professional network always — connections built before a layoff are far more valuable than ones built after\n\n'Macro happens to all of us — but how prepared you are is mostly micro.'", hint: "Emergency fund · Education · Network" },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [done, setDone] = useState(false);
  const card = FLASHCARDS[idx];
  const isLast = idx === FLASHCARDS.length - 1;
  const displayFront = card.type === "cloze"
    ? card.front.replace(/\{\{c1::[^}]+\}\}/g, "____")
    : card.front;
  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-green-800">You cleared the full Ch8 deck. The quiz is now unlocked.</p>
          <p className="text-sm text-green-700 mt-1">{FLASHCARDS.length} cards reviewed</p>
        </div>
        <button className="px-6 py-2 rounded-lg bg-green-700 text-white font-medium" onClick={() => onComplete(1, 1)}>
          Continue to Quiz →
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch8 Unemployment</p>
        <p className="text-xs text-muted-foreground">Card {idx + 1} of {FLASHCARDS.length} — review all cards to unlock the quiz</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm min-h-[160px] p-5 cursor-pointer select-none" onClick={() => setFlipped(f => !f)}>
        {!flipped ? (
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{card.type === "cloze" ? "Fill in the blank" : "Question"}</p>
            <p className="font-medium text-foreground leading-relaxed">{displayFront}</p>
            {hintShown && <p className="text-xs text-primary mt-3 italic">Hint: {card.hint}</p>}
            <p className="text-xs text-muted-foreground mt-4">Tap to reveal answer →</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Answer</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">{card.back}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {!hintShown && !flipped && (
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50" onClick={() => setHintShown(true)}>
            Hint
          </button>
        )}
        {flipped && (
          isLast ? (
            <button className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium" onClick={() => setDone(true)}>
              Finish Deck ✓
            </button>
          ) : (
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium" onClick={() => { setIdx(i => i + 1); setFlipped(false); setHintShown(false); }}>
              Next Card →
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Quiz Pool (15 questions, draw 10) ────────────────────────────────────────
const ALL_QUESTIONS: QItem[] = [
  { q: "Which of the following people is classified as UNEMPLOYED in official BLS statistics?", options: ["A laid-off worker who filed applications last week and is available to start immediately", "A retiree who wishes she had kept working", "A stay-at-home parent who would accept a job if offered but has not applied anywhere", "An active-duty soldier stationed overseas"], correct: 0, exp: "To be counted as unemployed (U-3), a person must: not be working, have actively looked for work in the past 4 weeks, and be available to start. The laid-off worker meets all three. The retiree and stay-at-home parent are NILF (not actively searching). Active military are classified as NILF, not employed or unemployed." },
  { q: "Using November 2021 data: 155.175M employed, 6.877M unemployed, 262.029M adult population. The unemployment rate is approximately:", options: ["2.6% — unemployed ÷ adult population", "4.2% — unemployed ÷ labor force", "6.8% — unemployed ÷ employed", "61.8% — labor force ÷ adult population"], correct: 1, exp: "UR = Unemployed ÷ Labor Force × 100 = 6.877 ÷ (155.175 + 6.877) × 100 = 6.877 ÷ 162.052 × 100 ≈ 4.2%. The common error is dividing by adult population (262M) instead of labor force (162M). 61.8% is the LFPR — a different measure." },
  { q: "A 0.1 percentage-point rise in the unemployment rate represents approximately how many workers?", options: ["About 1,600 workers — a small town", "About 16,000 workers — a small city neighborhood", "About 1.6 million workers — a major metro area", "About 160,000 workers — the population of Syracuse, NY"], correct: 3, exp: "With a labor force of ~162 million, 0.1% × 162,000,000 ≈ 162,000 people. Your slides use Syracuse, NY (~160,000) as the benchmark. This scale check builds intuition: what sounds like a tiny decimal change represents an entire mid-size city entering or leaving unemployment." },
  { q: "The Labor Force Participation Rate fell from ~67% in 2000 to ~63% by 2015, then dropped sharply to ~60% in 2020. What primarily drove the 2000–2015 decline?", options: ["A wave of immigration that increased the adult population without proportionally increasing the labor force", "Baby boomers reaching retirement age and exiting the labor force", "Young workers staying in school longer and delaying entry into the labor market", "Manufacturing job losses that permanently discouraged prime-age men from working"], correct: 1, exp: "The 2000–2015 LFPR decline is primarily explained by baby boomers aging into retirement. The boomer generation (born 1946–64) began turning 55+ in 2001, and retirement rates accelerated through the 2010s. Prime-age male participation also declined, but aging boomers are the dominant factor. The COVID 2020 drop was a different, faster mechanism — sudden economic shutdown." },
  { q: "Carlos stopped looking for work three months ago after 200 job applications went unanswered. He is counted in which measure?", options: ["U-3 only — he is officially unemployed", "U-6 only — he is a discouraged worker, classified as Not in the Labor Force for U-3", "Both U-3 and U-6 — all unemployed workers appear in both measures", "Neither — he has effectively left the workforce permanently"], correct: 1, exp: "Carlos is a discouraged worker: he stopped actively looking, so he does not meet the U-3 criterion of searching in the past 4 weeks. He is classified as Not in the Labor Force for U-3 purposes. But U-6 explicitly adds discouraged workers to capture the full picture of labor market slack. He is visible only in U-6." },
  { q: "U-6 is typically about double U-3 in normal times, but the gap widened to roughly 7 percentage points during the Great Recession. What causes the gap to widen in downturns?", options: ["BLS changes its methodology during recessions to count more workers", "All three hidden groups (underemployed, discouraged, involuntary part-time) grow simultaneously when the economy weakens", "The U-3 measure is suspended during declared recessions and replaced with U-6", "Discouraged workers are reclassified as unemployed during official recessions"], correct: 1, exp: "In recessions, all three U-6 additions swell at once: (1) More workers take survival jobs below their skill level (underemployed); (2) More workers give up searching (discouraged); (3) More firms cut hours instead of headcount (involuntary part-time). All three grow simultaneously, widening the U-6/U-3 gap from the normal ~5 points to 7–8 points at recession peaks." },
  { q: "Which statement about the long-run trend in U.S. unemployment is supported by the historical data?", options: ["The natural rate has risen steadily since 1950 due to technological displacement", "The unemployment rate fell steadily from 1945 to 2000, then began rising", "Each recession since 1980 has left the rate permanently higher than before", "Despite population growth, globalization, and major structural changes, the rate shows no long-run upward trend"], correct: 3, exp: "The U.S. unemployment rate shows no long-run upward trend — a remarkable fact given 75 years of population growth, technological upheaval, globalization, and shifting demographics. It rises in recessions and returns to its 4–6% range in expansions. This stability reflects the economy's ability to absorb labor market shocks while maintaining a roughly stable natural rate." },
  { q: "A clothing retailer lays off 500 workers when a recession cuts consumer spending. Six months later, as the economy recovers, the company rehires most of them. This is:", options: ["Cyclical unemployment — it rises with the business cycle and falls during recoveries", "Structural unemployment — demand for retail work has permanently shifted online", "Frictional unemployment — workers are between jobs by choice during normal labor market churn", "Natural unemployment — this is the baseline level of joblessness in a healthy economy"], correct: 0, exp: "Cyclical unemployment rises when aggregate demand falls (recessions) and declines when demand recovers. The key signal here: the layoffs are temporary and tied to economic conditions, and rehiring follows recovery. Structural would mean the jobs are permanently gone (e.g., if the retailer moved entirely to automation). Frictional involves voluntary transitions, not recession-driven layoffs." },
  { q: "Why do firms typically respond to recessions by laying off workers rather than cutting everyone's wages, even though wage cuts would keep more people employed?", options: ["Labor laws prohibit wage cuts in excess of 5% per year in most U.S. states", "Wage cuts would reduce the firm's tax deductions, making layoffs cheaper", "Workers prefer layoffs because unemployment insurance replaces most of their lost income", "Wages are 'sticky downward': efficiency wages, adverse selection, morale effects, and contracts prevent cuts"], correct: 3, exp: "Wages are sticky downward for four reasons: (1) Laws/contracts floor wages; (2) Efficiency wages — above-market pay drives productivity and cutting it destroys that; (3) Adverse selection — the best workers (with outside options) leave first when wages fall; (4) Morale — loss aversion makes a wage cut feel far worse than a foregone raise. Result: firms reduce headcount rather than wages." },
  { q: "A paralegal loses her job when her firm adopts AI document-review software that handles her entire workflow. Her legal-research skills are not in demand elsewhere. This is:", options: ["Structural unemployment — AI has permanently shifted demand away from her skill set", "Cyclical unemployment — when the economy recovers, law firms will need more paralegals", "Frictional unemployment — she just needs a few months to find a firm that still uses human paralegals", "Natural unemployment — this is expected baseline churn in a healthy labor market"], correct: 0, exp: "Structural unemployment occurs when demand permanently shifts away from a skill or job type — not a temporary recession, but a lasting change in what employers want. AI replacing document review is permanent. The policy implication: cyclical tools (stimulus, rate cuts) won't help — she needs retraining. 'Policy targeting one type of unemployment doesn't help the others.'" },
  { q: "The natural rate of unemployment in the U.S. is estimated at approximately 4.5–5.5%. What happens when the actual rate falls significantly below this level?", options: ["Deflation — too many workers competing drives prices down", "A productivity boom — more workers employed means more output per capita", "No change — the natural rate is a floor, not a ceiling", "Accelerating wage and price inflation — employers bid up wages for scarce workers, which feeds into prices"], correct: 3, exp: "Below the natural rate (NAIRU), employers scramble for scarce workers, bidding wages up. Higher wages become higher prices — inflation accelerates. This is the speed-limit analogy: driving faster doesn't immediately crash, but overheating builds. In 2017–2019, unemployment fell below 4%, wage growth picked up, and the Fed raised rates in response. FRED: compare UNRATE with NROU." },
  { q: "Which of the following would most directly LOWER the natural rate of unemployment over the next decade?", options: ["Extending the maximum duration of unemployment benefits from 26 to 52 weeks", "Widespread adoption of AI job-matching platforms that reduce average job-search time from 8 weeks to 3 weeks", "A large increase in the federal minimum wage above equilibrium in many local markets", "A surge in the number of 16–24 year olds entering the labor force as birth rates rose 20 years earlier"], correct: 1, exp: "AI job-matching platforms that cut average search time from 8 to 3 weeks would directly reduce frictional unemployment — the largest component of the natural rate. Extended UI benefits allow longer searches (raise natural rate). Minimum wages above equilibrium reduce entry-level job creation (raise). Large youth cohorts increase frictional churn (raise). Faster matching is a structural improvement that lowers the rate permanently." },
  { q: "Which of the following correctly ranks unemployment rates from highest to lowest, based on your slides?", options: ["Prime-age workers > College graduates > High school dropouts > Teenagers", "Teenagers > High school dropouts > College graduates > Prime-age workers", "High school dropouts > Teenagers > Prime-age workers > College graduates", "Teenagers > High school dropouts > Some college > College graduates"], correct: 3, exp: "From highest to lowest: Teenagers 16–19 (15–30%) > No diploma (~5.7%) > Some college (~3.7%) > College degree (~2.3%). Prime-age workers (25–54) generally fall in the 3–5% range. The education gradient is persistent and large — 'education is the best unemployment insurance.' Teen rates are extraordinarily high because of inexperience, part-time job searching, and high quit rates." },
  { q: "Your slides state that 'unemployment is not just an economic statistic — it is a deeply human experience.' Which of the following is a documented human cost of unemployment beyond lost income?", options: ["Reduced government tax revenue and lower public investment in infrastructure", "Worse physical and mental health, strained family relationships, and loss of identity and social connection", "Slower GDP growth that delays the economic recovery for all workers", "Increased frictional unemployment as laid-off workers search more carefully for better jobs"], correct: 1, exp: "The human costs documented in research: worse physical and mental health outcomes (mortality rises), strained marriages and family breakdown, children's own earnings reduced by a parent's unemployment spell, and the loss of identity, routine, and social connection that work provides. The economic costs (tax revenue, GDP, frictional effects) are separate — the question targets the personal human dimension." },
  { q: "Which personal-finance action does your chapter most directly recommend for managing unemployment risk?", options: ["Invest heavily in the stock market — long-run returns exceed the cost of any unemployment spell", "Build 3–6 months of living expenses as an emergency fund, invest in education, and maintain your network before you need it", "Purchase unemployment insurance supplemental coverage through private insurers", "Keep your spending low so you can survive on minimum wage if necessary"], correct: 1, exp: "The three recommendations from your slides: (1) 3–6 month emergency fund — sized for the tail risk of a long spell, not just the 2-month median; (2) Education is the best unemployment insurance — the degree/no-diploma rate gap is 2.3% vs. 5.7% and is persistent; (3) Network before you need it — connections built in advance are far more valuable than ones built after a layoff. 'Macro happens to all of us — how prepared you are is mostly micro.'" },
];

function QuizStation({ onPass, onFail }: {
  onPass: (score: number, results: { correct: boolean; exp: string }[]) => void;
  onFail: () => void;
}) {
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
    const newResults = [...results, { correct, exp: q.exp }];
    setResults(newResults);
    setChecked(true);
    if (isLast) {
      const score = newResults.filter(r => r.correct).length;
      setTimeout(() => {
        if (score >= 9) onPass(score, newResults);
        else onFail();
      }, 1200);
    }
  }

  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-sm">
        <p className="font-semibold text-foreground">Chapter 8 Quiz</p>
        <p className="text-muted-foreground">Question {idx + 1} / {questions.length}</p>
      </div>
      <p className="font-medium text-foreground text-sm leading-relaxed">{q.q}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ";
          if (!checked) {
            cls += sel === i ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-foreground hover:bg-muted/50";
          } else {
            if (i === q.correct) cls += "border-green-500 bg-green-50 text-green-800 font-semibold";
            else if (i === sel && sel !== q.correct) cls += "border-red-400 bg-red-50 text-red-700";
            else cls += "border-border bg-card text-muted-foreground";
          }
          return (
            <button key={i} className={cls} disabled={checked} onClick={() => setSel(i)}>
              <span className="font-semibold mr-2">{["A","B","C","D"][i]}.</span>{opt}
            </button>
          );
        })}
      </div>
      {checked && (
        <div className={`rounded-lg px-4 py-3 text-sm ${sel === q.correct ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          <p className="font-semibold mb-1">{sel === q.correct ? "✓ Correct!" : "✗ Not quite."}</p>
          <p className="leading-relaxed">{q.exp}</p>
        </div>
      )}
      {checked && !isLast && (
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium" onClick={handleNext}>
          Next →
        </button>
      )}
    </div>
  );
}

// ─── Not Yet Screen ────────────────────────────────────────────────────────────
function NotYetScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="rounded-xl p-6 text-center" style={{ background: "#fef3c7", border: "2px solid #f59e0b" }}>
        <p className="text-2xl mb-2">📋</p>
        <p className="font-bold text-amber-900 text-lg">Not quite there yet</p>
        <p className="text-amber-800 text-sm mt-2">You need 9 out of 10 correct to complete this chapter.</p>
        <p className="text-amber-700 text-xs mt-3 font-medium">This screen cannot be submitted. Only the final Results screen counts.</p>
      </div>
      <button className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium" onClick={onRetry}>
        Retake Quiz
      </button>
    </div>
  );
}

// ─── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({
  score, quizResults, stationScores, courseTitle,
}: {
  score: number;
  quizResults: { correct: boolean; exp: string }[];
  stationScores: Record<string, { score: number; total: number }>;
  courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");

  const stationLabels: Record<string, string> = {
    whocounts:      "Who Counts?",
    measuring:      "Measuring Unemployment",
    iceberg:        "Beyond the Headline Rate",
    patterns:       "Patterns Over Time",
    types:          "Three Types + Sticky Wages",
    nairu:          "NAIRU & Natural Rate",
    personalfinance:"Personal Finance & Costs",
    flash:          "Flashcard Review",
  };

  const stationRows = Object.entries(stationScores)
    .filter(([id]) => stationLabels[id])
    .map(([id, { score: sc, total: tot }]) => ({ label: stationLabels[id], score: sc, total: tot }));

  function printPDF() {
    const w = window.open("", "_blank");
    if (!w) return;
    const stRows = stationRows.map(r =>
      `<tr><td>${r.label}</td><td style="text-align:center">${r.score}/${r.total}</td><td style="text-align:center">${r.score===r.total?"✓ Perfect":r.score>=Math.ceil(r.total*0.7)?"✓ Good":"Review"}</td></tr>`
    ).join("");
    const qRows = quizResults.map((r, i) =>
      `<tr><td style="text-align:center">${i+1}</td><td style="text-align:center;color:${r.correct?"green":"red"}">${r.correct?"✓":"✗"}</td><td style="font-size:0.8rem">${r.exp}</td></tr>`
    ).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch8 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}td{padding:6px 10px;border-bottom:1px solid #e2e8f0}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 8 — Unemployment</h2>
    ${name ? `<p style="margin:4px 0;font-size:0.9rem"><strong>Student:</strong> ${name}</p>` : ""}
    <div class="score-box"><p>Quiz Score: ${score}/10 — ${score>=9?"Chapter Complete ✓":"Needs Review"}</p></div>
    ${exitTicket ? `<h3>Exit Ticket</h3><p style="font-size:0.85rem;line-height:1.5">${exitTicket}</p>` : ""}
    ${stRows?`<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stRows}</tbody></table>`:""}
    <h3>Quiz Question Review</h3><table><thead><tr><th style="text-align:center;width:30px">#</th><th style="text-align:center;width:30px">Result</th><th>Explanation</th></tr></thead><tbody>${qRows}</tbody></table>
    <footer>ECO 210 · Chapter 8 · Unemployment · Generated ${new Date().toLocaleDateString()}</footer>
    </body></html>`);
    w.document.close();
    w.print();
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Score card */}
      <div className={`rounded-xl p-5 text-center ${score>=9?"bg-green-50 border-2 border-green-300":"bg-amber-50 border-2 border-amber-300"}`}>
        <p className="text-4xl font-bold text-foreground">{score}/10</p>
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 8 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 8 — Unemployment</p>
      </div>

      {/* Name field (required) */}
      <div className="bg-card border border-border rounded-xl p-4">
        <label className="text-sm font-semibold text-foreground block mb-1">Your Name <span className="text-red-500">*</span></label>
        <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="First Last" value={name} onChange={e => setName(e.target.value)} />
      </div>

      {/* Exit ticket */}
      <div className="bg-card border border-border rounded-xl p-4">
        <label className="text-sm font-semibold text-foreground block mb-1">Exit Ticket</label>
        <p className="text-xs text-muted-foreground mb-2">In your own words: what is the difference between U-3 and U-6, and why does it matter?</p>
        <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} placeholder="Your response…" value={exitTicket} onChange={e => setExitTicket(e.target.value)} />
      </div>

      {/* Station scores */}
      {stationRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Station Scores</p>
          <div className="space-y-2">
            {stationRows.map(r => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-bold ${r.score===r.total?"text-green-700":r.score>=Math.ceil(r.total*0.7)?"text-amber-700":"text-red-600"}`}>{r.score}/{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz review */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Quiz Question Review</p>
        <div className="space-y-2">
          {quizResults.map((r, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 text-xs ${r.correct?"bg-green-50 border border-green-200":"bg-red-50 border border-red-200"}`}>
              <span className={`font-bold mr-2 ${r.correct?"text-green-700":"text-red-600"}`}>Q{i+1} {r.correct?"✓":"✗"}</span>
              <span className="text-muted-foreground">{r.exp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start over */}
      <button className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50" onClick={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} window.location.reload(); }}>
        Start Over
      </button>

      {/* Print PDF — always last */}
      <button className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm" onClick={printPDF}>
        Print / Save PDF
      </button>
    </div>
  );
}

// ─── Chapter Summary ───────────────────────────────────────────────────────────
const chapterSections = [
  {
    heading: "8.1 How Economists Define and Compute Unemployment Rate",
    body: "Unemployment imposes high costs. Unemployed individuals experience loss of income and stress. An economy with high unemployment suffers an opportunity cost of unused resources. We can divide the adult population into those in the labor force and those out of the labor force. In turn, we divide those in the labor force into employed and unemployed. A person without a job must be willing and able to work and actively looking for work to be counted as unemployed; otherwise, a person without a job is counted as out of the labor force. Economists define the unemployment rate as the number of unemployed persons divided by the number of persons in the labor force (not the overall adult population). The Current Population Survey (CPS) conducted by the United States Census Bureau measures the percentage of the labor force that is unemployed. The establishment payroll survey by the Bureau of Labor Statistics measures the net change in jobs created for the month.",
  },
  {
    heading: "8.2 Patterns of Unemployment",
    body: "The U.S. unemployment rate rises during periods of recession and depression, but falls back to the range of 4% to 6% when the economy is strong. The unemployment rate never falls to zero. Despite enormous growth in the size of the U.S. population and labor force in the twentieth century, along with other major trends like globalization and new technology, the unemployment rate shows no long-term rising trend.\n\nUnemployment rates differ by group: higher for African-Americans and Hispanic people than for White people; higher for less educated than more educated; higher for the young than the middle-aged. Women's unemployment rates used to be higher than men's, but in recent years men's and women's unemployment rates have been very similar. In recent years, unemployment rates in the United States have compared favorably with unemployment rates in most other high-income economies.",
  },
  {
    heading: "8.3 What Causes Changes in Unemployment over the Short Run",
    body: "Cyclical unemployment rises and falls with the business cycle. In a labor market with flexible wages, wages will adjust in such a market so that quantity demanded of labor always equals the quantity supplied of labor at the equilibrium wage. Economists have proposed many theories for why wages might not be flexible, but instead may adjust only in a \"sticky\" way, especially when it comes to downward adjustments: implicit contracts, efficiency wage theory, adverse selection of wage cuts, insider-outsider model, and relative wage coordination.",
  },
  {
    heading: "8.4 What Causes Changes in Unemployment over the Long Run",
    body: "The natural rate of unemployment is the rate of unemployment that the economic, social, and political forces in the economy would cause even when the economy is not in a recession. These factors include the frictional unemployment that occurs when people either choose to change jobs or are put out of work for a time by the shifts of a dynamic and changing economy. They also include any laws concerning conditions of hiring and firing that have the undesired side effect of discouraging job formation. They also include structural unemployment, which occurs when demand shifts permanently away from a certain type of job skill.",
  },
];

// ─── Header ────────────────────────────────────────────────────────────────────
const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "whocounts",      label: "Who Counts?" },
  { id: "measuring",      label: "Measuring UR" },
  { id: "iceberg",        label: "U-3 vs U-6" },
  { id: "patterns",       label: "Patterns" },
  { id: "types",          label: "Types" },
  { id: "nairu",          label: "NAIRU" },
  { id: "personalfinance",label: "Personal Finance" },
  { id: "flash",          label: "Flashcards" },
  { id: "quiz",           label: "Quiz" },
];

const STATION_ORDER: Station[] = [
  "intro","whocounts","measuring","iceberg","patterns","types","nairu","personalfinance","flash","quiz","results","not-yet"
];

function Header({
  station, completed, onNav, courseTitle, courseSubtitle, hubUrl,
}: {
  station: Station; completed: Set<Station>; onNav: (s: Station) => void;
  courseTitle: string; courseSubtitle: string; hubUrl: string;
}) {
  const pct = Math.round((completed.size / (STATION_ORDER.length - 3)) * 100);
  return (
    <header className="border-b border-border bg-background px-4 py-3 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground">{courseTitle}</p>
            <p className="text-sm font-semibold text-foreground">{courseSubtitle}</p>
          </div>
          <a href={hubUrl} className="text-xs text-primary hover:underline">← Hub</a>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mb-2">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct,100)}%` }} />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {NAV_STATIONS.map(s => {
            const done = completed.has(s.id);
            const active = station === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onNav(s.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" :
                  done ? "bg-green-100 text-green-800" :
                  "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {done && !active ? "✓ " : ""}{s.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const STATIONS = [
  { id: "whocounts"       as Station, label: "Who Counts?",               desc: "Classify employed, unemployed, and not in the labor force", icon: "👥" },
  { id: "measuring"       as Station, label: "Measuring Unemployment",    desc: "UR and LFPR formulas, worked examples, LFPR trends", icon: "📐" },
  { id: "iceberg"         as Station, label: "Beyond the Headline Rate",  desc: "U-3 vs U-6 — the hidden unemployment beneath the surface", icon: "🧊" },
  { id: "patterns"        as Station, label: "Patterns Over Time",        desc: "Historical benchmarks, COVID spike, who gets hit hardest", icon: "📊" },
  { id: "types"           as Station, label: "Three Types + Sticky Wages",desc: "Cyclical, frictional, structural — and why wages don't fall", icon: "⚙️" },
  { id: "nairu"           as Station, label: "NAIRU & Natural Rate",      desc: "The economy's speed limit — what shifts it up and down", icon: "🚦" },
  { id: "personalfinance" as Station, label: "Personal Finance & Costs",  desc: "Emergency funds, education, network — macro happens to all of us", icon: "💼" },
  { id: "flash"           as Station, label: "Flashcard Review",          desc: "Master all 12 key Ch8 concepts before the quiz", icon: "🃏" },
];

function Dashboard({
  completed, onSelect, quizUnlocked, onStartQuiz, onSummary,
}: {
  completed: Set<Station>; onSelect: (s: Station) => void;
  quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center pt-2 pb-1">
        <p className="text-base font-bold text-foreground">Chapter 8 — Unemployment</p>
        <p className="text-xs text-muted-foreground mt-0.5">Complete all stations, then pass the quiz (9/10) to finish</p>
      </div>
      <div className="space-y-2">
        {STATIONS.map(s => {
          const done = completed.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${done ? "bg-green-50 border-green-200" : "bg-card border-border hover:bg-muted/40"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-green-800" : "text-foreground"}`}>{s.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                </div>
                {done && <span className="text-green-600 font-bold text-sm">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1">
        {quizUnlocked ? (
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm" onClick={onStartQuiz}>
            Start Quiz →
          </button>
        ) : (
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm text-center">
            🔒 Complete all stations + flashcards to unlock the quiz
          </div>
        )}
        <button className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50" onClick={onSummary}>
          Summary
        </button>
      </div>
    </div>
  );
}

// ─── Summary Modal ─────────────────────────────────────────────────────────────
function SummaryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 8 Summary — Unemployment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-5 text-sm">
          {chapterSections.map(sec => (
            <div key={sec.heading}>
              <p className="font-semibold text-foreground mb-1">{sec.heading}</p>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function EconLab() {
  const courseTitle = "ECO 210 — Principles of Macroeconomics";
  const courseSubtitle = "Chapter 8 — Unemployment";
  const hubUrl = "/";

  const [station, setStation] = useState<Station>("intro");
  const [completed, setCompleted] = useState<Set<Station>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Station[]); } catch { return new Set(); }
  });
  const [stationScores, setStationScores] = useState<Record<string, { score: number; total: number }>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizResults, setQuizResults] = useState<{ correct: boolean; exp: string }[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const flashDone = completed.has("flash");
  const allStationsDone = STATIONS.every(s => completed.has(s.id));
  const quizUnlocked = flashDone && allStationsDone;

  function markDone(s: Station, score?: number, total?: number) {
    const next = new Set(completed);
    next.add(s);
    setCompleted(next);
    if (score !== undefined && total !== undefined) {
      setStationScores(prev => ({ ...prev, [s]: { score, total } }));
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
    setStation("intro");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header station={station} completed={completed} onNav={setStation} courseTitle={courseTitle} courseSubtitle={courseSubtitle} hubUrl={hubUrl} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {station === "intro"          && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "whocounts"      && <WhoCountsStation      onComplete={(sc, t) => markDone("whocounts",      sc, t)} />}
        {station === "measuring"      && <MeasuringStation      onComplete={(sc, t) => markDone("measuring",      sc, t)} />}
        {station === "iceberg"        && <IcebergStation        onComplete={(sc, t) => markDone("iceberg",        sc, t)} />}
        {station === "patterns"       && <PatternsStation       onComplete={(sc, t) => markDone("patterns",       sc, t)} />}
        {station === "types"          && <TypesStation          onComplete={(sc, t) => markDone("types",          sc, t)} />}
        {station === "nairu"          && <NairuStation          onComplete={(sc, t) => markDone("nairu",          sc, t)} />}
        {station === "personalfinance"&& <PersonalFinanceStation onComplete={(sc, t) => markDone("personalfinance", sc, t)} />}
        {station === "flash"          && <FlashcardStation      onComplete={(sc, t) => markDone("flash",          sc, t)} />}
        {station === "quiz" && (
          <QuizStation
            onPass={(score, results) => { setQuizScore(score); setQuizResults(results); markDone("quiz", score, 10); setStation("results"); }}
            onFail={() => setStation("not-yet")}
          />
        )}
        {station === "results"  && <ResultsScreen score={quizScore} quizResults={quizResults} stationScores={stationScores} courseTitle={courseTitle} />}
        {station === "not-yet"  && <NotYetScreen onRetry={() => setStation("quiz")} />}
      </main>
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
    </div>
  );
}
