
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How Much Americans Should Save Before Downsizing or Upsizing Their Home",
    desc: "Calculating the 'Switching Costs' of real estate transactions.",
    intro: "Changing homes is one of the most expensive financial transactions you will ever make. Whether you are 'Upsizing' for a growing family or 'Downsizing' for retirement, the friction costs—Realtor fees, Transfer Taxes, Closing Costs, and Movers—can consume 10% of your home's value. Many people assume they can just 'use the equity' from their old home to buy the new one, but timing issues and cash requirements often create a liquidity gap. This guide helps you calculate the cash you need to execute the move smoothly.",
    takeaways: [
      "<strong>The 10% Friction Rule:</strong> It costs ~6-10% of your home's value to sell it (Commission + Tax + Prep). If you sell a $500k home, you lose $50k in equity to fees.",
      "<strong>The 'Bridge' Gap:</strong> You often need the down payment for the new house <em>before</em> the old house closes. You need cash savings or a 'Bridge Loan' to cover this spread.",
      "<strong>Downsizing Reality:</strong> Moving to a smaller house doesn't always save money. Condo fees (HOA) and newer taxes can offset a smaller mortgage. Do the 'Total Cost' math.",
      "<strong>The 'Make Ready' Fund:</strong> You need cash to paint/stage your old home to sell it for top dollar. Budget $5k-$10k for prep work."
    ],
    contextUS: "In the US, seller pays the agent commissions (typically 5-6%). This comes out of your equity check. Capital Gains Tax exclusion ($250k single / $500k married) applies if you lived there 2 of the last 5 years. Know your tax liability before listing.",
    deepDiveTitle: "The Moving Math",
    deepDiveContent: `
      <p>Scenario: Selling for $500k, Buying for $700k (Upsize).</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Cost to Sell</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Commissions (6%):</strong> $30,000.</li>
        <li><strong>Repairs/Staging:</strong> $5,000.</li>
        <li><strong>Transfer Taxes:</strong> $2,000.</li>
        <li><strong>Net Proceeds:</strong> Sale Price - Mortgage Balance - $37,000.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Cost to Buy</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Down Payment (20% of $700k):</strong> $140,000.</li>
        <li><strong>Closing Costs (3%):</strong> $21,000.</li>
        <li><strong>Total Cash Needed:</strong> $161,000.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Liquidity Problem</h3>
      <p>If your Net Proceeds from the sale are $150,000, you technically have enough. <strong>BUT</strong>, you don't get that check until closing. You need the $161,000 <em>on buying day</em>. If you buy first, you need savings. If you sell first, you need temporary housing.</p>
    `,
    strategyTitle: "Tactical Planning",
    strategySteps: [
      "<strong>Save the 'Gap':</strong> Ideally, save 5% of the new home price in cash ($35k) to use as an Earnest Money deposit. You can't use equity for the deposit.",
      "<strong>Recast Later:</strong> If you don't have the full 20% down in cash, put 5% down. Once your old house sells, take the lump sum and 'Recast' your new mortgage. This lowers payments without refinancing.",
      "<strong>Downsizing Warning:</strong> Do not assume a cheaper house means cheaper life. Verify HOA fees. A $300k condo with a $800 HOA costs the same monthly as a $450k house.",
      "<strong>Sell First:</strong> The safest financial move is to sell, move into a rental for 6 months, and buy slowly with cash in hand. It reduces stress and desperation."
    ],
    faq: [
      {
        q: "What is a Bridge Loan?",
        a: "A short-term, high-interest loan using your old house as collateral to fund the down payment on the new one. Expensive but useful if you must buy first."
      },
      {
        q: "Is downsizing worth it?",
        a: "Only if you pocket significant equity ($100k+) or reduce fixed costs by >30%. Otherwise, the transaction costs (10%) eat the benefit."
      },
      {
        q: "Can I avoid capital gains tax?",
        a: "Yes, if it was your primary residence for 2 of the last 5 years, you get the $250k/$500k exclusion. If gains are higher, you pay tax."
      }
    ],
    author: "Robert Hughes",
    authorBio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash."
  },
  {
    title: "How To Build a Savings Plan If You’re Recovering From Job Loss",
    desc: "Stabilizing finances after the severance runs out.",
    intro: "Getting a new job after a layoff is a huge relief, but the financial damage often lingers. You may have drained your emergency fund, racked up credit card debt, or paused retirement contributions. The 'Recovery Phase' is critical. The temptation is to immediately return to your old spending habits ('I deserve a treat!'). The correct move is to live on a 'Crisis Budget' for 6 more months to refill the tank. This guide prioritizes the rebuilding steps to get back to zero.",
    takeaways: [
      "<strong>The 'Ghost' Paycheck:</strong> Pretend you are still unemployed for the first 3 months. Use 100% of your discretionary income to refill your Emergency Fund.",
      "<strong>Debt Triage:</strong> If you used credit cards to survive, kill this debt first. It is an emergency. Pause 401(k) contributions (except the match) until the high-interest debt is gone.",
      "<strong>Replenish the Buffer:</strong> Your goal is to get back to 3 months of cash savings immediately. You are vulnerable right now; a car repair could break you.",
      "<strong>Avoid Lifestyle Inflation:</strong> Your new job might pay more. Do not upgrade your apartment. Bank the raise to repair the damage."
    ],
    contextUS: "Re-entering the workforce often resets benefits. You might have a waiting period for health insurance or 401(k) eligibility. You need cash flow to cover these gaps.",
    deepDiveTitle: "The Recovery Roadmap",
    deepDiveContent: `
      <p>Priority order for your new income.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Month 1: The Catch-Up</h3>
      <p>Pay any past-due bills. Get current on rent/mortgage. <br/>
      <strong>Goal:</strong> Stop the late fees.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Months 2-3: The Liquidity Refill</h3>
      <p>You likely drained your savings. <br/>
      <strong>Goal:</strong> $2,000 Cash Buffer. <br/>
      <strong>Action:</strong> Direct deposit 20% of your check to savings. Live lean.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Months 4-6: The Debt Cleanse</h3>
      <p>Did you accrue balance on a Visa? <br/>
      <strong>Action:</strong> Attack it. Throw every surplus dollar at it. <br/>
      <strong>Retirement:</strong> Only do the Employer Match until this is gone.</p>
    `,
    strategyTitle: "Psychological Traps",
    strategySteps: [
      "<strong>The 'Reward' Impulse:</strong> You want to celebrate the new job with a dinner or trip. <strong>Don't.</strong> Celebrate with a free activity. You are still in financial recovery mode.",
      "<strong>The 'Catch Up' Panic:</strong> You feel behind on retirement. Don't try to dump $23k into your 401(k) in Year 1 if you have no cash. Liquidity is safety. Build the cash moat first.",
      "<strong>Automate immediately:</strong> Set up the 401(k) deduction on Day 1. If you get used to the full paycheck, it will be harder to cut back later."
    ],
    faq: [
      {
        q: "Should I roll over my old 401(k)?",
        a: "Yes. Roll it to an IRA (Fidelity/Vanguard) or your new plan. Do not cash it out. You will pay taxes + 10% penalty, making your recovery harder."
      },
      {
        q: "What if the new job pays less?",
        a: "You must permanently cut expenses. You cannot subsidize a lifestyle your income doesn't support. Move, sell the car, or get a roommate."
      },
      {
        q: "How long to rebuild?",
        a: "It usually takes 1.5x the duration of unemployment. If you were out for 4 months, expect 6 months to get back to breakeven."
      }
    ],
    author: "Amanda Lee",
    authorBio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning."
  },
  {
    title: "How Much You Should Save If You Want To Move to a High-Cost City (NYC, SF, LA)",
    desc: "The 'City Entry Tax': Calculating the cash needed to land safely.",
    intro: "Moving to a Tier 1 city is a high-risk, high-reward play. The salaries are higher, but the barrier to entry is a wall of cash. Landlords in NYC or SF often require 3-4 months of rent upfront (First, Last, Security, Broker Fee). For a $3,000 apartment, you might need to write a check for $12,000 before you even buy a bed. Moving without this war chest leads to credit card debt and stress. This guide helps you calculate the 'Landing Fund' needed to start your city life.",
    takeaways: [
      "<strong>The '4x Rent' Rule:</strong> Assume you need 4 times your monthly rent in liquid cash to sign a lease. ($3k rent = $12k cash).",
      "<strong>Income Requirements:</strong> Landlords usually require annual income of 40x monthly rent. ($3k rent = $120k salary). If you don't meet this, you need a Guarantor or extra deposit.",
      "<strong>The 'Churn' Period:</strong> Your first month will cost double. Takeout, Ubers, IKEA runs. Budget an extra $2,000 for 'Friction Costs'.",
      "<strong>Moving Costs:</strong> A cross-country move costs $3k-$5k. Don't use your deposit money for the truck."
    ],
    contextUS: "In NYC, 'Broker Fees' (15% of annual rent) are standard and paid by the tenant. This is unique to the market and a massive sunk cost. Budget for it or hunt exclusively for 'No Fee' listings.",
    deepDiveTitle: "The Relocation Calculator",
    deepDiveContent: `
      <p>Target: Moving to NYC/SF.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Housing (The Big Check)</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>First Month: $3,000.</li>
        <li>Security Deposit: $3,000.</li>
        <li>Broker Fee (15% of annual): ~$5,400.</li>
        <li><strong>Cash to Landlord:</strong> <strong>$11,400</strong>.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Logistics</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Movers/Truck: $2,000.</li>
        <li>Travel (Flights/Hotels): $500.</li>
        <li><strong>Total:</strong> $2,500.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Setup Buffer</h3>
      <p>Furniture (City apartments are small; your old couch won't fit): $1,500. <br/>
      Restocking Pantry: $300. <br/>
      <strong>Total:</strong> $1,800.</p>
      
      <p><strong>Grand Total:</strong> <strong>$15,700</strong>. <br/>
      <em>Action:</em> Start saving $1,000/mo a year before you move.</p>
    `,
    strategyTitle: "How to Lower the Cost",
    strategySteps: [
      "<strong>Sublet First:</strong> Don't sign a lease immediately. Find a 1-month sublet or Airbnb ($2,500). It requires less upfront cash and buys you time to find a 'No Fee' apartment.",
      "<strong>Sell Everything:</strong> Don't pay to move old furniture. Sell it. Travel with 2 suitcases. Buy used furniture in the city. It is cheaper and less stressful.",
      "<strong>The 'Guarantor' Hack:</strong> If you don't meet the 40x income rule, use a service like 'TheGuarantors' or 'Rhino'. You pay a small fee (e.g., 1 month rent) to replace the security deposit. It preserves your cash flow."
    ],
    faq: [
      {
        q: "Should I bring a car?",
        a: "<strong>No.</strong> Parking is $400-$600/mo. Insurance is double. Sell the car. Use the proceeds to fund the move. Use the subway."
      },
      {
        q: "Is the salary bump worth it?",
        a: "Usually yes, long term. City careers accelerate faster. But the first 2 years are a grind. You are investing in your resume."
      },
      {
        q: "Can I use a credit card for rent?",
        a: "Usually no, or there is a 3% fee. Landlords want Certified Checks (Cashier's Checks). You need money in the bank."
      }
    ],
    author: "Amanda Lee",
    authorBio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning."
  },
  {
    title: "The Best Savings Strategy for Americans Who Are Self-Employed",
    desc: "Automating the 'Tax, Save, Invest' flow for business owners.",
    intro: "Self-employment is the ultimate freedom, but it comes with administrative burdens. W-2 employees have taxes and 401(k)s deducted automatically. You do not. If you see $10,000 in your account and spend $10,000, you are in debt to the IRS. Successful freelancers build a 'Financial Machine' that mimics a corporate payroll department, stripping out taxes and savings before the money ever hits their personal spending account.",
    takeaways: [
      "<strong>The 30% Tax Vault:</strong> The moment a client pays you, move 30% to a separate savings account. This covers Income Tax + Self-Employment Tax. Touch this only for quarterly payments.",
      "<strong>The Solo 401(k):</strong> The best retirement account in America. You can contribute ~$69k (2025) annually. Use high-income months to make massive contributions.",
      "<strong>The 'Salary' Method:</strong> Pay yourself a consistent flat wage from your business account. Leave the surplus in the business. This prevents lifestyle creep during 'Feast' months.",
      "<strong>Emergency Fund XL:</strong> You need 6-12 months of expenses saved. You don't have unemployment insurance or paid sick leave. You are your own safety net."
    ],
    contextUS: "Quarterly Estimated Taxes (1040-ES) are due April 15, June 15, Sept 15, and Jan 15. Missing these deadlines triggers penalties. Automating the tax savings prevents the scramble.",
    deepDiveTitle: "The 3-Account System",
    deepDiveContent: `
      <p>Never co-mingle funds.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Business Checking (Receiving)</h3>
      <p>All revenue lands here. <br/>
      <strong>Auto-Rule:</strong> Every Friday, transfer 30% of the balance to Tax Savings.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Tax Savings (Holding)</h3>
      <p>High-Yield Savings Account. <br/>
      <strong>Role:</strong> Holds tax money. Earns interest. <br/>
      <strong>Action:</strong> Pay IRS quarterly.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Personal Checking (Spending)</h3>
      <p><strong>Action:</strong> Transfer a fixed 'Salary' (e.g., $5,000) on the 1st of the month from Business Checking. <br/>
      <strong>Benefit:</strong> Your personal budget is stable. The Business account absorbs the volatility.</p>
    `,
    strategyTitle: "Wealth Acceleration",
    strategySteps: [
      "<strong>Maximize the Solo 401(k):</strong> In December, review your profit. Make a large 'Employer' contribution (up to 20% of profit) to lower your tax bill instantly.",
      "<strong>HSA as Strategy:</strong> Pay for your own health insurance? Get a High Deductible plan and max the HSA ($4,300). It is a tax deduction that stays with you.",
      "<strong>Expense Tracking:</strong> Use QuickBooks or Wave. Deduct every legitimate business expense (Home Office, Internet, Software). Every $1 expense saves you ~$0.30 in taxes."
    ],
    faq: [
      {
        q: "Do I need an LLC?",
        a: "For savings? No. A Sole Proprietorship works fine for Solo 401(k)s and bank accounts. LLC is for legal liability protection."
      },
      {
        q: "What if I have a bad month?",
        a: "Your Business Checking should have a 'Buffer' of 2 months of salary. In a bad month, draw from the buffer. In a good month, refill it."
      },
      {
        q: "Can I borrow from the tax fund?",
        a: "<strong>NO.</strong> This is the #1 way freelancers fail. If you spend the tax money, you can't pay the IRS. The penalties and stress are not worth it."
      }
    ],
    author: "Jennifer Wu",
    authorBio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization."
  }
];

export const savingInvestingArticles116: Article[] = details.map(detail => {
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
