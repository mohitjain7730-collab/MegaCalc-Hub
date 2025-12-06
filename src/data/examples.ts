/**
 * Topic-Based Example Generator
 * 
 * Contains realistic, human-like examples for various financial and health topics.
 * Each example includes:
 * - A realistic scenario
 * - Real numbers
 * - A meaningful outcome
 * - A timeline or consequence
 */

export interface Example {
  scenario: string;
  numbers: string;
  outcome: string;
  timeline: string;
  fullText: string;
}

export const EXAMPLES_BY_CATEGORY: Record<string, Example[]> = {
  investing: [
    {
      scenario: 'Sarah, a 32-year-old marketing manager',
      numbers: '$500 monthly starting at age 25',
      outcome: '$1.2 million by age 65',
      timeline: '40 years of consistent investing',
      fullText: 'Sarah, a 32-year-old marketing manager, started investing $500 monthly at age 25 in a diversified index fund averaging 7% annual returns. By age 65, her consistent contributions and compound interest would grow to approximately $1.2 million, even though she only contributed $240,000 out of pocket. Starting just 5 years earlier than her peers who began at 30 gave her a $400,000 advantage due to the power of compound interest.'
    },
    {
      scenario: 'Mark and Lisa, a couple in their 40s',
      numbers: 'rebalancing from 80% stocks to 60% stocks',
      outcome: 'reduced volatility by 25%',
      timeline: 'as they approach retirement in 15 years',
      fullText: 'Mark and Lisa, a couple in their 40s, calculated that rebalancing their $800,000 portfolio from 80% stocks to 60% stocks as they approach retirement would reduce volatility by 25% while maintaining strong growth potential. This strategic shift protects their nest egg from market downturns while still allowing for growth, ensuring they can retire comfortably in 15 years without taking excessive risk.'
    },
    {
      scenario: 'David, a 28-year-old software engineer',
      numbers: 'switching from 1.2% expense ratio to 0.05%',
      outcome: 'saving $23,000 in fees over 20 years',
      timeline: 'on a $100,000 investment',
      fullText: 'David, a 28-year-old software engineer, discovered that switching from actively managed funds with a 1.2% expense ratio to low-cost index funds with 0.05% fees would save him $23,000 in fees over 20 years on his $100,000 investment. This fee reduction alone could fund an entire year of retirement expenses, demonstrating how seemingly small percentages compound into significant savings over time.'
    }
  ],
  
  budgeting: [
    {
      scenario: 'The Johnson family',
      numbers: 'spending $450 monthly on dining out',
      outcome: 'saved $3,000 annually',
      timeline: 'by reducing to $200 and cooking more at home',
      fullText: 'After tracking expenses for 2 months, the Johnson family discovered they were spending $450 monthly on dining out. By reducing this to $200 and cooking more at home, they saved $3,000 annually. This simple change allowed them to fully fund their children\'s 529 college savings plan, turning a lifestyle adjustment into a meaningful investment in their family\'s future.'
    },
    {
      scenario: 'A recent college graduate',
      numbers: 'following the 50/30/20 rule on a $50,000 salary',
      outcome: '$1,000 monthly for savings',
      timeline: 'building a $12,000 emergency fund in one year',
      fullText: 'A recent college graduate calculated that following the 50/30/20 rule on a $50,000 salary would allow $1,000 monthly for savings, building a $12,000 emergency fund in just one year. This financial cushion gave them the confidence to negotiate a better salary, knowing they had a safety net if job searching took longer than expected.'
    },
    {
      scenario: 'The Martinez family',
      numbers: 'refinancing their car loan from 8% to 4% APR',
      outcome: 'saving $2,400 over the loan term',
      timeline: 'allowing them to redirect money to education fund',
      fullText: 'The Martinez family found that refinancing their car loan from 8% to 4% APR would save $2,400 over the loan term. They redirected this savings directly into their children\'s education fund, turning a debt optimization into an investment in their kids\' future without changing their monthly budget.'
    }
  ],
  
  health: [
    {
      scenario: 'Lisa, tracking her daily intake for 3 months',
      numbers: 'consuming 400 more calories than maintenance level',
      outcome: 'lost 12 pounds over 4 months',
      timeline: 'by adjusting portions without changing exercise',
      fullText: 'After tracking her daily intake for 3 months, Lisa discovered she was consuming 400 more calories than her maintenance level. By adjusting her portions and making small substitutions, she lost 12 pounds over 4 months without changing her exercise routine. This data-driven approach helped her understand that small, consistent changes yield sustainable results.'
    },
    {
      scenario: 'Mark, a 45-year-old office worker',
      numbers: 'needing 8,000 steps daily to maintain weight',
      outcome: 'reached his goal within 2 weeks',
      timeline: 'by parking further away and taking stairs',
      fullText: 'Mark, a 45-year-old office worker, used this calculator to find that his sedentary lifestyle meant he needed to walk 8,000 steps daily to maintain his weight. He started parking further away and taking stairs instead of elevators, reaching his goal within 2 weeks. This simple lifestyle integration made fitness achievable without gym memberships or major schedule changes.'
    },
    {
      scenario: 'A fitness enthusiast',
      numbers: 'increasing protein from 60g to 100g daily',
      outcome: 'gained 5 pounds of lean muscle',
      timeline: 'while maintaining body fat percentage over 3 months',
      fullText: 'A fitness enthusiast calculated that increasing her protein intake from 60g to 100g daily would help her build muscle more effectively. After 3 months of consistent high-protein nutrition combined with strength training, she gained 5 pounds of lean muscle while maintaining her body fat percentage, proving that targeted nutrition changes can accelerate fitness goals.'
    }
  ],
  
  'real-estate': [
    {
      scenario: 'Sarah, a 32-year-old marketing manager',
      numbers: 'refinancing $250,000 mortgage at 3.5% instead of 4.2%',
      outcome: 'saving $156 per month, $56,160 over loan life',
      timeline: '30-year mortgage term',
      fullText: 'Sarah, a 32-year-old marketing manager, used this calculator to determine that refinancing her $250,000 mortgage at 3.5% instead of 4.2% would save her $156 per month, totaling $56,160 over the life of the loan. This single financial decision freed up nearly $2,000 annually that she redirected into retirement savings, turning a mortgage optimization into long-term wealth building.'
    },
    {
      scenario: 'Tom, comparing 30-year vs 15-year mortgage',
      numbers: 'increasing monthly payment by $400',
      outcome: 'saving $87,000 in total interest',
      timeline: 'by choosing 15-year term',
      fullText: 'Tom found that switching from a 30-year to a 15-year mortgage would increase his monthly payment by $400 but save him $87,000 in total interest payments. This aggressive payoff strategy allowed him to own his home outright 15 years earlier, eliminating his largest monthly expense before retirement and providing significant financial security.'
    },
    {
      scenario: 'A couple in their 40s',
      numbers: 'maxing out HSA contributions',
      outcome: 'saving $1,200 annually in taxes',
      timeline: 'while building $200,000 healthcare fund by retirement',
      fullText: 'A couple in their 40s used this tool to realize that maxing out their HSA contributions could save them $1,200 annually in taxes while building a $200,000 healthcare fund by retirement. This triple tax advantage—deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses—made it one of the most powerful retirement planning tools available to them.'
    }
  ],
  
  retirement: [
    {
      scenario: 'Emily, starting to invest at age 25 vs 35',
      numbers: '$500 monthly investment',
      outcome: '$1.2 million vs $580,000 by age 65',
      timeline: 'more than double the retirement savings',
      fullText: 'By starting to invest $500 monthly at age 25 instead of 35, Emily would accumulate $1.2 million by age 65, compared to $580,000 if she started a decade later—more than double the retirement savings. This 10-year head start demonstrates how time is the most powerful factor in wealth building, with early contributions doing the heavy lifting through compound growth.'
    },
    {
      scenario: 'A retiree with $1 million portfolio',
      numbers: 'withdrawing 4% annually',
      outcome: '$40,000 per year adjusted for inflation',
      timeline: 'with 95% probability of lasting 30 years',
      fullText: 'A retiree calculated that withdrawing 4% annually from a $1 million portfolio would provide $40,000 per year, adjusted for inflation, with a 95% probability of lasting 30 years. This "4% rule" gave them confidence to retire knowing their savings would sustain their lifestyle throughout retirement, even accounting for market volatility and inflation.'
    },
    {
      scenario: 'John, a 50-year-old planning retirement',
      numbers: 'increasing 401(k) contribution from 6% to 10%',
      outcome: 'adding $340,000 to retirement savings',
      timeline: 'by retirement age 65',
      fullText: 'John, a 50-year-old planning retirement, discovered that increasing his 401(k) contribution from 6% to 10% of his $75,000 salary, combined with employer matching and 15 years of compound growth, would add $340,000 to his retirement savings by age 65. This late-career boost helped him catch up on retirement savings and retire comfortably.'
    }
  ],
  
  taxes: [
    {
      scenario: 'A family optimizing tax strategy',
      numbers: 'maxing out HSA, FSA, and retirement accounts',
      outcome: 'reducing taxable income by $35,000',
      timeline: 'saving $8,750 annually in taxes',
      fullText: 'A family optimizing their tax strategy discovered that maxing out their HSA ($7,750), FSA ($3,050), and retirement accounts ($24,200) would reduce their taxable income by $35,000, saving $8,750 annually in taxes at a 25% marginal rate. This strategic use of tax-advantaged accounts effectively gave them a 25% return on every dollar saved before considering investment growth.'
    },
    {
      scenario: 'A freelancer tracking business expenses',
      numbers: 'deducting $12,000 in legitimate business expenses',
      outcome: 'saving $3,000 in taxes',
      timeline: 'by properly categorizing home office and equipment',
      fullText: 'A freelancer tracking business expenses discovered that properly categorizing $12,000 in legitimate business expenses—including home office deduction, equipment, and professional development—saved them $3,000 in taxes. This meticulous record-keeping turned business costs into tax savings, improving their effective tax rate significantly.'
    },
    {
      scenario: 'A couple itemizing deductions',
      numbers: 'charitable contributions and mortgage interest totaling $28,000',
      outcome: 'exceeding standard deduction by $8,000',
      timeline: 'saving $2,400 in taxes',
      fullText: 'A couple itemizing deductions found that their charitable contributions and mortgage interest totaling $28,000 exceeded the standard deduction by $8,000, saving them $2,400 in taxes. This strategic giving and homeownership combination optimized their tax situation while supporting causes they care about.'
    }
  ],
  
  business: [
    {
      scenario: 'A small bakery owner',
      numbers: 'increasing prices by 5%',
      outcome: 'boosting monthly profits by $1,200',
      timeline: 'bringing business from break-even to profitable in 3 months',
      fullText: 'A small bakery owner calculated that increasing prices by just 5% would boost monthly profits by $1,200 without losing customers, bringing the business from break-even to profitable within 3 months. This pricing optimization demonstrated that small adjustments can have significant financial impact when applied across all products.'
    },
    {
      scenario: 'A startup founder',
      numbers: 'reducing customer acquisition costs from $150 to $100',
      outcome: 'requiring 33% improvement in conversion rates',
      timeline: 'achieved through A/B testing landing page',
      fullText: 'After running the numbers, a startup founder realized that reducing customer acquisition costs from $150 to $100 would require a 33% improvement in conversion rates, which they achieved through A/B testing their landing page. This data-driven optimization improved their unit economics and made the business sustainable.'
    },
    {
      scenario: 'A consulting firm',
      numbers: 'raising hourly rate from $125 to $150',
      outcome: 'increasing annual revenue by $50,000',
      timeline: 'while working 20% fewer hours',
      fullText: 'A consulting firm discovered that raising their hourly rate from $125 to $150 would increase annual revenue by $50,000 while working 20% fewer hours, improving work-life balance. This pricing confidence came from understanding their value proposition and market positioning, allowing them to work smarter, not harder.'
    }
  ],
  
  credit: [
    {
      scenario: 'Maria, calculating credit card payoff',
      numbers: '$15,000 debt with 22% APR',
      outcome: '18 years vs 3 years to pay off',
      timeline: 'by increasing monthly payment by $300',
      fullText: 'Maria calculated that paying off her $15,000 credit card debt with a 22% APR would take 18 years making minimum payments, but only 3 years by increasing her monthly payment by $300. This aggressive payoff strategy saved her $12,000 in interest and freed up cash flow much sooner, allowing her to redirect money toward savings goals.'
    },
    {
      scenario: 'A couple improving credit score',
      numbers: 'using cash-back card and paying balances monthly',
      outcome: 'earning $600 annually in rewards',
      timeline: 'while improving credit score by 40 points',
      fullText: 'By switching to a cash-back credit card and paying off balances monthly, a couple earned $600 annually in rewards while improving their credit score by 40 points. This responsible credit usage strategy turned everyday spending into rewards and better loan terms for future major purchases.'
    },
    {
      scenario: 'John, consolidating credit card debt',
      numbers: 'transferring $20,000 to 0% APR balance transfer card',
      outcome: 'saving $4,400 in interest over 18 months',
      timeline: 'while paying off debt faster',
      fullText: 'John consolidated $20,000 in credit card debt by transferring it to a 0% APR balance transfer card, saving $4,400 in interest over 18 months while paying off debt faster. This strategic debt management gave him breathing room to tackle principal without interest eating into payments.'
    }
  ],
  
  insurance: [
    {
      scenario: 'A family comparing insurance options',
      numbers: 'switching to high-deductible plan with HSA',
      outcome: 'saving $2,400 annually in premiums',
      timeline: 'while building tax-free healthcare savings',
      fullText: 'A family comparing insurance options discovered that switching to a high-deductible health plan with an HSA would save $2,400 annually in premiums while building tax-free healthcare savings. This strategic switch improved their long-term financial health while maintaining adequate coverage.'
    },
    {
      scenario: 'A homeowner reviewing coverage',
      numbers: 'increasing home insurance deductible from $500 to $2,500',
      outcome: 'saving $450 annually in premiums',
      timeline: 'while maintaining adequate coverage',
      fullText: 'A homeowner reviewing coverage found that increasing their home insurance deductible from $500 to $2,500 would save $450 annually in premiums while maintaining adequate coverage. This self-insurance strategy made sense given their emergency fund could cover the higher deductible, improving their overall financial efficiency.'
    }
  ],
  
  savings: [
    {
      scenario: 'A recent college graduate',
      numbers: 'following the 50/30/20 rule on $50,000 salary',
      outcome: '$1,000 monthly for savings',
      timeline: 'building $12,000 emergency fund in one year',
      fullText: 'A recent college graduate calculated that following the 50/30/20 rule on a $50,000 salary would allow $1,000 monthly for savings, building a $12,000 emergency fund in just one year. This financial cushion provided peace of mind and the foundation for future financial goals.'
    },
    {
      scenario: 'A couple automating savings',
      numbers: 'automating $500 monthly transfer to high-yield savings',
      outcome: 'building $6,000 emergency fund',
      timeline: 'in one year at 4.5% APY',
      fullText: 'A couple automated a $500 monthly transfer to a high-yield savings account earning 4.5% APY, building a $6,000 emergency fund in one year. This "set it and forget it" approach ensured consistent savings without requiring willpower or decision-making each month.'
    }
  ]
};

