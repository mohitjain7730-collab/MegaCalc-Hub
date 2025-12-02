
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Build a Retirement Plan When You Have Multiple Income Sources",
    desc: "Coordinating Social Security, Pensions, Rentals, and Portfolio Withdrawals for tax efficiency.",
    intro: "The traditional retirement model relies on a 'Three-Legged Stool': Social Security, Pensions, and Savings. Today, many retirees have a messy garage of income sources: a small pension from an old job, rental income from a duplex, Social Security, 401(k) RMDs, and maybe even a side hustle. Having multiple income streams is excellent for security, but it creates a tax complexity nightmare. If all these streams hit your bank account at once, they can push you into a high tax bracket and trigger Medicare surcharges. This guide explains how to layer and sequence your income.",
    takeaways: [
      "<strong>The 'Income Floor' Strategy:</strong> Categorize your income into 'Guaranteed' (Social Security/Pension) and 'Variable' (Portfolio/Rent). Use Guaranteed income to cover Fixed Expenses (Housing/Food). Use Variable income for Discretionary spending.",
      "<strong>Tax Bracket Management:</strong> Fixed income sources (Pensions/RMDs) fill up the bottom of your tax bracket. You have less control over them. You must plan your <em>flexible</em> withdrawals (like IRA or Brokerage) around these fixed blocks to avoid spiking your tax rate.",
      "<strong>Provisional Income Watch:</strong> Having too many income sources can make up to 85% of your Social Security taxable. Monitor your 'Combined Income' carefully.",
      "<strong>The 'Fill the Gap' Method:</strong> Don't take portfolio withdrawals just because. Calculate your monthly spending need, subtract your fixed income sources, and withdraw <em>only</em> the difference. Reinvest the surplus."
    ],
    contextUS: "The US tax code taxes different income streams at different rates. Pension/401k = Ordinary Income. Social Security = 0-85% Taxable. Rental Income = Passive (offset by depreciation). Brokerage Sales = Capital Gains. Stacking these correctly is the key to keeping more money.",
    deepDiveTitle: "The Layered Income Cake",
    deepDiveContent: `
      <p>Visualize your income stacking up to fill tax buckets.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Layer 1: The Uncontrollables</h3>
      <p>These hit your tax return whether you want them to or not.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Social Security:</strong> $30,000/yr.</li>
        <li><strong>Pension:</strong> $20,000/yr.</li>
        <li><strong>RMDs (Age 73+):</strong> $40,000/yr.</li>
        <li><strong>Total Base Income:</strong> $90,000. (This already fills the 10% and 12% brackets).</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Layer 2: The Flexibles</h3>
      <p>You need $120,000 to live. You need $30,000 more.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Option A:</strong> Withdraw from Traditional IRA. (Taxed at 22% marginal rate).</li>
        <li><strong>Option B:</strong> Withdraw from Roth IRA. (Taxed at 0%).</li>
        <li><strong>Option C:</strong> Sell Stocks in Brokerage. (Taxed at 15% Capital Gains).</li>
      </ul>
      
      <p><strong>The Strategy:</strong> Since your base income is already high ($90k), adding more Ordinary Income (Option A) hurts. Use Option B or C to top up your lifestyle without jumping tax brackets.</p>
    `,
    strategyTitle: "Optimization Tactics",
    strategySteps: [
      "<strong>Roth Conversions Early:</strong> Before RMDs kick in (Age 73), your 'Uncontrollable' income is lower. Use the years 60-72 to convert IRA money to Roth. This lowers the RMD layer later.",
      "<strong>QLAC Strategy:</strong> If your RMDs are going to be too high, buy a Qualified Longevity Annuity Contract. You can move up to $200k out of the RMD calculation until age 85.",
      "<strong>Rental Depreciation:</strong> Use cost segregation or standard depreciation on rental properties to show a 'paper loss' or low income, even if cash flow is positive. This pairs well with high-tax pension income.",
      "<strong>Consolidate:</strong> Having 10 income sources is an administrative burden. Consider simplifying. Sell the rental property and buy a REIT. Roll old 401(k)s into one IRA."
    ],
    faq: [
      {
        q: "Do I pay FICA taxes?",
        a: "On pension/investment income? No. On side hustle income? Yes (15.3%). Factor this in if your 'multiple sources' includes active work."
      },
      {
        q: "What is IRMAA?",
        a: "Income-Related Monthly Adjustment Amount. If your total income (MAGI) goes over ~$206k (couple), Medicare adds a surcharge to your premiums. Watch your total stack."
      },
      {
        q: "Should I reinvest dividends?",
        a: "In retirement, usually <strong>No</strong>. Turn off DRIP. Let the dividends flow to cash. Use this cash to pay bills. It is the most passive income source you have."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications."
  },
  {
    title: "How to Prepare for Retirement if You Expect to Live Past Age 90",
    desc: "The 'Longevity Portfolio': Asset allocation for a 40-year retirement.",
    intro: "If you are healthy and have good genes, planning to age 85 is risky. You might live to 95 or 100. While living longer is a gift, financially it is a risk multiplier. A portfolio that lasts 25 years might fail at 35 years due to inflation erosion and late-life healthcare costs. 'Centenarian Planning' requires a different mindset: you cannot be too conservative. You need equities (stocks) to drive growth well into your 80s to ensure your purchasing power survives the century.",
    takeaways: [
      "<strong>Inflation is the Boss:</strong> Over 35 years, prices will likely triple. A fixed income portfolio (100% bonds) is guaranteed to lose purchasing power. You need 50-60% stocks even in retirement.",
      "<strong>The 3.5% Rule:</strong> The standard 4% withdrawal rule has a higher failure rate over 40 years. Dialing withdrawals down to 3.3% or 3.5% drastically improves the odds of money lasting to age 100.",
      "<strong>Deferred Income:</strong> Longevity annuities (QLACs) or delaying Social Security to 70 are powerful tools. They provide a guaranteed paycheck that you cannot outlive, acting as 'Old Age Insurance'.",
      "<strong>Reserve Fund:</strong> You need a specific 'Late Life' bucket for assisted living or home care. This is separate from your daily living expenses."
    ],
    contextUS: "According to the SSA, a couple aged 65 today has a 50% chance that <em>one</em> of them will live to age 92. Planning for age 95 is the new baseline for safety.",
    deepDiveTitle: "The 40-Year Portfolio",
    deepDiveContent: `
      <p>Standard portfolios glide to bonds. Yours must stay aggressive.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The 'Rising Equity' Glidepath</h3>
      <p>Research by Michael Kitces suggests that instead of getting <em>more conservative</em> as you age, you should get <em>more aggressive</em> after the initial danger zone passes.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Age 60-70 (Danger Zone):</strong> 50% Stocks / 50% Bonds. (Protect against Sequence Risk).</li>
        <li><strong>Age 70-80 (Stability):</strong> 60% Stocks / 40% Bonds.</li>
        <li><strong>Age 80-90 (Inflation Fight):</strong> 70% Stocks / 30% Bonds.</li>
      </ul>
      <p><em>Why?</em> By age 80, your timeline is shorter, but your need to beat medical inflation is higher. Also, you are likely leaving money to heirs (who have a long timeline).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Annuity Floor</h3>
      <p>Cover your 'Survival Costs' (Food/Housing) with Social Security and a fixed annuity. Cover your 'Fun' with the stock portfolio. This way, if you live to 105 and the market crashes, you still eat.</p>
    `,
    strategyTitle: "Longevity Tactics",
    strategySteps: [
      "<strong>Delay Social Security:</strong> This is non-negotiable. Claiming at 70 gives you the highest possible inflation-adjusted income for life. It is the best hedge against living to 100.",
      "<strong>Buy a QLAC:</strong> Use IRA money to buy a Qualified Longevity Annuity Contract. It starts paying at age 85. It ensures you get a 'pay raise' exactly when you might be running low on other assets.",
      "<strong>Healthspan Investment:</strong> Spend money on fitness and nutrition in your 60s. The most expensive thing in old age is chronic illness. Being frail at 95 costs $100k/year; being robust at 95 costs $40k/year."
    ],
    faq: [
      {
        q: "What about Long Term Care?",
        a: "Living to 95 increases the odds of cognitive decline. You must have a plan (Insurance or Self-Funding) for memory care. Do not assume family can handle it."
      },
      {
        q: "Is 4% safe for 40 years?",
        a: "Historically, yes, but the failure rate creeps up. Lowering to 3.5% creates a massive safety buffer. If the market booms, you can give yourself a raise later."
      },
      {
        q: "Should I spend principal?",
        a: "Yes. You can't take it with you. The goal is to die with $0, not to be the richest person in the cemetery. Just make sure the $0 happens at age 105, not 85."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Use a Retirement Glide Path to Reduce Risk Over Time",
    desc: "Automating your asset allocation shift from 'Growth' to 'Safety'.",
    intro: "A 'Glide Path' is the trajectory your asset allocation takes over your lifetime. Typically, it starts high in stocks (e.g., 90%) when you are young and gradually shifts toward bonds (e.g., 50%) as you approach retirement. This reduces the risk of a market crash devastating your portfolio right when you need to spend it. However, getting the glide path wrong—de-risking too early or too late—is costly. This guide explains how to design a custom glide path that balances growth needs with sleep-at-night safety.",
    takeaways: [
      "<strong>The Accumulation Slope:</strong> From age 20 to 50, stay high in equities (80-100%). Volatility is your friend here; it lets you buy cheap shares.",
      "<strong>The Transition Zone (5 Years Pre-Retirement):</strong> This is where the glide path steepens. Shift 5-10% per year into bonds/cash to build a 'Bond Tent' or 'Cash Buffer'.",
      "<strong>The Landing Point:</strong> Determine your 'Retirement Day' allocation (e.g., 60/40). You should hit this target exactly on the day you quit working.",
      "<strong>Static vs. Rising:</strong> Traditional glide paths stay conservative forever. Advanced paths 'Rise' back into equities in late retirement to fight inflation and leave a legacy."
    ],
    contextUS: "Target Date Funds (TDFs) have a built-in glide path. Understanding whether your TDF is 'To' (most conservative at retirement) or 'Through' (stays aggressive past retirement) is critical. Vanguard TDFs glide 'Through'; BlackRock LifePath typically glides 'To'.",
    deepDiveTitle: "Designing Your Flight Plan",
    deepDiveContent: `
      <p>Map your allocation to your age.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 1: The Climb (Age 25-50)</h3>
      <p><strong>Allocation:</strong> 90% Stocks / 10% Bonds. <br/>
      <strong>Goal:</strong> Maximize compounding. Ignore volatility. <br/>
      <strong>Glide:</strong> Flat. No changes needed.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 2: The Descent (Age 50-65)</h3>
      <p><strong>Allocation:</strong> Shifts from 90/10 to 50/50. <br/>
      <strong>Rate:</strong> Move ~2-3% per year into Bonds. <br/>
      <strong>Goal:</strong> Reduce 'Sequence of Returns Risk'. You are locking in your career winnings.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 3: The Landing (Age 65-75)</h3>
      <p><strong>Allocation:</strong> 50% Stocks / 50% Bonds (plus 2 years Cash). <br/>
      <strong>Goal:</strong> Income stability. You draw from the Bond/Cash side during crashes.</p>
    `,
    strategyTitle: "How to Execute the Glide",
    strategySteps: [
      "<strong>New Money First:</strong> Instead of selling stocks (taxable event), direct 100% of your <em>new</em> contributions in your 50s toward Bonds. This naturally shifts the ratio without triggering taxes.",
      "<strong>Dividend Direction:</strong> In your 50s, stop reinvesting stock dividends into stocks. Direct them to buy bonds. This is a gentle glide.",
      "<strong>The 'One-Time' Rebalance:</strong> If you are 5 years from retirement and the market hits an all-time high, seize the moment. Sell 10% of stocks and fill your Cash Bucket. Don't wait for the glide path if the market gives you a gift.",
      "<strong>Target Date Funds:</strong> The easiest way. Buy a 2035 Fund. It handles the math. You just keep buying."
    ],
    faq: [
      {
        q: "Can I stay 100% stocks?",
        a: "If you have 'Over-Saved' (e.g., you have 50x expenses), yes. You can live off dividends and ignore price drops. But for most, the risk of a 50% drop at age 65 is too scary."
      },
      {
        q: "What if rates rise?",
        a: "Bond prices fall when rates rise. Shorten your bond duration (buy Short-Term Treasuries) during the glide path to minimize interest rate risk."
      },
      {
        q: "Is the 'Bond Tent' better?",
        a: "Research suggests yes. Gliding to a peak bond allocation at retirement (the Tent) and then gliding <em>back</em> to stocks later offers the highest success rate."
      }
    ],
    author: "Jessica Martinez",
    authorBio: "Jessica is an investment strategist with a focus on portfolio construction and tax optimization. She advises clients on how to minimize tax drag in taxable brokerage accounts."
  },
  {
    title: "How to Plan for Retirement When You Want to Travel Full-Time",
    desc: "Budgeting for the 'Nomad' lifestyle: RVs, boats, and international living.",
    intro: "Many retirees dream of selling the house and seeing the world. Whether it is 'Van Life', living on a boat, or slow-traveling through Europe via Airbnbs, a full-time travel retirement requires a specialized financial plan. You are trading fixed costs (Mortgage/Property Tax) for variable costs (Fuel/Flights/Lodging). This lifestyle can be cheaper than a stationary retirement (Geo-Arbitrage) or much more expensive depending on your pace. This guide builds the budget for a life on the move.",
    takeaways: [
      "<strong>The 'Pace' Variable:</strong> Moving fast is expensive (daily flights/hotels). Moving slow is cheap (monthly Airbnb discounts). A 'Slow Travel' budget is often 30-40% lower than a 'Fast Travel' budget.",
      "<strong>The 'Home Base' Cost:</strong> Do you keep a house? Maintaining a vacant home while traveling is a massive wealth drag. Renting it out or selling it releases capital to fund the travel.",
      "<strong>Healthcare Logistics:</strong> Medicare does not cover you outside the US. You need Expat Health Insurance or a robust Travel Medical policy. Budget $300-$800/mo for this.",
      "<strong>The 'Exit Strategy':</strong> You won't travel forever. You need a plan for age 80. Set aside a portion of your nest egg to buy back into the housing market or pay for a CCRC when you settle down."
    ],
    contextUS: "Domicile is critical. If you sell your house and live in an RV, you still need a legal state of residence for taxes, voting, and driver's licenses. States like Florida, Texas, and South Dakota are popular for nomads due to 0% income tax and easy mail forwarding rules.",
    deepDiveTitle: "The Nomad Budget Builder",
    deepDiveContent: `
      <p>Scenario: Couple, Age 62. International Slow Travel.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Housing (The Arbitrage)</h3>
      <p><strong>US Cost:</strong> $3,000/mo (Mortgage/Tax/Util). <br/>
      <strong>Travel Cost:</strong> $2,000/mo (Airbnb monthly rates in Portugal/Thailand/Mexico). <br/>
      <em>Savings:</em> $1,000/month.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Transportation</h3>
      <p><strong>US Cost:</strong> $1,000/mo (2 Cars + Ins + Gas). <br/>
      <strong>Travel Cost:</strong> $500/mo (Uber/Trains/Flights). <br/>
      <em>Savings:</em> $500/month.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Food & Fun</h3>
      <p><strong>US Cost:</strong> $1,000/mo. <br/>
      <strong>Travel Cost:</strong> $1,500/mo (Eating out more). <br/>
      <em>Cost Increase:</em> $500/month.</p>
      
      <p><strong>The Verdict:</strong> Full-time travel can be <strong>$1,000/mo cheaper</strong> than staying home, provided you stay in LCOL areas and move slowly.</p>
    `,
    strategyTitle: "Logistical Setup",
    strategySteps: [
      "<strong>Establish Domicile:</strong> Pick a state (SD/FL/TX). Use a service like 'Escapees' or 'Dakota Post' to get a physical address, mail forwarding, and vehicle registration.",
      "<strong>Bank Accounts:</strong> Get a Schwab Investor Checking account. It refunds all ATM fees globally. You cannot travel without this.",
      "<strong>The 'Storage' Audit:</strong> Don't pay $300/mo for a storage unit for 10 years. That is $36,000. Sell the stuff. Buy new stuff if/when you settle down. Travel light.",
      "<strong>Phone Plans:</strong> Google Fi or T-Mobile allow international data. Or use local SIM cards (eSIMs) for cheaper rates."
    ],
    faq: [
      {
        q: "What about Medicare?",
        a: "Keep Part A (Free). You might pay Part B premiums just to keep it active for when you return. Rely on private travel insurance while abroad."
      },
      {
        q: "Is RV life cheaper?",
        a: "Not always. Gas, campsites ($50-$100/night), and repairs add up. 'Boondocking' (free camping) is cheap, but requires expensive solar/battery setups. RVing is a lifestyle choice, not always a savings strategy."
      },
      {
        q: "How do I get mail?",
        a: "Mail forwarding services scan your mail to an app. You read it online. They shred junk and forward checks/cards to your current location."
      }
    ],
    author: "Amanda Lee",
    authorBio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning."
  }
];

export const retirementPlanningArticles41: Article[] = details.map(detail => {
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
