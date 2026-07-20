import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "whymodel"
  | "threecurves"
  | "adshifts"
  | "outputgaps"
  | "zonesinfla"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch11";

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
// Station 1 — Why This Model?
// ─────────────────────────────────────────────
const WHYMODEL_QS = [
  {
    q: "Your slides describe the AD/AS model as 'the economy's master dashboard.' What four questions does this single framework answer simultaneously that no other model handles together?",
    options: [
      "Tax rates, interest rates, exchange rates, and trade balances",
      "Consumer spending, business investment, government borrowing, and net exports",
      "Short-run recessions, long-run growth, monetary policy, and fiscal policy",
      "Price levels & inflation, real GDP & growth, employment & unemployment, and the effects of policy shocks",
    ],
    correct: 3,
    exp: "Your slides explicitly list four questions: (1) Price levels & inflation — why does the overall price level rise? (2) Real GDP & growth — what determines how much the economy produces? (3) Employment & unemployment — when does joblessness rise or fall? (4) Effects of policy shocks — what do fiscal and monetary policy actually do? One model, four outputs — that's why it's the macro dashboard.",
  },
  {
    q: "Say's Law ('supply creates its own demand') predicts that markets self-correct to full employment automatically. Keynes' Law ('demand creates its own supply') predicts that the economy can get stuck. Your slides say 'both matter — the time horizon determines which law governs.' Which statement correctly applies this?",
    options: [
      "Say's Law governs in the long run (supply/real factors set the ceiling); Keynes' Law governs in the short run (sticky prices mean demand shocks stick)",
      "Say's Law governs in the short run because firms quickly adjust prices and wages after any shock",
      "Keynes' Law governs in the long run because consumer spending ultimately determines how much firms produce",
      "Neither law applies — the AD/AS model replaces both with a single unified theory",
    ],
    correct: 0,
    exp: "Your slides are explicit: Short run = Demand dominates (Keynes' Law) because wages and prices are sticky, so a collapse in spending causes a real recession and policy can fill the gap. Long run = Supply dominates (Say's Law) because eventually input prices adjust, profit margins normalize, and real output returns to its potential determined by labor, capital, and technology. Time horizon is the key.",
  },
  {
    q: "Your slides use an engine analogy: 'AD = accelerator. SRAS = current engine capacity. LRAS = the engine's peak design output.' What does it mean to 'floor the gas' (surge AD) when the engine is already near its peak design output (near LRAS)?",
    options: [
      "Output surges permanently above potential because stimulus adds real productive capacity",
      "The engine's design output increases — LRAS shifts right as AD pushes potential GDP higher",
      "You get mostly higher RPMs (prices/inflation) and little additional speed (real output) — the engine can't exceed its design limit for long without overheating",
      "Fuel efficiency improves — the economy produces more output per dollar of government spending"],
    correct: 2,
    exp: "Near LRAS (near potential GDP), the economy is in the Neoclassical zone — firms are near full capacity, workers are scarce, bottlenecks exist. Surging AD mostly bids up prices (inflation) rather than increasing real output. The 2021–22 case: massive post-COVID stimulus hit an economy already recovering, producing 9.1% CPI rather than proportional output gains. You can floor the gas, but you can't exceed the engine's physical design limit for long.",
  },
];

function WhyModelStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = WHYMODEL_QS[idx];
  const isLast = idx === WHYMODEL_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">One Model. Four Questions. Two Laws.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">AD/AS answers:</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Price levels & inflation</li>
              <li>• Real GDP & growth</li>
              <li>• Employment & unemployment</li>
              <li>• Effects of policy shocks</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Which law governs?</p>
            <p className="text-green-700 font-semibold text-xs">Short run: Keynes' Law — demand dominates (sticky prices)</p>
            <p className="text-blue-700 font-semibold mt-1 text-xs">Long run: Say's Law — supply dominates (real factors set ceiling)</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Analogy: AD = accelerator · SRAS = current engine capacity · LRAS = peak design output</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={WHYMODEL_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — The Three Curves
// ─────────────────────────────────────────────
const THREECURVES_QS = [
  {
    q: "AD = C + I + G + (X − M). A household's $10,000 savings account can no longer fund the same kitchen renovation it could last year because rising prices eroded its real value. Which of the three effects explaining AD's downward slope does this illustrate?",
    options: [
      "Wealth Effect — a higher overall price level erodes the real purchasing power of savings and financial assets, so households feel poorer and cut spending",
      "Interest Rate Effect — higher prices push up interest rates, making the renovation loan more expensive",
      "Foreign Price Effect — imported kitchen cabinets become relatively cheaper, reducing domestic spending",
      "Income Effect — higher prices reduce real wages, forcing households to reduce discretionary spending",
    ],
    correct: 0,
    exp: "The Wealth Effect: a higher price level reduces the real value of savings accounts, bonds, and other nominal assets — households feel poorer in real terms even if the nominal dollar balance is unchanged. That kitchen renovation that cost $10,000 now costs $12,000; the same savings account buys less. Result: consumption (C) falls. The Interest Rate Effect works through money demand/rates; the Foreign Price Effect works through (X−M).",
  },
  {
    q: "SRAS slopes upward because firms produce more when output prices rise (as long as input costs stay fixed). Which comparison in the SRAS vs. LRAS table from your slides correctly distinguishes the two curves?",
    options: [
      "SRAS: vertical · LRAS: upward sloping",
      "SRAS: input prices flexible · LRAS: input prices sticky",
      "SRAS: shifted by productivity/capital · LRAS: shifted by input costs and shocks",
      "SRAS: upward sloping, input prices sticky, shifted by cost shocks · LRAS: vertical at potential GDP, input prices fully flexible, shifted by real factors (productivity, capital, institutions)",
    ],
    correct: 3,
    exp: "From the slides' comparison table: SRAS is upward sloping (sticky input prices mean higher output prices widen profit margins → more production); it shifts when input costs change (oil shock, wage increases). LRAS is vertical at potential GDP (price level is irrelevant to long-run output); it shifts only when real factors change — quantity/quality of labor, physical capital, technology, or institutions. The critical difference: whether input prices are fixed or flexible.",
  },
  {
    q: "Rising oil prices cause U.S. firms' production costs to spike. In the AD/AS diagram, what happens?",
    options: [
      "AD shifts left — higher energy costs reduce household income and spending",
      "LRAS shifts left — the economy's long-run potential falls permanently",
      "Both AD and SRAS shift left simultaneously by equal amounts, leaving output unchanged",
      "SRAS shifts left — higher input costs raise prices at every output level, cutting profit margins and reducing production",
    ],
    correct: 3,
    exp: "SRAS shifts with production costs — oil is a key input. When oil prices spike, firms face higher costs at every output level: their profit margin (output price minus input cost) shrinks, so they produce less at each price level → SRAS shifts left. This is the supply-shock mechanism. AD is unaffected (it shifts with spending decisions, not production costs). LRAS only shifts with permanent changes in real productive capacity — an oil spike is temporary and doesn't change the economy's physical potential.",
  },
  {
    q: "In a diagram where AD meets SRAS, the equilibrium point (E) is where output and the price level are determined. Where does comparing E to LRAS tell you?",
    options: [
      "Whether the economy is growing faster or slower than other countries",
      "Whether the price level is above or below its target",
      "The output gap — whether actual GDP is below potential (recessionary), equal to potential (full employment), or above potential (inflationary)",
      "Whether monetary or fiscal policy was responsible for the current equilibrium",
    ],
    correct: 2,
    exp: "From your slides: 'Where AD meets SRAS sets current output and prices. Where AD meets LRAS would be full-employment output. The gap between them is the OUTPUT GAP.' If E is to the left of LRAS: recessionary gap (actual < potential). If E is exactly at LRAS: full employment. If E is to the right: inflationary gap (actual > potential temporarily). The output gap is the headline diagnosis — identifying it tells you both the problem and the appropriate policy response.",
  },
];

function ThreeCurvesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = THREECURVES_QS[idx];
  const isLast = idx === THREECURVES_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Three Curves — One Diagram</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["AD","Downward sloping. Total spending falls as price level rises. Why: Wealth + Interest Rate + Foreign Price effects. Shifts: spending decisions (C, I, G, X−M)."],
            ["SRAS","Upward sloping. Input prices sticky short run. Higher output price → wider margin → more production. Shifts: input costs, supply shocks, productivity."],
            ["LRAS","Vertical at potential GDP. Price level irrelevant to long-run output. Shifts: real factors only — labor quantity/quality, capital, technology, institutions."],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Equilibrium E: where AD meets SRAS. Compare E to LRAS to identify the output gap.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={THREECURVES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — What Shifts AD?
// ─────────────────────────────────────────────
const ADSHIFTS_QS = [
  {
    q: "The Federal Reserve raises the federal funds rate from 0.25% to 5.25%. Through the AD/AS framework, trace the mechanism by which this shifts AD.",
    options: [
      "Higher rates raise the cost of borrowing for consumers (mortgages, car loans) and businesses (investment) → C and I fall → AD shifts left",
      "Higher rates reduce the money supply → firms have less cash to invest → SRAS shifts left",
      "Higher rates increase government borrowing costs → G falls directly → AD shifts left",
      "Higher rates attract foreign capital → dollar strengthens → exports become cheaper abroad → net exports rise → AD shifts right",
    ],
    correct: 0,
    exp: "The interest rate channel: Fed raises rates → borrowing becomes more expensive → consumers postpone home purchases and car loans (C falls) → businesses delay capital investment (I falls) → AD shifts left. This is exactly the mechanism the Fed used 2022–23 to cool post-COVID inflation: fed funds rate 0.25%→5.25% shifted AD left, slowing demand and eventually bringing CPI back toward 3% by end of 2023.",
  },
  {
    q: "Consumer confidence surveys collapse after a major stock market crash. Households, worried about their financial futures, cut back on purchases of durable goods. In the AD/AS diagram, what happens and why?",
    options: [
      "SRAS shifts left — lower consumer confidence reduces firms' willingness to produce",
      "AD shifts left — lower consumer confidence reduces C (consumption) at every price level, moving the entire demand curve inward",
      "AD shifts right — reduced spending means prices fall, which moves the economy along AD",
      "LRAS shifts left — reduced household wealth permanently reduces the economy's productive capacity",
    ],
    correct: 1,
    exp: "A confidence shock reduces consumption (C) at every price level — that's an AD shift, not a movement along AD. Key distinction from your slides: 'Shocks change SPENDING decisions; AD moves; equilibrium changes. A shift ≠ movement along the curve (which is caused by price level changes).' SRAS shifts with production costs, not demand. LRAS shifts with real productive capacity. A drop in consumer confidence is purely a demand-side event → AD shifts left.",
  },
  {
    q: "A weaker U.S. dollar makes American goods cheaper for foreign buyers and makes imported goods more expensive for Americans. How does this affect AD?",
    options: [
      "AD shifts left — imports become more expensive, raising costs for U.S. consumers",
      "AD shifts right — exports rise (foreigners buy more U.S. goods) and imports fall (Americans buy fewer foreign goods), increasing net exports (X−M)",
      "SRAS shifts left — higher import prices raise production costs for U.S. firms",
      "LRAS shifts right — a weaker dollar permanently increases U.S. productive capacity",
    ],
    correct: 1,
    exp: "This is the Foreign Price Effect on AD. A weaker dollar: (1) U.S. exports become cheaper abroad → foreign buyers purchase more → X rises; (2) Imports become more expensive for Americans → Americans buy fewer imports → M falls. Net exports (X−M) increase → AD shifts right. Note: if imported inputs also rise in price, SRAS could shift left simultaneously — but the question is asking specifically about the AD effect through the (X−M) component.",
  },
];

function AdShiftsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ADSHIFTS_QS[idx];
  const isLast = idx === ADSHIFTS_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">What Shifts AD?</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-green-700 mb-1">→ Rightward (AD increases)</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Higher consumer/business confidence</li>
              <li>• Tax cuts → C rises</li>
              <li>• More government purchases → G rises</li>
              <li>• Lower interest rates / Fed eases → I and C rise</li>
              <li>• Weaker dollar → net exports rise</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-red-700 mb-1">← Leftward (AD decreases)</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Lower consumer/business confidence</li>
              <li>• Tax increases → C falls</li>
              <li>• Government spending cuts → G falls</li>
              <li>• Higher rates / Fed tightens → I and C fall</li>
              <li>• Stronger dollar → net exports fall</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Key distinction: a shift moves the whole curve · a movement along AD is caused by a price level change</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ADSHIFTS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Output Gaps
// ─────────────────────────────────────────────
const OUTPUTGAPS_QS = [
  {
    q: "A diagram shows AD and SRAS intersecting at point E, which lies to the LEFT of the LRAS line. Actual GDP = $18T; Potential GDP = $20T. What is the economic situation and what do your slides say is appropriate policy?",
    options: [
      "Inflationary gap — actual GDP exceeds potential. Policy: tighten (raise rates or cut G) to shift AD left",
      "Full employment — AD and SRAS meet exactly at LRAS. Policy: maintain stability, avoid destabilizing shifts",
      "Stagflation — the economy is simultaneously below potential and experiencing rising prices",
      "Recessionary gap — actual GDP is below potential; unemployment is above the natural rate. Policy: stimulus (cut rates or raise G) to shift AD right",
    ],
    correct: 3,
    exp: "Recessionary gap: AD/SRAS equilibrium to the LEFT of LRAS means actual GDP ($18T) < potential GDP ($20T). Unemployment is above the natural rate. Downward pressure on prices builds over time (wages eventually fall, SRAS shifts right — self-correction). Policy fix: stimulus — cut interest rates (monetary) or increase government spending/cut taxes (fiscal) to shift AD right toward LRAS. Examples: 2008–09 Great Recession, COVID-19 Q2 2020.",
  },
  {
    q: "It's 2019. The FRED chart shows Real GDP (GDPC1) running exactly along the Potential GDP (GDPPOT) line. In AD/AS terms, where is the equilibrium and what does this imply for policy?",
    options: [
      "Recessionary gap — stimulus needed to push GDP above potential",
      "Inflationary gap — tightening needed to reduce GDP back to potential",
      "Full employment — AD/SRAS intersect exactly at LRAS; unemployment is at the natural rate; policy should maintain stability and avoid destabilizing shocks",
      "Stagflation — stable prices and full employment cannot coexist in the AD/AS model",
    ],
    correct: 2,
    exp: "Full employment equilibrium: when AD/SRAS intersect exactly at LRAS, actual GDP equals potential, unemployment is at its natural rate, and the price level is stable — no gap to close. Your slides note 'The economy's ideal equilibrium' with example: U.S. late 1990s expansion and 2019 pre-COVID. Policy prescription: 'Maintain; avoid destabilizing shifts.' No stimulus or tightening needed — the economy is where it should be.",
  },
  {
    q: "In mid-2021, the FRED chart shows Real GDP exceeding Potential GDP. CPI hit 9.1% in June 2022. In AD/AS terms, what gap existed and what was the self-correction mechanism your slides describe?",
    options: [
      "Inflationary gap — AD/SRAS intersected to the RIGHT of LRAS; workers gained bargaining power, wages rose, SRAS shifted left, self-correcting toward potential (but the Fed accelerated this with rate hikes)",
      "Recessionary gap — the economy needed more stimulus to close the output shortfall",
      "Full employment — prices were stable and output was at potential throughout 2021–22",
      "Stagflation — SRAS shifted left first, creating simultaneous high inflation and below-potential output",
    ],
    correct: 0,
    exp: "Inflationary gap: AD/SRAS to the right of LRAS means actual GDP > potential temporarily. With labor tight, workers gain bargaining power → wages rise → SRAS shifts left → output falls back toward potential → prices stabilize. This is the self-correction mechanism. In 2021–22 the Fed didn't wait — it raised rates from 0.25% to 5.25% (2022–23) to shift AD left and accelerate the correction. CPI returned to ~3% by end of 2023.",
  },
  {
    q: "A student says: 'If the economy is in a recessionary gap, firms will eventually cut wages and SRAS will shift right on its own — so we don't need fiscal or monetary policy.' Your slides acknowledge this self-correction mechanism but identify a practical problem. What is it?",
    options: [
      "Wages cannot fall in modern economies because of technology — digital contracts prevent wage cuts",
      "Self-correction works but may take a very long time — sticky wages and contracts mean the adjustment can take years, during which unemployment causes real human and economic harm",
      "Self-correction always overshoots — SRAS shifts too far right, creating an inflationary gap on the other side",
      "LRAS shifts left during recessions, so there is no gap to close through self-correction",
    ],
    correct: 1,
    exp: "Your slides explicitly acknowledge the self-correction mechanism (recessionary gap → wages fall → SRAS shifts right → output returns to potential) but note the practical problem: sticky wages and long-term contracts mean this adjustment can take years. Keynes famously said 'In the long run we are all dead.' During that adjustment period, unemployment causes real human costs (lost income, skills atrophy, health impacts) and economic costs (lost output that's never recovered). Active policy can accelerate the return to potential.",
  },
];

function OutputGapsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = OUTPUTGAPS_QS[idx];
  const isLast = idx === OUTPUTGAPS_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Three Output Gap Diagnoses</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["Recessionary Gap","AD/SRAS LEFT of LRAS. Actual < Potential. Unemployment above natural rate. Policy: stimulus → shift AD right. Ex: 2008–09, COVID Q2 2020."],
            ["Full Employment","AD/SRAS AT LRAS. Actual = Potential. Unemployment at natural rate. Policy: maintain stability. Ex: late 1990s, 2019 pre-COVID."],
            ["Inflationary Gap","AD/SRAS RIGHT of LRAS. Actual > Potential temporarily. Unemployment below natural rate. Policy: tighten → shift AD left. Ex: 2021–22 post-COVID."],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">FRED: GDPC1 (Real GDP) vs. GDPPOT (Potential GDP). Gap below potential = recession; above = inflationary pressure.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={OUTPUTGAPS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Zones & Inflation Types
// ─────────────────────────────────────────────
const ZONESINFLA_QS = [
  {
    q: "It's 1933. The U.S. economy is in the depths of the Great Depression — unemployment is ~25%, factories stand idle, prices are falling. In the AD/AS diagram, the equilibrium is far to the LEFT of LRAS. A government spending program shifts AD right. According to the three-zone framework, what is the likely result?",
    options: [
      "Large output gain with minimal inflation — the economy is in the Keynesian zone (flat SRAS), so AD shift right produces real jobs with little price pressure",
      "Mainly inflation — the economy is near full capacity, so spending just bids up prices",
      "Stagflation — government spending always raises both output and prices simultaneously",
      "The AD shift moves equilibrium right but LRAS shifts left by an equal amount, leaving output unchanged",
    ],
    correct: 0,
    exp: "Keynesian zone: far left of SRAS, where the curve is nearly flat. Enormous idle capacity (25% unemployment) means firms can easily hire unused workers at stable wages. A rightward AD shift produces large real output gains with minimal price pressure. Your slides note: 'Stimulus is highly effective — creates real jobs, not inflation.' Historical case: FDR's 1933–38 programs. The multiplier was very high in this zone because resources were so underutilized.",
  },
  {
    q: "In 2021, the U.S. economy was recovering rapidly. Unemployment fell from 14.7% (April 2020) to ~4% by end of 2021. Congress passed ~$5T in cumulative stimulus. CPI hit 9.1% in June 2022. Which zone of SRAS does this illustrate, and why?",
    options: [
      "Keynesian zone — massive idle capacity meant stimulus created jobs without inflation",
      "Intermediate zone — some growth with moderate inflation, consistent with a mid-recovery economy",
      "The economy was in a recessionary gap throughout 2021–22, so inflation could not have occurred",
      "Neoclassical zone — the economy was near or at LRAS; the AD surge produced mainly price increases (inflation) rather than lasting real output gains, because capacity was tight",
    ],
    correct: 3,
    exp: "Neoclassical zone: near or at LRAS, where SRAS is steep. With unemployment near 4% and factories recovering, the economy had little spare capacity. The massive post-COVID stimulus ($5T+) hit an already-tightening economy → AD surged right in the Neoclassical zone → firms couldn't expand fast enough → prices bid up → 9.1% CPI. 'Stimulus is mostly inflationary, little real benefit' when the economy is already near potential. This is the central lesson of 2021–22.",
  },
  {
    q: "In October 1973, OPEC imposed an oil embargo. Oil prices quadrupled in six months. U.S. unemployment hit 8.5% by 1975 AND CPI inflation peaked above 12% in 1974 — high unemployment and high inflation simultaneously. What caused this 'worst-of-both-worlds' combination?",
    options: [
      "AD shifted far right — too much government spending caused both the output rise and the inflation",
      "SRAS shifted left — the oil shock raised production costs, forcing firms to cut output and raise prices simultaneously, creating stagflation",
      "LRAS shifted right — productivity growth increased potential GDP, temporarily causing both output growth and price adjustment",
      "AD and LRAS shifted right simultaneously — the oil shock paradoxically increased both demand and productive capacity",
    ],
    correct: 1,
    exp: "This is cost-push inflation (stagflation): SRAS shifts left — the oil shock raised input costs for virtually every firm in the economy. Higher costs → firms cut output (GDP falls) AND raise prices (inflation rises) simultaneously. Output fell AND prices rose — the worst-of-both-worlds. Your slides note the policy dilemma: 'Fighting inflation (tightening) deepens the recession; fighting recession (easing) accelerates inflation.' This is why supply shocks are uniquely painful — the standard demand-management toolkit makes one problem worse when you fix the other.",
  },
  {
    q: "Demand-pull inflation and cost-push inflation both raise the price level, but your slides say they require 'opposite remedies.' Why?",
    options: [
      "They don't require opposite remedies — standard monetary tightening cures both types equally",
      "Demand-pull is cured by cutting taxes; cost-push is cured by raising taxes — opposite fiscal tools",
      "Demand-pull: AD surged past potential → restrict demand (raise rates, cut G) to shift AD left. Cost-push: SRAS shifted left → restricting demand deepens the recession without fixing the supply problem — opposite effects from the same policy",
      "Demand-pull requires fiscal policy; cost-push requires monetary policy — different institutions, not opposite effects",
    ],
    correct: 2,
    exp: "The asymmetry: Demand-pull (AD surge into Neoclassical zone) → tighten demand → AD shifts left → both output and prices return to potential. This works. Cost-push (SRAS shifts left → stagflation) → tighten demand → AD shifts left too → output falls further (deeper recession) while barely denting the supply-side inflation. Easing to fight the recession accelerates the inflation instead. Your slides: 'Same outcome (inflation), very different policy responses. Fighting cost-push with demand restriction deepens the recession while barely denting inflation.' Volcker eventually broke it through sustained tightening — but it took two recessions.",
  },
];

function ZonesInflaStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ZONESINFLA_QS[idx];
  const isLast = idx === ZONESINFLA_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Three SRAS Zones + Two Inflation Types</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs mb-2">
          {[
            ["Keynesian Zone","Far left. Flat SRAS. High unemployment. AD shift → big output gain, tiny price rise. Ex: Great Depression 1933–38."],
            ["Intermediate","Middle. AD shift → output AND prices rise. Tradeoffs emerge. Most recoveries pass through here. Ex: U.S. mid-2010s."],
            ["Neoclassical","Near LRAS. Steep SRAS. AD shift → mainly inflation, little real output gain. Ex: 2021–22 post-COVID stimulus."],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Demand-Pull Inflation</p>
            <p className="text-muted-foreground">AD surges past potential. Prices AND output rise. Fix: restrict demand. Ex: Vietnam-era 1960s, post-COVID 2021.</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Cost-Push (Stagflation)</p>
            <p className="text-muted-foreground">SRAS shifts left. Prices rise AND output FALLS. Fix: neither tool works cleanly. Ex: 1973 OPEC — oil 4× in 6 months.</p>
          </div>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ZONESINFLA_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Personal Finance & the Macro Dashboard
// ─────────────────────────────────────────────
const PERSONALFINANCE_QS = [
  {
    q: "Your slides say: 'When AD is overheating (inflationary gap), expect rates to rise — lock in fixed mortgage rates BEFORE the Fed hikes.' A homebuyer in mid-2021 sees CPI at 5% and rising, unemployment at 4%, and Real GDP above Potential GDP. What should the AD/AS model tell her about mortgage strategy?",
    options: [
      "Lock in a fixed-rate mortgage now — the inflationary gap signals the Fed will raise rates, making variable-rate mortgages far more expensive soon",
      "Wait for rates to fall — inflationary gaps always resolve through SRAS self-correction without Fed action",
      "Take an adjustable-rate mortgage — rising inflation means rising wages will easily cover higher payments",
      "Delay the purchase entirely — inflationary gaps always lead to housing price crashes within 12 months",
    ],
    correct: 0,
    exp: "The macro dashboard in action: inflationary gap (Real GDP > Potential, CPI rising, unemployment tight) → Fed will tighten to close the gap → rates will rise. A homebuyer who reads this correctly locks in a fixed rate before the hikes. In 2021–22, the Fed raised rates from 0.25% to 5.25% — mortgage rates roughly doubled. A buyer who locked in 3% in early 2021 avoided the rate surge. This is what your slides mean by 'the AD/AS model tells you which type of problem is coming and which asset classes to prepare for.'",
  },
  {
    q: "Your slides say: 'Recessionary gaps mean hiring freezes and layoffs — build emergency savings, update skills, get certifications, diversify income streams BEFORE the gap widens.' A mid-career worker in late 2007 sees the FRED chart showing Real GDP beginning to fall below Potential GDP. What career moves does the AD/AS model suggest?",
    options: [
      "Negotiate a large raise immediately — recessionary gaps always cause wages to spike as firms compete for workers",
      "Invest aggressively in growth stocks — recessionary gaps mean the stock market will boom",
      "Job-hop now to maximize salary — recessionary gaps create a seller's market for labor",
      "Build emergency savings, update certifications, and diversify income before hiring freezes hit — recessionary gaps signal layoffs and reduced job mobility ahead",
    ],
    correct: 3,
    exp: "Recessionary gap diagnosis: AD/SRAS left of LRAS → unemployment rising, hiring freezes coming, layoffs likely. Your slides' prescription: build emergency savings (6+ months), update skills and certifications (structural displacement accelerates in recessions), diversify income streams before the gap widens. 'Don't job-hop into a recession.' In 2008–09 unemployment hit 10% — workers who had shored up savings and skills in 2007 navigated the downturn far better. The AD/AS model is a forward-looking positioning guide.",
  },
  {
    q: "Your slides describe investment positioning for different macro environments: 'Inflationary gaps favor TIPS, real estate, broad equities, and short-duration debt. Supply shocks (stagflation) are hardest — both bonds AND equities struggle.' It's 1974 — SRAS has shifted left from the OPEC shock. Stagflation: inflation >12%, GDP falling. Which asset class does the AD/AS model suggest is least harmful?",
    options: [
      "Long-duration Treasury bonds — they protect against recession by providing guaranteed nominal returns",
      "Growth tech stocks — innovation always outperforms in supply-shock environments",
      "Real assets and commodities — when SRAS shifts left from a supply shock, the underlying commodity (oil, real estate) often holds value better than financial assets whose returns are eroded by both inflation and recession",
      "Cash — stagflation environments always favor holding cash since both stocks and bonds fall"],
    correct: 2,
    exp: "Stagflation is uniquely difficult: bonds lose real value to inflation; equities suffer from falling GDP and margins squeezed by rising input costs. Your slides: 'Supply shocks (stagflation) are hardest: both bonds AND equities struggle. Real assets and commodities historically hold value.' In 1973–74, oil stocks, commodity producers, and real estate held value far better than the S&P 500 (which fell ~45% 1973–74). Cash loses to 12% inflation. TIPS didn't exist yet in 1974 — but they would be appropriate in modern stagflation as the closest equivalent.",
  },
];

function PersonalFinanceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = PERSONALFINANCE_QS[idx];
  const isLast = idx === PERSONALFINANCE_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">The AD/AS Model Is Your Personal Macro Dashboard</p>
        <p className="text-xs text-muted-foreground italic mb-2">"The macro dashboard is not academic — it is a positioning guide."</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            ["Read the Environment","Inflationary gap → rates rising → lock in fixed mortgage. SRAS shock → stagflation → brace for simultaneous recession AND inflation."],
            ["Career Positioning","Recessionary gap → layoffs coming → build savings, update skills, certify now. Inflationary gap (tight labor) → negotiate raises, leverage your position."],
            ["Invest for the Gap","Recessionary gap: quality bonds, defensive stocks, cash optionality. Inflationary gap: TIPS, real estate, equities. Stagflation: real assets, commodities."],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PERSONALFINANCE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
type Flashcard = { id: number; type: "standard" | "cloze"; front: string; back: string; hint: string };

const CH11_CARDS: Flashcard[] = [
  { id: 1, type: "standard", front: "What four questions does the AD/AS model answer simultaneously?", back: "One model. Four questions:\n1. Price levels & inflation — why does the overall price level rise?\n2. Real GDP & growth — what determines how much the economy produces?\n3. Employment & unemployment — when does joblessness rise or fall?\n4. Effects of policy shocks — what do fiscal and monetary policy actually do?\n\nNo other macro framework answers all four at once — that's why it's called the economy's master dashboard.", hint: "Prices · Real GDP · Employment · Policy effects" },
  { id: 2, type: "standard", front: "What is Say's Law vs. Keynes' Law, and when does each govern?", back: "Say's Law: 'Supply creates its own demand.' Production generates income → workers and firms spend those earnings → markets self-correct to full employment. Neoclassical / long-run view.\n\nKeynes' Law: 'Demand creates its own supply.' Spending drives production. Economy can get stuck below potential. Short-run rigidities (sticky wages, contracts) prevent fast self-correction. Keynesian / short-run view.\n\nModern synthesis: BOTH matter — the time horizon determines which law dominates. Short run = Keynes (demand dominates). Long run = Say (supply/real factors set the ceiling).", hint: "Say's = supply creates demand (long run). Keynes = demand creates supply (short run)." },
  { id: 3, type: "cloze", front: "Complete: AD = _______ + _______ + _______ + (_______)", back: "AD = C + I + G + (X − M)\n\nC = Consumption (~70% of U.S. GDP) — household spending on goods/services\nI = Investment — business capital spending; equipment, software, structures, inventories. Volatile.\nG = Government Purchases — federal, state, local spending on goods/services. Excludes transfer payments.\n(X − M) = Net Exports — exports minus imports. Positive when U.S. sells more abroad than it buys.", hint: "C + I + G + (X − M). C is largest (~70%)." },
  { id: 4, type: "standard", front: "Why does the AD curve slope downward? Give all three effects.", back: "Three effects explain why total spending falls as the price level rises:\n\n1. Wealth Effect: Higher prices erode real value of savings/financial assets → households feel poorer → cut consumption (C falls).\n\n2. Interest Rate Effect: Higher prices → more money needed for transactions → money demand rises → interest rates rise → borrowing more expensive → C and I fall.\n\n3. Foreign Price Effect: U.S. prices rise relative to foreign prices → U.S. exports become expensive for foreigners (exports fall) → imports become relatively cheaper (imports rise) → net exports (X−M) shrink.\n\nAll three reduce spending at higher price levels → downward slope.", hint: "Wealth effect · Interest rate effect · Foreign price effect. All reduce spending at higher P." },
  { id: 5, type: "standard", front: "Why does SRAS slope upward? What shifts it?", back: "Upward slope: input prices (wages, energy, raw materials) are fixed in the short run due to contracts and wage stickiness. When output prices rise, profit margins widen → firms produce more. Higher output price → more production.\n\nSRAS shifts — RIGHTWARD (favorable): input costs fall (cheaper oil, lower wages), productivity growth reduces cost per unit.\nSRAS shifts — LEFTWARD (adverse): input costs rise (oil shock, wage increases, supply chain disruption), negative supply shocks (pandemic, severe crop freeze, war).\n\nKey: SRAS is about COSTS and SHOCKS — things that change what it costs firms to produce.", hint: "Sticky input prices → profit margin widens when output price rises. Shifts: input costs, shocks." },
  { id: 6, type: "standard", front: "How does LRAS differ from SRAS? What shifts LRAS?", back: "LRAS is VERTICAL at potential (full-employment) GDP.\n\nWhy vertical: In the long run, input and output prices fully adjust — the short-run profit margin advantage disappears. Long-run output is determined entirely by real factors: quantity/quality of labor, physical capital, technology, institutions. Price level is irrelevant.\n\nSRAS vs. LRAS comparison:\nShape: SRAS upward sloping · LRAS vertical\nInput prices: SRAS fixed (sticky) · LRAS fully flexible\nShifters: SRAS moves with costs/shocks · LRAS moves with productivity, capital, institutions\n\nLRAS shifts right: productivity growth, more capital, better institutions, education investment.", hint: "LRAS = vertical at potential GDP. Real factors only. Price level irrelevant in long run." },
  { id: 7, type: "standard", front: "Define the three output gaps and give a real-world example of each.", back: "Output gap = actual GDP minus potential GDP (LRAS).\n\n1. Recessionary Gap: AD/SRAS intersect LEFT of LRAS. Actual < Potential. Unemployment above natural rate. Downward price pressure. Policy: stimulus (↓ rates or ↑ G) to shift AD right. Ex: 2008–09 Great Recession, COVID Q2 2020.\n\n2. Full Employment: AD/SRAS intersect AT LRAS. Actual = Potential. Unemployment at natural rate. Price stable. Policy: maintain stability. Ex: U.S. late 1990s, 2019 pre-COVID.\n\n3. Inflationary Gap: AD/SRAS intersect RIGHT of LRAS. Actual > Potential temporarily. Unemployment below natural rate. Upward wage/price pressure. Policy: tighten (↑ rates or ↓ G) to shift AD left. Ex: 2021–22 post-COVID.", hint: "Recessionary: left of LRAS · Full: at LRAS · Inflationary: right of LRAS" },
  { id: 8, type: "standard", front: "Describe the three zones of the SRAS curve and what stimulus does in each.", back: "Where the economy sits on SRAS determines the effect of an AD shift:\n\n1. Keynesian Zone (far left — flat SRAS):\nHigh unemployment, massive idle capacity. AD shift right → large output gain, tiny price rise. Stimulus highly effective — creates real jobs. Ex: Great Depression recovery 1933–38.\n\n2. Intermediate Zone (middle — moderate slope):\nSome idle capacity but bottlenecks exist. AD shift right → both output AND prices rise. Tradeoffs emerge. Most recoveries pass through here. Ex: U.S. mid-2010s.\n\n3. Neoclassical Zone (near LRAS — steep):\nNear full capacity. Workers scarce, factories full. AD shift right → mainly price rise (inflation), little real output gain. Stimulus mostly inflationary. Ex: 2021–22 post-COVID ($5T+ stimulus into tight economy → 9.1% CPI).", hint: "Keynesian: flat, output gain. Intermediate: mixed. Neoclassical: steep, mainly inflation." },
  { id: 9, type: "standard", front: "Distinguish demand-pull inflation from cost-push inflation (stagflation). What are the causes, mechanisms, and policy implications?", back: "DEMAND-PULL INFLATION:\nCause: AD surges past potential GDP (into Neoclassical zone).\nMechanism: Too much money chasing too few goods → firms raise prices.\nResult: Prices AND output rise (short run).\nFix: Restrict demand — raise rates (monetary) or cut G/raise taxes (fiscal) → AD shifts left.\nEx: Late 1960s Vietnam War spending, post-COVID 2021.\n\nCOST-PUSH INFLATION (STAGFLATION):\nCause: SRAS shifts left — rising input costs (oil shock, war, supply chain).\nMechanism: Higher production costs squeeze margins → output falls AND prices rise simultaneously.\nResult: Prices UP + output DOWN — worst of both worlds.\nFix: No clean solution — fighting inflation deepens recession; fighting recession accelerates inflation.\nEx: 1973 OPEC — oil 4× in 6 months → unemployment 8.5%, CPI >12%.", hint: "Demand-pull: AD surge → fix demand. Cost-push: SRAS left → stagflation, no clean fix." },
  { id: 10, type: "standard", front: "What happened in the 1973 OPEC oil shock? What are the key numbers and the lesson?", back: "Event: OPEC oil embargo, October 1973 – March 1974. Oil prices quadrupled in 6 months.\n\nOutcome: SRAS shifted far left → STAGFLATION\n• Unemployment hit 8.5% by 1975\n• CPI inflation peaked above 12% in 1974\n• Prices rose AND output fell simultaneously\n\nPolicy dilemma: Fighting inflation (tightening) deepened recession. Fighting recession (easing) accelerated inflation. The Fed was caught in an impossible trade-off.\n\nResolution: Volcker (1979–87) chose aggressive tightening — federal funds rate peaked at 20% in 1981. Inflation broken but at the cost of two recessions (1980 and 1981–82) and unemployment peaking at 10.8%.\n\nLesson: Supply shocks are uniquely painful because the standard demand-management toolkit makes one problem worse when you fix the other.", hint: "Oil 4×. UR 8.5%. CPI >12%. Stagflation. Volcker broke it with 20% rates — two recessions." },
  { id: 11, type: "standard", front: "Explain the COVID-19 recession (2020) and post-COVID inflation (2021–22) using AD/AS.", back: "COVID-19 RECESSION (2020) — Recessionary Gap:\n• Shock: AD shifted left (fear, lockdowns, lost income) AND SRAS shifted left (business closures, supply chain breakdown) simultaneously.\n• Outcome: Massive recessionary gap. GDP fell ~9% (Q2 2020 SAAR). Unemployment hit 14.7% (April 2020) — highest since Great Depression.\n• Policy: CARES Act $2.2T (March 2020) — direct payments, enhanced UI, PPP loans → AD shifted right. Fastest recovery in post-war history.\n\nPOST-COVID INFLATION (2021–22) — Inflationary Gap:\n• Shock: Cumulative ~$5T+ fiscal stimulus PLUS supply chain disruptions AND Ukraine war energy shock.\n• Outcome: AD far right + SRAS shifting left → combined demand-pull AND cost-push. CPI hit 9.1% (June 2022) — highest since 1981. GDP exceeded potential.\n• Policy: Fed raised rates 0.25%→5.25% (March 2022 – July 2023) → AD shifted left. CPI returned to ~3% by end of 2023.", hint: "2020: AD+SRAS left → recession → CARES Act fixed fast. 2021–22: AD right + SRAS left → 9.1% CPI → Fed 5.25%." },
  { id: 12, type: "standard", front: "What are the three personal-finance takeaways from the AD/AS model?", back: "1. Read the macro environment:\n• Inflationary gap → Fed will raise rates → lock in fixed mortgage BEFORE hikes.\n• SRAS shock (stagflation) → brace for rising rates even as economy weakens; rates may rise even as GDP falls.\n• The AD/AS model tells you which type of problem is coming and which asset classes to prepare for.\n\n2. Career positioning across the cycle:\n• Recessionary gap → layoffs and hiring freezes coming → build emergency savings now, update skills/certifications, diversify income before gap widens. Don't job-hop into recession.\n• Inflationary gap (tight labor) → workers have leverage → negotiate raises and career moves.\n\n3. Invest for the gap you see:\n• Recessionary gap: quality bonds, defensive stocks, cash optionality.\n• Inflationary gap: TIPS, real estate, broad equities, short-duration debt.\n• Stagflation (supply shock): real assets and commodities; both bonds AND equities struggle.\n\n'The macro dashboard is not academic — it is a positioning guide.'", hint: "Read the environment · Career positioning · Invest for the gap. Dashboard is a positioning guide." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH11_CARDS]);
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch11 AD/AS</p>
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
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch11 deck. The quiz is now unlocked.</p>
          </div>
          <button type="button" onClick={() => onComplete(masteredCount, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz pool — 15 questions, fresh scenarios, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "A government economist says: 'The AD/AS model is just about inflation — it doesn't tell us anything about jobs.' Your slides would disagree. Which statement correctly describes what AD/AS actually explains?", options: ["AD/AS simultaneously explains price levels, real GDP, employment/unemployment, and the effects of policy — four outputs from one framework", "The model only explains price levels and inflation — output and employment are covered by separate models", "AD/AS is a one-trick model: it predicts recessions but not recoveries", "AD/AS applies only to closed economies — trade makes it inapplicable to the U.S."], correct: 0, exp: "From your slides: AD/AS answers four questions simultaneously: (1) Price levels & inflation, (2) Real GDP & growth, (3) Employment & unemployment, (4) Effects of policy shocks. No other macro framework handles all four at once. That's precisely why it's called the economy's master dashboard." },
  { q: "A classical economist argues: 'Recessions are self-correcting — just wait and the market will fix itself.' A Keynesian economist responds: 'Demand can stay deficient for years — active policy is needed.' Which positions align with Say's Law and Keynes' Law respectively?", options: ["Classical = Keynes' Law; Keynesian = Say's Law", "Both economists are describing Say's Law — they just disagree about how fast it works", "Both describe Keynes' Law — Say's Law was disproven in the Great Depression", "Classical = Say's Law (supply creates its own demand; markets self-correct); Keynesian = Keynes' Law (demand drives production; economy can get stuck)"], correct: 3, exp: "Say's Law: 'Supply creates its own demand' — production generates income, income generates spending, markets clear naturally → the classical economist's position. Keynes' Law: 'Demand creates its own supply' — spending drives production, but demand can be deficient (savings exceeds investment in recessions), and sticky wages prevent fast self-correction → the Keynesian economist's position. Modern consensus: both matter; the time horizon determines which dominates." },
  { q: "A rising price level reduces the real purchasing power of a retiree's bond portfolio. She cuts back on restaurant dining and travel. Which of the three effects explaining AD's downward slope is this?", options: ["Foreign Price Effect — her bonds are now worth less relative to foreign assets", "Wealth Effect — a higher price level erodes the real value of her nominal financial assets, making her feel poorer and reducing consumption", "Interest Rate Effect — rising prices raise interest rates, making her bonds more valuable and increasing her spending", "Income Effect — her fixed bond income declines in real terms, directly reducing her purchasing power"], correct: 1, exp: "Wealth Effect: a higher overall price level reduces the real purchasing power of savings and financial assets (bonds, savings accounts). The retiree holds the same number of dollars in bonds, but those dollars buy less. She feels poorer in real terms → cuts consumption. This is distinct from the Interest Rate Effect (which works through borrowing costs for new spending) and the Foreign Price Effect (which works through net exports)." },
  { q: "A new AI productivity wave allows firms to produce 20% more output at the same cost. In the AD/AS diagram, what happens?", options: ["SRAS shifts right — lower cost per unit of output means firms supply more at every price level; LRAS also shifts right as potential GDP rises", "AD shifts right — consumer confidence rises as households anticipate income gains from AI", "LRAS shifts left — AI displaces workers, reducing the economy's long-run productive capacity", "SRAS shifts left — AI raises firms' upfront technology costs, reducing supply at every price level"], correct: 0, exp: "Productivity growth shifts SRAS right (lower production cost per unit → more profitable to produce at every price level) AND shifts LRAS right (the economy's long-run productive capacity increases). This is the best kind of supply shift: more output AND lower prices simultaneously. Your slides list 'productivity growth / new technology reduces cost per unit of output' as a rightward SRAS shifter and 'productivity' as a rightward LRAS shifter." },
  { q: "A diagram shows: LRAS is a vertical line at $22T real GDP. AD and SRAS intersect at $19T real GDP and a price level of 105. What is the output gap and the correct policy response?", options: ["$3T inflationary gap — tighten monetary or fiscal policy to reduce AD", "No gap — $19T is the correct equilibrium and no policy is needed", "$3T recessionary gap — stimulus (lower rates or increase government spending) to shift AD right toward $22T", "$3T structural gap — retraining programs are needed, not demand-side policy"], correct: 2, exp: "Recessionary gap: actual GDP ($19T) is $3T below potential GDP ($22T) — AD/SRAS equilibrium is to the LEFT of LRAS. Unemployment is above the natural rate. Policy: shift AD right — lower interest rates (monetary) or increase G/cut taxes (fiscal). Self-correction would also work but slowly: wages eventually fall → SRAS shifts right → output returns to $22T. Active policy accelerates this." },
  { q: "The federal government announces a 10% cut in defense spending. Walk through the AD/AS impact.", options: ["SRAS shifts left — defense contractors face higher input costs and reduce production", "LRAS shifts right — reduced government borrowing lowers interest rates and crowds in private investment", "AD shifts right — lower government borrowing reduces interest rates, stimulating I and C", "AD shifts left — G (government purchases) is a direct component of AD; cutting G reduces total spending at every price level"], correct: 3, exp: "G (government purchases of goods and services) is a direct component of AD = C + I + G + (X−M). Cutting defense spending reduces G directly → AD shifts left at every price level. This is distinct from transfer payments (which affect C indirectly through disposable income, not G directly). The result: lower real GDP and lower price level, moving from the original equilibrium to a new equilibrium to the left." },
  { q: "A diagram shows AD and SRAS intersecting to the RIGHT of LRAS. Wages are beginning to rise rapidly. Which self-correction mechanism is at work, and what is the eventual outcome WITHOUT policy intervention?", options: ["Rising wages are a SRAS leftward shifter — as wages rise, production costs increase, SRAS shifts left, output falls back toward LRAS, and prices rise further before eventually stabilizing at potential", "Wages rising shift AD right, pushing the economy further above potential permanently", "Rising wages shift LRAS right — the economy's potential GDP increases, eliminating the gap over time", "Self-correction doesn't exist — the inflationary gap requires policy intervention or it persists indefinitely"], correct: 0, exp: "Inflationary gap self-correction: with AD/SRAS right of LRAS, labor is tight → workers gain bargaining power → wages rise → SRAS shifts left → output falls back toward potential → price level rises further before stabilizing. The economy self-corrects, but at a higher price level than the original. This is why your slides say inflationary gaps have upward price pressure — the self-correction mechanism itself generates inflation before equilibrium is restored." },
  { q: "A global pandemic shuts down supply chains while the government simultaneously sends $2,000 stimulus checks to every household. In the AD/AS diagram, what happens to both curves and what is the likely outcome?", options: ["AD shifts right; SRAS shifts right. Output rises and prices fall as supply and demand both expand.", "AD shifts right (stimulus checks boost C); SRAS shifts left (supply chain shutdown raises costs and reduces production). The combined shock produces a large recessionary gap with simultaneous upward price pressure.", "AD shifts left (fear reduces spending); SRAS is unaffected. Pure recessionary gap.", "Both AD and SRAS shift left by equal amounts, leaving the price level unchanged but GDP falling sharply."], correct: 1, exp: "This describes the COVID-19 shock exactly. Stimulus checks → AD shifts right (more consumer spending). Supply chain shutdown → SRAS shifts left (higher costs, production disruptions). The simultaneous shifts produced: massive GDP drop (recessionary gap from SRAS leftward shift dominating) AND upward price pressure (both shocks push prices up). Your slides: 'Both AD and SRAS simultaneously shifted left [from COVID shock], producing a catastrophic drop in output while pushing prices lower — then massive stimulus shifted AD right into the recovery, eventually creating both demand-pull and cost-push inflation.'" },
  { q: "A student describes stagflation as 'when inflation is really bad.' Your slides give a precise definition. What is stagflation and which curve shift causes it?", options: ["Stagflation = inflation above 5% for more than two consecutive quarters, caused by AD shifting too far right", "Stagflation = deflation occurring during a recession, caused by AD shifting left and SRAS shifting right", "Stagflation = any period when both the unemployment rate and the inflation rate exceed 5% simultaneously, regardless of cause", "Stagflation = prices rising AND output falling simultaneously, caused by SRAS shifting left (cost-push shock)"], correct: 3, exp: "Stagflation from your slides: SRAS shifts left (cost-push shock — rising oil, supply chain disruption, war). Result: prices UP and output DOWN simultaneously — the worst-of-both-worlds combination. It's not about the level of inflation alone; it's the simultaneous rise in prices and fall in output/employment. 1973 OPEC: oil 4× → SRAS far left → unemployment 8.5% AND CPI >12%. The key marker: it takes a leftward SRAS shift to get both outcomes at once." },
  { q: "In the Keynesian zone of the SRAS curve, an economy has 20% unemployment and massive idle factory capacity. The government launches a large infrastructure spending program (G rises). What does the three-zone framework predict?", options: ["The AD shift produces large real output and employment gains with little price pressure, because the flat SRAS in the Keynesian zone means firms can expand production without bidding up costs", "Mainly inflation — any AD shift produces mostly price increases, regardless of where the economy is on SRAS", "The spending is wasted — government spending never shifts AD in the Keynesian zone", "SRAS shifts left in response — more government spending always crowds out private supply"], correct: 0, exp: "Keynesian zone (far left, flat SRAS): enormous idle capacity means firms can easily hire unemployed workers at stable wages and restart idle factories. When G increases and AD shifts right, the flat SRAS means equilibrium moves mostly rightward (more output) with minimal upward price movement. Stimulus is 'highly effective — creates real jobs, not inflation' in this zone. Great Depression recovery 1933–38 is the canonical case: very high multiplier, very low inflation response." },
  { q: "An economy is in a recessionary gap. A Keynesian economist recommends a large fiscal stimulus package. A neoclassical economist recommends waiting for the self-correction mechanism. Both agree on the long-run outcome. What do they disagree about?", options: ["They disagree about whether the economy has a potential GDP level — neoclassicals deny LRAS exists", "They disagree about whether a recessionary gap is possible at all — neoclassicals say markets prevent gaps from forming", "They agree on the mechanism but disagree on the time horizon: the neoclassical says self-correction (wages fall → SRAS shifts right) is fast enough; the Keynesian says it takes too long and the human cost of waiting is unacceptable", "They disagree about the direction of the LRAS shift during recessions"], correct: 2, exp: "Both agree: in the long run the economy returns to potential GDP. The disagreement is about speed and cost. Neoclassical: self-correction through wage flexibility is reasonably fast — active policy may cause more harm (inflation, debt) than the brief recession. Keynesian: sticky wages, contracts, and debt deflation mean self-correction can take years during which millions suffer unemployment. 'In the long run we are all dead' (Keynes). This is the core policy debate embedded in the AD/AS model." },
  { q: "A homebuyer is deciding between a 30-year fixed-rate mortgage at 3.5% and an adjustable-rate mortgage starting at 2.8%. She consults the AD/AS model: Real GDP is above potential, CPI is at 6% and rising, and the Fed has signaled tightening. What should she choose and why?", options: ["Adjustable-rate — rates are currently low and the Fed rarely follows through on tightening signals", "Fixed-rate — the inflationary gap signals the Fed will raise rates significantly; locking in 3.5% protects her from the rate increases coming as the Fed shifts AD left to close the gap", "Wait — inflationary gaps always resolve through SRAS self-correction, leaving rates unchanged", "Either — the Fed's rate changes only affect short-term rates, not 30-year mortgage rates"], correct: 1, exp: "Macro dashboard application: inflationary gap + rising CPI + Fed tightening signal → the Fed will raise the federal funds rate to shift AD left. This typically pushes long-term mortgage rates up too (as happened in 2022–23 when rates went 0.25%→5.25% and 30-year mortgage rates roughly doubled from ~3% to ~7%). Locking in 3.5% fixed before the hikes protects the buyer from that rate surge. This is exactly your slides' prescription: 'When AD is overheating, lock in fixed mortgage rates BEFORE the Fed hikes.'" },
  { q: "Which combination of AD and SRAS movements best describes the U.S. economy from 2020 to 2022?", options: ["2020: AD shifts right (stimulus) · SRAS unchanged. 2021–22: Both shift right (supply chains recover).", "2020: Only SRAS shifts left. 2021–22: Only AD shifts right. The two shocks never overlapped.", "2020: LRAS shifts left permanently. 2021–22: LRAS recovers as supply chains normalize.", "2020: AD and SRAS both shift LEFT (lockdowns + supply chain collapse) → recessionary gap. 2021–22: AD shifts far RIGHT (massive stimulus) while SRAS also shifts LEFT (supply disruptions + Ukraine war) → combined demand-pull and cost-push inflation."], correct: 3, exp: "Your slides trace both periods precisely: 2020 — fear, lockdowns, and supply chain breakdown → AD and SRAS both shift left simultaneously → massive recessionary gap (GDP −9% Q2 2020, unemployment 14.7%). CARES Act $2.2T → AD shifts right → fastest post-war recovery. 2021–22 — cumulative ~$5T+ stimulus → AD far right (into Neoclassical zone) + SRAS shifting left (supply disruptions, Ukraine war energy shock) → combined demand-pull AND cost-push → CPI 9.1% June 2022." },
  { q: "It is 1933. U.S. unemployment is ~25%. FRED shows Real GDP far below Potential GDP. FDR proposes large public works spending. A critic says: 'Deficit spending will just cause inflation.' Using the three-zone framework, evaluate this criticism.", options: ["The critic is correct — any AD shift causes inflation regardless of where the economy is on SRAS", "The criticism is misplaced — with 25% unemployment and massive idle capacity, the economy is deep in the Keynesian zone (flat SRAS). AD shifts right produce large real output/employment gains with minimal inflation. The flat SRAS means price pressure is very low when there is this much unused capacity.", "The criticism is valid only if the public works create long-term debt that shifts LRAS left", "The criticism is partially correct — half of the spending will cause inflation, half will create jobs"], correct: 1, exp: "Three-zone analysis: 25% unemployment places the economy deep in the Keynesian zone — far left of SRAS where the curve is nearly flat. With enormous idle capacity, firms expand production without bidding up wages or prices. AD shift right → large employment and output gain, tiny price pressure. The 'inflation' criticism is the Neoclassical-zone argument applied incorrectly to a Keynesian-zone situation. Your slides: 'Deep recession sits here. Stimulus is highly effective — creates real jobs, not inflation. The multiplier is very high.'" },
  { q: "An economist studying the 1973–74 stagflation period notes that policymakers faced an impossible dilemma. What was it, and what eventually resolved it?", options: ["The dilemma: fighting inflation (raising rates/tightening) deepened the recession; fighting recession (cutting rates/easing) accelerated inflation. Resolution: Volcker chose sustained aggressive tightening (20% fed funds rate), broke inflation through two recessions (1980, 1981–82), with unemployment peaking at 10.8%.", "The dilemma: the Fed could not lower rates without Congress's approval. Resolution: Congress passed emergency authorization in 1975.", "The dilemma: the U.S. had to choose between fighting stagflation domestically or maintaining the Bretton Woods exchange rate system. Resolution: Nixon abandoned the gold standard in 1971.", "The dilemma: supply-side tax cuts caused inflation while reducing output. Resolution: Reagan's 1981 tax cuts shifted LRAS right and resolved the gap."], correct: 0, exp: "The stagflation dilemma: SRAS shifted left → both inflation AND recession. Standard demand tools work in opposite directions: (a) Tighten to fight inflation → AD shifts left → output falls further, deepening recession. (b) Ease to fight recession → AD shifts right → inflation accelerates. There is no demand-side fix that solves both simultaneously. Resolution: Volcker chose to break inflation first — sustained aggressive tightening (fed funds rate peak ~20%, 1981) at the cost of two back-to-back recessions and 10.8% unemployment. Once inflation was broken, the self-correction could proceed." },
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
        <p className="font-semibold text-foreground">Chapter 11 Quiz</p>
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

const STATION_LABELS_CH11: Record<string, string> = {
  whymodel:      "Why This Model?",
  threecurves:   "The Three Curves",
  adshifts:      "What Shifts AD?",
  outputgaps:    "Output Gaps",
  zonesinfla:    "Zones & Inflation Types",
  personalfinance:"Personal Finance & Dashboard",
  flash:         "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH11).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch11 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 11 — Aggregate Demand &amp; Aggregate Supply</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 11 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 11 — Aggregate Demand &amp; Aggregate Supply</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: An economy has rising prices and falling output simultaneously. Using AD/AS, identify the shock, name the gap, and explain why demand stimulus would make things worse.</label>
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
  { id: "whymodel"       as Station, label: "Why This Model?",           desc: "Four questions, Say's Law vs. Keynes' Law, which governs when", icon: "🎛️" },
  { id: "threecurves"    as Station, label: "The Three Curves",           desc: "AD (downward), SRAS (upward), LRAS (vertical) — shapes and shifters", icon: "📈" },
  { id: "adshifts"       as Station, label: "What Shifts AD?",            desc: "Interest rates, confidence, fiscal policy, exchange rates, and net exports", icon: "↔️" },
  { id: "outputgaps"     as Station, label: "Output Gaps",                desc: "Recessionary, full employment, inflationary — diagnosis and policy response", icon: "📊" },
  { id: "zonesinfla"     as Station, label: "Zones & Inflation Types",    desc: "Three SRAS zones, demand-pull vs. cost-push, 1973 OPEC stagflation, COVID cases", icon: "🌡️" },
  { id: "personalfinance"as Station, label: "Personal Finance & Dashboard",desc: "Read the macro environment, career positioning, invest for the gap you see", icon: "💼" },
  { id: "flash"          as Station, label: "Flashcard Review",           desc: "Master all 12 key Ch11 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",          label: "Dashboard" },
  { id: "whymodel",       label: "Why This Model?" },
  { id: "threecurves",    label: "Three Curves" },
  { id: "adshifts",       label: "AD Shifts" },
  { id: "outputgaps",     label: "Output Gaps" },
  { id: "zonesinfla",     label: "Zones & Inflation" },
  { id: "personalfinance",label: "Personal Finance" },
  { id: "flash",          label: "Flashcards" },
  { id: "quiz",           label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","whymodel","threecurves","adshifts","outputgaps","zonesinfla","personalfinance","flash","quiz","results","not-yet"];

const CH11_SUMMARY = [
  { heading: "11.1 Macroeconomic Perspectives on Demand and Supply", body: "The AD/AS model provides a single framework that simultaneously explains price levels and inflation, real GDP and growth, employment and unemployment, and the effects of policy shocks. The model embeds two foundational views: Say's Law ('supply creates its own demand' — the neoclassical/long-run view that markets self-correct) and Keynes' Law ('demand creates its own supply' — the short-run view that sticky prices mean demand shocks cause real recessions). Modern macroeconomics holds that both matter: the time horizon determines which law governs. In the short run, demand dominates; in the long run, real supply factors set the output ceiling." },
  { heading: "11.2 Building a Model of Aggregate Demand and Aggregate Supply", body: "Aggregate Demand (AD = C + I + G + X − M) slopes downward because a higher price level reduces real spending through three effects: the wealth effect (real value of savings erodes), the interest rate effect (higher prices raise borrowing costs, reducing C and I), and the foreign price effect (U.S. goods become expensive abroad, reducing net exports). AD shifts when spending decisions change — consumer or business confidence, tax policy, government purchases, interest rates, or exchange rates.\n\nShort-Run Aggregate Supply (SRAS) slopes upward because input prices (wages, energy) are sticky in the short run. Higher output prices widen profit margins, inducing more production. SRAS shifts with changes in production costs (oil shocks, wage changes, productivity growth) and supply shocks.\n\nLong-Run Aggregate Supply (LRAS) is vertical at potential GDP. In the long run, input and output prices fully adjust, eliminating any short-run profit advantage. Long-run output is determined by real factors: quantity and quality of labor, physical capital, technology, and institutions. The price level cannot permanently raise real output above potential." },
  { heading: "11.3 Shifts in Aggregate Supply", body: "The equilibrium point where AD meets SRAS determines the current price level and real GDP. Comparing that equilibrium to LRAS identifies the output gap. A recessionary gap (AD/SRAS to the left of LRAS) means actual GDP is below potential and unemployment is above the natural rate — the appropriate policy is stimulus to shift AD right. An inflationary gap (AD/SRAS to the right of LRAS) means actual GDP temporarily exceeds potential with unemployment below the natural rate — appropriate policy is tightening to shift AD left. Full employment occurs when all three curves intersect at the same point.\n\nThe three zones of the SRAS curve determine stimulus effectiveness: in the Keynesian zone (deep recession, flat SRAS), AD shifts produce large output gains with minimal inflation; in the Neoclassical zone (near potential, steep SRAS), AD shifts produce mainly inflation with little real output gain." },
  { heading: "11.4 How the AD/AS Model Incorporates Growth, Unemployment, and Inflation", body: "Demand-pull inflation occurs when AD surges past potential GDP (into the Neoclassical zone) — too much money chasing too few goods. Prices and output both rise short-run. Policy: restrict demand.\n\nCost-push inflation (stagflation) occurs when SRAS shifts left from a supply shock (oil embargo, war, supply chain disruption). Prices rise AND output falls simultaneously — the worst-of-both-worlds. Policy dilemma: fighting inflation deepens the recession; fighting recession accelerates inflation. The 1973 OPEC embargo is the canonical case: oil 4× → unemployment 8.5% and CPI >12%. Resolution required sustained tightening (Volcker, 1979–82) at the cost of two recessions.\n\nThe COVID episodes illustrate both: 2020 saw AD and SRAS both shift left (recessionary gap); 2021–22 saw massive AD stimulus into a recovering economy with ongoing SRAS leftward pressure (supply chains, Ukraine war), producing combined demand-pull and cost-push inflation peaking at 9.1% CPI in June 2022." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 11 Summary — Aggregate Demand &amp; Aggregate Supply</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH11_SUMMARY.map((s,i) => (
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
        <p className="font-semibold mb-1">Chapter 11 — Aggregate Demand &amp; Aggregate Supply</p>
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
      </div>
    </header>
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
        {station==="whymodel"       && <WhyModelStation      onComplete={(sc,t)=>markDone("whymodel",      sc,t)} />}
        {station==="threecurves"    && <ThreeCurvesStation   onComplete={(sc,t)=>markDone("threecurves",   sc,t)} />}
        {station==="adshifts"       && <AdShiftsStation      onComplete={(sc,t)=>markDone("adshifts",      sc,t)} />}
        {station==="outputgaps"     && <OutputGapsStation    onComplete={(sc,t)=>markDone("outputgaps",    sc,t)} />}
        {station==="zonesinfla"     && <ZonesInflaStation    onComplete={(sc,t)=>markDone("zonesinfla",    sc,t)} />}
        {station==="personalfinance"&& <PersonalFinanceStation onComplete={(sc,t)=>markDone("personalfinance",sc,t)} />}
        {station==="flash"          && <FlashcardStation     onComplete={(sc,t)=>markDone("flash",         sc,t)} />}
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
