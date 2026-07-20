import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "enrichment"
  | "institutions"
  | "inputs"
  | "accounting"
  | "rule70"
  | "convergence"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch7";

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
// Station 1 — The Great Enrichment
// ─────────────────────────────────────────────
const ENRICHMENT_QS = [
  {
    q: "Your slides show that average global income was about $3/day in 1800 — true of Rome, Ming China, and medieval England alike. What does today's $35+/day global average represent?",
    options: [
      "A redistribution of wealth from rich to poor countries over 200 years",
      "More than 10× improvement in real living standards driven by 200 years of compounding growth",
      "An increase in nominal prices due to inflation, not real output gains",
      "Growth limited to a few wealthy nations — most people still earn $3/day",
    ],
    correct: 1,
    exp: "The Great Enrichment: from $3/day (1800) to $35+/day today — a 10× real increase in average living standards globally, driven entirely by 200 years of compounding economic growth. For industrialized economies the multiplier is far higher.",
  },
  {
    q: "Your slides frame modern economic growth using a 24-hour clock analogy. If all of human history is compressed into one day, when does the Industrial Revolution begin?",
    options: [
      "Around noon — growth has been steady for the past 12 hours",
      "Around 6 PM — roughly a quarter of history is the modern era",
      "At 11:58 PM — modern economic growth occupies only the last two minutes",
      "At midnight — the Industrial Revolution is so recent it hasn't started yet",
    ],
    correct: 2,
    exp: "Modern economic growth occupies the LAST TWO MINUTES of a 24-hour day. Yet in those two minutes we produced more change than in the previous 23 hours and 58 minutes combined. Steam engines, railroads, electricity, antibiotics, the internet, mobile phones, machine learning — all bunched into 200 years.",
  },
  {
    q: "South Korea went from $854 GDP per capita in the 1950s to $30,000+ today — in one lifetime. Your slides identify the four-stage recipe. Which of the following correctly describes Stage 2 (1960s–70s)?",
    options: [
      "Near-universal secondary education and an engineering culture",
      "Investment surge to 30–35% of GDP with government partnering with industry",
      "War-torn and agrarian with GDP per capita of just $854",
      "11th-largest economy, peer with Italy and New Zealand",
    ],
    correct: 1,
    exp: "Stage 2 (1960s–70s): Investment surge to 30–35% of GDP, with government actively partnering with industry. Stage 1 = war-torn/agrarian 1950s. Stage 3 = near-universal secondary education + engineering culture (1980s). Stage 4 = today, 11th-largest economy. The recipe: education + investment + technology adoption + economic openness.",
  },
];

function EnrichmentStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ENRICHMENT_QS[idx];
  const isLast = idx === ENRICHMENT_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-1">The Great Enrichment</p>
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-center">
          {[["$3/day", "Average income, 1800", "Rome · Ming China · Medieval England"],
            ["$35+/day", "Average income today (global)", "Driven by 200 years of compounding"],
            ["×10", "Living standards multiplier", "Much more for industrialized economies"]
          ].map(([val, label, sub]) => (
            <div key={val} className="bg-background border border-border rounded-lg p-2">
              <p className="text-primary font-bold text-lg">{val}</p>
              <p className="font-semibold text-foreground text-xs">{label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"More change in the last 200 years than in the previous 2,000 combined."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ENRICHMENT_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Institutions
// ─────────────────────────────────────────────
const INSTITUTIONS_QS = [
  {
    q: "Your slides open the institutions section with: 'Would you plant a crop if anyone could harvest it?' What economic concept does this question illustrate?",
    options: [
      "The tragedy of the commons — shared resources are always overused",
      "Why property rights are essential for investment — without enforceable ownership, the incentive to invest disappears",
      "Why government should control all agricultural production",
      "The law of diminishing returns applied to farming",
    ],
    correct: 1,
    exp: "This is the core insight about property rights: investment requires patience — giving up consumption today for a future return. But you only do that if you trust the rules will let you keep the return. Without enforceable ownership, why invest? Why plant the crop if anyone can harvest it?",
  },
  {
    q: "Your slides identify four institutional pillars of growth. Which set is correct?",
    options: [
      "Free trade, democracy, foreign aid, and central banking",
      "Property rights, rule of law, contract enforcement, and low corruption / low red tape",
      "High savings rates, government investment, export orientation, and currency stability",
      "Education spending, infrastructure, healthcare, and environmental protection",
    ],
    correct: 1,
    exp: "The four institutional pillars from your slides: (1) Property rights — you own what you produce. (2) Rule of law — rules apply equally to everyone, from Magna Carta to modern courts. (3) Contract enforcement — strangers can do business. (4) Low corruption and red tape — bribes and permits slow the engine. Countries weak in all four (Somalia, South Sudan, Zimbabwe) remain among the poorest. Not a coincidence.",
  },
  {
    q: "Your slides describe 'investment is patience.' Which of the following best captures this framing?",
    options: [
      "Investors should wait for stock prices to fall before buying",
      "You give up consumption today — skip dinner out, delay the new car — in exchange for a future return, but only if you trust the rules will let you keep it. Weak property rights destroy the patience that growth requires.",
      "Governments should be patient and wait for markets to self-correct before intervening",
      "Patience means accepting low growth rates rather than pushing for faster development",
    ],
    correct: 1,
    exp: "Investment is patience: you sacrifice present consumption for future return (a business, a home, a college degree). You only make that sacrifice if you trust the institutional rules — that the return won't be seized, taxed away, or rendered worthless. Weak property rights destroy that trust, and therefore destroy investment and growth.",
  },
];

function InstitutionsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = INSTITUTIONS_QS[idx];
  const isLast = idx === INSTITUTIONS_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Institutions — The Soil Where Growth Grows</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[["Property Rights", "You own what you produce"],
            ["Rule of Law", "Rules apply equally to everyone"],
            ["Contract Enforcement", "Strangers can do business"],
            ["Low Corruption & Red Tape", "Bribes and delays slow the engine"]
          ].map(([title, desc]) => (
            <div key={title} className="bg-background border border-border rounded-lg p-2">
              <p className="font-semibold text-foreground text-xs">{title}</p>
              <p className="text-muted-foreground text-xs">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Countries weak in all four — Somalia, South Sudan, Zimbabwe — remain among the poorest. Not a coincidence.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={INSTITUTIONS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Productivity & Inputs
// ─────────────────────────────────────────────
const INPUTS_QS = [
  {
    q: "Your slides use the 'two bakers' analogy to explain labor productivity. Baker A uses a wood-fired oven and makes 10 loaves/hour. Baker B uses an industrial oven and makes 100 loaves/hour. Same skill, same effort. What does this illustrate?",
    options: [
      "Baker B is more talented and works harder than Baker A",
      "Labor productivity — more output per hour — driven by better tools, not more effort",
      "Baker A should switch to making a different product where she has comparative advantage",
      "The diminishing returns to capital — more ovens would eventually reduce productivity",
    ],
    correct: 1,
    exp: "Labor productivity = the value each worker creates per unit of time. Baker B doesn't work harder — she has a better tool (physical capital). That 10× difference in output is a productivity gain. In the long run, productivity per hour is the single most important determinant of average wages.",
  },
  {
    q: "The aggregate production function is GDP = f(Labor, Physical Capital, Human Capital, Technology). Which input does your slides call 'the joker in the deck' and why?",
    options: [
      "Labor — because population growth is unpredictable",
      "Physical capital — because machines depreciate and must be replaced",
      "Technology (A) — because ideas don't depreciate, can be copied for free, and one idea can spawn a thousand more",
      "Human capital — because education outcomes are hard to measure",
    ],
    correct: 2,
    exp: "Technology is the joker: it's non-rival (my use doesn't reduce yours — the Pythagorean theorem works for everyone simultaneously), non-depreciating (calculus from 1700 still works; buildings rust, machines break, ideas stay), and combinatorial (steam + iron → railroad; transistor + memory → computer; internet + GPS + smartphone → ride-sharing). U.S. issues 150,000 patents/year.",
  },
  {
    q: "Your slides describe trade as 'Ingredient 5 (bonus)' for growth. What two mechanisms make trade a productivity multiplier?",
    options: [
      "Trade lowers wages in rich countries and raises them in poor countries, equalizing global living standards",
      "Comparative advantage (each does what they do best, raising total output) and economies of scale (bigger markets spread fixed costs, enabling more R&D and steeper learning curves)",
      "Trade eliminates the need for physical capital investment by allowing imports of finished goods",
      "Trade creates jobs in export industries that exactly offset jobs lost in import-competing industries",
    ],
    correct: 1,
    exp: "Two mechanisms: (1) Comparative advantage — when countries specialize in what they're relatively best at, total output rises even if one party is 'better at everything.' (2) Economies of scale — a factory selling to 8 billion can spread fixed costs far more than one selling to 8 million, enabling larger production runs, more R&D, and steeper learning curves. McCloskey's Bourgeois Deal: 'Let me have a go — then trade rewards the innovators who serve you best.'",
  },
  {
    q: "U.S. workers today have access to roughly 3× the physical capital of a 1950s worker. Yet your slides note a key limitation of physical capital. What is it?",
    options: [
      "Physical capital is taxed heavily, making it less effective than human capital",
      "Physical capital hits diminishing returns — the first road transforms commerce, the 12th lane barely registers. Each unit adds less than the one before.",
      "Physical capital only benefits workers in manufacturing, not services",
      "Physical capital requires human capital to operate, so the two always cancel out",
    ],
    correct: 1,
    exp: "Diminishing returns to physical capital: the first paved road in a region transforms commerce. The 12th lane on a highway barely registers. Each additional unit of physical capital adds LESS than the unit before. This is why capital deepening alone can't sustain long-run growth — you need technology (which doesn't hit diminishing returns) to keep productivity rising.",
  },
];

function InputsStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = INPUTS_QS[idx];
  const isLast = idx === INPUTS_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">GDP = f(Labor, Physical Capital, Human Capital, Technology)</p>
        <div className="grid grid-cols-4 gap-1.5 text-xs text-center">
          {[["L", "Labor", "Hours of work, by people"],
            ["K", "Physical Capital", "Machines, factories, infrastructure"],
            ["H", "Human Capital", "Skills, education, experience"],
            ["A", "Technology", "Knowledge, ideas, methods"]
          ].map(([letter, name, desc]) => (
            <div key={letter} className="bg-background border border-border rounded-lg p-2">
              <p className="text-primary font-bold text-xl">{letter}</p>
              <p className="font-semibold text-foreground text-xs">{name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Inputs reinforce each other — but technology is the joker in the deck. Ideas don't depreciate. One idea can spawn a thousand more.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={INPUTS_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Growth Accounting
// ─────────────────────────────────────────────
const ACCOUNTING_QS = [
  {
    q: "Growth accounting asks: which input contributes most to differences in growth rates across countries? What does your slides' answer — 'Technology wins' — mean specifically?",
    options: [
      "Countries with the most computers and smartphones always grow fastest",
      "Total factor productivity (technology + know-how) is consistently the largest driver of cross-country growth differences in long-run studies",
      "Technology is important but labor hours are still the biggest single factor",
      "Technology only matters for rich countries — poor countries need capital and labor first",
    ],
    correct: 1,
    exp: "Growth accounting finding: Total factor productivity (TFP) — the 'A' in GDP = f(L,K,H,A) — is consistently the #1 driver of growth rate differences across countries in long-run cross-country studies. Capital and labor together explain ~50% of differences. The residual 'A' — ideas, institutions, organization — is what economists can't measure directly but always find dominating the data.",
  },
  {
    q: "In the production function GDP = f(L, K, H, A), economists call 'A' the residual. What does the residual represent and why is it important?",
    options: [
      "The portion of GDP that governments redistribute through taxes",
      "Statistical errors in GDP measurement that can't be accounted for",
      "Ideas, institutions, and organization — what economists can't measure directly but always find dominating growth data",
      "Agricultural output, which doesn't fit neatly into labor or capital categories",
    ],
    correct: 2,
    exp: "'A' — the residual — represents ideas, institutions, and organization. It's what's left after accounting for labor hours, physical capital, and human capital. Economists can't measure it directly, but it consistently dominates cross-country growth comparisons. This is why institutions and technology policy matter so much: the biggest lever for growth is the one that's hardest to see.",
  },
  {
    q: "Your slides note: 'Capital deepening hits diminishing returns; technology and ideas don't.' What is the practical implication for sustained long-run growth?",
    options: [
      "Countries should stop investing in physical capital once they reach a certain level",
      "Only human capital investment can sustain growth — machines are obsolete",
      "Long-run growth requires continuous improvement in technology and ideas, because simply adding more machines to a fixed technology base eventually yields smaller and smaller output gains",
      "Diminishing returns apply equally to all inputs, so growth must slow eventually for all countries",
    ],
    correct: 2,
    exp: "Diminishing returns mean that adding more physical capital to a fixed technology eventually yields smaller and smaller gains. But ideas are non-depreciating and combinatorial — they don't hit diminishing returns. Sustained long-run growth therefore requires continuous improvement in technology (A), not just capital deepening. This is the fundamental insight of modern growth theory.",
  },
];

function AccountingStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = ACCOUNTING_QS[idx];
  const isLast = idx === ACCOUNTING_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Growth Accounting — Which Input Wins?</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {[["#1", "Technology (A)", "Consistently the largest driver in long-run cross-country studies"],
            ["~50%", "Capital + Labor", "Physical and human capital together explain about half of growth differences"],
            ["'A'", "The Residual", "Ideas, institutions, organization — can't measure directly, always dominates"]
          ].map(([val, label, desc]) => (
            <div key={val} className={`rounded-lg p-2 border ${val === '#1' ? 'bg-primary/10 border-primary/30' : 'bg-background border-border'}`}>
              <p className="text-primary font-bold text-lg">{val}</p>
              <p className="font-semibold text-foreground text-xs">{label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Capital deepening hits diminishing returns; technology and ideas don't.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={ACCOUNTING_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — The Rule of 70
// ─────────────────────────────────────────────
const RULE70_QS = [
  {
    q: "The Rule of 70 states: Years to double ≈ 70 ÷ growth rate (%). An economy growing at 3% per year (the solid U.S. trend) doubles roughly every how many years?",
    options: [
      "70 years",
      "14 years",
      "23 years",
      "35 years",
    ],
    correct: 2,
    exp: "70 ÷ 3% = ~23 years. At 3% growth, the economy doubles every 23 years. Your slide table: 1% → 70 yrs (×1.6 in 50 yrs, slow Europe late 1800s), 3% → 23 yrs (×4.4 in 50 yrs, U.S. trend), 5% → 14 yrs (×11.5 in 50 yrs, fast catch-up), 8% → ~9 yrs (×47 in 50 yrs, South Korea/China boom).",
  },
  {
    q: "South Korea and China both sustained roughly 8% annual growth for extended periods. According to your slide's Rule of 70 table, what does 8% growth mean for a 50-year period?",
    options: [
      "The economy doubles once — about ×2 in 50 years",
      "The economy multiplies roughly ×4.4 in 50 years",
      "The economy multiplies roughly ×47 in 50 years — nearly 50-fold",
      "The economy multiplies roughly ×11.5 in 50 years",
    ],
    correct: 2,
    exp: "At 8% growth, doubling time ≈ 70÷8 ≈ 9 years. Over 50 years that's about 5–6 doublings: 2^5.5 ≈ 47. A ×47 multiplier explains how South Korea went from $854/capita to $30,000+ in one lifetime — and why your slide says '3% vs 1% doesn't sound like much, but over a lifetime it's the difference between living modestly and living well.'",
  },
  {
    q: "Your slide shows: $5,000/year saved for 40 years at 7% = $1,068,000, of which only $200,000 was contributions. What principle does this personal compounding example illustrate?",
    options: [
      "Saving a large lump sum early is better than saving regularly",
      "Government bonds are the safest investment for retirement savings",
      "The same compounding math that lifts nations lifts savers — and most of the wealth is built in the final decade when the snowball is biggest. Starting at 25 vs. 35 is often half the final balance.",
      "Inflation erodes savings, so investing in physical assets is always better",
    ],
    correct: 2,
    exp: "$5,000/yr × 40 yrs = $200,000 in contributions. But compounding at 7% produces $1,068,000 — $868,000 is pure compounding. Most is built in the final decade, when the snowball is biggest. 'The same force that lifts nations lifts savers — if you give it time.' Starting at 25 vs. 35 isn't 10 years extra — it's often half the final balance.",
  },
];

function Rule70Station({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = RULE70_QS[idx];
  const isLast = idx === RULE70_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">The Rule of 70 — Years to double ≈ 70 ÷ growth rate (%)</p>
        <div className="rounded-lg overflow-hidden border border-border text-xs">
          <table className="w-full">
            <thead><tr className="bg-primary text-primary-foreground"><th className="text-left px-2 py-1.5">Growth</th><th className="text-center px-2 py-1.5">Yrs to double</th><th className="text-center px-2 py-1.5">50-yr multiplier</th><th className="text-left px-2 py-1.5">Example</th></tr></thead>
            <tbody>
              {[["1%","70 yrs","×1.6","Slow Europe, late 1800s"],
                ["3%","23 yrs","×4.4","Solid U.S. trend"],
                ["5%","14 yrs","×11.5","Fast catch-up"],
                ["8%","~9 yrs","×47","S. Korea, China boom"]
              ].map(([g,y,m,ex], i) => (
                <tr key={g} className={`border-t border-border ${i%2===0?'bg-background':'bg-muted/30'}`}>
                  <td className="px-2 py-1.5 font-bold text-primary">{g}</td>
                  <td className="text-center px-2 py-1.5">{y}</td>
                  <td className="text-center px-2 py-1.5 font-semibold">{m}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2"><span className="font-semibold">50-yr multiplier</span> = how many times larger the economy is after 50 years at that growth rate (e.g., ×47 means 47× bigger). Calculated as (1 + rate)<sup>50</sup>.</p>
        <p className="text-xs text-muted-foreground italic mt-1">3% vs. 1% doesn't sound like much — but over a lifetime it's the difference between living modestly and living well.</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={RULE70_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Catch-Up & Convergence
// ─────────────────────────────────────────────
const CONVERGENCE_QS = [
  {
    q: "Your slides identify the 'Fast Growth Club' of the last 30 years. Which group of countries best matches the slide's data (5–10%/yr)?",
    options: [
      "United States, Germany, Japan, and France",
      "China (~9%), India (~6–7%), South Korea (earlier: ~7–8%), Vietnam (~6–7%), Poland (~4–5%)",
      "Brazil, Russia, South Africa, and Mexico",
      "Saudi Arabia, UAE, Norway, and Australia",
    ],
    correct: 1,
    exp: "Fast Growth Club from your slides: China ~9%, India ~6–7%, South Korea (earlier) ~7–8%, Vietnam ~6–7%, Poland ~4–5%. Slow Growth Group: U.S. ~2%, Germany ~1–2%, Japan ~0.5–1%, Italy ~0–1%, many sub-Saharan economies ~0%. Rich, mature economies grow slowly; catching-up economies grow fast — except where institutions fail.",
  },
  {
    q: "Your slides present three lessons from convergence. Which correctly states Lesson 3?",
    options: [
      "East Asia: convergence works — Japan, South Korea, Taiwan, Singapore, and China closed massive gaps",
      "Africa: convergence stalled — many sub-Saharan economies have the same GDP/capita today as in 1960",
      "Institutions are the bottleneck — not geography, not natural resources, not aid. Countries that catch up build the rules that let people invest, trade, learn, and innovate.",
      "Foreign aid is the most reliable path to closing the income gap between rich and poor countries",
    ],
    correct: 2,
    exp: "Lesson 3 from your slides: Institutions are the bottleneck. Not geography. Not natural resources. Not aid. The countries that catch up — East Asia — built property rights, rule of law, contract enforcement, and low corruption. Many sub-Saharan economies didn't, and have roughly the same GDP/capita today as in 1960. 'Catch-up is a recipe, not a guarantee — and the recipe starts with the rules.'",
  },
  {
    q: "Your slides note that convergence is 'possible but not automatic.' What factor most determines whether a poor country actually catches up to rich ones?",
    options: [
      "Geographic location and access to seaports",
      "Natural resource endowments — oil, minerals, and fertile land",
      "The quality of institutions — property rights, rule of law, and low corruption — that determine whether capital flows in and ideas take root",
      "The amount of foreign aid received from wealthy nations",
    ],
    correct: 2,
    exp: "Convergence requires good institutions: without property rights, rule of law, and low corruption, capital flees and ideas don't take root. Geography, natural resources, and aid can help at the margin, but they can't substitute for institutional quality. Many resource-rich African countries remain poor; institution-poor countries in sub-Saharan Africa had the same GDP/capita in 2000 as in 1960. 'Convergence is possible — but not guaranteed. Institutions decide.'",
  },
];

function ConvergenceStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const q = CONVERGENCE_QS[idx];
  const isLast = idx === CONVERGENCE_QS.length - 1;
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
        <p className="font-semibold text-foreground mb-2">Catch-Up & Convergence</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="font-semibold text-green-800 mb-1">Fast Growth Club (~5–10%/yr)</p>
            <p className="text-green-700">China ~9% · India ~6–7% · S. Korea ~7–8% · Vietnam ~6–7% · Poland ~4–5%</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-2">
            <p className="font-semibold text-foreground mb-1">Slow Growth Group (~0–2%/yr)</p>
            <p className="text-muted-foreground">U.S. ~2% · Germany ~1–2% · Japan ~0.5–1% · Italy ~0–1% · Sub-Saharan ~0%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">"Catch-up is a recipe, not a guarantee — and the recipe starts with the rules."</p>
      </div>
      <SteppedQuiz q={q} idx={idx} total={CONVERGENCE_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────
type Flashcard = { id: number; type: "standard" | "cloze"; front: string; back: string; hint: string };

const CH7_CARDS: Flashcard[] = [
  { id: 1, type: "standard", front: "What is the Great Enrichment, and what are the key numbers?", back: "The Great Enrichment: the 200-year revolution in living standards that began with the Industrial Revolution.\n\nKey numbers:\n• Average income 1800: $3/day (Rome, Ming China, medieval England — about the same)\n• Average income today (global): $35+/day\n• Multiplier: ×10 in real terms (much more for industrialized economies)\n\n'More change in the last 200 years than in the previous 2,000 combined.'\n\nModern growth = the last 2 minutes of a 24-hour history of humanity.", hint: "$3→$35+ per day. ×10. Last 2 minutes of 24-hour history." },
  { id: 2, type: "standard", front: "South Korea's four-stage growth story", back: "From $854 GDP/capita (1950s) to $30,000+ today — in one lifetime.\n\nStage 1 (1950s): War-torn, agrarian. $854/capita.\nStage 2 (1960s–70s): Investment surge to 30–35% of GDP. Government partners with industry.\nStage 3 (1980s): Near-universal secondary education. Engineering culture takes root.\nStage 4 (Today): 11th-largest economy. GDP/cap >$30,000. Peer with Italy, New Zealand, Israel.\n\nRecipe: education + investment + technology adoption + economic openness. Sustained 6%+ growth for four decades.", hint: "$854→$30K+ in one lifetime. 4 stages. Recipe: education, investment, technology, openness." },
  { id: 3, type: "standard", front: "The four institutional pillars of growth", back: "1. Property rights — You own what you produce. Land, tools, savings, wages, inventions, contracts.\n2. Rule of law — Rules apply equally to everyone (from Magna Carta to modern courts). Predictable, fair, transparent.\n3. Contract enforcement — Strangers can do business. A surgeon needs to know you'll pay; a buyer needs delivery.\n4. Low corruption & red tape — Bribes, permits, and delays don't stop the economy — they slow it.\n\nCountries weak in all four (Somalia, South Sudan, Zimbabwe) remain among the poorest. Not a coincidence.\n\n'Would you plant a crop if anyone could harvest it?' — Investment requires property rights.", hint: "Property rights · Rule of law · Contract enforcement · Low corruption" },
  { id: 4, type: "standard", front: "Why is 'investment is patience' the key insight about property rights?", back: "Investment = giving up consumption today for a future return.\nYou skip dinner out, delay the new car — in exchange for a business, a home, a college degree.\n\nBut you only do that if you trust the rules will let you KEEP the return.\n\nWeak property rights destroy the patience that growth requires:\n• Why build a factory if it can be seized?\n• Why save if your bank account can be frozen?\n• Why invent if your patent won't be enforced?\n\n'Investment is patience' — and patience requires trust in institutions.", hint: "Give up consumption today IF you trust the rules will protect your future return." },
  { id: 5, type: "standard", front: "The aggregate production function: GDP = f(L, K, H, A)", back: "L = Labor: Hours of work, by people\nK = Physical Capital: Machines, factories, infrastructure, computers, software\nH = Human Capital: Skills, education, experience — 'the most powerful, most durable form of capital you ever build'\nA = Technology: Knowledge, ideas, methods — 'the joker in the deck'\n\nInputs reinforce each other. A modern factory needs operators who understand the machines (H) to use the equipment (K). Without human capital, physical capital is wasted.\n\nU.S. workers today have ~3× the physical capital of a 1950s worker.", hint: "L=Labor, K=Physical Capital, H=Human Capital, A=Technology. They reinforce each other." },
  { id: 6, type: "standard", front: "Why is technology 'the joker in the deck'? (Three properties)", back: "Technology (A) has three unique properties that other inputs lack:\n\n1. Non-rival: My use doesn't reduce yours. The Pythagorean theorem works for everyone simultaneously. A truck doesn't work that way.\n\n2. Non-depreciating: Calculus from 1700 still works perfectly. Buildings rust. Machines break. Ideas stay.\n\n3. Combinatorial: Ideas spawn ideas. Steam + iron → railroad. Transistor + memory → computer. Internet + GPS + smartphone → ride-sharing.\n\nU.S. issues 150,000+ patents/year — each one a small new lever for productivity.", hint: "Non-rival · Non-depreciating · Combinatorial. Ideas don't wear out and one spawns many more." },
  { id: 7, type: "standard", front: "Growth accounting: What does 'Technology wins' mean?", back: "Growth accounting breaks down which inputs explain cross-country growth differences.\n\nResult: Technology (total factor productivity / TFP) is consistently the #1 driver.\n\n• Capital + Labor together explain ~50% of growth differences\n• The residual 'A' — ideas, institutions, organization — explains the rest and dominates\n• 'A' is what economists can't measure directly but always find winning\n\nWhy: Physical capital hits diminishing returns (12th highway lane barely helps). Ideas and technology don't hit diminishing returns — they compound and combine.", hint: "TFP = #1. K+L ≈ 50%. Residual 'A' dominates. Capital diminishes; ideas don't." },
  { id: 8, type: "cloze", front: "Complete: Years to double ≈ _______ ÷ growth rate (in %).", back: "Years to double ≈ 70 ÷ growth rate (in %).\n\nKey examples from your slides:\n1% → 70 years → ×1.6 in 50 yrs (slow Europe, late 1800s)\n3% → 23 years → ×4.4 in 50 yrs (solid U.S. trend)\n5% → 14 years → ×11.5 in 50 yrs (fast catch-up)\n8% → ~9 years → ×47 in 50 yrs (South Korea, China boom)", hint: "Rule of 70. At 3%: doubles every 23 years." },
  { id: 9, type: "standard", front: "The personal compounding example from your slides", back: "$5,000/year saved for 40 years at 7% annual return → $1,068,000\n\nOf which:\n• Only $200,000 was contributions (40 × $5,000)\n• $868,000 is pure compounding — more than 4× the contributions\n\nKey insight: Most wealth is built in the FINAL decade, when the snowball is biggest.\nStarting at 25 vs. 35 isn't '10 years extra' — it's often half the final balance.\n\n'The same force that lifts nations lifts savers — if you give it time.'", hint: "$5K/yr × 40 yrs at 7% = $1.068M. Only $200K contributed. Patience wins." },
  { id: 10, type: "standard", front: "The growth scoreboard: Fast Club vs. Slow Group (last 30 years)", back: "Fast Growth Club (~5–10%/yr):\nChina ~9%, India ~6–7%, South Korea (earlier) ~7–8%, Vietnam ~6–7%, Poland ~4–5%\n\nSlow Growth Group (~0–2%/yr):\nUnited States ~2%, Germany ~1–2%, Japan ~0.5–1%, Italy ~0–1%, many sub-Saharan economies ~0%\n\nPattern: Rich, mature economies grow slowly. Many catching-up economies grow fast — except where institutions fail.", hint: "Fast: China/India/Vietnam/Poland. Slow: US/Germany/Japan/Italy/sub-Saharan." },
  { id: 11, type: "standard", front: "Three lessons from convergence", back: "Lesson 1 — East Asia: convergence works\nJapan, South Korea, Taiwan, Singapore, and China closed massive gaps. Recipe: open trade, heavy investment in education, stable government, protection of property rights.\n\nLesson 2 — Africa: convergence stalled\nMany sub-Saharan economies have nearly the same GDP/capita today as in 1960. Weak institutions, civil conflict, and corruption keep capital out and prevent ideas from taking root.\n\nLesson 3 — Institutions are the bottleneck\nNot geography. Not natural resources. Not aid. Countries that catch up build the rules of the game that let people invest, trade, learn, and innovate.", hint: "East Asia works · Africa stalled · Institutions are the bottleneck" },
  { id: 12, type: "cloze", front: "Complete: Robert Lucas said: 'Once one starts to think about _______, it is hard to think about anything else.'", back: "Robert Lucas, Nobel laureate: 'Once one starts to think about [growth], it is hard to think about anything else.'\n\nWhy it matters: A 1% difference in annual growth sustained over 50 years is the difference between a ×1.6 and ×4.4 multiplier. Over generations, that gap determines whether your grandchildren live in poverty or prosperity.", hint: "Lucas Nobel quote. Growth differences compound into civilizational gaps over generations." },
];

function FlashcardStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [deck] = useState<Flashcard[]>([...CH7_CARDS]);
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Ch7 Economic Growth</p>
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
            <p className="text-sm text-green-700 mt-1">You cleared the full Ch7 deck. The quiz is now unlocked.</p>
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
  { q: "Your slides show average global income was about $3/day in 1800. About what is the global average today, and what is the real multiplier?", options: ["$10/day — about 3× in real terms", "$35+/day — more than 10× in real terms", "$100/day — more than 30× in real terms", "$20/day — about 6× in real terms"], correct: 1, exp: "The Great Enrichment: $3/day (1800) → $35+/day today — a 10× real increase. For industrialized economies, the multiplier is far higher. Driven by 200 years of compounding growth starting with the Industrial Revolution." },
  { q: "In the 24-hour clock analogy from your slides, where does modern economic growth (the Industrial Revolution onward) begin?", options: ["At midnight, the start of human history", "At noon — growth has been steady for half of human history", "At 11:58 PM — the last two minutes of the day", "At 6 AM — roughly the first quarter of history"], correct: 2, exp: "Modern economic growth occupies the LAST TWO MINUTES of a 24-hour compression of all human history. Yet in those two minutes we produced more change than in the previous 23 hours 58 minutes combined — steam engines, railroads, electricity, antibiotics, the internet, machine learning." },
  { q: "South Korea went from $854 GDP/capita (1950s) to $30,000+ today. Your slides attribute this to a recipe of four factors. Which is correct?", options: [
      "Oil discovery, foreign military bases, favorable geography, and natural ports",
      "Foreign aid, IMF loans, currency devaluation, and export subsidies",
      "Low taxes, minimal government, gold standard, and free immigration",
      "Education, investment, technology adoption, and economic openness — sustained 6%+ growth for four decades",
    ], correct: 3, exp: "South Korea's four-stage recipe: education, investment (30–35% of GDP in the 1960–70s), technology adoption, and economic openness. Not oil, not geography, not aid. Sustained 6%+ growth transformed a war-torn agrarian economy into the 11th-largest in the world in one lifetime." },
  { q: "Your slides open the institutions section with: 'Would you plant a crop if anyone could harvest it?' What growth concept does this question motivate?", options: [
      "Property rights are essential for investment — without enforceable ownership, the incentive to build, save, and innovate disappears",
      "The tragedy of the commons requires collective action to solve resource depletion",
      "Farming productivity depends primarily on technology, not ownership structures",
      "Government land redistribution improves agricultural efficiency",
    ], correct: 0, exp: "This is the motivating question for property rights: investment requires patience (giving up consumption today for future return), but you only make that sacrifice if you trust the rules will let you keep the return. Weak property rights destroy the patience that growth requires." },
  { q: "Which of the four institutional pillars from your slides involves the principle that 'rules apply equally to everyone, from the most powerful to the least'?", options: [
      "Property rights — you own what you produce",
      "Low corruption — bribes and delays slow the engine",
      "Rule of law — predictable, fair, transparent rules for all",
      "Contract enforcement — strangers can do business",
    ], correct: 2, exp: "Rule of law means the same rules apply to everyone — from Magna Carta (1215) to modern courts. Even the powerful follow the law. Countries with strong rule of law attract investment because the outcome of disputes is predictable and fair, not determined by connections or bribes." },
  { q: "Baker A uses a wood-fired oven and makes 10 loaves/hour. Baker B uses an industrial oven and makes 100 loaves/hour. Same skill, same effort. What concept does this illustrate?", options: [
      "Comparative advantage — Baker B has lower opportunity cost for bread production",
      "Economies of scale — larger operations reduce per-unit costs",
      "Human capital — Baker B has better training and education",
      "Labor productivity — better tools produce more output per hour without more effort",
    ], correct: 3, exp: "This is labor productivity: the value each worker creates per unit of time. Baker B doesn't work harder — she has better physical capital (the industrial oven). A 10× productivity difference from tools, not talent. In the long run, productivity per hour is the single most important determinant of average wages." },
  { q: "Technology is called 'the joker in the deck' because it is non-rival, non-depreciating, and combinatorial. Which example best illustrates the non-rival property?", options: ["A vaccine requires expensive manufacturing facilities to produce at scale", "The Pythagorean theorem — my using it doesn't reduce your ability to use it simultaneously", "A factory machine wears out over time and must be replaced", "Green Revolution seeds doubled yields, but only in countries that could afford them"], correct: 1, exp: "Non-rival means my use doesn't reduce yours. The Pythagorean theorem, calculus, the germ theory of disease — everyone can use these ideas simultaneously without depleting them. A truck can only be in one place. An idea can be everywhere at once. This is what makes technology fundamentally different from physical capital." },
  { q: "Growth accounting studies find that technology (total factor productivity) is the #1 driver of cross-country growth differences. What share of differences do physical and human capital together explain?", options: [
      "About 50% — important, but not the whole story; technology dominates the rest",
      "About 90% — capital and labor are by far the dominant factors",
      "Less than 10% — capital and labor barely matter for long-run growth",
      "Exactly 70%, following the Rule of 70 applied to capital accumulation",
    ], correct: 0, exp: "Growth accounting: physical and human capital together explain roughly 50% of cross-country growth differences. The residual 'A' — ideas, institutions, organization — explains the rest and consistently dominates. Capital is important but hits diminishing returns; technology doesn't, which is why it wins in long-run studies." },
  { q: "Using the Rule of 70: an economy grows at 5% per year. Approximately how many years until its GDP doubles?", options: [
      "70 years",
      "35 years",
      "23 years",
      "14 years",
    ], correct: 3, exp: "Rule of 70: doubling time ≈ 70 ÷ growth rate = 70 ÷ 5 = 14 years. Your slide table: 5% growth = 14-year doubling time, ×11.5 multiplier in 50 years ('fast catch-up'). Compare: 1% = 70 years (×1.6), 3% = 23 years (×4.4), 8% = ~9 years (×47, South Korea/China boom)." },
  { q: "Your slides show: $5,000/year saved for 40 years at 7% = $1,068,000, of which only $200,000 was contributions. What does this personal example teach about compounding?", options: [
      "Saving a large lump sum early is always better than saving regularly over time",
      "Inflation will erode most of this gain, so real returns are much lower",
      "Most of the final value comes from compounding — starting at 25 vs. 35 is often the difference of half the final balance",
      "Only millionaires can benefit from compound interest — modest savers see little effect",
    ], correct: 2, exp: "$200K contributions grew to $1,068,000 — $868K is pure compounding. Most is built in the FINAL decade when the snowball is biggest. Starting at 25 vs. 35 isn't '10 years extra' — it's often half the final balance. 'The same force that lifts nations lifts savers — if you give it time.'" },
  { q: "Which countries are in the 'Fast Growth Club' identified in your slides (last 30 years, ~5–10%/yr)?", options: ["United States, Germany, Canada, and Australia", "China, India, South Korea, Vietnam, and Poland", "Saudi Arabia, UAE, Qatar, and Kuwait", "France, Spain, Italy, and Greece"], correct: 1, exp: "Fast Growth Club: China ~9%, India ~6–7%, South Korea (earlier) ~7–8%, Vietnam ~6–7%, Poland ~4–5%. Slow Group: U.S. ~2%, Germany ~1–2%, Japan ~0.5–1%, Italy ~0–1%, many sub-Saharan economies ~0%. Rich mature economies grow slowly; catching-up economies grow fast — except where institutions fail." },
  { q: "Your slides present three lessons from convergence. Lesson 2 is 'Africa: convergence stalled.' What best explains why?", options: [
      "Weak institutions — civil conflict, corruption, and absence of property rights — kept capital out and prevented ideas from taking root. Many sub-Saharan economies have the same GDP/capita today as in 1960.",
      "African countries lack natural resources needed for industrialization",
      "Africa never received sufficient foreign aid from wealthy nations to fund development",
      "African geography — landlocked countries and tropical diseases — makes growth impossible",
    ], correct: 0, exp: "Convergence stalled in much of sub-Saharan Africa not because of geography or lack of resources, but because of weak institutions: civil conflict, corruption, and absence of enforceable property rights kept capital fleeing and ideas from taking root. Many sub-Saharan economies have nearly the same GDP/capita in 2000 as in 1960." },
  { q: "Your slides conclude: 'Convergence is possible — but not automatic. Institutions decide.' What does this mean for policy?", options: ["Poor countries should focus on attracting foreign aid rather than institutional reform", "Geography determines growth destiny — policy can't overcome natural disadvantages", "Building property rights, rule of law, and low corruption is the primary lever for catch-up growth — not resource wealth, not aid, not geography", "Convergence is essentially random — some countries get lucky and some don't"], correct: 2, exp: "The evidence is clear: East Asia caught up by building institutions (property rights, rule of law, contract enforcement, low corruption). Many resource-rich African countries didn't. Not geography. Not natural resources. Not aid. The countries that catch up build the rules that let people invest, trade, learn, and innovate." },
  { q: "Human capital is described in your slides as 'the most powerful, most durable form of capital you ever build — because unlike a machine, a skilled person can teach others.' What makes human capital unique?", options: [
      "Human capital depreciates faster than physical capital and must be constantly renewed",
      "Human capital is only valuable in high-tech industries, not in agriculture or services",
      "Human capital is fully captured in wages and therefore already counted in labor productivity",
      "Human capital is non-rival — a skilled person can teach others, multiplying the return beyond the individual",
    ], correct: 3, exp: "Human capital is unique because it can be transmitted: a skilled doctor trains residents, a skilled engineer mentors juniors, a great teacher educates hundreds. Physical capital (a machine) can only be in one place. Human capital can multiply — which is why education has such high social returns beyond the individual's private wage gain." },
  { q: "Robert Lucas (Nobel laureate) said: 'Once one starts to think about [growth], it is hard to think about anything else.' Why might even small growth rate differences deserve this intense focus?", options: [
      "Because small rate differences compound dramatically — a 1% vs. 3% difference over 50 years means ×1.6 vs. ×4.4, transforming whether future generations live modestly or well",
      "Because growth is the only economic indicator that matters for electoral politics",
      "Because GDP growth perfectly measures improvements in human well-being",
      "Because growth theory is the most mathematically sophisticated field of economics",
    ], correct: 0, exp: "Rule of 70 applied: 1% growth for 50 years = ×1.6. 3% = ×4.4. That gap — between ×1.6 and ×4.4 living standards — is the difference between living modestly and living well across an entire generation. Over 100+ years the gaps become civilizational. Small sustained differences in growth rates produce enormous long-run divergence in human welfare." },
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
        <p className="font-semibold text-foreground">Chapter 7 Quiz</p>
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
const STATION_LABELS_CH7: Record<string, string> = {
  enrichment:   "The Great Enrichment",
  institutions: "Institutions",
  inputs:       "Productivity & Inputs",
  accounting:   "Growth Accounting",
  rule70:       "The Rule of 70",
  convergence:  "Catch-Up & Convergence",
  flash:        "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH7).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch7 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 7 — Economic Growth</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 7 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 7 — Economic Growth</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: In one sentence, explain why technology is the most important driver of long-run economic growth.</label>
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
  { id: "enrichment"   as Station, label: "The Great Enrichment", desc: "The 200-year growth revolution — $3/day to $35+, South Korea's story", icon: "🌟" },
  { id: "institutions" as Station, label: "Institutions",         desc: "Property rights, rule of law, and the soil where growth grows", icon: "🏛️" },
  { id: "inputs"       as Station, label: "Productivity & Inputs", desc: "Labor, capital, human capital, technology — and trade as a multiplier", icon: "⚙️" },
  { id: "accounting"   as Station, label: "Growth Accounting",    desc: "Which input contributes most? Technology wins.", icon: "📊" },
  { id: "rule70"       as Station, label: "The Rule of 70",       desc: "Why small growth differences compound into enormous gaps", icon: "📈" },
  { id: "convergence"  as Station, label: "Catch-Up & Convergence", desc: "Can poor countries close the gap? What the data says.", icon: "🌍" },
  { id: "flash"        as Station, label: "Flashcard Review",     desc: "Master all 12 key Ch7 concepts before the quiz", icon: "🃏" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",       label: "Dashboard" },
  { id: "enrichment",  label: "Enrichment" },
  { id: "institutions",label: "Institutions" },
  { id: "inputs",      label: "Inputs" },
  { id: "accounting",  label: "Accounting" },
  { id: "rule70",      label: "Rule of 70" },
  { id: "convergence", label: "Convergence" },
  { id: "flash",       label: "Flashcards" },
  { id: "quiz",        label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","enrichment","institutions","inputs","accounting","rule70","convergence","flash","quiz","results","not-yet"];

// ─────────────────────────────────────────────
// Summary Modal
// ─────────────────────────────────────────────
const CH7_SUMMARY = [
  { heading: "7.1 The Relatively Recent Arrival of Economic Growth", body: "Economic growth is a relatively recent historical phenomenon. Before the Industrial Revolution, per-capita incomes were roughly constant across centuries and civilizations. Modern growth occupies the last two minutes of a 24-hour compression of human history — yet produced more change than all prior millennia combined." },
  { heading: "7.2 Labor Productivity and Economic Growth", body: "Economic growth in living standards is equivalent to economic growth in labor productivity, defined as the total output divided by the amount of labor input. Economies can accumulate more human capital, which is the skills and education of workers. Economies can discover new technology, ranging from the simplest tools to complex information technology. Economies can use more physical capital, from machines to infrastructure." },
  { heading: "7.3 Components of Economic Growth", body: "Over decades and generations, seemingly small differences in the annual growth rate of GDP per capita accumulate into enormous differences in living standards. The Rule of 70 tells us how many years it takes for a value to double: divide 70 by the growth rate. Technology, combined with human capital, physical capital, and favorable economic institutions, explains the differences in economic growth rates across countries." },
  { heading: "7.4 Economic Convergence", body: "When countries with lower GDP per capita have more rapid growth rates, the result is convergence — poorer countries are catching up to wealthier ones. Whether convergence occurs depends on whether countries have an institutional environment that provides a fertile climate for a robust market economy. Countries that have not developed such an environment, perhaps because of geography, culture, or historical circumstances, may not converge." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 7 Summary — Economic Growth</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH7_SUMMARY.map((s,i) => (
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
        <p className="font-semibold mb-1">Chapter 7 — Economic Growth</p>
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
        {station==="intro"        && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="enrichment"   && <EnrichmentStation   onComplete={(sc,t)=>markDone("enrichment",  sc,t)} />}
        {station==="institutions" && <InstitutionsStation onComplete={(sc,t)=>markDone("institutions",sc,t)} />}
        {station==="inputs"       && <InputsStation       onComplete={(sc,t)=>markDone("inputs",      sc,t)} />}
        {station==="accounting"   && <AccountingStation   onComplete={(sc,t)=>markDone("accounting",  sc,t)} />}
        {station==="rule70"       && <Rule70Station       onComplete={(sc,t)=>markDone("rule70",      sc,t)} />}
        {station==="convergence"  && <ConvergenceStation  onComplete={(sc,t)=>markDone("convergence", sc,t)} />}
        {station==="flash"        && <FlashcardStation    onComplete={(sc,t)=>markDone("flash",       sc,t)} />}
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
