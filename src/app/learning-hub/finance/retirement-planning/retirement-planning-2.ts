
import { Article } from '../../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Calculate Your FIRE Number (Financial Independence Retire Early)",
    desc: "The math behind the movement: Using the '25x Rule' to determine when work becomes optional.",
    intro: "Financial Independence, Retire Early (FIRE) is not just a trend; it is a mathematical framework. The core question every aspiring early retiree asks is: 'What is my number?' How much money do you need invested so that you never have to work for a paycheck again? The answer lies in the relationship between your annual spending and your safe withdrawal rate. This guide breaks down the '4% Rule,' how to calculate your specific FIRE number, and the variables that might force you to adjust it.",
    takeaways: [
      "<strong>The Formula:</strong> Annual Expenses x 25 = Your FIRE Number. If you spend $40,000/year, you need $1,000,000. If you spend $100,000, you need $2.5 Million.",
      "<strong>The 4% Rule:</strong> This rule suggests you can withdraw 4% of your portfolio in Year 1, adjust for inflation every subsequent year, and have a 95% chance of not running out of money over 30 years.",
      "<strong>Lean vs. Fat:</strong> 'LeanFIRE' targets a minimalist budget (<$40k/yr) to retire fast. 'FatFIRE' targets a luxurious budget (>$100k/yr) requiring a larger portfolio.",
      "<strong>Flexibility is Key:</strong> The math assumes a rigid withdrawal. If you are willing to cut spending during market crashes or work part-time, your required number drops significantly."
    ],
    contextUS: "The 4% Rule comes from the 'Trinity Study' based on US stock/bond returns. However, early retirees (40-50 years duration) often aim for a safer 3.5% withdrawal rate (roughly 28-30x expenses) to account for the longer timeline and US healthcare costs.",
    deepDiveTitle: "Calculating Your Freedom",
    deepDiveContent: `
      <p>Stop guessing. Run your personal numbers.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 1: Determine Annual Burn</h3>
      <p>Track every dollar for 12 months. Do not guess. <br/>
      <em>Example:</em> You spend $60,000 per year (including taxes and insurance).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 2: The Multiple</h3>
      <p><strong>Standard FIRE (25x):</strong> $60,000 x 25 = <strong>$1.5 Million</strong>. <br/>
      <strong>Conservative FIRE (30x):</strong> $60,000 x 30 = <strong>$1.8 Million</strong>. <br/>
      <em>Why Conservative?</em> If you retire at 35, your money needs to last 50+ years, not 30. The 4% rule was designed for a 30-year retirement.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 3: Adjust for Future Spending</h3>
      <p>Will your spending drop (paid off mortgage)? Or rise (travel/healthcare)? <br/>
      If your mortgage ($20k/yr) will be paid off right before you retire, your post-FIRE spending is only $40,000. <br/>
      <em>New Target:</em> $40,000 x 25 = <strong>$1 Million</strong>.</p>
    `,
    strategyTitle: "The Path to the Number",
    strategySteps: [
      "<strong>Increase Savings Rate:</strong> Your savings rate (not income) determines your speed. Saving 10% takes 51 years. Saving 50% takes 17 years. Saving 70% takes 8.5 years.",
      "<strong>The 'Coast' Checkpoint:</strong> Once you hit ~50% of your FIRE number, you might be 'Coast FIRE'. This means your existing investments will grow to your full number by age 65 without further contributions. You can stop saving and just cover daily bills.",
      "<strong>Asset Location:</strong> You need money accessible before 59.5. Prioritize Taxable Brokerage accounts and Roth IRA contributions (which can be withdrawn penalty-free)."
    ],
    faq: [
      {
        q: "Does Social Security count?",
        a: "Yes, but it kicks in late. FIRE requires you to self-fund the gap between age 40 and 62. Social Security acts as 'Longevity Insurance' for your later years."
      },
      {
        q: "What about inflation?",
        a: "The 4% rule is designed to account for inflation. You increase your withdrawal dollar amount by the CPI each year to maintain purchasing power."
      },
      {
        q: "Should I include home equity?",
        a: "No. You cannot buy groceries with your kitchen. Your FIRE number is your <em>Liquid Invested Assets</em> (Stocks/Bonds). Home equity reduces your expenses (no rent), but isn't part of the 4% withdrawal pool."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How Much You Need to Retire at 55 in the U.S.",
    desc: "Bridging the gap to Social Security and Medicare.",
    intro: "Retiring at 55 is a specific challenge. You are too young for Social Security (62), too young for Medicare (65), and too young for penalty-free IRA withdrawals (59.5). Yet, it is one of the most popular target ages for exiting the corporate grind. To succeed, you need a three-stage plan: a 'Liquidity Bridge' to access cash, a 'Healthcare Budget' to cover insurance premiums, and a 'Longevity Portfolio' to ensure you don't run out of money by age 90.",
    takeaways: [
      "<strong>The Rule of 55:</strong> The IRS allows penalty-free withdrawals from your <em>current job's</em> 401(k) if you leave that job in the year you turn 55 or later. This is the golden key to funding the first 5 years.",
      "<strong>The Healthcare Gap:</strong> From 55 to 65, you are on your own. ACA (Obamacare) plans can cost $1,000-$2,000/mo for a couple. This is often the largest line item in the budget.",
      "<strong>Portfolio Size:</strong> Because your retirement is 35-40 years long, a 4% withdrawal rate is slightly risky. Aim for 3.5% - 3.75% (approx 28x expenses).",
      "<strong>Roth Conversions:</strong> The years 55-70 are the 'Golden Window' for converting Traditional IRA money to Roth, as your income is likely lower than during your career."
    ],
    contextUS: "Many public safety workers (Police/Fire) can retire at 50 or 55 with a pension. For private sector workers, you must build your own pension. The 'Rule of 55' applies to 401(k) and 403(b) plans, but NOT to IRAs.",
    deepDiveTitle: "The Age 55 Checklist",
    deepDiveContent: `
      <p>You need $60,000/year to live. Can you quit?</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 1: The Bridge (Age 55-59.5)</h3>
      <p><strong>Source:</strong> Rule of 55 401(k) withdrawals OR Taxable Brokerage. <br/>
      <strong>Cost:</strong> $60k living + $15k Healthcare = $75,000/year. <br/>
      <strong>Total Needed:</strong> $375,000 accessible cash/assets.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 2: The Pre-Medicare (Age 59.5-65)</h3>
      <p><strong>Source:</strong> IRAs unlock. <br/>
      <strong>Cost:</strong> Still high due to healthcare. <br/>
      <strong>Strategy:</strong> Manage taxable income to qualify for ACA subsidies. Living off cash/Roth helps keep realized income low.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 3: Standard Retirement (Age 65+)</h3>
      <p><strong>Source:</strong> Medicare kicks in. Costs drop. Social Security can start (or wait to 70). <br/>
      <strong>Total Nest Egg:</strong> To support $75k/year for 40 years, you need ~$2 Million.</p>
    `,
    strategyTitle: "Tactical Moves",
    strategySteps: [
      "<strong>Consolidate to Current 401(k):</strong> Before you quit at 55, roll all your old 401(k)s and IRAs <em>into</em> your current employer's 401(k) if allowed. This maximizes the balance available for the Rule of 55.",
      "<strong>Fund the HSA:</strong> Max out your HSA every year before 55. By retirement, you could have $100k tax-free for medical premiums.",
      "<strong>Bond Tent:</strong> At age 53-54, shift asset allocation to be more conservative (e.g., 60/40). You cannot afford a 2008-style crash the year you hand in your badge.",
      "<strong>Test Drive:</strong> Practice living on your projected retirement budget for 6 months while still working. Can you actually live on $5,000/mo?"
    ],
    faq: [
      {
        q: "Can I use Rule of 55 if I quit at 54?",
        a: "No. You must separate from service in the calendar year you turn 55 or later. If you quit at 54, you have to wait until 59.5 or use Rule 72(t)."
      },
      {
        q: "What if I get a new job?",
        a: "If you retire at 55, take a distribution, and then get a part-time job later, that is allowed. The Rule of 55 is triggered by the separation event."
      },
      {
        q: "Is 55 too early for Social Security?",
        a: "Yes. The earliest you can claim is 62. You have a 7-year gap where 100% of income must come from your savings."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How Much You Need to Retire at 67 (Full Social Security Age)",
    desc: "The standard retirement path: Benchmarks, Social Security, and Medicare.",
    intro: "Age 67 is the 'Full Retirement Age' (FRA) for most Americans born after 1960. Retiring at this age aligns perfectly with maximum Social Security benefits (100% payout) and Medicare eligibility (which starts at 65). Because your timeline is longer and your government benefits are fully activated, the savings requirement for retiring at 67 is significantly lower than retiring at 50 or 55. This guide explains the 'Standard Path' to a secure retirement.",
    takeaways: [
      "<strong>The 10x Salary Rule:</strong> Fidelity recommends having 10 times your final annual salary saved by age 67. If you earn $80,000, aim for $800,000.",
      "<strong>Social Security as the Floor:</strong> At 67, Social Security replaces ~40% of the average earner's income. Your portfolio only needs to generate the remaining 40-60% to maintain your lifestyle.",
      "<strong>Medicare Safety:</strong> Since you are over 65, you don't need to budget for expensive private health insurance. You just need to cover Medicare Part B/D premiums and supplements.",
      "<strong>Shorter Duration:</strong> A portfolio at 67 only needs to last ~20-25 years (to age 90). This allows for a slightly higher Safe Withdrawal Rate (4.5% or 5%) compared to early retirees."
    ],
    contextUS: "Most Americans retire before 67, often involuntarily due to health or layoffs. Aiming for 67 is a solid plan, but having enough savings to flex to 65 if needed is a smart hedge.",
    deepDiveTitle: "The Math of Age 67",
    deepDiveContent: `
      <p>Scenario: Household spending $60,000/year.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Income Sources</h3>
      <p><strong>Social Security (at FRA):</strong> $2,500/month ($30,000/year). <br/>
      <strong>The Gap:</strong> $60,000 - $30,000 = <strong>$30,000/year needed</strong>.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Portfolio Requirement</h3>
      <p>Using the 4% Rule: $30,000 / 0.04 = <strong>$750,000</strong>. <br/>
      <em>Note:</em> This is much lower than the $1.5M needed for early retirees because Social Security does the heavy lifting.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Savings Rate Needed</h3>
      <p>To hit $750,000 by age 67: <br/>
      - Start at 25: Save $250/mo. <br/>
      - Start at 35: Save $550/mo. <br/>
      - Start at 45: Save $1,300/mo. <br/>
      <em>Verdict:</em> Retiring at 67 is highly achievable for almost anyone who saves consistently.</p>
    `,
    strategyTitle: "The 'Catch Up' Phase (Age 50-67)",
    strategySteps: [
      "<strong>Catch-Up Contributions:</strong> From age 50 to 67, you can put extra money in 401(k)s ($30,500 limit) and IRAs. This 'Sprint' phase can make up for a slow start in your 20s.",
      "<strong>Debt Freedom:</strong> The goal is to enter age 67 with a paid-off mortgage. Eliminating your largest bill reduces your 'Required Income', making your portfolio go further.",
      "<strong>Asset Allocation Shift:</strong> By 67, you should likely be 50% Stocks / 50% Bonds. You switch from 'Wealth Accumulation' to 'Wealth Preservation'.",
      "<strong>Delay to 70?</strong> If you are healthy and enjoy work, waiting until 70 to claim Social Security increases your check by another 24%. It is the best 'guaranteed return' available."
    ],
    faq: [
      {
        q: "Do I still need stocks?",
        a: "Yes. At 67, you might live to 97. You need stocks to protect against 30 years of inflation. Going 100% cash/bonds ensures your purchasing power will die before you do."
      },
      {
        q: "What about Long Term Care?",
        a: "This is the biggest risk. Medicare doesn't cover nursing homes. Ideally, reserve a portion of your home equity or portfolio specifically for end-of-life care."
      },
      {
        q: "Is my 401(k) taxed?",
        a: "Yes. Withdrawals are taxed as Ordinary Income. Plan for this tax bill. Your $30k withdrawal might only net you $25k spendable cash."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "Roth IRA Contribution Strategies for Different Income Levels",
    desc: "Navigating income limits, backdoors, and tax brackets.",
    intro: "The Roth IRA is the crown jewel of American retirement accounts. You pay taxes today, but your money grows tax-free and comes out tax-free forever. However, not everyone can just 'open a Roth.' High earners are barred from direct contributions, and low earners might benefit more from the Saver's Credit. Your strategy depends entirely on your Adjusted Gross Income (AGI). This guide maps the correct Roth strategy for every income tier.",
    takeaways: [
      "<strong>Tier 1 (Low Income):</strong> If you earn <$36,500 (Single), contributing to a Roth might qualify you for the 'Saver's Credit'—free money from the IRS.",
      "<strong>Tier 2 (Middle Income):</strong> The sweet spot. You can contribute the full $7,000 (2025) directly. Prioritize this after your 401(k) match.",
      "<strong>Tier 3 (High Income):</strong> If you earn >$165,000 (Single), you are barred. You must use the 'Backdoor Roth' strategy to bypass the limit legally.",
      "<strong>Tier 4 (Ultra High):</strong> If your employer allows, the 'Mega Backdoor Roth' lets you stash up to ~$69,000 into a Roth 401(k) bucket."
    ],
    contextUS: "Current tax rates are historically low (TCJA). Many experts argue that even those in the 22% or 24% brackets should prioritize Roth now, hedging against the risk that tax rates rise in 2026 and beyond.",
    deepDiveTitle: "The Strategy Matrix",
    deepDiveContent: `
      <p>Find your income bracket (2025 Est).</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Income: Under $40,000</h3>
      <p><strong>Strategy:</strong> <strong>Aggressive Roth.</strong> Your tax rate is near 0% (after standard deduction). Pay the $0 tax now to lock in tax-free growth. Look for the Saver's Credit (Form 8880).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Income: $40,000 - $160,000</h3>
      <p><strong>Strategy:</strong> <strong>Standard Direct Contribution.</strong> Open an account at Fidelity/Schwab. Transfer $7,000/year. Set to auto-invest in VTI/VOO.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Income: $165,000+ (Single) / $246,000+ (Married)</h3>
      <p><strong>Strategy:</strong> <strong>The Backdoor Roth.</strong> <br/>
      1. Contribute $7,000 to a Traditional IRA (Non-Deductible). <br/>
      2. Wait 2 days. <br/>
      3. Convert it to Roth IRA. <br/>
      4. File Form 8606. <br/>
      <em>Result:</em> You bypassed the income limit legally.</p>
    `,
    strategyTitle: "The 'Mega Backdoor' (For Tech/Corp Workers)",
    strategySteps: [
      "<strong>Check Your Plan:</strong> Ask HR: \"Does our 401(k) allow 'After-Tax Contributions' and 'In-Service Withdrawals'?\"",
      "<strong>The Move:</strong> If yes, you can max your standard 401(k) ($23k) AND contribute another ~$46k into the 'After-Tax' bucket.",
      "<strong>The Conversion:</strong> You then immediately convert that After-Tax money to Roth (either inside the plan or to an external Roth IRA).",
      "<strong>The Benefit:</strong> You effectively put $69,000 into a tax-free Roth account in one year. This is the fastest way to catch up on retirement."
    ],
    faq: [
      {
        q: "Is the Backdoor Roth legal?",
        a: "Yes. Congress explicitly validated it in the Tax Cuts and Jobs Act conference report. It is a standard financial planning tool."
      },
      {
        q: "What about the Pro-Rata Rule?",
        a: "If you have OLD Traditional IRA money (Pre-Tax), doing a Backdoor Roth triggers taxes. You must roll your old IRA into your current 401(k) to 'hide' it before doing the backdoor move."
      },
      {
        q: "Can I withdraw contributions?",
        a: "Yes. You can always take your <em>contributions</em> out of a Roth IRA penalty-free. This makes it a great backup emergency fund. Earnings are locked until 59.5."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles2: Article[] = details.map(detail => {
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
