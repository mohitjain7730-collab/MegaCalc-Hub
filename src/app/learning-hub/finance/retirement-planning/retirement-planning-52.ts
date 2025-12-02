
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Avoid Running Out of Money in Retirement (Longevity Planning)",
    desc: "Strategies to ensure your assets outlast your lifespan, even if you live to 100.",
    intro: "The greatest fear for most retirees is not death, but running out of money before death. This is called 'Longevity Risk.' With modern medicine extending lifespans, a 65-year-old couple has a 50% chance that at least one spouse will live to age 92. A plan designed to last until 85 might leave you destitute for the final decade of your life. To avoid this, you must shift from 'Probability-Based' planning (hoping the market returns 8%) to 'Safety-First' planning (guaranteeing income for life). This guide explains how to build a portfolio that can survive a century.",
    takeaways: [
      "<strong>Guaranteed Income Floor:</strong> Cover your essential expenses (Food, Housing, Utilities) with guaranteed income sources like Social Security, Pensions, and Annuities. If the market crashes to zero, you still eat.",
      "<strong>The 3.5% Rule:</strong> The standard 4% withdrawal rule has a 5-10% failure rate over 30 years. For a 40-year horizon (retiring early or living long), lowering your withdrawal rate to 3.5% drastically increases safety.",
      "<strong>Deferred Income Annuities (QLAC):</strong> You can buy a 'longevity insurance' policy inside your IRA. You pay a lump sum at 65, and it starts paying a monthly check at age 85. It is cheap insurance against living too long.",
      "<strong>Variable Spending:</strong> The ability to cut spending by 10-20% during a market crash is the single most effective way to preserve your portfolio. Flexibility prevents ruin."
    ],
    contextUS: "Social Security is an inflation-adjusted annuity that you cannot outlive. Delaying your claim until age 70 maximizes this 'Longevity Insurance.' It provides a larger guaranteed base for your 90s than any private investment product.",
    deepDiveTitle: "The Longevity Portfolio",
    deepDiveContent: `
      <p>How to structure assets for a 100-year life.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. The Inflation Hedge (Stocks)</h3>
      <p><strong>Problem:</strong> Inflation. $50,000 today buys $25,000 worth of goods in 25 years. <br/>
      <strong>Solution:</strong> You must hold 50-60% equities even in retirement. You need the growth to maintain purchasing power in your 80s.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The Tail Risk Hedge (QLAC)</h3>
      <p><strong>Problem:</strong> Living to 105 and depleting assets. <br/>
      <strong>Solution:</strong> Use $100k of IRA money to buy a QLAC. It pays $0 for 20 years, then kicks in at age 85 with a guaranteed check. It removes the stress of 'pacing' your withdrawals perfectly.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. The Buffer Asset (Home Equity)</h3>
      <p><strong>Problem:</strong> Running out of liquid cash at 90. <br/>
      <strong>Solution:</strong> Maintain a paid-off home. If you deplete your portfolio, you can access a Reverse Mortgage (HECM) line of credit to fund your final years without moving.</p>
    `,
    strategyTitle: "Tactical Steps",
    strategySteps: [
      "<strong>Delay Social Security to 70:</strong> This is non-negotiable for longevity planning. The 8% annual increase is actuarially fair if you die average age, but it is a massive 'win' if you live to 95.",
      "<strong>Invest in Health:</strong> The most expensive part of aging is frailty. Gym memberships and healthy food are financial investments. Compressing your 'morbidity' window saves millions.",
      "<strong>Automate the Floor:</strong> Ensure your fixed income covers your fixed costs. Do not rely on selling stocks to pay the electric bill.",
      "<strong>Annual Review:</strong> At age 75, check your withdrawal rate. If your portfolio has grown, you can spend more. If it has shrunk, cut back. Don't fly blind."
    ],
    faq: [
      {
        q: "What if I die early?",
        a: "Then you left money on the table. That is the 'cost' of insurance. Most people prefer 'dying with too much' over 'living with too little'."
      },
      {
        q: "Is 4% safe?",
        a: "Historically yes, but with high valuations and low bond yields, many experts suggest 3.3% to 3.8% is the new 'Safe' rate for a 30+ year horizon."
      },
      {
        q: "Do I need Long Term Care insurance?",
        a: "It helps. Living to 100 increases the probability of needing cognitive care. A policy ensures you don't drain the portfolio intended for your spouse."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Use a Multi-Bucket Investment Strategy for Predictable Income",
    desc: "Structuring your portfolio into Time-Based segments to reduce anxiety.",
    intro: "One of the hardest parts of retirement is the psychological shift from 'saving' to 'spending.' Selling shares of stock to pay for groceries feels risky, especially when the market is down. The 'Bucket Strategy' solves this by mentally and physically separating your money based on when you need to spend it. Instead of one big scary pot of money, you have a 'Safe Bucket' for now, a 'Medium Bucket' for later, and a 'Growth Bucket' for the distant future. This structure prevents panic selling and ensures cash flow is always available.",
    takeaways: [
      "<strong>Bucket 1 (Cash/Liquid):</strong> Holds 1-3 years of living expenses. Invested in Cash, Money Markets, or T-Bills. This is your paycheck. It never loses value.",
      "<strong>Bucket 2 (Income/Stability):</strong> Holds 3-7 years of expenses. Invested in Bonds, CDs, and Dividend Stocks. It generates yield to refill Bucket 1.",
      "<strong>Bucket 3 (Growth):</strong> Holds the rest (7+ years). Invested in Total Stock Market funds. This fights inflation. You ignore the volatility here because you won't touch it for a decade.",
      "<strong>The Refill Mechanism:</strong> The key to the strategy is having a system to move money from Bucket 3 -> 2 -> 1 during bull markets, and pausing transfers during bear markets."
    ],
    contextUS: "Brokerages like Fidelity and Schwab allow you to create multiple sub-accounts (or just organize your portfolio view) to visualize these buckets. Keeping Bucket 1 in a separate bank entirely often helps with the mental separation.",
    deepDiveTitle: "The 3-Bucket Blueprint",
    deepDiveContent: `
      <p>Example: $1 Million Portfolio. $40,000/year withdrawal.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 1: The Moat ($80k)</h3>
      <p><strong>Timeline:</strong> Years 1-2. <br/>
      <strong>Assets:</strong> High-Yield Savings (5%). <br/>
      <strong>Function:</strong> You draw $3,333/month from here to pay bills. If the market crashes 50%, you sleep fine because your next 24 checks are already in cash.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 2: The Bridge ($300k)</h3>
      <p><strong>Timeline:</strong> Years 3-9. <br/>
      <strong>Assets:</strong> Bond Ladder, Corporate Bond Funds, Equity Income. <br/>
      <strong>Function:</strong> Produces dividends and interest. When bonds mature, the cash moves to Bucket 1.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Bucket 3: The Engine ($620k)</h3>
      <p><strong>Timeline:</strong> Years 10+. <br/>
      <strong>Assets:</strong> VTI (US Stocks), VXUS (Intl Stocks). <br/>
      <strong>Function:</strong> Growth. This bucket will double in 10 years (hopefully). You harvest gains here to refill Bucket 2.</p>
    `,
    strategyTitle: "Operating the Machine",
    strategySteps: [
      "<strong>The 'Bull Market' Rule:</strong> If stocks are up, sell stocks from Bucket 3 to refill Bucket 1 directly. Leave bonds alone.",
      "<strong>The 'Bear Market' Rule:</strong> If stocks are down, do NOT sell Bucket 3. Spend down Bucket 1. If that runs out, spend down Bucket 2. This buys Bucket 3 time to recover (historically 2-4 years).",
      "<strong>Dividend Sweep:</strong> Set all dividends from Buckets 2 and 3 to pay into Bucket 1 automatically. This provides 'Organic Income' without selling shares.",
      "<strong>Rebalance Annually:</strong> Pick a date (Jan 15). Check bucket levels. Execute the transfers. Then ignore it for 12 months."
    ],
    faq: [
      {
        q: "Does this lower returns?",
        a: "Yes. Holding $80k in cash creates 'Cash Drag' compared to 100% stocks. But it prevents 'Behavioral Drag' (selling at the bottom). The safety is worth the cost."
      },
      {
        q: "Can I use just 2 buckets?",
        a: "Yes. A 'Cash' bucket and an 'Investment' bucket is simpler and works for many. The 3-bucket model is just more granular for bond ladders."
      },
      {
        q: "What about taxes?",
        a: "Try to keep Bucket 1 and 3 in Taxable/Roth accounts for easy access. Keep Bucket 2 (Bonds) in Traditional IRAs to shield the interest income."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Plan for Retirement When Your Spouse Has No Savings",
    desc: "Strategies for single-earner or financially unequal couples.",
    intro: "It is common for one spouse to handle the earning and investing while the other manages the home or works a job without benefits. This creates a lopsided balance sheet where one partner holds all the assets. In a healthy marriage, this is 'Our Money,' but legally and logistically, it requires specific planning. You need to ensure the non-saving spouse is protected against the death of the earner, and that the household savings rate is high enough to support two people on one portfolio.",
    takeaways: [
      "<strong>The 'Double Burden':</strong> The earning spouse must save enough for *two* retirements. The standard '15% savings rate' is for one person. A sole earner needs to save 20-25% of their gross income to fund a couple's retirement.",
      "<strong>Spousal IRA:</strong> The IRS allows a working spouse to contribute to an IRA (Traditional or Roth) in the name of a non-working spouse. This effectively doubles your annual tax-advantaged space ($14,000 total).",
      "<strong>Survivor Benefits:</strong> Social Security and Pensions have survivor options. You must choose the 'Joint and Survivor' payout on pensions, even if it lowers the monthly check, to ensure the non-earner isn't destitute if the earner dies first.",
      "<strong>Life Insurance Bridge:</strong> If the earner dies before retirement, the savings stop. You need a large Term Life policy on the earner to replace the future savings they would have accumulated."
    ],
    contextUS: "Social Security Spousal Benefits guarantee the lower-earning spouse 50% of the higher earner's benefit (while both are alive) and 100% of the higher earner's benefit (after the earner dies). Maximizing the earner's record is the priority.",
    deepDiveTitle: "The Protection Checklist",
    deepDiveContent: `
      <p>Ensure the non-saver is safe.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. The 'Our Money' Meeting</h3>
      <p>Stop saying 'My 401(k)'. It is 'Our Retirement'. <br/>
      <strong>Action:</strong> Review beneficiaries. The spouse must be the primary beneficiary on all 401(k)s and IRAs. (Federal law mandates this for 401ks unless waived).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The Spousal IRA</h3>
      <p><strong>Limit:</strong> $7,000/year ($8,000 if 50+). <br/>
      <strong>Strategy:</strong> Open a Roth IRA in the non-working spouse's name. Max it out every January. <br/>
      <strong>Why:</strong> This builds assets in <em>their</em> name, providing autonomy and tax diversification.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Social Security Timing</h3>
      <p>The earner <strong>must</strong> delay until 70. <br/>
      <em>Reason:</em> The survivor benefit is based on when the earner claimed. If earner claims at 62, the widow gets a small check for life. If earner claims at 70, the widow gets a max check for life.</p>
    `,
    strategyTitle: "Household Budgeting",
    strategySteps: [
      "<strong>Calculate Joint Needs:</strong> A couple needs ~$75,000/year for a comfortable retirement. Social Security might cover $45,000. The Portfolio must cover $30,000.",
      "<strong>The Savings Target:</strong> To generate $30,000/yr, you need $750,000 invested. Can the single earner hit this? If not, you need to cut expenses or work longer.",
      "<strong>Catch-Up Contributions:</strong> If the earner is 50+, they can put $30,500 into a 401(k). This large bucket is essential for single-income households catching up.",
      "<strong>Long-Term Care:</strong> The non-earning spouse (often female) statistically lives longer and is more likely to need nursing care. Ensure the plan has a 'LTC Fund' so she isn't left broke at age 85."
    ],
    faq: [
      {
        q: "What if we divorce?",
        a: "Retirement assets accumulated during marriage are generally split 50/50 (QDRO). However, the non-earner stops accumulating new savings. Divorce is financially devastating for the non-saver."
      },
      {
        q: "Does the non-earner get Medicare?",
        a: "Yes. If the working spouse has 40 quarters of coverage, the non-working spouse qualifies for Medicare Part A (Free) at age 65 on their record."
      },
      {
        q: "Should the non-earner work part-time?",
        a: "Yes. Even earning $15,000/year allows them to max their own IRA and adds to the household safety net. It also builds their own Social Security credits."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Reduce Taxes on Investment Income in Retirement",
    desc: "Managing Capital Gains, Dividends, and Ordinary Income brackets.",
    intro: "Retirees often face a 'Tax Surprise.' They assume their tax rate will be lower in retirement, but between RMDs, taxable Social Security, and capital gains, their effective rate can actually rise. However, unlike W-2 employees, retirees have control over *type* of income they generate. By strategically choosing which accounts to pull from and which assets to hold, you can shift income from the 'Ordinary' bucket (high tax) to the 'Capital Gains' bucket (low tax) or the 'Roth' bucket (zero tax).",
    takeaways: [
      "<strong>Asset Location:</strong> Keep bonds (Ordinary Income) in IRAs. Keep stocks (Capital Gains) in Brokerage. This simple sort minimizes your annual tax bill.",
      "<strong>The 0% Capital Gains Bracket:</strong> If your taxable income is under ~$94,000 (Married), your Long-Term Capital Gains rate is 0%. You can sell stock for a huge profit and pay the IRS nothing.",
      "<strong>Tax-Loss Harvesting:</strong> In retirement, use losses to offset gains. If you sell a winner to live on, sell a loser to cancel out the tax. Up to $3,000 of excess loss can deduct against your pension income.",
      "<strong>Municipal Bonds:</strong> For high-income retirees (pushing into 32% brackets), switching taxable bonds to Muni bonds (Tax-Free) increases after-tax yield."
    ],
    contextUS: "The 'Net Investment Income Tax' (NIIT) is a 3.8% surtax on investment income for high earners (AGI > $250k couple). Managing your AGI to stay below this line saves you 3.8% on every dollar of investment profit.",
    deepDiveTitle: "The Tax Efficiency Ladder",
    deepDiveContent: `
      <p>Prioritize income sources by tax rate.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Tier 1: Tax-Free (The Best)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Roth IRA Withdrawals:</strong> $0 Tax.</li>
        <li><strong>HSA Withdrawals (Medical):</strong> $0 Tax.</li>
        <li><strong>Municipal Bond Interest:</strong> $0 Federal Tax.</li>
        <li><strong>Return of Principal:</strong> Selling stock basis. $0 Tax.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Tier 2: Preferred Rates (0% / 15% / 20%)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Long-Term Capital Gains:</strong> Profits on stocks held >1 year.</li>
        <li><strong>Qualified Dividends:</strong> Most US stock dividends.</li>
        <li><em>Strategy:</em> Fill your brackets with this income <em>after</em> Ordinary Income.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Tier 3: Ordinary Income (10% - 37%)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Traditional IRA/401k Withdrawals.</strong></li>
        <li><strong>Pension Income.</strong></li>
        <li><strong>Bond Interest.</strong></li>
        <li><strong>REIT Dividends.</strong></li>
        <li><em>Strategy:</em> Minimize this. It triggers higher taxes on Social Security.</li>
      </ul>
    `,
    strategyTitle: "Harvesting Gains at 0%",
    strategySteps: [
      "<strong>Calculate 'Room':</strong> If your Pension + SS = $50,000, and the 0% Capital Gains limit is $94,000, you have $44,000 of 'room'.",
      "<strong>Execute Sale:</strong> Sell $44,000 of winners in your brokerage account. <br/> <strong>Tax Bill:</strong> $0.",
      "<strong>Reset Basis:</strong> Immediately buy back the same stock (or similar). You have now 'stepped up' your cost basis for free, reducing future taxes.",
      "<strong>Watch State Tax:</strong> Federal capital gains might be 0%, but your state might still tax it as income (e.g., CA/NY). Check local laws."
    ],
    faq: [
      {
        q: "Does this affect Medicare?",
        a: "Yes. Capital Gains increase your AGI, which determines IRMAA (Medicare Surcharges). Even if the tax rate is 0%, the <em>income</em> counts for Medicare formulas."
      },
      {
        q: "What is specific ID?",
        a: "When selling, tell your broker to sell 'Specific Shares' (the ones with the highest cost basis). This lowers the realized gain, lowering the tax."
      },
      {
        q: "Should I avoid dividends?",
        a: "In a taxable account, yes, high dividends force you to pay tax annually. Growth stocks (buybacks) let you defer tax until you sell. It is more efficient."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles52: Article[] = details.map(detail => {
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
