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
// Station 1 — Two Lenses
// ─────────────────────────────────────────────
const TWOLENSES_QS = [
  {
    q: "Your slides present a comparison table between Keynesian and Neoclassical economics across six dimensions. Which row of that table is CORRECTLY stated?",
    options: [
      "Keynesian: key driver is Aggregate Demand · Neoclassical: key driver is Aggregate Supply (potential GDP)",
      "Keynesian: long run focus · Neoclassical: short run focus",
      "Keynesian: flexible wages & prices · Neoclassical: sticky wages & prices",
      "Keynesian: rational expectations · Neoclassical: adaptive expectations",
    ],
    correct: 0,
    exp: "From the comparison table: Keynesian key driver = Aggregate Demand (short run, sticky prices, demand deficiency causes unemployment, countercyclical policy). Neoclassical key driver = Aggregate Supply / potential GDP (long run, flexible wages, natural rate, rules + supply-side reform). The other rows are reversed — Keynesian has sticky wages and adaptive expectations; Neoclassical has flexible wages and rational expectations.",
  },
  {
    q: "Your slides quote Robert Solow (Nobel 1987): 'At short time scales, something sort of Keynesian is a good approximation. At very long time scales, neoclassical. At the 5–10 year scale, we have to piece things together.' What is Solow's core point about these two schools?",
    options: [
      "Keynesian economics is correct and Neoclassical economics is wrong — Solow is endorsing Keynes",
      "The two schools are fundamentally incompatible — no synthesis is possible",
      "Neither school is universally correct — the appropriate framework depends on the time horizon, and modern policy borrows from both",
      "Neoclassical economics is better because it covers longer time periods",
    ],
    correct: 2,
    exp: "Solow's synthesis: the two schools are complements, not competitors — each captures something real at a different time scale. Short run → demand matters (Keynesian). Long run → supply/real factors dominate (Neoclassical). The 5–10 year middle range is genuinely ambiguous — both insights apply. Your slides: 'Good policy borrows from both — Keynesian tools for demand crises, Neoclassical tools for long-run growth.' The Fed's dual mandate (employment + price stability) literally embeds both schools into law.",
  },
  {
    q: "The Keynesian school says 'animal spirits' drive investment volatility. What does this mean and why does it matter for policy?",
    options: [
      "Businesses make investment decisions based purely on mathematical expected returns — 'animal spirits' is Keynes' term for this rational calculation",
      "Animal spirits refers to consumer spending patterns — not business investment",
      "Animal spirits is a Neoclassical concept explaining why wages adjust slowly",
      "Businesses invest based on confidence, optimism, and fear — not just cold math. When confidence collapses, investment collapses regardless of interest rates, creating sudden AD falls that policy must address",
    ],
    correct: 3,
    exp: "Keynes coined 'animal spirits' to describe the psychological element driving investment: businesses invest based on confidence about future profits, not just current interest rates. A sudden collapse in business confidence — even with low interest rates — can crash investment (I), pulling AD down sharply. This is why Keynesians say AD is inherently unstable. The 2008–09 case: even near-zero rates didn't revive investment until confidence returned. This is also why simple Neoclassical 'lower rates and investment will follow' sometimes fails in severe downturns.",
  },
];

function TwoLensesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = TWOLENSES_QS[idx];
  const isLast = idx === TWOLENSES_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Two Lenses — Same Goal, Different Mechanisms</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Keynesian</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Focus: Short run</li>
              <li>• Driver: Aggregate Demand</li>
              <li>• Wages: Sticky — adjust slowly</li>
              <li>• Unemployment: Demand deficiency</li>
              <li>• Policy: Countercyclical (active)</li>
              <li>• Expectations: Adaptive</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-bold text-primary mb-1">Neoclassical</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Focus: Long run</li>
              <li>• Driver: Aggregate Supply / potential GDP</li>
              <li>• Wages: Flexible — markets self-correct</li>
              <li>• Unemployment: Natural rate</li>
              <li>• Policy: Rules + supply-side reform</li>
              <li>• Expectations: Rational</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Solow: "Both matter — the time horizon determines which law governs." The Fed's dual mandate embeds both schools into law.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={TWOLENSES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — AD Components & Volatility
