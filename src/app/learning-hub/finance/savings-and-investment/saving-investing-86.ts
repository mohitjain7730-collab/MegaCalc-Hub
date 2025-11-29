
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Use Covered Calls to Generate Monthly Income",
    desc: "A beginner's guide to 'renting out' your stocks for extra cash flow.",
    intro: "Most investors think the only way to make money from stocks is for the price to go up (Capital Appreciation) or for the company to pay you (Dividends). There is a third way: **Selling Options**. Specifically, the 'Covered Call' strategy allows you to 'rent out' your shares to other investors in exchange for a cash premium. It is widely considered the safest options strategy, often used by retirees to boost income from a stagnant portfolio. This guide explains how to turn your 100 shares of stock into a monthly paycheck.",
    takeaways: [
      "<strong>The Mechanism:</strong> You agree to sell your shares at a higher price (Strike Price) in the future. In exchange, you get paid cash today (Premium).",
      "<strong>The Requirement:</strong> You must own 100 shares of the underlying stock to sell 1 contract. You cannot do this with 50 shares.",
      "<strong>The Risk:</strong> Capped Upside. If the stock moons (e.g., goes up 20% in a month), you miss out on the profit above your strike price. You never lose your principal, only the 'opportunity' of a massive rally.",
      "<strong>Income Generation:</strong> In a flat or slightly bullish market, covered calls can generate 1-2% monthly income on top of dividends."
    ],
    contextUS: "In the US, options premiums are generally taxed as Short-Term Capital Gains (ordinary income rates) unless held for long periods, which is rare for covered calls. Holding the underlying stock in a tax-advantaged account (IRA) makes this strategy extremely efficient.",
    deepDiveTitle: "Anatomy of a Covered Call",
    deepDiveContent: `
      <p>Scenario: You own 100 shares of Apple (AAPL) at $150/share. Total value: $15,000.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Trade</h3>
      <p>You sell (write) a \"Call Option\" with a <strong>$160 Strike Price</strong> expiring in <strong>30 days</strong>. <br/>
      The buyer pays you <strong>$200 Premium</strong> instantly.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Outcome A: Stock stays below $160</h3>
      <p>At the end of 30 days, Apple is at $155. <br/>
      The option expires worthless. You keep your 100 shares. You keep the $200. <br/>
      <strong>Result:</strong> You made $200 profit on a stock that didn't do much. You can now repeat this next month.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Outcome B: Stock rises to $170</h3>
      <p>The option is \"In the Money\". You are forced to sell your shares at $160. <br/>
      You keep the $200 premium. You keep the profit from $150 to $160 ($1,000). <br/>
      <strong>Missed Opportunity:</strong> You missed the gain from $160 to $170. You still made money, just less than if you had just held.</p>
    `,
    strategyTitle: "Execution Strategy",
    strategySteps: [
      "<strong>Accumulate 100 Shares:</strong> This is the barrier to entry. You cannot sell calls on VTI if you only own 50 shares.",
      "<strong>Choose a Delta:</strong> Look for a 'Delta' of 0.30. This suggests a ~70% probability that the option expires worthless (you keep the stock). It strikes a balance between income and risk of assignment.",
      "<strong>Avoid Earnings:</strong> Do not sell calls during earnings week. Volatility can cause the stock to spike, causing you to lose your shares.",
      "<strong>The 'Wheel' Strategy:</strong> Advanced investors combine this with 'Cash Secured Puts' to buy stocks at a discount and sell them at a premium repeatedly."
    ],
    faq: [
      {
        q: "Can I lose money?",
        a: "Only if the stock price crashes. If Apple drops to $100, you still own the shares (now worth less). The premium you collected ($200) actually <em>cushions</em> the blow slightly. It is safer than just holding."
      },
      {
        q: "What if I want to keep the stock?",
        a: "Then don't sell calls. Or, if the price rises, 'Roll' the option (buy it back and sell a new one at a higher price/later date) to avoid selling shares."
      },
      {
        q: "Is this passive?",
        a: "No. It requires monthly management. ETFs like JEPI or QYLD do this for you automatically for a fee, but DIY yields are often better."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "March 13, 2026"
  },
  {
    title: "Beginner’s Guide to Factor Investing (Value, Momentum, Quality)",
    desc: "How to tilt your portfolio toward stocks with higher expected returns using 'Smart Beta'.",
    intro: "Standard index investing (buying the S&P 500) is 'Market Cap Weighted'—you own more of the biggest companies. Factor Investing (or Smart Beta) challenges this. Academic research by Nobel laureates Fama and French suggests that certain <em>characteristics</em> (Factors) of stocks historically outperform the broad market over long periods. By specifically targeting stocks with these traits—like being cheap (Value) or going up fast (Momentum)—you can potentially boost your returns. This guide explains the five main factors and how to add them to your portfolio.",
    takeaways: [
      "<strong>Value Factor:</strong> Buying stocks that are cheap relative to their fundamentals (Low P/E). Historically beats Growth.",
      "<strong>Momentum Factor:</strong> Buying stocks that have gone up recently. The trend tends to continue. 'Buy high, sell higher.'",
      "<strong>Quality Factor:</strong> Buying profitable companies with low debt. They survive downturns better.",
      "<strong>Size Factor:</strong> Small companies tend to outperform large companies (though this factor has been weaker recently)."
    ],
    contextUS: "The US ETF market offers low-cost access to these academic strategies. Tickers like AVUV (Small Cap Value) or MTUM (Momentum) allow retail investors to build hedge-fund-like portfolios without the high fees.",
    deepDiveTitle: "The Factor Menu",
    deepDiveContent: `
      <p>Customize your allocation based on these drivers of return.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Value (VTV / AVUV)</h3>
      <p><strong>The Logic:</strong> Investors overreact to bad news, making boring companies too cheap. Eventually, the price reverts to fair value.</p>
      <p><strong>Role:</strong> The Long-Term Anchor. Requires patience (can underperform for a decade, like 2010-2020).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Momentum (MTUM)</h3>
      <p><strong>The Logic:</strong> Winners keep winning. Investors flock to rising stocks.</p>
      <p><strong>Role:</strong> The Turbocharger. High volatility. Requires frequent rebalancing (high turnover).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Quality (QUAL)</h3>
      <p><strong>The Logic:</strong> Profitable companies with wide moats are safer.</p>
      <p><strong>Role:</strong> Defense. Often outperforms in choppy/recessionary markets.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">4. Low Volatility (USMV)</h3>
      <p><strong>The Logic:</strong> Boring stocks are underpriced because people crave lottery tickets. They offer market-like returns with less risk.</p>
    `,
    strategyTitle: "How to Implement a Tilt",
    strategySteps: [
      "<strong>Core & Satellite:</strong> Keep 70% in VTI (Total Market). Use 30% to 'Tilt' toward factors. <br/> - Example: 70% VTI, 15% AVUV (Small Value), 15% QMOM (Momentum).",
      "<strong>Commitment is Key:</strong> Factors can underperform the S&P 500 for 5-10 years. If you give up during the bad times, you lose the premium. You must hold for 20+ years.",
      "<strong>Watch Fees:</strong> Factor ETFs are more expensive (0.15% - 0.40%) than VTI (0.03%). Ensure the expected excess return justifies the fee."
    ],
    faq: [
      {
        q: "Is this better than S&P 500?",
        a: "Historically, yes. 'Small Cap Value' has been the highest returning asset class in US history. But it is much more volatile. The 'best' portfolio is the one you can stick with."
      },
      {
        q: "Can I combine them?",
        a: "Yes. 'Multi-Factor' ETFs (like LRGF) try to buy stocks that are Cheap AND High Quality. This smooths out the ride."
      },
      {
        q: "Is this active management?",
        a: "It's 'Rules-Based' active. A computer picks the stocks based on strict math criteria, not a human manager guessing. It removes emotion."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "March 14, 2026"
  },
  {
    title: "How to Build a Low-Risk 'Coffee Can' Portfolio",
    desc: "The 'Buy and Hold Forever' strategy popularized by Robert Kirby.",
    intro: "In 1984, Robert Kirby wrote about a client who inadvertently built a massive fortune. The client followed buy recommendations but ignored sell recommendations. He put stock certificates in a 'Coffee Can' and forgot about them. Decades later, the portfolio was worth millions because he never interrupted the compounding of his winners. The 'Coffee Can' strategy is the ultimate low-stress investing method: buy high-quality companies, hold them for 10+ years, and do absolutely nothing.",
    takeaways: [
      "<strong>Inactivity is Alpha:</strong> Most investors underperform because they trade too much. Fees, taxes, and bad timing kill returns. Doing nothing solves all three.",
      "<strong>The Power of Tails:</strong> In a portfolio of 10 stocks, 5 might go nowhere, 3 might lose money, but 2 might go up 100x (like Amazon). The winners pay for all the losers and then some. Selling early caps your winners.",
      "<strong>No Rebalancing:</strong> Unlike index funds, you do not trim winners. Let your Apple or Nvidia grow to become 50% of the portfolio. Let the flowers bloom.",
      "<strong>10-Year Minimum:</strong> Only buy a stock if you are willing to hold it for 10 years without looking at the price."
    ],
    contextUS: "This strategy is extremely tax-efficient in the US. By never selling, you never trigger Capital Gains Tax. You only pay tax when you finally withdraw in retirement (or your heirs get a 'Step-Up in Basis' tax-free). It is the ultimate estate planning hack.",
    deepDiveTitle: "Constructing the Can",
    deepDiveContent: `
      <p>How to pick stocks you can ignore for a decade.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Selection Criteria</h3>
      <p>You aren't looking for 'undervalued' stocks. You are looking for 'compounders'.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Moat:</strong> Does it have a durable competitive advantage? (e.g., Costco's membership model, Microsoft's enterprise lock-in).</li>
        <li><strong>ROC (Return on Capital):</strong> Does it generate high returns on its own cash? (>15%).</li>
        <li><strong>Clean Balance Sheet:</strong> Low debt. Companies with high debt go bankrupt in recessions. You need survivors.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Process</h3>
      <ol class="list-decimal pl-5 space-y-2 mb-4">
        <li>Allocate a fixed amount (e.g., $10,000).</li>
        <li>Pick 10-15 high-quality US companies.</li>
        <li>Invest equal amounts in each.</li>
        <li><strong>Forget the Password.</strong> Seriously. Do not check it. Do not sell the losers. Do not trim the winners.</li>
      </ol>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Why it Works</h3>
      <p>Most portfolios are killed by 'cutting flowers and watering weeds' (selling winners to buy losers). Coffee Can investing forces you to let the winners run to infinity.</p>
    `,
    strategyTitle: "Modern Adaptation",
    strategySteps: [
      "<strong>The 'Fun Money' Bucket:</strong> Use 90% Index Funds for retirement. Use 10% for a Coffee Can portfolio. It satisfies the urge to pick stocks without risking your life savings.",
      "<strong>Use a Separate Broker:</strong> Open a separate account (e.g., at Schwab) just for this. If it's mixed with your main money, you will be tempted to meddle. Put it on an island.",
      "<strong>Dividends:</strong> Set dividends to Reinvest automatically. If you take the cash, you break the compounding loop."
    ],
    faq: [
      {
        q: "What if a company goes bankrupt?",
        a: "Let it go to zero. In a portfolio of 10 stocks, if one goes to zero (-100%) but another goes to 1,000% (10-bagger), you still win huge. You only need one super-winner to carry the portfolio."
      },
      {
        q: "Isn't this risky?",
        a: "Yes, it is 'Concentration Risk'. But wealth is <em>created</em> by concentration and <em>preserved</em> by diversification. This is a wealth creation strategy."
      },
      {
        q: "Can I do this with ETFs?",
        a: "You can, but it defeats the purpose. ETFs rebalance themselves. The Coffee Can is about letting a single great company become 50% of your net worth."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "March 15, 2026"
  },
  {
    title: "What Happens to Your Stocks if Your Broker Shuts Down?",
    desc: "Understanding SIPC insurance and custodial segregation rules.",
    intro: "When you log into Robinhood or Fidelity, you see numbers on a screen. But what if the website goes dark tomorrow? What if the brokerage goes bankrupt? After the collapse of FTX (Crypto) and Silicon Valley Bank, investors are rightfully worried about custodial risk. The good news is that the US stock market system is structurally different from crypto or banking. Your assets are segregated. This guide explains the safety nets—SIPC, Excess SIPC, and street name registration—that protect your life savings.",
    takeaways: [
      "<strong>Asset Segregation:</strong> By US law (SEC Rule 15c3-3), brokers must keep client assets separate from company assets. If the broker goes bust, they cannot use <em>your</em> stocks to pay <em>their</em> debts.",
      "<strong>SIPC Insurance:</strong> The Securities Investor Protection Corporation covers up to $500,000 per account type (including up to $250k cash) if assets are missing.",
      "<strong>Not Market Insurance:</strong> SIPC protects against <em>theft</em> or <em>broker failure</em>. It does NOT protect against the value of your stocks going down. If you buy a bad stock, that's on you.",
      "<strong>The Transfer Process:</strong> In 99% of broker failures, another broker buys the accounts. You wake up one day and your 'TD Ameritrade' login is now a 'Schwab' login. You lose nothing."
    ],
    contextUS: "Unlike crypto exchanges where you are an 'unsecured creditor', US brokerage accounts have strict legal protections. You own the underlying shares (beneficially), not the broker.",
    deepDiveTitle: "The Safety Net Hierarchy",
    deepDiveContent: `
      <p>What actually happens in a disaster?</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Layer 1: Segregation (The Wall)</h3>
      <p>Even if Robinhood owes billions, they cannot touch your VTI shares. Your shares are held at a depository (DTCC). In a bankruptcy, the trustee simply moves your record of ownership to a solvent broker.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Layer 2: SIPC (The Backstop)</h3>
      <p>If fraud occurs (e.g., Bernie Madoff scenario where the broker <em>stole</em> the shares), SIPC steps in. <br/>
      <strong>Limit:</strong> $500,000 total per customer capacity ($250k cash limit). <br/>
      <em>Note:</em> This limit applies per 'separate capacity' (Individual, Joint, Roth are separate).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Layer 3: Excess SIPC (The Bonus)</h3>
      <p>Big brokers (Fidelity, Schwab) buy private insurance on top of SIPC. This often covers up to $1 Billion in total losses. Check your broker's 'Account Protection' page for their specific policy.</p>
    `,
    strategyTitle: "How to Protect Yourself",
    strategySteps: [
      "<strong>Split Large Balances:</strong> If you have $2 Million cash, don't keep it in one brokerage account (SIPC cash limit is $250k). Buy 'Cash Equivalents' like Money Market Funds or Treasuries. These count as 'Securities' ($500k limit) rather than cash.",
      "<strong>Download Statements:</strong> Once a quarter, download your PDF statement. This is your proof of ownership. If the app disappears, this document proves you owned 1,000 shares of Apple.",
      "<strong>Use Major Players:</strong> While startup apps are fun, there is safety in 'Too Big To Fail'. Fidelity and Schwab have trillions in assets. They aren't going anywhere.",
      "<strong>Direct Registration (DRS):</strong> For the paranoid, you can 'Direct Register' shares in your name with the transfer agent (e.g., Computershare). This removes the broker entirely, but makes selling harder."
    ],
    faq: [
      {
        q: "Is crypto SIPC insured?",
        a: "<strong>No.</strong> Crypto held on exchanges (Coinbase) is generally uninsured. If they go bust (FTX), you are an unsecured creditor. You likely lose everything. Self-custody (Cold Wallet) is the only protection."
      },
      {
        q: "What about Money Market Funds?",
        a: "They are securities, so they fall under the $500k SIPC limit, not the $250k cash limit. This makes them safer for large cash hoards than a bank account over the FDIC limit."
      },
      {
        q: "How long does it take to get money?",
        a: "In a clean transfer (broker buyout), days. In a liquidation (SIPC claim), it can take 1-3 months. Keep an emergency fund at a separate bank just in case."
      }
    ],
    author: "David Thompson, CPA",
    authorBio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions.",
    publishedDate: "March 16, 2026"
  }
];

export const savingInvestingArticles86: Article[] = details.map(detail => {
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
