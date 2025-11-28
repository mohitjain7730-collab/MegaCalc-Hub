
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from './article-generator';

const details: ArticleDetail[] = [
  {
    title: "Understanding Capital Gains Tax Brackets in the U.S.",
    desc: "A comprehensive guide to Short-Term vs. Long-Term rates and how to minimize your IRS bill.",
    intro: "In the United States, how you make money matters just as much as how much you make. W-2 salary income is taxed at the highest rates ('Ordinary Income'), while money made from investments is often taxed at significantly lower rates. This is the core of the US tax code's incentive structure: it rewards owners of capital over earners of wages. Understanding the difference between Short-Term and Long-Term Capital Gains brackets is the single most effective way to legally reduce your tax liability and keep more of your investment returns.",
    takeaways: [
      "<strong>The 1-Year Cliff:</strong> Holding an asset for 366 days cuts your tax rate almost in half. Short-term gains (held <1 year) are taxed as regular income (up to 37%); Long-term gains are capped at 20% for most.",
      "<strong>The 0% Bracket:</strong> Surprisingly, a married couple earning under ~$94,000 (2025 est) pays 0% federal tax on long-term capital gains. This is a massive opportunity for 'Tax Gain Harvesting'.",
      "<strong>Net Investment Income Tax (NIIT):</strong> High earners (>$200k/$250k) face an extra 3.8% surtax, effectively bumping the top rate to 23.8%.",
      "<strong>State Taxes:</strong> Don't forget state taxes. California treats capital gains as regular income (up to 13.3%), while Florida charges 0%. Your location matters."
    ],
    contextUS: "The US tax system is progressive. Unlike many countries with a flat investment tax, the US system allows strategic planning. For example, realizing gains during a 'Gap Year' or sabbatical when your earned income is low allows you to harvest gains at the 0% rate, effectively resetting your cost basis tax-free.",
    deepDiveTitle: "The 2025 Tax Bracket Breakdown",
    deepDiveContent: `
      <p>Your tax rate depends entirely on your <strong>Holding Period</strong>.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Short-Term Capital Gains (Held &le; 1 Year)</h3>
      <p><strong>Rate:</strong> Same as your Ordinary Income Tax Bracket (10% - 37%).</p>
      <p><em>Example:</em> You buy Nvidia stock for $1,000 and sell it 3 months later for $2,000. You profit $1,000. If you earn $100k/year (22% bracket), you owe the IRS $220. It is treated exactly like a bonus at work.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Long-Term Capital Gains (Held > 1 Year)</h3>
      <p><strong>Rate:</strong> 0%, 15%, or 20% (plus 3.8% NIIT for high earners).</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>0% Rate:</strong> Single Income < ~$47k | Married < ~$94k.</li>
        <li><strong>15% Rate:</strong> Single Income ~$47k - $518k | Married ~$94k - $583k.</li>
        <li><strong>20% Rate:</strong> Income Above these limits.</li>
      </ul>
      <p><em>Example:</em> You hold that same Nvidia stock for 1 year and 1 day. You sell for $1,000 profit. Your tax bill drops to $150 (15% rate). You saved $70 just by waiting.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Strategic Loss Harvesting</h3>
      <p>Capital Losses offset Capital Gains dollar-for-dollar. If you have $5,000 in gains and $5,000 in losses, your net tax is $0. If you have <em>excess</em> losses, you can deduct up to $3,000 against your W-2 salary income.</p>
    `,
    strategyTitle: "How to Pay Zero Tax (Legally)",
    strategySteps: [
      "<strong>The 'Gap Year' Strategy:</strong> If you are between jobs or retiring early, your income might drop to $0. This is the time to sell winning stocks. You can realize up to ~$94k (married) in profit and pay $0 federal tax.",
      "<strong>Tax-Loss Harvesting:</strong> In December, check your portfolio for losers. Sell them to bank the loss (tax asset) and immediately buy a similar (but not identical) fund to stay invested. Use this loss to offset future gains.",
      "<strong>Asset Location:</strong> Hold high-turnover assets (like active funds or crypto traders) in a Roth IRA. Hold buy-and-hold index funds in your Taxable Brokerage to benefit from the lower long-term rates.",
      "<strong>Don't Forget the Dividends:</strong> 'Qualified Dividends' get the special long-term rate. 'Non-Qualified Dividends' (like from REITs or Bonds) are taxed at high ordinary rates. Keep REITs in your IRA."
    ],
    faq: [
      {
        q: "What is the Wash Sale Rule?",
        a: "If you sell a stock for a loss and buy it back within 30 days, the IRS disallows the tax deduction. To avoid this, buy a different ETF (e.g., sell VOO, buy VTI) which counts as 'different enough'."
      },
      {
        q: "Do I pay tax if I don't sell?",
        a: "Generally no. Unrealized gains are not taxed. The exception is Mutual Funds, which can distribute 'Capital Gains' at year-end even if you didn't sell. This is why ETFs are preferred for taxable accounts."
      },
      {
        q: "Does my home sale count?",
        a: "Primary residences have a special exclusion. If you lived there 2 of the last 5 years, the first $250k (single) or $500k (married) of profit is tax-free. Gains above that are taxed at Long-Term Capital Gains rates."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications.",
    publishedDate: "December 10, 2025"
  },
  {
    title: "How to choose between a 401(k), IRA, and taxable brokerage account",
    desc: "The 'Order of Operations' for filling your investment buckets efficiently.",
    intro: "Investing is not just about *what* you buy (stocks vs bonds), but *where* you hold it. The US government offers a menu of account types—401(k), 403(b), Roth IRA, Traditional IRA, HSA, Taxable Brokerage—each with its own rules, limits, and tax superpowers. Choosing the wrong account can lock up your money for decades or cause you to miss out on thousands of dollars in free tax breaks. This guide provides the definitive 'Waterfall' strategy for funding these accounts in the mathematically optimal order.",
    takeaways: [
      "<strong>Free Money First:</strong> Always prioritize the employer match in your 401(k). It is a guaranteed 100% return on investment.",
      "<strong>Tax-Free Growth Second:</strong> HSAs and Roth IRAs are the most powerful vehicles because the growth is never taxed. Prioritize these over taxable accounts.",
      "<strong>Liquidity Last:</strong> Taxable brokerage accounts offer no tax breaks, but offer total liquidity. Fill this bucket only after tax-advantaged space is used up (or for specific pre-retirement goals).",
      "<strong>The HSA Secret:</strong> The Health Savings Account is the only 'Triple Tax Advantaged' account in the code. It beats even the Roth IRA."
    ],
    contextUS: "Unlike many countries with a single pension system, the US system is a patchwork. High earners often 'fill up' one bucket and spill over into the next. In 2025, the limits are roughly: 401(k) $23,500, IRA $7,000, HSA $4,300. Knowing these caps is essential for planning.",
    deepDiveTitle: "The Investment Hierarchy (The Waterfall)",
    deepDiveContent: `
      <p>Imagine pouring water into a series of buckets. You fill the top one until it overflows, then the next. Follow this order.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 1: 401(k) Match (The Free Lunch)</h3>
      <p><strong>Goal:</strong> Contribution % needed to get full match.</p>
      <p><strong>Why:</strong> Instant 50-100% return. Risk-free. Never skip this.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 2: HSA (The Super-Roth)</h3>
      <p><strong>Goal:</strong> Maximize ($4,300 individual / $8,550 family).</p>
      <p><strong>Why:</strong> Tax deduction IN, Tax-free growth, Tax-free OUT (for medical). If you don't use it for medical, it turns into a traditional IRA at age 65. It is the best account in existence.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 3: Roth IRA (The Tax-Free Shelter)</h3>
      <p><strong>Goal:</strong> Maximize ($7,000).</p>
      <p><strong>Why:</strong> Tax-free growth and flexibility. You can withdraw contributions anytime. Better investment options than 401(k).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 4: Remaining 401(k) (The Tax Deflector)</h3>
      <p><strong>Goal:</strong> Maximize ($23,500).</p>
      <p><strong>Why:</strong> Reduces your current year taxable income significantly.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 5: Taxable Brokerage (The Overflow)</h3>
      <p><strong>Goal:</strong> Unlimited.</p>
      <p><strong>Why:</strong> No limits, total liquidity. Use this for early retirement (FIRE) bridges or large purchases (House).</p>
    `,
    strategyTitle: "Decision Nuances",
    strategySteps: [
      "<strong>High Fees Exception:</strong> If your 401(k) has terrible fees (1%+), only contribute up to the match. Then switch immediately to your IRA (where you control the fees). Only go back to the 401(k) if you still have money left over.",
      "<strong>Early Retirement Goal:</strong> If you plan to retire at 45, you need more money in Bucket 5 (Taxable) because Buckets 1-4 are age-restricted. You might intentionally skip filling the 401(k) to build a liquid bridge fund.",
      "<strong>Income Limits:</strong> If you earn too much for a Roth IRA (>$165k single), use the 'Backdoor Roth' method to bypass the limit legally."
    ],
    faq: [
      {
        q: "What about a Traditional IRA?",
        a: "If you have a 401(k) at work, the tax deduction for a Traditional IRA phases out at higher incomes. Therefore, for most employed people, the Roth IRA or Backdoor Roth is the only logical choice for the IRA bucket."
      },
      {
        q: "Can I have both a 401(k) and an IRA?",
        a: "Yes! You can (and should) have both. They have separate contribution limits. $23,500 for the 401(k) + $7,000 for the IRA = $30,500 total space."
      },
      {
        q: "When can I withdraw from Taxable?",
        a: "Anytime. Tomorrow. There are no age restrictions. You just pay Capital Gains tax on the profit. It is the most flexible account, just the least tax-efficient."
      }
    ],
    author: "Jessica Martinez",
    authorBio: "Jessica is an investment strategist with a focus on portfolio construction and tax optimization. She advises clients on how to minimize tax drag in taxable brokerage accounts.",
    publishedDate: "December 11, 2025"
  },
  {
    title: "How to build a diversified U.S. stock portfolio for long-term growth",
    desc: "Moving beyond the S&P 500: A guide to Mid-Cap, Small-Cap, and Sector weighting.",
    intro: "Most US investors simply buy the S&P 500 and stop. While this is a solid strategy, it is not a fully diversified one. The S&P 500 is heavily concentrated in large tech companies (Apple, Microsoft, Nvidia). By ignoring the other 3,000 public companies in the US—specifically Mid-Cap and Small-Cap stocks—you miss out on the historical 'size premium' where smaller, hungrier companies often grow faster than giants. This guide explains how to build a 'Total Market' portfolio that captures the full dynamism of the American economy.",
    takeaways: [
      "<strong>Concentration Risk:</strong> The top 10 companies in the S&P 500 make up over 30% of the index. You aren't as diversified as you think.",
      "<strong>The Size Premium:</strong> Historically, Small-Cap Value stocks have outperformed Large-Cap Growth stocks over 20-year periods (Fama-French research).",
      "<strong>Sector Balance:</strong> The S&P 500 is tech-heavy. Adding exposure to Industrials, Healthcare, or Energy can smooth out volatility when Tech slumps.",
      "<strong>Total Market Funds:</strong> The easiest solution is buying a 'Total Market' fund (VTI) which automatically includes Small and Mid caps."
    ],
    contextUS: "The US stock market is the deepest in the world. While the S&P 500 (Large Cap) gets all the headlines, the Russell 2000 (Small Cap) and S&P 400 (Mid Cap) represent the domestic engine of the US economy—banks, builders, and manufacturers that are less reliant on global trade than the multinationals.",
    deepDiveTitle: "The Components of the Total Market",
    deepDiveContent: `
      <p>To capture the entire US economy, you need exposure to three size buckets.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Large Caps (The S&P 500)</h3>
      <p><strong>Tickers:</strong> VOO, IVV, SPY.</p>
      <p><strong>Role:</strong> Stability and Global Dominance. These are the blue chips. They have lower volatility but typically slower growth potential than small companies (it's hard to double a $3 Trillion company).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Mid Caps (The Sweet Spot)</h3>
      <p><strong>Tickers:</strong> VO (Vanguard Mid-Cap), IJH.</p>
      <p><strong>Role:</strong> Often called the 'Goldilocks' zone. These companies ($10B - $50B) have proven business models but still have runway to grow into giants. Historically, Mid-Caps have actually outperformed both Large and Small caps over the last 30 years.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Small Caps (The Growth Engine)</h3>
      <p><strong>Tickers:</strong> VB (Vanguard Small-Cap), IJR, AVUV.</p>
      <p><strong>Role:</strong> Aggressive Growth. These companies (<$10B) are volatile and risky, but they are where the 10x returns come from. Owning the whole basket ensures you catch the next Amazon before it joins the S&P 500.</p>
    `,
    strategyTitle: "Portfolio Construction Models",
    strategySteps: [
      "<strong>The 'One-Click' Solution:</strong> Buy <strong>VTI</strong> (Vanguard Total Stock Market). It market-cap weights everything. It is approx 80% Large, 15% Mid, 5% Small. It is simple, but it is still dominated by Large Cap.",
      "<strong>The 'Equal Weight' Solution:</strong> Buy RSP (Invesco S&P 500 Equal Weight). It owns the same 500 companies, but gives the smallest company the same influence as Apple. This reduces Tech concentration drastically.",
      "<strong>The 'Tilted' Portfolio:</strong> Hold 70% VOO (Large) and 30% AVUV (Small Cap Value). This specifically targets the 'Size' and 'Value' premiums identified in academic research to boost long-term returns.",
      "<strong>Rebalancing:</strong> If Small Caps have a great year (up 30%) and Large Caps stall, sell the Small Cap profit and buy more Large Caps. This enforces discipline."
    ],
    faq: [
      {
        q: "Why not just buy the Nasdaq (QQQ)?",
        a: "QQQ is 100% Growth/Tech. It has performed amazingly recently, but it is not diversified. If Tech crashes (like 2000 or 2022), QQQ crashes harder than the broad market. It is a sector bet, not a diversified portfolio."
      },
      {
        q: "Do I need Sector ETFs (e.g., Energy ETF)?",
        a: "Generally no. If you own VTI, you already own every Energy company in America. Buying an Energy ETF is just 'overweighting' that sector. Only do this if you have specific knowledge/conviction."
      },
      {
        q: "What is the risk of Small Caps?",
        a: "They are more sensitive to interest rates (they borrow money to grow) and recessions. They fall harder in bad times. You need a 10+ year horizon to endure the volatility."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "December 12, 2025"
  },
  {
    title: "Smart ways to invest your tax refund in the U.S.",
    desc: "Turning your annual 'government bonus' into a permanent wealth step-up.",
    intro: "For millions of Americans, the tax refund (average ~$3,000) is the largest single lump sum of cash they receive all year. It feels like a lottery win or a gift from the government. Psychologically, we treat this 'found money' differently than our regular paycheck—often blowing it on vacations or gadgets. Financially, however, a refund is just an interest-free loan you gave the government. The smartest move is to reclaim that capital and deploy it into assets that compound. This guide ranks the highest ROI moves for your refund check.",
    takeaways: [
      "<strong>High-Interest Debt First:</strong> Paying off a $3,000 credit card balance at 25% APR creates an immediate, guaranteed 25% return. Nothing in the stock market beats this.",
      "<strong>The Roth IRA Lump Sum:</strong> A $3,000 refund covers nearly 50% of your annual Roth limit. Dumping it in at once maximizes 'Time in the Market'.",
      "<strong>The 'Buffer' Build:</strong> If you live paycheck-to-paycheck, use the refund to fund a 1-month 'Circuit Breaker' emergency fund. It ends the stress cycle instantly.",
      "<strong>W-4 Adjustment:</strong> A huge refund means you are over-withholding. Adjust your W-4 to get more money in your monthly paycheck instead."
    ],
    contextUS: "The US tax withholding system is designed to over-collect. While getting a refund feels good, the mathematically optimal refund is $0. However, since the cash is here now, treating it as 'Seed Capital' rather than 'Spending Money' is the key behavioral shift.",
    deepDiveTitle: "The ROI Decision Tree",
    deepDiveContent: `
      <p>Where should the $3,000 go? Follow the math.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Priority 1: The Debt Destroyer (ROI: 20%+)</h3>
      <p>If you have Credit Card debt, the refund is not yours. It belongs to the bank. Pay it off. Eliminating a $100 monthly interest charge is better than earning $20/month in the stock market.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Priority 2: The Safety Net (ROI: Infinite)</h3>
      <p>If you have $0 in savings, one flat tire ruins your life. Put $1,000 of the refund into a High-Yield Savings Account. This buys you peace of mind, which has infinite ROI.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Priority 3: The Roth IRA Boost (ROI: ~8-10%)</h3>
      <p>If debt-free, max your Roth IRA for the <em>previous</em> tax year (you have until April 15 to contribute for the prior year). If that is full, contribute for the current year. $3,000 compounded at 8% for 30 years becomes <strong>$30,000</strong> tax-free.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Priority 4: Series I Bonds (ROI: Inflation Match)</h3>
      <p>You can buy up to $5,000 in paper I-Bonds directly with your refund using IRS Form 8888. This is a great way to lock away inflation-protected savings that are hard to spend impulsively.</p>
    `,
    strategyTitle: "The '90/10 Rule' for Happiness",
    strategySteps: [
      "<strong>The Psychology:</strong> If you save 100% of the refund, you might feel deprived. If you spend 100%, you feel guilty.",
      "<strong>The Solution:</strong> Save 90% ($2,700). Spend 10% ($300) on pure guilt-free fun. This makes the responsible choice sustainable.",
      "<strong>The 'Future You' Purchase:</strong> Consider spending the refund on something that lowers future costs. Buying a chest freezer to buy meat in bulk? Installing a smart thermostat? These are investments, not expenses.",
      "<strong>Fix the Leak:</strong> Go to IRS.gov and use the 'Tax Withholding Estimator'. Adjust your W-4 at work so you get an extra $250/month in your paycheck next year instead of a $3,000 refund. Invest that $250 monthly to dollar-cost average."
    ],
    faq: [
      {
        q: "Should I buy Crypto with my refund?",
        a: "Only if Priorities 1, 2, and 3 are 100% done. Speculation is for surplus money, not core capital. If you have credit card debt, buying crypto is financial negligence."
      },
      {
        q: "Does the refund count as income for next year?",
        a: "Federal refunds are not taxable income. State refunds <em>might</em> be taxable if you itemized deductions last year. Check with a CPA."
      },
      {
        q: "How fast should I invest it?",
        a: "Immediately. Do not let it sit in checking. The 'Wealth Effect' makes you feel richer than you are, leading to small frivolous purchases that eat the balance away. Move it the day it arrives."
      }
    ],
    author: "Emily Carter",
    authorBio: "Emily is a personal finance journalist whose work focuses on behavioral economics and overcoming financial anxiety. She advocates for automated, rules-based investing.",
    publishedDate: "December 13, 2025"
  }
];

export const savingInvestingArticles19: Article[] = details.map(detail => {
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