// ─────────────────────────────────────────────
const ADVOLATILITY_QS = [
  {
    q: "Your slides identify Investment (I) as the most volatile component of AD. What makes investment uniquely unstable compared to consumption, government spending, or net exports?",
    options: [
      "Investment is volatile because it depends entirely on government tax policy, which changes every year",
      "Investment is volatile because businesses make long-horizon capital decisions based on expected future profits and confidence — which can swing dramatically when 'animal spirits' shift",
      "Investment is the smallest component of AD, so small changes create large percentage swings",
      "Investment is volatile because it includes inventory changes, which fluctuate with the seasons",
    ],
    correct: 1,
    exp: "From your slides: Investment = business capital spending (equipment, software, structures, inventories). It is driven by expected profit, interest rates, energy prices, and tax policy — but most importantly by 'animal spirits': business confidence about the future. A factory that seemed profitable last year may seem unwise today if executives fear a recession. This forward-looking, confidence-driven nature makes investment collapse rapidly in downturns (2008–09: business investment fell ~20%) and recover slowly. Consumption is more stable because households smooth spending; G is set by policy; NX depends on slower-moving exchange rates.",
  },
  {
    q: "Your slides explain the 'coordination failure' that prevents automatic wage adjustment in recessions. Workers would accept a wage cut IF everyone else did too — but no mechanism coordinates this. What is the result?",
    options: [
      "Each firm that cuts wages alone harms morale and loses its best workers — so no firm cuts wages, wages stay high, and unemployment persists rather than clearing through wage adjustment",
      "Wages fall quickly in recessions because workers recognize the coordination problem and voluntarily accept cuts",
      "The government coordinates wage cuts through minimum wage legislation during recessions",
      "Coordination failure only applies to prices, not wages — wages always adjust freely",
    ],
    correct: 0,
    exp: "Your slides' coordination failure: workers would accept cuts IF everyone did simultaneously (preserving relative wages). But no market mechanism achieves this coordination. A firm that cuts wages alone loses its best workers first (adverse selection) and destroys morale. So every firm waits — wages stay sticky, demand falls, firms lay off workers instead of cutting wages. Result: unemployment persists. This is the core reason Keynes said government must step in — it can do what markets cannot: coordinate aggregate demand restoration without relying on wage deflation.",
  },
  {
    q: "The Keynesian zone of the SRAS curve is flat (far left of SRAS), indicating massive idle capacity. In this zone, when the government launches a stimulus program, what does your slides' framework predict?",
    options: [
      "Mainly inflation — any rightward AD shift produces price increases regardless of idle capacity",
      "No effect — stimulus is always offset by rational agents who anticipate it and save rather than spend",
      "A permanent shift of LRAS right — stimulus creates productive capacity, not just output",
      "Large real output and employment gains with minimal inflation — firms hire idle workers at stable wages; the flat SRAS means price pressure is very low",
    ],
    correct: 3,
    exp: "Keynesian zone (flat SRAS, far left): with 25% unemployment (1933) or 10% (2009), firms can hire idle workers at stable wages and restart idle factories. When AD shifts right, equilibrium moves mostly rightward — more output, more employment — with minimal upward price pressure because the SRAS is nearly flat. Your slides: 'AD shift right → large output gain, tiny price rise. Stimulus highly effective here — multiplier is large.' Great Depression 1933–38 and 2009 ARRA are the canonical cases. This is why the same stimulus would be inflationary in 2021–22 (Neoclassical zone) but growth-creating in 2009 (Keynesian zone).",
  },
];

function AdVolatilityStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ADVOLATILITY_QS[idx];
  const isLast = idx === ADVOLATILITY_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">AD Components & Keynesian Volatility</p>
        <div className="grid grid-cols-4 gap-1.5 text-xs text-center mb-2">
          {[["C","Consumption\n~70% of GDP\nMost stable"],["I","Investment\nMost volatile\nAnimal spirits"],["G","Government\nAutomatic stabilizer\nExcludes transfers"],["NX","Net Exports\nX minus M\nCan be negative"]].map(([label,desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-base">{label}</p>
              <p className="text-muted-foreground leading-snug whitespace-pre-line text-xs">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
          <p className="font-semibold text-amber-800">Key Keynesian Insights:</p>
          <p className="text-amber-900">• AD is volatile — investment collapses when confidence falls ("animal spirits")</p>
          <p className="text-amber-900">• Coordination failure prevents automatic wage adjustment → unemployment persists</p>
          <p className="text-amber-900">• In Keynesian zone (flat SRAS): stimulus creates real jobs, not inflation</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ADVOLATILITY_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
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
// Station 4 — The Phillips Curve
// ─────────────────────────────────────────────
const PHILLIPSCURVE_QS = [
  {
    q: "The Short-Run Phillips Curve (SRPC) shows a downward-sloping relationship between inflation and unemployment. What is the economic mechanism behind this tradeoff?",
    options: [
      "When unemployment rises, workers have more bargaining power and demand higher wages, causing inflation",
      "The SRPC slopes downward because lower unemployment reduces government spending on unemployment benefits, which lowers the deficit and reduces inflation",
      "The tradeoff exists only in recessions — in expansions, lower unemployment and lower inflation occur simultaneously",
      "When the government boosts AD to reduce unemployment, the economy moves up and left along the SRPC — lower unemployment but higher inflation as the tighter labor market bids up wages and prices",
    ],
    correct: 3,
    exp: "SRPC mechanism: boosting AD (stimulus, rate cuts) reduces unemployment — but the tighter labor market bids up wages, which feed into prices — so inflation rises. Moving along the SRPC: lower unemployment ↔ higher inflation. Your slides: 'The 1960s consensus — policy could exploit this tradeoff. It held remarkably well through the late 1960s.' The Vietnam War spending boosted AD, unemployment fell, inflation rose — exactly on the curve. The policy implication: policymakers face a menu, not a goal.",
  },
  {
    q: "In 1973, OPEC quadrupled oil prices. By 1975, U.S. unemployment hit 8.5% AND inflation exceeded 12% simultaneously. Your slides say this 'broke simple Keynesian theory.' Why was stagflation a problem for the Phillips Curve model?",
    options: [
      "The Phillips Curve predicted stagflation would occur — Keynesian economists were not surprised by 1973",
      "Stagflation proved that the Phillips Curve was always wrong — the tradeoff never existed even in the 1960s",
      "Simple Keynesian theory said inflation and unemployment move in opposite directions — you can't have both high simultaneously. A supply shock shifted the SRPC outward, breaking the stable tradeoff the 1960s policymakers relied on",
      "Stagflation occurred because the Fed raised rates too aggressively in 1973, creating both inflation and recession simultaneously",
    ],
    correct: 2,
    exp: "Simple Keynesian Phillips Curve: high inflation = low unemployment, low inflation = high unemployment. You can't have both high. But the 1973 OPEC shock shifted SRAS left — a supply shock rather than demand change. The SRPC shifted outward: both inflation AND unemployment rose. Your slides: 'Each supply shock moved the economy off the curve.' Stagflation had no good treatment: fight inflation (tighten → deeper recession) or fight recession (ease → more inflation). Friedman and Phelps had predicted this in 1968 — once expectations adapt, the stable tradeoff disappears.",
  },
  {
    q: "The Long-Run Phillips Curve (LRPC) is vertical at the Natural Rate of Unemployment (NRU). Friedman and Phelps predicted this in 1968 — before stagflation proved them right. What does the vertical LRPC mean for policy?",
    options: [
      "In the long run, policymakers can permanently reduce unemployment below the natural rate by accepting slightly higher inflation",
      "In the long run, the inflation-unemployment tradeoff disappears — trying to permanently hold unemployment below the natural rate only generates ever-rising inflation, not lasting employment gains",
      "The vertical LRPC means monetary policy is ineffective — only fiscal policy can affect unemployment",
      "The LRPC is vertical because inflation and unemployment are unrelated in all time periods",
    ],
    correct: 1,
    exp: "Friedman/Phelps insight: workers and firms eventually adapt their expectations. If the government keeps unemployment below the natural rate through stimulus, wages get bid up, firms realize real wages haven't fallen, SRPC shifts up, inflation rises with no lasting output gain. You can buy lower unemployment with inflation — once. Then expectations adjust and the bargain disappears. The LRPC is vertical at the NRU. 'No free lunch from permanently running above the natural rate.' This is why the Fed targets 2% inflation rather than trying to push unemployment below its natural rate indefinitely.",
  },
  {
    q: "Your FRED chart shows UNRATE and CPIAUCSL from 1950–2025. The chart reveals five distinct eras. Which description correctly matches what the data shows?",
    options: [
      "1960s: tight inverse relationship; 1970s: both rise (stagflation — SRPC shifted outward); 1980s Volcker: both fall together; post-2008: flat Phillips Curve; 2021–22: sharp move as inflation expectations shifted",
      "The Phillips Curve relationship has been perfectly stable throughout all five decades — inflation and unemployment always move in exactly opposite directions",
      "The data shows no relationship between inflation and unemployment at any point — the Phillips Curve is a theoretical fiction not visible in real data",
      "The 1970s show the SRPC moving down the curve (lower unemployment, higher inflation) while the 1980s show it moving up (higher unemployment, lower inflation)",
    ],
    correct: 0,
    exp: "From your slides' FRED chart analysis: (1) 1960s: tight inverse — boosting AD lowered unemployment and raised inflation, just as SRPC predicts. (2) 1970s: both rose — supply shocks shifted SRPC outward (stagflation). (3) 1980s Volcker: tight monetary policy raised unemployment AND broke inflation simultaneously — both fell. (4) Post-2008: very flat Phillips Curve — near-zero unemployment barely moved inflation (puzzled economists). (5) 2021–22: sharp move as COVID reopening + stimulus shifted expectations rapidly. The data confirms both the SRPC (short-run tradeoff) and the LRPC (no permanent tradeoff).",
  },
];

function PhillipsCurveStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = PHILLIPSCURVE_QS[idx];
  const isLast = idx === PHILLIPSCURVE_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">The Phillips Curve — Three Versions</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["SRPC","Short-run. Downward sloping. Lower unemployment ↔ higher inflation. 1960s: held well. Policymakers thought they could exploit it."],
            ["Supply Shocks","SRPC shifts outward. Both inflation AND unemployment rise simultaneously. 1973 OPEC — stagflation broke simple Keynesian theory."],
            ["LRPC","Long-run. Vertical at Natural Rate. Expectations adapt. No permanent tradeoff. Friedman/Phelps predicted this in 1968. FRED: UNRATE + CPIAUCSL"],
          ].map(([label, desc]) => (
            <div key={label} className="bg-background border border-border rounded-lg p-2">
              <p className="font-bold text-primary text-xs mb-1">{label}</p>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"You can buy lower unemployment with inflation — once. Then expectations adjust and the bargain disappears."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PHILLIPSCURVE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
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
// Station 6 — Personal Finance
// ─────────────────────────────────────────────
const PERSONALFINANCE_QS = [
  {
    q: "Your slides say: 'In a recession, expect Keynesian intervention — rate cuts, fiscal stimulus, asset support. Position for cheap borrowing and bargain assets.' It's March 2009. Unemployment is rising toward 10%, AD has collapsed, Congress just passed ARRA. What does the Keynesian playbook suggest for a person with $50,000 in savings?",
    options: [
      "Move everything to cash — recessions always deepen before they recover, and cash is safest",
      "Consider locking in cheap borrowing (mortgage rates fell sharply), look at quality bonds (rate cuts make existing bonds valuable), and position in equities early since AD restoration will eventually drive recovery — recessions overshoot on the downside",
      "Buy gold — recessions always cause hyperinflation, and gold is the only real store of value",
      "Invest in commodities — Keynesian stimulus always causes commodity price spikes",
    ],
    correct: 1,
    exp: "Your slides' recession playbook: rate cuts make existing bonds valuable (prices rise when rates fall). Fiscal stimulus will eventually restore AD → equity recovery follows. Mortgage rates near historic lows → lock in if buying a home. Markets typically overshoot to the downside — bargain assets appear. The 2009 case: S&P 500 bottomed in March 2009 and tripled over the next decade. Those who recognized the Keynesian intervention signal and stayed invested (or bought) captured that recovery. 'The 2008–09 and 2020 playbooks were textbook Keynesian — those who recognized it benefited.'",
  },
  {
    q: "Your slides describe the Neoclassical personal lesson: 'Build your own potential GDP through K, H, T, I.' Applied personally, what does investing in Human Capital (H) mean, and why is it the most powerful of the four?",
    options: [
      "Human capital means investing in healthcare — staying healthy is the foundation of economic productivity",
      "Human capital means investing in relationships and social networks — 'who you know' drives earnings more than skills",
      "Human capital means investing in education, skills, and tech literacy — skills are permanently embedded in you, compound over a career, and raise your personal productive capacity permanently, unlike physical assets that depreciate",
      "Human capital means working long hours — effort and persistence are the primary drivers of personal income growth",
    ],
    correct: 2,
    exp: "From your slides: Human capital = education and skills. 'Each additional year of schooling raises earnings ~10%.' Skills are permanently embedded — unlike physical capital, they don't depreciate (and with practice they appreciate). College attainment 2.5% (1900) → 33% (2019): massive LRAS boost nationally. Personally: a skill or certification acquired today compounds for decades. The GI Bill sent 2M veterans to college → one of the largest LRAS boosts in U.S. history. Tech literacy (staying current with productive tools and AI) is the modern equivalent. Vocational training and on-the-job learning also count.",
  },
  {
    q: "Your slides' third personal finance takeaway: 'Don't fight the Fed or the fiscal cycle.' In 2022–23, the Fed raised rates from 0.25% to 5.25% and Congress shifted from massive stimulus to deficit reduction. What does this signal and how should you position?",
    options: [
      "Contractionary policy: expect tighter credit, falling bond prices (long-duration bonds lose value when rates rise), equity headwinds from higher discount rates — shift toward defensive positions, short-duration debt, and cash optionality",
      "Expansionary policy is coming — buy long-duration bonds and growth stocks aggressively",
      "The policy is neutral — the Fed's actions have no predictable effect on asset markets",
      "Invest in real estate — rising rates always boost property values",
    ],
    correct: 0,
    exp: "Your slides: 'When monetary and fiscal policy align contractionary (2022–23), be defensive.' Fed raising rates 0.25%→5.25%: (1) Long-duration bonds lose value rapidly (prices fall when rates rise); (2) Equities face higher discount rates → lower valuations; (3) Credit tightens → consumer and business spending slows. Position: short-duration bonds (adjust faster to new rates), cash optionality, defensive equities (staples, utilities). Track the federal funds rate, fiscal deficit trajectory, and output gap to anticipate the regime change. 'The Keynesian-Neoclassical debate is academic — the real-time policy stance is your investment compass.'",
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
        <p className="font-semibold text-foreground mb-1">Personal Finance — Read the Moment</p>
        <p className="text-xs text-muted-foreground italic mb-2">"You don't have to pick a school — but you do have to read the moment."</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            ["Read the Policy Moment","Keynesian recession: rate cuts + stimulus → cheap borrowing, bond rally, eventual equity recovery. Contractionary: defensive, short-duration, cash."],
            ["Build Your Own K,H,T,I","Savings (K), Education/skills (H), Tech literacy (T), Network/habits/systems (I). Compound these for permanent personal output growth."],
            ["Don't Fight the Fed","Track fed funds rate + fiscal deficit + output gap. Align with policy direction. 2022–23: contractionary → be defensive. Both tools aligned matter most."],
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
  { heading: "12.1 The Keynesian Perspective", body: "The Keynesian model focuses on the short run, where aggregate demand is the key driver of output and employment. Three core insights distinguish Keynesian economics: (1) Wages and prices are sticky downward — when demand falls, firms lay off workers rather than cut wages, because menu costs, long-term contracts, and morale effects prevent rapid price adjustment. (2) Coordination failure prevents automatic wage adjustment — workers would accept wage cuts if everyone did simultaneously, but no market mechanism coordinates this, so unemployment persists. (3) In the Keynesian zone (far left of SRAS, flat curve), AD shifts right produce large output gains with minimal inflation because massive idle capacity allows firms to hire unemployed workers at stable wages.\n\nThe expenditure multiplier quantifies how initial spending generates successive rounds of income: Multiplier = 1/(1−MPC). With MPC=0.8, a $1,000 injection creates $5,000 in GDP. The multiplier works in reverse — the 1929 investment collapse amplified into the Great Depression through successive rounds of spending reduction. The multiplier is smaller for tax cuts than direct spending because households save some fraction before the multiplier process begins." },
  { heading: "12.2 The Keynesian Perspective on the AD/AS Model", body: "Keynesians argue that aggregate demand is inherently unstable because investment (I) — the most volatile component — depends on business confidence ('animal spirits') rather than just interest rates. When confidence collapses, investment falls sharply regardless of interest rate levels. This is why Keynesians advocate countercyclical fiscal and monetary policy: stimulus in recessions (shift AD right), tightening in inflationary gaps (shift AD left).\n\nThe Short-Run Phillips Curve (SRPC) provides the empirical foundation: a downward-sloping tradeoff between inflation and unemployment. Boosting AD reduces unemployment but bids up wages and prices. The 1960s consensus held that policymakers could exploit this tradeoff. The curve held remarkably well through the late 1960s — until supply shocks in the 1970s shifted it outward, producing stagflation (both high inflation and high unemployment) that simple Keynesian theory could not explain." },
  { heading: "13.1 The Neoclassical Perspective", body: "The Neoclassical model focuses on the long run, where aggregate supply (potential GDP) is the key driver of real output. Four pillars: (1) Vertical LRAS at potential GDP — the price level cannot permanently alter real output above potential. (2) Flexible wages and prices — recessions trigger labor surpluses, wages fall, SRAS shifts right, economy returns to potential automatically. (3) Rational expectations — people anticipate policy effects and adjust immediately, offsetting anticipated stimulus before it arrives. (4) Crowding out — government borrowing raises interest rates, displacing private investment and reducing the net stimulus effect.\n\nPotential GDP grows through four levers: K (physical capital), H (human capital), T (technology — the biggest lever), and I (institutions). These are the only ways an economy can grow richer in the long run.\n\nThe Long-Run Phillips Curve (LRPC) is vertical at the Natural Rate of Unemployment — Friedman and Phelps predicted this in 1968, before stagflation proved them right. Once inflation expectations adapt, the short-run tradeoff disappears. The Fed's 2% inflation target exemplifies the Neoclassical rules-over-discretion preference: credible rules anchor expectations and prevent wage-price spirals." },
  { heading: "13.2 The Policy Debate and Synthesis", body: "Both schools agree the economy eventually returns to potential GDP. The debate is about how long that takes and what to do in the meantime. Keynesians: adjustment is dangerously slow (2–10 years), hysteresis creates permanent damage, government must act. Neoclassicals: intervention creates new problems (inflation, crowding out, moral hazard), self-correction is faster than Keynesians claim.\n\nEmpirical verdict (IMF research): recovery typically takes 2–5 years; deeper financial crises take longer; the fiscal multiplier is larger in recessions than in booms — both views capture something real.\n\nModern synthesis (Solow): 'At short time scales, Keynesian. At very long time scales, neoclassical. At 5–10 years, piece things together.' Good policy borrows from both — Keynesian tools for demand crises, Neoclassical tools for long-run growth. The Fed's dual mandate (maximum employment + price stability) literally embeds both schools into law. The 2008–09 response — Keynesian fiscal stimulus + Neoclassical bank reform — is the synthesis in action." },
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
