
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Build a Rainy-Day Fund for Unexpected U.S. Expenses",
    desc: "Why you need a separate cash bucket for car repairs, home maintenance, and deductibles.",
    intro: "Most Americans confuse an 'Emergency Fund' with a 'Rainy Day Fund,' but they serve two distinct psychological and financial purposes. An Emergency Fund is for income replacement (job loss). A Rainy Day Fund is for life's inevitable inconveniences—blown tires, broken HVACs, or surprise dental bills. If you raid your Emergency Fund every time your car needs brakes, you deplete your safety net. This guide explains how to calculate, build, and maintain a dedicated Rainy Day Fund so your long-term security remains untouched.",
    takeaways: [
      "<strong>The Distinction:</strong> Emergency Fund = Survival (Job Loss). Rainy Day Fund = Maintenance (Life Events). Keep them separate.",
      "<strong>The $2,000 Floor:</strong> Most 'unexpected' expenses (transmission repair, ER visit deductible) fall in the $1,000 - $2,500 range. This is your target.",
      "<strong>Liquidity:</strong> This money must be instantly accessible (Checking or linked Savings), unlike the Emergency Fund which can sit in T-Bills.",
      "<strong>Sinking Funds:</strong> The Rainy Day Fund is essentially a catch-all Sinking Fund for unknown timings."
    ],
    contextUS: "In the US, the average car repair bill is ~$600, and the average homeowner spends 1-4% of their home's value on maintenance annually. These are not 'emergencies'; they are mathematical certainties with unknown dates. Financing these on a credit card at 25% APR is a wealth killer.",
    deepDiveTitle: "Structuring Your Cash Reserves",
    deepDiveContent: `
      <p>Think of your cash in tiers of defense.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Tier 1: The Rainy Day Fund ($2,000 - $5,000)</h3>
      <p><strong>Purpose:</strong> To prevent you from using a credit card for non-recurring spikes in spending.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Scenarios:</strong> Dog eats chocolate (Vet), Speeding ticket, Refrigerator dies.</li>
        <li><strong>Location:</strong> High-Yield Savings Account linked to Checking.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Tier 2: The Emergency Fund (3-6 Months Expenses)</h3>
      <p><strong>Purpose:</strong> To keep the lights on if income stops.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Scenarios:</strong> Layoff, Medical Disability, Divorce.</li>
        <li><strong>Location:</strong> Separate Bank or T-Bills. Harder to touch.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Why Separation Matters</h3>
      <p>If you have one big pot of $20,000, and you take out $1,000 for a car repair, you feel like you are 'failing' at saving. If you have a dedicated $2,000 car repair fund and use it, you feel 'successful' because the system worked as designed.</p>
    `,
    strategyTitle: "How to Fill the Bucket",
    strategySteps: [
      "<strong>Audit Your 'Oops' Expenses:</strong> Look at last year's bank statement. Add up all the car, house, and medical costs. Divide by 12. That is your monthly Rainy Day contribution.",
      "<strong>The 'Round Up' Method:</strong> Use apps or bank features that round up transactions to the nearest dollar and deposit the change. It painlessly builds a $500 buffer over a year.",
      "<strong>Windfalls:</strong> Tax refunds, birthday money, or work bonuses should fill this bucket first. It is the first line of defense.",
      "<strong>Cap It:</strong> Once you hit ~$3,000, stop. Redirect cash to investing. You don't need a $20,000 Rainy Day fund; that is inefficient cash drag."
    ],
    faq: [
      {
        q: "Is a Rainy Day fund the same as a Sinking Fund?",
        a: "Similar. A Sinking Fund is for a <em>known</em> expense (e.g., 'Christmas Gifts'). A Rainy Day fund is for <em>unknown</em> expenses (e.g., 'Car broke down')."
      },
      {
        q: "Where should I keep it?",
        a: "A High-Yield Savings Account. Do not invest it. If the market crashes 20% and your roof leaks the same week, you don't want to sell stocks at a loss to buy shingles."
      },
      {
        q: "What if I rent?",
        a: "You still need it. Car repairs, dental work, computer replacement, and travel for family funerals are costs that renters face too. Aim for $1,500 - $2,000."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "December 18, 2025"
  },
  {
    title: "How to Use an HSA for Long-Term Savings and Investment",
    desc: "Unlocking the 'Triple Tax Advantage' of Health Savings Accounts.",
    intro: "The Health Savings Account (HSA) is widely misunderstood. Most Americans treat it like a Checking Account for doctors—money goes in, they get a flu shot, money goes out. This is a mistake. Used correctly, the HSA is the **ultimate retirement investment vehicle**, superior even to the Roth IRA. It offers the rare 'Triple Tax Advantage': Tax deduction on contribution, Tax-free growth, and Tax-free withdrawal. This guide explains how to turn your health plan into a wealth plan.",
    takeaways: [
      "<strong>The Stealth IRA:</strong> After age 65, you can withdraw HSA funds for *any* reason (taxed as income), just like a Traditional IRA. Before 65, it is for health only.",
      "<strong>Triple Tax Advantage:</strong> Tax-free in, tax-free growth, tax-free out (for medical). No other account offers this.",
      "<strong>Pay Out of Pocket:</strong> The strategy relies on paying for medical expenses with *cash* today, letting the HSA compound for 20 years.",
      "<strong>Receipt Shoebox:</strong> You can reimburse yourself for medical expenses incurred years ago. Save your receipts forever."
    ],
    contextUS: "To open an HSA, you must have a High Deductible Health Plan (HDHP). In 2025, the contribution limits are $4,300 (Self) and $8,550 (Family). Unlike FSAs (Flexible Spending Accounts), HSA funds *never* expire. They roll over forever. This makes them an investment asset, not a spending bucket.",
    deepDiveTitle: "The Investment Strategy",
    deepDiveContent: `
      <p>Stop spending your HSA. Start investing it.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 1: Treat it like a 401(k)</h3>
      <p>Log into your HSA provider (Fidelity, Lively, Optum). Find the 'Investments' tab. Most people leave their HSA in cash earning 0.1%. Move it to an S&P 500 Index Fund immediately.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 2: Pay Cash for Care</h3>
      <p>When you go to the doctor and owe $150, do <strong>not</strong> use your HSA card. Pay with your personal credit card (get the points) and pay it off with your checking account.</p>
      <p><em>Why?</em> You want that $150 to stay in the HSA, invested in the S&P 500. In 30 years at 8%, that $150 becomes $1,500 tax-free.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 3: Save the Receipt</h3>
      <p>Scan the $150 receipt. Save it in a Google Drive folder. The IRS allows you to reimburse yourself <strong>at any time in the future</strong>. You can withdraw that $150 tax-free in 2055 if you have the receipt from 2025.</p>
    `,
    strategyTitle: "Advanced HSA Moves",
    strategySteps: [
      "<strong>FICA Avoidance:</strong> If you contribute via payroll deduction, you skip Income Tax AND Social Security/Medicare tax (7.65%). This makes it 7.65% better than a direct bank contribution.",
      "<strong>California/New Jersey Warning:</strong> These two states do not recognize the federal tax deduction for HSAs. You still get the Federal break, but you pay state tax on growth. It is still worth it, but track your basis.",
      "<strong>The Emergency Valve:</strong> If you lose your job, you can tap your 'Shoebox of Receipts' to withdraw tax-free cash from the HSA immediately to pay rent. It acts as a backup emergency fund."
    ],
    faq: [
      {
        q: "What if I don't have medical expenses in retirement?",
        a: "You will. The average couple needs $315k for healthcare. But even if you are Superman, at age 65, the penalty disappears. You can withdraw for non-medical reasons and just pay income tax (like a Traditional IRA)."
      },
      {
        q: "Can I invest all of it?",
        a: "Some providers require you to keep a cash threshold (e.g., $1,000) before investing. Fidelity usually allows investing from dollar one."
      },
      {
        q: "Is it better than a Roth IRA?",
        a: "Mathematically, yes. Roth is Taxed In / Tax-Free Out. HSA is Tax-Free In / Tax-Free Out. The HSA wins by the amount of your marginal tax rate."
      }
    ],
    author: "David Thompson, CPA",
    authorBio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions.",
    publishedDate: "December 19, 2025"
  },
  {
    title: "Best Strategies to Protect Your Portfolio During a U.S. Market Downturn",
    desc: "How to practice 'Defensive Investing' without going to cash.",
    intro: "Bear markets are inevitable. On average, the US stock market drops 10% every year or two, and 20% every 5-7 years. When the screens turn red, the urge to 'sell everything' is overwhelming. However, converting to cash during a downturn is the surest way to destroy wealth (locking in losses). Instead of fleeing, smart investors build 'All-Weather' portfolios designed to absorb shocks. This guide covers defensive assets, hedging strategies, and behavioral tricks to survive a recession.",
    takeaways: [
      "<strong>Don't Time It:</strong> You cannot predict the top or bottom. Defensive investing is about <em>preparation</em>, not reaction.",
      "<strong>Quality Factor:</strong> Companies with low debt and high cash flow (Quality) tend to fall less than speculative Tech stocks during crashes.",
      "<strong>The Bond Buffer:</strong> High-quality US Treasuries often (but not always) rise when stocks fall, offsetting losses.",
      "<strong>Cash Flow Focus:</strong> If your portfolio pays dividends, a price drop doesn't hurt your lifestyle. Focus on the income, not the account value."
    ],
    contextUS: "In 2022, the '60/40 Portfolio' failed because both Stocks and Bonds dropped. This was rare (inflation shock). In 2025, with yields higher, bonds are once again a viable hedge. Understanding the 'Stock/Bond Correlation' is key to modern defense.",
    deepDiveTitle: "Defensive Asset Classes",
    deepDiveContent: `
      <p>When the S&P 500 drops 20%, you want assets that drop 0% or 5%.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Consumer Staples (XLP)</h3>
      <p>Companies like Procter & Gamble, Walmart, and Coca-Cola. People buy toothpaste and diapers even in a recession. These stocks are boring but stable.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Utilities (XLU)</h3>
      <p>Electricity and water are non-negotiable. Utilities operate as regulated monopolies with steady cash flows and high dividends.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Short-Term Treasuries (SHV)</h3>
      <p>Cash equivalents. They yield ~4-5% and have zero correlation to the stock market. Holding 10-20% of your portfolio in 'Dry Powder' allows you to buy the dip when others are panicking.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">4. Gold (GLD)</h3>
      <p>Historically, gold performs well during 'fear' periods or currency devaluation. A 5% allocation acts as an insurance policy.</p>
    `,
    strategyTitle: "The 'Crash Protocol'",
    strategySteps: [
      "<strong>Step 1: Turn off the News.</strong> Headlines are designed to scare you. The market has survived WWII, the Cold War, and 2008. It will survive this.",
      "<strong>Step 2: Tax Loss Harvest.</strong> If you have losers in a taxable account, sell them to bank the tax deduction, then immediately buy a similar index fund. You turn a market loss into a tax win.",
      "<strong>Step 3: Rebalance.</strong> If stocks drop 20%, your Bond allocation is now too high. Sell Bonds (which held value) and buy Stocks (which are on sale). This is mathematically buying low.",
      "<strong>Step 4: Increase Contributions.</strong> If you have a stable job, increase your 401(k) percentage. You are buying more shares for the same money."
    ],
    faq: [
      {
        q: "Should I use Stop-Loss orders?",
        a: "Risky. In a 'Flash Crash', a stop-loss might sell you out at the bottom, and then the market instantly recovers. Long-term investors generally shouldn't use them."
      },
      {
        q: "Is Cash the best defense?",
        a: "Cash prevents loss, but guarantees inflation loss. It is the ultimate defense for <em>short term</em> needs (1-2 years), but a terrible defense for <em>long term</em> wealth."
      },
      {
        q: "What is the VIX?",
        a: "The 'Fear Index.' When VIX is high (>30), panic is high. As the saying goes: 'When VIX is high, it's time to buy. When VIX is low, look out below.'"
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "December 20, 2025"
  },
  {
    title: "How to Evaluate a Target-Date Fund for Your Retirement Goals",
    desc: "Looking under the hood of 'set it and forget it' funds to find hidden fees and risks.",
    intro: "Target-Date Funds (TDFs) are the default investment for millions of Americans with a 401(k). The premise is simple: pick the year you retire (e.g., 2050), and the fund manages itself. However, not all TDFs are created equal. Some are 'Passive' collections of cheap index funds, while others are 'Active' vehicles stuffed with high-fee underperforming funds. Furthermore, different fund managers have different 'Glide Paths'—some are much riskier near retirement than others. This guide teaches you how to audit your TDF.",
    takeaways: [
      "<strong>Index vs Active:</strong> Always choose a TDF built with Index Funds (Expense Ratio < 0.15%). Avoid those built with Active Funds (ER > 0.60%).",
      "<strong>To vs Through:</strong> Some funds reach their most conservative point <em>at</em> retirement ('To'). Others stay aggressive <em>through</em> retirement. Know which one you own.",
      "<strong>The Allocation Check:</strong> Verify the stock/bond split matches your risk tolerance. A '2050 Fund' from Fidelity might be 90% stocks, while one from Wells Fargo might be 80%.",
      "<strong>Hidden Fees:</strong> Look for 'Acquired Fund Fees' in the prospectus. Ensure there are no layers of double-dipping."
    ],
    contextUS: "The Department of Labor allows employers to auto-enroll staff into TDFs. While well-intentioned, this creates apathy. Many employees wake up 20 years later to find they paid 1% fees annually, losing 25% of their potential wealth.",
    deepDiveTitle: "Analyzing the 'Glide Path'",
    deepDiveContent: `
      <p>The Glide Path determines how fast the fund shifts from Stocks (Growth) to Bonds (Safety).</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The 'Through' Strategy (e.g., T. Rowe Price)</h3>
      <p>These funds assume you will live to 95. They keep a higher percentage of stocks (e.g., 55-60%) even after you retire. <br/>
      <strong>Pros:</strong> Higher growth potential needed for long life. <br/>
      <strong>Cons:</strong> Higher crash risk. If the market crashes the year you retire, you lose more.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The 'To' Strategy (e.g., BlackRock LifePath)</h3>
      <p>These funds aim to reach their safest point exactly at age 65. They might hold only 30-40% stocks at retirement. <br/>
      <strong>Pros:</strong> Maximum safety at the finish line. <br/>
      <strong>Cons:</strong> Inflation risk. Your money might not grow fast enough to last 30 years.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Cost Analysis</h3>
      <p>Look at the Expense Ratio:</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Vanguard Target Retirement:</strong> 0.08% (Excellent)</li>
        <li><strong>Fidelity Freedom INDEX:</strong> 0.12% (Good)</li>
        <li><strong>Fidelity Freedom (Active):</strong> 0.75% (Avoid)</li>
        <li><strong>Competitor Active Funds:</strong> 1.00%+ (Terrible)</li>
      </ul>
    `,
    strategyTitle: "How to Audit Your 401(k)",
    strategySteps: [
      "<strong>Log In:</strong> Find your current investment holding ticker symbol (e.g., VFFVX).",
      "<strong>Google It:</strong> Search '[Ticker] Expense Ratio'. If it is above 0.20%, you are paying too much.",
      "<strong>Check the Alternative:</strong> Does your 401(k) offer separate Index Funds (S&P 500, Bond Market)? If the TDF is expensive, build your own 3-Fund Portfolio using the separate cheap funds.",
      "<strong>Check the Date:</strong> If you plan to retire early (55), don't buy the 2055 fund (age 65). Buy the 2045 fund. Align the fund date with your <em>financial</em> timeline, not your biological age."
    ],
    faq: [
      {
        q: "Can I hold TDFs in a Brokerage Account?",
        a: "Not recommended. They generate taxable events when they rebalance. Keep them in tax-sheltered accounts (401k/IRA)."
      },
      {
        q: "Why do TDFs lose money?",
        a: "They hold stocks and bonds. Both can go down. A TDF is not a savings account; it is an investment portfolio. It will fluctuate."
      },
      {
        q: "Can I mix TDFs with other funds?",
        a: "You shouldn't. A TDF is designed to be a complete meal. Adding an S&P 500 fund on the side tilts your allocation and breaks the glide path logic. Go 100% TDF or 0%."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk.",
    publishedDate: "December 21, 2025"
  }
];

export const savingInvestingArticles21: Article[] = details.map(detail => {
  const slug = slugify(detail.title);
  return {
    id: slug,
    title: detail.title,
    slug: slug,
    description: detail.desc,
    content: generateFullArticleHTML(detail),
    schema: generateArticleSchema(detail, slug),
    author: detail.author,
    publishedDate: detail.publishedDate
  };
});
