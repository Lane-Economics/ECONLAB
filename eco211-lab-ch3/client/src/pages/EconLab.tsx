import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Station =
  | "intro"
  | "pricemech"
  | "laws"
  | "equilibrium"
  | "shifters"
  | "fourstep"
  | "controls"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab211_done_ch3";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// Station 1 — The Price Mechanism
// ─────────────────────────────────────────────
const PRICE_MECH_QS = [
  {
    q: "During the pandemic, lumber prices tripled. According to your slides, what did that price spike communicate to the market?",
    options: [
      "That lumber companies were being greedy",
      "That there was not enough wood — scarcity relative to demand",
      "That the government had placed a tax on lumber",
      "That lumber quality had improved significantly",
    ],
    correct: 1,
    exp: "A price spike is a signal. The tripling of lumber prices sent one clear message: 'We don't have enough wood.' Prices transmit scarcity information instantly, locally, and continuously — no central coordinator needed.",
  },
  {
    q: "When pandemic lumber prices tripled, producers responded by ramping up output and running extra shifts. What role were they playing in the price mechanism?",
    options: [
      "Responding to the incentive the price signal created",
      "Ignoring the price signal and following government orders",
      "Acting as the central coordinator of the lumber market",
      "Reducing supply to take advantage of higher prices",
    ],
    correct: 0,
    exp: "A price is a signal wrapped in an incentive. Producers saw the higher price as an incentive to supply more — drill more, hire more, run extra shifts. No one told them to; the price did the coordinating.",
  },
  {
    q: "Your slides state that prices transmit information 'instantly, locally, and continuously.' What is the key implication of this for how markets work?",
    options: [
      "Markets require a government agency to set prices correctly",
      "Resources flow to their highest-valued uses with no central coordinator needed",
      "Prices only work in large economies with many buyers and sellers",
      "Consumers must be fully informed about production costs for prices to work",
    ],
    correct: 1,
    exp: "Every shopper, shipper, and producer reads the same price signal simultaneously. Resources flow to their highest-valued uses automatically — with no central plan, no coordinator, no committee required. This is the core insight of the price mechanism.",
  },
];

function PriceMechStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = PRICE_MECH_QS[idx];
  const isLast = idx === PRICE_MECH_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, PRICE_MECH_QS.length);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">The Price Mechanism</p>
        <p className="text-muted-foreground text-xs">
          A price is a <strong className="text-foreground">signal wrapped in an incentive</strong> — it tells you what is scarce and simultaneously rewards you for responding. No central coordinator needed.
        </p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={PRICE_MECH_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Laws of Demand & Supply
// ─────────────────────────────────────────────
const LAWS_QS = [
  {
    q: "Your slides show a gasoline demand curve: at $5.20/gal, quantity demanded is 420 million gallons; at $1.00/gal, quantity demanded is 800 million gallons. Which law does this illustrate?",
    options: [
      "Law of Supply — higher price leads to higher quantity",
      "Law of Demand — as price falls, quantity demanded rises",
      "Law of Equilibrium — price adjusts until markets clear",
      "Law of Diminishing Returns — each gallon is worth less than the last",
    ],
    correct: 1,
    exp: "The Law of Demand: when price falls from $5.20 to $1.00, quantity demanded rises from 420M to 800M gallons. Price and quantity demanded move in opposite directions along the demand curve.",
  },
  {
    q: "Your slides define demand as 'consumer willingness AND ability to buy at each price.' A student says 'I want a Ferrari — I have high demand for Ferraris.' Is this correct?",
    options: [
      "Yes — wanting something is the same as demanding it",
      "No — demand requires both willingness AND ability (purchasing power) to buy",
      "Yes — desire drives all economic decisions",
      "No — demand only refers to what consumers actually purchased last year",
    ],
    correct: 1,
    exp: "Demand requires both willingness AND ability to pay. Wanting a Ferrari without the purchasing power to buy one is not economic demand. This is why the demand curve represents actual market behavior, not wishes.",
  },
  {
    q: "Your slides emphasize: 'demand' = the whole curve; 'quantity demanded' = one point on it. A news headline says 'rising incomes increase demand for organic food.' What actually happened?",
    options: [
      "A movement along the existing demand curve to a higher quantity",
      "The entire demand curve shifted to the right — more is demanded at every price",
      "The supply curve shifted right, which increased demand",
      "The equilibrium price rose, increasing quantity demanded",
    ],
    correct: 1,
    exp: "Income is a non-price factor — it shifts the whole curve. When income rises, consumers want more organic food at every price level, so the entire demand curve shifts right. That is a change in demand, not a change in quantity demanded.",
  },
  {
    q: "Your slides show a gasoline supply curve: at $1.00/gal, quantity supplied is 500M gallons; at $2.20/gal, quantity supplied is 720M gallons. What does this illustrate?",
    options: [
      "Law of Demand — consumers buy less at higher prices",
      "Law of Supply — as price rises, quantity supplied rises",
      "Market equilibrium — supply equals demand at $1.60",
      "A supply curve shift caused by higher input costs",
    ],
    correct: 1,
    exp: "The Law of Supply: as price rises from $1.00 to $2.20, quantity supplied rises from 500M to 720M gallons. Higher prices reward production — producers drill more, hire more, open new plants. Price and quantity supplied move in the same direction.",
  },
];

function LawsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = LAWS_QS[idx];
  const isLast = idx === LAWS_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, LAWS_QS.length);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Laws of Demand & Supply</p>
        <div className="text-muted-foreground text-xs space-y-1">
          <p><strong className="text-foreground">Law of Demand:</strong> ↑ Price → ↓ Quantity demanded &nbsp;|&nbsp; ↓ Price → ↑ Quantity demanded</p>
          <p><strong className="text-foreground">Law of Supply:</strong> ↑ Price → ↑ Quantity supplied &nbsp;|&nbsp; ↓ Price → ↓ Quantity supplied</p>
          <p className="italic">Watch the language: "demand" = the whole curve. "Quantity demanded" = one point on it.</p>
        </div>
        {/* Gasoline reference table */}
        <div className="mt-3 rounded-lg overflow-hidden border border-border text-xs">
          <table className="w-full">
            <thead><tr className="bg-primary text-primary-foreground"><th className="text-left px-3 py-1.5">Price ($/gal)</th><th className="text-center px-3 py-1.5">Qty Demanded (M gal)</th><th className="text-center px-3 py-1.5">Qty Supplied (M gal)</th></tr></thead>
            <tbody>
              <tr className="border-t border-border bg-background"><td className="px-3 py-1.5">$1.00</td><td className="text-center px-3 py-1.5">800</td><td className="text-center px-3 py-1.5">500</td></tr>
              <tr className="border-t border-border bg-muted/30"><td className="px-3 py-1.5">$2.20</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">720</td></tr>
              <tr className="border-t border-border bg-background"><td className="px-3 py-1.5">$5.20</td><td className="text-center px-3 py-1.5">420</td><td className="text-center px-3 py-1.5">—</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={LAWS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Market Equilibrium
// ─────────────────────────────────────────────
const EQUIL_QS = [
  {
    q: "In the gasoline market, equilibrium is at $1.40/gal and 600M gallons. If the price is set at $1.80/gal, producers want to sell 680M gallons but buyers only want 500M. What is this situation called, and what happens next?",
    options: [
      "A shortage — buyers want more than sellers supply, so price rises",
      "A surplus — unsold goods pile up, so sellers cut prices back toward $1.40",
      "Equilibrium — the market is balanced at $1.80",
      "A price floor — the government is holding the price above equilibrium",
    ],
    correct: 1,
    exp: "At $1.80, Qs (680M) > Qd (500M) — a surplus of 180M gallons. Unsold inventory builds up, pressuring sellers to cut prices. The market self-corrects back down toward the equilibrium of $1.40.",
  },
  {
    q: "At $1.20/gal in the gasoline market, buyers want 700M gallons but producers only want to supply 550M. What is this situation, and what pressure does it create?",
    options: [
      "A surplus — too much is being produced, so price falls",
      "A shortage — shelves go bare, and sellers raise prices back toward $1.40",
      "Equilibrium — the market clears at $1.20",
      "A demand shift — income must have fallen",
    ],
    correct: 1,
    exp: "At $1.20, Qd (700M) > Qs (550M) — a shortage of 150M gallons. Shelves go bare, buyers compete for limited supply, and sellers raise prices. The market self-corrects back up toward the equilibrium of $1.40.",
  },
  {
    q: "What is the key insight about how markets handle surpluses and shortages without any government intervention?",
    options: [
      "Markets require a regulator to correct imbalances — prices alone are not enough",
      "Whenever price is off equilibrium, pressure builds in the direction of the equilibrium price — markets self-correct",
      "Surpluses fix themselves but shortages require government action",
      "Markets only self-correct in competitive industries with many sellers",
    ],
    correct: 1,
    exp: "Markets self-correct automatically. A surplus drives price down; a shortage drives price up. In both cases, the pressure pushes toward equilibrium — no coordinator needed. This is one of the key takeaways from your slides.",
  },
  {
    q: "Your slides show a 'Shift vs. Move' diagram. A frost destroys half the Florida orange crop. What happens in the orange juice market?",
    options: [
      "The demand curve shifts left — consumers want less orange juice",
      "There is a movement along the supply curve to a lower quantity",
      "The supply curve shifts left — less is offered at every price, pushing equilibrium price up",
      "The equilibrium quantity rises while price falls",
    ],
    correct: 2,
    exp: "The frost is a non-price factor (natural conditions) that shifts the entire supply curve left — less orange juice is offered at every price. This is a shift of supply, not a movement along it. The new equilibrium has a higher price and lower quantity.",
  },
];

function EquilibriumStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = EQUIL_QS[idx];
  const isLast = idx === EQUIL_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, EQUIL_QS.length);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Market Equilibrium — Gasoline Market</p>
        <p className="text-muted-foreground text-xs mb-2">Equilibrium: <strong className="text-foreground">$1.40/gal · 600M gallons</strong></p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="font-semibold text-red-800">Surplus (price too high)</p>
            <p className="text-red-700">Qs &gt; Qd → unsold goods pile up → sellers cut prices</p>
            <p className="text-red-600 mt-1">At $1.80: Qs 680M vs Qd 500M → 180M gap</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="font-semibold text-amber-800">Shortage (price too low)</p>
            <p className="text-amber-700">Qd &gt; Qs → shelves bare → sellers raise prices</p>
            <p className="text-amber-600 mt-1">At $1.20: Qd 700M vs Qs 550M → 150M gap</p>
          </div>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={EQUIL_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Shifters
// ─────────────────────────────────────────────
type ShifterItem = {
  id: number;
  scenario: string;
  side: "demand" | "supply";
  direction: "left" | "right";
  sideExp: string;
  dirExp: string;
};

const SHIFTER_SCENARIOS: ShifterItem[] = [
  {
    id: 1,
    scenario: "Steel prices rise sharply. Car manufacturers now face higher production costs.",
    side: "supply", direction: "left",
    sideExp: "Steel is an input price — a producer-side factor. It shifts supply, not demand.",
    dirExp: "Higher input costs make production more expensive at every output level, shifting supply LEFT (less offered at each price).",
  },
  {
    id: 2,
    scenario: "U.S. chicken consumption rose from 47 to 97 lbs per person between 1980 and 2021 as tastes shifted toward chicken.",
    side: "demand", direction: "right",
    sideExp: "Tastes are a consumer-side factor — they shift demand.",
    dirExp: "Greater preference for chicken means more is demanded at every price — demand shifts RIGHT.",
  },
  {
    id: 3,
    scenario: "A severe drought destroys grain crops across the Midwest.",
    side: "supply", direction: "left",
    sideExp: "Natural conditions are a producer-side factor — they shift supply.",
    dirExp: "The drought reduces grain production at every price level — supply shifts LEFT.",
  },
  {
    id: 4,
    scenario: "An aging U.S. population increases the need for nursing home care and hearing aids.",
    side: "demand", direction: "right",
    sideExp: "Population size and demographics are consumer-side factors — they shift demand.",
    dirExp: "A larger elderly population means more demand for these services at every price — demand shifts RIGHT.",
  },
  {
    id: 5,
    scenario: "The government grants a subsidy to electric vehicle manufacturers.",
    side: "supply", direction: "right",
    sideExp: "Government policy (subsidies) is a producer-side factor — it shifts supply.",
    dirExp: "A subsidy lowers production costs, so producers offer more at every price — supply shifts RIGHT.",
  },
  {
    id: 6,
    scenario: "Consumers expect coffee prices to rise next month, so they buy more coffee today.",
    side: "demand", direction: "right",
    sideExp: "Future expectations are a consumer-side factor — they shift demand.",
    dirExp: "Expecting a price increase, consumers buy more now at current prices — demand shifts RIGHT today.",
  },
];

function ShiftersStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selSide, setSelSide] = useState<"demand" | "supply" | null>(null);
  const [selDir, setSelDir] = useState<"left" | "right" | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const item = SHIFTER_SCENARIOS[idx];
  const isLast = idx === SHIFTER_SCENARIOS.length - 1;
  const sideCorrect = checked ? selSide === item.side : null;
  const dirCorrect = checked ? selDir === item.direction : null;
  const bothCorrect = sideCorrect && dirCorrect;

  function handleCheck() {
    if (!selSide || !selDir) return;
    const pts = (selSide === item.side ? 1 : 0) + (selDir === item.direction ? 1 : 0);
    const newScore = score + pts;
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, SHIFTER_SCENARIOS.length * 2);
  }

  function handleNext() {
    setSelSide(null);
    setSelDir(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">What Shifts the Curves?</p>
        <div className="text-muted-foreground text-xs grid grid-cols-2 gap-3 mt-2">
          <div>
            <p className="font-semibold text-foreground mb-1">Demand shifters</p>
            <p>Income · Tastes · Population · Related goods · Expectations</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Supply shifters</p>
            <p>Input prices · Natural conditions · Technology · Government policy</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">Price change → movement ALONG the curve. Non-price change → the WHOLE curve shifts.</p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Scenario {idx + 1} of {SHIFTER_SCENARIOS.length}</span>
        <div className="flex gap-1">{SHIFTER_SCENARIOS.map((_, i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < idx ? "bg-green-500" : i === idx ? "bg-primary" : "bg-muted"}`} />)}</div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground">{item.scenario}</p>

        {/* Side selection */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Which curve shifts?</p>
          <div className="flex gap-2">
            {(["demand", "supply"] as const).map((s) => (
              <button key={s} disabled={checked} onClick={() => setSelSide(s)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition capitalize ${
                  checked
                    ? s === item.side ? "border-green-500 bg-green-50 text-green-800" : s === selSide ? "border-red-400 bg-red-50 text-red-700" : "border-border text-muted-foreground opacity-50"
                    : selSide === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"
                }`}>
                {s}
              </button>
            ))}
          </div>
          {checked && <p className={`text-xs ${sideCorrect ? "text-green-700" : "text-red-700"}`}>{sideCorrect ? "✓ " : "✗ "}{item.sideExp}</p>}
        </div>

        {/* Direction selection */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Which direction?</p>
          <div className="flex gap-2">
            {(["left", "right"] as const).map((d) => (
              <button key={d} disabled={checked} onClick={() => setSelDir(d)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition capitalize ${
                  checked
                    ? d === item.direction ? "border-green-500 bg-green-50 text-green-800" : d === selDir ? "border-red-400 bg-red-50 text-red-700" : "border-border text-muted-foreground opacity-50"
                    : selDir === d ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40"
                }`}>
                {d === "left" ? "← Left (decrease)" : "→ Right (increase)"}
              </button>
            ))}
          </div>
          {checked && <p className={`text-xs ${dirCorrect ? "text-green-700" : "text-red-700"}`}>{dirCorrect ? "✓ " : "✗ "}{item.dirExp}</p>}
        </div>
      </div>

      {!checked && (
        <button onClick={handleCheck} disabled={!selSide || !selDir}
          className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition">
          Check Answer
        </button>
      )}
      {checked && !isLast && (
        <button onClick={handleNext} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Next Scenario →
        </button>
      )}
      {checked && isLast && (
        <button onClick={() => onComplete(score, SHIFTER_SCENARIOS.length * 2)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Mark Complete ✓
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Four-Step Analysis
// ─────────────────────────────────────────────
const FOURSTEP_QS = [
  {
    q: "A drought hits Midwest grain farms. Using the four-step method: which curve shifts, in which direction, and what happens to equilibrium price and quantity of grain?",
    options: [
      "Demand shifts left → price falls, quantity falls",
      "Supply shifts left → price rises, quantity falls",
      "Supply shifts right → price falls, quantity rises",
      "Demand shifts right → price rises, quantity falls",
    ],
    correct: 1,
    exp: "Step 1: draw initial D and S. Step 2: drought is a natural condition — producer-side → supply. Step 3: drought reduces output at every price → supply shifts LEFT. Step 4: new equilibrium has higher P and lower Q. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Rising incomes cause consumers to buy more new cars. What does the four-step method predict for the car market?",
    options: [
      "Supply shifts right → price falls, quantity rises",
      "Demand shifts right → price rises, quantity rises",
      "Demand shifts left → price falls, quantity falls",
      "Supply shifts left → price rises, quantity falls",
    ],
    correct: 1,
    exp: "Step 1: draw D and S. Step 2: income is a consumer-side factor → demand. Step 3: higher income increases willingness to buy at every price → demand shifts RIGHT. Step 4: new equilibrium has higher P and higher Q. Pattern: demand shifts → P and Q move together.",
  },
  {
    q: "The government grants a large subsidy to solar panel manufacturers. What does the four-step method predict for the solar panel market?",
    options: [
      "Demand shifts right → price rises, quantity rises",
      "Supply shifts right → price falls, quantity rises",
      "Supply shifts left → price rises, quantity falls",
      "Demand shifts left → price falls, quantity falls",
    ],
    correct: 1,
    exp: "Step 1: draw D and S. Step 2: government subsidy lowers production costs → producer-side → supply. Step 3: cheaper to produce → more offered at every price → supply shifts RIGHT. Step 4: new equilibrium has lower P and higher Q. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Your slides state: 'Ceteris paribus — analyze ONE change at a time.' Why is this rule important?",
    options: [
      "Because only one market can change at a time in the real world",
      "Because multiple simultaneous shifts make the direction of the outcome ambiguous",
      "Because the four-step method can only handle supply shifts, not demand shifts",
      "Because ceteris paribus means the price level is held fixed",
    ],
    correct: 1,
    exp: "Ceteris paribus means 'all else equal.' When two things change simultaneously — say demand rises AND supply falls — we can predict that price will rise, but the effect on quantity is ambiguous (they work in opposite directions). Isolating one change at a time keeps the analysis clear and testable.",
  },
];

function FourStepStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = FOURSTEP_QS[idx];
  const isLast = idx === FOURSTEP_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, FOURSTEP_QS.length);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">The Four-Step Method</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[["1", "Draw initial model", "Sketch D and S, mark equilibrium P and Q"],
            ["2", "Demand or supply?", "Consumer-side factor → demand. Producer-side → supply."],
            ["3", "Right or left?", "More at every price → right. Less → left."],
            ["4", "Compare equilibria", "Find new P and Q. Note: demand shifts → P & Q together. Supply shifts → P & Q oppositely."]
          ].map(([n, title, desc]) => (
            <div key={n} className="bg-background border border-border rounded-lg p-2">
              <p className="text-primary font-bold text-base">{n}</p>
              <p className="font-semibold text-foreground text-xs">{title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={FOURSTEP_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Price Controls
// ─────────────────────────────────────────────
const CONTROLS_QS = [
  {
    q: "Rent control sets a maximum rent of $500/month in a city where the market equilibrium is $600/month. What type of price control is this, and what does it cause?",
    options: [
      "A price floor — it creates a surplus of apartments",
      "A price ceiling set below equilibrium — it creates a shortage of apartments",
      "A price ceiling set above equilibrium — it has no effect on the market",
      "A price floor set below equilibrium — it keeps rents affordable for everyone",
    ],
    correct: 1,
    exp: "A price ceiling is a maximum price. When set BELOW equilibrium ($500 < $600), Qd > Qs — more people want apartments than landlords are willing to rent at that price. The result is a shortage.",
  },
  {
    q: "Your slides list four unintended consequences of rent control. Which of the following is one of them?",
    options: [
      "Rents fall for all tenants, making housing universally more affordable",
      "New apartment construction booms because developers want to help",
      "Landlords convert rental units to condos and co-ops, reducing rental supply",
      "Vacancy rates rise as more apartments become available",
    ],
    correct: 2,
    exp: "Rent control's unintended consequences: fewer apartments rented than at market price, landlords convert units to condos/co-ops, maintenance and quality deteriorate, and allocation shifts to waiting lists, connections, and discrimination. 'The ceiling helps a few — and hurts many more.'",
  },
  {
    q: "Agricultural price supports set a price floor above the market equilibrium for grain. Who bears the cost, according to your slides?",
    options: [
      "Only farmers — they must accept lower prices than they want",
      "Taxpayers (who fund government grain purchases) and consumers (who pay above-market prices)",
      "Only foreign competitors who lose market share",
      "No one — price floors simply prevent market prices from falling too low",
    ],
    correct: 1,
    exp: "Price floors above equilibrium create surpluses. Governments typically buy the surplus to maintain the floor price. Who pays: taxpayers fund government purchases, consumers pay higher food prices than the market would set, and resources are misallocated to overproduction of supported crops. High-income countries spend roughly $1 billion per day supporting farmers.",
  },
  {
    q: "Your slides state: 'There's no free lunch — every policy has opportunity costs.' Which answer best captures the economic lesson from studying price controls?",
    options: [
      "Price controls always hurt consumers and should never be used",
      "Price controls can achieve their goals without any trade-offs if set correctly",
      "Price controls generate predictable side effects — the real question is whether the benefit to some is worth the cost to others",
      "Price floors help consumers; price ceilings help producers",
    ],
    correct: 2,
    exp: "Economics does not say price controls are always wrong — it says they have predictable consequences. A ceiling creates shortages and quality decline; a floor creates surpluses and inefficiency. The normative question — whether the policy is worth it — depends on who benefits and who pays. The positive analysis reveals the trade-offs.",
  },
];

function ControlsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const q = CONTROLS_QS[idx];
  const isLast = idx === CONTROLS_QS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const newScore = score + (sel === q.correct ? 1 : 0);
    setScore(newScore);
    setChecked(true);
    if (isLast) onComplete(newScore, CONTROLS_QS.length);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">Price Controls</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-foreground">Price Ceiling</p>
            <p className="text-muted-foreground">Maximum price. If set BELOW equilibrium → shortage. Example: rent control at $500 (eq. $600).</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-foreground">Price Floor</p>
            <p className="text-muted-foreground">Minimum price. If set ABOVE equilibrium → surplus. Example: agricultural price supports.</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"There's no free lunch — every policy has opportunity costs."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={CONTROLS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared Stepped Quiz Component
// ─────────────────────────────────────────────
function SteppedQuiz({ q, idx, total, sel, setSel, checked, onCheck, onNext, isLast, score }: {
  q: { q: string; options: string[]; correct: number; exp: string };
  idx: number; total: number; sel: number | null; setSel: (n: number) => void;
  checked: boolean; onCheck: () => void; onNext: () => void; isLast: boolean; score: number;
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
        <button onClick={onNext} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
          Mark Complete ✓
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
type Flashcard = { id: number; type: "standard" | "cloze"; front: string; back: string; hint: string };

const CH3_CARDS: Flashcard[] = [
  { id: 1, type: "standard", front: "What is the price mechanism?", back: "A price is a signal wrapped in an incentive. It communicates what is scarce (the signal) and simultaneously rewards people for responding (the incentive).\n\nPrices transmit information instantly, locally, and continuously — every shopper, shipper, and producer reads the same signal with no central coordinator needed.\n\nExample: Pandemic lumber prices tripled → consumers postponed projects, producers ramped up output, entrepreneurs developed substitutes.", hint: "Signal + incentive. No coordinator needed." },
  { id: 2, type: "standard", front: "What is the Law of Demand?", back: "As price rises, quantity demanded falls; as price falls, quantity demanded rises. Price and quantity demanded move in OPPOSITE directions.\n\nDefinition: Demand = consumer willingness AND ability to buy at each price.\n\nGasoline example from slides: at $5.20/gal → 420M gallons demanded; at $1.00/gal → 800M gallons demanded.", hint: "Price ↑ → Qd ↓. They move oppositely." },
  { id: 3, type: "cloze", front: "Complete: 'Demand' = _______. 'Quantity demanded' = _______.", back: "'Demand' = the whole curve (all price-quantity combinations).\n'Quantity demanded' = one specific point on the curve at a given price.\n\nA price change causes a movement ALONG the curve (change in quantity demanded).\nA non-price change SHIFTS the entire curve (change in demand).", hint: "Demand = whole curve. QD = one point." },
  { id: 4, type: "standard", front: "What is the Law of Supply?", back: "As price rises, quantity supplied rises; as price falls, quantity supplied falls. Price and quantity supplied move in the SAME direction.\n\nDefinition: Supply = producer willingness to produce and sell at each price.\n\nGasoline example: at $1.00/gal → 500M gallons supplied; at $2.20/gal → 720M gallons supplied.\n\nHigher prices reward production — producers drill more, hire more, open new plants.", hint: "Price ↑ → Qs ↑. They move together." },
  { id: 5, type: "standard", front: "What are the 5 demand shifters?", back: "1. Income — Normal goods: ↑ income → demand right. Inferior goods: ↑ income → demand left.\n2. Tastes — U.S. chicken consumption: 47 → 97 lbs/person (1980–2021).\n3. Population — Aging society → ↑ demand for nursing homes, hearing aids.\n4. Related goods — Substitutes: tablets ↓ → laptop demand ↓. Complements: golf clubs ↑ → golf balls ↓.\n5. Future expectations — Expect coffee prices to rise → buy more now.", hint: "Income, Tastes, Population, Related goods, Expectations." },
  { id: 6, type: "standard", front: "What are the 4 supply shifters?", back: "1. Input prices — Steel prices rise → car supply shifts left.\n2. Natural conditions — Drought → grain supply left. Good weather → salmon supply right.\n3. Technology — Green Revolution seeds doubled wheat/rice yields by the 1990s → supply right.\n4. Government policy — Taxes/costly regulations → supply left. Subsidies → supply right.", hint: "Input prices, Natural conditions, Technology, Government policy." },
  { id: 7, type: "standard", front: "What is market equilibrium, and how do markets self-correct?", back: "Equilibrium = where Qd = Qs. The price at which the market clears.\n\nGasoline equilibrium: $1.40/gal · 600M gallons.\n\nSurplus (price too high): Qs > Qd → unsold goods pile up → sellers cut prices → back to equilibrium.\nAt $1.80: Qs 680M vs Qd 500M → 180M surplus → price falls.\n\nShortage (price too low): Qd > Qs → shelves bare → sellers raise prices → back to equilibrium.\nAt $1.20: Qd 700M vs Qs 550M → 150M shortage → price rises.", hint: "Surplus → price falls. Shortage → price rises. Self-correcting." },
  { id: 8, type: "standard", front: "The Four-Step Method for analyzing market changes", back: "1. Draw the initial model — sketch D and S, mark equilibrium P and Q.\n2. Demand or supply? — Consumer-side factor → demand. Producer-side factor → supply.\n3. Right or left? — Increases quantity at every price → right. Decreases → left.\n4. Compare equilibria — Find new P and Q.\n\nKey pattern:\n• Demand shifts → P and Q move TOGETHER (both up or both down).\n• Supply shifts → P and Q move OPPOSITELY (one up, one down).\n\nCeteris paribus — analyze ONE change at a time.", hint: "D shifts → P&Q together. S shifts → P&Q opposite." },
  { id: 9, type: "cloze", front: "Complete: A price ceiling set _______ equilibrium creates a _______. A price floor set _______ equilibrium creates a _______.", back: "A price ceiling set BELOW equilibrium creates a SHORTAGE (Qd > Qs).\nA price floor set ABOVE equilibrium creates a SURPLUS (Qs > Qd).\n\nOnly controls that are 'binding' (ceiling below eq. or floor above eq.) affect the market. Controls set on the other side have no effect.", hint: "Ceiling below → shortage. Floor above → surplus." },
  { id: 10, type: "standard", front: "Rent control: who benefits and what are the unintended consequences?", back: "Example from slides: Rent control at $500 (equilibrium $600).\n\nWho benefits: current tenants who keep the rent-controlled unit.\n\nUnintended consequences:\n• Fewer apartments rented than at market price\n• Landlords convert units to condos and co-ops\n• Maintenance and quality deteriorate\n• Allocation by waiting list, connections, discrimination\n\n'The ceiling helps a few — and hurts many more. There's no free lunch.'", hint: "Helps sitting tenants. Hurts housing supply, quality, and new renters." },
  { id: 11, type: "standard", front: "Agricultural price floors: who pays?", back: "Example from slides: Price support set ABOVE equilibrium → surplus.\n\nGovernment usually buys the surplus to keep prices up.\n\nWho pays:\n• Farmers — benefit from guaranteed higher prices\n• Taxpayers — fund government purchases\n• Consumers — pay higher food prices than the market would set\n• Resources — misallocated; too much produced of supported crops\n\nHigh-income countries spend roughly $1 billion per day supporting farmers.", hint: "Farmers gain. Taxpayers, consumers, and resource allocation all lose." },
  { id: 12, type: "cloze", front: "Complete: 'Movement along ≠ shift of.' A _______ change causes a movement along the curve. A _______ change shifts the entire curve.", back: "A PRICE change causes a movement ALONG the curve (change in quantity demanded or supplied).\nA NON-PRICE change shifts the ENTIRE curve (change in demand or supply).\n\nThis is the most common error in supply and demand analysis. Never say 'demand increased because price fell' — that's a movement along the curve, not a shift of it.", hint: "Price → movement along. Non-price → shift of." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH3_CARDS]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const total = deck.length;
  const masteredCount = masteredIds.size;
  const allDone = masteredIds.size + reviewIds.size === total;
  const card = deck[cardIdx];

  function stripCloze(text: string) {
    return text.replace(/\{\{c\d+::([^}]+)\}\}/g, "____");
  }

  function handleMastered() {
    setMasteredIds((prev) => new Set([...prev, card.id]));
    setFlipped(false);
    if (cardIdx < deck.length - 1) setCardIdx((i) => i + 1);
  }

  function handleReview() {
    setReviewIds((prev) => new Set([...prev, card.id]));
    setFlipped(false);
    if (cardIdx < deck.length - 1) setCardIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch3 Demand and Supply</p>
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
          <div onClick={() => setFlipped((f) => !f)}
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
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch3 deck. The quiz is now unlocked.</p>
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
// Quiz pool — modeled on W2-HW1 and W2-HW2 style
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  {
    q: "In economics, 'demand' for a good refers to those who are:",
    options: ["Everyone who wishes they could own the good", "Those who are both willing AND able to buy it at various prices", "The total quantity purchased last quarter", "Consumers who have already bought the good at least once"],
    correct: 1,
    exp: "Demand requires both willingness (the desire) AND ability (the purchasing power) to pay. Wanting a luxury sports car without the budget to buy one is not economic demand.",
  },
  {
    q: "The law of demand states that, ceteris paribus:",
    options: ["As price rises, demand increases", "As price rises, quantity demanded falls", "As price rises, quantity demanded rises", "Price and quantity demanded move in the same direction"],
    correct: 1,
    exp: "The law of demand describes an inverse relationship between price and quantity demanded along a fixed curve. This is a movement ALONG the curve — the curve itself does not shift when price changes.",
  },
  {
    q: "Movie ticket prices fall from $15 to $10. Consumers attend more movies. Economists call this:",
    options: ["An increase in demand", "An increase in quantity demanded", "A rightward shift of the demand curve", "A change in consumer tastes"],
    correct: 1,
    exp: "A change in the good's own price moves us ALONG the existing demand curve — that is a change in quantity demanded, not a shift of demand. The demand curve stays in place; only the position along it changes.",
  },
  {
    q: "The law of supply states that, ceteris paribus, as price rises:",
    options: ["Quantity supplied falls", "Quantity supplied rises", "The supply curve shifts left", "Producers exit the market"],
    correct: 1,
    exp: "Law of supply: higher prices reward production. As price rises, quantity supplied rises — producers drill more, hire more, open new plants. Price and quantity supplied move in the SAME direction.",
  },
  {
    q: "In a free market, the equilibrium price is determined by:",
    options: ["The largest firm setting a price that covers its costs", "The intersection of the market demand curve and the market supply curve", "The government agency responsible for price stability", "Producers calculating cost plus a standard profit margin"],
    correct: 1,
    exp: "Market equilibrium occurs where Qd = Qs — graphically where demand and supply curves intersect. No single buyer or seller sets this price; it emerges from the interaction of all market participants.",
  },
  {
    q: "At a price BELOW market equilibrium, what occurs?",
    options: ["Quantity supplied exceeds quantity demanded — a surplus", "Quantity demanded exceeds quantity supplied — a shortage", "The market is in equilibrium", "Producers increase output to take advantage of rising prices"],
    correct: 1,
    exp: "Below equilibrium, the low price attracts more buyers (Qd rises) and discourages sellers (Qs falls). The resulting shortage puts upward pressure on price until the market clears at equilibrium.",
  },
  {
    q: "At a price ABOVE market equilibrium, what occurs?",
    options: ["Quantity demanded exceeds quantity supplied — a shortage", "Quantity supplied exceeds quantity demanded — a surplus", "The market is in equilibrium at the higher price", "Consumers immediately stop buying until prices fall"],
    correct: 1,
    exp: "Above equilibrium, the high price discourages buyers (Qd falls) and attracts sellers (Qs rises). The surplus of unsold goods puts downward pressure on price, self-correcting back toward equilibrium.",
  },
  {
    q: "Peanut butter and jelly are complements. If the price of peanut butter rises sharply, what happens in the market for jelly?",
    options: ["Demand for jelly increases (shifts right)", "Demand for jelly decreases (shifts left)", "The quantity demanded of jelly falls along the existing curve", "No change — jelly and peanut butter are independent goods"],
    correct: 1,
    exp: "Complements are used together. When peanut butter becomes more expensive, people buy less of it — and therefore less jelly. Demand for jelly shifts LEFT (decreases at every price). This is a demand shift, not a movement along the curve.",
  },
  {
    q: "A drought devastates the corn crop. Using the four-step method, what happens to equilibrium price and quantity of corn?",
    options: ["Price falls, quantity rises", "Price rises, quantity rises", "Price rises, quantity falls", "Price falls, quantity falls"],
    correct: 2,
    exp: "Step 2: natural conditions → supply. Step 3: less corn at every price → supply shifts LEFT. Step 4: new equilibrium has higher price and lower quantity. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Consumer incomes rise and the good is a normal good. What happens to equilibrium price and quantity?",
    options: ["Price falls, quantity falls", "Price rises, quantity rises", "Price rises, quantity falls", "Price falls, quantity rises"],
    correct: 1,
    exp: "Income is a demand shifter. For a normal good, rising income → demand shifts RIGHT. New equilibrium: both price and quantity rise. Pattern: demand shifts → P and Q move together.",
  },
  {
    q: "New automation technology cuts the cost of making smartphones in half. What happens in the smartphone market?",
    options: ["Demand shifts right → price and quantity both rise", "Supply shifts right → price falls, quantity rises", "Supply shifts left → price rises, quantity falls", "Demand shifts left → price and quantity both fall"],
    correct: 1,
    exp: "Technology is a supply shifter. Lower production costs → supply shifts RIGHT. New equilibrium: lower price, higher quantity. Pattern: supply shifts → P and Q move oppositely.",
  },
  {
    q: "Demand for electric vehicles rises (due to higher gasoline prices) AND supply rises (due to a new battery factory opening) simultaneously. What can you conclude?",
    options: ["Price definitely rises; quantity is ambiguous", "Quantity definitely rises; price change is ambiguous", "Both price and quantity definitely rise", "Both price and quantity are ambiguous"],
    correct: 1,
    exp: "Both shifts push quantity UP (demand-right → Q up; supply-right → Q up). On price: demand-right pushes P up, supply-right pushes P down — these work against each other. Which dominates depends on the relative size of the shifts, so price is ambiguous.",
  },
  {
    q: "A price ceiling is most accurately defined as:",
    options: ["A legal minimum price set above market equilibrium", "A legal maximum price, typically set below market equilibrium to be binding", "The highest price sellers are willing to accept", "A price set by the largest firm in the market"],
    correct: 1,
    exp: "A price ceiling is a legal CAP — sellers cannot charge above it. To be binding (have any real effect), it must be set BELOW equilibrium. If set above equilibrium, the market clears below the ceiling and it has no effect.",
  },
  {
    q: "A city sets rent control at $900/month when market equilibrium is $1,400/month. The predictable result is:",
    options: ["A surplus of apartments as landlords rush to rent them out", "A shortage of apartments as Qd exceeds Qs at the controlled price", "No effect — landlords will continue supplying apartments at any price", "Improved apartment quality as landlords compete for tenants"],
    correct: 1,
    exp: "At $900 (below equilibrium $1,400), Qd is high (cheap apartments attract many renters) while Qs is low (less profitable for landlords). The gap is a shortage. Landlords also reduce maintenance and convert units — 'the ceiling helps a few and hurts many more.'",
  },
  {
    q: "A government sets a price floor for sugar above the market equilibrium. The most predictable result is:",
    options: ["A shortage — consumers demand more sugar at the lower price", "A surplus — Qs exceeds Qd at the above-equilibrium floor price", "No effect — markets always clear at equilibrium regardless of floors", "Lower prices for consumers as producers compete for buyers"],
    correct: 1,
    exp: "A floor above equilibrium is binding. The high guaranteed price encourages Qs (producers supply more) while discouraging Qd (consumers buy less). The gap is a surplus. Governments often purchase the surplus to maintain the floor — funded by taxpayers.",
  },
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
    const correct = sel === q.correct;
    setResults((r) => [...r, { correct, exp: q.exp }]);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  function handleFinish() {
    const score = results.filter((r) => r.correct).length;
    if (score >= 9) onPass(score, results);
    else onFail();
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground">Chapter 3 Quiz</p>
        <p className="text-muted-foreground text-xs">10 questions — score 9 or higher to pass.</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of 10</p>
          <span className="text-xs text-muted-foreground">{results.filter((r) => r.correct).length} correct</span>
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
const STATION_LABELS_CH3: Record<string, string> = {
  pricemech:   "The Price Mechanism",
  laws:        "Laws of Demand & Supply",
  equilibrium: "Market Equilibrium",
  shifters:    "Demand & Supply Shifters",
  fourstep:    "Four-Step Analysis",
  controls:    "Price Controls",
  flash:       "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");

  const stationRows = Object.entries(STATION_LABELS_CH3)
    .filter(([id]) => sectionScores[id])
    .map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stationTableRows = stationRows.map(r =>
      `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score}/${r.total}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${r.score === r.total ? "✓" : r.score >= r.total * 0.7 ? "Good" : "Review"}</td></tr>`
    ).join("");
    const quizRows = results.map((r, i) =>
      `<tr style="background:${r.correct ? "#f0fdf4" : "#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct ? "✓" : "✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`
    ).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 211 Ch3 Results</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style>
      </head><body>
      <h1>${courseTitle}</h1><h2>Chapter 3 — Demand and Supply</h2>
      <p style="font-size:0.9rem;color:#475569"><strong>Student:</strong> ${name || "—"} &nbsp;&nbsp; <strong>Date:</strong> ${now}</p>
      <div class="score-box"><p>Quiz Score: ${score}/10 — ${score >= 9 ? "PASSED ✓" : "Not Yet"}</p></div>
      ${stationTableRows ? `<h3>Station Scores</h3><table><thead><tr><th>Station</th><th style="text-align:center">Score</th><th style="text-align:center">Status</th></tr></thead><tbody>${stationTableRows}</tbody></table>` : ""}
      <h3>Quiz Question Review</h3>
      <table><thead><tr><th style="width:40px"></th><th>Question</th><th>Explanation</th></tr></thead><tbody>${quizRows}</tbody></table>
      ${exitTicket ? `<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:12px"><strong style="font-size:0.75rem;text-transform:uppercase;color:#64748b">Exit Ticket</strong><p style="font-size:0.85rem;margin:6px 0 0">${exitTicket}</p></div>` : ""}
      <footer>Access for free at https://openstax.org/books/principles-microeconomics-3e/pages/1-introduction</footer>
      </body></html>`);
    setTimeout(() => w.print(), 600);
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-2xl p-5 text-center ${score >= 9 ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
        <p className="text-3xl font-bold">{score}/10</p>
        <p className={`text-lg font-semibold mt-1 ${score >= 9 ? "text-green-800" : "text-amber-800"}`}>{score >= 9 ? "Excellent — Chapter 3 Complete! ✓" : "Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 3 — Demand and Supply</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div>
          <label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e => setName(e.target.value)} placeholder="First and Last Name"
            className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <div>
          <label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In one sentence, explain why a price ceiling set below equilibrium creates a shortage.</label>
          <textarea id="exit-ticket" value={exitTicket} onChange={e => setExitTicket(e.target.value)} rows={2} placeholder="Your response..."
            className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" />
        </div>
      </div>
      {stationRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Station Scores</p>
          <div className="space-y-2">
            {stationRows.map((r) => (
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
// Stations list, Nav, and Order
// ─────────────────────────────────────────────
const STATIONS = [
  { id: "pricemech"   as Station, label: "Price Mechanism",       desc: "How prices coordinate without a coordinator", icon: "📡" },
  { id: "laws"        as Station, label: "Laws of D & S",         desc: "The two laws and the curves they generate", icon: "📉" },
  { id: "equilibrium" as Station, label: "Market Equilibrium",    desc: "Where the curves meet and how markets self-correct", icon: "⚖️" },
  { id: "shifters"    as Station, label: "Shifters",              desc: "Non-price factors that move demand and supply", icon: "↔️" },
  { id: "fourstep"    as Station, label: "Four-Step Analysis",    desc: "A reusable method for predicting market changes", icon: "🔢" },
  { id: "controls"    as Station, label: "Price Controls",        desc: "Ceilings, floors, and their unintended consequences", icon: "🚧" },
  { id: "flash"       as Station, label: "Flashcard Review",      desc: "Master all 12 key Ch3 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",       label: "Dashboard" },
  { id: "pricemech",   label: "Price Mech" },
  { id: "laws",        label: "D & S Laws" },
  { id: "equilibrium", label: "Equilibrium" },
  { id: "shifters",    label: "Shifters" },
  { id: "fourstep",    label: "Four-Step" },
  { id: "controls",    label: "Controls" },
  { id: "flash",       label: "Flashcards" },
  { id: "quiz",        label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","pricemech","laws","equilibrium","shifters","fourstep","controls","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Chapter Summary Modal
// ─────────────────────────────────────────────
const CH3_SUMMARY = [
  { heading: "3.1 Demand, Supply, and Equilibrium in Markets for Goods and Services", body: "A demand schedule shows the relationship between price and quantity demanded. A supply schedule shows the relationship between price and quantity supplied. The point where the supply and demand schedules cross is called the equilibrium. The equilibrium price and quantity occur where the quantity supplied and quantity demanded are equal." },
  { heading: "3.2 Shifts in Demand and Supply for Goods and Services", body: "Economists distinguish between changes in demand or supply and changes in the quantity demanded or supplied. A change in demand or supply is caused by a factor other than price and results in a different demand or supply curve. Changes in the quantity demanded or supplied represent movements along existing curves." },
  { heading: "3.3 Changes in Equilibrium Price and Quantity: The Four-Step Process", body: "When analyzing how a change in the economy affects a market, use the four-step process: (1) Draw a demand and supply diagram to think about what the market looked like before the event. (2) Decide whether the event affects supply or demand. (3) Decide whether the effect on supply or demand is positive or negative, and draw the curve shift. (4) Read the new equilibrium price and quantity from the diagram." },
  { heading: "3.4 Price Ceilings and Price Floors", body: "Price ceilings prevent a price from rising above a certain level. When a price ceiling is set below the equilibrium price, quantity demanded exceeds quantity supplied, causing a shortage. Price floors prevent a price from falling below a certain level. When a price floor is set above the equilibrium price, quantity supplied exceeds quantity demanded, causing a surplus." },
];

function SummaryModal({ onClose, courseTitle }: { onClose: () => void; courseTitle: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 3 Summary — Demand and Supply</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Close">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH3_SUMMARY.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{s.heading}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">Access for free at <a href="https://openstax.org/books/principles-microeconomics-3e/pages/1-introduction" target="_blank" rel="noopener noreferrer" className="underline text-primary">https://openstax.org/books/principles-microeconomics-3e/pages/1-introduction</a></p>
        </div>
        <div className="p-4 border-t border-border">
          <button onClick={onClose} type="button" className="w-full py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold text-sm transition">Close &amp; Return to Lab</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Not Yet Screen
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
function Dashboard({ completed, onSelect, quizUnlocked, onStartQuiz, onSummary }: {
  completed: Set<Station>; onSelect: (s: Station) => void; quizUnlocked: boolean; onStartQuiz: () => void; onSummary: () => void;
}) {
  const progress = STATIONS.filter(s => completed.has(s.id)).length;
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Chapter 3 — Demand and Supply</p>
        <p className="text-muted-foreground text-xs">Complete all stations and the Flashcard review to unlock the Quiz. Your progress is saved automatically.</p>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progress / STATIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}/{STATIONS.length} stations complete</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted border border-border">
        <div className="flex items-center gap-2">
          <span className="text-base">📄</span>
          <span className="text-sm text-foreground">Need a refresher? View the chapter summary.</span>
        </div>
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

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
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
        <a href={hubUrl} target="_blank" rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">
          ← Course Hub
        </a>
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {NAV_STATIONS.map(s => {
            const idx = STATION_ORDER.indexOf(s.id);
            const done = idx < currentIdx || completed.has(s.id);
            const active = s.id === station || (station === "not-yet" && s.id === "quiz") || (station === "results" && s.id === "quiz");
            if (s.id === "quiz" && !allStationsDone) {
              return <span key={s.id} title="Complete all stations first" className="px-3 py-1.5 rounded-full text-xs font-medium text-sidebar-foreground/35 cursor-not-allowed select-none">🔒 Quiz</span>;
            }
            return (
              <button key={s.id} onClick={() => onNav(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-sidebar-accent text-sidebar-foreground/90" : "text-sidebar-foreground/75 hover:text-white"
                }`}>
                {done && !active ? "✓ " : ""}{s.label}
              </button>
            );
          })}
        </div>
        <div className="sm:hidden text-sm font-medium text-sidebar-foreground/80">{currentIdx + 1} / {NAV_STATIONS.length}</div>
        <div className="w-24 hidden md:block shrink-0">
          <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(currentIdx / (NAV_STATIONS.length - 1)) * 100}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Main EconLab
