
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from './article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to use tax-loss harvesting in a US taxable brokerage account",
    desc: "Turning market losses into a tax asset to boost after-tax returns.",
    intro: "No investor likes seeing red in their portfolio. However, in the US tax system, a financial loss can be converted into a tax asset. **Tax-Loss Harvesting (TLH)** is the practice of selling an investment that has lost value to 'realize' the loss, and using that loss to offset capital gains tax or ordinary income tax. It is the silver lining of a bear market. When done correctly, TLH can increase your after-tax returns by 0.50% to 1.00% annually without changing your portfolio's risk profile. This guide explains the mechanics and the 'Wash Sale' trap to avoid.",
    takeaways: [
      "<strong>The Deduction Limit:</strong> You can use capital losses to offset unlimited capital gains. If you have net losses left over, you can deduct up to <strong>$3,000</strong> against your ordinary income (wages) per year.",
      "<strong>Stay Invested:</strong> The goal isn't to sell and go to cash. The goal is to sell, bank the tax deduction, and immediately buy a similar (but not identical) asset to catch the rebound.",
      "<strong>The Wash Sale Rule:</strong> If you buy the 'substantially identical' security within 30 days before or after the sale, the IRS disallows the loss. You must swap to a different ticker (e.g., VTI to SCHB).",
      "<strong>Tax Deferral:</strong> TLH effectively defers taxes into the future. You lower your tax bill today, which keeps more money compounding for you."
    ],
    contextUS: "Robo-advisors (Betterment/Wealthfront) popularized automated TLH, but you can do it yourself at Fidelity or Schwab for free. It only applies to <strong>Taxable Brokerage Accounts</strong>. You cannot harvest losses in an IRA or 401(k).",
    deepDiveTitle: "The Harvesting Mechanics",
    deepDiveContent: `
      <p>Let's walk through a real-world scenario during a market correction.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Scenario</h3>
      <p>You bought $10,000 of the S&P 500 (VOO) in January. By June, the market drops 10%. Your position is worth $9,000. You have a $1,000 unrealized loss.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Execution</h3>
      <ol class="list-decimal pl-5 space-y-2 mb-4">
        <li><strong>Sell VOO:</strong> You sell all shares for $9,000. You have 'booked' a $1,000 capital loss.</li>
        <li><strong>Buy a Partner Fund:</strong> Immediately take the $9,000 cash and buy a Total Market Fund (VTI). It performs almost identically to VOO (99% correlation), so you don't miss the recovery.</li>
        <li><strong>The Result:</strong> You still have $9,000 invested in US stocks. But come tax time, you get a $1,000 deduction.</li>
      </ol>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Benefit</h3>
      <p>If you are in the 24% tax bracket, a $3,000 deduction saves you <strong>$720 in cold hard cash</strong> on your tax bill. That is an immediate return on investment just for clicking a few buttons.</p>
    `,
    strategyTitle: "Avoid the Wash Sale",
    strategySteps: [
      "<strong>Don't Buy the Same Ticker:</strong> You cannot sell VOO and buy VOO. You cannot even sell VOO and buy SPY (another S&P 500 fund). The IRS considers them identical.",
      "<strong>The 'Substantially Identical' Test:</strong> Swap an S&P 500 fund for a Total Market fund (VTI). Or swap a Total International fund (VXUS) for an Emerging Markets fund (VWO). Change the index slightly.",
      "<strong>Check Dividend Reinvestment:</strong> If you sell VOO for a loss, but your account automatically buys $50 of VOO via a dividend reinvestment 2 days later, you triggered a Wash Sale. Turn off DRIP in taxable accounts.",
      "<strong>Don't Wait for December:</strong> Harvest losses whenever they happen. Volatility creates opportunities year-round."
    ],
    faq: [
      {
        q: "Does this reset my holding period?",
        a: "Yes. When you buy the new fund (VTI), the clock resets for Long-Term Capital Gains. You must hold the new fund for 1 year to get the lower tax rate again."
      },
      {
        q: "Can I use losses from 5 years ago?",
        a: "Yes. Capital losses carry forward indefinitely. If you lost $50,000 in 2022, you can deduct $3,000/year for ~17 years."
      },
      {
        q: "Is it worth it for small losses?",
        a: "Generally, wait until the loss is at least $500 or $1,000. The effort/paperwork isn't worth it for a $50 deduction."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications.",
    publishedDate: "February 20, 2026"
  },
  {
    title: "How to build a sinking fund for vehicle repairs and replacements",
    desc: "Breaking the cycle of car payments by saving for depreciation.",
    intro: "Cars are the second largest expense for US households, yet they are often the most mismanaged. Most people treat car repairs as 'emergencies' and car replacement as a reason to take out a loan. Both are predictable. A car *will* need tires, brakes, and eventually replacement. By treating your vehicle as a depreciating asset that requires a monthly 'maintenance fee' paid to yourself, you can drive for free (or cheap) and never pay interest on a car loan again.",
    takeaways: [
      "<strong>The 'Repair' Fund:</strong> Budget $0.10 per mile driven. If you drive 12,000 miles/year, save $100/month for maintenance (Tires, Brakes, Oil).",
      "<strong>The 'Replace' Fund:</strong> Cars have a lifespan. If you buy a $20k car and expect it to last 10 years, it costs you $166/month in depreciation. Save this amount monthly to buy the next one cash.",
      "<strong>Earn Interest:</strong> While you save for the next car, your cash earns 5% in a HYSA. When you finance, you *pay* 7%. The swing is massive.",
      "<strong>Separate Account:</strong> Do not mix Car Money with House Money. Open a specific 'Car' savings bucket."
    ],
    contextUS: "The average new car payment in the US is over $730/month. If you invest that $730/month instead of paying it to a bank, you would have ~$1.5 Million in 35 years. Driving paid-off cars is a millionaire habit.",
    deepDiveTitle: "Calculating the Monthly Cost",
    deepDiveContent: `
      <p>Your car costs more than gas and insurance.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Maintenance Sinking Fund</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Tires:</strong> $800 every 40k miles.</li>
        <li><strong>Brakes:</strong> $400 every 40k miles.</li>
        <li><strong>Fluids/Filters:</strong> $200/year.</li>
        <li><strong>Major Repair Buffer:</strong> $500/year.</li>
        <li><strong>Total:</strong> ~$75/month. If you don't save this, a mechanic bill will feel like a crisis.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Replacement Sinking Fund</h3>
      <p>You drive a car worth $15,000. You want to replace it in 5 years with another $15,000 car (inflation adjusted to $18,000). <br/>
      Your current car will be worth $5,000 as a trade-in. <br/>
      <strong>Gap:</strong> $13,000 needed. <br/>
      <strong>Savings Target:</strong> $13,000 / 60 months = <strong>$216/month</strong>.</p>
      
      <p><strong>Grand Total:</strong> You need to auto-transfer <strong>$291/month</strong> to stay ahead of the car game.</p>
    `,
    strategyTitle: "The 'Drive Free' Strategy",
    strategySteps: [
      "<strong>Step 1: Keep the Beater.</strong> Drive your current car until the wheels fall off. Every month you don't have a payment, put the equivalent payment into savings.",
      "<strong>Step 2: Buy Used with Cash.</strong> Use that savings to buy a 3-5 year old reliable car (Toyota/Honda). Let someone else take the depreciation hit.",
      "<strong>Step 3: Keep Paying Yourself.</strong> Even though you have no loan, keep transferring $400/mo to the Car Fund. You are now earning interest.",
      "<strong>Step 4: Upgrade.</strong> In 5 years, your Car Fund has $25,000+ cash. Sell your current car for $10,000. You now have $35,000 to buy a nicer car, cash."
    ],
    faq: [
      {
        q: "What if my car dies tomorrow?",
        a: "Use your Emergency Fund to buy a cheap 'Point A to Point B' car ($5k). Drive it while you rebuild the Car Fund. Do not finance a $40k car out of desperation."
      },
      {
        q: "Is leasing better?",
        a: "Almost never. Leasing is the most expensive way to drive because you are perpetually paying for the steepest part of the depreciation curve."
      },
      {
        q: "Where do I keep the money?",
        a: "High-Yield Savings Account. Do not invest it in stocks if you need the car in < 3 years. You can't risk a market crash right when your transmission blows."
      }
    ],
    author: "Robert Hughes",
    authorBio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash.",
    publishedDate: "February 21, 2026"
  },
  {
    title: "How to choose inflation-protected investments for long-term security",
    desc: "Hedging your portfolio against the erosion of the dollar.",
    intro: "The standard '60/40 portfolio' (Stocks/Bonds) assumes low, stable inflation. But what happens when inflation spikes to 5% or 8% for a decade? Standard bonds get crushed, and cash becomes trash. To build a truly resilient portfolio, you need a slice of assets that explicitly benefit from rising prices. This guide explores the 'Real Asset' class—I-Bonds, TIPS, Commodities, and Real Estate—and how to layer them into your portfolio without sacrificing growth.",
    takeaways: [
      "<strong>Stocks are the Primary Hedge:</strong> Over 20+ years, stocks beat inflation because companies raise prices. Do not abandon equities.",
      "<strong>I-Bonds:</strong> The best cash alternative. The interest rate floats with CPI. It guarantees your purchasing power never drops.",
      "<strong>TIPS (Treasury Inflation-Protected Securities):</strong> The principal value rises with inflation. Best held in tax-advantaged accounts to avoid 'phantom income' tax.",
      "<strong>The 10% Tilt:</strong> Allocating 5-10% of your portfolio to inflation-specific hedges (like Commodities or REITs) can smooth volatility during stagflation."
    ],
    contextUS: "The 1970s were a 'Lost Decade' for US stocks due to high inflation. Gold and Real Estate were the winners. Diversifying into these assets acts as insurance against a repeat of that economic cycle.",
    deepDiveTitle: "The Inflation Menu",
    deepDiveContent: `
      <p>Ranked by effectiveness and ease of use.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Series I Savings Bonds (The Anchor)</h3>
      <p><strong>Pros:</strong> Zero nominal risk. Guaranteed to match inflation. Tax-deferred.</p>
      <p><strong>Cons:</strong> $10k annual purchase limit per person. Must hold for 1 year.</p>
      <p><strong>Role:</strong> Emergency Fund Layer 2.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Real Estate (REITs)</h3>
      <p><strong>Pros:</strong> Rents reset annually (or faster). Property values tend to rise with replacement costs (lumber/labor).</p>
      <p><strong>Cons:</strong> Interest rate sensitive. If rates rise to fight inflation, REIT prices can drop initially.</p>
      <p><strong>Role:</strong> Income and Growth.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Commodities (Oil/Metals)</h3>
      <p><strong>Pros:</strong> Often the <em>cause</em> of inflation, so they rise directly with it.</p>
      <p><strong>Cons:</strong> Highly volatile. No cash flow (dividends). It is a pure price bet.</p>
      <p><strong>Role:</strong> Small hedge (5% max).</p>
    `,
    strategyTitle: "Portfolio Construction",
    strategySteps: [
      "<strong>The 'All Weather' Slice:</strong> Consider allocating 10% of your portfolio to an ETF like <strong>PDBC</strong> (Commodities) or <strong>VNQ</strong> (Real Estate).",
      "<strong>The TIPS Ladder:</strong> For retirees, building a ladder of TIPS bonds ensures that your income rises with your cost of living. Ticker <strong>VTIP</strong> covers short-term inflation bonds.",
      "<strong>Avoid Long-Term Nominal Bonds:</strong> A 30-year standard Treasury bond gets destroyed by inflation. Shorten your bond duration (move to T-Bills) when inflation expectations are high.",
      "<strong>Don't Over-Hedge:</strong> Inflation hedges often drag down performance during low-inflation booms (like the 2010s). Do not go 50% Gold. Keep insurance as a small part of the plan."
    ],
    faq: [
      {
        q: "Is Bitcoin an inflation hedge?",
        a: "Data is mixed. In 2022 (high inflation), Bitcoin crashed. It behaves more like a tech stock than digital gold currently. Don't rely on it as your primary safety net."
      },
      {
        q: "Why do TIPS lose money?",
        a: "TIPS are bonds. If interest rates rise (to fight inflation), the bond price falls. You need to hold TIPS to maturity to guarantee the inflation protection. ETF prices will fluctuate."
      },
      {
        q: "Should I buy gold coins?",
        a: "Physical gold has high markups (5-10%). Buying a Gold ETF (GLDM) is cheaper and more liquid if you just want price exposure."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "February 22, 2026"
  },
  {
    title: "How to save effectively when living on a single income household",
    desc: "Strategies for one-income families to build wealth and safety.",
    intro: "Living on one income in a two-income economy feels like playing the game on 'Hard Mode'. Whether by choice (stay-at-home parent) or circumstance, single-income households have zero redundancy. If the earner loses their job, the family income drops to $0 instantly. This binary risk profile demands a different financial architecture than dual-income peers. You cannot optimize for maximum efficiency; you must optimize for maximum resiliency. This guide outlines the defensive playbook for single-earner success.",
    takeaways: [
      "<strong>The 'Spousal IRA':</strong> Even if one spouse earns $0, the working spouse can contribute to an IRA in their name. This doubles your tax-advantaged space ($14,000 total vs $7,000).",
      "<strong>Aggressive Liquidity:</strong> You need a larger Emergency Fund (6-9 months) than a dual-income family (3 months). You don't have a backup paycheck.",
      "<strong>Life Insurance is Mandatory:</strong> You need 10-12x income in Term Life insurance on the earner immediately. You also need coverage on the stay-at-home parent to cover childcare costs if they pass.",
      "<strong>Disability Insurance:</strong> Your ability to work is your only asset. Own-Occupation Disability Insurance is non-negotiable."
    ],
    contextUS: "The US tax code offers 'Married Filing Jointly' brackets which are advantageous for single-earner households (the high earner gets double the bracket space). Leveraging this tax arbitrage helps offset the lack of a second income.",
    deepDiveTitle: "The Resilience Budget",
    deepDiveContent: `
      <p>You can't afford lifestyle creep. You need a wider gap.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. The 'Half-Check' Rule</h3>
      <p>When the paycheck hits, immediately move 10-15% to savings. Do not wait until the end of the month. You must artificially lower your 'Spendable Income' to force frugality.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The Stay-at-Home 'Job'</h3>
      <p>The non-earning spouse has a massive financial role: Expense Destruction.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Cooking:</strong> Saves $1,000/mo vs takeout.</li>
        <li><strong>Childcare:</strong> Saves $2,000/mo vs daycare.</li>
        <li><strong>In-sourcing:</strong> Cleaning, repairs, yard work.</li>
      </ul>
      <p><em>Mindset Shift:</em> The stay-at-home parent isn't 'unemployed'; they are generating tax-free value by avoiding costs.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Career Risk Management</h3>
      <p>The earner cannot 'quiet quit.' They must be a top performer. They must also keep their network active. If they get laid off, the family has 0 days of buffer (besides savings).</p>
    `,
    strategyTitle: "Tactical Steps",
    strategySteps: [
      "<strong>Max the HSA:</strong> If you have a Family HDHP plan, you can save $8,550 tax-free. This is a huge bucket for single-income families to build wealth.",
      "<strong>Term Life Today:</strong> Go to PolicyGenius or similar. Get a 20-year term policy for $1M-$2M on the earner. It costs ~$50-$80/mo. If you die without it, your family is destitute.",
      "<strong>The 'Side Readiness' Plan:</strong> The non-working spouse should keep certifications active or maintain a small side hustle. If the main earner gets sick, the ability to ramp up income quickly is a safety valve.",
      "<strong>Avoid the 'Doctor Car':</strong> Even if the earner makes $200k, do not buy the luxury car. A $200k single income is riskier than two $100k incomes. Live like you make $120k."
    ],
    faq: [
      {
        q: "Can we still retire early?",
        a: "Yes, but it requires extreme discipline. You likely need a savings rate of 30%+, which is hard on one income. It usually requires lower structural expenses (smaller house)."
      },
      {
        q: "What happens to Social Security?",
        a: "The non-working spouse is entitled to a 'Spousal Benefit' (50% of the earner's benefit) at retirement age. You don't lose out entirely."
      },
      {
        q: "Should we pay off the mortgage?",
        a: "Psychologically, yes. Eliminating the mortgage lowers the monthly 'Nut' required to survive. It makes a job loss less catastrophic."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "February 23, 2026"
  }
];

export const savingInvestingArticles67: Article[] = details.map(detail => {
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
