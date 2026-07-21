import { useState, useEffect, useRef } from "react";

type Station =
  | "intro"
  | "bartersort"
  | "functionsclassify"
  | "moneyornot"
  | "m1m2"
  | "tcreate"
  | "multiplier"
  | "personalfinance"
  | "flash"
  | "quiz"
  | "results"
  | "not-yet";

const STORAGE_KEY = "econlab_done_ch14";

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
// Station 1 — Barter Sorter
// ─────────────────────────────────────────────
const BARTER_SCENARIOS = [
  { id: 1, text: "A farmer with wheat wants shoes, but the cobbler already has plenty of wheat and wants a haircut.", problem: "double", label: "Double Coincidence of Wants" },
  { id: 2, text: "How many fish is one hour of a plumber's time worth? You need a different exchange rate for every pair of goods.", problem: "pricing", label: "No Standard Unit of Pricing" },
  { id: 3, text: "A cow is worth ten chickens, but you only need five — you can't easily split the cow for part payment.", problem: "indivisibility", label: "Indivisibility" },
  { id: 4, text: "You catch fresh fish to trade for grain, but the grain merchant won't be ready to trade for three days — your fish will rot.", problem: "perishability", label: "Perishability" },
  { id: 5, text: "You spend two hours every day searching for someone willing to trade exactly what you have for exactly what you need — that's two hours of lost productivity.", problem: "transaction", label: "High Transaction Costs" },
];

