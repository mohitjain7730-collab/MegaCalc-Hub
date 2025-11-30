
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Transition from Growth Investing to Income Investing for Retirement",
    desc: "Shifting your portfolio strategy from 'Accumulation' to 'Distribution'.",
    intro: "For 30 years, your goal was simple: Growth. You bought stocks, ignored dividends, and reinvested everything. As you approach retirement, the goal changes. You no longer need your money to double; you need it to pay the electric bill. Transitioning from a 'Growth' portfolio to an 'Income' portfolio is one of the most critical pivots in an investor's life. Do it too early, and you lose out on compounding. Do it too late, and a market crash could ruin your retirement. This guide explains the mechanics of the shift.",
    takeaways: [
      "<strong>The Mindset Shift:</strong> Accumulation is about maximizing Total Return. Distribution is about maximizing Reliability. You are trading potential upside for sleep-at-night certainty.",
      "<strong>The 'Yield' Trap:</strong> Don't just buy the highest yielding assets (Junk Bonds, mREITs). High yield often signals high risk. Focus on 'Dividend Growth'—companies that raise payouts annually.",
      "<strong>The 5-Year Glidepath:</strong> Don't switch overnight. Start shifting 5 years before retirement. Slowly sell high-beta tech stocks and buy bonds/dividend payers to lock in gains.",
      "<strong>Total Return Approach:</strong> You don't <em>have</em> to live on dividends. You can simply sell 4% of your growth portfolio annually. This is often more tax-efficient than chasing yield."
    ],
    contextUS: "The US tax code taxes interest (Bonds) at ordinary income rates and qualified dividends (Stocks) at lower capital gains rates. A pure 'Income' portfolio might inadvertently raise your tax bill. Asset Location is key.",
    deepDiveTitle: "The Allocation Pivot",
    deepDiveContent: `
      <p>Moving from 90/10 to 60/40 or 50/50.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 1: The Growth Engine (Age 20-55)</h3>
      <p><strong>Holdings:</strong> Total Stock Market (VTI), Tech (QQQ), Small Cap. <br/>
      <strong>Goal:</strong> Grow the pile. Volatility is irrelevant.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 2: The Transition (Age 55-65)</h3>
      <p><strong>Action:</strong> Stop reinvesting dividends. Let cash pile up. <br/>
      <strong>Selling:</strong> Trim the winners. If Tech is up 30%, sell it to buy Short-Term Bonds or Dividend Aristocrats. <br/>
      <strong>Goal:</strong> Build a 2-year 'Cash Tent' to cover expenses in case of a crash at retirement.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 3: The Income Engine (Age 65+)</h3>
      <p><strong>Holdings:</strong> Dividend Growth (SCHD), Corporate Bonds (LQD), Treasuries (GOVT). <br/>
      <strong>Goal:</strong> Generate 3-4% cash flow annually to minimize the need to sell shares.</p>
    `,
    strategyTitle: "Execution Tactics",
    strategySteps: [
      "<strong>Audit Your Beta:</strong> Look at your portfolio volatility. If it moves 1.5x the market, it's too risky for a retiree. Aim for a Beta of 0.6 to 0.8.",
      "<strong>Bond Ladders:</strong> Replace 'Bond Funds' (which fluctuate in price) with 'Bond Ladders' (individual bonds held to maturity). This guarantees income on specific dates.",
      "<strong>The 'Bucket' Setup:</strong> Keep 2 years of cash in Bucket 1. Keep 5 years of income assets in Bucket 2. Keep growth stocks in Bucket 3. Only spend from Bucket 1.",
      "<strong>Tax Awareness:</strong> Selling growth stocks to buy income stocks triggers taxes in a brokerage account. Do the heavy shifting inside your IRA/401(k) where it is tax-free."
    ],
    faq: [
      {
        q: "Should I sell everything and buy bonds?",
        a: "<strong>No.</strong> Inflation will destroy you. You still need 40-60% stocks in retirement to grow your purchasing power over 30 years."
      },
      {
        q: "Is it okay to sell principal?",
        a: "Yes. The 'Total Return' strategy involves selling shares. It is mathematically sound, even if it feels psychologically wrong to see share count drop."
      },
      {
        q: "What are Dividend Aristocrats?",
        a: "S&P 500 companies that have increased dividends for 25+ consecutive years. ETFs like NOBL track them. They are a great 'bridge' asset."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Estimate Your Retirement Income From Pensions + Social Security",
    desc: "Calculating your 'Guaranteed Floor' to determine your portfolio risk.",
    intro: "Retirement income comes from two sources: Guaranteed Income (Social Security, Pensions, Annuities) and Variable Income (Portfolio Withdrawals). The higher your Guaranteed Income, the less you rely on the stock market, and the more risk you can afford to take with your savings. Many people underestimate their Social Security or misunderstand their Pension payout options. This guide helps you audit your guaranteed income sources to build a rock-solid floor for your retirement budget.",
    takeaways: [
      "<strong>The 'Floor' Concept:</strong> Ideally, your guaranteed income covers your 'Essential Expenses' (Housing, Food, Utilities). Your portfolio covers 'Discretionary Expenses' (Travel, Dining). This makes you crash-proof.",
      "<strong>Social Security Optimization:</strong> It is an inflation-protected annuity. Delaying from 62 to 70 increases the payout by 76%. This is often the best 'investment' you can make.",
      "<strong>Pension Options:</strong> 'Lump Sum' vs 'Monthly Annuity'. The monthly check transfers longevity risk to the employer. The lump sum transfers risk to you. Mathematically, the monthly check is often superior if you live a long time.",
      "<strong>COLA Awareness:</strong> Social Security has a Cost of Living Adjustment. Most private pensions do <em>not</em>. A $2,000 pension today will buy much less in 20 years."
    ],
    contextUS: "Corporate pensions are disappearing, but 15% of private workers and most government workers still have them. The 'Windfall Elimination Provision' (WEP) can reduce Social Security for government employees. Check if this applies to you.",
    deepDiveTitle: "The Income Worksheet",
    deepDiveContent: `
      <p>Map out your monthly inflows.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Source 1: Social Security</h3>
      <p>Login to SSA.gov. <br/>
      <strong>Note:</strong> The number shown assumes you work until that age. If you retire at 55 but claim at 67, the number will be slightly lower (due to zero-income years).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Source 2: Private Pension</h3>
      <p>Contact HR for your 'Pension Benefit Statement'. <br/>
      <strong>Single Life Option:</strong> Higher payout, stops when you die. <br/>
      <strong>Joint & Survivor Option:</strong> Lower payout, continues for spouse. <br/>
      <em>Strategy:</em> Usually take the Joint option to protect the surviving spouse, unless you have massive life insurance.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Source 3: The Gap</h3>
      <p><strong>Total Needs:</strong> $6,000/mo. <br/>
      <strong>Guaranteed Income:</strong> $4,000/mo. <br/>
      <strong>Gap:</strong> $2,000/mo. <br/>
      <em>Portfolio Requirement:</em> You need a portfolio that can generate $24k/year. Using the 4% rule, that is <strong>$600,000</strong>."</p>
    `,
    strategyTitle: "Tactical Decisions",
    strategySteps: [
      "<strong>Lump Sum Check:</strong> If offered a pension buyout, check the math. If the 'Monthly Payout' is 6% of the Lump Sum, take the monthly. You can't get a guaranteed 6% yield in the market easily.",
      "<strong>The 'Bridge' Fund:</strong> If you retire at 60 but delay Social Security to 70, you need a cash bridge to fund the intervening 10 years. Don't claim SS early just for cash flow; spend down assets instead.",
      "<strong>Tax Planning:</strong> Pension income and Social Security are taxable (mostly). Don't forget to withhold taxes from these checks, or you will owe the IRS in April."
    ],
    faq: [
      {
        q: "Is my pension safe?",
        a: "Private pensions are insured by the PBGC (Pension Benefit Guaranty Corp) up to a limit. Public pensions are backed by tax revenue. They are generally very safe."
      },
      {
        q: "Does my spouse get my Social Security?",
        a: "If your benefit is higher, yes. Upon your death, they drop their benefit and step up to yours. Maximizing the higher earner's benefit is a gift to the survivor."
      },
      {
        q: "What if my pension has no COLA?",
        a: "You need to save more. You must build a side portfolio specifically to cover the loss of purchasing power over 20 years."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Use Bridge Accounts Before Accessing 401(k) Funds at 59½",
    desc: "Funding early retirement without paying the 10% IRS penalty.",
    intro: "The biggest logistical hurdle for FIRE (Financial Independence, Retire Early) is the 'Age Gap'. You retire at 45 or 50, but your 401(k) and IRA money is technically locked until 59.5. If you withdraw early, you pay a 10% penalty. To bridge this gap, you need a specific 'Bridge Account'—accessible liquid funds that sustain you until the retirement accounts unlock. This guide explains how to build and drain your bridge efficiently.",
    takeaways: [
      "<strong>The Taxable Brokerage Account:</strong> The primary bridge vehicle. Capital gains taxes (0-15%) are lower than income taxes, and there are no age restrictions. This should be your first withdrawal source.",
      "<strong>Roth Contributions:</strong> You can withdraw your direct Roth IRA *contributions* (not earnings) at any time, tax and penalty-free. This acts as a secondary bridge layer.",
      "<strong>The Rule of 55:</strong> If you leave your job in the year you turn 55 or later, you can access *that* employer's 401(k) immediately. This shortens the bridge requirement to age 55 for many.",
      "<strong>SEPP 72(t):</strong> A 'Break Glass' option that allows you to withdraw from IRAs at any age if you commit to a strict schedule. Use only if the bridge runs dry."
    ],
    contextUS: "Early retirees must manage their 'Reported Income' (AGI) carefully to qualify for ACA health insurance subsidies. Living off a Taxable Brokerage account (where only the gains are taxable) keeps AGI low, saving thousands in premiums.",
    deepDiveTitle: "Sizing the Bridge",
    deepDiveContent: `
      <p>Scenario: Retiring at 50. Access at 60. 10-Year Gap.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Calculation</h3>
      <p><strong>Annual Spend:</strong> $60,000. <br/>
      <strong>Years Needed:</strong> 10. <br/>
      <strong>Bridge Size:</strong> $600,000 (ignoring growth/inflation for safety).</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Source</h3>
      <p>You need $600k in <strong>Accessible</strong> accounts.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Taxable Brokerage:</strong> $400,000.</li>
        <li><strong>Roth Contributions:</strong> $100,000.</li>
        <li><strong>Cash/HYSA:</strong> $100,000.</li>
      </ul>
      <p><em>Note:</em> Your $1M in 401(k) does not count toward the bridge. It is for Age 60+.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Drawdown Strategy</h3>
      <p>Spend the Taxable Brokerage first. <br/>
      <em>Why?</em> It generates 0% or 15% tax rates. <br/>
      <em>Benefit:</em> Low AGI = Cheap Health Insurance.</p>
    `,
    strategyTitle: "Advanced Bridge Tactics",
    strategySteps: [
      "<strong>Roth Conversion Ladder:</strong> While living on the Bridge, convert Traditional IRA money to Roth IRA (up to the standard deduction). You pay little/no tax, and that money becomes accessible 5 years later, refilling the bridge.",
      "<strong>The '457' Exception:</strong> If you work for the government, your 457(b) has no age penalty. It is the ultimate bridge account. Max it out.",
      "<strong>Dividends:</strong> Stop reinvesting dividends in your Taxable account 5 years before retiring. Let the cash pile up to form the start of your bridge.",
      "<strong>HSA Receipts:</strong> Cash in your shoebox of old medical receipts. This is tax-free cash you can pull anytime to supplement the bridge."
    ],
    faq: [
      {
        q: "What if the bridge runs out?",
        a: "You use SEPP 72(t) on your IRA. It forces you to take withdrawals for 5 years or until 59.5. It's rigid, but it saves you the 10% penalty."
      },
      {
        q: "Should I stop 401(k) to fund the bridge?",
        a: "Maybe. If you are 'Over-Saved' in retirement accounts but 'Under-Saved' in liquid accounts, switch contributions to your Taxable Brokerage for the last few years of work."
      },
      {
        q: "Is the 10% penalty really that bad?",
        a: "Yes. It guarantees you lose. However, if you have no choice, paying 10% is better than starving. But planning avoids this."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Create a Retirement Plan if You’ve Been Self-Employed Your Entire Career",
    desc: "Exit strategies for business owners with no pension.",
    intro: "For lifelong entrepreneurs and freelancers, retirement planning is doubly hard. You don't have a pension or employer match, and your net worth is often tied up in the business itself. The common assumption—'I'll sell the business to fund my retirement'—is a high-risk gamble. Most small businesses are hard to sell. The prudent strategy is to skim profits *during* your career to build an independent investment portfolio. This guide explains how to diversify away from your business risk.",
    takeaways: [
      "<strong>Diversification is Survival:</strong> Your business is your income source. If your retirement savings are also reinvested in the business, you have 'Single Point of Failure' risk. You must siphon cash OUT to the stock market.",
      "<strong>The Solo 401(k):</strong> The most powerful tool for self-employed. You can contribute ~$69k/year. Use high-profit years to make massive contributions.",
      "<strong>Valuation Reality Check:</strong> Assume your business is worth $0 at retirement. If you can sell it, that's a bonus. If you can't, your Solo 401(k) must support you.",
      "<strong>Social Security Audit:</strong> If you aggressively wrote off expenses to show low income on tax returns, your Social Security check will be tiny. You need a larger personal portfolio to compensate."
    ],
    contextUS: "Many business owners suppress their taxable income to save taxes today. The downside is a lower Social Security record. You traded a government annuity for current cash flow. You must invest that cash flow, or you lose on both ends.",
    deepDiveTitle: "The 'Exit' Options",
    deepDiveContent: `
      <p>How does a founder actually retire?</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option 1: The Sale (Lump Sum)</h3>
      <p><strong>Pros:</strong> Immediate cash. Clean break. <br/>
      <strong>Cons:</strong> Hard to find a buyer. Valuation is often 2-3x EBITDA (low). Taxes on sale are high. <br/>
      <em>Strategy:</em> Groom a successor or explore an ESOP (Employee Stock Ownership Plan) 5 years in advance.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option 2: The Passive Owner (Income Stream)</h3>
      <p>Hire a GM to run it. You take a quarterly profit distribution. <br/>
      <strong>Pros:</strong> Continued income. You keep the asset. <br/>
      <strong>Cons:</strong> You are never truly 'retired'. You still have liability and oversight duties.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Option 3: The Liquidation (Asset Sale)</h3>
      <p>Sell the client list, equipment, and real estate. Close the doors. <br/>
      <strong>Pros:</strong> Simple. <br/>
      <strong>Cons:</strong> Lowest payout. Usually pennies on the dollar.</p>
    `,
    strategyTitle: "Building the 'Outside' Pot",
    strategySteps: [
      "<strong>Automated Skim:</strong> Set up a rule. 10% of Gross Revenue (not profit) goes to a personal wealth account. Treat it like a supplier bill.",
      "<strong>Real Estate Diversification:</strong> If your business owns its building, put the building in a separate LLC. When you retire, sell the business but <em>keep the building</em>. Charge the new owner rent. This is the safest retirement pension.",
      "<strong>Defined Benefit Plan:</strong> For high earners ($300k+), you can set up a Defined Benefit plan on top of a Solo 401(k) to shelter $100k+ per year tax-deferred.",
      "<strong>Succession Planning:</strong> If you want to sell, start documenting processes now. A business that runs without you is valuable. A business that <em>is</em> you is worthless."
    ],
    faq: [
      {
        q: "Can I sell to my kids?",
        a: "Yes, but don't gift it if you need the money. Use an 'Installment Sale'. They pay you monthly from the business profits over 10 years. It acts like a pension."
      },
      {
        q: "What if I have no savings?",
        a: "You must work longer or sell the business aggressively. The 'business <em>is</em> my retirement' plan only works if there is a buyer. Get a valuation today."
      },
      {
        q: "Should I buy commercial real estate?",
        a: "Yes. Owning the building your business occupies is a classic wealth builder. The tenant (your business) pays off the mortgage. You retire with a paid-off income-generating property."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles22: Article[] = details.map(detail => {
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
