
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Build a Two-Phase Retirement Plan (Pre-65 and Post-65)",
    desc: "Structuring your finances around the 'Medicare Bridge'.",
    intro: "Retirement is not a single, static phase. It has two distinct financial chapters: 'Pre-65' and 'Post-65'. The dividing line is Medicare eligibility. Before 65, you must self-fund healthcare (often $15,000-$25,000/year) and bridge the gap to Social Security. After 65, your fixed costs drop significantly as Medicare kicks in and Social Security checks arrive. Failing to plan for the expensive 'Phase 1' is the primary reason early retirees run out of cash. This guide helps you structure a 'Bridge Fund' to survive the gap.",
    takeaways: [
      "<strong>The Expense Cliff:</strong> Your spending will likely drop by 20-30% at age 65. You don't need a portfolio that supports peak spending forever; you just need enough cash to cover the expensive years (55-65).",
      "<strong>The Bridge Fund:</strong> Create a specific bucket of liquid assets (Cash/Brokerage) dedicated solely to paying health insurance premiums until Medicare starts. Do not count this money toward your long-term withdrawal rate.",
      "<strong>Roth Conversions in Phase 1:</strong> Phase 1 often comes with lower taxable income (no wages, no RMDs, no Social Security). Use this window to convert Traditional IRA money to Roth at a low tax rate.",
      "<strong>Social Security Timing:</strong> Use your portfolio to fund Phase 1 so you can delay Social Security until Phase 2 (age 70). This buys you a higher guaranteed income floor for late life."
    ],
    contextUS: "The Affordable Care Act (ACA) provides subsidies based on income. In Phase 1, managing your 'Modified Adjusted Gross Income' (MAGI) is critical. By living on cash or Roth withdrawals, you can keep MAGI low and get insurance for cheap, effectively lowering the cost of Phase 1.",
    deepDiveTitle: "The Tale of Two Budgets",
    deepDiveContent: `
      <p>Scenario: Couple retiring at 58.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 1: The Bridge (Age 58-65)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Healthcare:</strong> $24,000/year (Private Insurance/ACA).</li>
        <li><strong>Travel/Fun:</strong> $20,000/year ('Go-Go' years).</li>
        <li><strong>Living:</strong> $40,000/year.</li>
        <li><strong>Total Burn:</strong> $84,000/year.</li>
        <li><strong>Income Sources:</strong> 100% Portfolio Withdrawals.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 2: The Senior Years (Age 65+)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Healthcare:</strong> $8,000/year (Medicare Premiums + Medigap). <em>Cost drops $16k.</em></li>
        <li><strong>Travel:</strong> $10,000/year (Slowing down).</li>
        <li><strong>Living:</strong> $40,000/year.</li>
        <li><strong>Total Burn:</strong> $58,000/year.</li>
        <li><strong>Income Sources:</strong> Social Security ($35k) + Portfolio ($23k).</li>
      </ul>
      
      <p><strong>The Verdict:</strong> You need a portfolio that can support $84k for 7 years, but only $23k for the rest of your life. Don't panic if your withdrawal rate is high in Phase 1; it's temporary.</p>
    `,
    strategyTitle: "Asset Allocation by Phase",
    strategySteps: [
      "<strong>Cash Heavy Early:</strong> Keep 3-5 years of expenses in Cash/Bonds for Phase 1. You cannot afford Sequence of Returns risk while your burn rate is high.",
      "<strong>Equity Heavy Late:</strong> Since Phase 2 has a guaranteed floor (Social Security), your remaining portfolio can be more aggressive (Stocks) to fight inflation and leave a legacy.",
      "<strong>HSA Utilization:</strong> Save your HSA for Phase 2 (Medicare premiums). Use cash for Phase 1 to keep taxable income low for subsidies.",
      "<strong>Debt Payoff:</strong> Try to enter Phase 2 mortgage-free. Eliminating the mortgage at 65 aligns perfectly with the drop in healthcare costs."
    ],
    faq: [
      {
        q: "Should I claim Social Security at 62 to help with Phase 1?",
        a: "Mathematically, no. Spending down your assets to delay Social Security buys you a higher, safer income floor for Phase 2. It reduces longevity risk."
      },
      {
        q: "What if I get sick in Phase 1?",
        a: "Max out your Out-of-Pocket limit. Ensure you have a 'Medical Emergency Fund' of ~$15,000 on top of your living expenses."
      },
      {
        q: "Can I work part-time in Phase 1?",
        a: "Yes. Earning $20,000/year covers the healthcare cost, making Phase 1 much cheaper. This is 'Barista FIRE'."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Prepare for Early Retirement When You Have Medical Debt",
    desc: "Clearing the ledger before you lose your salary.",
    intro: "Retiring with a mortgage is common; retiring with medical debt is dangerous. Medical debt is 'bad debt'—it has no asset behind it and often carries high interest or collection risk. If you are planning to retire early but still owe hospitals or doctors, you must prioritize clearing this liability. The shift to a fixed income makes you vulnerable to aggressive collections or credit score damage that could affect your ability to rent or buy insurance. This guide creates a triage plan for medical debt pre-retirement.",
    takeaways: [
      "<strong>The 'Solvency' Rule:</strong> You cannot retire insolvent. If your medical debt > 10% of your liquid savings, you are not ready. You must work longer to clear it.",
      "<strong>Negotiate the Payoff:</strong> Never pay full price. Call the billing department. Offer a lump sum of 50% to settle the debt today. Hospitals often accept this to avoid selling the debt to collectors for pennies.",
      "<strong>0% Payment Plans:</strong> If the debt is on a 0% interest plan, keep it. Automate the payment. But ensure you have the cash reserve to pay it off in full if the terms change.",
      "<strong>Bankruptcy Check:</strong> If medical debt is massive ($50k+) and savings are low, consult a bankruptcy attorney <em>before</em> you retire. Protecting your 401(k) (which is often exempt in bankruptcy) might require legal action."
    ],
    contextUS: "Recent credit reporting changes mean paid medical debt disappears from credit reports, and debts under $500 don't appear. However, large unpaid debts can still lead to lawsuits and wage garnishment (or bank levies) in retirement.",
    deepDiveTitle: "The Debt Triage",
    deepDiveContent: `
      <p>Rank your debts by danger level.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Level 1: Medical Credit Cards (CareCredit)</h3>
      <p><strong>Risk:</strong> Extreme. <br/>
      <strong>Interest:</strong> 26%+. Retroactive interest if you miss a promo deadline. <br/>
      <strong>Action:</strong> Pay this off immediately. Raid the emergency fund if needed.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Level 2: Hospital Payment Plans</h3>
      <p><strong>Risk:</strong> Low. <br/>
      <strong>Interest:</strong> Often 0%. <br/>
      <strong>Action:</strong> Keep the plan. Automate it. Invest your cash meanwhile.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Level 3: Collections</h3>
      <p><strong>Risk:</strong> Credit score damage / Lawsuit. <br/>
      <strong>Action:</strong> Negotiate 'Pay for Delete'. Offer 30-50 cents on the dollar to settle the debt and remove it from your report. Get it in writing.</p>
    `,
    strategyTitle: "Pre-Retirement Moves",
    strategySteps: [
      "<strong>The 'HSA' Rescue:</strong> If you have an HSA, use it to pay off old medical bills tax-free. This clears the liability.",
      "<strong>401(k) Protection:</strong> Remember that ERISA protects 401(k)s from most creditors. Do not withdraw from a protected 401(k) to pay an unsecured medical debt unless you have settled for a lower amount.",
      "<strong>Charity Care:</strong> Even if you have savings, if your <em>income</em> drops in retirement, you might qualify for retroactive charity care forgiveness at non-profit hospitals. Re-apply after you retire."
    ],
    faq: [
      {
        q: "Can they take my Social Security?",
        a: "Generally no. Commercial creditors (hospitals) cannot garnish Social Security. Only the government (taxes/student loans) can."
      },
      {
        q: "Should I delay retirement?",
        a: "Yes. Use your salary to kill the debt. Retiring with a monthly debt payment reduces your cash flow flexibility."
      },
      {
        q: "Is it better to pay with a HELOC?",
        a: "Risk trade-off. You trade unsecured debt (medical) for secured debt (house). Generally bad idea. Don't risk your house for a hospital bill."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Build a Retirement Plan If You Anticipate High Longevity (100+)",
    desc: "Asset allocation for a 40-year distribution phase.",
    intro: "Living to 100 is a blessing, but it breaks most standard financial plans. A 'Safe Withdrawal Rate' of 4% is designed for 30 years. If you live 40 or 45 years in retirement, that rate has a high failure probability. You face the 'Triple Threat': Inflation eroding purchasing power, Sequence of Returns risk over a longer window, and the massive cost of late-life care. Centenarian planning requires a portfolio that acts like an endowment: designed to grow forever, not spend down to zero.",
    takeaways: [
      "<strong>Lower Withdrawal Rate:</strong> For a 40+ year horizon, safe withdrawal rates drop to <strong>3.0% - 3.3%</strong>. You need a larger nest egg ($1.5M to generate $50k, not $1.25M).",
      "<strong>High Equity Exposure:</strong> You cannot hold 60% bonds. Inflation over 40 years will cut your dollar's value by 70%. You need 60-70% stocks even at age 80 to generate the growth required to stay ahead of prices.",
      "<strong>Longevity Insurance (QLAC):</strong> Buy a Qualified Longevity Annuity Contract. You pay at 65, it pays starting at 85. This guarantees you have income in the 'Danger Zone' years.",
      "<strong>Delay Social Security:</strong> Claiming at 70 is mandatory. It gives you the highest possible inflation-adjusted floor. If you live to 100, this decision is worth hundreds of thousands of dollars."
    ],
    contextUS: "The fastest-growing demographic in the US is Centenarians. Advances in medicine mean 'Old' is getting older. Planning for 95 is the new conservative standard.",
    deepDiveTitle: "The Endowment Model",
    deepDiveContent: `
      <p>Your money must outlive you.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Inflation Problem</h3>
      <p>At 3% inflation, a $50,000 lifestyle today costs <strong>$162,000</strong> in 40 years. <br/>
      Bonds earning 4% barely keep up. Stocks earning 8% are the only way to generate that future cash flow.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Rising Equity Glidepath</h3>
      <p>Standard advice: Sell stocks, buy bonds as you age. <br/>
      <strong>Longevity Advice:</strong> <em>Buy</em> stocks as you age. <br/>
      Start retirement at 60/40. As your time horizon extends, move to 70/30 or 80/20. You are investing for your 100-year-old self.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The 'Care' Fund</h3>
      <p>Living to 100 guarantees frailty. You need a dedicated bucket ($300k+) for home health aides. If you don't use it, your heirs get it.</p>
    `,
    strategyTitle: "Tactical Steps",
    strategySteps: [
      "<strong>Buy a QLAC:</strong> Take $200k of your IRA. Buy an annuity that starts at 85. This takes 'running out of money' off the table for the super-old years.",
      "<strong>Health Investment:</strong> Spend money on fitness/nutrition now. Compressing morbidity (being sick for 2 years instead of 10) saves massive amounts of money.",
      "<strong>Variable Spending:</strong> Be flexible. In a bad market decade, spend 2.5%. In a good decade, spend 4%. Rigidity kills longevity portfolios.",
      "<strong>Reverse Mortgage Standby:</strong> Keep your home equity as the ultimate backup. A HECM line of credit grows over time and can fund care at age 98."
    ],
    faq: [
      {
        q: "What if I die at 80?",
        a: "Then you leave a huge inheritance. That is a 'good' failure mode. Running out of money at 95 is a 'bad' failure mode. Plan for the worst (living long)."
      },
      {
        q: "Is 3% withdrawal too low?",
        a: "It feels low, but it ensures survival. To spend more, you might need a side hustle or rental income. Don't rely on principal drain."
      },
      {
        q: "Should I buy LTC insurance?",
        a: "Yes. Extreme longevity correlates with cognitive decline. Insurance protects your spouse from your care costs."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Use Fixed Income Products for Stable Retirement Cash Flow",
    desc: "Bonds, CDs, and Annuities: Building the 'Safe Floor'.",
    intro: "Retirement requires a shift from 'Total Return' (Growth) to 'Cash Flow' (Income). You can't pay bills with stock appreciation; you pay them with cash. Fixed Income products provide the certainty that stocks lack. By layering Bonds, Certificates of Deposit (CDs), and Annuities, you can build a 'Paycheck' that arrives every month regardless of what the S&P 500 does. This guide explains how to construct a fortress of guaranteed income.",
    takeaways: [
      "<strong>The 'Bond Ladder':</strong> Buying individual bonds that mature every year (e.g., 2026, 2027, 2028) guarantees cash availability. You eliminate interest rate risk by holding to maturity.",
      "<strong>Annuity Floor:</strong> A Single Premium Immediate Annuity (SPIA) acts as a private pension. Covering your essential expenses (Housing/Food) with an annuity allows you to invest the rest of your portfolio aggressively.",
      "<strong>CDs for Short-Term:</strong> Use CD ladders for money needed in 1-5 years. They are FDIC insured and currently offer competitive yields compared to bonds.",
      "<strong>Asset Location:</strong> Bond interest is taxed at ordinary income rates. Always hold these assets in a Traditional IRA or 401(k) to shield the income from annual taxes."
    ],
    contextUS: "The yield curve dictates strategy. In 2025, short-term rates might be higher than long-term rates. However, 'locking in' long-term rates (even if lower) protects you from future rate cuts. Balance yield with duration.",
    deepDiveTitle: "The Fixed Income Menu",
    deepDiveContent: `
      <p>Choose the right tool for the job.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. US Treasuries (The Gold Standard)</h3>
      <p><strong>Safety:</strong> Risk-Free. <br/>
      <strong>Tax:</strong> State Tax Free. <br/>
      <strong>Use:</strong> Core safety holding. Buy 'Notes' (2-10 years) for ladders.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Investment Grade Corporate Bonds</h3>
      <p><strong>Safety:</strong> High (Companies like Apple/Microsoft). <br/>
      <strong>Yield:</strong> Higher than Treasuries. <br/>
      <strong>Use:</strong> Yield boosting. Use an ETF like <strong>LQD</strong> or <strong>VCIT</strong> for diversification.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Fixed Annuities (MYGA)</h3>
      <p><strong>Safety:</strong> Backed by Insurer. <br/>
      <strong>Yield:</strong> Often beats CDs. Tax-deferred growth. <br/>
      <strong>Use:</strong> The 'CD Replacement'. Lock money for 3-5 years.</p>
    `,
    strategyTitle: "Building the Income Machine",
    strategySteps: [
      "<strong>Determine the Gap:</strong> Expenses - Social Security = $2,000/mo shortfall. <br/> <strong>Goal:</strong> Generate $24,000/yr from fixed income.",
      "<strong>Ladder Construction:</strong> Buy $24,000 of bonds maturing in Year 1, Year 2, Year 3, Year 4, and Year 5. Total Cost: $120,000. <br/> <strong>Result:</strong> 5 Years of safety.",
      "<strong>The 'Roll':</strong> When Year 1 matures, spend it. If stocks are up, sell stocks to buy a new Year 6 bond. If stocks are down, don't buy a bond; just wait. You have 4 years left.",
      "<strong>TIPS Allocation:</strong> Keep 20% of the bond portfolio in TIPS (Inflation Protected) to hedge against cost-of-living spikes."
    ],
    faq: [
      {
        q: "Why not just buy dividend stocks?",
        a: "Stocks are volatile. Dividends can be cut. Bonds (held to maturity) are a contract. You <em>know</em> you will get paid. They serve a different purpose (Safety vs Growth)."
      },
      {
        q: "Can I lose money in bonds?",
        a: "In a <em>fund</em> (ETF), yes, if rates rise. In an <em>individual bond</em> held to maturity, no. You get your principal back. Retirees often prefer individual bonds for this reason."
      },
      {
        q: "What is a MYGA?",
        a: "Multi-Year Guaranteed Annuity. It's like a CD from an insurance company. It pays a fixed rate for a fixed term. Good for tax deferral."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles60: Article[] = details.map(detail => {
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