// ─────────────────────────────────────────────
export default function EconLab({ courseTitle, courseSubtitle, hubUrl }: {
  courseTitle: string; courseSubtitle: string; hubUrl: string;
}) {
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
    if (score !== undefined && total !== undefined) {
      setSectionScores(prev => ({ ...prev, [s]: { score, total } }));
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
    setStation("intro");
  }

  const quizUnlocked = STATIONS.every(s => completed.has(s.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} courseTitle={courseTitle} />}
      <Header station={station} completed={completed} onNav={setStation} courseTitle={courseTitle} courseSubtitle={courseSubtitle} hubUrl={hubUrl} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {station === "intro"       && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={() => setStation("quiz")} onSummary={() => setShowSummary(true)} />}
        {station === "pricemech"   && <PriceMechStation   onComplete={(sc, t) => markDone("pricemech",   sc, t)} />}
        {station === "laws"        && <LawsStation        onComplete={(sc, t) => markDone("laws",        sc, t)} />}
        {station === "equilibrium" && <EquilibriumStation onComplete={(sc, t) => markDone("equilibrium", sc, t)} />}
        {station === "shifters"    && <ShiftersStation    onComplete={(sc, t) => markDone("shifters",    sc, t)} />}
        {station === "fourstep"    && <FourStepStation    onComplete={(sc, t) => markDone("fourstep",    sc, t)} />}
        {station === "controls"    && <ControlsStation    onComplete={(sc, t) => markDone("controls",    sc, t)} />}
        {station === "flash"       && <FlashcardStation   onComplete={(sc, t) => markDone("flash",       sc, t)} />}
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
