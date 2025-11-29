
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to invest responsibly using ESG funds and sustainable portfolios",
    desc: "Balancing values and returns: A guide to Environmental, Social, and Governance investing.",
    intro: "For many investors, making money isn't enough; they want their money to align with their values. ESG (Environmental, Social, and Governance) investing has exploded in popularity, allowing you to filter out companies like tobacco, weapons, or fossil fuels. However, 'Sustainable Investing' is often filled with marketing fluff ('Greenwashing') and higher fees. Can you save the planet without sacrificing your retirement? This guide breaks down how to build an ethical portfolio that still follows sound financial principles.",
    takeaways: [
      "<strong>The 'Greenium':</strong> Historically, ESG funds sometimes underperform standard indices because 'Sin Stocks' (Oil/Tobacco) are often highly profitable. You might pay a premium for virtue.",
      "<strong>Expense Ratios:</strong> ESG funds actively screen companies, so they charge higher fees (0.15% - 0.50%) than vanilla index funds (0.03%). Watch costs closely.",
      "<strong>Broad vs. Niche:</strong> Buying a broad ESG ETF (like ESGU) is safer than betting on a specific 'Clean Energy' sector ETF (ICLN), which is highly volatile.",
      "<strong>Greenwashing Risk:</strong> Just because a fund says 'ESG' doesn't mean it's perfect. Many ESG funds still hold Tech giants like Apple/Microsoft. Read the holdings."
    ],
    contextUS: "The US regulatory environment for ESG is evolving. The SEC is cracking down on misleading labels. As an investor, you must look under the hood. Does the fund actually exclude the companies you hate, or just underweight them?",
    deepDiveTitle: "How to Construct an ESG Portfolio",
    deepDiveContent: `
      <p>You don't have to pick individual solar stocks. Use ETFs to get broad exposure.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Broad Market ESG (The Core)</h3>
      <p><strong>Ticker:</strong> ESGU (iShares ESG Aware MSCI USA).</p>
      <p><strong>What it does:</strong> It tracks the S&P 500 but screens out the 'worst offenders' (Thermal Coal, Tobacco). It keeps the sector weights similar to the market so your returns don't deviate too much.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Strict Exclusionary (The Purist)</h3>
      <p><strong>Ticker:</strong> XVV (iShares ESG Screened).</p>
      <p><strong>What it does:</strong> Removes companies involved in Controversial Weapons, Nuclear Weapons, Civilian Firearms, Tobacco, etc. A harder screen than ESGU.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Thematic (The Satellite)</h3>
      <p><strong>Ticker:</strong> TAN (Solar) or FAN (Wind).</p>
      <p><strong>What it does:</strong> Bets purely on renewable energy. <strong>Warning:</strong> These are extremely volatile. They can drop 50% in a year if government subsidies change. Keep allocation low (<5%).</p>
    `,
    strategyTitle: "The Trade-Offs",
    strategySteps: [
      "<strong>Accept Tracking Error:</strong> Your ESG portfolio will not match the S&P 500 exactly. In years where Oil booms, you will lose. In years where Oil crashes, you will win. You must be comfortable with being different.",
      "<strong>Vote Your Shares:</strong> Even better than divesting is 'Engagement.' Some funds (like Engine No. 1) buy oil stocks specifically to vote at shareholder meetings and force them to go green.",
      "<strong>Don't Overpay:</strong> If an ESG fund charges 1.00%, it is a rip-off. Stick to Vanguard/iShares ESG funds with fees under 0.20%.",
      "<strong>Charity as an Alternative:</strong> Some economists argue it's better to invest in the standard S&P 500 (maximising profit) and then <em>donate</em> the extra profit to climate charities. This is often more impactful than just avoiding oil stocks."
    ],
    faq: [
      {
        q: "Is ESG political?",
        a: "It has become politicized in the US. Some states have banned ESG funds in state pensions. As an individual investor, ignore the noise and focus on <em>your</em> values and <em>your</em> returns."
      },
      {
        q: "Does Tesla count as ESG?",
        a: "It's complicated. Tesla is great for 'E' (Environment) but often scores low on 'S' (Social/Labor) and 'G' (Governance). Different funds rate it differently."
      },
      {
        q: "Can I do ESG with bonds?",
        a: "Yes. 'Green Bonds' fund specific environmental projects. ETFs like EAGG (ESG Aggregate Bond) offer a fixed-income solution."
      }
    ],
    author: "Christopher Baker",
    authorBio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks.",
    publishedDate: "December 16, 2025"
  },
  {
    title: "How to maintain savings progress during periods of job instability",
    desc: "Defensive financial moves to make when you fear a layoff.",
    intro: "The most stressful time in personal finance is the 'Rumor Phase'—when whispers of layoffs start circulating at work, or your industry enters a downturn. The natural instinct is to panic. However, this window of time is a gift. If you act 3 months *before* a layoff, you can bulletproof your finances. This guide explains how to pivot from 'Wealth Building Mode' to 'Fortress Mode,' prioritizing liquidity and optionality over long-term growth.",
    takeaways: [
      "<strong>Cash Hoarding:</strong> Stop extra payments on debt immediately. Pay minimums only. Cash is your oxygen mask; debt payoff can wait.",
      "<strong>The 'Austerity' Budget:</strong> Cut discretionary spending <em>now</em>, while you still have a paycheck. Bank the difference. This tests your survival budget before you are forced to live on it.",
      "<strong>Pause Investing:</strong> It is controversial, but pausing 401(k) contributions (except the match) to stockpile cash is smart if your emergency fund is thin.",
      "<strong>Use Benefits:</strong> Get your dental cleaning, eye exam, and prescription refills done <em>now</em> while you still have insurance."
    ],
    contextUS: "COBRA (continuing health insurance after job loss) is famously expensive, often costing $1,500+/month for a family. Building a cash pile specifically for healthcare premiums is the most overlooked part of layoff prep.",
    deepDiveTitle: "The Pre-Layoff Checklist",
    deepDiveContent: `
      <p>If you think the axe is falling in 90 days, execute this plan.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Open a HELOC</h3>
      <p>Home Equity Line of Credit. You must apply for this while you are <strong>employed</strong>. Banks will not lend to you once you have no income. Having access to $50k of equity is a massive safety net you hope never to use.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Stop the Auto-Pay (Strategic)</h3>
      <p>If you automate extra payments to your mortgage or student loans, turn them off. Re-direct that cash to your High-Yield Savings Account. If you keep your job, you can dump the cash onto the debt later. If you lose your job, you'll need that cash for food.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Network Warm-Up</h3>
      <p>Update your LinkedIn. Reach out to 3 recruiters just to 'say hi'. It is much easier to network from a position of strength (employed) than desperation (unemployed).</p>
    `,
    strategyTitle: "What to Do If It Happens",
    strategySteps: [
      "<strong>Day 1: File for Unemployment.</strong> Do not wait. In the US, it can take weeks for checks to arrive. File immediately.",
      "<strong>The 401(k) Decision:</strong> Do not cash it out. Leave it there. If you have a loan against it, check the repayment terms (usually due in 60 days).",
      "<strong>Severance Negotiation:</strong> If offered severance, ask for 'COBRA coverage' to be included. Companies often say yes to paying for 3 months of health insurance to get you to sign.",
      "<strong>Gig Economy Bridge:</strong> Turn on Uber/DoorDash immediately. Even earning $500/week prevents you from draining your savings too fast. It stretches your runway."
    ],
    faq: [
      {
        q: "Should I sell stocks to raise cash?",
        a: "Only as a last resort. Selling stocks during a recession (when they are down) locks in losses. Rely on your Emergency Fund first, then HELOC, then Roth IRA contributions, then Taxable Stocks."
      },
      {
        q: "Does severance affect unemployment?",
        a: "In some states, yes. It can delay when your benefits start. Check your state's labor department website."
      },
      {
        q: "Can I pause my mortgage?",
        a: "Call your lender. Ask for 'Forbearance'. During crises, banks often allow you to skip payments for 3 months (added to the end of the loan). Use this only if necessary to save cash."
      }
    ],
    author: "Amanda Lee",
    authorBio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning.",
    publishedDate: "December 17, 2025"
  },
  {
    title: "How to use tax-efficient investing strategies in a taxable US brokerage account",
    desc: "Keeping more of your returns by managing dividends, turnover, and harvesting.",
    intro: "Once you have maxed out your 401(k) and IRA, the next step is the Taxable Brokerage Account. Unlike retirement accounts, the IRS watches every move here. Every dividend you receive and every share you sell generates a tax bill. If you aren't careful, you can lose 1% to 2% of your annual returns to 'Tax Drag.' However, with smart management—specifically 'Asset Location' and 'Tax Loss Harvesting'—you can make a taxable account nearly as efficient as an IRA.",
    takeaways: [
      "<strong>Asset Location:</strong> Put 'Tax-Efficient' assets (ETFs, Stocks) in your brokerage. Put 'Tax-Inefficient' assets (Bonds, REITs) in your IRA. This simple sorting saves massive taxes.",
      "<strong>ETFs > Mutual Funds:</strong> ETFs rarely distribute capital gains due to their unique creation/redemption structure. They are the preferred vehicle for taxable accounts.",
      "<strong>Tax Loss Harvesting (TLH):</strong> The silver lining of a crash. Selling a loser allows you to bank a tax deduction to offset future gains or ordinary income ($3,000/year).",
      "<strong>Qualified Dividends:</strong> Ensure you hold dividend stocks for >60 days to get the lower 15% tax rate instead of your income tax rate."
    ],
    contextUS: "The US tax code is progressive. Short-term gains are taxed at your highest marginal rate (up to 37%). Long-term gains are taxed at 0%, 15%, or 20%. The goal of taxable investing is to *never* pay short-term capital gains tax.",
    deepDiveTitle: "The 'Do Not Buy' List for Taxable Accounts",
    deepDiveContent: `
      <p>Avoid holding these assets in a brokerage account if possible.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. REITs (Real Estate Investment Trusts)</h3>
      <p><strong>Why:</strong> By law, they pay out 90% of income. These dividends are usually 'Non-Qualified,' meaning they are taxed at your full income tax rate (e.g., 32%). Keep them in an IRA.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Corporate Bond Funds</h3>
      <p><strong>Why:</strong> Interest payments are taxed as Ordinary Income. High tax drag. Use Municipal Bonds instead (Tax-Free).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. High-Turnover Active Funds</h3>
      <p><strong>Why:</strong> If the fund manager buys and sells stocks frequently, they generate short-term capital gains that are passed on to you. You get a tax bill even if the fund lost value.</p>
    `,
    strategyTitle: "The Harvesting Protocol",
    strategySteps: [
      "<strong>Monitor for Losses:</strong> If the market drops 10%, look at your specific lots. Do you have a position down $2,000?",
      "<strong>Execute the Swap:</strong> Sell the loser (e.g., VTI). Immediately buy a 'Substantially Identical' replacement (e.g., SCHB).",
      "<strong>The Result:</strong> You are still invested in the US market (so you don't miss the rebound), but you booked a $2,000 loss on your tax return.",
      "<strong>The Limit:</strong> You can use losses to offset unlimited gains. If you have net losses, you can deduct <strong>$3,000</strong> against your salary. Carry forward the rest forever."
    ],
    faq: [
      {
        q: "What is the Wash Sale Rule?",
        a: "If you sell a stock for a loss and buy the <em>exact same</em> stock back within 30 days, the IRS disallows the loss. You must buy something different (e.g., switching from S&P 500 to Total Market)."
      },
      {
        q: "Should I reinvest dividends?",
        a: "In a taxable account, consider turning DRIP <strong>OFF</strong>. Take the cash. Use it to rebalance. This prevents creating hundreds of tiny 'tax lots' that are annoying to track."
      },
      {
        q: "Is it worth the effort?",
        a: "Yes. Tax Loss Harvesting can add ~0.50% to your annual after-tax returns. Over 30 years, that is huge."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications.",
    publishedDate: "December 18, 2025"
  },
  {
    title: "How to create a savings buffer for home repairs and unexpected housing costs",
    desc: "The '1% Rule' and sinking fund strategies for homeowners.",
    intro: "The sticker price of a mortgage is just the beginning. New homeowners are often blindsided by the 'Silent Costs' of ownership: a $10,000 roof, a $5,000 HVAC, or a $500 plumbing leak. If you rely on your general Emergency Fund for these, you are living dangerously. Home maintenance is not an emergency; it is an inevitability. To be a responsible homeowner, you must run your house like a business, accruing reserves for capital expenditures (CapEx) every single month.",
    takeaways: [
      "<strong>The 1% Rule:</strong> A safe baseline is to save 1% of your home's value annually for maintenance. On a $400k home, save $4,000/year ($333/mo).",
      "<strong>The 'Square Footage' Rule:</strong> Another metric is saving $1 per square foot per year. A 2,000 sq ft house needs $2,000/year minimum.",
      "<strong>CapEx vs. Repairs:</strong> Repairs are small (broken faucet). CapEx is huge (New Roof). You must save for the 20-year roof replacement starting in Year 1.",
      "<strong>The 'House Account':</strong> Keep this money separate from your vacation fund. It is not your money; it belongs to the house."
    ],
    contextUS: "US homes are aging. The median home age is nearly 40 years. This means major systems (plumbing, electrical) are reaching end-of-life for millions of buyers. Inflation has also driven up the cost of contractors and materials by 40% since 2020.",
    deepDiveTitle: "Calculating Your CapEx Number",
    deepDiveContent: `
      <p>Estimate the lifespan of your big ticket items.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Big 4</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Roof:</strong> Cost $12,000. Lasts 20 years. Cost/Year: $600.</li>
        <li><strong>HVAC:</strong> Cost $7,000. Lasts 15 years. Cost/Year: $466.</li>
        <li><strong>Water Heater:</strong> Cost $1,500. Lasts 10 years. Cost/Year: $150.</li>
        <li><strong>Appliances:</strong> Cost $3,000. Last 10 years. Cost/Year: $300.</li>
      </ul>
      <p><strong>Total Annual Sinking Fund:</strong> ~$1,500 just for these 4 items. Add in painting, flooring, and landscaping, and the 1% rule ($4,000) looks accurate.</p>
    `,
    strategyTitle: "How to Build the Fund",
    strategySteps: [
      "<strong>Day 1 Buffer:</strong> When buying a house, do not spend all your cash on the down payment. Keep $5,000-$10,000 in reserve. Something <em>will</em> break in the first month.",
      "<strong>Automate the 'Rent':</strong> Even though you own, pay yourself 'rent' for maintenance. Set up an auto-transfer of $300/mo to a HYSA named 'House Maintenance'.",
      "<strong>Home Warranty Warning:</strong> Home warranties ($600/yr) are often scams. They deny claims or use terrible contractors. Self-insuring via a savings account is usually better.",
      "<strong>Upgrade vs. Repair:</strong> Use this fund for repairs. If you want to <em>upgrade</em> (granite counters), that requires a separate 'Renovation' savings goal. Don't raid the roof fund for pretty counters."
    ],
    faq: [
      {
        q: "What if I buy a new construction?",
        a: "You still need a fund, but it can be smaller (maybe 0.5%). You won't need a roof for 20 years, but you will need landscaping, blinds, and eventually paint. Start saving now while it's cheap."
      },
      {
        q: "Should I use a HELOC for repairs?",
        a: "For emergencies (tree fell on roof), yes. For maintenance (new carpet), no. Do not finance depreciating assets (carpet) with 8% debt."
      },
      {
        q: "Where should I keep the money?",
        a: "High-Yield Savings or Money Market. It must be liquid. When the furnace dies in January, you need cash today."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "December 19, 2025"
  }
];

export const savingInvestingArticles44: Article[] = details.map(detail => {
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
