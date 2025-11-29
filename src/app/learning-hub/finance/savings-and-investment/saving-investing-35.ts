
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to invest safely during periods of economic uncertainty",
    desc: "Strategies for protecting wealth when inflation, recession, and volatility strike.",
    intro: "The stock market hates uncertainty. When news headlines are dominated by inflation, geopolitical tension, or looming recessions, the natural human instinct is to sell everything and hide in cash. However, history shows that missing the recovery is far more damaging to your wealth than enduring the downturn. 'Safe' investing during chaos isn't about exiting the market; it's about structuring your portfolio to survive the storm without sinking. This guide outlines defensive asset allocation and behavioral strategies for turbulent times.",
    takeaways: [
      "<strong>Quality over Speculation:</strong> In uncertain times, capital flows to profitable companies with cash reserves (Apple/Microsoft) and flees speculative unprofitable tech.",
      "<strong>The Cash Buffer:</strong> Increasing your emergency fund from 3 months to 6-9 months provides the psychological fortitude to stay invested when stocks drop.",
      "<strong>Defensive Sectors:</strong> Consumer Staples (Food) and Utilities tend to hold value better than Discretionary sectors during recessions.",
      "<strong>Dollar Cost Averaging:</strong> Continuing to buy automatically during a downturn lowers your average cost basis, turning volatility into opportunity."
    ],
    contextUS: "The US economy has weathered 12 recessions since WWII. In every instance, the S&P 500 eventually recovered to new highs. Understanding this historical resilience is key to avoiding the 'Panic Sell' mistake that locks in permanent losses.",
    deepDiveTitle: "The 'All-Weather' Defense",
    deepDiveContent: `
      <p>When the macro outlook is foggy, shift your focus from 'Maximizing Returns' to 'Minimizing Regret'.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Audit Your Leverage</h3>
      <p>Uncertainty kills leveraged investors. If you trade on margin or have high-interest debt, pay it off immediately. You want to be unbreakable.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The 'Flight to Safety' Assets</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>US Treasuries (GOVT):</strong> When investors panic, they buy US debt. This usually drives bond prices up, offsetting stock losses.</li>
        <li><strong>Gold (GLD):</strong> Historically acts as a hedge against currency devaluation and extreme fear.</li>
        <li><strong>Dividend Aristocrats (NOBL):</strong> Companies that have raised dividends for 25+ years usually have the cash flow to survive a recession.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Avoid 'Value Traps'</h3>
      <p>A stock that drops 50% might look cheap, but if it has high debt and falling revenue in a recession, it can go to zero. Stick to broad Index Funds (VTI) to avoid single-company bankruptcy risk.</p>
    `,
    strategyTitle: "The Psychological Protocol",
    strategySteps: [
      "<strong>Stop Checking:</strong> If you check your portfolio daily, you feel the pain of volatility 100x more than if you check quarterly. Log out.",
      "<strong>Rebalance into Pain:</strong> If stocks drop 20%, your bond allocation is now too high. Sell the safe bonds to buy the cheap stocks. This forces you to 'Buy Low'.",
      "<strong>Tax Loss Harvest:</strong> Use the dip to lower your tax bill. Sell losers to bank the deduction, then immediately buy a similar fund to stay in the market.",
      "<strong>Keep Your Job:</strong> The biggest risk in a recession isn't your portfolio; it's your income. Focus on being indispensable at work."
    ],
    faq: [
      {
        q: "Should I go to 100% cash?",
        a: "No. Market recoveries are often violent and sudden. If you are in cash, you will miss the best days (e.g., 2020 recovery), which destroys long-term returns."
      },
      {
        q: "Is now a good time to buy?",
        a: "If you have a 10+ year horizon, the answer is always yes. Stocks are effectively 'on sale' during uncertainty. You are getting more shares for your dollar."
      },
      {
        q: "What about Series I Bonds?",
        a: "They are excellent for the 'Cash' portion of your portfolio during high inflation periods, as they guarantee your purchasing power won't drop."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "December 30, 2025"
  },
  {
    title: "How to create a savings plan for buying your first home in the US",
    desc: "Reverse-engineering the down payment and closing costs for first-time buyers.",
    intro: "Buying a home is the largest purchase most Americans will ever make. The price tag is daunting—saving $60,000 or $100,000 takes years of discipline. Many potential buyers fail because they don't have a concrete plan; they just vaguely 'save money' and hope it adds up. A successful House Fund strategy requires calculating the exact 'Cash to Close' number, choosing the right savings vehicle to protect that cash, and automating the monthly contribution. This guide turns the dream of homeownership into a math problem you can solve.",
    takeaways: [
      "<strong>The Full Number:</strong> You need more than a Down Payment. You need Closing Costs (2-4%), Moving Expenses, and an 'Immediate Repair' buffer. Plan for the full stack.",
      "<strong>Risk-Free Storage:</strong> House money needed in <3 years should NEVER be in the stock market. Use High-Yield Savings or Treasury Bills to protect the principal.",
      "<strong>The 20% Myth:</strong> You can buy with 3.5% (FHA) or 3% (Conventional). While PMI adds cost, it allows you to enter the market 5-7 years sooner.",
      "<strong>Automated Sinking Fund:</strong> Treat your house savings like a rent payment to your future self. It must be a fixed monthly bill."
    ],
    contextUS: "First-time homebuyer programs vary by state. Many offer Down Payment Assistance (DPA) grants. Additionally, the IRS allows you to withdraw up to $10,000 of *earnings* from a Roth IRA penalty-free for a first home (plus all contributions). Knowing these rules accelerates the timeline.",
    deepDiveTitle: "Calculating Your 'Cash to Close'",
    deepDiveContent: `
      <p>Let's assume a target home price of $400,000.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option A: The Gold Standard (20% Down)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Down Payment:</strong> $80,000</li>
        <li><strong>Closing Costs (3%):</strong> $12,000</li>
        <li><strong>Reserves:</strong> $5,000</li>
        <li><strong>Total Goal:</strong> <strong>$97,000</strong></li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option B: The Fast Track (3.5% Down)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Down Payment:</strong> $14,000</li>
        <li><strong>Closing Costs (3%):</strong> $12,000</li>
        <li><strong>Reserves:</strong> $5,000</li>
        <li><strong>Total Goal:</strong> <strong>$31,000</strong></li>
      </ul>

      <p><strong>The Reality:</strong> Option B is achievable in 2 years saving $1,300/mo. Option A takes 6+ years. In rising markets, Option B is often smarter despite the PMI cost.</p>
    `,
    strategyTitle: "Where to Park the Cash",
    strategySteps: [
      "<strong>Open a Dedicated Account:</strong> Do not mix this with your Emergency Fund. Open a specific HYSA named 'House Fund'.",
      "<strong>Maximize Yield:</strong> Use a Money Market Fund (e.g., Vanguard VMFXX) or T-Bills to get ~5% yield. On $30,000, that is $1,500/year in free money—enough to buy a new fridge.",
      "<strong>The 'Windfall' Rule:</strong> Commit 100% of tax refunds and work bonuses to the House Fund. This can cut your timeline by 30%.",
      "<strong>Audit Your Rent:</strong> Can you move to a cheaper apartment for 12 months? Saving the $500/mo difference adds $6,000 to the fund. Short-term pain for long-term gain."
    ],
    faq: [
      {
        q: "Should I use my 401(k)?",
        a: "Generally No. 401(k) loans are risky (if you lose your job, you must repay instantly). Hardship withdrawals come with taxes and penalties. Leave retirement money for retirement."
      },
      {
        q: "What if home prices drop?",
        a: "If you are buying for the long term (7+ years), short-term drops don't matter. You are buying a place to live, not just an investment asset."
      },
      {
        q: "How do I avoid PMI?",
        a: "Put 20% down. Or, put 10% down and take a 'Piggyback Loan' (80/10/10 structure). Or, just pay PMI for a few years until your equity grows, then refinance to remove it."
      }
    ],
    author: "Robert Hughes",
    authorBio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash.",
    publishedDate: "December 31, 2025"
  },
  {
    title: "How to avoid penalties when withdrawing savings early",
    desc: "Navigating the IRS rules for accessing 401(k)s, IRAs, and CDs before maturity.",
    intro: "Life is unpredictable. Sometimes you need cash *now*, but your money is locked inside a retirement account or a Certificate of Deposit. The standard IRS rule is clear: withdraw from a retirement account before age 59.5, and you pay income tax PLUS a 10% penalty. However, the tax code is filled with specific exceptions and 'trap doors' that savvy savers can use to access their liquidity penalty-free. This guide explains how to break the glass in case of emergency without losing 10% of your money to the government.",
    takeaways: [
      "<strong>Roth Contributions are Free:</strong> You can *always* withdraw your direct Roth IRA contributions tax and penalty-free. No questions asked. This makes the Roth IRA a powerful backup emergency fund.",
      "<strong>The Rule of 55:</strong> If you leave your job in the year you turn 55 (or later), you can access *that specific employer's* 401(k) penalty-free. You don't have to wait for 59.5.",
      "<strong>SEPP 72(t):</strong> A strategy to take equal periodic payments from an IRA at *any* age without penalty. Useful for early retirees (FIRE).",
      "<strong>Hardship Exceptions:</strong> The IRS waives penalties for specific events: purchasing a first home ($10k), certain medical expenses, or higher education costs."
    ],
    contextUS: "The IRS penalty is designed to discourage raiding your future. However, during crises (like COVID-19), Congress sometimes passes temporary waivers. Always check current legislation before making a withdrawal. Note: Avoiding the *penalty* does not mean avoiding the *tax* (unless it's Roth).",
    deepDiveTitle: "The Hierarchy of Liquidity",
    deepDiveContent: `
      <p>If you need $10,000, pull from accounts in this order to minimize damage.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Taxable Brokerage / High-Yield Savings</h3>
      <p><strong>Cost:</strong> $0 Penalty. Capital Gains tax only on profit.</p>
      <p>Always burn your non-retirement cash first.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Roth IRA Contributions</h3>
      <p><strong>Cost:</strong> $0. $0 Tax.</p>
      <p>You can withdraw the principal you put in. Just leave the earnings alone. You must file IRS Form 8606 to track this.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. 401(k) Loan</h3>
      <p><strong>Cost:</strong> Interest paid to yourself.</p>
      <p>You can borrow up to $50k or 50% of your balance. No taxes or penalties *if* you pay it back on time. <strong>Risk:</strong> If you get fired, the loan is usually due immediately.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">4. Hardship Withdrawal</h3>
      <p><strong>Cost:</strong> Income Tax. (Penalty waived for specific reasons).</p>
      <p>Valid reasons: Medical debt > 7.5% of AGI, preventing eviction/foreclosure, funeral expenses.</p>
    `,
    strategyTitle: "Bank CD Strategies",
    strategySteps: [
      "<strong>The Penalty Math:</strong> Most CDs charge 3-6 months of interest for early withdrawal. Calculate it. If you have a 2% CD and savings rates are now 5%, it might be profitable to pay the penalty and move the money.",
      "<strong>No-Penalty CDs:</strong> Banks like Ally offer these. You can withdraw full principal + interest anytime after 6 days. Ideal for uncertain timelines.",
      "<strong>Laddering:</strong> Instead of one big 5-year CD, buy five smaller ones. If you need cash, you only break one small CD, minimizing the penalty."
    ],
    faq: [
      {
        q: "What is the Rule of 55?",
        a: "It applies to 401(k)s only, not IRAs. If you quit/get fired at 55+, you can tap the 401(k) from <em>that</em> job. Old 401(k)s from previous jobs don't count unless you rolled them into the current plan first."
      },
      {
        q: "Is a 401(k) loan a good idea?",
        a: "It's better than a withdrawal, but risky. If you leave the job, you might default, triggering taxes and penalties. Treat it as a last resort."
      },
      {
        q: "Can I repay a withdrawal?",
        a: "For hardship withdrawals, usually no. For loans, yes. For Roth contributions, you have 60 days to put it back (Rollover rule), otherwise it's out forever."
      }
    ],
    author: "David Thompson, CPA",
    authorBio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions.",
    publishedDate: "December 10, 2025"
  },
  {
    title: "How to grow savings using employer financial wellness programs",
    desc: "Unlocking hidden benefits like HSA matches, commuter stipends, and educational assistance.",
    intro: "Your salary is just one part of your compensation. Modern US employers offer a suite of 'Financial Wellness' benefits designed to help you save money, but HR data shows these perks are chronically underutilized. From HSA matches to tuition reimbursement and student loan repayment assistance, these programs are essentially 'free money' waiting to be claimed. This guide audits the standard benefits package to help you find thousands of dollars in hidden compensation.",
    takeaways: [
      "<strong>The HSA Match:</strong> Just like a 401(k), many employers match contributions to Health Savings Accounts. This is tax-free cash for future medical bills.",
      "<strong>Tuition Reimbursement:</strong> Companies often pay up to $5,250/year (tax-free limit) for you to get a degree. This saves you from student loans.",
      "<strong>Commuter Benefits:</strong> Paying for parking or transit with pre-tax dollars saves you ~30% compared to paying with debit card cash.",
      "<strong>ESPP (Employee Stock Purchase Plan):</strong> Buying company stock at a 15% discount is an arbitrage opportunity for instant profit."
    ],
    contextUS: "The Secure Act 2.0 (2024) expanded employer capabilities, allowing them to match student loan payments into 401(k)s and create emergency savings accounts (PLESA). Review your 2025 benefits handbook; the rules have likely changed in your favor.",
    deepDiveTitle: "The Hidden Menu of Benefits",
    deepDiveContent: `
      <p>Audit your HR portal for these specific line items.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Lifestyle Spending Accounts (LSA)</h3>
      <p>A taxable stipend (e.g., $1,000/year) for gym memberships, athletic gear, or financial planning fees. Use it or lose it. Buy the running shoes.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Employee Stock Purchase Plan (ESPP)</h3>
      <p>If your company offers a <strong>15% discount</strong> and a 'Lookback Provision', enroll immediately. <br/>
      <em>Strategy:</em> Buy the stock at the discount, sell it the very next day. You pocket the 15% spread risk-free. Do not hold the single stock; diversify the profit into Index Funds.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Legal Plans</h3>
      <p>For ~$15/month, you get access to lawyers. Use this for one year to create your <strong>Will and Estate Plan</strong> (value: $2,000), then cancel. It is a massive savings on essential legal work.</p>
    `,
    strategyTitle: "The 'Benefits Ladder'",
    strategySteps: [
      "<strong>Step 1: The Match.</strong> Maximize 401(k) and HSA matching dollars first.",
      "<strong>Step 2: The Pre-Tax.</strong> Enroll in Commuter Benefits and Dependent Care FSA. This lowers your tax bill instantly.",
      "<strong>Step 3: The Reimbursements.</strong> Check for 'Wellness' or 'Education' stipends. Submit receipts for gym or classes. If you don't submit, you donate that money back to the company.",
      "<strong>Step 4: The Discounts.</strong> Check your portal for 'Perks at Work'. Discounts on cell phone plans, laptops (Apple/Dell), and car insurance are common corporate negotiated rates."
    ],
    faq: [
      {
        q: "Do I pay taxes on these perks?",
        a: "401k/HSA/Commuter benefits are tax-free. Tuition is tax-free up to $5,250. Lifestyle Stipends and Gym reimbursements are usually taxed as income on your W-2."
      },
      {
        q: "What is a PLESA?",
        a: "Pension-Linked Emergency Savings Account. A new feature where employers can auto-deduct post-tax money into a savings sidecar within the 401(k). Good for automating emergency funds."
      },
      {
        q: "Is ESPP risky?",
        a: "Only if you hold the stock. If you sell immediately (flipping), the risk is minimal. You lock in the discount as profit."
      }
    ],
    author: "Emily Carter",
    authorBio: "Emily is a personal finance journalist whose work focuses on behavioral economics and overcoming financial anxiety. She advocates for automated, rules-based investing.",
    publishedDate: "December 11, 2025"
  }
];

export const savingInvestingArticles35: Article[] = details.map(detail => {
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
