
import { Article } from '../../../types';
import { ArticleDetail, generateFullArticleHTML, generateArticleSchema, slugify } from '../article-generator';

const details: ArticleDetail[] = [
  {
    title: "How to Adjust Your Retirement Plan After a Major Market Crash",
    desc: "Tactical moves to preserve your portfolio when the S&P 500 drops 30%.",
    intro: "A market crash is the ultimate stress test for a retirement plan. If you are still working, it is an annoyance; if you are retired, it is a potential catastrophe. Seeing your portfolio drop from $1 Million to $700,000 keeps people awake at night. However, panic selling is the only way to turn a temporary paper loss into a permanent lifestyle reduction. This guide explains the mathematical adjustments—spending cuts, asset rebalancing, and tax harvesting—that allow a retirement plan to survive a bear market without running out of money.",
    takeaways: [
      "<strong>The Variable Spending Rule:</strong> If the market drops 20%, cut your discretionary spending by 10%. This small adjustment preserves principal, allowing the portfolio to recover faster when the bull market returns.",
      "<strong>Spend the Buffer:</strong> Do not sell stocks to pay bills during a crash. Spend your 'Cash Tent' or bond allocation. Leave equities alone to recover.",
      "<strong>Tax-Loss Harvesting:</strong> Use the crash to lower your tax bill. Sell losing positions in taxable accounts to bank a deduction, then immediately buy a similar fund to stay invested.",
      "<strong>Roth Conversions:</strong> A crash is a 'Sale' on taxes. Converting a depressed Traditional IRA to a Roth IRA costs less tax because the account value is lower. When the market recovers, all that growth happens tax-free."
    ],
    contextUS: "The S&P 500 has recovered from every crash in history, but the recovery time varies (average ~2 years). Your plan must bridge this 2-year gap. Taking Social Security early to avoid selling depressed stocks is a valid 'Break Glass' strategy during a crash.",
    deepDiveTitle: "The Recovery Protocol",
    deepDiveContent: `
      <p>Don't just sit there. Act defensively.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Stop the Bleeding (Withdrawals)</h3>
      <p>If you withdraw $40,000 from a portfolio that is down 30%, you are selling <em>more shares</em> to get the same cash. This is 'Reverse Dollar Cost Averaging'. <br/>
      <strong>Action:</strong> Switch income sources. Spend Cash reserves. Spend Dividends. Stop selling principal.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. Rebalance (Buy Low)</h3>
      <p>If Stocks drop, your Bond allocation is now overweight (e.g., 50% Stocks / 50% Bonds shifted to 40/60). <br/>
      <strong>Action:</strong> Sell Bonds (which held value) to buy Stocks (which are cheap). This is emotionally hard but mathematically mandatory.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. The 'Austerity' Budget</h3>
      <p>Cancel the big vacation. Delay the kitchen remodel. <br/>
      <strong>Why:</strong> Every $1 you leave in the portfolio during the bottom will grow to $3 or $4 in the recovery. Spending it now is incredibly expensive.</p>
    `,
    strategyTitle: "Psychological Defense",
    strategySteps: [
      "<strong>Stop Checking:</strong> Log into your account once a quarter, not once a day. Watching your net worth vaporize triggers the 'Flight' response. Ignorance protects you from making mistakes.",
      "<strong>Zoom Out:</strong> Look at a 30-year chart of the market. The 'Great Recession' of 2008 looks like a blip today. This crash will look like a blip in 2035.",
      "<strong>Read Your IPS:</strong> Pull out your 'Investment Policy Statement'. It should say: 'I will not sell during a crash.' Stick to the contract you made with yourself."
    ],
    faq: [
      {
        q: "Should I go to cash?",
        a: "<strong>No.</strong> If you sell now, you lock in the loss. You will likely miss the recovery rally, which often happens violently fast. Stay the course."
      },
      {
        q: "Can I un-retire?",
        a: "Yes. Returning to work for 1-2 years prevents you from drawing down the portfolio at the bottom. It is the ultimate safety valve."
      },
      {
        q: "Is this 2008 again?",
        a: "Probably not. Every crash has a different cause (Tech Bubble, Housing, Pandemic). The recovery mechanics are usually the same: Patience + Diversification."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Plan Retirement When You Have a High-Risk Job",
    desc: "Financial defense for careers with high injury rates or layoff volatility.",
    intro: "Police officers, construction workers, oil rig staff, and pro athletes share a common problem: their careers often end abruptly. Whether due to physical injury, burnout, or industry volatility, you cannot count on working until age 65. Planning for retirement in a high-risk profession requires an 'Accelerated Timeline.' You must assume your career will end at 50 or 55, and build a financial structure that can support you if the paycheck stops 15 years early.",
    takeaways: [
      "<strong>The 'Two-Stage' Career:</strong> Assume your high-risk job is 'Act 1.' Plan for a lower-paying, safer 'Act 2' career (consulting, teaching) to bridge the gap to traditional retirement age.",
      "<strong>Disability Insurance:</strong> This is your most critical asset. You need 'Own Occupation' insurance that pays you if you can't do <em>your specific job</em>, even if you can still do other work.",
      "<strong>The Super-Savings Rate:</strong> You don't have 40 years to save. You might only have 20. You need to save 30-40% of your income to hit your number faster.",
      "<strong>Brokerage Liquidity:</strong> Do not lock 100% of your money in 401(k)s. You might need access at age 45. Build a large Taxable Brokerage account as a bridge fund."
    ],
    contextUS: "Public safety workers often have '20 and Out' pensions. Private sector high-risk workers (e.g., oil fields) do not. They get high pay ('Hazard Pay') but zero long-term security. You must save the hazard pay, not spend it.",
    deepDiveTitle: "The Accelerated Model",
    deepDiveContent: `
      <p>Plan for a short horizon.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">1. Cap Lifestyle at 'Act 2' Levels</h3>
      <p>You make $150k now on the oil rig. Your 'Act 2' desk job might pay $60k. <br/>
      <strong>Strategy:</strong> Live on $60k <em>now</em>. Save the $90k difference. This prepares you for the income drop and builds wealth rapidly.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">2. The 'Walk Away' Fund</h3>
      <p><strong>Goal:</strong> 2 Years of Expenses in Cash. <br/>
      <strong>Why:</strong> If you get injured or laid off, you need time to retrain or heal without financial panic. Standard 3-month funds are insufficient for career pivots.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">3. Aggressive Debt Payoff</h3>
      <p>You cannot carry a mortgage into a volatile career ending. Use your high income years to pay off the house. Owning your home free and clear reduces your 'Survival Number'.</p>
    `,
    strategyTitle: "Strategic Moves",
    strategySteps: [
      "<strong>Retraining Sinking Fund:</strong> Save $20,000 specifically for education. If your body gives out, you need money to get a certification for a desk job.",
      "<strong>Avoid Golden Handcuffs:</strong> Do not buy the expensive truck or boat that requires the high-risk salary to maintain. Keep your fixed costs incredibly low.",
      "<strong>HSA Maximization:</strong> High-risk jobs lead to health issues later. Max the HSA every year to build a medical war chest for your 60s."
    ],
    faq: [
      {
        q: "Do I get Social Security early?",
        a: "No. Social Security age is fixed (62+), regardless of how hard your job was. You must self-fund the gap.",
      },
      {
        q: "Should I take the pension lump sum?",
        a: "If you retire young (50), the monthly payout might not start until 65. Taking a lump sum and investing it gives you control and potential growth during the gap years."
      },
      {
        q: "Is this FIRE?",
        a: "Basically, yes. You are 'Financially Independent, Retired Early' by necessity, not just choice. Use FIRE principles (high savings rate) to survive."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Estimate Social Security Spousal Benefits Accurately",
    desc: "Understanding the '50% Rule' and 'Deemed Filing' for couples.",
    intro: "Social Security Spousal Benefits are a critical, yet misunderstood, part of retirement planning. Even if a spouse never worked a day in their life, they are entitled to a benefit equal to 50% of the higher-earning spouse's Full Retirement Age (FRA) benefit. This rule effectively provides a 'floor' for household income. However, claiming early reduces this amount, and complex rules around 'Deemed Filing' prevent gaming the system. This guide clarifies the math of spousal support.",
    takeaways: [
      "<strong>The 50% Cap:</strong> The maximum spousal benefit is 50% of the worker's PIA (Primary Insurance Amount). It does <em>not</em> get the 8% delay credits. There is no benefit to a spouse waiting past their own FRA to claim spousal benefits.",
      "<strong>The 'Higher Of' Rule:</strong> You receive the higher of your own benefit OR the spousal benefit. You do not get both stacked together.",
      "<strong>Deemed Filing:</strong> If you file for benefits, you are 'deemed' to be filing for both your own and spousal benefits. You basically get the highest amount available to you automatically.",
      "<strong>Early Claiming Penalties:</strong> If a spouse claims at 62, the 50% benefit is reduced to ~32.5%. The penalty for early claiming is permanent."
    ],
    contextUS: "Spousal benefits are available to current spouses (married 1+ year) AND ex-spouses (married 10+ years). Divorced spouses can claim on an ex's record without the ex knowing or their own benefit being affected.",
    deepDiveTitle: "Running the Numbers",
    deepDiveContent: `
      <p>Scenario: High Earner (PIA $3,000). Low Earner (PIA $800).</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Baseline</h3>
      <p>High Earner's FRA Benefit: $3,000. <br/>
      <strong>Max Spousal Benefit (50%):</strong> $1,500.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Comparison</h3>
      <p>Low Earner's Own Benefit: $800. <br/>
      Spousal Benefit: $1,500. <br/>
      <strong>Result:</strong> Social Security tops up the Low Earner to $1,500. <br/>
      <em>Total Household Income:</em> $3,000 + $1,500 = <strong>$4,500/month</strong>.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">The Early Claiming Trap</h3>
      <p>If Low Earner claims at 62: <br/>
      The $1,500 is reduced by ~30% to <strong>$1,050</strong>. <br/>
      <em>Note:</em> Even if the High Earner delays to 70 to get $3,700, the Spousal Benefit is still capped at 50% of the age-67 amount ($1,500). Spouses don't share in delay credits.</p>
    `,
    strategyTitle: "Claiming Strategy",
    strategySteps: [
      "<strong>Coordinate Timing:</strong> The High Earner must have filed for benefits for the Low Earner to claim a spousal benefit. (Exception: Divorced spouses don't need the ex to file).",
      "<strong>Wait for FRA:</strong> The spouse should try to wait until Full Retirement Age (67) to claim spousal benefits. Claiming early locks in a permanent reduction.",
      "<strong>High Earner Delays:</strong> The High Earner should still wait until 70 to maximize their <em>own</em> benefit and the <em>survivor</em> benefit, even though it doesn't help the spousal benefit.",
      "<strong>Divorce Check:</strong> If you are divorced, check if your ex earns more. You might get a raise by claiming on their record. You must be unmarried to claim."
    ],
    faq: [
      {
        q: "Can I switch benefits?",
        a: "Generally no. Under new rules, you get the highest benefit available when you file. You can't take your own now and switch to spousal later (unless your spouse hasn't filed yet).",
      },
      {
        q: "What if my spouse dies?",
        a: "You switch to 'Survivor Benefits'. You get 100% of their check (if higher than yours). Spousal (50%) is for living partners; Survivor (100%) is for widows."
      },
      {
        q: "Do government pensions affect this?",
        a: "Yes. The 'Government Pension Offset' (GPO) reduces spousal benefits by 2/3 of your government pension. It can wipe out the spousal benefit entirely."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  },
  {
    title: "How to Build a Retirement Plan When You Expect Lower Future Earnings",
    desc: "Front-loading savings before a career downshift.",
    intro: "Many people plan to 'downshift' in their 50s—leaving a high-stress corporate job for a lower-paying passion project or non-profit role. While this is great for mental health, it creates a retirement planning urgency. You cannot count on your 50s being your 'peak earning years' if you plan to take a pay cut. You must 'Front-Load' your retirement savings while your income is high, essentially funding your 65-year-old self with your 35-year-old salary.",
    takeaways: [
      "<strong>Coast FIRE:</strong> The goal is to save enough early on so that compound interest fills the retirement bucket without further contributions. Once you hit 'Coast' status, you only need to earn enough to cover daily bills.",
      "<strong>The 'Reverse' Savings Curve:</strong> Save 30-40% of your income in your 30s and 40s. Drop to 0-5% savings in your 50s. This matches your career arc.",
      "<strong>Debt Elimination:</strong> You must pay off the mortgage <em>before</em> you take the pay cut. A high mortgage payment requires a high salary. A paid-off house enables a low salary.",
      "<strong>Lifestyle Cap:</strong> Do not let your lifestyle expand to match your peak earnings. Live on the future 'lower' salary now. Save the difference."
    ],
    contextUS: "High income years are the best time to use Pre-Tax 401(k)s (high deduction). Low income years are the best time to do Roth Conversions (low tax). This strategy optimizes your lifetime tax rate perfectly.",
    deepDiveTitle: "The Coast Calculation",
    deepDiveContent: `
      <p>Scenario: You are 40. You want to downshift at 50. Retire at 65.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 1: High Earner (Age 40-50)</h3>
      <p>Income: $150k. Spending: $60k. <br/>
      <strong>Savings:</strong> $50k/year. (Max 401k + Roth + Brokerage). <br/>
      <em>Result at 50:</em> You have ~$700,000 invested.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 2: The Downshift (Age 50-65)</h3>
      <p>New Job: Librarian. Income: $50k. <br/>
      <strong>Savings:</strong> $0. You earn just enough to cover your $50k spending. <br/>
      <strong>Portfolio Growth:</strong> The $700k sits there compounding at 7%.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Phase 3: Retirement (Age 65)</h3>
      <p>The $700k has grown to <strong>~$1.9 Million</strong> without you adding a penny. <br/>
      <em>Verdict:</em> You secured a wealthy retirement while working a low-stress job for 15 years.</p>
    `,
    strategyTitle: "Execution Steps",
    strategySteps: [
      "<strong>Avoid Golden Handcuffs:</strong> Do not buy a house that requires a $200k salary to service. Keep fixed costs aligned with your 'future' salary.",
      "<strong>Liquidate Debt:</strong> Use your high income bonuses to kill student loans and car notes. You need a lean balance sheet to downshift.",
      "<strong>Bridge Health Insurance:</strong> If your downshift job doesn't have benefits, budget for ACA premiums. Ensure your new lower income qualifies you for subsidies.",
      "<strong>Max the 401(k) Now:</strong> You might not have access to a 401(k) later. Use the $23,000 space while you have it."
    ],
    faq: [
      {
        q: "What if the market crashes?",
        a: "If the market crashes during your 'Coast' phase, you might need to save a little bit again. Flexibility is required. Or work until 67 instead of 65."
      },
      {
        q: "Is this risky?",
        a: "It's actually safer than the standard path. You are buying your freedom early. Waiting until 60 to start saving is the risky path."
      },
      {
        q: "Does Social Security drop?",
        a: "Slightly, because your later years have lower earnings. But your high-earning early years count heavily. The impact is usually minimal compared to the freedom gained."
      }
    ],
    author: "Daniel Evans",
    authorBio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk."
  }
];

export const retirementPlanningArticles51: Article[] = details.map(detail => {
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