const BARTER_PROBLEMS = [
  { id: "double", label: "Double Coincidence of Wants", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { id: "pricing", label: "No Standard Pricing", color: "bg-amber-100 border-amber-300 text-amber-800" },
  { id: "indivisibility", label: "Indivisibility", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { id: "perishability", label: "Perishability", color: "bg-red-100 border-red-300 text-red-800" },
  { id: "transaction", label: "High Transaction Costs", color: "bg-green-100 border-green-300 text-green-800" },
];

function BarterSortStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const total = BARTER_SCENARIOS.length;
  const correct = checked ? BARTER_SCENARIOS.filter(s => answers[s.id] === s.problem).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 1 — Why Barter Fails: The Sorter</p>
        <p className="text-muted-foreground text-xs mb-2">For each scenario below, select which of the five barter problems it illustrates. Money solves all five.</p>
        <div className="flex flex-wrap gap-1 text-xs">
          {BARTER_PROBLEMS.map(p => (
            <span key={p.id} className={`px-2 py-0.5 rounded-full border font-medium ${p.color}`}>{p.label}</span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {BARTER_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.problem;
          const isWrong = checked && ans && ans !== s.problem;
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 text-sm transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="font-medium text-foreground mb-2">{s.text}</p>
              <select
                disabled={checked}
                value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [s.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">— select the barter problem —</option>
                {BARTER_PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct — ${s.label}` : `✗ Answer: ${s.label}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Answers
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "All five barter problems identified!" : "Review the explanations above, then continue."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 2 — Functions of Money Classifier
// ─────────────────────────────────────────────
const FUNCTION_SCENARIOS = [
  { id: 1, text: "You pay $4 for coffee — the barista doesn't need to want what you produce.", fn: "exchange", label: "Medium of Exchange" },
  { id: 2, text: "You save $500/month toward a house down payment — money holds your purchasing power over time.", fn: "store", label: "Store of Value" },
  { id: 3, text: "Zillow lists a home at $420,000 — that single number compares it to every other home, stock, or product.", fn: "account", label: "Unit of Account" },
  { id: 4, text: "A 30-year mortgage states $2,200/month — money allows a future obligation to be precisely specified today.", fn: "deferred", label: "Standard of Deferred Payment" },
  { id: 5, text: "Your paycheck arrives — it was deferred payment for past labor (deferred), received in a spendable form (medium), deposited to hold value (store), stated in dollars (unit).", fn: "all", label: "All Four Functions" },
  { id: 6, text: "Bitcoin: price swings 30–80% per year; most merchants won't accept it; prices stay quoted in dollars.", fn: "fails", label: "Fails the Money Test" },
];

const MONEY_FUNCTIONS = [
  { id: "exchange", label: "Medium of Exchange", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { id: "store", label: "Store of Value", color: "bg-green-100 border-green-300 text-green-800" },
  { id: "account", label: "Unit of Account", color: "bg-amber-100 border-amber-300 text-amber-800" },
  { id: "deferred", label: "Standard of Deferred Payment", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { id: "all", label: "All Four Functions", color: "bg-teal-100 border-teal-300 text-teal-800" },
  { id: "fails", label: "Fails the Money Test", color: "bg-red-100 border-red-300 text-red-800" },
];

function FunctionsClassifyStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const total = FUNCTION_SCENARIOS.length;
  const correct = checked ? FUNCTION_SCENARIOS.filter(s => answers[s.id] === s.fn).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 2 — Functions of Money Classifier</p>
        <p className="text-muted-foreground text-xs mb-2">Match each real-world situation to the function of money it illustrates. An asset must perform all four to truly be money.</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {MONEY_FUNCTIONS.map(f => (
            <span key={f.id} className={`px-2 py-0.5 rounded-full border font-medium text-center ${f.color}`}>{f.label}</span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {FUNCTION_SCENARIOS.map(s => {
          const ans = answers[s.id];
          const isCorrect = checked && ans === s.fn;
          const isWrong = checked && ans && ans !== s.fn;
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 text-sm transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="font-medium text-foreground mb-2">{s.text}</p>
              <select
                disabled={checked}
                value={ans || ""}
                onChange={e => setAnswers(a => ({ ...a, [s.id]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">— select the function —</option>
                {MONEY_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ ${s.label}` : `✗ Answer: ${s.label}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Answers
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "All six scenarios correctly classified!" : "Review the answers above, then continue."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 3 — Money or Not? Verdict Cards
// ─────────────────────────────────────────────
const VERDICT_CARDS = [
  {
    id: 1, item: "Credit Card",
    question: "When you swipe your credit card at a store, does swiping more credit cards increase the money supply?",
    verdict: "NO — not money",
    verdictColor: "bg-red-100 border-red-400 text-red-800",
    explanation: "A credit card is a short-term loan. When you swipe, the bank pays the merchant and you owe the bank. Credit cards create DEBT, not money. More credit cards in circulation do NOT increase M1 or M2. Analogy: 'Using a credit card is like writing a check on someone else's account — that someone is the bank.'",
  },
  {
    id: 2, item: "Debit Card",
    question: "When you swipe your debit card, does new money get created?",
    verdict: "NO — not independently",
    verdictColor: "bg-amber-100 border-amber-400 text-amber-800",
    explanation: "A debit card is simply electronic access to checkable deposits that already exist in M1. Swiping moves an existing dollar from your account to the merchant's. No new money is created. 'The debit card is the key, not the lock box. The money is the deposit itself.'",
  },
  {
    id: 3, item: "Savings Deposit",
    question: "Is your savings account balance counted as part of the money supply?",
    verdict: "YES — counted in M2",
    verdictColor: "bg-green-100 border-green-400 text-green-800",
    explanation: "Savings deposits are included in M2 (and now also in M1 after the May 2020 reclassification when the Fed removed the 6-withdrawal/month limit). They are a store of value one transfer away from being spendable M1. 'Savings is money on deck — one transfer away from spending.'",
  },
  {
    id: 4, item: "Bitcoin",
    question: "Does Bitcoin currently qualify as money by the four-functions test?",
    verdict: "NOT YET — mostly fails",
    verdictColor: "bg-red-100 border-red-400 text-red-800",
    explanation: "Bitcoin fails the medium-of-exchange test most importantly — very few merchants accept it for everyday purchases. It fails as a stable store of value (price swings 30–80% per year). Prices stay quoted in dollars, so it fails as a unit of account. 'Bitcoin behaves more like a speculative asset — like gold or a tech stock — than like money.'",
  },
  {
    id: 5, item: "Venmo Balance",
    question: "Is your Venmo balance new money, separate from the banking system?",
    verdict: "NO — not independently",
    verdictColor: "bg-amber-100 border-amber-400 text-amber-800",
    explanation: "Your Venmo balance is just a checking-style deposit at a partner bank (Bancorp or Evolve Bank) — already counted in M1. Sending Venmo moves an existing dollar deposit; it does not create new money. M1 and M2 are unchanged. 'Venmo is to dollars what a debit card is to a checking account — access, not money.'",
  },
  {
    id: 6, item: "Stablecoin (USDC)",
    question: "Is a stablecoin like USDC counted in the official U.S. money supply?",
    verdict: "CLOSER — but not in M1/M2",
    verdictColor: "bg-blue-100 border-blue-400 text-blue-800",
    explanation: "Stablecoins are crypto tokens pegged 1:1 to the U.S. dollar, backed by reserves. They fix Bitcoin's volatility but are private issuer money — not government money, not FDIC-insured, and not included in M1/M2 as currently measured. 'A stablecoin is like a private IOU on a dollar — only as safe as the issuer.'",
  },
];

function MoneyOrNotStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const card = VERDICT_CARDS[cardIdx];
  const isLast = cardIdx === VERDICT_CARDS.length - 1;

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-green-800">All {VERDICT_CARDS.length} verdict cards complete!</p>
          <p className="text-sm text-green-700 mt-1">You've applied the four-functions test to modern payment methods.</p>
        </div>
        <button onClick={() => onComplete(VERDICT_CARDS.length, VERDICT_CARDS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 3 — Money or Not? Verdict Cards</p>
        <p className="text-muted-foreground text-xs">Apply the four-functions test: Medium of Exchange · Store of Value · Unit of Account · Standard of Deferred Payment. Predict the verdict, then reveal.</p>
        <p className="text-xs text-primary mt-1">Card {cardIdx + 1} of {VERDICT_CARDS.length}</p>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-primary">{card.item}</span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-4">{card.question}</p>

          {!revealed ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground italic">Think about whether {card.item.toLowerCase()} performs all four functions of money, then reveal the verdict.</p>
              <button onClick={() => setRevealed(true)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
                Reveal Verdict →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`rounded-xl border-2 px-4 py-3 text-center font-bold text-base ${card.verdictColor}`}>
                {card.verdict}
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
                {card.explanation}
              </div>
              {!isLast ? (
                <button onClick={() => { setCardIdx(i => i + 1); setRevealed(false); }} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">
                  Next Card →
                </button>
              ) : (
                <button onClick={() => setDone(true)} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
                  Finish Verdict Cards ✓
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 4 — Build M1 & M2
// ─────────────────────────────────────────────
const M1M2_ASSETS = [
  { id: 1, label: "Coins & paper currency in circulation", correct: "m1", hint: "Physical cash held by the public — most liquid form of money." },
  { id: 2, label: "Checkable deposits (checking accounts)", correct: "m1", hint: "Demand deposits at banks — instantly spendable by check or debit." },
  { id: 3, label: "Savings deposits (added to M1 May 2020)", correct: "m1", hint: "After the Fed removed the 6-transfer limit, savings deposits joined M1." },
  { id: 4, label: "Small time deposits / CDs (under $100K)", correct: "m2only", hint: "Certificates of deposit — fixed term, modest early-withdrawal penalty. Not instantly spendable." },
  { id: 5, label: "Retail money market mutual funds", correct: "m2only", hint: "Pooled funds in short-term securities — highly liquid but not instantly spendable cash." },
  { id: 6, label: "Stock shares (e.g. Apple stock)", correct: "neither", hint: "Stocks are financial assets but NOT part of the money supply — they are not generally accepted in payment." },
  { id: 7, label: "Credit card lines of credit", correct: "neither", hint: "Credit lines are debt capacity, not money. Using a card creates a loan, not new deposits." },
  { id: 8, label: "Government bonds held by the public", correct: "neither", hint: "Bonds are financial assets but not money — they cannot be used directly as a medium of exchange." },
];

function M1M2Station({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const total = M1M2_ASSETS.length;
  const correct = checked ? M1M2_ASSETS.filter(a => answers[a.id] === a.correct).length : 0;
  const allAnswered = Object.keys(answers).length === total;

  const choices = [
    { id: "m1", label: "M1 (and M2)", color: "bg-teal-100 border-teal-300 text-teal-800" },
    { id: "m2only", label: "M2 only", color: "bg-blue-100 border-blue-300 text-blue-800" },
    { id: "neither", label: "Neither", color: "bg-muted border-border text-muted-foreground" },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 4 — Build M1 & M2</p>
        <p className="text-muted-foreground text-xs mb-2">For each asset below, classify it: Does it belong in M1 (and therefore M2), M2 only, or Neither? Liquidity = how fast it converts to spendable cash.</p>
        <div className="flex gap-2 text-xs flex-wrap">
          {choices.map(c => <span key={c.id} className={`px-2 py-0.5 rounded-full border font-medium ${c.color}`}>{c.label}</span>)}
        </div>
        <p className="text-xs text-muted-foreground italic mt-1">Rule of thumb: M1 = what you spend; M2 = what you can convert to spending within days to weeks.</p>
      </div>
      <div className="space-y-2">
        {M1M2_ASSETS.map(a => {
          const ans = answers[a.id];
          const isCorrect = checked && ans === a.correct;
          const isWrong = checked && ans && ans !== a.correct;
          const correctChoice = choices.find(c => c.id === a.correct);
          return (
            <div key={a.id} className={`rounded-xl border-2 p-3 transition ${isCorrect ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border bg-card"}`}>
              <p className="text-sm font-medium text-foreground mb-2">{a.label}</p>
              <div className="flex gap-2">
                {choices.map(c => (
                  <button key={c.id} disabled={checked}
                    onClick={() => setAnswers(prev => ({ ...prev, [a.id]: c.id }))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      ans === c.id
                        ? checked
                          ? isCorrect ? "border-green-500 bg-green-200 text-green-900" : "border-red-400 bg-red-200 text-red-900"
                          : "border-primary bg-primary/20 text-primary"
                        : `${c.color} opacity-60 hover:opacity-100`
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
              {checked && (
                <p className={`text-xs mt-1.5 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? `✓ Correct` : `✗ Answer: ${correctChoice?.label} — ${a.hint}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!checked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40">
          Check Answers
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-xl p-3 text-center ${correct === total ? "bg-green-50 border-2 border-green-300" : "bg-amber-50 border-2 border-amber-300"}`}>
            <p className="font-bold text-lg">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">{correct === total ? "Perfect — you built M1 and M2 correctly!" : "Review the answers above, then continue."}</p>
          </div>
          <button onClick={() => onComplete(correct, total)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 5 — Stepped T-Account: How Banks Create Money
// ─────────────────────────────────────────────
const TACCOUNT_STEPS = [
  {
    step: 1,
    title: "Singleton Bank receives $10M in new deposits",
    before: { assets: [["Reserves", "$10,000,000"], ["Loans", "$0"]], liabilities: [["Deposits", "$10,000,000"]], total: "$10,000,000" },
    after: null,
    question: "With a 10% reserve requirement, how much must Singleton keep as reserves?",
    options: ["$500,000 (5%)", "$1,000,000 (10%)", "$2,000,000 (20%)", "$10,000,000 (100%)"],
    correct: 1,
    exp: "Reserve requirement = 10% × $10M = $1,000,000. Singleton must hold $1M in reserves (at the Fed or as vault cash). The remaining $9M is excess reserves — available to lend. Note: since March 2020, the Fed set the legal minimum to 0%, but banks still maintain prudential reserves.",
  },
  {
    step: 2,
    title: "Singleton lends $9M to Hank's Auto Supply",
    before: null,
    after: { assets: [["Reserves", "$1,000,000"], ["Loans (Hank's)", "$9,000,000"]], liabilities: [["Deposits", "$10,000,000"]], total: "$10,000,000" },
    question: "Singleton makes the loan by crediting Hank's account with $9M. What happens to the TOTAL money supply (M1)?",
    options: ["M1 falls by $9M — Singleton moved money from reserves to loans", "M1 is unchanged — the loan just shifts money within the bank", "M1 rises by $9M — the loan creates a NEW deposit at Singleton; Hank has $9M that didn't exist before the loan", "M1 rises by $10M — the full deposit amount enters the money supply"],
    correct: 2,
    exp: "Key insight: Singleton's loan DID NOT reduce M1 — it CREATED new money. When a bank makes a loan, it credits the borrower's deposit account with new funds. Both sides of the balance sheet expand. Total deposits: $10M (original) + $9M (new loan deposit) = $19M. Money supply grew $9M from one loan — and the process continues.",
  },
  {
    step: 3,
    title: "Hank writes a check; supplier deposits at First National Bank",
    before: null,
    after: null,
    question: "First National now has $9M in new deposits. With a 10% reserve requirement, how much can it lend?",
    options: ["$9,000,000 — it can lend all new deposits", "$8,100,000 — keeps 10% ($900K) as reserves, lends $8.1M", "$1,000,000 — it can only lend its required reserves", "$10,000,000 — the multiplier effect doubles the deposit"],
    correct: 1,
    exp: "First National keeps 10% of $9M = $900,000 in reserves, lending $8.1M. That $8.1M gets deposited at another bank, which keeps 10% and lends 90% — and so on. Each round creates new money, but smaller each time. The total across ALL rounds: $10M × (1/0.10) = $100M in total deposits from the original $10M. The money multiplier = 1/Reserve Requirement.",
  },
];

function TCreateStation({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const step = TACCOUNT_STEPS[stepIdx];
  const isLast = stepIdx === TACCOUNT_STEPS.length - 1;

  function handleCheck() {
    if (sel === null) return;
    const correct = sel === step.correct;
    setScore(s => s + (correct ? 1 : 0));
    setChecked(true);
  }
  function handleNext() { setSel(null); setChecked(false); setStepIdx(i => i + 1); }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Station 5 — How Banks Create Money: The T-Account</p>
        <p className="text-muted-foreground text-xs">Walk through Singleton Bank's deposit expansion step by step. Assets = Liabilities + Net Worth — the balance sheet always balances.</p>
        <p className="text-xs text-primary mt-1">Step {stepIdx + 1} of {TACCOUNT_STEPS.length}</p>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-bold text-foreground">Step {step.step}: {step.title}</p>

        {/* Show T-Account */}
        {(step.before || step.after) && (
          <div className="rounded-lg overflow-hidden border border-border text-xs">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="bg-primary/5 p-2">
                <p className="font-bold text-primary mb-1 uppercase tracking-wide text-xs">Assets</p>
                {(step.after || step.before)!.assets.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5"><span className="text-muted-foreground">{k}</span><span className="font-mono font-semibold">{v}</span></div>
                ))}
                <div className="flex justify-between pt-1 mt-1 border-t border-border font-bold">
                  <span>TOTAL</span><span className="font-mono">{(step.after || step.before)!.total}</span>
                </div>
              </div>
              <div className="bg-secondary/5 p-2">
                <p className="font-bold text-primary mb-1 uppercase tracking-wide text-xs">Liabilities</p>
                {(step.after || step.before)!.liabilities.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5"><span className="text-muted-foreground">{k}</span><span className="font-mono font-semibold">{v}</span></div>
                ))}
                <div className="flex justify-between pt-1 mt-1 border-t border-border font-bold">
                  <span>TOTAL</span><span className="font-mono">{(step.after || step.before)!.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm font-semibold text-foreground">{step.question}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => (
            <button key={i} disabled={checked} onClick={() => setSel(i)}
            aria-pressed={sel === i}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                checked
                  ? i === step.correct ? "border-green-500 bg-green-50 text-green-900"
                    : i === sel && sel !== step.correct ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground opacity-60"
                  : sel === i ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}>{opt}</button>
          ))}
        </div>
        {checked && (
          <div className={`rounded-lg p-3 text-xs ${sel === step.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {sel === step.correct ? "✓ Correct — " : "✗ Not quite — "}{step.exp}
          </div>
        )}
        {!checked && sel !== null && (
          <button onClick={handleCheck} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Check Answer</button>
        )}
        {checked && !isLast && (
          <button onClick={handleNext} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition">Next Step →</button>
        )}
        {checked && isLast && (
          <button onClick={() => onComplete(score, TACCOUNT_STEPS.length)} className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition">Mark Complete ✓</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 6 — Money Multiplier Calculation
// ─────────────────────────────────────────────
const MULTIPLIER_QS = [
  {
    q: "The money multiplier formula is: Money Multiplier = 1 ÷ Reserve Requirement. If the reserve requirement is 10%, what is the theoretical money multiplier and what does it mean?",
    options: [
      "Multiplier = 10 — each $1 of new reserves can support up to $10 of total deposits in the banking system",
      "Multiplier = 0.10 — the Fed keeps 10% of all deposits as the money supply",
      "Multiplier = 100 — every $1 of reserves creates $100 of new money",
      "Multiplier = 90 — the bank can lend 90% of its reserves",
    ],
    correct: 0,
    exp: "Money Multiplier = 1/RR = 1/0.10 = 10. Meaning: $10M initial deposit × 10 = $100M total deposits system-wide after full expansion. Each round: bank keeps 10%, lends 90%, that 90% gets redeposited elsewhere, which keeps 10%, lends 90% — geometric series summing to 10× the original injection. From your slides: $10M initial × multiplier 10 = $100M total deposits.",
  },
  {
    q: "The Singleton Bank example: $10M initial deposit, 10% reserve requirement. After the full deposit expansion chain, what are the totals?",
    options: [
      "Total deposits: $19M · Total reserves: $1M · Total loans: $9M",
      "Total deposits: $10M (no change) · Total reserves: $1M · Total loans: $9M",
      "Total deposits: $90M · Total reserves: $9M · Total loans: $81M",
      "Total deposits: $100M · Total reserves: $10M · Total loans: $90M",
    ],
    correct: 3,
    exp: "Full expansion with 10% RR and $10M initial deposit: Total deposits = $10M × 10 = $100M. Total reserves = 10% × $100M = $10M (held across all banks). Total loans = $100M − $10M = $90M. The original $10M is now $10M in reserves + $90M in loans across the banking system. 'From a single $10M deposit, the entire banking system creates $100M total deposits.'",
  },
  {
    q: "Since March 2020, the Fed set the reserve requirement to 0%. Does this mean the money multiplier is now infinite and banks can create unlimited money?",
    options: [
      "No — while the theoretical multiplier is infinite with 0% RR, actual lending is constrained by capital requirements (Basel III), loan demand (creditworthy borrowers must want loans), and the IORB rate (banks earn risk-free interest on reserves, reducing incentive to lend aggressively)",
      "Yes — with 0% reserve requirement, the theoretical multiplier is infinite and banks can lend out 100% of all deposits",
      "Yes — M2 has grown infinitely since March 2020 because there are no reserve limits",
      "No — the Fed replaced reserve requirements with a 5% minimum that banks must hold voluntarily",
    ],
    correct: 0,
    exp: "With 0% legal reserve requirement, the theoretical multiplier is infinite — but real-world constraints keep actual lending finite: (1) Capital requirements (Basel III): banks must maintain equity capital ratios, which now constrain lending more than reserve requirements ever did. (2) Loan demand: banks can only lend if creditworthy borrowers want loans. (3) IORB: the Fed pays banks interest on reserve balances — earning risk-free IORB removes incentive to lend aggressively into risky loans. '0% reserve requirement doesn't mean 0% safety — capital ratios + FDIC + Fed backstop do the work that reserve requirements used to.'",
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
        <p className="font-semibold text-foreground mb-2">Station 6 — The Money Multiplier</p>
        <div className="bg-background border border-border rounded-lg p-3 text-xs">
          <p className="font-bold text-primary mb-1">Money Multiplier = 1 ÷ Reserve Requirement</p>
          <p className="text-foreground font-mono">10% RR → Multiplier = 10 → $10M creates $100M total deposits</p>
          <p className="text-muted-foreground mt-1">Real-world actual multiplier is lower: excess reserves + cash leakage + loan demand constraints + post-2008 IORB.</p>
        </div>
      </div>
      <SteppedQuiz q={q} idx={idx} total={MULTIPLIER_QS.length} sel={sel} setSel={setSel} checked={checked} onCheck={handleCheck} onNext={handleNext} isLast={isLast} score={score} onComplete={onComplete} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Station 7 — Personal Finance
// ─────────────────────────────────────────────
const PERSONALFINANCE_QS = [
  {
    q: "Your slides say: 'Know your FDIC limit.' You have $300,000 in a single savings account at one bank. How much of this is federally insured against bank failure?",
    options: [
      "$300,000 — all deposits at any U.S. bank are fully insured regardless of amount",
      "$0 — savings accounts are insured by the NCUA, not the FDIC",
      "$500,000 — joint account rules double the limit for single depositors",
      "$250,000 — the FDIC insures up to $250,000 per depositor, per insured bank, per ownership category. The extra $50K is uninsured.",
    ],
    correct: 3,
    exp: "FDIC covers $250,000 per depositor, per insured bank, per ownership category. Your $300,000 in a single account at one bank: $250K insured, $50K uninsured. Strategy for larger balances: spread across multiple banks or ownership categories. Joint accounts get $500K ($250K per co-owner). Credit unions are insured by NCUA to the same $250K limit. 'Most people never approach this limit — but if you do, the fix is simple: diversify banks, not just investments.'",
  },
  {
    q: "Your slides describe three banking options: commercial banks, credit unions, and online banks. Which statement correctly matches each to its main advantage?",
    options: [
      "Commercial banks: highest APY · Credit unions: best loan rates · Online banks: most convenient branches",
      "All three are legally identical — the only difference is the name on the door",
      "Commercial banks: broadest convenience and services · Credit unions: often better savings/loan rates (member-owned, not-for-profit) · Online banks: highest APY due to no physical branch overhead",
      "Credit unions: highest APY · Online banks: most convenient · Commercial banks: best loan rates",
    ],
    correct: 2,
    exp: "From your slides: Commercial banks (JPMorgan, Bank of America, community banks) — full services, most locations, widest convenience. Credit unions (4,760+ federally insured) — member-owned, not-for-profit cooperatives; often offer better savings rates and lower loan rates because profits return to members. Online/fintech banks (Ally, Marcus, SoFi) — no physical branches means lower overhead → savings passed to customers as higher APY. FDIC/NCUA insured to the same $250K. 'Pick the mix that fits your needs.'",
  },
  {
    q: "Your slides describe a 'liquidity ladder' for savings. Which correctly matches each savings vehicle to when you should use it?",
    options: [
      "Checking for long-term goals · High-yield savings for daily spending · CDs for emergency fund · Stocks for monthly bills",
      "Checking for monthly bills · High-yield savings for 3–6 month emergency fund · CDs/T-bills for 1–2 year goals · Bonds & stocks for long-term",
      "Put everything in stocks — they have the highest long-run return, making liquidity irrelevant",
      "CDs for monthly bills (they earn the most) · Checking for long-term (safest) · Savings for medium goals",
    ],
    correct: 1,
    exp: "The liquidity ladder matches time horizon to instrument: (1) Checking — monthly bills, immediately spendable M1; (2) High-yield savings — 3–6 month emergency fund, still liquid but earns meaningful APY; (3) CDs and T-bills — 1–2 year goals, earn more but lock up funds for a defined term; (4) Bonds and stocks — long-term (5+ year) goals, higher expected return justifies illiquidity risk. Match liquidity to when you'll need the cash — don't lock up your emergency fund in a CD or keep your retirement savings in checking.",
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
        <p className="font-semibold text-foreground mb-2">Station 7 — Personal Finance & Banking</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[["Know Your FDIC Limit","$250K per depositor per bank per category. Over $250K: spread across banks."],["Bank vs. CU vs. Online","Commercial = convenience. CU = better rates. Online = highest APY. FDIC/NCUA all same."],["Liquidity Ladder","Match savings vehicle to time horizon: checking → HYSA → CDs → bonds/stocks."]].map(([label, desc]) => (
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
  { front: "Barter", back: "A system of exchange without money, trading goods and services directly. Requires a double coincidence of wants and suffers from problems of indivisibility, perishability, and high transaction costs." },
  { front: "Medium of Exchange", back: "The defining function of money — accepted in payment for goods and services by everyone in the economy. What makes something money rather than merely an asset." },
  { front: "Store of Value", back: "Money holds purchasing power over time, allowing people to save today and spend later. Inflation erodes this function." },
  { front: "Unit of Account", back: "Money provides a common measuring unit for pricing all goods and services, eliminating the need for separate exchange rates between every pair of goods." },
  { front: "Commodity Money", back: "Money with intrinsic value independent of its use as money. Examples: gold, silver, salt (Roman soldiers), tobacco (Colonial Virginia), cigarettes (WWII POW camps)." },
  { front: "Fiat Money", back: "Money with no intrinsic value, backed only by government decree and legal tender laws. Every major currency today (dollar, euro, yen) is fiat money. The U.S. left the gold standard in 1971." },
  { front: "M1 Money Supply", back: "The most liquid measure of money: coins and currency in circulation, checkable deposits, and savings deposits (added May 2020). 'What you spend.'" },
  { front: "M2 Money Supply", back: "M1 plus near-money assets: money market mutual funds, small time deposits/CDs under $100K, and other liquid deposits. 'What you can convert to spending within days to weeks.'" },
  { front: "Fractional Reserve Banking", back: "Banks hold only a fraction of deposits as reserves and lend out the rest. A $10M deposit with a 10% reserve requirement allows $9M in new loans — creating new money in the process." },
  { front: "Money Multiplier", back: "1 ÷ Reserve Requirement. The theoretical maximum amount of new money created from an initial deposit. At 10% RR: multiplier = 10, so $10M deposit → $100M in total deposits." },
  { front: "Interest Rate Spread", back: "The difference between the rate banks charge on loans and the rate they pay on deposits. A bank charging 6% on mortgages and paying 2% on savings earns a 4% spread — its gross profit margin." },
  { front: "FDIC", back: "Federal Deposit Insurance Corporation. Insures bank deposits up to $250,000 per depositor per bank per ownership category. Established in 1933 to prevent bank runs by eliminating depositors' rational fear of loss." },
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
        <p className="font-semibold text-foreground mb-1">Flashcard Review — Chapter 14 Key Terms</p>
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
// Quiz pool — 15 questions, fresh scenarios, balanced A/B/C/D
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: "A medieval village uses a system where the blacksmith trades horseshoes for grain, the farmer trades grain for cloth, and the weaver trades cloth for horseshoes. One day the blacksmith needs grain but the farmer doesn't need horseshoes. Which barter problem is this?", options: ["Double coincidence of wants — the blacksmith can't find a farmer who simultaneously wants horseshoes AND has grain to spare", "Indivisibility — horseshoes can't be split to partially pay for grain", "Perishability — the grain will rot before the exchange can be arranged", "High transaction costs — it takes too long to find any trading partner"], correct: 0, exp: "Double coincidence of wants: you must find someone who (1) wants exactly what you have AND (2) has exactly what you want — simultaneously. The blacksmith has horseshoes but the farmer doesn't want horseshoes right now. Money solves this by letting the blacksmith sell horseshoes to anyone who wants them and use the money to buy grain from the farmer — no simultaneous match required." },
  { q: "A student pays tuition at her community college by swiping her credit card. Her friend pays the same tuition with a personal check from her checking account. Which student's payment increases the money supply, and why?", options: ["The checking account payment leaves M1 unchanged (moves existing money); the credit card payment does not create new money either (it creates a loan, not a deposit)", "Neither — both payments just transfer existing money", "Both — any payment increases M1 because money changes hands", "The credit card payment increases M2 because credit cards are near-money instruments"], correct: 0, exp: "The checking account debit reduces the student's balance and increases the college's balance — it moves existing M1 money, net change = zero. The credit card swipe: the bank pays the college, and the student now owes the bank — this creates a loan (debt), not new money. Credit cards are NOT part of the money supply. More credit cards in circulation do not increase M1 or M2. 'A credit card is like writing a check on someone else's account — that someone is the bank.'" },
  { q: "In 2021, El Salvador made Bitcoin legal tender. A textbook author argues this alone doesn't make Bitcoin 'money' by economic standards. Why?", options: ["Because Bitcoin is not physical — only paper currency and coins qualify as money", "Because only the U.S. Federal Reserve can declare something to be money", "Because Bitcoin has a limited supply of 21 million coins, making it too scarce to function as money", "Because Bitcoin still fails key functions: very few global merchants accept it (medium of exchange test), its value swings 30–80%/year (store of value test fails), and prices everywhere remain quoted in dollars (unit of account test fails)"], correct: 3, exp: "Money must perform all four functions. Bitcoin's challenges: (1) Medium of exchange — very few merchants globally accept it for everyday transactions; (2) Store of value — 30–80% annual price swings make it unreliable for saving; (3) Unit of account — prices worldwide remain quoted in dollars, euros, etc., not Bitcoin; (4) Deferred payment — loan contracts stated in Bitcoin would be extremely risky given volatility. El Salvador's legal tender status gives it political sanction but doesn't fix the economic function failures." },
  { q: "The Federal Reserve reports that M1 = $20.3 trillion and M2 = $21.4 trillion in November 2021. What does the $1.1 trillion difference represent?", options: ["Near-money assets in M2 but not M1: retail money market mutual funds, small CDs, and other liquid deposits that are not immediately spendable but convertible within days to weeks", "The amount of physical currency in circulation — cash not held in bank accounts", "The federal government's reserve holdings at the Fed — not counted in the public money supply", "The amount of money created by QE that has not yet circulated into the economy"], correct: 0, exp: "M2 = M1 + near-money assets. The $1.1T gap represents: retail money market mutual funds (highly liquid but not instantly spendable cash), small time deposits/CDs under $100K (fixed term), and other liquid deposits. These assets are close to money in liquidity but don't qualify for M1 because they aren't immediately spendable without some conversion step. 'M1 = what you spend; M2 = what you can convert to spending within days to weeks.'" },
  { q: "A bank has $50M in deposits and a 10% reserve requirement. It currently holds $5M in reserves and $45M in loans. A depositor withdraws $2M in cash. What must the bank do?", options: ["Nothing — withdrawals from deposits reduce liabilities and assets equally, leaving the reserve ratio unchanged", "The bank must now hold $4.8M in reserves (10% of new $48M deposits) but only has $3M after the withdrawal — it must call in loans or borrow reserves to restore the ratio", "The bank can simply print $2M in new currency to replace the withdrawn cash", "The bank's reserve ratio improves because withdrawals reduce required reserves more than they reduce actual reserves"], correct: 1, exp: "After the $2M withdrawal: deposits fall to $48M; required reserves = 10% × $48M = $4.8M; actual reserves = $5M − $2M cash paid out = $3M. The bank is now $1.8M short of its reserve requirement. It must either call in loans, sell assets, borrow from other banks (fed funds market), or borrow from the Fed's discount window. This is the liquidity management challenge banks face daily — why holding excess reserves provides a buffer." },
  { q: "Your slides describe the 'deposit expansion chain.' A new $5M deposit enters the banking system with a 20% reserve requirement. What is the theoretical maximum total increase in deposits across the entire banking system?", options: ["$5 million — the initial deposit is all that's created", "$25 million — multiplier = 1/0.20 = 5, so $5M × 5 = $25M in total deposits", "$20 million — multiplier = 1/0.20 = 5, so $5M × 5 = $25M total, minus the original $5M = $20M new money", "$4 million — the bank lends 80% of $5M = $4M, creating $4M in new deposits"], correct: 1, exp: "Money Multiplier = 1/RR = 1/0.20 = 5. Total deposits = $5M × 5 = $25M. This is the theoretical maximum if: all loans are redeposited, no cash leakage, no excess reserves. The $5M original deposit + $20M in successive new deposits created through the lending chain = $25M total system-wide deposits. In practice, the actual multiplier is lower due to cash leakage, excess reserves, and loan demand constraints." },
  { q: "In March 2020, the Fed reduced the reserve requirement to 0%. A student concludes: 'Banks can now create infinite money!' What is the correct response?", options: ["The student is correct — with 0% RR, the money multiplier is infinite and bank lending is unconstrained", "The student is incorrect — capital requirements (Basel III) now constrain lending more than reserve requirements ever did, and the IORB rate gives banks an incentive to hold reserves rather than lend them all out", "The student is correct about the math but wrong about the timing — it will take years for banks to fully expand to the theoretical maximum", "The student is incorrect because the Fed simultaneously raised reserve requirements for large banks when it set small bank requirements to 0%"], correct: 1, exp: "With 0% RR, the theoretical multiplier is mathematically infinite — but real lending is constrained: (1) Basel III capital requirements require banks to hold equity capital proportional to risk-weighted assets — this binds far more tightly than old reserve requirements; (2) IORB: the Fed pays banks interest on reserve balances — banks can earn a risk-free return on reserves rather than making risky loans; (3) Loan demand: banks can only lend if creditworthy borrowers want loans. '0% reserve requirement doesn't mean 0% safety — capital ratios + FDIC + Fed backstop do the work.'" },
  { q: "A bank's T-account shows: Assets — Reserves $2M, Loans $16M, Bonds $2M (Total $20M); Liabilities — Deposits $18M, Net Worth $2M (Total $20M). What is this bank's reserve ratio and what does the Net Worth represent?", options: ["Reserve ratio = 10% ($2M/$20M). Net Worth = the bank's equity buffer — it absorbs loan losses before depositors are harmed.", "Reserve ratio = 11.1% ($2M/$18M). Net Worth = the total of all outstanding loans minus defaults.", "Reserve ratio = 10% ($2M/$20M). Net Worth = government-required insurance premiums paid to the FDIC.", "Reserve ratio = 20% (reserve + bonds combined $4M / deposits $18M). Net Worth = shareholder dividends not yet paid."], correct: 1, exp: "Reserve ratio = Reserves ÷ Deposits = $2M ÷ $18M = 11.1%. Important: divide by deposits (the liability), not total assets. Net Worth (also called bank capital or equity): Assets − Liabilities = $20M − $18M = $2M. This equity buffer is the first line of defense: if loans go bad, losses erode net worth before touching depositor funds. Basel III requires banks to maintain capital ratios above minimum thresholds — this is now the primary constraint on bank lending." },
  { q: "Silicon Valley Bank (SVB) failed in March 2023. It had loaded its portfolio with long-duration Treasury bonds when rates were near zero. What was the sequence of events that caused failure?", options: ["SVB made too many risky startup loans that defaulted simultaneously, wiping out its capital", "SVB's depositors were mostly FDIC-insured, so the run was irrational and caused by panic alone", "SVB failed because it violated the 10% reserve requirement by lending out too many deposits", "The Fed raised rates rapidly (2022–23) → SVB's long-duration bonds fell in market value → unrealized losses emerged → concentrated uninsured tech depositors learned of the losses → social media spread fear → $42B bank run in one day → FDIC seizure"], correct: 3, exp: "The SVB failure sequence: (1) Bought long-duration Treasuries at ~1.5% in 2021 (good yield at the time); (2) Fed raised rates to 5.25% → those bonds' market value fell sharply; (3) SVB disclosed unrealized losses; (4) Concentrated depositor base = mostly tech-startup companies with >$250K (uninsured); (5) Social media spread the news instantly; (6) $42B withdrawn in one day — the fastest bank run in history; (7) FDIC seized SVB. Lesson: duration mismatch + concentrated uninsured deposits + social media = catastrophic run risk." },
  { q: "The pre-2008 Fed used open market operations (buying/selling Treasuries) to control the money supply. The post-2008 Fed uses IORB (Interest on Reserve Balances) instead. Why did the framework change?", options: ["The 2008 crisis caused the Fed to lose authority over open market operations — Congress gave that power to the Treasury", "The new framework was required by Basel III international banking regulations adopted after the crisis", "QE flooded the banking system with far more reserves than required, making the old 'scarcity of reserves' framework unworkable. With abundant reserves, the Fed can't push rates up by draining reserves — instead, IORB sets a floor: banks won't lend to each other below the risk-free IORB rate", "Interest on reserve balances was always the Fed's primary tool — the media simply didn't cover it before 2008"], correct: 2, exp: "Pre-2008: banks held just enough reserves to meet requirements. Fed could push rates by adding/draining scarce reserves — small changes had big effects. Post-2008: QE flooded the system with trillions in excess reserves. In an ample-reserves environment, draining some reserves doesn't make them scarce — rates don't respond. The new tool: IORB sets a floor because no rational bank lends to another bank at a rate below what the Fed pays risk-free. 'This framework shift is why Chapter 15 focuses on the federal funds rate and IORB rather than reserve requirements.'" },
  { q: "A credit union offers 4.8% APY on savings accounts while your current big commercial bank offers 0.5% APY. Should you automatically move your savings to the credit union?", options: ["Yes — the higher APY always makes the credit union superior regardless of other factors", "No — credit unions are not FDIC-insured, so the higher APY compensates for higher risk", "No — credit unions can only accept deposits from government employees", "Consider it — credit unions are NCUA-insured to the same $250K limit as FDIC; the rate difference often reflects lower overhead from the member-owned not-for-profit structure, but trade-offs include convenience (fewer ATMs/branches) and eligibility requirements"], correct: 3, exp: "Credit unions are insured by NCUA to the same $250K limit as FDIC — no additional risk from higher APY. The rate difference reflects structure: credit unions are member-owned, not-for-profit cooperatives — profits return to members as higher savings rates and lower loan rates rather than going to shareholders. Trade-offs: (1) Eligibility — must share a common bond (employer, community, profession); (2) Convenience — fewer branches and ATMs than major banks; (3) Services — may not offer all products (business accounts, complex investment products). Your slides: 'Pick the mix that fits your needs.'" },
  { q: "You receive a $15,000 tax refund. Using the liquidity ladder framework, how should you allocate it?", options: ["Consider: $0 to checking (already funded for monthly bills), top up high-yield savings to 3–6 months of expenses (emergency fund), remainder in CDs/T-bills if you have a 1–2 year goal, or index funds if this is genuinely long-term money you won't need for 5+ years", "Put all $15,000 in stocks immediately — the liquidity ladder is too conservative for a 25-year-old", "Put all $15,000 in a checking account — liquidity is paramount for any unexpected expense", "Put all $15,000 in CDs — they earn more than savings and are still liquid"], correct: 0, exp: "Liquidity ladder application: (1) Checking — for monthly bills only; already funded, no need to add. (2) High-yield savings — emergency fund target: 3–6 months of living expenses. If not yet funded, top this up first. (3) CDs/T-bills — for known 1–2 year expenses (car, home down payment, tuition). Higher yield, but penalty for early withdrawal. (4) Index funds — only for genuinely long-term money (5+ years) where you can ride out market volatility. The key: match liquidity to when you'll need the cash. Don't lock up your emergency fund in a CD." },
  { q: "A Roman general pays his soldiers in salt. Which barter problem does salt-as-money solve that paying in, say, farm animals would NOT solve?", options: ["Salt solves the double coincidence problem — soldiers can always find merchants who want salt", "Salt solves the indivisibility and perishability problems that farm animals cannot — salt can be divided into small portions and stored for months without rotting, unlike livestock", "Salt solves the high transaction costs problem by allowing soldiers to shop without negotiating barter terms", "Salt solves the unit of account problem — its price is more stable than grain or cloth"], correct: 1, exp: "Salt has properties that make it superior commodity money vs. farm animals: Divisibility — salt can be divided into any quantity (a few grains to a full sack), unlike a cow or sheep. Storability — salt preserves almost indefinitely and was historically used AS a preservative, unlike livestock or grain. This is why 'salary' derives from the Latin 'salarium' (salt allowance). Farm animals fail on both: you can't give someone 1/7th of a cow, and animals don't store well. This illustrates why good money needs to be divisible, durable, portable, and uniform." },
  { q: "Your bank's T-account shows total deposits of $500,000. The bank currently holds $60,000 in reserves. The Fed's reserve requirement is 0% (post-March 2020). A bank examiner arrives for a routine inspection. Should she be concerned about the reserve level?", options: ["Yes — any reserve ratio below 10% is a regulatory violation regardless of Fed policy changes since 2020", "No — with 0% legal reserve requirement, the bank has no obligation to hold any reserves at all", "Not necessarily from a reserve standpoint — with 0% RR the bank is legally compliant holding any amount of reserves. The examiner would focus instead on capital ratios (Basel III equity requirements) and the composition/quality of the loan portfolio", "Yes — the bank needs at least $50,000 in reserves (10% of deposits) to be safe regardless of the legal minimum"], correct: 2, exp: "Since March 2020, the Fed's legal reserve requirement is 0% — so any level of reserves, including zero, satisfies the reserve requirement. The bank examiner's real concerns now center on: (1) Capital ratios — does the bank maintain enough equity (net worth) relative to risk-weighted assets under Basel III? (2) Loan quality — are borrowers creditworthy? Are loans diversified? (3) Liquidity stress — can the bank handle unexpected withdrawal spikes? Reserve requirements no longer do the work they once did; capital requirements are now the binding regulatory constraint." },
  { q: "Suppose the entire banking system starts with $50M in new reserves, the reserve requirement is 5%, but banks voluntarily hold 8% (excess reserves). What is the actual total deposit expansion?", options: ["$1 billion — theoretical multiplier = 1/0.05 = 20, so $50M × 20 = $1B", "Zero — excess reserves cannot be lent out under any circumstances", "$625 million — actual multiplier = 1/0.08 = 12.5, so $50M × 12.5 = $625M", "$500 million — the 5% and 8% figures average to 6.5%, giving a multiplier of ~15"], correct: 2, exp: "The actual multiplier uses the actual reserve ratio held (not the legal minimum). Banks voluntarily hold 8% despite the 5% requirement → actual multiplier = 1/0.08 = 12.5. Total deposits = $50M × 12.5 = $625M (not $1B). This illustrates why the theoretical maximum (1/RR using the legal minimum) overstates real deposit creation: banks hold excess reserves, especially post-2008 when the Fed pays IORB. The actual money multiplier in the U.S. post-QE has been well below the theoretical maximum precisely because banks hold vast excess reserves earning IORB." },
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
        <p className="font-semibold text-foreground">Chapter 14 Quiz</p>
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

const STATION_LABELS_CH14: Record<string, string> = {
  bartersort:       "Barter Sorter",
  functionsclassify:"Functions Classifier",
  moneyornot:       "Money or Not?",
  m1m2:             "Build M1 & M2",
  tcreate:          "T-Account: Banks Create Money",
  multiplier:       "Money Multiplier",
  personalfinance:  "Personal Finance",
  flash:            "Flashcard Review",
};

function ResultsScreen({ score, results, sectionScores, onRestart, courseTitle }: {
  score: number; results: { correct: boolean; exp: string }[];
  sectionScores: Record<string, { score: number; total: number }>;
  onRestart: () => void; courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const stationRows = Object.entries(STATION_LABELS_CH14).filter(([id]) => sectionScores[id]).map(([id, label]) => ({ label, ...sectionScores[id] }));
  function printPDF() {
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const stRows = stationRows.map(r => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.label}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score}/${r.total}</td><td style="text-align:center;padding:7px 10px;border-bottom:1px solid #e2e8f0">${r.score===r.total?"✓":r.score>=r.total*0.7?"Good":"Review"}</td></tr>`).join("");
    const qRows = results.map((r,i) => `<tr style="background:${r.correct?"#f0fdf4":"#fef2f2"}"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${r.correct?"✓":"✗"}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">Question ${i+1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;color:#475569">${r.exp}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>ECO 210 Ch14 Results</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{color:#1a2744;font-size:1.3rem;margin-bottom:4px}h2{font-size:1rem;color:#475569;font-weight:normal;margin-top:0}h3{font-size:0.9rem;color:#1e293b;margin:20px 0 8px}.score-box{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:14px;text-align:center;margin:16px 0}.score-box p{margin:0;color:#166534;font-size:1.1rem;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}th{background:#1a2744;color:white;padding:8px 10px;text-align:left}tr:nth-child(even) td{background:#f8fafc}footer{font-size:0.7rem;color:#94a3b8;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}</style></head><body>
    <h1>${courseTitle}</h1><h2>Chapter 14 — Money &amp; Banking</h2>
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
        <p className={`text-lg font-semibold mt-1 ${score>=9?"text-green-800":"text-amber-800"}`}>{score>=9?"Excellent — Chapter 14 Complete! ✓":"Keep Reviewing — You Need 9/10"}</p>
        <p className="text-sm text-muted-foreground mt-1">Chapter 14 — Money &amp; Banking</p>
      </div>
      <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
        <div><label htmlFor="result-name" className="text-sm font-semibold text-foreground block mb-1">Your Name (required for credit)</label>
          <input id="result-name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and Last Name" className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"/></div>
        <div><label htmlFor="exit-ticket" className="text-sm font-semibold text-foreground block mb-1">Exit Ticket: When a bank makes a loan, it creates new money. Explain the mechanism using the T-account and why this doesn't lead to infinite money creation in practice.</label>
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
  { id: "bartersort"       as Station, label: "Barter Sorter",              desc: "Sort 5 barter failure scenarios into the correct problem each illustrates", icon: "🔀" },
  { id: "functionsclassify"as Station, label: "Functions Classifier",       desc: "Classify real-life situations by which function of money they illustrate", icon: "🏷️" },
  { id: "moneyornot"       as Station, label: "Money or Not?",              desc: "Apply the four-functions test to credit cards, Bitcoin, Venmo, stablecoins", icon: "🃏" },
  { id: "m1m2"             as Station, label: "Build M1 & M2",             desc: "Classify assets: M1, M2 only, or Neither — based on liquidity", icon: "🏗️" },
  { id: "tcreate"          as Station, label: "T-Account: Banks Create Money", desc: "Walk through Singleton Bank's deposit expansion step by step", icon: "⚖️" },
  { id: "multiplier"       as Station, label: "Money Multiplier",           desc: "Calculate the multiplier, full expansion chain, and real-world cautions", icon: "✖️" },
  { id: "personalfinance"  as Station, label: "Personal Finance",           desc: "FDIC limits, bank vs. CU vs. online, the liquidity ladder", icon: "💼" },
  { id: "flash"            as Station, label: "Flashcard Review",           desc: "Master all 12 key Ch14 concepts before the quiz", icon: "📇" },
];

const NAV_STATIONS: { id: Station; label: string }[] = [
  { id: "intro",            label: "Dashboard" },
  { id: "bartersort",       label: "Barter" },
  { id: "functionsclassify",label: "Functions" },
  { id: "moneyornot",       label: "Money or Not?" },
  { id: "m1m2",             label: "M1 & M2" },
  { id: "tcreate",          label: "T-Account" },
  { id: "multiplier",       label: "Multiplier" },
  { id: "personalfinance",  label: "Personal Finance" },
  { id: "flash",            label: "Flashcards" },
  { id: "quiz",             label: "Quiz" },
];

const STATION_ORDER: Station[] = ["intro","bartersort","functionsclassify","moneyornot","m1m2","tcreate","multiplier","personalfinance","flash","quiz","results","not-yet"];

const CH14_SUMMARY = [
  { heading: "14.1 Defining Money by Its Functions", body: "Money is what people in a society regularly use when purchasing or selling goods and services. If money were not available, people would need to barter with each other, meaning that each person would need to identify others with whom they have a double coincidence of wants—that is, each party has a specific good or service that the other desires. Money serves several functions: a medium of exchange, a unit of account, a store of value, and a standard of deferred payment. There are two types of money: commodity money, which is an item used as money, but which also has value from its use as something other than money; and fiat money, which has no intrinsic value, but is declared by a government to be the country's legal tender." },
  { heading: "14.2 Measuring Money: Currency, M1, and M2", body: "We measure money with several definitions: M1 includes currency and money in checking accounts (demand deposits). Traveler's checks are also a component of M1, but are declining in use. M2 includes all of M1, plus savings deposits, time deposits like certificates of deposit, and money market funds." },
  { heading: "14.3 The Role of Banks", body: "Banks facilitate using money for transactions in the economy because people and firms can use bank accounts when selling or buying goods and services, when paying a worker or receiving payment, and when saving money or receiving a loan. In the financial capital market, banks are financial intermediaries; that is, they operate between savers who supply financial capital and borrowers who demand loans. A balance sheet (sometimes called a T-account) is an accounting tool which lists assets in one column and liabilities in another. The bank's liabilities are its deposits. The bank's assets include its loans, its ownership of bonds, and its reserves (which it does not loan out). We calculate a bank's net worth by subtracting its liabilities from its assets. Banks run a risk of negative net worth if the value of their assets declines. The value of assets can decline because of an unexpectedly high number of defaults on loans, or if interest rates rise and the bank suffers an asset-liability time mismatch in which the bank is receiving a low interest rate on its long-term loans but must pay the currently higher market interest rate to attract depositors. Banks can protect themselves against these risks by choosing to diversify their loans or to hold a greater proportion of their assets in bonds and reserves. If banks hold only a fraction of their deposits as reserves, then the process of banks' lending money, re-depositing those loans in banks, and the banks making additional loans will create money in the economy." },
  { heading: "14.4 How Banks Create Money", body: "We define the money multiplier as the quantity of money that the banking system can generate from each $1 of bank reserves. The formula for calculating the multiplier is 1/reserve ratio, where the reserve ratio is the fraction of deposits that the bank wishes to hold as reserves. The quantity of money in an economy and the quantity of credit for loans are inextricably intertwined. When banks choose to hold only limited reserves, the network of banks making loans, people making deposits, and banks making more loans creates much of the money in an economy.\n\nGiven the macroeconomic dangers of a malfunctioning banking system, Monetary Policy and Bank Regulation will discuss government policies for controlling the money supply and for keeping the banking system safe." },
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
          <h2 id="summary-title" className="font-display font-bold text-base text-foreground">Chapter 14 Summary — Money &amp; Banking</h2>
          <button ref={closeRef} onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">&times;</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {CH14_SUMMARY.map((s,i) => (
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
        <p className="font-semibold mb-1">Chapter 14 — Money &amp; Banking</p>
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
        <a href={hubUrl} target="_top" className="hidden sm:flex items-center gap-1.5 text-xs text-sidebar-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-sidebar-accent shrink-0">← Course Hub</a>
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
        {station==="intro"            && <Dashboard completed={completed} onSelect={setStation} quizUnlocked={quizUnlocked} onStartQuiz={()=>setStation("quiz")} onSummary={()=>setShowSummary(true)} />}
        {station==="bartersort"       && <BarterSortStation        onComplete={(sc,t)=>markDone("bartersort",       sc,t)} />}
        {station==="functionsclassify"&& <FunctionsClassifyStation onComplete={(sc,t)=>markDone("functionsclassify",sc,t)} />}
        {station==="moneyornot"       && <MoneyOrNotStation        onComplete={(sc,t)=>markDone("moneyornot",       sc,t)} />}
        {station==="m1m2"             && <M1M2Station              onComplete={(sc,t)=>markDone("m1m2",            sc,t)} />}
        {station==="tcreate"          && <TCreateStation           onComplete={(sc,t)=>markDone("tcreate",          sc,t)} />}
        {station==="multiplier"       && <MultiplierStation        onComplete={(sc,t)=>markDone("multiplier",       sc,t)} />}
        {station==="personalfinance"  && <PersonalFinanceStation   onComplete={(sc,t)=>markDone("personalfinance",  sc,t)} />}
        {station==="flash"            && <FlashcardStation         onComplete={(sc,t)=>markDone("flash",            sc,t)} />}
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
