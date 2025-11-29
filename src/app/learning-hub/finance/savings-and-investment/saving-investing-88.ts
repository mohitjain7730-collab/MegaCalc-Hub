
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "Understanding Index Rebalancing & How It Affects Stock Prices",
    desc: "What happens when Tesla joins the S&P 500? The mechanics of index inclusion.",
    intro: "When you buy an S&P 500 fund (like VOO), you aren't just buying 500 static companies. The list changes. Companies grow and get added; companies shrink and get deleted. This process is called **Index Rebalancing**. It is a massive financial event where trillions of dollars in passive funds are forced to buy the new additions and sell the deletions on a specific day. For sophisticated investors, understanding this 'Index Effect' explains why stock prices often spike before joining an index and why 'Front-Running' the rebalance is a popular (though risky) trading strategy.",
    takeaways: [
      "<strong>Forced Buying:</strong> Passive funds (Index Funds/ETFs) <em>must</em> own the index. If a company is added, they are legally required to buy it, regardless of price. This creates massive artificial demand.",
      "<strong>The 'Index Premium':</strong> Stocks often rise 5-10% in the weeks between the announcement of inclusion and the actual addition date.",
      "<strong>Deletions:</strong> Conversely, when a company is kicked out (e.g., Macy's or Foot Locker leaving the S&P 500), funds must sell, often driving the price down further.",
      "<strong>Turnover Cost:</strong> Rebalancing creates transaction costs. This is why index funds still have tiny expense ratios; they have to pay to trade during these shuffles."
    ],
    contextUS: "The S&P 500 rebalances quarterly (March, June, September, December). The Russell Indices (Small Cap) rebalance annually in June. These dates are circled on every Wall Street trader's calendar as days of high volatility and volume.",
    deepDiveTitle: "The Mechanics of the Move",
    deepDiveContent: `
      <p>Example: Tesla joining the S&P 500 (Dec 2020).</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Announcement</h3>
      <p>Standard & Poor's announces \"Tesla will join the S&P 500.\" <br/>
      <strong>Market Reaction:</strong> The stock surges. Why? Because traders know that Vanguard, BlackRock, and State Street <em>must</em> buy billions of dollars of shares soon.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Effective Date</h3>
      <p>On the Friday before inclusion, index funds execute their trades at the 'Market On Close' (MOC) auction to match the closing price. <br/>
      <strong>Volume:</strong> Billions of shares trade in seconds. <br/>
      <strong>Impact:</strong> Volatility spikes. Passive investors don't notice, but the internal machinery of the fund is churning.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Aftermath</h3>
      <p>Often, the stock drops slightly after inclusion because the 'forced buying' pressure is gone. This is 'Buy the Rumor, Sell the News' in action.</p>
    `,
    strategyTitle: "What This Means for You",
    strategySteps: [
      "<strong>Do Nothing:</strong> If you own Index Funds, the manager handles this. You enjoy the result. You don't need to trade.",
      "<strong>Avoid Trading on Rebalance Days:</strong> The 3rd Friday of Quarter-End months ('Quadruple Witching') is volatile. Spreads widen. Avoid placing market orders on these days.",
      "<strong>Beware the 'Pop':</strong> If you own individual stocks, don't buy a stock <em>after</em> it is announced for inclusion. You are buying the top. The easy money was made by those who owned it before the news.",
      "<strong>Tax Efficiency:</strong> ETFs minimize the tax impact of these rebalances better than mutual funds due to the 'in-kind' transfer mechanism."
    ],
    faq: [
      {
        q: "Does rebalancing trigger taxes?",
        a: "Inside an ETF, usually no. Inside a Mutual Fund, sometimes yes (Capital Gains Distribution). Inside your 401(k), never."
      },
      {
        q: "How often does it happen?",
        a: "S&P 500 rebalances quarterly. Some funds rebalance monthly. Less frequent is generally better for tax efficiency."
      },
      {
        q: "Can I front-run it?",
        a: "Hedge funds try to predict who will be added. It is hard. S&P keeps the list secret until the announcement. It is a gamble."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "March 18, 2026"
  },
  {
    title: "How to Analyse an IPO: A 10-Step Checklist for Beginners",
    desc: "Reading the S-1 filing to avoid buying hype at the top.",
    intro: "Initial Public Offerings (IPOs) are exciting. Companies like Uber, Airbnb, or Reddit ringing the opening bell feels like a chance to get in on the ground floor. In reality, by the time a company IPOs, the 'ground floor' is long gone; Venture Capitalists occupied that. Retail investors are buying the 'exit strategy' of the early insiders. While some IPOs soar, many crash 50% in their first year. To invest safely, you must ignore the media hype and read the **S-1 Filing** (the prospectus). This guide gives you a checklist to vet a new stock.",
    takeaways: [
      "<strong>The Lock-Up Period:</strong> Insiders are usually banned from selling for 180 days. When this 'Lock-Up' expires, the stock often drops as employees cash out. Wait for this date.",
      "<strong>Use of Proceeds:</strong> Why are they raising money? 'Growth and Expansion' is good. 'Paying off Debt' or 'Cashing out Founders' is bad.",
      "<strong>Profitability Path:</strong> Is the company profitable? If not, do they have a clear path to profitability, or is the business model 'burn cash to grow forever'?",
      "<strong>Valuation:</strong> Compare the IPO Price-to-Sales ratio to competitors. IPOs are often priced for perfection."
    ],
    contextUS: "The SEC requires companies to disclose <em>everything</em> in the S-1, including 'Risk Factors.' This section is legally binding truth serum. If a company says 'We have identified material weaknesses in our accounting,' believe them.",
    deepDiveTitle: "The S-1 Detective Work",
    deepDiveContent: `
      <p>Find the S-1 on SEC.gov/EDGAR. Search for the company name.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. The 'Risk Factors' Section</h3>
      <p>Read the first 5 pages of risks. <br/>
      <em>Red Flags:</em> \"We rely on one customer for 40% of revenue.\" \"We are currently being sued by the DOJ.\" \"We have never made a profit and may never achieve profitability.\"</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The Cap Table (Ownership)</h3>
      <p>Who owns the stock? If the Founder owns 5% and VC firms own 80%, the VCs are looking to dump shares. If the Founder owns 40%, they are incentivized to grow long-term.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Revenue Quality</h3>
      <p>Is revenue growing? <br/>
      <strong>Good:</strong> Revenue up 40% YoY. <br/>
      <strong>Bad:</strong> Revenue flat, but 'Adjusted EBITDA' is up due to cost cutting.</p>
    `,
    strategyTitle: "The 'Wait and See' Approach",
    strategySteps: [
      "<strong>Don't Buy Day 1:</strong> IPO day is volatile. Prices often spike due to hype and crash a week later. Let the dust settle.",
      "<strong>Wait 2 Earnings Calls:</strong> Give the company 6 months to report quarterly earnings. See if they actually meet their projections. Public markets are ruthless compared to private ones.",
      "<strong>Watch the 180-Day Mark:</strong> Mark your calendar for the Lock-Up Expiration. If the stock survives the insider selling wave, it might be a safe entry point.",
      "<strong>Limit Orders:</strong> Never use a 'Market Order' on IPO day. You might pay $100 when you thought you were paying $50. Use Limit Orders to control your price."
    ],
    faq: [
      {
        q: "Can I get IPO shares at the offer price?",
        a: "Usually no. The 'Offer Price' (e.g., $20) is for big banks. Retail investors buy when it starts trading (e.g., $40). You are buying the markup. (Some apps like Robinhood/SoFi rarely offer allocations)."
      },
      {
        q: "Are IPOs good long term?",
        a: "Statistically, IPOs underperform the S&P 500 over the first 3 years. You are paying a 'Hype Premium'.",
      },
      {
        q: "What is a Direct Listing?",
        a: "No new shares are created; existing employees just sell shares. (e.g., Spotify/Slack). There is no 'Lock-Up' period usually, so price discovery is faster."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "March 19, 2026"
  },
  {
    title: "What Are U.S. Government Securities? A Beginner’s Guide to Treasuries",
    desc: "Understanding Bills, Notes, Bonds, and how to lend money to Uncle Sam.",
    intro: "When the US government needs money, it issues debt. These debt instruments are collectively known as **Government Securities** (or Treasuries). Because the US government has the power to tax and print money, these are considered the safest investments in the world ('Risk-Free'). For investors, they offer a secure place to park cash, earn interest, and hedge against stock market crashes. This guide explains the different types of securities and why they belong in your portfolio.",
    takeaways: [
      "<strong>T-Bills (Short Term):</strong> Maturity of 1 year or less. Sold at a discount. Pays the 'Cash' rate. Best for savings goals.",
      "<strong>T-Notes (Medium Term):</strong> Maturity of 2 to 10 years. Pays interest every 6 months. The '10-Year Note' is the benchmark for mortgage rates.",
      "<strong>T-Bonds (Long Term):</strong> Maturity of 20 to 30 years. Pays interest every 6 months. High sensitivity to interest rate changes.",
      "<strong>State Tax Exempt:</strong> All interest earned on US Government Securities is free from State and Local income tax. A massive perk for CA/NY residents."
    ],
    contextUS: "Foreign governments and central banks hold trillions in US Treasuries because they are the most liquid asset on earth. As a retail investor, you can buy the exact same asset with $1,000 via your brokerage account.",
    deepDiveTitle: "The Security Ladder",
    deepDiveContent: `
      <p>Choose your duration based on your goal.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Treasury Bills (T-Bills)</h3>
      <p><strong>How it works:</strong> You buy a $1,000 bill for $950. When it matures in a year, the government gives you $1,000. The $50 profit is your interest.</p>
      <p><strong>Risk:</strong> Near zero. Price doesn't fluctuate much.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Treasury Notes (T-Notes)</h3>
      <p><strong>How it works:</strong> You buy a $1,000 note. You get a coupon payment (e.g., $20) every 6 months. At the end of 10 years, you get your $1,000 back.</p>
      <p><strong>Risk:</strong> Moderate. If rates rise, the resale value of your note drops.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. TIPS (Inflation Protected)</h3>
      <p><strong>How it works:</strong> The principal value ($1,000) adjusts up with inflation (CPI). Your interest is paid on the higher principal.</p>
      <p><strong>Risk:</strong> Deflation (value could drop to par).</p>
    `,
    strategyTitle: "How to Buy",
    strategySteps: [
      "<strong>Secondary Market (Easy):</strong> Log into Fidelity/Schwab. Search 'US Treasury'. You can buy bonds that other people are selling. Liquidity is instant.",
      "<strong>Auction (Direct):</strong> You can place an order to buy 'New Issue' bonds directly from the government auction via your broker. You get the market clearing rate.",
      "<strong>ETFs (Easiest):</strong> Buy <strong>SGOV</strong> (Bills), <strong>IEF</strong> (Notes), or <strong>TLT</strong> (Bonds). You pay a tiny fee (0.05%) for the convenience of trading it like a stock.",
      "<strong>Asset Location:</strong> Hold these in a Taxable Account to benefit from the State Tax Exemption. Putting them in an IRA wastes that specific benefit."
    ],
    faq: [
      {
        q: "Can the US Government default?",
        a: "Theoretically yes, but if that happens, the global economy collapses and stocks would be worth $0 too. In finance terms, we assume probability is zero."
      },
      {
        q: "Why did Treasuries crash in 2022?",
        a: "Interest rates rose from 0% to 4%. When rates rise, existing bonds with low rates become less valuable. Long-term bonds (TLT) lost 30%. Short-term Bills (SGOV) stayed flat. Duration kills in a rising rate environment."
      },
      {
        q: "Is this better than a CD?",
        a: "Usually yes, for high earners. A 5% T-Bill = 5% after state tax. A 5% CD = 4.5% after state tax (in a high tax state). The T-Bill wins."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications.",
    publishedDate: "March 20, 2026"
  },
  {
    title: "How to Use a Sweep-In Account to Maximise Idle Savings",
    desc: "Automating your checking account to earn interest on every spare dollar.",
    intro: "One of the biggest inefficiencies in personal finance is 'Idle Cash.' You keep $5,000 in your checking account to pay bills, earning 0.01%. That money is dead capital. The solution is the **Sweep Account** (or Overdraft Protection Transfer). This feature links your High-Yield Savings Account (earning 4-5%) to your Checking Account. You keep $0 in checking. When a bill hits, the bank automatically 'sweeps' the exact amount needed from savings to cover it. This allows 100% of your cash to earn interest 100% of the time.",
    takeaways: [
      "<strong>Zero-Balance Checking:</strong> The goal is to keep your checking balance near zero, maximizing the time money spends in the high-interest savings bucket.",
      "<strong>Safety Net:</strong> Sweep functionality acts as free overdraft protection. You never bounce a check because your savings account backs it up.",
      "<strong>The 'Float' Game:</strong> By paying credit cards on the due date and using a sweep, your money sits in savings earning interest for 30-50 days *after* you spent it.",
      "<strong>Fidelity/Brokerage Model:</strong> Modern Cash Management Accounts (CMAs) do this natively, keeping all cash in a money market fund until the moment it is spent."
    ],
    contextUS: "Many US banks call this 'Overdraft Protection Transfer'. Some charge a fee (e.g., $10/transfer). You must find a bank (like SoFi, Ally, or Capital One) that offers this service for <strong>Free</strong>. Fee-based sweeps defeat the purpose.",
    deepDiveTitle: "How the Mechanics Work",
    deepDiveContent: `
      <p>Let's say you have $10,000 cash.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Old Way</h3>
      <p><strong>Checking:</strong> $5,000 (0%). <br/>
      <strong>Savings:</strong> $5,000 (5%). <br/>
      <strong>Interest Earned:</strong> $250/year.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Sweep Way</h3>
      <p><strong>Checking:</strong> $0. <br/>
      <strong>Savings:</strong> $10,000 (5%). <br/>
      <strong>Interest Earned:</strong> $500/year. <br/>
      <em>Result:</em> You doubled your interest income without saving a new dollar.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Transaction</h3>
      <p>Rent ($2,000) is auto-deducted from Checking. <br/>
      Checking hits -$2,000. <br/>
      Bank computer instantly moves $2,000 from Savings to Checking. <br/>
      Checking ends at $0. Bill is paid.</p>
    `,
    strategyTitle: "Setting It Up",
    strategySteps: [
      "<strong>Choose the Right Bank:</strong> Fidelity CMA, SoFi, and Ally are the leaders here. Ensure 'Overdraft Transfer' is free.",
      "<strong>Turn it On:</strong> It is not on by default. Go to Settings -> Overdraft Protection. Link the Savings account.",
      "<strong>Consolidate:</strong> This works best if Checking and Savings are at the <em>same</em> bank. Transfers are instant. If different banks, it doesn't work (ACH takes days).",
      "<strong>Monitor Limits:</strong> Federal Regulation D (6 withdrawals/mo) is suspended but some banks still enforce it. Check if your bank limits how many sweeps can happen per month."
    ],
    faq: [
      {
        q: "Is there a lag?",
        a: "No. At the same bank, it is instantaneous. The transaction approves even if the checking balance is $0."
      },
      {
        q: "What if savings runs out?",
        a: "Then you bounce the check. The sweep only works if you have funds. It is a liquidity tool, not a credit line."
      },
      {
        q: "Does this hurt my credit?",
        a: "No. It is internal banking plumbing. It has nothing to do with credit scores."
      }
    ],
    author: "David Thompson, CPA",
    authorBio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions.",
    publishedDate: "March 21, 2026"
  }
];

export const savingInvestingArticles88: Article[] = details.map(detail => {
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
