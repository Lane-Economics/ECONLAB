import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "shiftsort"
  | "outputgap"
  | "zoneclassify"
  | "inflationtypes"
  | "realcases"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch11_v2";

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
      {!checked && sel !== null && <button onClick={onCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Check Answer</button>}
      {checked && !isLast && <button onClick={onNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Question →</button>}
      {checked && isLast && <button onClick={() => onComplete(score, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 1 — Curve Shift Sorter
// ─────────────────────────────────────────────
const SHIFT_EVENTS = [
  { id: 1, event: "The Federal Reserve raises the federal funds rate from 1% to 5%.", answer: "ad-left", label: "AD shifts LEFT — higher rates raise borrowing costs → C and I fall → total spending decreases at every price level." },
  { id: 2, event: "OPEC cuts oil production, causing oil prices to double in six months.", answer: "sras-left", label: "SRAS shifts LEFT — higher input costs squeeze profit margins → firms produce less at every price level (cost-push shock)." },
  { id: 3, event: "Congress passes a $1.5 trillion infrastructure spending bill.", answer: "ad-right", label: "AD shifts RIGHT — G (government purchases) increases directly → total spending rises at every price level." },
  { id: 4, event: "A major AI productivity wave allows firms to produce 20% more output at the same cost.", answer: "sras-right-lras-right", label: "SRAS shifts RIGHT (lower cost per unit) AND LRAS shifts RIGHT (potential GDP rises permanently) — technology is the biggest lever for long-run growth." },
  { id: 5, event: "Consumer confidence collapses after a stock market crash — households slash spending on big-ticket items.", answer: "ad-left", label: "AD shifts LEFT — lower consumer confidence reduces C (consumption) at every price level. This is 'animal spirits' working in reverse." },
  { id: 6, event: "The U.S. dollar weakens 15% against major trading partners' currencies.", answer: "ad-right", label: "AD shifts RIGHT — weaker dollar makes U.S. exports cheaper abroad (X rises) and imports more expensive (M falls) → net exports (X−M) increase." },
  { id: 7, event: "A nationwide drought destroys 40% of the wheat crop, raising food production costs for food manufacturers.", answer: "sras-left", label: "SRAS shifts LEFT — supply shock raises input costs for producers across the food sector → higher prices and lower output simultaneously." },
  { id: 8, event: "The government expands access to community college, dramatically increasing workforce skill levels over a decade.", answer: "lras-right", label: "LRAS shifts RIGHT — human capital (H) increases the economy's long-run productive capacity. This is a real factor shift, not a demand or short-run cost change." },
];

const SHIFT_OPTIONS = [
  { id: "ad-right",         label: "AD → right",               color: "bg-green-100 border-green-400 text-green-800" },
  { id: "ad-left",          label: "AD → left",                color: "bg-red-100 border-red-400 text-red-800" },
  { id: "sras-right",       label: "SRAS → right",             color: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "sras-left",        label: "SRAS → left",              color: "bg-amber-100 border-amber-400 text-amber-800" },
  { id: "lras-right",       label: "LRAS → right",             color: "bg-purple-100 border-purple-400 text-purple-800" },
  { id: "sras-right-lras-right", label: "SRAS + LRAS → right", color: "bg-teal-100 border-teal-400 text-teal-800" },
];

function ShiftSortStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const total = SHIFT_EVENTS.length;
  const correct = checked ? SHIFT_EVENTS.filter(e => answers[e.id] === e.answer).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — Curve Shift Sorter</p>
        <p className="text-muted-foreground text-xs mb-2">For each event, select which AD/AS curve shifts and in which direction. Distinguish: Does this change SPENDING decisions (AD)? Production COSTS/shocks (SRAS)? Real productive CAPACITY (LRAS)?</p>
        <div className="flex flex-wrap gap-1 text-xs">
          {SHIFT_OPTIONS.map(o => <span key={o.id} className={`px-2 py-0.5 rounded-full border font-medium ${o.color}`}>{o.label}</span>)}
        </div>
      </div>
      <div className="space-y-3">
        {SHIFT_EVENTS.map(e => {
          const ans = answers[e.id];
          const isCorrect = checked && ans === e.answer;
          const isWrong = checked && ans && ans !== e.answer;
          const correctOpt = SHIFT_OPTIONS.find(o => o.id === e.answer);
          return (
            <div key={e.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{e.event}</p>
              <select disabled={checked} value={ans || ""}
                onChange={ev => setAnswers(a => ({ ...a, [e.id]: ev.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary">
                <option value="">— select the curve shift —</option>
                {SHIFT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ ${e.label}` : `✗ ${e.label}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check All Shifts
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "All 8 curve shifts correctly identified!" : "Review the explanations above — the key is which curve the event affects."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Output Gap Diagram Reader
// ─────────────────────────────────────────────
const GAP_DIAGRAMS = [
  {
    id: 1,
    description: "DIAGRAM A: AD and SRAS intersect at point E. Real GDP at E = $18 trillion. LRAS is a vertical line at $22 trillion (potential GDP). The price level at E is 105.",
    gap: "recessionary",
    gapLabel: "Recessionary Gap",
    policy: "stimulus",
    policyLabel: "Stimulus — shift AD right (cut rates or increase G) to close the $4T gap toward potential GDP.",
    selfCorrect: "Wages fall over time → SRAS shifts right → equilibrium moves to potential GDP. But this is slow and painful.",
  },
  {
    id: 2,
    description: "DIAGRAM B: AD and SRAS intersect exactly where LRAS is vertical — all three curves meet at the same point E. Real GDP = Potential GDP = $20 trillion. Price level is stable.",
    gap: "full",
    gapLabel: "Full Employment",
    policy: "maintain",
    policyLabel: "Maintain stability — no stimulus or tightening needed. Avoid destabilizing shifts.",
    selfCorrect: "No self-correction needed — the economy is already at potential GDP.",
  },
  {
    id: 3,
    description: "DIAGRAM C: AD and SRAS intersect at point E, which lies to the RIGHT of LRAS. Real GDP at E = $24 trillion. Potential GDP (LRAS) = $22 trillion. The price level is rising and wages are being bid up.",
    gap: "inflationary",
    gapLabel: "Inflationary Gap",
    policy: "tighten",
    policyLabel: "Tighten — shift AD left (raise rates or cut G) to reduce output back toward potential and prevent accelerating inflation.",
    selfCorrect: "Rising wages shift SRAS left → output falls back toward potential → prices rise further before stabilizing.",
  },
  {
    id: 4,
    description: "DIAGRAM D: AD shifts LEFT from its original position. The new equilibrium E′ is to the left of LRAS. Real GDP falls below potential. Unemployment rises above the natural rate. Price level falls slightly.",
    gap: "recessionary",
    gapLabel: "Recessionary Gap (demand-side shock)",
    policy: "stimulus",
    policyLabel: "Stimulus — the leftward AD shift created a recessionary gap. Restore AD with rate cuts or fiscal expansion.",
    selfCorrect: "Wages fall slowly → SRAS shifts right → self-correction eventually closes the gap, but may take years.",
  },
  {
    id: 5,
    description: "DIAGRAM E: SRAS shifts LEFT from a supply shock. The new equilibrium E′ shows HIGHER prices AND LOWER real GDP simultaneously. LRAS has not moved — potential GDP is unchanged.",
    gap: "stagflation",
    gapLabel: "Stagflation (cost-push shock — not a standard gap)",
    policy: "dilemma",
    policyLabel: "Policy dilemma — tightening fights inflation but deepens recession; easing fights recession but accelerates inflation. No demand tool cleanly fixes a supply shock.",
    selfCorrect: "Wages may eventually fall → SRAS shifts back right. But this is very slow and painful without resolving the supply shock itself.",
  },
];

const GAP_OPTIONS = [
  { id: "recessionary", label: "Recessionary Gap", color: "bg-red-100 border-red-400 text-red-800" },
  { id: "full", label: "Full Employment", color: "bg-green-100 border-green-400 text-green-800" },
  { id: "inflationary", label: "Inflationary Gap", color: "bg-amber-100 border-amber-400 text-amber-800" },
  { id: "stagflation", label: "Stagflation (supply shock)", color: "bg-purple-100 border-purple-400 text-purple-800" },
];

const POLICY_OPTIONS = [
  { id: "stimulus", label: "Stimulus — shift AD right" },
  { id: "tighten", label: "Tighten — shift AD left" },
  { id: "maintain", label: "Maintain stability — no change" },
  { id: "dilemma", label: "Policy dilemma — no clean solution" },
];

function OutputGapStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [diagIdx, setDiagIdx] = useState(0);
  const [gapSel, setGapSel] = useState<string>("");
  const [policySel, setPolicySel] = useState<string>("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const diag = GAP_DIAGRAMS[diagIdx];
  const isLast = diagIdx === GAP_DIAGRAMS.length - 1;
  const gapCorrect = gapSel === diag.gap;
  const policyCorrect = policySel === diag.policy;
  const bothCorrect = gapCorrect && policyCorrect;

  function handleCheck() {
    const pts = (gapCorrect ? 1 : 0) + (policyCorrect ? 1 : 0);
    setScore(s => s + pts);
    setChecked(true);
  }

  function handleNext() {
    setGapSel(""); setPolicySel(""); setChecked(false);
    if (isLast) setDone(true);
    else setDiagIdx(i => i + 1);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-2xl mb-2">📊</p>
          <p className="font-semibold text-green-800">All {GAP_DIAGRAMS.length} diagrams read!</p>
          <p className="text-green-700 text-sm mt-1">Score: {score}/{GAP_DIAGRAMS.length * 2} (gap + policy for each diagram)</p>
        </div>
        <button onClick={() => onComplete(score, GAP_DIAGRAMS.length * 2)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — Output Gap Diagram Reader</p>
        <p className="text-muted-foreground text-xs">Read the described AD/AS diagram. Identify the gap type and the correct policy response. Diagram {diagIdx + 1} of {GAP_DIAGRAMS.length}.</p>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
        {/* Described diagram */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Graph Description</p>
          <p className="text-sm text-foreground font-medium leading-relaxed">{diag.description}</p>
        </div>

        {/* Part 1: Gap type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 1 — What type of output gap does this diagram show?</p>
          <div className="grid grid-cols-2 gap-2">
            {GAP_OPTIONS.map(o => (
              <button key={o.id} disabled={checked}
                onClick={() => setGapSel(o.id)}
                className={`py-2 px-3 rounded-lg border-2 text-xs font-semibold text-left transition ${
                  checked
                    ? o.id === diag.gap ? "border-green-500 bg-green-50 text-green-800"
                      : o.id === gapSel && gapSel !== diag.gap ? "border-red-400 bg-red-50 text-red-800"
                      : `${o.color} opacity-40`
                    : gapSel === o.id ? "border-primary bg-primary/10 text-primary" : `${o.color} hover:opacity-100`
                }`}>
                {o.label}
              </button>
            ))}
          </div>
          {checked && <p className={`text-xs mt-1.5 font-semibold ${gapCorrect ? "text-green-700" : "text-red-700"}`}>{gapCorrect ? `✓ ${diag.gapLabel}` : `✗ Answer: ${diag.gapLabel}`}</p>}
        </div>

        {/* Part 2: Policy */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">STEP 2 — What is the appropriate policy response?</p>
          <div className="space-y-1.5">
            {POLICY_OPTIONS.map(o => (
              <button key={o.id} disabled={checked}
                onClick={() => setPolicySel(o.id)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-medium text-left transition ${
                  checked
                    ? o.id === diag.policy ? "border-green-500 bg-green-50 text-green-800"
                      : o.id === policySel && policySel !== diag.policy ? "border-red-400 bg-red-50 text-red-800"
                      : "border-border text-muted-foreground opacity-50"
                    : policySel === o.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary"
                }`}>
                {o.label}
              </button>
            ))}
          </div>
          {checked && (
            <div className={`mt-2 rounded-lg p-2.5 text-xs ${bothCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
              <p className="font-semibold mb-0.5">{policyCorrect ? "✓" : "✗"} {diag.policyLabel}</p>
              <p className="text-muted-foreground italic">Self-correction: {diag.selfCorrect}</p>
            </div>
          )}
        </div>

        {!checked ? (
          <button disabled={!gapSel || !policySel} onClick={handleCheck}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
            Check Diagram
          </button>
        ) : (
          <button onClick={handleNext}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${isLast ? "bg-green-600 text-white hover:bg-green-700" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
            {isLast ? "Finish Diagrams ✓" : "Next Diagram →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — SRAS Zone Classifier
// ─────────────────────────────────────────────
const ZONE_SCENARIOS = [
  { id: 1, scenario: "It is 1933. U.S. unemployment is 25%. Factories stand idle. Prices are falling. Real GDP is far below potential.", zone: "keynesian", stimEffect: "large output gain, tiny price rise", example: "Great Depression — New Deal spending created real jobs with very little inflation." },
  { id: 2, scenario: "It is 2021. The economy has recovered from COVID. Unemployment is near 4%. Supply chains are strained. Congress passes a $1.9T stimulus package.", zone: "neoclassical", stimEffect: "mainly price increases (inflation), little real output gain", example: "Post-COVID 2021-22 — $5T+ stimulus into a near-capacity economy produced 9.1% CPI, not proportional output." },
  { id: 3, scenario: "It is 2014. The economy has partially recovered from the Great Recession. Unemployment is 6.2% — above normal but falling. Some industries are at capacity, others still have slack.", zone: "intermediate", stimEffect: "both output AND prices rise — real gains but some inflation cost", example: "U.S. mid-2010s recovery — growth resumed but inflation ticked up modestly as recovery continued." },
  { id: 4, scenario: "It is April 2020. Unemployment just hit 14.7% — the highest since the Great Depression. Businesses are shut. AD has collapsed. GDP fell 9% in Q2.", zone: "keynesian", stimEffect: "large output gain, tiny price rise — massive idle capacity means firms can expand without bidding up wages", example: "COVID recession — CARES Act $2.2T produced real recovery with minimal initial inflation." },
  { id: 5, scenario: "It is 2019. Unemployment is 3.5% — below the natural rate. Labor markets are extremely tight. Employers report difficulty finding workers. GDP equals or slightly exceeds potential.", zone: "neoclassical", stimEffect: "mainly inflation, little real output gain — economy is near or past the speed limit", example: "2019 pre-COVID boom — Fed was raising rates precisely because stimulus would have been inflationary." },
  { id: 6, scenario: "It is 2016. Unemployment has fallen from 10% to 4.7%. Some sectors are back to full capacity; manufacturing still has room to grow. Inflation is rising slowly toward the 2% target.", zone: "intermediate", stimEffect: "both output AND prices rise — the economy is transitioning from Keynesian to Neoclassical territory", example: "Late Obama recovery — mixed zone where stimulus produced both growth and gradually rising prices." },
];

const ZONE_OPTIONS = [
  { id: "keynesian", label: "Keynesian Zone", subtitle: "Flat SRAS — massive idle capacity", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "intermediate", label: "Intermediate Zone", subtitle: "Moderate slope — some slack", color: "bg-amber-100 border-amber-400 text-amber-800" },
  { id: "neoclassical", label: "Neoclassical Zone", subtitle: "Steep SRAS — near potential", color: "bg-red-100 border-red-400 text-red-800" },
];

function ZoneClassifyStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const total = ZONE_SCENARIOS.length;
  const correct = checked ? ZONE_SCENARIOS.filter(s => answers[s.id] === s.zone).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — SRAS Zone Classifier</p>
        <p className="text-muted-foreground text-xs mb-2">Identify which zone of the SRAS curve the economy is in. The zone determines whether stimulus mostly creates jobs or mostly creates inflation.</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {ZONE_OPTIONS.map(o => (
            <div key={o.id} className={`px-2 py-1.5 rounded-lg border-2 text-center ${o.color}`}>
              <p className="font-bold">{o.label}</p>
              <p className="text-xs opacity-80">{o.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {ZONE_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.zone;
          const isWrong = checked && ans && ans !== s.zone;
          const correctOpt = ZONE_OPTIONS.find(o => o.id === s.zone)!;
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{s.scenario}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {ZONE_OPTIONS.map(o => (
                  <button key={o.id} disabled={checked}
                    onClick={() => setAnswers(a => ({ ...a, [s.id]: o.id }))}
                    className={`py-1.5 px-2 rounded-lg border-2 text-xs font-semibold transition ${
                      ans === o.id
                        ? checked ? isCorrect ? "border-green-500 bg-green-200" : "border-red-400 bg-red-200" : "border-primary bg-primary/20"
                        : `${o.color} opacity-60 hover:opacity-100`
                    }`}>{o.label}</button>
                ))}
              </div>
              {checked && (
                <div className={`mt-2 text-xs ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  <p className="font-semibold">{isCorrect ? "✓" : "✗"} {correctOpt.label} — Stimulus effect: {s.stimEffect}</p>
                  <p className="text-muted-foreground italic mt-0.5">{s.example}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Zone Identifications
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "All zones correctly identified!" : "Review the explanations — the zone determines what stimulus actually does."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Demand-Pull vs Cost-Push Classifier
// ─────────────────────────────────────────────
const INFLATION_SCENARIOS = [
  { id: 1, scenario: "Late 1960s: Vietnam War spending surged government purchases. The economy was near full employment. CPI rose from 1.6% to 5.5% between 1965–69.", type: "demand-pull", typeLabel: "Demand-Pull Inflation", mechanism: "AD surged past potential GDP (Neoclassical zone). Too much money chasing too few goods. Policy fix: restrict demand (tighten)." },
  { id: 2, scenario: "1973: OPEC embargo cuts oil supply. Oil prices quadruple in six months. Simultaneously, unemployment rises to 8.5% AND CPI exceeds 12%.", type: "cost-push", typeLabel: "Cost-Push Inflation (Stagflation)", mechanism: "SRAS shifts left — supply shock. Prices rise AND output falls. No clean demand-side fix: fighting inflation deepens recession; fighting recession accelerates inflation." },
  { id: 3, scenario: "2021: $5T in cumulative fiscal stimulus hits an economy already recovering from COVID. Supply chains remain disrupted. CPI hits 9.1% in June 2022 while GDP exceeds potential.", type: "both", typeLabel: "Combined Demand-Pull + Cost-Push", mechanism: "AD surged far right (demand-pull) while SRAS shifted left simultaneously (supply disruptions, Ukraine war energy shock) — worst of both worlds in the same period." },
  { id: 4, scenario: "2009: Congress passes an $800B stimulus package (ARRA). Unemployment is 10%. GDP is $2 trillion below potential. Factories are idle. CPI barely moves after the stimulus.", type: "no-inflation", typeLabel: "No Inflation (Keynesian Zone stimulus)", mechanism: "AD shifts right in the Keynesian zone (flat SRAS). Massive idle capacity → output gain with minimal price pressure. Stimulus creates real jobs, not inflation, when this far below potential." },
];

const INFLATION_OPTIONS = [
  { id: "demand-pull", label: "Demand-Pull", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "cost-push", label: "Cost-Push (Stagflation)", color: "bg-red-100 border-red-400 text-red-800" },
  { id: "both", label: "Both simultaneously", color: "bg-purple-100 border-purple-400 text-purple-800" },
  { id: "no-inflation", label: "No inflation (Keynesian zone)", color: "bg-green-100 border-green-400 text-green-800" },
];

function InflationTypesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const total = INFLATION_SCENARIOS.length;
  const correct = checked ? INFLATION_SCENARIOS.filter(s => answers[s.id] === s.type).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 4 — Inflation Types Classifier</p>
        <p className="text-muted-foreground text-xs mb-2">Classify each historical episode. Key question: Did PRICES AND OUTPUT both rise (demand-pull)? Did PRICES rise while OUTPUT fell (cost-push)? Was there no inflation despite stimulus (Keynesian zone)?</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {INFLATION_OPTIONS.map(o => <span key={o.id} className={`px-2 py-1 rounded-full border text-center font-medium ${o.color}`}>{o.label}</span>)}
        </div>
      </div>
      <div className="space-y-3">
        {INFLATION_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.type;
          const isWrong = checked && ans && ans !== s.type;
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{s.scenario}</p>
              <select disabled={checked} value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [s.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary">
                <option value="">— classify this episode —</option>
                {INFLATION_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {checked && (
                <div className={`mt-2 text-xs ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  <p className="font-semibold">{isCorrect ? "✓" : "✗"} {s.typeLabel}</p>
                  <p className="text-muted-foreground mt-0.5">{s.mechanism}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Classifications
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "All inflation episodes correctly classified!" : "Review — the key is whether the shock came from demand (AD) or supply (SRAS)."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Real-World Cases (Stepped MC with diagram-based questions)
// ─────────────────────────────────────────────
const CASES_QS = [
  {
    q: "COVID-19 Recession (March–April 2020): AD shifted left (fear, lockdowns) AND SRAS shifted left (business closures, supply chain breakdown). GDP fell 9% in Q2; unemployment hit 14.7%. In the AD/AS diagram, what happened to the price level and why was this deflationary despite a supply shock?",
    options: [
      "Price level rose sharply — both leftward shifts always cause prices to jump",
      "Price level fell or was flat — when AD collapses simultaneously with SRAS, the demand shock dominates, causing deflationary pressure even as supply is disrupted",
      "Price level was unchanged — the two leftward shifts canceled each other perfectly",
      "Price level rose modestly — only the SRAS shift matters for prices; AD shifts only affect output",
    ],
    correct: 1,
    exp: "When AD and SRAS both shift left simultaneously: the AD collapse (demand destruction from lockdowns) dominated the price effect. With demand gone, sellers couldn't raise prices — they were lucky to sell anything. Your slides: 'Both AD and SRAS simultaneously shifted left, producing a catastrophic drop in output and employment while temporarily pushing prices lower (deflationary pressure).' The deflationary force of demand destruction exceeded the inflationary force of the supply shock.",
  },
  {
    q: "Post-COVID Inflation (2021–22): The FRED chart shows Real GDP exceeding Potential GDP. Cumulative fiscal stimulus exceeded $5T. Supply chains remained disrupted. Ukraine war spiked energy prices. CPI hit 9.1% in June 2022. Using the AD/AS diagram, which combination of shifts explains this?",
    options: [
      "AD shifted far right (stimulus) while SRAS shifted left (supply disruptions + energy shock) — the worst of both worlds: demand-pull AND cost-push inflation simultaneously",
      "Only AD shifted right — the supply disruptions were too small to matter for prices",
      "Only SRAS shifted left — the fiscal stimulus had no effect because it crowded out private spending",
      "LRAS shifted right (productivity boom) while AD shifted right — output and prices both rose from the supply side",
    ],
    correct: 0,
    exp: "Your slides trace this precisely: AD shifted far right from ~$5T in cumulative fiscal + monetary stimulus. Simultaneously, SRAS shifted left from supply chain disruptions and Ukraine war energy spike. Both forces pushed prices up from opposite sides: demand-pull (too much spending) and cost-push (too little supply capacity) at the same time. 'The combined effect produced both demand-pull and cost-push inflation at the same time' — which is why 9.1% CPI was so difficult to fight: restricting AD helped but the supply side remained constrained.",
  },
  {
    q: "1973 OPEC Oil Shock: The SRAS shifted dramatically left. The policy dilemma: fighting inflation required tightening (which deepened recession) while fighting recession required easing (which accelerated inflation). In the AD/AS diagram, what does 'the Fed was caught in an impossible trade-off' mean geometrically?",
    options: [
      "Shifting AD left (tightening) to fight inflation moves equilibrium further below potential, deepening unemployment. Shifting AD right (easing) to fight recession raises prices further. There is no AD shift that solves both problems simultaneously — you need to fix the SRAS shift, not manage AD.",
      "The LRAS shifted left permanently, meaning potential GDP fell — no policy could restore previous output levels",
      "Tightening is always wrong during stagflation — the only solution is more fiscal stimulus",
      "The AD/AS model cannot explain stagflation — it only works for demand-side shocks",
    ],
    correct: 0,
    exp: "The geometry of the policy dilemma: SRAS shifted left → new equilibrium has higher prices AND lower output (stagflation). To fight inflation: shift AD left → equilibrium moves further left of LRAS (deeper recession, more unemployment). To fight recession: shift AD right → equilibrium moves further right, prices rise more (worse inflation). Every AD movement makes one problem better and the other worse. The root cause is the SRAS shift — the demand-management toolkit cannot fix a supply problem without an unacceptable trade-off. Resolution required the supply shock to dissipate AND sustained tightening (Volcker) to break expectations.",
  },
  {
    q: "The FRED chart of Real GDP (GDPC1) vs. Potential GDP (GDPPOT) shows that in recessions, real GDP dips below the GDPPOT line. In 2021-22, real GDP briefly exceeded the GDPPOT line. What do these two patterns represent in AD/AS terms?",
    options: [
      "Dips below GDPPOT = recessionary gaps (AD/SRAS left of LRAS); brief exceedance above GDPPOT = inflationary gap (AD/SRAS right of LRAS). These are the output gaps that define the diagnosis and appropriate policy in the AD/AS framework.",
      "Dips below GDPPOT mean the economy is shrinking permanently; GDPPOT must be revised down each recession",
      "GDPPOT represents the maximum possible GDP — exceeding it is mathematically impossible, so the 2021-22 reading is a data error",
      "The gap between lines represents unemployment only — it has no inflation implications",
    ],
    correct: 0,
    exp: "From your slides: 'Where AD meets SRAS sets current output and prices. Where AD meets LRAS would be full-employment output. The gap between them is the OUTPUT GAP.' FRED GDPC1 below GDPPOT = AD/SRAS equilibrium to the LEFT of LRAS = recessionary gap → stimulus appropriate. GDPC1 above GDPPOT = equilibrium to the RIGHT of LRAS = inflationary gap → tightening appropriate. The FRED chart is the real-world version of the AD/AS diagram's x-axis — GDPPOT IS LRAS translated into dollar terms. Reading this chart is reading the macro dashboard.",
  },
];

function RealCasesStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = CASES_QS[idx];
  const isLast = idx === CASES_QS.length - 1;
  function handleCheck() { if (sel === null) return; setScore(s => s + (sel === q.correct ? 1 : 0)); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — Real-World Cases</p>
        <p className="text-muted-foreground text-xs">Apply the AD/AS framework to actual historical episodes — COVID 2020, post-COVID 2021-22, 1973 OPEC, and the FRED data.</p>
        <p className="text-xs text-primary mt-1">Question {idx + 1} of {CASES_QS.length}</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={CASES_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Personal Finance Verdict Cards
// ─────────────────────────────────────────────
const PF_CARDS = [
  {
    id: 1,
    situation: "It's early 2022. Real GDP exceeds Potential GDP. CPI is running at 6% and rising. The Fed has signaled it will raise rates. You have a variable-rate mortgage.",
    question: "What does the AD/AS macro dashboard tell you to do?",
    verdict: "LOCK IN A FIXED RATE — IMMEDIATELY",
    verdictColor: "bg-red-100 border-red-400 text-red-800",
    explanation: "Inflationary gap + rising CPI + Fed tightening signal → the Fed WILL raise rates to shift AD left. Your variable rate will climb with the fed funds rate. A homebuyer who locked in 3% fixed in early 2021 paid ~3% throughout; variable-rate borrowers saw their rates jump to 7%+. The macro dashboard told you this was coming — inflationary gap = rates going up.",
  },
  {
    id: 2,
    situation: "It's late 2007. The FRED chart shows Real GDP beginning to fall below Potential GDP. Housing prices are collapsing. Unemployment is starting to rise from 4.5% toward 6%.",
    question: "What does the AD/AS recessionary gap signal for your career?",
    verdict: "RECESSION COMING — BUILD YOUR CUSHION NOW",
    verdictColor: "bg-amber-100 border-amber-400 text-amber-800",
    explanation: "Recessionary gap developing → hiring freezes and layoffs are coming as firms cut costs. Your slides: 'Recessionary gaps mean hiring freezes and layoffs — build emergency savings, update skills, get certifications, diversify income streams BEFORE the gap widens.' Those who shored up savings in 2007 navigated 2008-09 far better. Don't wait until you're unemployed to start preparing.",
  },
  {
    id: 3,
    situation: "It's 1974. SRAS has shifted left from the OPEC shock. Inflation is 12%. Unemployment is 8.5%. The economy is in stagflation. You have a long-term bond portfolio.",
    question: "What does stagflation mean for your investment positioning?",
    verdict: "BONDS AND EQUITIES BOTH STRUGGLE — REAL ASSETS",
    verdictColor: "bg-purple-100 border-purple-400 text-purple-800",
    explanation: "Stagflation from a supply shock: bonds lose real value to 12% inflation. Equities suffer from falling GDP and margins squeezed by rising input costs. Your slides: 'Supply shocks (stagflation) are hardest: both bonds AND equities struggle. Real assets and commodities historically hold value.' In 1973-74, the S&P 500 fell ~45%. Oil stocks, commodity producers, and real estate held value far better. TIPS (if they existed) would be the modern equivalent.",
  },
  {
    id: 4,
    situation: "It's 2009. Unemployment is 10%. Real GDP is far below Potential GDP. The economy is deep in the Keynesian zone. The Fed has cut rates to near zero. Congress just passed ARRA.",
    question: "What does a massive recessionary gap signal for your investment timing?",
    verdict: "MARKETS OVERSHOOT ON THE DOWNSIDE — EARLY POSITIONING",
    verdictColor: "bg-green-100 border-green-400 text-green-800",
    explanation: "Deep recessionary gap + Keynesian stimulus → AD will eventually be restored. Markets typically overshoot recessions: fear drives assets below fundamental value. The S&P 500 bottomed in March 2009 and tripled over the next decade. Those who recognized the Keynesian intervention signal and repositioned early captured that recovery. 'The 2008-09 and 2020 playbooks were textbook Keynesian — those who recognized it benefited.' Rate cuts make existing bonds valuable; equities recover when AD is restored.",
  },
];

function PersonalFinanceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const card = PF_CARDS[cardIdx];
  const isLast = cardIdx === PF_CARDS.length - 1;

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-2xl mb-2">📊</p>
          <p className="font-semibold text-green-800">All {PF_CARDS.length} macro dashboard cards complete!</p>
          <p className="text-sm text-green-700 mt-1">The AD/AS model is not academic — it is a positioning guide.</p>
        </div>
        <button onClick={() => onComplete(PF_CARDS.length, PF_CARDS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 6 — Personal Finance Verdict Cards</p>
        <p className="text-muted-foreground text-xs">Read the macro situation. Think about what the AD/AS dashboard signals for YOUR financial decisions. Then reveal the verdict.</p>
        <p className="text-xs text-primary mt-1">Card {cardIdx + 1} of {PF_CARDS.length}</p>
      </div>
      <div className="rounded-2xl border-2 border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">The Macro Situation</p>
            <p className="text-sm font-medium text-foreground leading-relaxed">{card.situation}</p>
          </div>
          <p className="text-sm font-semibold text-foreground">{card.question}</p>
          {!revealed ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground italic">Think about which gap/zone the economy is in and what the AD/AS model predicts will happen next...</p>
              <button onClick={() => setRevealed(true)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Reveal Macro Dashboard Verdict →</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`rounded-xl border-2 px-4 py-3 text-center font-bold text-sm ${card.verdictColor}`}>{card.verdict}</div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">{card.explanation}</div>
              {!isLast ? (
                <button onClick={() => { setCardIdx(i => i + 1); setRevealed(false); }} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Card →</button>
              ) : (
                <button onClick={() => setDone(true)} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">Finish Dashboard Cards ✓</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
const FLASHCARDS = [
  { front: "Aggregate Demand (AD)", back: "The total quantity of goods and services demanded in an economy at each price level. Components: C + I + G + (X − M). Slopes downward due to the wealth, interest rate, and foreign price effects." },
  { front: "Short-Run Aggregate Supply (SRAS)", back: "The total quantity of goods and services that producers supply at each price level when input prices (wages, energy) are fixed. Slopes upward because higher output prices raise profit margins." },
  { front: "Long-Run Aggregate Supply (LRAS)", back: "The economy's potential output — the vertical line at full-employment GDP. Set by real factors: labor, physical capital, human capital, and technology. Unaffected by price level changes." },
  { front: "Potential GDP", back: "The level of real GDP the economy produces when all resources are fully employed at the natural rate of unemployment. The position of the LRAS curve." },
  { front: "Recessionary Gap", back: "When actual GDP is below potential GDP — the AD/SRAS intersection is to the left of LRAS. Unemployment is above the natural rate. Policy response: expansionary stimulus to shift AD right." },
  { front: "Inflationary Gap", back: "When actual GDP is above potential GDP — the AD/SRAS intersection is to the right of LRAS. Unemployment is below the natural rate. Policy response: contractionary tightening to shift AD left." },
  { front: "Demand-Pull Inflation", back: "Inflation caused by AD surging beyond potential output. 'Too much money chasing too few goods.' Both prices and output rise in the short run. Example: post-COVID stimulus 2021–22." },
  { front: "Cost-Push Inflation (Stagflation)", back: "Inflation caused by SRAS shifting left due to a supply shock (oil, war, pandemic). Prices rise AND output falls simultaneously — stagflation. Example: 1973 OPEC oil embargo." },
  { front: "AD Shifters", back: "Factors that shift the entire AD curve: consumer/business confidence, tax policy, government spending, Federal Reserve interest rate decisions, and the exchange rate (affecting net exports)." },
  { front: "SRAS Shifters", back: "Factors that shift the SRAS curve: input costs (wages, energy), productivity, and supply shocks. Cost increases shift SRAS left; cost decreases or productivity gains shift it right." },
  { front: "LRAS Shifters", back: "Factors that permanently expand potential GDP: increases in labor supply, physical capital (K), human capital (H), and technology (A). These shift the LRAS curve rightward." },
  { front: "Say's Law vs. Keynes' Law", back: "Say's Law: 'Supply creates its own demand' — the long-run, neoclassical view. Keynes' Law: 'Demand creates its own supply' — the short-run view. The time horizon determines which dominates." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 11 Key Terms</p>
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
// Quiz pool — 15 fresh questions, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "A student says: 'If the AD/AS model just explains price levels and inflation, we don't need it for unemployment.' Why is this wrong?", options: ["The student is right — the model only explains inflation", "AD/AS explains unemployment but not inflation — the Phillips Curve handles inflation", "The model explains all four but only in the long run — the short run requires a separate model", "AD/AS simultaneously explains price levels, real GDP, employment/unemployment, AND policy effects — all four outputs from one framework. No other model handles all four at once."], correct: 3, exp: "The AD/AS model is the macro dashboard precisely because it answers four questions simultaneously: price levels and inflation, real GDP and growth, employment and unemployment, and the effects of policy shocks. No other framework handles all four at once — that's its defining feature as a tool for macroeconomic diagnosis and policy." },
  { q: "The government announces a 20% reduction in defense spending. In the AD/AS diagram, what is the FIRST-ORDER effect?", options: ["AD shifts left — G (government purchases) is a direct component of AD = C + I + G + (X-M); cutting G reduces total spending at every price level", "SRAS shifts left — defense contractors face higher input costs", "LRAS shifts right — reduced government debt frees up capital for private investment", "AD shifts right — lower government borrowing reduces interest rates, crowding in private investment"], correct: 0, exp: "G (government purchases of goods and services) is a direct component of AD. A 20% cut in defense spending reduces G directly → AD shifts left at every price level. The result: lower equilibrium GDP and lower price level. This is the first-order effect. Secondary effects (like possible interest rate changes from reduced borrowing) may shift AD back slightly, but the direct G reduction is the dominant immediate impact." },
  { q: "A massive hurricane destroys refinery capacity along the Gulf Coast for three months, causing gasoline prices to spike 60¢/gallon nationwide. In the AD/AS framework, what shifts and why is this NOT the same as the 1973 OPEC shock?", options: ["AD shifts left — households have less money for other spending because gas costs more", "SRAS shifts left temporarily — but unlike 1973, this is a localized, temporary supply disruption rather than a sustained oil embargo affecting the entire economy's input cost structure. The SRAS recovers when refineries reopen.", "LRAS shifts left — natural disasters permanently reduce productive capacity", "Both AD and SRAS shift left by equal amounts — leaving the price level unchanged but GDP falling"], correct: 1, exp: "SRAS shifts left when production costs rise across the economy. A temporary hurricane disruption shifts SRAS left briefly — but it's localized and short-lived; SRAS recovers as refineries reopen (like Hurricane Katrina 2005). The 1973 OPEC shock was sustained, global, and drove oil prices permanently higher for years — shifting SRAS left persistently and producing lasting stagflation. Duration and scope distinguish a temporary supply shock from a structural stagflation shock." },
  { q: "FRED shows GDPC1 (real GDP) dipping sharply below GDPPOT (potential GDP) in 2009. In AD/AS terms, what does this chart reveal, and what policy does it call for?", options: ["An inflationary gap — real GDP exceeding potential calls for tightening", "A recessionary gap — AD/SRAS equilibrium is to the left of LRAS; actual GDP ($11.9T) is below potential ($13.4T); unemployment is above the natural rate. Policy: stimulus to shift AD right toward potential.", "A full employment equilibrium — no policy needed", "A permanent decline in LRAS — potential GDP fell during the recession, so no gap exists"], correct: 1, exp: "When GDPC1 dips below GDPPOT on the FRED chart, the economy is in a recessionary gap: AD/SRAS equilibrium lies to the left of LRAS. Actual GDP is below what the economy could produce at full employment. Unemployment is above the natural rate. The appropriate policy response is to shift AD right — rate cuts, fiscal stimulus, or both — to restore output to potential. This is exactly what the 2009 ARRA and Fed near-zero rates aimed to do." },
  { q: "An economy has unemployment of 2.8% — well below the natural rate of 4.5%. Employers report desperate labor shortages. A politician proposes a major new stimulus package to 'keep the economy growing.' What does the AD/AS three-zone framework predict will happen?", options: ["The stimulus will create many new jobs since unemployment is low and the economy has room to grow", "The stimulus will shift LRAS right, permanently raising potential GDP", "The stimulus will have no effect because rational households will save all the extra money in anticipation of future taxes", "The stimulus will mainly produce inflation rather than real output gains — the economy is in the Neoclassical zone (steep SRAS near LRAS); firms cannot easily expand, so AD shifts mostly raise prices rather than output"], correct: 3, exp: "At 2.8% unemployment — well below the natural rate — the economy is in the Neoclassical zone: steep SRAS, near LRAS, labor is extremely scarce. Shifting AD right in this zone: firms cannot easily hire more workers or expand capacity quickly → they raise prices instead. The stimulus is 'mostly inflationary, little real benefit.' The speed limit analogy: flooring the gas when the engine is already at design capacity doesn't add speed — it just overheats. This is why the 2021-22 post-COVID stimulus produced 9.1% CPI rather than proportional output gains." },
  { q: "Which combination of curve shifts correctly describes the post-COVID inflation of 2021-22?", options: ["AD shifts right (massive fiscal+monetary stimulus) + SRAS shifts left (supply chain disruptions + Ukraine war energy shock) → combined demand-pull and cost-push inflation → 9.1% CPI", "Only SRAS shifts left — the fiscal stimulus had no demand effect because it was fully crowded out by rising rates", "Only AD shifts right — supply disruptions were minor and Ukraine war barely affected U.S. prices", "LRAS shifts right (productivity boom from remote work) + AD shifts right → output growth with low inflation"], correct: 0, exp: "Your slides trace both mechanisms precisely: AD shifted far right from ~$5T in cumulative fiscal stimulus and near-zero monetary policy. Simultaneously, SRAS shifted left from ongoing supply chain disruptions and the Ukraine war energy price spike. Both forces hit simultaneously: demand-pull (AD too far right) AND cost-push (SRAS too far left). 'The combined effect produced both demand-pull and cost-push inflation at the same time' — which is why CPI hit 9.1% in June 2022, the highest since 1981." },
  { q: "A firm is considering a $10M factory expansion. The AD/AS dashboard shows: real GDP = potential GDP (at LRAS), unemployment = 4.2%, price level stable. Should the firm expect stimulus or tightening from policymakers, and how does that affect their financing decision?", options: ["Expect stable policy — the economy is at full employment (AD/SRAS at LRAS). No major stimulus or tightening is needed. Financing conditions should be relatively predictable. This is the best macro environment for long-horizon capital investment decisions.", "Expect stimulus — the economy always needs more stimulus to grow", "Expect tightening — the economy is in an inflationary gap and the Fed will raise rates", "Expect massive LRAS expansion — full employment always triggers supply-side investment booms"], correct: 0, exp: "Full employment equilibrium (AD/SRAS at LRAS): actual = potential, unemployment = natural rate, price level stable. Policy prescription: maintain stability, avoid destabilizing shifts. For a firm making a $10M capital investment: this is the most predictable macro environment — no expected rate surge (no inflationary gap to cool) and no expected stimulus (no recessionary gap to close). Interest rates should be relatively stable. This is why your slides cite the late 1990s and 2019 pre-COVID as examples: sustainable expansion with stable financing conditions." },
  { q: "In 1974, policymakers faced stagflation: 8.5% unemployment AND 12% CPI inflation. A Keynesian advisor says 'ease — we need to fight the recession.' A Neoclassical advisor says 'tighten — we need to fight inflation.' Why are BOTH advisors giving bad advice in this specific situation?", options: ["Both advisors are correct — you can fight both simultaneously with the right mix of fiscal and monetary policy", "Neither advisor is wrong — stagflation doesn't actually exist; the data from 1974 are unreliable", "Both are giving bad demand-side prescriptions for a supply-side problem. Easing (AD right) fights recession but accelerates inflation. Tightening (AD left) fights inflation but deepens recession. The root cause is a leftward SRAS shift — no AD manipulation cleanly fixes a supply shock.", "The Keynesian advisor is correct and the Neoclassical advisor is wrong — stimulating demand always solves stagflation"], correct: 2, exp: "The stagflation geometry: SRAS shifted left → new equilibrium has both higher prices AND lower output. Both advisors are recommending AD shifts: easing (AD right) → output recovers but prices rise more; tightening (AD left) → inflation cools but output falls further. Every AD move improves one problem and worsens the other. 'Same outcome (inflation), very different policy responses — but neither demand tool cleanly solves a supply problem.' What was needed: the supply shock to dissipate AND sustained tightening to break expectations (which Volcker eventually did at great cost)." },
  { q: "A student argues: 'The self-correction mechanism makes fiscal stimulus unnecessary — just wait and wages will fall, SRAS will shift right, and the economy will return to potential on its own.' What is the strongest counterargument?", options: ["Self-correction is real but may take years or decades, during which millions face unemployment, workers permanently lose skills (hysteresis), and firms lose capacity — the cumulative human and economic cost of waiting may far exceed the cost of active stabilization", "Self-correction doesn't exist — wages never fall in a market economy", "Self-correction works instantly — the argument against stimulus is correct in all cases", "Self-correction only works in open economies — the U.S. is too closed for wage adjustment to operate"], correct: 0, exp: "The self-correction mechanism (wages fall → SRAS shifts right → output returns to potential) is real and acknowledged in the AD/AS model. The Keynesian counterargument is about time and cost: 'In the long run we are all dead' (Keynes). The 2008-09 recession without full Keynesian intervention took 8+ years for full recovery. Hysteresis: workers unemployed 3+ years permanently lose skills and employer connections, reducing LRAS even after recovery. The cumulative cost — lost output, lost human capital, health and family damage — may vastly exceed any risks from active policy. The debate is about how long the long run takes and what you do in the meantime." },
  { q: "Your slides describe three personal finance applications of the AD/AS model. In an inflationary gap with the Fed signaling rate hikes, which career move does the macro dashboard recommend AGAINST?", options: ["Negotiating a raise — tight labor markets give workers leverage", "Locking in a fixed-rate mortgage — rates are going up so lock before they rise", "Job-hopping to a new employer for a 15% salary increase — in a tight labor market this is ideal timing", "Quitting a stable job to start a business that relies on cheap consumer financing — inflationary gap means rates are rising and consumer credit will tighten"], correct: 3, exp: "Your slides' career positioning: inflationary gap (tight labor market) → workers have leverage → do negotiate raises and make strategic career moves. The move to avoid: starting a business reliant on cheap consumer financing (car loans, mortgages, credit cards) precisely when the Fed is raising rates to close the inflationary gap. Rising rates will tighten exactly the credit channels your business depends on. The macro dashboard says: if you're going to make a financing-dependent business decision, do it BEFORE the Fed hikes, not after the gap has already developed." },
  { q: "The Great Depression recovery 1933-38 is described as operating in the Keynesian zone of SRAS. What specific features of 1933 placed the economy so far into the Keynesian zone that New Deal spending created large real employment gains with minimal inflation?", options: ["Low interest rates in 1933 meant government borrowing was cheap, making stimulus more effective", "The gold standard prevented inflation, so any stimulus automatically produced only real output gains", "25% unemployment meant enormous idle capacity — firms could hire millions of unemployed workers at stable wages without facing input cost pressures. The SRAS was nearly flat because idle capacity was so massive.", "Consumer confidence was high in 1933, amplifying the multiplier effect of government spending"], correct: 2, exp: "Keynesian zone characteristics: far left of SRAS, nearly flat curve, massive idle capacity. In 1933: 25% unemployment, thousands of idle factories, prices already deflating. When New Deal spending shifted AD right, firms had enormous pools of unemployed workers to hire at existing wages — no need to bid wages up, no input cost pressure, SRAS barely moved. This is exactly the condition for 'large output gain, tiny price rise.' The flat SRAS is caused by this idle capacity: any output increase can be met by employing idle resources, not bidding up scarce ones." },
  { q: "FRED shows the M2 money supply nearly doubled from ~$15T in 2019 to ~$21T in 2021. In AD/AS terms, what did this monetary expansion do and what limited its inflationary impact initially?", options: ["The M2 expansion shifted LRAS right, permanently raising potential GDP and explaining why inflation was initially low", "M2 growth doesn't affect AD — only fiscal policy (G and taxes) shifts the aggregate demand curve", "The M2 expansion had no effect because rational households saved all the additional money rather than spending it", "The M2 expansion shifted AD right — but in 2020-early 2021 the economy was still in or near the Keynesian zone (high unemployment, recovering demand) so initial AD shifts produced more output than inflation. Inflation surged in late 2021 as the economy moved into the Neoclassical zone."], correct: 3, exp: "M2 expansion → more money in circulation → C and I increase → AD shifts right. Why wasn't inflation immediate? In 2020, unemployment was 14.7% and the economy was deep in the Keynesian zone (flat SRAS) — the AD shift produced recovery, not inflation. As the economy transitioned through the Intermediate zone in 2020-21, then into the Neoclassical zone by late 2021 (unemployment near 4%), the same rightward AD shifts increasingly produced prices rather than output. The zone of SRAS where the AD shift lands determines the outcome — same stimulus, very different effects depending on where you are on the curve." },
  { q: "Which of the following correctly states Say's Law, Keynes' Law, and the modern synthesis?", options: ["Say's Law: supply creates its own demand — production generates income which generates spending; markets self-correct. Keynes' Law: demand creates its own supply — spending drives production; demand can be deficient. Synthesis (Solow): both matter, time horizon determines which dominates.", "Say's Law: demand creates supply (short run). Keynes' Law: supply creates demand (long run). Synthesis: only one law operates at a time.", "Say's Law and Keynes' Law are equivalent — they predict the same outcomes, just using different language.", "Say's Law applies only to agricultural economies; Keynes' Law applies to modern industrial economies."], correct: 0, exp: "Say's Law ('supply creates its own demand'): production generates income → income generates spending → markets naturally clear to full employment. Neoclassical/long-run view. Keynes' Law ('demand creates its own supply'): spending drives how much firms produce; demand can be deficient (saving can exceed investment); sticky wages prevent fast self-correction. Short-run view. Modern synthesis (Solow 1987): 'At short time scales, Keynesian. At long time scales, neoclassical. At 5-10 years, piece together.' Both matter — the time horizon determines which dominates." },
  { q: "The AD/AS diagram shows SRAS shifting LEFT. Simultaneously, prices RISE and real GDP FALLS. What is the correct policy response and why is it so difficult?", options: ["Shift AD right (stimulus) — this is a recessionary gap and stimulus is always the correct response", "Shift AD left (tighten) — rising prices always call for contractionary policy regardless of output", "No AD shift cleanly solves stagflation — shifting AD left fights inflation but deepens the output decline; shifting AD right fights recession but accelerates inflation. The root cause is the SRAS shift; demand-management cannot resolve a supply-side problem without an unacceptable trade-off.", "Shift LRAS right through supply-side reforms — this immediately resolves stagflation in the short run"], correct: 2, exp: "SRAS shifting left → stagflation (prices up, output down). Policy dilemma geometry: shifting AD left → equilibrium moves further left of LRAS (deeper recession) while prices fall somewhat. Shifting AD right → equilibrium moves back toward LRAS (output recovers) but prices rise further. Every AD movement improves one dimension and worsens the other. This is why your slides call supply shocks 'uniquely painful': the standard demand-management toolkit was designed for demand shocks — it lacks a clean answer when the problem originates on the supply side." },
  { q: "A worker is deciding whether to accept a job offer in January 2008. The FRED chart shows real GDP beginning to diverge below potential GDP. Unemployment is rising from 4.5% toward 6%. What does the AD/AS macro dashboard suggest about her decision?", options: ["Accept immediately and negotiate the highest possible starting salary — tight labor market gives workers leverage", "Accept the job, lock in the stable employment, and start building emergency savings aggressively — the recessionary gap developing on the FRED chart signals layoffs and hiring freezes ahead, making stable employment precious and a financial cushion essential", "Decline and wait for a better offer — a recessionary gap means better opportunities are coming soon", "The macro dashboard is irrelevant to individual employment decisions — only personal fit with the role matters"], correct: 1, exp: "Recessionary gap developing (GDPC1 falling below GDPPOT): AD is contracting, firms are beginning to cut costs, hiring will freeze. Your slides: 'Recessionary gaps mean hiring freezes and layoffs — build emergency savings, update skills, get certifications, diversify income streams BEFORE the gap widens.' A stable job offer in early 2008 was precious — unemployment hit 10% by 2009. Accept and immediately build financial cushion. The macro dashboard gave advance warning: a developing recessionary gap on the FRED chart is a leading indicator of the labor market deterioration to come." },
];

function QuizStation({ onPass, onFail }: { onPass: (score: number, results: { correct: boolean; exp: string }[]) => void; onFail: () => void }) {
  const [questions] = useState(() => shuffle(ALL_QUESTIONS).slice(0, 10));
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; exp: string }[]>([]);
  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  function handleCheck() { if (sel === null) return; setResults(r => [...r, { correct: sel === q.correct, exp: q.exp }]); setChecked(true); }
  function handleNext() { setSel(null); setChecked(false); setIdx(i => i + 1); }
  function handleFinish() { const score = results.filter(r => r.correct).length; if (score >= 9) onPass(score, results); else onFail(); }
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
        {checked && <div className={`rounded-lg p-3 text-xs ${sel === q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{sel === q.correct ? "✓ Correct — " : "✗ Incorrect — "}{q.exp}</div>}
        {!checked && sel !== null && <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Check Answer</button>}
        {checked && !isLast && <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Question →</button>}
        {checked && isLast && <button onClick={handleFinish} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Submit Quiz</button>}
      </div>
    </div>
  );
}

const STATION_LABELS_CH11: Record<string, string> = {
  shiftsort:      "Curve Shift Sorter",
  outputgap:      "Output Gap Diagram Reader",
  zoneclassify:   "SRAS Zone Classifier",
  inflationtypes: "Inflation Types Classifier",
  realcases:      "Real-World Cases",
  personalfinance:"Personal Finance Dashboard",
  flash:          "Flashcard Review",
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
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: An economy is experiencing rising prices and falling output simultaneously. Using AD/AS, identify the shock, name the gap, and explain why demand stimulus would make things worse.</label>
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
  { id: "shiftsort"       as Station, label: "Curve Shift Sorter",          desc: "Sort 8 real events into the correct AD/AS curve shift and direction", icon: "↔️" },
  { id: "outputgap"       as Station, label: "Output Gap Diagram Reader",   desc: "Read 5 described AD/AS graphs: identify the gap and correct policy response", icon: "📊" },
  { id: "zoneclassify"    as Station, label: "SRAS Zone Classifier",        desc: "Classify 6 historical scenarios into Keynesian, Intermediate, or Neoclassical zone", icon: "🎯" },
  { id: "inflationtypes"  as Station, label: "Inflation Types Classifier",  desc: "Classify 4 historical inflation episodes: demand-pull, cost-push, both, or none", icon: "🌡️" },
  { id: "realcases"       as Station, label: "Real-World Cases",            desc: "Apply AD/AS to COVID 2020, post-COVID 2021-22, 1973 OPEC, and FRED chart reading", icon: "📰" },
  { id: "personalfinance" as Station, label: "Personal Finance Dashboard",  desc: "Verdict cards: what does each macro situation signal for your money decisions?", icon: "💼" },
  { id: "flash"           as Station, label: "Flashcard Review",            desc: "Master all 12 key Ch11 concepts before the quiz", icon: "📇" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",          label: "Dashboard" },
  { id: "shiftsort",      label: "Shifts" },
  { id: "outputgap",      label: "Output Gaps" },
  { id: "zoneclassify",   label: "Zones" },
  { id: "inflationtypes", label: "Inflation Types" },
  { id: "realcases",      label: "Real Cases" },
  { id: "personalfinance",label: "Personal Finance" },
  { id: "flash",          label: "Flashcards" },
  { id: "quiz",           label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","shiftsort","outputgap","zoneclassify","inflationtypes","realcases","personalfinance","flash","quiz","results","not-yet"];

const CH11_SUMMARY = [
  { heading: "11.1 Macroeconomic Perspectives on Demand and Supply", body: "Neoclassical economists emphasize Say's law, which holds that supply creates its own demand. Keynesian economists emphasize Keynes' law, which holds that demand creates its own supply. Many mainstream economists take a Keynesian perspective, emphasizing the importance of aggregate demand, for the short run, and a neoclassical perspective, emphasizing the importance of aggregate supply, for the long run." },
  { heading: "11.2 Building a Model of Aggregate Demand and Aggregate Supply", body: "The upward-sloping short run aggregate supply (SRAS) curve shows the positive relationship between the price level and the level of real GDP in the short run. Aggregate supply slopes up because when the price level for outputs increases, while the price level of inputs remains fixed, the opportunity for additional profits encourages more production. The aggregate supply curve is near-horizontal on the left and near-vertical on the right. In the long run, we show the aggregate supply by a vertical line at the level of potential output, which is the maximum level of output the economy can produce with its existing levels of workers, physical capital, technology, and economic institutions.\n\nThe downward-sloping aggregate demand (AD) curve shows the relationship between the price level for outputs and the quantity of total spending in the economy. It slopes down because of: (a) the wealth effect, which means that a higher price level leads to lower real wealth, which reduces the level of consumption; (b) the interest rate effect, which holds that a higher price level will mean a greater demand for money, which will tend to drive up interest rates and reduce investment spending; and (c) the foreign price effect, which holds that a rise in the price level will make domestic goods relatively more expensive, discouraging exports and encouraging imports." },
  { heading: "11.3 Shifts in Aggregate Supply", body: "The aggregate demand/aggregate supply (AD/AS) diagram shows how AD and AS interact. The intersection of the AD and AS curves shows the equilibrium output and price level in the economy. Movements of either AS or AD will result in a different equilibrium output and price level. The aggregate supply curve will shift out to the right as productivity increases. It will shift back to the left as the price of key inputs rises, and will shift out to the right if the price of key inputs falls. If the AS curve shifts back to the left, the combination of lower output, higher unemployment, and higher inflation, called stagflation, occurs. If AS shifts out to the right, a combination of lower inflation, higher output, and lower unemployment is possible." },
  { heading: "11.4 Shifts in Aggregate Demand", body: "The AD curve will shift out as the components of aggregate demand—C, I, G, and X–M—rise. It will shift back to the left as these components fall. These factors can change because of different personal choices, like those resulting from consumer or business confidence, or from policy choices like changes in government spending and taxes. If the AD curve shifts to the right, then the equilibrium quantity of output and the price level will rise. If the AD curve shifts to the left, then the equilibrium quantity of output and the price level will fall. Whether equilibrium output changes relatively more than the price level or whether the price level changes relatively more than output is determined by where the AD curve intersects with the AS curve.\n\nThe AD/AS diagram superficially resembles the microeconomic supply and demand diagram on the surface, but in reality, what is on the horizontal and vertical axes and the underlying economic reasons for the shapes of the curves are very different. We can illustrate long-term economic growth in the AD/AS framework by a gradual shift of the aggregate supply curve to the right. We illustrate a recession when the intersection of AD and AS is substantially below potential GDP, while we illustrate an expanding economy when the intersection of AS and AD is near potential GDP." },
  { heading: "11.5 How the AD/AS Model Incorporates Growth, Unemployment, and Inflation", body: "Cyclical unemployment is relatively large in the AD/AS framework when the equilibrium is substantially below potential GDP. Cyclical unemployment is small in the AD/AS framework when the equilibrium is near potential GDP. The natural rate of unemployment, as determined by the labor market institutions of the economy, is built into what economists mean by potential GDP, but does not otherwise appear in an AD/AS diagram. The AD/AS framework shows pressures for inflation to rise or fall when the movement from one equilibrium to another causes the price level to rise or to fall. The balance of trade does not appear directly in the AD/AS diagram, but it appears indirectly in several ways. Increases in exports or declines in imports can cause shifts in AD. Changes in the price of key imported inputs to production, like oil, can cause shifts in AS. The AD/AS model is the key model we use in this book to understand macroeconomic issues." },
  { heading: "11.6 Keynes' Law and Say's Law in the AD/AS Model", body: "We can divide the SRAS curve into three zones. Keynes' law says demand creates its own supply, so that changes in aggregate demand cause changes in real GDP and employment. We can show Keynes' law on the horizontal Keynesian zone of the aggregate supply curve. The Keynesian zone occurs at the left of the SRAS curve where it is fairly flat, so movements in AD will affect output, but have little effect on the price level. Say's law says supply creates its own demand. Changes in aggregate demand have no effect on real GDP and employment, only on the price level. We can show Say's law on the vertical neoclassical zone of the aggregate supply curve. The neoclassical zone occurs at the right of the SRAS curve where it is fairly vertical, and so movements in AD will affect the price level, but have little impact on output. The intermediate zone in the middle of the SRAS curve is upward-sloping, so a rise in AD will cause higher output and price level, while a fall in AD will lead to a lower output and price level." },
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
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6">
        {station==="intro"          && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="shiftsort"      && <ShiftSortStation       onComplete={(sc,t)=>markDone("shiftsort",      sc,t)} />}
        {station==="outputgap"      && <OutputGapStation       onComplete={(sc,t)=>markDone("outputgap",      sc,t)} />}
        {station==="zoneclassify"   && <ZoneClassifyStation    onComplete={(sc,t)=>markDone("zoneclassify",   sc,t)} />}
        {station==="inflationtypes" && <InflationTypesStation  onComplete={(sc,t)=>markDone("inflationtypes", sc,t)} />}
        {station==="realcases"      && <RealCasesStation       onComplete={(sc,t)=>markDone("realcases",      sc,t)} />}
        {station==="personalfinance"&& <PersonalFinanceStation onComplete={(sc,t)=>markDone("personalfinance",sc,t)} />}
        {station==="flash"          && <FlashcardStation       onComplete={(sc,t)=>markDone("flash",          sc,t)} />}
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