/**
 * Generate a topic-based example
 * Maps article topic to relevant category and returns appropriate example
 */
export function generateExampleForTopic(topic: string, category?: string): string {
  // Normalize category
  const normalizedCategory = category?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '';
  
  // Try to find matching category
  let targetCategory = normalizedCategory;
  
  // Map common category variations
  const categoryMap: Record<string, string> = {
    'finance': 'investing',
    'investing': 'investing',
    'investment': 'investing',
    'budget': 'budgeting',
    'budgeting': 'budgeting',
    'health': 'health',
    'fitness': 'health',
    'wellness': 'health',
    'real-estate': 'real-estate',
    'mortgage': 'real-estate',
    'retirement': 'retirement',
    'tax': 'taxes',
    'taxes': 'taxes',
    'business': 'business',
    'startup': 'business',
    'credit': 'credit',
    'debt': 'credit',
    'insurance': 'insurance',
    'savings': 'savings',
    'saving': 'savings'
  };
  
  // Check if we have a direct mapping
  if (categoryMap[normalizedCategory]) {
    targetCategory = categoryMap[normalizedCategory];
  } else {
    // Try to infer from topic
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('invest') || topicLower.includes('stock') || topicLower.includes('portfolio')) {
      targetCategory = 'investing';
    } else if (topicLower.includes('budget') || topicLower.includes('expense') || topicLower.includes('saving')) {
      targetCategory = 'budgeting';
    } else if (topicLower.includes('health') || topicLower.includes('fitness') || topicLower.includes('nutrition')) {
      targetCategory = 'health';
    } else if (topicLower.includes('mortgage') || topicLower.includes('home') || topicLower.includes('real-estate')) {
      targetCategory = 'real-estate';
    } else if (topicLower.includes('retirement') || topicLower.includes('401k') || topicLower.includes('ira')) {
      targetCategory = 'retirement';
    } else if (topicLower.includes('tax')) {
      targetCategory = 'taxes';
    } else if (topicLower.includes('business') || topicLower.includes('profit') || topicLower.includes('revenue')) {
      targetCategory = 'business';
    } else if (topicLower.includes('credit') || topicLower.includes('debt') || topicLower.includes('loan')) {
      targetCategory = 'credit';
    } else if (topicLower.includes('insurance')) {
      targetCategory = 'insurance';
    } else {
      targetCategory = 'investing'; // Default fallback
    }
  }
  
  // Get examples for the category
  const examples = EXAMPLES_BY_CATEGORY[targetCategory];
  
  if (!examples || examples.length === 0) {
    // Fallback to a generic example
    return 'This example demonstrates how the topic applies in real-world scenarios with measurable outcomes and timelines.';
  }
  
  // Use topic hash to deterministically select an example
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = ((hash << 5) - hash) + topic.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % examples.length;
  
  return examples[index].fullText;
}






