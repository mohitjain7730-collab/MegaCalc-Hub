

import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Build a Retirement Plan When You’re a High Earner in the U.S.",
    desc: "Advanced tax strategies for the 'Henrys' (High Earners, Not Rich Yet).",
    intro: "Being a high earner ($200k+ individual, $400k+ household) solves many cash flow problems but introduces massive tax inefficiencies. The standard advice of 'Max your 401(k) and Roth IRA' doesn't work because you are phased out of direct Roth contributions and the $23,000 401(k) limit is too small to maintain your lifestyle in retirement. To build wealth efficiently at this level, you must move beyond basic accounts to advanced structures like the Mega Backdoor Roth, NQDC plans, and Taxable Brokerage optimization.",
    takeaways: [
      "<strong>The Savings Rate Trap:</strong> High earners often suffer from lifestyle creep. Saving 10% of $400k is not enough to replace a $400k lifestyle. You need to aim for a 30-40% savings rate.",
      "<strong>The Mega Backdoor Roth:</strong> If your employer allows 'After-Tax' contributions, you can stuff an additional ~$46,000 into your 401(k) annually above the standard limit. This is the most powerful tool for high earners.",
      "<strong>Asset Location is Mandatory:</strong> With a 37% federal tax rate, holding bonds or REITs in a taxable account is a disaster. You must be surgical about placing tax-inefficient assets in tax-deferred accounts.",
      "<strong>NQDC Plans:</strong> Deferred Compensation plans allow you to defer 50%+ of your salary to lower your current tax bracket, paying taxes only when you withdraw in retirement."
    ],
    contextUS: "High earners are hit by the 'Net Investment Income Tax' (3.8%) and 'Additional Medicare Tax' (0.9%). Efficient planning isn't just about growth; it's about avoiding the 50% combined marginal tax rate trap in states like California or New York.",
    deepDiveTitle: "The High-Income Waterfall",
    deepDiveContent: `
      <p>You need more buckets than the average saver.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. The Basic Max-Out</h3>
      <p><strong>401(k):</strong> $23,000 (Pre-Tax). Lowers your top-line AGI. <br/>
      <strong>HSA:</strong> $4,300 (Family $8,550). The only deduction left available to you.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The 'Backdoor' Strategies</h3>
      <p><strong>Backdoor Roth IRA:</strong> You can't contribute directly. You must contribute $7,000 to a Traditional IRA (Non-Deductible) and convert it immediately. <br/>
      <strong>Mega Backdoor Roth:</strong> Call your 401(k) provider. Ask if you can make 'After-Tax' contributions and do 'In-Service Withdrawals'. If yes, you can funnel tens of thousands more into Roth.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. The Taxable Overflow</h3>
      <p>Once tax-advantaged space is full ($70k+), the rest goes to a Brokerage account. <br/>
      <strong>Strategy:</strong> Buy Municipal Bonds (MUB) for tax-free income and broad ETFs (VTI) for low turnover. Avoid active funds that generate capital gains distributions.</p>
    `,
    strategyTitle: "Executive Compensation Tactics",
    strategySteps: [
      "<strong>RSU Management:</strong> If you get Restricted Stock Units, sell them the moment they vest. Treat them as a cash bonus. Don't hold a concentrated position in your employer; your job is already enough risk there.",
      "<strong>Deferred Comp (NQDC):</strong> If eligible, defer salary to lower your bracket today. Schedule payouts to start 5 years after retirement when your tax rate drops.",
      "<strong>Umbrella Insurance:</strong> High net worth makes you a target for lawsuits. Get a $2M-$5M umbrella policy. It costs ~$300/year and protects your nest egg.",
      "<strong>Tax Loss Harvesting:</strong> Use a robo-advisor or DIY to aggressively harvest losses in the taxable account. A $3,000 deduction saves you $1,100 in taxes at top brackets."
    ],
    faq: [
      {
        q: "Is Whole Life Insurance good for high earners?",
        a: "Agents push it as a 'tax shelter', but fees are huge. Usually, maxing out a Taxable Brokerage account with tax-efficient ETFs outperforms Whole Life. Use it only as a bond substitute for the ultra-wealthy ($10M+)."
      },
      {
        q: "Can I deduct student loan interest?",
        a: "No. At your income level, that deduction phases out. You have to pay loans with raw, after-tax dollars."
      },
      {
        q: "What is the AMT?",
        a: "Alternative Minimum Tax. It removes many deductions (like state taxes). If you have lots of ISO stock options, you need a CPA to plan for the AMT hit."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications."
  },
  {
    title: "How to Estimate Retirement Income If You Have Multiple 401(k)s",
    desc: "The 'Consolidation' strategy for the modern job-hopper.",
    intro: "The average American changes jobs 12 times in their career. This leaves a trail of 'Zombie 401(k)s'—forgotten accounts sitting in old employer plans with high fees and forgotten passwords. Trying to plan for retirement with 6 different log-ins is impossible. You don't know your total asset allocation, you're paying multiple admin fees, and you can't track your net worth. This guide explains the logistics of consolidating your accounts and how to estimate your cohesive monthly income from the mess.",
    takeaways: [
      "<strong>The Consolidation Rule:</strong> Generally, roll all old 401(k)s into a single Rollover IRA or your current employer's 401(k). This simplifies management and often lowers fees.",
      "<strong>The 'Pro-Rata' Warning:</strong> If you plan to do Backdoor Roths, having a large Rollover IRA will trigger taxes. In that case, rolling old 401(k)s into your <em>current</em> 401(k) is the only way to hide the money from the Pro-Rata rule.",
      "<strong>Lost Accounts:</strong> Billions of dollars are sitting in unclaimed retirement accounts. Use the National Registry of Unclaimed Retirement Benefits to find your old money.",
      "<strong>Rule of 55 nuance:</strong> Remember, the 'Rule of 55' (early withdrawal) only applies to the 401(k) of your <em>current</em> employer. If you leave money in an old plan, you can't touch it penalty-free until 59.5."
    ],
    contextUS: "401(k) plans can legally force you out if your balance is under $5,000. They might send you a check (taxable!) or roll it to a default IRA. Keeping track of small balances prevents accidental tax bills.",
    deepDiveTitle: "The Roll-Up Process",
    deepDiveContent: `
      <p>Don't cash out. Do a 'Direct Transfer'.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 1: Audit the Fees</h3>
      <p>Look at your old 401(k). <br/>
      <strong>Expense Ratios:</strong> Are they 0.05% or 0.80%? <br/>
      <strong>Admin Fee:</strong> Does the plan charge $50/year just to exist? <br/>
      <em>Decision:</em> If old fees are high, move the money.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 2: Choose Destination</h3>
      <p><strong>Rollover IRA (Fidelity/Vanguard):</strong> Gives you access to every stock/ETF. Lowest fees. <br/>
      <em>Drawback:</em> Blocks Backdoor Roth.</p>
      <p><strong>Current 401(k):</strong> Keeps money hidden for Backdoor Roth. Allows Rule of 55 access. <br/>
      <em>Drawback:</em> Limited investment menu.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 3: The Transfer</h3>
      <p>Call the <em>new</em> custodian. Ask them to initiate the pull. They will help you fill out the forms so the check is made out to the custodian, not you. This avoids withholding taxes.</p>
    `,
    strategyTitle: "Estimating the Income",
    strategySteps: [
      "<strong>Aggregate the Balance:</strong> Once consolidated, you see one number (e.g., $500,000).",
      "<strong>Apply the 4% Rule:</strong> $500,000 x 0.04 = <strong>$20,000/year</strong>.",
      "<strong>Add Social Security:</strong> Log into SSA.gov. Add your benefit (e.g., $30k).",
      `<strong>Total Income:</strong> $20k + $30k = $50k/year. <br/>
      <em>Analysis:</em> Now you can clearly see if this covers your $60k spending need. If accounts were scattered, you'd never see the gap.`
    ],
    faq: [
      {
        q: "Does rolling over count as a contribution?",
        a: "No. Rollovers are transfers. They do not count toward your $7,000 IRA limit or $23,000 401(k) limit. You can roll $1 Million and still contribute new money."
      },
      {
        q: "What if my old company went bankrupt?",
        a: "Your 401(k) is held in a trust separate from the company. Creditors cannot touch it. Contact the plan administrator or the Department of Labor to locate it."
      },
      {
        q: "Can I roll a Roth 401(k)?",
        a: "Yes, into a Roth IRA. This is a great move because Roth IRAs don't have RMDs (Roth 401ks didn't used to, but rules are aligning). It simplifies the tax bucket."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Plan for Retirement When You Expect to Work Part-Time After 60",
    desc: "The 'Phased Retirement' strategy: Lowering portfolio strain with active income.",
    intro: "Retirement isn't a cliff; it's a slope. The binary idea of 'Working 100%' to 'Working 0%' is outdated. Many Americans prefer 'Phased Retirement'—downshifting to a lower-stress, part-time role (Barista FIRE or Consulting) from age 60 to 70. This active income stream fundamentally changes the math of retirement. By earning just enough to cover your grocery bill, you can let your portfolio compound untouched for another decade, drastically increasing your long-term security.",
    takeaways: [
      "<strong>The 'Coast' Effect:</strong> If you earn $30,000/year part-time, you reduce your portfolio withdrawal need by $30,000. This is mathematically equivalent to having an extra $750,000 saved (at a 4% rule).",
      "<strong>Sequence of Returns Shield:</strong> Working part-time during the first 5 years of 'retirement' protects you from selling stocks during a market crash. You live on your salary, not your seed corn.",
      "<strong>Social Security Delay:</strong> The income allows you to delay claiming Social Security until 70, locking in the maximum inflation-adjusted benefit for the rest of your life.",
      "<strong>Health Insurance Bridge:</strong> Many part-time jobs (Starbucks, Costco, University positions) offer health insurance. This saves you $15,000/year in ACA premiums before Medicare kicks in at 65."
    ],
    contextUS: "The 'Earnings Test' reduces Social Security benefits if you claim early (62) and earn over ~$22k/year. This penalty disappears at Full Retirement Age (67). Working part-time fits perfectly with a strategy of delaying Social Security anyway.",
    deepDiveTitle: "The Math of 'Just a Little' Work",
    deepDiveContent: `
      <p>Scenario: You have $800,000. You spend $60,000/year.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option A: Full Retirement at 60</h3>
      <p>Withdrawal: $60,000 (7.5% rate). <br/>
      <strong>Risk:</strong> Extremely High. You will likely run out of money before 80.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option B: Phased Retirement (Work to 67)</h3>
      <p>You work part-time earning $40,000/year. <br/>
      <strong>Withdrawal:</strong> $20,000 (2.5% rate). <br/>
      <strong>Growth:</strong> The portfolio likely grows (7% return - 2.5% withdrawal = 4.5% growth). <br/>
      By age 67, the portfolio might be <strong>$1.1 Million</strong>. <br/>
      <strong>Result:</strong> You now have a larger nest egg AND a larger Social Security check. You are bulletproof.</p>
    `,
    strategyTitle: "Setting Up the Phase",
    strategySteps: [
      "<strong>Negotiate with Current Employer:</strong> Ask to go to 3 days a week. Many companies prefer retaining institutional knowledge part-time over losing you completely.",
      "<strong>The 'Consultant' Shift:</strong> Convert your career capital into contract work. Charge $150/hr. Work 10 hours a week. That is $75k/year gross.",
      "<strong>Low-Stress Pivot:</strong> Take a job you <em>enjoy</em> even if it pays less. Working at a garden center or golf course for $15/hr keeps you active and covers the utility bills.",
      "<strong>Stop Saving:</strong> In this phase, stop contributing to retirement accounts. Use your income to <em>live</em>. Let the existing pile grow."
    ],
    faq: [
      {
        q: "Does working hurt my Medicare?",
        a: "No. In fact, if you have credible coverage from work, you can delay Medicare Part B and avoid premiums. If not, you just pay Medicare premiums as normal."
      },
      {
        q: "Is it tax efficient?",
        a: "Yes. Earning $30k keeps you in the lowest tax bracket (10-12%). You can use this low-income window to do small Roth Conversions on the side."
      },
      {
        q: "What if I get sick?",
        a: "That is the risk. If you <em>must</em> stop working, you revert to full retirement. Ensure your portfolio is at least at 'Lean FIRE' levels before downshifting, just in case."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Use Roth Conversions During Low-Income Years",
    desc: "Optimizing the 'Tax Valley' to reduce lifetime IRS bills.",
    intro: "Most people's income follows a curve: it goes up during their career, drops to zero at retirement, and then spikes again at age 73 when Required Minimum Distributions (RMDs) and Social Security hit. That dip in the middle—the 'Tax Valley'—is a golden opportunity. By voluntarily recognizing income during these low-bracket years via **Roth Conversions**, you can pay taxes at 10% or 12% today to avoid paying 22% or higher later. This guide explains how to fill your tax brackets efficiently.",
    takeaways: [
      "<strong>The 'Gap' Years:</strong> The years between retirement (e.g., 60) and RMDs (73) are your prime conversion window. You have control over your taxable income.",
      "<strong>Bracket Filling:</strong> The goal is to convert just enough Traditional IRA money to 'fill up' the 12% or 22% tax bracket, but not a dollar more. This smooths your tax rate.",
      "<strong>RMD Defense:</strong> Every dollar you convert today is a dollar that doesn't grow into a larger RMD tax bomb at age 75. You are prepaying tax to buy freedom.",
      "<strong>Pay with Cash:</strong> Always pay the conversion tax from a separate taxable account. If you withhold tax from the IRA itself, you have less money growing tax-free."
    ],
    contextUS: "The Standard Deduction ($29,200 married) means the first ~$29k of conversion is effectively tax-free if you have no other income. This is the '0% Bracket'. Wasting this space is a financial sin.",
    deepDiveTitle: "The Conversion Math",
    deepDiveContent: `
      <p>Scenario: Married Couple, Age 62. Living on Cash. No other income.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Capacity (2025 Est)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Standard Deduction:</strong> $29,200 (0% Tax).</li>
        <li><strong>10% Bracket:</strong> up to ~$23,000 (Tax ~$2,300).</li>
        <li><strong>12% Bracket:</strong> up to ~$94,000 (Tax ~$8,500).</li>
      </ul>
      <p><strong>Top of 12% Bracket:</strong> Gross Income of ~$123,000.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Move</h3>
      <p>Convert <strong>$123,000</strong> from Traditional IRA to Roth IRA. <br/>
      <strong>Total Tax Bill:</strong> ~$10,800 (Effective Rate: ~8.8%). <br/>
      <strong>The Win:</strong> You moved $123k to Roth paying only 8.8%. If you waited until age 75, RMDs might have forced this out at the 22% or 24% rate.</p>
    `,
    strategyTitle: "Execution Steps",
    strategySteps: [
      "<strong>Calculate the Gap:</strong> In November, estimate your total income for the year. Determine how much room is left in the 12% or 22% bracket.",
      "<strong>Execute the Trade:</strong> Log into brokerage. Select 'Convert to Roth'. Choose the specific dollar amount. Do NOT withhold taxes.",
      "<strong>File Form 8606:</strong> This tracks the conversion. It is critical for avoiding double taxation.",
      "<strong>Watch for IRMAA:</strong> Conversions count as income for Medicare premiums. Check the 'IRMAA Cliffs' (e.g., $206k). Stay $1 below the cliff to avoid a premium surcharge 2 years later."
    ],
    faq: [
      {
        q: "What is the 5-Year Rule?",
        a: "Each conversion has a 5-year clock. You cannot withdraw the <em>converted principal</em> penalty-free for 5 years (if under 59.5). Since you are over 59.5, this usually doesn't apply to penalties, but the account must be open 5 years for earnings to be tax-free."
      },
      {
        q: "Does this affect Social Security?",
        a: "Yes. Conversions increase AGI, which can make more of your Social Security taxable in that specific year. Run the numbers."
      },
      {
        q: "Can I do this while working?",
        a: "Yes, but your salary already fills the lower brackets. You would be converting at your <em>marginal</em> rate (e.g., 24%). It is usually better to wait for low-income years."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles31: Article[] = details.map(detail => {
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
