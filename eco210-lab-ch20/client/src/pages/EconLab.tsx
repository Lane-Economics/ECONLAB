import { useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Station =
  | "intro"
  | "abscomp"
  | "occalc"
  | "usmexico"
  | "gains"
  | "terms"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch20";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// Chapter Summary Modal
// ─────────────────────────────────────────────
function SummaryModal({ onClose, courseTitle }: { onClose: () => void; courseTitle: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="p-5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{courseTitle}</p>
          <h2 className="text-xl font-bold text-foreground mt-1">Chapter 20 — International Trade</h2>
          <p className="text-sm text-muted-foreground mt-1">Comparative advantage, opportunity cost, and the gains from specialization</p>
        </div>
        <div className="p-5 space-y-4 text-sm">
          {[
            { n: "01", t: "The Big Idea", d: "Trade lets both sides consume beyond what they could produce alone. Specialize → Trade → Gain." },
            { n: "02", t: "Two Ways to Be 'Better'", d: "Absolute advantage = more output from same inputs. Comparative advantage = lower opportunity cost. Comparative advantage drives trade." },
            { n: "03", t: "How to Find Comparative Advantage", d: "Compute opportunity cost for each good in each country. The country with the lower OC for a good has comparative advantage in it." },
            { n: "04", t: "U.S. & Mexico — Worked Example", d: "U.S. (40 workers): 10,000 shoes OR 40,000 refrigerators. Mexico: 8,000 shoes OR 10,000 refrigerators. U.S. has lower OC for refrigerators (0.25 shoes); Mexico has lower OC for shoes (1.25 refrig). Each specializes accordingly." },
            { n: "05", t: "Gains from Specialization", d: "Before trade (split workers 50/50): World gets 9,000 shoes + 25,000 refrigerators. After specialization: 8,000 shoes + 40,000 refrigerators — same workers, more of everything." },
            { n: "06", t: "Terms of Trade", d: "The mutually beneficial range: any price between 0.25 and 0.8 shoes per refrigerator benefits both countries. The actual price is set by world supply and demand." },
            { n: "07", t: "The Camping Analogy", d: "Jethro is faster at everything. But he can't do it all — every minute on firewood is a minute not cooking. He should focus where his advantage is greatest. Same logic for nations." },
            { n: "08", t: "Common Objection", d: "'If they win, we lose.' But trade is positive-sum at the national level — both countries consume more. The gains are real; the politics of distribution is a separate question." },
          ].map((item) => (
            <div key={item.n} className="flex gap-3">
              <span className="text-primary font-bold text-base w-6 shrink-0">{item.n}</span>
              <div>
                <p className="font-semibold text-foreground">{item.t}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{item.d}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Access for free at{" "}
            <a
              href="https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction
            </a>
          </p>
        </div>
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 1 — Absolute vs. Comparative Advantage
// ─────────────────────────────────────────────
const ABS_COMP_ITEMS = [
  { id: 1, text: "Saudi Arabia produces oil cheaply because of geology.", correct: "absolute", exp: "Absolute advantage — geology gives Saudi Arabia more output (oil) from the same inputs. This is a productivity edge." },
  { id: 2, text: "Iowa grows corn efficiently due to soil and climate.", correct: "absolute", exp: "Absolute advantage — Iowa's soil and climate allow more corn output per worker than most other regions." },
  { id: 3, text: "Switzerland makes watches because it gives up fewer other goods to do so.", correct: "comparative", exp: "Comparative advantage — Switzerland's edge is not raw output but the lower opportunity cost of watch production relative to alternatives." },
  { id: 4, text: "Even if the U.S. is more productive at everything, Mexico still specializes in shoes because every U.S. shoe costs 4 refrigerators while Mexico's costs only 1.25.", correct: "comparative", exp: "Comparative advantage — the U.S. has absolute advantage in both, but Mexico has comparative advantage in shoes because its opportunity cost is far lower." },
  { id: 5, text: "Country A makes more wine AND more cloth per worker than Country B.", correct: "absolute", exp: "Absolute advantage — Country A produces more output of both goods with the same inputs. That is the definition of absolute advantage." },
  { id: 6, text: "Country B specializes in cloth because it gives up only 3 wine bottles per yard of cloth, versus Country A giving up 4.", correct: "comparative", exp: "Comparative advantage — Country B has the lower opportunity cost for cloth (3 wine vs 4 wine), so it specializes there even though Country A is absolutely better at everything." },
];

function AbsCompStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [placements, setPlacements] = useState<Record<number, "absolute" | "comparative">>({});
  const [checked, setChecked] = useState(false);

  const allPlaced = ABS_COMP_ITEMS.every((item) => placements[item.id]);
  const correctCount = checked
    ? ABS_COMP_ITEMS.filter((item) => placements[item.id] === item.correct).length
    : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Absolute vs. Comparative Advantage</p>
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Absolute advantage</strong> = more output from the same inputs (faster, higher productivity).<br />
          <strong className="text-foreground">Comparative advantage</strong> = lower opportunity cost — giving up less of OTHER goods to produce this one.<br />
          <em>This is what actually drives trade.</em>
        </p>
      </div>

      <p className="text-sm font-semibold text-foreground">Classify each statement:</p>

      {ABS_COMP_ITEMS.map((item) => (
        <div key={item.id} className={`border-2 rounded-xl p-3 space-y-2 transition-colors ${
          checked
            ? placements[item.id] === item.correct
              ? "border-green-500 bg-green-50"
              : "border-red-400 bg-red-50"
            : "border-border bg-card"
        }`}>
          <p className="text-sm text-foreground">{item.text}</p>
          <div className="flex gap-2">
            {(["absolute", "comparative"] as const).map((type) => (
              <button
                key={type}
                disabled={checked}
                onClick={() => setPlacements((p) => ({ ...p, [item.id]: type }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  placements[item.id] === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {type === "absolute" ? "Absolute" : "Comparative"}
              </button>
            ))}
          </div>
          {checked && (
            <p className={`text-xs mt-1 ${placements[item.id] === item.correct ? "text-green-700" : "text-red-700"}`}>
              {placements[item.id] === item.correct ? "✓ " : "✗ Correct: " + item.correct + " — "}{item.exp}
            </p>
          )}
        </div>
      ))}

      {!checked && allPlaced && (
        <button
          onClick={() => setChecked(true)}
          className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition"
        >
          Check Answers
        </button>
      )}

      {checked && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground text-center">{correctCount}/{ABS_COMP_ITEMS.length} correct</p>
          <button
            onClick={() => onComplete(correctCount, ABS_COMP_ITEMS.length)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition"
          >
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Opportunity Cost Calculator
// ─────────────────────────────────────────────
// Country A: 8 wine, 16 cloth → OC of 1 wine = 2 cloth; OC of 1 cloth = 0.5 wine
// Country B: 4 wine, 12 cloth → OC of 1 wine = 3 cloth; OC of 1 cloth = 0.33 wine
const OC_STEPS = [
  {
    id: 1,
    question: "Country A produces 8 bottles of wine OR 16 yards of cloth per worker per day. What is the opportunity cost of 1 bottle of wine for Country A?",
    options: ["1 yard of cloth", "2 yards of cloth", "3 yards of cloth", "0.5 yards of cloth"],
    correct: 1,
    exp: "Country A can make 16 cloth or 8 wine — so 1 wine costs 16 ÷ 8 = 2 yards of cloth. Every wine bottle means giving up 2 yards.",
  },
  {
    id: 2,
    question: "Country B produces 4 bottles of wine OR 12 yards of cloth per worker per day. What is the opportunity cost of 1 bottle of wine for Country B?",
    options: ["2 yards of cloth", "1 yard of cloth", "3 yards of cloth", "4 yards of cloth"],
    correct: 2,
    exp: "Country B can make 12 cloth or 4 wine — so 1 wine costs 12 ÷ 4 = 3 yards of cloth. Country B gives up more cloth per wine than Country A.",
  },
  {
    id: 3,
    question: "Comparing the two countries: which has the lower opportunity cost for wine, and therefore comparative advantage in wine?",
    options: ["Country B — it gives up only 3 cloth per wine", "Country A — it gives up only 2 cloth per wine", "Both are equal", "Neither — absolute advantage determines specialization"],
    correct: 1,
    exp: "Country A gives up only 2 cloth per wine while Country B gives up 3. Lower OC → comparative advantage. Country A specializes in WINE.",
  },
  {
    id: 4,
    question: "Since Country A specializes in wine, which country has comparative advantage in cloth?",
    options: ["Country A — it makes more cloth too", "Country B — it gives up only 0.33 wine per yard of cloth", "Neither — they should produce both equally", "Country A — it has absolute advantage in both"],
    correct: 1,
    exp: "Country B's OC for cloth = 4 ÷ 12 ≈ 0.33 wine per yard. Country A's OC for cloth = 8 ÷ 16 = 0.5 wine per yard. Country B gives up less wine to make cloth — comparative advantage in CLOTH.",
  },
  {
    id: 5,
    question: "Country A has absolute advantage in BOTH wine and cloth (makes more of each). Should Country A still trade with Country B?",
    options: [
      "No — if you are better at everything, there is no reason to trade",
      "Yes — because every hour spent on cloth is an hour not spent on wine; trade lets Country A focus on wine and get cloth more cheaply",
      "Only if Country B pays a premium price",
      "No — trade only makes sense when one country lacks absolute advantage",
    ],
    correct: 1,
    exp: "Even with absolute advantage in both goods, Country A benefits from specialization in wine (its comparative advantage) and trading for cloth. Time is scarce — every hour on cloth is an hour not on wine. Comparative advantage, not absolute advantage, drives gains from trade.",
  },
];

function OCCalcStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const step = OC_STEPS[idx];
  const isLast = idx === OC_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    if (sel === step.correct) setScore((s) => s + 1);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Opportunity Cost Calculator</p>
        <p className="text-muted-foreground text-xs">
          To find comparative advantage, compute each country's opportunity cost for each good. The country with the <strong className="text-foreground">lower OC</strong> for a good has comparative advantage in it — and should specialize there.
        </p>
        {/* Reference table */}
        <div className="mt-3 rounded-lg overflow-hidden border border-border text-xs">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left px-3 py-2">Country</th>
                <th className="text-center px-3 py-2">Wine (bottles/day)</th>
                <th className="text-center px-3 py-2">Cloth (yards/day)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border bg-background">
                <td className="px-3 py-2 font-semibold">Country A</td>
                <td className="text-center px-3 py-2">8</td>
                <td className="text-center px-3 py-2">16</td>
              </tr>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-3 py-2 font-semibold">Country B</td>
                <td className="text-center px-3 py-2">4</td>
                <td className="text-center px-3 py-2">12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {idx + 1} of {OC_STEPS.length}</p>
          {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
        </div>
        <p className="text-sm font-semibold text-foreground">{step.question}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Step →
          </button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score + (sel === step.correct ? 1 : 0), OC_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — U.S. & Mexico Worked Example
// ─────────────────────────────────────────────
// US: 10,000 shoes OR 40,000 refrigerators (40 workers)
// Mexico: 8,000 shoes OR 10,000 refrigerators (40 workers)
// US OC shoe = 4 refrigerators; US OC refrigerator = 0.25 shoes
// Mexico OC shoe = 1.25 refrigerators; Mexico OC refrigerator = 0.8 shoes
const US_MEX_STEPS = [
  {
    id: 1,
    question: "With 40 workers, the U.S. can produce 10,000 shoes OR 40,000 refrigerators. What is the opportunity cost of 1 shoe for the United States?",
    options: ["0.25 refrigerators", "4 refrigerators", "10 refrigerators", "1.25 refrigerators"],
    correct: 1,
    exp: "The U.S. gives up 40,000 refrigerators to make 10,000 shoes, so 1 shoe costs 40,000 ÷ 10,000 = 4 refrigerators. Each shoe is expensive in terms of refrigerators foregone.",
  },
  {
    id: 2,
    question: "With 40 workers, Mexico can produce 8,000 shoes OR 10,000 refrigerators. What is the opportunity cost of 1 shoe for Mexico?",
    options: ["4 refrigerators", "0.8 refrigerators", "1.25 refrigerators", "2 refrigerators"],
    correct: 2,
    exp: "Mexico gives up 10,000 refrigerators to make 8,000 shoes, so 1 shoe costs 10,000 ÷ 8,000 = 1.25 refrigerators. Mexico's shoes are much cheaper in opportunity cost terms than U.S. shoes.",
  },
  {
    id: 3,
    question: "Which country has comparative advantage in shoes — and should specialize in producing them?",
    options: [
      "The United States — it can make more shoes (10,000 vs. 8,000)",
      "Mexico — it gives up only 1.25 refrigerators per shoe vs. the U.S.'s 4",
      "Neither — both give up refrigerators for shoes",
      "The United States — it has absolute advantage in both goods",
    ],
    correct: 1,
    exp: "Mexico's OC for shoes is only 1.25 refrigerators vs. the U.S.'s 4. Lower opportunity cost → comparative advantage. Mexico specializes in SHOES even though the U.S. makes more shoes in absolute terms.",
  },
  {
    id: 4,
    question: "What is the opportunity cost of 1 refrigerator for the United States?",
    options: ["4 shoes", "0.25 shoes", "1.25 shoes", "0.8 shoes"],
    correct: 1,
    exp: "Flip the shoe calculation: 1 refrigerator = 10,000 ÷ 40,000 = 0.25 shoes. The U.S. gives up only a quarter of a shoe per refrigerator — a very low cost. This is where the U.S. has comparative advantage.",
  },
  {
    id: 5,
    question: "Which country has comparative advantage in refrigerators?",
    options: [
      "Mexico — it has absolute advantage in neither good",
      "The United States — it gives up only 0.25 shoes per refrigerator vs. Mexico's 0.8",
      "Mexico — it gives up only 0.8 shoes per refrigerator",
      "Both equally — they should split production",
    ],
    correct: 1,
    exp: "U.S. OC for refrigerators = 0.25 shoes. Mexico's OC = 10,000 ÷ 8,000 = 0.8 shoes per refrigerator. The U.S. gives up far fewer shoes per refrigerator → comparative advantage in REFRIGERATORS.",
  },
];

function USMexicoStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const step = US_MEX_STEPS[idx];
  const isLast = idx === US_MEX_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    if (sel === step.correct) setScore((s) => s + 1);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-2">U.S. & Mexico — Shoes & Refrigerators</p>
        <div className="rounded-lg overflow-hidden border border-border text-xs">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left px-3 py-2">Country (40 workers)</th>
                <th className="text-center px-3 py-2">All Shoes</th>
                <th className="text-center px-3 py-2">All Refrigerators</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border bg-background">
                <td className="px-3 py-2 font-semibold">United States</td>
                <td className="text-center px-3 py-2">10,000</td>
                <td className="text-center px-3 py-2">40,000</td>
              </tr>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-3 py-2 font-semibold">Mexico</td>
                <td className="text-center px-3 py-2">8,000</td>
                <td className="text-center px-3 py-2">10,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs mt-2">The U.S. wins both columns — absolute advantage in both. But who should specialize in what?</p>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {idx + 1} of {US_MEX_STEPS.length}</p>
          {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
        </div>
        <p className="text-sm font-semibold text-foreground">{step.question}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Step →
          </button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score + (sel === step.correct ? 1 : 0), US_MEX_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Gains from Trade
// ─────────────────────────────────────────────
// Before: US 20/20 workers → 5,000 shoes + 20,000 refrig; Mexico 20/20 → 4,000 shoes + 5,000 refrig
// World total before: 9,000 shoes + 25,000 refrigerators
// After 100% specialization: US → 40,000 refrig + 0 shoes; Mexico → 8,000 shoes + 0 refrig
// World total after: 8,000 shoes + 40,000 refrig
// Partial shift: US moves 6 workers shoes→refrig: -1,500 shoes +6,000 refrig; Mexico moves 10 workers refrig→shoes: -2,500 refrig +2,000 shoes
// World: 9,000→9,500 shoes; 25,000→28,500 refrig
const GAINS_STEPS = [
  {
    id: 1,
    question: "Before trade, each country splits workers 50/50. The U.S. produces 5,000 shoes and 20,000 refrigerators; Mexico produces 4,000 shoes and 5,000 refrigerators. What is the world total output?",
    options: [
      "8,000 shoes and 40,000 refrigerators",
      "9,000 shoes and 25,000 refrigerators",
      "13,000 shoes and 25,000 refrigerators",
      "5,000 shoes and 20,000 refrigerators",
    ],
    correct: 1,
    exp: "World total before trade: 5,000 + 4,000 = 9,000 shoes and 20,000 + 5,000 = 25,000 refrigerators. This is the starting point.",
  },
  {
    id: 2,
    question: "If both countries fully specialize — the U.S. puts all 40 workers on refrigerators, Mexico puts all 40 on shoes — what is the new world output?",
    options: [
      "10,000 shoes and 40,000 refrigerators",
      "8,000 shoes and 40,000 refrigerators",
      "9,000 shoes and 25,000 refrigerators",
      "8,000 shoes and 10,000 refrigerators",
    ],
    correct: 1,
    exp: "U.S. makes 40,000 refrigerators (0 shoes); Mexico makes 8,000 shoes (0 refrigerators). World total: 8,000 shoes + 40,000 refrigerators. Refrigerators surge +15,000 — same workers, more output.",
  },
  {
    id: 3,
    question: "Instead of full specialization, the U.S. shifts 6 workers from shoes to refrigerators, gaining 6,000 more refrigerators but losing 1,500 shoes. Mexico shifts 10 workers from refrigerators to shoes, gaining 2,000 more shoes but losing 2,500 refrigerators. What happens to world output?",
    options: [
      "Both shoes and refrigerators fall",
      "Shoes rise by 500 and refrigerators rise by 3,500 — both goods increase",
      "Shoes rise but refrigerators fall",
      "Output is unchanged — workers just move between countries",
    ],
    correct: 1,
    exp: "Shoes: 9,000 + 500 = 9,500 (+500). Refrigerators: 25,000 + 3,500 = 28,500 (+3,500). With partial specialization, same workers produce MORE of both goods. This is the core gain from trade.",
  },
  {
    id: 4,
    question: "Suppose after full specialization, the U.S. exports 4,000 refrigerators to Mexico for 1,800 shoes. The U.S. ends up with 5,300 shoes and 22,000 refrigerators — compared to 5,000 shoes and 20,000 refrigerators before trade. What does this demonstrate?",
    options: [
      "The U.S. loses from trade because it had to give up refrigerators",
      "The U.S. consumes beyond its own PPF — more of both goods than it could produce alone",
      "Trade is zero-sum: Mexico must have lost what the U.S. gained",
      "Absolute advantage determines which country benefits more",
    ],
    correct: 1,
    exp: "The U.S. gains +300 shoes and +2,000 refrigerators vs. before trade — a consumption point outside its own PPF. Trade lets countries consume combinations impossible without specialization. And Mexico also gains: +200 shoes and +1,500 refrigerators.",
  },
];

function GainsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const step = GAINS_STEPS[idx];
  const isLast = idx === GAINS_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    if (sel === step.correct) setScore((s) => s + 1);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Gains from Specialization</p>
        <p className="text-muted-foreground text-xs">
          When countries shift workers toward their comparative advantage, world output rises. Both countries can then consume combinations of goods <strong className="text-foreground">beyond their own PPF</strong> — more than they could produce alone.
        </p>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {idx + 1} of {GAINS_STEPS.length}</p>
          {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
        </div>
        <p className="text-sm font-semibold text-foreground">{step.question}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Step →
          </button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score + (sel === step.correct ? 1 : 0), GAINS_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Terms of Trade
// ─────────────────────────────────────────────
const TERMS_STEPS = [
  {
    id: 1,
    question: "At home (no trade), the U.S. gives up 0.25 shoes to make 1 refrigerator. The U.S. will only export refrigerators if it receives MORE than 0.25 shoes per refrigerator. Why?",
    options: [
      "Because the U.S. wants to maximize shoes, not refrigerators",
      "Because 0.25 shoes is the U.S.'s domestic opportunity cost — receiving less than that would make trade worse than self-sufficiency",
      "Because international prices are always higher than domestic prices",
      "Because Mexico sets the terms of trade unilaterally",
    ],
    correct: 1,
    exp: "The U.S. domestic OC for refrigerators is 0.25 shoes. If the U.S. gets MORE than 0.25 shoes per refrigerator through trade, it's doing better than if it had produced the shoes itself. Anything below 0.25 and the U.S. is better off not trading.",
  },
  {
    id: 2,
    question: "At home (no trade), Mexico gives up 0.8 shoes to make 1 refrigerator (since 1 refrigerator = 10,000/8,000 shoes ≈ 0.8 shoes given up for Mexico). Mexico will only import refrigerators if the price is LESS than 0.8 shoes per refrigerator. Why?",
    options: [
      "Because Mexico can only afford cheap refrigerators",
      "Because 0.8 shoes is Mexico's domestic OC — buying refrigerators at less than 0.8 shoes is cheaper than making them at home",
      "Because the WTO sets maximum prices for trade",
      "Because the U.S. controls pricing",
    ],
    correct: 1,
    exp: "Mexico's domestic cost of making 1 refrigerator is 0.8 shoes. If Mexico can import refrigerators for LESS than 0.8 shoes each, it's cheaper to trade than produce at home. Any price above 0.8 and Mexico is better off making its own.",
  },
  {
    id: 3,
    question: "The mutually beneficial range is 0.25 < price < 0.8 shoes per refrigerator. Which of the following prices would benefit BOTH countries?",
    options: [
      "0.20 shoes per refrigerator",
      "0.90 shoes per refrigerator",
      "0.50 shoes per refrigerator",
      "Exactly 0.25 shoes per refrigerator",
    ],
    correct: 2,
    exp: "0.50 is between 0.25 and 0.8 — it's above the U.S.'s minimum (so the U.S. gains) and below Mexico's maximum (so Mexico gains). Any price in this range makes both countries better off than self-sufficiency.",
  },
  {
    id: 4,
    question: "What determines where in the mutually beneficial range (0.25 to 0.8) the actual terms of trade fall?",
    options: [
      "The country with greater military power sets the price",
      "The country with absolute advantage always captures the larger gain",
      "World supply and demand, plus bargaining power and negotiation",
      "The IMF sets international trade prices",
    ],
    correct: 2,
    exp: "The actual terms of trade within the mutually beneficial range are determined by world supply and demand, plus the relative bargaining power and size of each economy. Economics sets the boundaries (0.25–0.8); markets and negotiation determine the exact price within that range.",
  },
];

function TermsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const step = TERMS_STEPS[idx];
  const isLast = idx === TERMS_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    if (sel === step.correct) setScore((s) => s + 1);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Terms of Trade</p>
        <p className="text-muted-foreground text-xs mb-2">
          The <strong className="text-foreground">terms of trade</strong> is the rate at which countries exchange goods. For both countries to benefit, the price must fall between their domestic opportunity costs.
        </p>
        <div className="bg-background border border-border rounded-lg p-3 text-xs text-center">
          <p className="font-semibold text-foreground">Mutually Beneficial Range</p>
          <p className="text-primary font-bold text-base mt-1">0.25 &lt; price &lt; 0.8 shoes per refrigerator</p>
          <p className="text-muted-foreground mt-1">U.S. domestic OC: 0.25 shoes&nbsp;&nbsp;|&nbsp;&nbsp;Mexico domestic OC: 0.8 shoes</p>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {idx + 1} of {TERMS_STEPS.length}</p>
          {score > 0 && <span className="text-xs font-semibold text-green-700">{score} correct so far</span>}
        </div>
        <p className="text-sm font-semibold text-foreground">{step.question}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Incorrect — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Step →
          </button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score + (sel === step.correct ? 1 : 0), TERMS_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Mark Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Flashcards
// ─────────────────────────────────────────────
type Flashcard = {
  id: number;
  type: "standard" | "cloze";
  front: string;
  back: string;
  hint: string;
};

const CH20_CARDS: Flashcard[] = [
  {
    id: 1, type: "standard",
    front: "What is Absolute Advantage?",
    back: "A country has absolute advantage when it produces MORE output from the same inputs — more output per worker than another country.\n\nExample: Saudi Arabia in oil (geology), Iowa in corn (soil/climate), Switzerland in watches (skill).\n\nSources: technology, climate, geography, capital stock, education.",
    hint: "Think: who is simply MORE productive?",
  },
  {
    id: 2, type: "standard",
    front: "What is Comparative Advantage?",
    back: "A country has comparative advantage when it gives up LESS of other goods to produce one more unit of this good — lower opportunity cost.\n\nThis is what actually drives trade. Even a country with absolute advantage in everything still gains from specializing where its comparative advantage is greatest.",
    hint: "Think: who gives up LESS to produce this good?",
  },
  {
    id: 3, type: "cloze",
    front: "Complete: A country should specialize in the good where it has the _______ opportunity cost.",
    back: "Lowest opportunity cost.\n\nComparative advantage = lower OC than your trading partner for that good. Specialize there, trade for the rest.",
    hint: "Lower OC = comparative advantage = specialize there.",
  },
  {
    id: 4, type: "standard",
    front: "How do you calculate opportunity cost from a production table?",
    back: "Divide: (maximum output of Good B) ÷ (maximum output of Good A) = OC of 1 unit of Good A in terms of Good B.\n\nExample — U.S.: 40,000 refrigerators ÷ 10,000 shoes = 4 refrigerators per shoe.\nMexico: 10,000 refrigerators ÷ 8,000 shoes = 1.25 refrigerators per shoe.\n\nWhichever country has the lower ratio for a good has comparative advantage in it.",
    hint: "Divide the other good's max by this good's max.",
  },
  {
    id: 5, type: "standard",
    front: "U.S. & Mexico: Who specializes in what, and why?",
    back: "U.S. specializes in REFRIGERATORS:\nOC of 1 refrigerator = 0.25 shoes (very low)\n\nMexico specializes in SHOES:\nOC of 1 shoe = 1.25 refrigerators (much lower than the U.S.'s 4)\n\nEven though the U.S. makes more of both — absolute advantage in both — Mexico's comparative advantage in shoes is what drives specialization.",
    hint: "U.S. = refrigerators (0.25 shoes each). Mexico = shoes (1.25 refrig each).",
  },
  {
    id: 6, type: "standard",
    front: "What are the Gains from Specialization?",
    back: "When countries specialize according to comparative advantage:\n• World output rises (same workers produce more)\n• Each country can consume BEYOND its own PPF\n• Both countries gain more of both goods than under self-sufficiency\n\nSlide example: Before trade — 9,000 shoes + 25,000 refrigerators. After specialization — 8,000 shoes + 40,000 refrigerators. Same workers, +15,000 refrigerators.",
    hint: "Specialization → more world output → both countries consume beyond their PPF.",
  },
  {
    id: 7, type: "standard",
    front: "What is the Terms of Trade?",
    back: "The terms of trade is the rate at which countries exchange goods.\n\nFor BOTH countries to gain, the price must fall BETWEEN their domestic opportunity costs:\n\n0.25 < price < 0.8 shoes per refrigerator\n\n(U.S. domestic OC: 0.25 shoes; Mexico domestic OC: 0.8 shoes)\n\nThe actual rate is set by world supply, demand, and bargaining power.",
    hint: "Mutually beneficial range: between the two countries' domestic OCs.",
  },
  {
    id: 8, type: "cloze",
    front: "Complete: The mutually beneficial range for trade is any price _______ each country's domestic opportunity cost.",
    back: "Between each country's domestic opportunity costs.\n\nThe exporter gains if the world price exceeds its domestic OC. The importer gains if the world price is below its domestic OC. Both gain when the price falls in the range between the two.",
    hint: "Exporter wants MORE than its domestic OC; importer wants LESS than its domestic OC.",
  },
  {
    id: 9, type: "standard",
    front: "The Camping Analogy — Jethro",
    back: "Jethro is faster at carrying gear, building fires, cooking, AND setting up tents than his 5 camping friends.\n\nShould he do everything?\n\nNo — Jethro has only 24 hours and two hands. Every minute on firewood is a minute not cooking. He should focus on the task where his advantage is GREATEST.\n\nThe others handle tasks where their disadvantage is SMALLEST.\n\nSame logic for nations: a high-productivity country focuses on what it is relatively BEST at — not on doing everything.",
    hint: "Even a super-camper can't do everything. Specialize where your relative edge is biggest.",
  },
  {
    id: 10, type: "standard",
    front: "\"If they win, we lose\" — the zero-sum objection. How does economics respond?",
    back: "This objection treats trade like a sports contest — but trade is exchange, not competition.\n\nAt the NATIONAL level: trade is positive-sum. We proved it — both countries consume more after specialization.\n\nNo one forces a trade. If both sides agree, both expect to gain — otherwise the trade wouldn't happen.\n\nCaveat: At the WORKER and INDUSTRY level, gains are unevenly distributed. Some industries shrink even as the country as a whole gains. The politics of distribution is real, even if the math is clear.",
    hint: "National level = positive sum. Worker/industry level = uneven. Trade is exchange, not competition.",
  },
  {
    id: 11, type: "cloze",
    front: "Complete: Benjamin Franklin said '_______ was ever ruined by trade.' David Ricardo provided the formal proof in _______.",
    back: "'No nation was ever ruined by trade.' — Benjamin Franklin\n\nDavid Ricardo formalized the proof in 1817. Two centuries on, comparative advantage remains one of the most counterintuitive results in all of economics.",
    hint: "Franklin quote + Ricardo's year.",
  },
  {
    id: 12, type: "standard",
    front: "Wine & Cloth example: Country A (8 wine, 16 cloth) vs. Country B (4 wine, 12 cloth). Who specializes where?",
    back: "Country A OC of 1 wine = 16 ÷ 8 = 2 cloth\nCountry B OC of 1 wine = 12 ÷ 4 = 3 cloth\n\nCountry A has lower OC for wine → specializes in WINE.\n\nCountry B OC of 1 cloth = 4 ÷ 12 ≈ 0.33 wine\nCountry A OC of 1 cloth = 8 ÷ 16 = 0.5 wine\n\nCountry B has lower OC for cloth → specializes in CLOTH.\n\nNote: Country A has absolute advantage in BOTH, but comparative advantage only in wine.",
    hint: "Compute OC for each good in each country. Lower OC = specialize there.",
  },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH20_CARDS]);
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
    advance();
  }

  function handleReview() {
    setReviewIds((prev) => new Set([...prev, card.id]));
    advance();
  }

  function advance() {
    setFlipped(false);
    if (cardIdx < deck.length - 1) setCardIdx((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Flashcard Mastery — Ch20 International Trade</p>
        <p className="text-muted-foreground text-xs">Work through all {total} cards. Mark each as Mastered or Review. Complete all cards to unlock the quiz.</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-green-700 font-semibold">✓ Mastered: {masteredCount}</span>
          <span className="text-amber-700 font-semibold">↩ Review: {reviewIds.size}</span>
          <span className="text-muted-foreground">Remaining: {total - masteredIds.size - reviewIds.size}</span>
        </div>
      </div>

      {!allDone ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">Card {cardIdx + 1} of {total}</p>
          <div
            onClick={() => setFlipped((f) => !f)}
            className="bg-card border-2 border-border rounded-2xl p-6 min-h-[180px] cursor-pointer flex flex-col justify-between hover:border-primary transition"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {flipped ? "Answer" : card.type === "cloze" ? "Fill in the blank" : "Question"}
              </p>
              <p className="text-sm font-semibold text-foreground whitespace-pre-line">
                {flipped ? card.back : stripCloze(card.front)}
              </p>
            </div>
            {!flipped && (
              <p className="text-xs text-muted-foreground italic mt-3">Hint: {card.hint}</p>
            )}
            <p className="text-xs text-primary mt-3 text-right">{flipped ? "Click to flip back" : "Click to reveal answer"}</p>
          </div>
          {flipped && (
            <div className="flex gap-3">
              <button
                onClick={handleReview}
                className="flex-1 py-2.5 border-2 border-amber-400 text-amber-700 rounded-xl font-semibold text-sm hover:bg-amber-50 transition"
              >
                ↩ Review Again
              </button>
              <button
                onClick={handleMastered}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition"
              >
                ✓ Mastered
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold text-sm">All {total} cards complete!</p>
            <p className="text-green-700 text-xs mt-1">{masteredCount}/{total} mastered · {reviewIds.size} flagged for review</p>
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch20 deck. The quiz is now unlocked.</p>
          </div>
          <button type="button" onClick={() => onComplete(masteredCount, total)}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  // Absolute vs Comparative
  {
    q: "A country has absolute advantage when it:",
    options: [
      "Has a lower opportunity cost for producing a good",
      "Produces more output from the same inputs than another country",
      "Exports more than it imports",
      "Can produce every good more cheaply",
    ],
    correct: 1,
    exp: "Absolute advantage means producing more output (wine, cloth, shoes) from the same labor, land, and capital. It is a productivity measure, not an opportunity cost measure.",
  },
  {
    q: "A country has comparative advantage in a good when it:",
    options: [
      "Makes more of that good than any other country",
      "Has the lowest opportunity cost for producing that good",
      "Has absolute advantage in all goods",
      "Exports that good to every trading partner",
    ],
    correct: 1,
    exp: "Comparative advantage means lower opportunity cost — giving up less of other goods to produce one more unit. This is the concept that actually drives the gains from trade.",
  },
  {
    q: "Country A can produce 8 wine OR 16 cloth per worker. Country B can produce 4 wine OR 12 cloth per worker. Country A has absolute advantage in:",
    options: [
      "Wine only",
      "Cloth only",
      "Both wine and cloth",
      "Neither — Country B has absolute advantage",
    ],
    correct: 2,
    exp: "Country A makes more of both goods per worker (8 > 4 wine; 16 > 12 cloth). That is absolute advantage in both goods — more output from the same inputs.",
  },
  {
    q: "Using the same Country A (8 wine, 16 cloth) and Country B (4 wine, 12 cloth) example: who has comparative advantage in cloth?",
    options: [
      "Country A — it makes more cloth (16 vs. 12)",
      "Country B — its OC of cloth is 0.33 wine vs. Country A's 0.5 wine",
      "Country A — it has absolute advantage in cloth",
      "Neither — OC is the same for both",
    ],
    correct: 1,
    exp: "Country B OC of cloth = 4 ÷ 12 ≈ 0.33 wine per yard. Country A OC of cloth = 8 ÷ 16 = 0.5 wine per yard. Country B gives up less wine to make cloth — comparative advantage in cloth.",
  },
  // US-Mexico numbers
  {
    q: "The U.S. can produce 10,000 shoes OR 40,000 refrigerators (40 workers). What is the U.S. opportunity cost of 1 shoe?",
    options: ["0.25 refrigerators", "4 refrigerators", "10 refrigerators", "1.25 refrigerators"],
    correct: 1,
    exp: "40,000 refrigerators ÷ 10,000 shoes = 4 refrigerators per shoe. Each U.S. shoe costs 4 refrigerators in foregone production.",
  },
  {
    q: "Mexico can produce 8,000 shoes OR 10,000 refrigerators (40 workers). What is Mexico's opportunity cost of 1 refrigerator?",
    options: ["1.25 shoes", "0.8 shoes", "4 shoes", "0.25 shoes"],
    correct: 1,
    exp: "8,000 shoes ÷ 10,000 refrigerators = 0.8 shoes per refrigerator. Mexico gives up 0.8 shoes for every refrigerator it makes.",
  },
  {
    q: "Given U.S. OC for refrigerators = 0.25 shoes and Mexico OC for refrigerators = 0.8 shoes, which country should specialize in refrigerators?",
    options: [
      "Mexico — it makes fewer refrigerators so it should focus there",
      "The United States — 0.25 shoes is the lower opportunity cost",
      "Both equally — split production 50/50",
      "Neither — refrigerators should be imported from a third country",
    ],
    correct: 1,
    exp: "Lower OC → comparative advantage → specialize there. The U.S. gives up only 0.25 shoes per refrigerator; Mexico gives up 0.8. The U.S. has comparative advantage in refrigerators.",
  },
  // Gains from trade
  {
    q: "Before trade, the U.S. and Mexico each split workers 50/50 between shoes and refrigerators. The U.S. produces 5,000 shoes + 20,000 refrigerators; Mexico produces 4,000 shoes + 5,000 refrigerators. What is world output?",
    options: [
      "5,000 shoes + 20,000 refrigerators",
      "9,000 shoes + 25,000 refrigerators",
      "8,000 shoes + 40,000 refrigerators",
      "13,000 shoes + 45,000 refrigerators",
    ],
    correct: 1,
    exp: "5,000 + 4,000 = 9,000 shoes; 20,000 + 5,000 = 25,000 refrigerators. This is the pre-specialization world output baseline.",
  },
  {
    q: "After full specialization (U.S. → all refrigerators; Mexico → all shoes), world output is 8,000 shoes + 40,000 refrigerators. Compared to the pre-specialization baseline of 9,000 shoes + 25,000 refrigerators, what happened?",
    options: [
      "Both goods increased",
      "Refrigerators rose by 15,000 but shoes fell by 1,000 — more of the important good",
      "Both goods fell — specialization reduces total output",
      "Output is unchanged — the same workers produced the same total",
    ],
    correct: 1,
    exp: "With full specialization: shoes fall 1,000 (9,000→8,000) but refrigerators surge 15,000 (25,000→40,000). Same labor force, dramatically more refrigerators. The world consumes more overall.",
  },
  {
    q: "Trade lets each country consume beyond its own PPF. This means:",
    options: [
      "Countries consume less of one good to get more of the other",
      "Countries can consume combinations of goods impossible to produce alone",
      "Only the larger economy benefits from moving beyond its PPF",
      "Production possibilities expand only for developing countries",
    ],
    correct: 1,
    exp: "After trade: the U.S. ends up with 5,300 shoes and 22,000 refrigerators — more of BOTH than it produced alone (5,000 + 20,000). That combination is outside the U.S. PPF. Trade makes it achievable.",
  },
  // Terms of trade
  {
    q: "The mutually beneficial range for trade between the U.S. and Mexico is 0.25 < price < 0.8 shoes per refrigerator. If the actual terms of trade are 0.5 shoes per refrigerator, which of the following is true?",
    options: [
      "Only the U.S. benefits — 0.5 is closer to 0.25",
      "Only Mexico benefits — 0.5 is less than 0.8",
      "Both countries benefit — 0.5 is above the U.S. minimum and below Mexico's maximum",
      "Neither benefits — the price must equal one country's domestic OC exactly",
    ],
    correct: 2,
    exp: "0.5 > 0.25 (U.S. gets more shoes per refrigerator than its domestic OC → U.S. gains). 0.5 < 0.8 (Mexico pays fewer shoes per refrigerator than its domestic cost of making them → Mexico gains). Both gain.",
  },
  {
    q: "What determines the actual terms of trade within the mutually beneficial range?",
    options: [
      "The country with absolute advantage sets the price",
      "The WTO mandates a fixed global price",
      "World supply and demand, plus bargaining power",
      "The domestic opportunity cost of the importing country",
    ],
    correct: 2,
    exp: "Economics defines the mutually beneficial range (0.25 to 0.8). Where in that range the price actually falls is determined by world supply and demand and the relative bargaining power of the trading partners.",
  },
  // Camping analogy / objections
  {
    q: "In the camping analogy, Jethro is faster at carrying gear, building fires, cooking, AND setting up tents. Why should he still specialize?",
    options: [
      "Because his friends will refuse to work otherwise",
      "Because he has only 24 hours and two hands — every minute on one task is a minute not on his best task",
      "Because the law requires equal division of labor",
      "Because he has absolute advantage only in cooking",
    ],
    correct: 1,
    exp: "Jethro should focus where his relative advantage is greatest. Even if he is better at everything, time is scarce — every minute on firewood is a minute not cooking. The others handle tasks where their disadvantage is smallest. Same logic applies to nations.",
  },
  {
    q: "Politicians often say trade is a contest where 'if they win, we lose.' What does economics say about this at the national level?",
    options: [
      "It's correct — trade is zero-sum; one country's gain is another's loss",
      "Trade is positive-sum at the national level — both countries consume more after specialization",
      "It depends on which country has absolute advantage",
      "Trade only benefits the country that runs a trade surplus",
    ],
    correct: 1,
    exp: "Trade is exchange, not competition. At the national level it is positive-sum — we proved it: both countries consume more. No one forces a trade; if both sides agree, both expect to gain. The distributional effects within a country are a separate (real) political question.",
  },
  {
    q: "David Ricardo's 1817 proof of comparative advantage is described as 'the most counterintuitive result in economics.' Why is it counterintuitive?",
    options: [
      "Because it shows that protectionism always raises wages",
      "Because it shows that even a country with absolute advantage in EVERYTHING still gains from specializing and trading",
      "Because it proves that free trade always eliminates unemployment",
      "Because it shows that larger countries always benefit more from trade than smaller ones",
    ],
    correct: 1,
    exp: "The counterintuitive insight: even if the U.S. (or any country) is more productive at making EVERY good, it still gains from specializing in its comparative advantage and trading. Absolute advantage doesn't determine trade — opportunity cost does. Two centuries later, this still surprises students.",
  },
];

function QuizStation({
  onPass,
  onFail,
}: {
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
    setResults((r) => [...r, { correct, exp: q.exp }]);
    setChecked(true);
  }

  function handleNext() {
    setSel(null);
    setChecked(false);
    setIdx((i) => i + 1);
  }

  function handleFinish() {
    const finalResults = [...results];
    const score = finalResults.filter((r) => r.correct).length;
    if (score >= 9) onPass(score, finalResults);
    else onFail();
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground">Chapter 20 Quiz</p>
        <p className="text-muted-foreground text-xs">10 questions — score 9 or higher to pass. One attempt per session.</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of 10</p>
          <span className="text-xs text-muted-foreground">{results.filter((r) => r.correct).length} correct</span>
        </div>
        <p className="text-sm font-semibold text-foreground">{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={`q${idx}-opt${i}`}
              disabled={checked}
              onClick={() => setSel(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === q.correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== q.correct
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
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
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Check Answer
          </button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Next Question →
          </button>
        )}
        {checked && isLast && (
          <button onClick={handleFinish} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Results Screen
// ─────────────────────────────────────────────
const STATION_LABELS: Record<string, string> = {
  abscomp: "Absolute vs. Comparative Advantage",
  occalc: "Opportunity Cost Calculator",
  usmexico: "U.S. & Mexico Worked Example",
  gains: "Gains from Specialization",
  terms: "Terms of Trade",
  flash: "Flashcard Mastery",
};

function ResultsScreen({
  score,
  results,
  sectionScores,
  onRestart,
  courseTitle,
}: {
  score: number;
  results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void;
  courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");

  const stationRows = Object.entries(STATION_LABELS)
    .filter(([id]) => sectionScores[id])
    .map(([id, label]) => ({ label, ...sectionScores[id] }));

  function printPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    const stationTableRows = stationRows
      .map(
        (r) =>
          `<tr><td>${r.label}</td><td style="text-align:center">${r.score}/${r.total}</td><td style="text-align:center">${r.score === r.total ? "\u2713" : r.score >= r.total * 0.7 ? "Good" : "Review"}</td></tr>`
      )
      .join("");
    win.document.write(`
      <html><head><title>ECO 210 Ch20 Results</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#1e293b;padding:20px}
        h1{color:hsl(222,42%,19%);font-size:1.4rem;margin-bottom:4px}
        h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}
        h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}
        .score{background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:16px;text-align:center;margin:20px 0}
        .score p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}
        table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}
        th{background:hsl(222,42%,19%);color:#fff;padding:8px 10px;text-align:left}
        td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
        tr:nth-child(even) td{background:#f8fafc}
        .q{border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:10px}
        .correct{border-left:4px solid #22c55e}.wrong{border-left:4px solid #f87171}
        .label{font-size:0.7rem;font-weight:bold;text-transform:uppercase;color:#64748b}
        .exp{font-size:0.8rem;color:#475569;margin-top:6px}
        .exit{background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:16px}
        footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}
      </style></head><body>
      <h1>${courseTitle}</h1>
      <h2>Chapter 20 — International Trade</h2>
      <p style="font-size:0.9rem;color:#475569">Student: <strong>${name}</strong> &nbsp;&nbsp; Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      <div class="score"><p>Quiz Score: ${score}/10 — ${score >= 9 ? "PASSED \u2713" : "Not Yet"}</p></div>
      ${stationTableRows ? `
        <h3>Station Scores</h3>
        <table><thead><tr><th>Station</th><th>Score</th><th>Status</th></tr></thead><tbody>${stationTableRows}</tbody></table>` : ""}
      <h3>Quiz Question Review</h3>
      ${results
        .map(
          (r, i) => `
        <div class="q ${r.correct ? "correct" : "wrong"}">
          <div class="label">${r.correct ? "\u2713 Correct" : "\u2717 Incorrect"} \u2014 Question ${i + 1}</div>
          <div class="exp">${r.exp}</div>
        </div>`
        )
        .join("")}
      ${
        exitTicket.trim()
          ? `<div class="exit"><div class="label">Exit Ticket</div><p style="font-size:0.85rem;margin:6px 0 0">${exitTicket}</p></div>`
          : ""
      }
      <footer>Access for free at https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction</footer>
      </body></html>`);
    win.document.close();
    win.print();
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-card border-2 border-border rounded-2xl p-5 text-center space-y-1">
        <p className="text-4xl font-bold text-foreground">{score}/10</p>
        <p className="text-sm text-muted-foreground">Chapter 20 Quiz</p>
        <p className={`text-base font-bold ${score >= 9 ? "text-green-700" : "text-amber-700"}`}>
          {score >= 9 ? "Excellent — Chapter 20 Complete! ✓" : "Keep Reviewing — You Need 9/10"}
        </p>
      </div>

      {stationRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Station Scores</p>
          <div className="space-y-2">
            {stationRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-bold ${
                  r.score === r.total ? "text-green-700" : r.score >= r.total * 0.7 ? "text-amber-700" : "text-red-600"
                }`}>{r.score}/{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <label htmlFor="result-name" className="text-sm font-semibold text-foreground block">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="result-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block">
          Exit Ticket <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </label>
        <p className="text-xs text-muted-foreground">In one sentence, explain why a country with absolute advantage in everything still benefits from trade.</p>
        <textarea
          id="exit-ticket"
          value={exitTicket}
          onChange={(e) => setExitTicket(e.target.value)}
          rows={3}
          placeholder="Type your answer here…"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2">
        <button
          onClick={printPDF}
          disabled={!name.trim()}
          className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold transition"
        >
          Print Results PDF
        </button>
        <button
          onClick={onRestart}
          className="w-full py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm transition"
        >
          Start Over
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Quiz Question Review</p>
        {results.map((r, i) => (
          <div key={i} className={`border rounded-xl p-3 text-xs ${r.correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
            <p className={`font-semibold mb-1 ${r.correct ? "text-green-800" : "text-red-800"}`}>
              {r.correct ? "✓ Correct" : "✗ Incorrect"} — Question {i + 1}
            </p>
            <p className={r.correct ? "text-green-700" : "text-red-700"}>{r.exp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Intro / Dashboard
// ─────────────────────────────────────────────
const STATION_ORDER: Station[] = ["abscomp", "occalc", "usmexico", "gains", "terms", "flash"];

const STATION_META: Record<Station, { label: string; icon: string; description: string }> = {
  intro: { label: "Intro", icon: "🏠", description: "" },
  abscomp: { label: "Absolute vs. Comparative", icon: "⚖️", description: "Classify examples by type of advantage" },
  occalc: { label: "OC Calculator", icon: "🔢", description: "Compute opportunity costs from a production table" },
  usmexico: { label: "U.S. & Mexico", icon: "🌎", description: "Work through the shoes & refrigerators example" },
  gains: { label: "Gains from Trade", icon: "📈", description: "Trace how specialization raises world output" },
  terms: { label: "Terms of Trade", icon: "🤝", description: "Identify the mutually beneficial price range" },
  flash: { label: "Flashcards", icon: "🃏", description: "Master all key Ch20 concepts" },
  quiz: { label: "Quiz", icon: "📝", description: "10 questions — score 9/10 to pass" },
  results: { label: "Results", icon: "🏆", description: "" },
  "not-yet": { label: "Not Yet", icon: "⏳", description: "" },
};

function IntroScreen({
  completed,
  sectionScores,
  onStart,
  onSummary,
  courseTitle,
  courseSubtitle,
  hubUrl,
}: {
  completed: Set<Station>;
  sectionScores: Record<string, { score: number; total: number }>;
  onStart: (s: Station) => void;
  onSummary: () => void;
  courseTitle: string;
  courseSubtitle: string;
  hubUrl: string;
}) {
  const allStationsDone = STATION_ORDER.every((s) => completed.has(s));

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{courseTitle}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">Chapter 20</h1>
          <p className="text-base text-muted-foreground">International Trade</p>
          <p className="text-xs text-muted-foreground mt-1">Comparative advantage, opportunity cost, and the gains from specialization</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onSummary}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition"
          >
            Chapter Summary
          </button>
          <a
            href={hubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-border hover:bg-muted/30 text-muted-foreground rounded-lg text-sm font-semibold transition"
          >
            ← Back to Hub
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STATION_ORDER.map((s) => {
          const meta = STATION_META[s];
          const done = completed.has(s);
          const sc = sectionScores[s];
          return (
            <button
              key={s}
              onClick={() => onStart(s)}
              className={`rounded-xl border-2 p-3 text-left transition space-y-1 ${
                done
                  ? "border-green-400 bg-green-50"
                  : "border-border bg-card hover:border-primary"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{meta.icon}</span>
                {done && sc && (
                  <span className="text-xs font-bold text-green-700">{sc.score}/{sc.total} ✓</span>
                )}
                {done && !sc && (
                  <span className="text-xs font-bold text-green-700">✓</span>
                )}
              </div>
              <p className={`text-xs font-semibold ${done ? "text-green-800" : "text-foreground"}`}>{meta.label}</p>
              <p className="text-xs text-muted-foreground leading-tight">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <div className={`border-2 rounded-xl p-4 transition ${
        allStationsDone
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/20 opacity-60"
      }`}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-foreground">📝 Chapter Quiz</p>
          {!allStationsDone && <span className="text-xs text-muted-foreground">Complete all stations to unlock</span>}
          {allStationsDone && <span className="text-xs text-green-700 font-semibold">Unlocked ✓</span>}
        </div>
        <p className="text-xs text-muted-foreground mb-3">10 questions drawn from a pool — score 9/10 to pass</p>
        <button
          disabled={!allStationsDone}
          onClick={() => onStart("quiz")}
          className="w-full py-2.5 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground rounded-xl font-semibold text-sm transition"
        >
          {allStationsDone ? "Start Quiz →" : "Locked"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {completed.size} of {STATION_ORDER.length} stations complete
      </p>

      <p className="text-xs text-muted-foreground text-center">
        Based on <a href="https://openstax.org/books/principles-macroeconomics-3e/pages/1-introduction" target="_blank" rel="noopener noreferrer" className="underline text-primary">OpenStax Macroeconomics 3e</a>
      </p>

      <p className="text-xs text-muted-foreground text-center">
        <span className="italic">{courseSubtitle}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main EconLab
// ─────────────────────────────────────────────
export default function EconLab({
  courseTitle,
  courseSubtitle,
  hubUrl,
}: {
  courseTitle: string;
  courseSubtitle: string;
  hubUrl: string;
}) {
  const [station, setStation] = useState<Station>("intro");
  const [completed, setCompleted] = useState<Set<Station>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Station[]);
    } catch {
      return new Set();
    }
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
      setSectionScores((prev) => ({ ...prev, [s]: { score, total } }));
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
    setStation("intro");
  }

  return (
    <div className="min-h-screen bg-background">
      <header style={{ background: "hsl(222,42%,19%)" }} className="text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{courseTitle}</p>
          <p className="font-bold text-sm">ECONLAB · Chapter 20 — International Trade</p>
        </div>
        {station !== "intro" && (
          <button
            onClick={() => setStation("intro")}
            className="text-xs border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition"
          >
            ← Dashboard
          </button>
        )}
      </header>

      {showSummary && (
        <SummaryModal onClose={() => setShowSummary(false)} courseTitle={courseTitle} />
      )}

      <main className="px-4 py-6">
        {station === "intro" && (
          <IntroScreen
            completed={completed}
            sectionScores={sectionScores}
            onStart={setStation}
            onSummary={() => setShowSummary(true)}
            courseTitle={courseTitle}
            courseSubtitle={courseSubtitle}
            hubUrl={hubUrl}
          />
        )}
        {station === "abscomp" && (
          <AbsCompStation onComplete={(score, total) => markDone("abscomp", score, total)} />
        )}
        {station === "occalc" && (
          <OCCalcStation onComplete={(score, total) => markDone("occalc", score, total)} />
        )}
        {station === "usmexico" && (
          <USMexicoStation onComplete={(score, total) => markDone("usmexico", score, total)} />
        )}
        {station === "gains" && (
          <GainsStation onComplete={(score, total) => markDone("gains", score, total)} />
        )}
        {station === "terms" && (
          <TermsStation onComplete={(score, total) => markDone("terms", score, total)} />
        )}
        {station === "flash" && (
          <FlashcardStation onComplete={(score, total) => markDone("flash", score, total)} />
        )}
        {station === "quiz" && (
          <QuizStation
            onPass={(score, results) => {
              setQuizScore(score);
              setQuizResults(results);
              markDone("quiz", score, 10);
              setStation("results");
            }}
            onFail={() => setStation("not-yet")}
          />
        )}
        {station === "not-yet" && (
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: "#FEF3C7" }}>
              <p className="text-4xl">📚</p>
              <h2 className="text-xl font-bold text-amber-900">Not Yet</h2>
              <p className="text-amber-800 text-sm">You need 9 out of 10 to pass. Review the stations and try again.</p>
              <p className="text-amber-700 text-xs font-semibold">This screen cannot be submitted. Only the final Results screen counts.</p>
              <button
                onClick={() => setStation("intro")}
                className="w-full py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
        {station === "results" && (
          <ResultsScreen
            score={quizScore}
            results={quizResults}
            sectionScores={sectionScores}
            onRestart={() => setStation("intro")}
            courseTitle={courseTitle}
          />
        )}
      </main>
    </div>
  );
}
