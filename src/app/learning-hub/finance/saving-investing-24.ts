
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from './article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to invest in index funds through a taxable brokerage account",
    desc: "A guide to building wealth outside of 401(k)s and IRAs without getting killed by taxes.",
    intro: "Most financial advice focuses on tax-advantaged accounts like 401(k)s and Roth IRAs. While these are critical foundations, they have a major flaw: the money is generally locked up until age 59.5. For those who want to retire early (FIRE), buy a house in 10 years, or simply have liquid wealth, the **Taxable Brokerage Account** is the vehicle of choice. Unlike retirement accounts, there are no contribution limits and no withdrawal penalties. However, there are taxes. This guide explains how to invest in index funds efficiently so you don't lose your gains to the IRS.",
    takeaways: [
      "<strong>Liquidity:</strong> The superpower of the taxable account. You can sell and withdraw cash tomorrow for any reason. No questions asked.",
      "<strong>Tax Drag:</strong> Every dividend and every sale is a taxable event. You must choose 'Tax-Efficient' funds (ETFs) to minimize this.",
      "<strong>The Bridge:</strong> This account bridges the gap between early retirement (e.g., age 50) and standard retirement age (60), keeping you funded without penalties.",
      "<strong>No Cap:</strong> Unlike the $7,000 IRA limit, you can put $1 Million a year into a taxable account. It is the bucket for high earners."
    ],
    contextUS: "In the US, 'Long-Term Capital Gains' tax rates (0%, 15%, 20%) are much lower than Income Tax rates. The goal of taxable investing is to hold assets for >1 year to qualify for these lower rates. Buying and selling frequently (short-term gains) destroys the benefit of this account.",
    deepDiveTitle: "Tax-Efficient Asset Selection",
    deepDiveContent: `
      <p>In an IRA, you can hold anything. In a Taxable account, you must be picky.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">What to Buy (Green Light)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Broad Market ETFs (VTI/VOO):</strong> They have very low turnover (don't sell stocks often) so they rarely generate surprise tax bills.</li>
        <li><strong>Municipal Bonds (MUB):</strong> Interest is federally tax-free. Great for high earners.</li>
        <li><strong>Growth Stocks:</strong> Companies that don't pay dividends (like Google/Amazon) are great because you control when you pay tax (only when you sell).</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">What to Avoid (Red Light)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>REITs (Real Estate):</strong> They are required to pay out non-qualified dividends, taxed at your highest income rate. Keep these in an IRA.</li>
        <li><strong>Corporate Bond Funds:</strong> Interest is taxed as ordinary income.</li>
        <li><strong>Active Mutual Funds:</strong> If the manager sells a stock for a profit, YOU pay the capital gains tax that year, even if you didn't sell the fund. Stick to ETFs.</li>
      </ul>
    `,
    strategyTitle: "Step-by-Step Execution",
    strategySteps: [
      "<strong>Open the Account:</strong> Go to Fidelity, Schwab, or Vanguard. Open an 'Individual Brokerage' account (or 'Joint' with spouse).",
      "<strong>Link Bank:</strong> Connect your checking account.",
      "<strong>Turn OFF Dividend Reinvestment (Advanced):</strong> In taxable accounts, it is often better to take dividends as cash. This stops the creation of tiny 'tax lots' that make tax reporting messy. You can manually reinvest the cash into whichever asset is underweight.",
      "<strong>Tax Loss Harvesting:</strong> If the market crashes, sell your ETF to book a loss (tax deduction) and immediately buy a similar competitor ETF (e.g., Sell VTI, Buy SCHB). This lowers your tax bill while staying invested."
    ],
    faq: [
      {
        q: "Do I pay taxes if I don't withdraw?",
        a: "You pay taxes on <em>dividends</em> received each year (Form 1099-DIV). You only pay capital gains tax on <em>growth</em> when you actually sell shares."
      },
      {
        q: "Is it better than a Roth IRA?",
        a: "No. Roth is tax-free. Taxable is tax-efficient. Fill the Roth first ($7k limit). Use Taxable for everything after that."
      },
      {
        q: "Can I use it for an Emergency Fund?",
        a: "Generally no. Stocks are volatile. If you need cash during a crash, you lock in losses. Keep 3-6 months in cash; put the <em>excess</em> wealth here."
      }
    ],
    author: "Jessica Martinez",
    authorBio: "Jessica is an investment strategist with a focus on portfolio construction and tax optimization. She advises clients on how to minimize tax drag in taxable brokerage accounts.",
    publishedDate: "December 29, 2025"
  },
  {
    title: "Step-by-step guide to building a balanced investment portfolio for beginners",
    desc: "How to construct a 'Sleep Well' allocation of Stocks, Bonds, and Cash.",
    intro: "Building a portfolio is like cooking: you need the right ingredients in the right proportions. If you have too much spice (Stocks), you might get burned. If you have too much flour (Bonds/Cash), it's bland and won't rise. A 'Balanced Portfolio' is designed to grow enough to beat inflation while being stable enough to prevent panic selling during a recession. This guide provides a template for constructing a professional-grade portfolio using low-cost index funds available to any US investor.",
    takeaways: [
      "<strong>Asset Allocation:</strong> This determines 90% of your returns. It is the split between Stocks (Growth) and Bonds/Cash (Safety).",
      "<strong>The 60/40 Rule:</strong> The classic benchmark. 60% Stocks / 40% Bonds. Historically returned ~8-9% with much less volatility than 100% stocks.",
      "<strong>Diversification:</strong> Don't just buy US Tech stocks. You need exposure to International markets and different sectors (Healthcare, Energy) to smooth the ride.",
      "<strong>Rebalancing:</strong> The act of selling what went up and buying what went down. It forces you to buy low and sell high automatically."
    ],
    contextUS: "Modern Portfolio Theory (Nobel Prize winning economics) suggests that owning the 'Market Portfolio' is the most efficient way to invest. In the US, you can buy the entire world market for almost free using ETFs.",
    deepDiveTitle: "The Ingredients of a Balanced Portfolio",
    deepDiveContent: `
      <p>You only need 3 or 4 funds to beat most hedge funds.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Ingredient 1: Domestic Stocks (The Engine)</h3>
      <p><strong>Ticker:</strong> VTI (Total US Market). <br/>
      <strong>Role:</strong> Drives long-term growth. High risk, high reward.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Ingredient 2: International Stocks (The Hedge)</h3>
      <p><strong>Ticker:</strong> VXUS (Total International). <br/>
      <strong>Role:</strong> Captures growth outside the US. Protects against a falling US Dollar.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Ingredient 3: Bonds (The Shock Absorber)</h3>
      <p><strong>Ticker:</strong> BND (Total Bond Market). <br/>
      <strong>Role:</strong> Lowers volatility. Pays income.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Sample Recipes</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Aggressive (Age 20-30):</strong> 80% Stocks (VTI/VXUS) / 20% Bonds (BND).</li>
        <li><strong>Balanced (Age 40-50):</strong> 60% Stocks / 40% Bonds.</li>
        <li><strong>Conservative (Age 60+):</strong> 40% Stocks / 60% Bonds.</li>
      </ul>
    `,
    strategyTitle: "How to Build It (The Workflow)",
    strategySteps: [
      "<strong>Determine Risk Tolerance:</strong> Ask yourself: \"If my portfolio dropped 30% ($10k down to $7k), would I sell?\" If yes, you need more bonds.",
      "<strong>Select Percentages:</strong> Write it down. \"I will hold 60% US, 20% Intl, 20% Bonds.\"",
      "<strong>Execute the Buy:</strong> Transfer cash to Fidelity/Schwab. Buy the tickers in those amounts. (e.g., $600 VTI, $200 VXUS, $200 BND).",
      "<strong>Automate Future Buys:</strong> Set up your monthly contribution to buy in these same ratios. Most platforms allow 'Recurring Investments' into a basket/pie.",
      "<strong>Check Once a Year:</strong> If stocks went up huge, you might be 70% stock now. Sell the excess and buy bonds to get back to 60/20."
    ],
    faq: [
      {
        q: "Why do I need International?",
        a: "The US was the winner of the last decade. It might not be the winner of the next. International stocks are currently much cheaper (lower P/E) than US stocks."
      },
      {
        q: "Is 60/40 dead?",
        a: "No. It had a bad year in 2022 because rates spiked. Now that yields are 4-5%, bonds provide a healthy cushion again."
      },
      {
        q: "Can I just buy a Target Date Fund?",
        a: "Yes! A Target Date Fund <em>is</em> a balanced portfolio that manages itself. It is the ultimate shortcut."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "December 30, 2025"
  },
  {
    title: "How to create a savings plan for major life events (wedding, baby, relocation)",
    desc: "Using 'Time-Bucketing' to fund multiple large goals simultaneously without debt.",
    intro: "Life doesn't happen in a straight line; it happens in expensive clusters. You might need to pay for a wedding, a move across the country, and a new car all within 24 months. If you try to pay for these out of monthly cash flow, you will drown in credit card debt. The solution is **Time-Bucketing**. By breaking each goal into a monthly 'bill' you pay to yourself, you can smooth out the spikes in spending. This guide focuses on the logistics of managing competing savings priorities.",
    takeaways: [
      "<strong>Define the 'Nut':</strong> You cannot save for 'a wedding.' You must save for a '$25,000 wedding in 18 months.' Specificity creates the math.",
      "<strong>Separate Accounts:</strong> Do not lump all savings in one account. Use 'Sub-Savings' accounts (Buckets) or separate banks to prevent 'accidental borrowing' from the wrong fund.",
      "<strong>Timeline Rules:</strong> Goals <2 years = Cash. Goals >5 years = Investing. Don't gamble your relocation fund on the stock market.",
      "<strong>Prioritization:</strong> You likely can't fund everything fully. Rank them. Is the Wedding more important than the House Down Payment? Fund the #1 priority first."
    ],
    contextUS: "The average US wedding is $30k. A cross-country move is $5k-$10k. First year of a baby is $15k+. These are 'Known Expenses.' Treating them as 'Emergencies' is a failure of planning.",
    deepDiveTitle: "The Parallel Processing Method",
    deepDiveContent: `
      <p>Let's assume you have $1,000/month available to save, but you have 3 goals.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Goals</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Wedding:</strong> Need $10,000 in 10 months. ($1,000/mo required).</li>
        <li><strong>New Car:</strong> Need $5,000 in 20 months. ($250/mo required).</li>
        <li><strong>Baby:</strong> Need $5,000 in 15 months. ($333/mo required).</li>
      </ul>
      <p><strong>Total Need:</strong> $1,583/month.</p>
      <p><strong>Actual Capacity:</strong> $1,000/month.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Triage (Making it Work)</h3>
      <p>You have a $583 deficit. You have three choices:</p>
      <ol class="list-decimal pl-5 space-y-2 mb-4">
        <li><strong>Push Dates:</strong> Move the Car purchase back to Month 30.</li>
        <li><strong>Cut Scope:</strong> Reduce Wedding budget to $7,000.</li>
        <li><strong>Increase Income:</strong> Pick up a side gig for 6 months.</li>
      </ol>
      <p>Most people ignore the math and just charge the difference. <strong>Do not do this.</strong> Pick Option 2.</p>
    `,
    strategyTitle: "Where to Park the Cash",
    strategySteps: [
      "<strong>Open a High-Yield Savings Account (HYSA):</strong> Use Ally or SoFi. They allow 'Vaults' or 'Buckets'.",
      "<strong>Create the Buckets:</strong> Label them clearly: 'Wedding Fund', 'Moving Fund'.",
      "<strong>Set Autopay:</strong> On payday, transfer $600 to Wedding, $200 to Car, $200 to Baby. Automation prevents you from spending it.",
      "<strong>Bonus Windfalls:</strong> Tax refunds and bonuses should be applied to the <em>nearest</em> goal to complete it faster."
    ],
    faq: [
      {
        q: "Should I invest my wedding fund?",
        a: "No. If the market drops 20% right before the vendor payments are due, you are in trouble. Keep short-term goal money safe in HYSA or CDs."
      },
      {
        q: "What if an emergency happens?",
        a: "Pause the goal savings. Divert the $1,000/mo to handle the emergency. The wedding might have to get smaller or later. This is better than going into debt."
      },
      {
        q: "How do I calculate relocation costs?",
        a: "Budget for: Movers ($3-6k), First/Last Month Rent + Security Deposit ($4-6k), Travel ($1k), New Furniture ($2k). A standard move is easily $10k cash upfront."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "December 31, 2025"
  },
  {
    title: "What to do with your savings when interest rates drop",
    desc: "Strategies to protect your yield as the Federal Reserve cuts rates.",
    intro: "For the last few years, savers have enjoyed a 'Golden Age' of cash, earning 5% in risk-free savings accounts. But interest rates are cyclical. When the Federal Reserve cuts rates to stimulate the economy, the yield on your High-Yield Savings Account (HYSA) will drop instantly. If you sit passively, your 5% return could become 2% very quickly. The key to maintaining income is **locking in duration**. You must move cash from variable-rate accounts (HYSA) to fixed-rate accounts (CDs/Bonds) *before* the cuts happen.",
    takeaways: [
      "<strong>Reinvestment Risk:</strong> The risk that when your investment matures, you can only reinvest at a lower rate. Cash has maximum reinvestment risk.",
      "<strong>Lock In Now:</strong> Buying a 5-Year CD or Treasury Note today guarantees you that rate for 5 years, even if the Fed cuts rates to zero next year.",
      "<strong>Bond Price Appreciation:</strong> When rates fall, bond prices rise. Holding a bond fund (BND) can generate capital gains during rate cuts, offering a double benefit.",
      "<strong>Don't Reach for Yield:</strong> Avoid buying risky Junk Bonds just to maintain 5%. Accept lower safe yields or take equity risk; don't mix them."
    ],
    contextUS: "The Federal Reserve controls the 'Fed Funds Rate', which dictates HYSA yields. Markets are forward-looking; by the time the Fed *announces* a cut, the yields on 2-Year and 10-Year Treasuries have usually already dropped. Speed matters.",
    deepDiveTitle: "The Hierarchy of Duration",
    deepDiveContent: `
      <p>As rates fall, you want to own assets that locked in the <em>old</em> high rates.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Cash / HYSA (Worst)</h3>
      <p>Rate floats daily. If Fed cuts 0.50%, your bank cuts 0.50% next week. Zero protection.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Certificates of Deposit (Better)</h3>
      <p>Locks the rate for the term. A <strong>5-Year CD</strong> at 4.5% is a gold mine if rates drop to 2%. You continue earning 4.5% until maturity.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Treasury Notes / Bond Funds (Best Total Return)</h3>
      <p>If you own a 10-Year Treasury paying 4.5% and market rates drop to 3.5%, your bond becomes more valuable. You can sell it for a profit (Capital Gain) OR hold it for the high income. Bond Funds (like BND) will see their share price rise.</p>
    `,
    strategyTitle: "The 'CD Ladder' Defense",
    strategySteps: [
      "<strong>Audit Your Cash:</strong> Identify funds you won't need for >1 year.",
      "<strong>Buy Long-Term CDs:</strong> Instead of a 6-month CD, buy a 2-Year or 3-Year CD/Treasury. You are buying 'yield insurance'.",
      "<strong>Move to Bonds:</strong> If you were hiding in cash because '5% is good enough,' it's time to move back to a diversified Bond Fund (AGG/BND). You want to capture the price appreciation that occurs during rate cuts.",
      "<strong>Pay Down Debt:</strong> If savings rates drop to 3% but your mortgage is 6%, paying down the mortgage becomes mathematically superior again."
    ],
    faq: [
      {
        q: "Should I buy stocks when rates drop?",
        a: "Generally, yes. Lower rates are good for stock valuations (companies can borrow cheaper). However, if rates are dropping because of a <em>Recession</em>, stocks might fall first before rising."
      },
      {
        q: "What is a 'Call Risk'?",
        a: "Some CDs and Bonds are 'Callable'. This means if rates drop, the bank can force-return your money and cancel the interest. Always buy 'Non-Callable' CDs to protect your yield."
      },
      {
        q: "Is 3% bad?",
        a: "Historically, no. 3% is normal. 0% was the anomaly. 5% was the bonus. Adjust your expectations. Beating inflation is the only goal that matters."
      }
    ],
    author: "Robert Hughes",
    authorBio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash.",
    publishedDate: "January 01, 2026"
  }
];

export const savingInvestingArticles24: Article[] = details.map(detail => {
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
