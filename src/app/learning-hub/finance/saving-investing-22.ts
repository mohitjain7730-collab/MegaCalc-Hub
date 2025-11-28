
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from './article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Use a Backdoor Roth IRA: Step-by-Step for High Earners",
    desc: "A guide to bypassing income limits legally to fund tax-free retirement growth.",
    intro: "The Roth IRA is one of the best investment vehicles in the US tax code, offering tax-free growth forever. However, the IRS imposes an 'Income Limit' (Modified Adjusted Gross Income) that prevents high earners from contributing. In 2025, if you earn over ~$165,000 (single) or ~$246,000 (married), you are theoretically locked out. Enter the **Backdoor Roth IRA**. This is a perfectly legal, 2-step administrative maneuver that allows high earners to bypass the income cap. While sanctioned by the IRS, it requires strict adherence to rules to avoid tax penalties.",
    takeaways: [
      "<strong>The 2-Step Process:</strong> Contribute to a Traditional IRA (Non-Deductible), then immediately 'Convert' it to a Roth IRA.",
      "<strong>No Income Limits:</strong> Anyone, regardless of income (even millions), can perform a conversion.",
      "<strong>The Pro-Rata Rule:</strong> The biggest trap. If you have <em>existing</em> Pre-Tax Traditional IRA money (like an old 401k rollover), the conversion becomes taxable. You must have $0 in Traditional IRAs to do this cleanly.",
      "<strong>Form 8606:</strong> You must file this tax form to prove to the IRS that you already paid taxes on the contribution so you aren't taxed twice."
    ],
    contextUS: "Congress explicitly blessed this strategy in the Tax Cuts and Jobs Act conference notes, removing the fear that it was a 'loophole' that might be retroactively punished. It is now a standard wealth management tool for the upper-middle class (Doctors, Lawyers, Tech workers).",
    deepDiveTitle: "The Mechanics of the Maneuver",
    deepDiveContent: `
      <p>Follow these steps precisely to execute a 'Mega Backdoor' or standard Backdoor Roth.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 1: Contribution</h3>
      <p>Open a Traditional IRA. Deposit $7,000 (the 2025 limit). Do <strong>not</strong> invest the money yet; leave it as cash. Do <strong>not</strong> deduct this contribution on your taxes (it is 'Non-Deductible').</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 2: Conversion</h3>
      <p>Wait 1-2 days for the funds to settle. Then, log into your broker and select 'Convert to Roth IRA'. Move the entire $7,000 to your Roth IRA account.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 3: Investment</h3>
      <p>Once the funds land in the Roth IRA, invest them in your target ETF (e.g., VOO/VTI). The money grows tax-free forever.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The 'Pro-Rata' Trap Explained</h3>
      <p>If you have an old SEP IRA or Traditional IRA with $93,000 of pre-tax money, and you add $7,000 new post-tax money, the IRS views your total pot as $100,000 (93% pre-tax, 7% post-tax). If you convert $7,000, the IRS says 93% of that conversion is taxable. <strong>Fix:</strong> Roll your old IRAs into your current employer's 401(k) <em>before</em> doing the backdoor move to clear the deck.</p>
    `,
    strategyTitle: "Execution Checklist",
    strategySteps: [
      "<strong>Check Balances:</strong> Ensure all Traditional, SEP, and SIMPLE IRA balances are $0 on December 31st of the conversion year.",
      "<strong>Disable Auto-Invest:</strong> Ensure the Traditional IRA contribution stays in cash until converted. If it earns interest (e.g., $5), you have to pay tax on that $5.",
      "<strong>File Taxes Correctly:</strong> Tell your CPA you made a 'Non-Deductible Contribution' and a 'Roth Conversion'. If they miss Form 8606, you will pay double tax.",
      "<strong>Repeat Annually:</strong> There is no limit on how many years you can do this. It effectively removes the income cap forever."
    ],
    faq: [
      {
        q: "Is this tax evasion?",
        a: "No. It is tax avoidance (legal). The IRS has acknowledged the strategy. You are paying the taxes upfront (by not taking a deduction) in exchange for tax-free growth."
      },
      {
        q: "Can I do this with a 401(k)?",
        a: "That is called the 'Mega Backdoor Roth'. It allows up to ~$69k total contributions, but your employer plan must specifically allow 'After-Tax Contributions' and 'In-Service Withdrawals'. Check your plan document."
      },
      {
        q: "What if I forget to convert immediately?",
        a: "If the money sits for months and earns $100 interest, you can still convert. You just pay taxes on the $100 earnings. The original $7,000 converts tax-free."
      }
    ],
    author: "Michael Ross, CFP",
    authorBio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications.",
    publishedDate: "December 01, 2025"
  },
  {
    title: "How to Allocate Assets by Age: A US-Focused Rule of Thumb",
    desc: "Updating the '100 minus Age' rule for longer life expectancies and modern bond yields.",
    intro: "Asset allocation—the mix of Stocks, Bonds, and Cash in your portfolio—is responsible for 90% of your investment returns. The old rule of thumb was '100 minus your Age equals your Stock percentage.' (e.g., A 30-year-old holds 70% stocks). In 2025, with Americans living longer and bond yields fluctuating, this rule is considered too conservative. Running out of money at age 85 is a bigger risk than stock market volatility at age 40. This guide provides updated, aggressive allocation models for every decade of life.",
    takeaways: [
      "<strong>The '120 Rule':</strong> The modern standard is 120 - Age. A 30-year-old should be 90% equities. This accounts for longer retirements.",
      "<strong>Sequence of Returns Risk:</strong> The 5 years before and after retirement (The 'Fragile Decade') require a specific 'Bond Tent' strategy to prevent a crash from ruining your plan.",
      "<strong>Human Capital:</strong> When young, your 'Human Capital' (ability to work) is like a bond. You can afford high stock risk because you can just work more.",
      "<strong>Glide Path:</strong> You should shift gradually, not all at once. Target Date Funds do this automatically."
    ],
    contextUS: "Social Security acts as a 'Bond' floor for most Americans. Because you have a guaranteed inflation-adjusted income stream starting at 62-70, you can technically afford to take <em>more</em> risk with your personal portfolio than someone in a country without a safety net.",
    deepDiveTitle: "Allocation Models by Decade",
    deepDiveContent: `
      <p>Recommended allocations for a moderate-to-aggressive investor.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Age 20-35 (The Accumulation Phase)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Stocks:</strong> 90% - 100%</li>
        <li><strong>Bonds:</strong> 0% - 10%</li>
        <li><strong>Why:</strong> You have 30+ years to recover from a crash. A 50% drop is a buying opportunity. Bonds just drag down your compounding speed.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Age 35-50 (The Growth Phase)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Stocks:</strong> 80% - 90%</li>
        <li><strong>Bonds:</strong> 10% - 20%</li>
        <li><strong>Why:</strong> You have significant capital now. A 10% bond allocation provides 'Dry Powder' to rebalance into stocks during a crash.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Age 50-60 (The Transition Phase)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Stocks:</strong> 60% - 70%</li>
        <li><strong>Bonds/Cash:</strong> 30% - 40%</li>
        <li><strong>Why:</strong> You are approaching the 'Danger Zone.' If the market drops 40% the year you retire, you are in trouble. You start locking in gains.</li>
      </ul>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Age 65+ (The Distribution Phase)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Stocks:</strong> 50% - 60%</li>
        <li><strong>Bonds/Cash:</strong> 40% - 50%</li>
        <li><strong>Why:</strong> You still need growth to beat inflation for a 30-year retirement, so you never go 0% stocks. But you need enough cash/bonds to pay 5 years of bills without selling stocks in a downturn.</li>
      </ul>
    `,
    strategyTitle: "The 'Bond Tent' Strategy",
    strategySteps: [
      "<strong>Ramp Up:</strong> 5 years before retirement, aggressively buy bonds/cash, moving from 80/20 to 60/40 or even 50/50.",
      "<strong>Retire:</strong> You hit your peak safety allocation on Day 1 of retirement.",
      "<strong>Ramp Down:</strong> As you age in retirement, you actually <em>spend down</em> the bonds and let the stocks grow. By age 80, you might be back to 80% stocks because your timeline is shorter and you are leaving money for heirs.",
      "<strong>Rebalance Annually:</strong> This discipline forces you to adhere to the rule, selling what is high and buying what is low."
    ],
    faq: [
      {
        q: "Does owning a home count as a bond?",
        a: "Sort of. A paid-off house reduces your monthly expenses, acting like an annuity. It reduces your need for bond income."
      },
      {
        q: "What if I have a pension?",
        a: "A pension is a giant bond. If your expenses are covered by a pension + Social Security, your portfolio can be 100% stocks forever because you don't *need* the market money to live."
      },
      {
        q: "Is 100% stock safe at 30?",
        a: "Mathematically, yes. Psychologically, only if you don't panic sell. If a 40% drop causes you to sell, then 100% stock was <em>too risky</em> for you, regardless of age."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk.",
    publishedDate: "December 02, 2025"
  },
  {
    title: "How to Create a College Savings Plan Using 529 and Tax Strategies",
    desc: "Maximizing the specific tax benefits of 529 plans without hurting financial aid.",
    intro: "College tuition in the US rises roughly 5-6% per year, far outpacing general inflation. For new parents, the projected cost of a 4-year degree in 2040 is staggering. The **529 Plan** is the government's solution. It acts like a Roth IRA for education: money goes in post-tax, but grows tax-free and comes out tax-free for qualified expenses. Thanks to recent legislation (Secure Act 2.0), the biggest risk of 529s—'What if my kid doesn't go to college?'—has been mitigated, making them a premier wealth transfer tool.",
    takeaways: [
      "<strong>Tax-Free Growth:</strong> The primary benefit. 18 years of compound interest with zero capital gains tax can pay for half of college alone.",
      "<strong>State Tax Deduction:</strong> Over 30 states offer a state income tax deduction or credit for contributing to their specific plan.",
      "<strong>The $35k Roth Rollover:</strong> Effective 2024, up to $35,000 of unused 529 funds can be rolled into a Roth IRA for the beneficiary, removing the 'trapped money' fear.",
      "<strong>Superfunding:</strong> You can contribute 5 years worth of gift-tax limit at once ($90k single / $180k couple) to front-load growth."
    ],
    contextUS: "Unlike brokerage accounts, 529s are considered 'Parental Assets' on the FAFSA form, meaning they have a low impact (5.64%) on financial aid eligibility. Conversely, accounts in the child's name (UTMA) are assessed at 20%, hurting aid. The 529 is structurally superior for aid maximization.",
    deepDiveTitle: "Choosing the Right Plan",
    deepDiveContent: `
      <p>You are not restricted to your own state's plan, but you should check it first.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 1: Check Your Home State</h3>
      <p>Does your state offer a tax deduction? (e.g., NY, PA, IN, IL). <br/>
      <strong>Yes:</strong> Use your state's plan to capture the free money (tax break). <br/>
      <strong>No:</strong> You are a 'Free Agent'. Pick the best national plan.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 2: Best National Plans</h3>
      <p>If your state has no income tax (TX, FL, WA) or no deduction (CA), choose a low-fee powerhouse:</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Utah (my529):</strong> Gold standard. Low fees, Vanguard funds, customizable.</li>
        <li><strong>Nevada (Vanguard Plan):</strong> Extremely low costs.</li>
        <li><strong>New Hampshire (Fidelity):</strong> Good integration if you use Fidelity.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Step 3: Investment Strategy</h3>
      <p>Most plans offer 'Age-Based Portfolios' (like Target Date Funds). They start aggressive (Stocks) when the kid is a baby and switch to Cash when the kid is 17. <strong>Use this option.</strong> You do not want the market to crash the year tuition is due.</p>
    `,
    strategyTitle: "Advanced 529 Tactics",
    strategySteps: [
      "<strong>The Grandparent Trap:</strong> If grandparents open a 529, distributions used to count as 'Student Income' on FAFSA, killing financial aid. Recent FAFSA simplification has largely fixed this, but check current rules. It is often safer for grandparents to contribute to the <em>Parent's</em> 529.",
      "<strong>K-12 Tuition:</strong> You can use up to $10,000/year per student for private elementary/high school tuition tax-free.",
      "<strong>Scholarship Strategy:</strong> If your child gets a full ride scholarship, you can withdraw the equivalent amount from the 529 penalty-free (you just pay income tax on earnings, no 10% penalty).",
      "<strong>Dynasty 529:</strong> You can change the beneficiary to yourself, a sibling, or a grandchild tax-free. The money can grow for generations."
    ],
    faq: [
      {
        q: "What if I need the money for non-education?",
        a: "You pay income tax on the <em>earnings</em> (not principal) plus a 10% penalty. This is often still better than a taxable account if the money grew for 15+ years."
      },
      {
        q: "Does it cover off-campus rent?",
        a: "Yes, up to the university's official 'Cost of Attendance' estimate for room and board. Keep receipts."
      },
      {
        q: "Can I use it for student loans?",
        a: "Yes, the Secure Act allows using up to $10,000 (lifetime limit) to pay off student loans for the beneficiary or their sibling."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "December 03, 2025"
  },
  {
    title: "How to Turn a Side Hustle into an Investment Fund (U.S. Plan)",
    desc: "Leveraging the Solo 401(k) to save 100% of your side income tax-deferred.",
    intro: "For many US employees, a 'side hustle' (consulting, Uber, Etsy) is just extra spending money. But for the financially savvy, it is a tax shelter. Because side hustle income is considered 'Self-Employment Income', it opens the door to business retirement accounts like the **Solo 401(k)**. This vehicle allows you to contribute massive amounts—far more than a standard employee 401(k)—essentially letting you live on your day job salary while funneling your entire side hustle income into tax-advantaged investments.",
    takeaways: [
      "<strong>The Double Contribution:</strong> As both employee and employer of your side hustle, you can contribute up to $69,000 (2025 limit) or 100% of your net earnings, whichever is less.",
      "<strong>Tax Arbitrage:</strong> You can use side hustle expenses (home office, laptop) to lower taxable income, then put the rest in a pre-tax 401(k) to lower it further.",
      "<strong>Roth Option:</strong> Solo 401(k)s often allow Roth contributions (Mega Backdoor), unlike SEP IRAs.",
      "<strong>Asset Protection:</strong> 401(k)s have stronger legal protection against creditors/lawsuits than IRAs."
    ],
    contextUS: "If you have a W-2 job with a 401(k) and a Side Hustle with a Solo 401(k), the 'Employee' limit ($23,500) is shared between them. However, the 'Employer' profit sharing limit is separate. This means you can max out your W-2 match AND put 20% of your side hustle profits into the Solo 401(k).",
    deepDiveTitle: "The Solo 401(k) Mechanics",
    deepDiveContent: `
      <p>This is the most powerful account for solopreneurs.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Eligibility</h3>
      <p>You must have self-employment activity (EIN not strictly required, but recommended) and <strong>NO common-law employees</strong> (except a spouse). If you hire a full-time assistant, you lose Solo 401(k) eligibility.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Contribution Math</h3>
      <p>Example: You make $80k at a Day Job and $30k Consulting.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Day Job:</strong> You contribute $23,500 to W-2 401(k). You hit the 'Employee' cap.</li>
        <li><strong>Side Hustle:</strong> You can contribute 0% as 'Employee' (cap hit). BUT, you can contribute ~20% of net profit as 'Employer'.</li>
        <li><strong>Result:</strong> You shelter ~$6,000 of side income from taxes entirely.</li>
      </ul>
      <p><em>Scenario B:</em> The Side Hustle makes $100k. You can put away $23.5k (Employee) + $20k (Employer) = $43.5k total. Nearly half your income vanishes from the IRS's view.</p>
    `,
    strategyTitle: "How to execute the '100% Invested' Plan",
    strategySteps: [
      "<strong>Open a Business Checking Account:</strong> Keep side money separate. It makes tax time easier.",
      "<strong>Open Solo 401(k):</strong> Go to Fidelity, Schwab, or E-Trade. You will need an EIN (get it free from IRS.gov). Note: Vanguard's Solo 401(k) does not allow IRA rollovers or loans, so it is less flexible.",
      "<strong>Pay Business Expenses First:</strong> Software, mileage, internet portion. This lowers Net Income.",
      "<strong>Sweep the Rest:</strong> Calculate Net Profit. Transfer the maximum allowable amount to the Solo 401(k) before tax day. Invest it in VTSAX/VTI.",
      "<strong>Live on W-2:</strong> Do not upgrade your lifestyle with side money. Treat the side hustle as a 'Wealth Venture Capital Firm', not a piggy bank."
    ],
    faq: [
      {
        q: "Is there a deadline to open?",
        a: "Yes. You must open the Solo 401(k) by December 31st to contribute for that tax year. You can fund it up until Tax Day (April 15), but the account must <em>exist</em> by Dec 31."
      },
      {
        q: "What if I need the money?",
        a: "Solo 401(k)s allow you to take a loan of up to $50,000 (or 50% of balance) from yourself. You pay the interest back to yourself. It is a great liquidity backup."
      },
      {
        q: "Is SEP IRA easier?",
        a: "Yes, less paperwork. But SEP IRAs don't allow 'Employee' contributions (only Employer 25%). If your side hustle makes $20k, a Solo 401(k) lets you save nearly 100% of it (if under the global cap). A SEP only lets you save 25% ($5k). Solo 401(k) wins for small side hustles."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization.",
    publishedDate: "December 04, 2025"
  }
];

export const savingInvestingArticles22: Article[] = details.map(detail => {
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
