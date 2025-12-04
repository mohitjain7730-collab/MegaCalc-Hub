'server-only';

// Finance Authors
const FINANCE_AUTHORS = [
  { 
    name: "Sarah Jenkins, CFA",
    role: "Wealth Management Specialist",
    bio: "Sarah is a Chartered Financial Analyst with over 12 years of experience in wealth management. She specializes in cash flow planning for homeowners and small business owners." 
  },
  { 
    name: "Michael Ross, CFP",
    role: "Certified Financial Planner",
    bio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications." 
  },
  { 
    name: "Emily Carter",
    role: "Personal Finance Journalist",
    bio: "Emily is a personal finance journalist whose work focuses on behavioral economics and overcoming financial anxiety. She advocates for automated, rules-based investing." 
  },
  { 
    name: "David Thompson, CPA",
    role: "Certified Public Accountant",
    bio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions." 
  },
  { 
    name: "Jessica Martinez",
    role: "Investment Strategist",
    bio: "Jessica is an investment strategist with a focus on portfolio construction and tax optimization. She advises clients on how to minimize tax drag in taxable brokerage accounts." 
  },
  { 
    name: "Robert Hughes",
    role: "Real Estate Investor",
    bio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash." 
  },
  { 
    name: "Christopher Baker",
    role: "Hedge Fund Analyst",
    bio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks." 
  },
  { 
    name: "Jennifer Wu",
    role: "Family Finance Expert",
    bio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization." 
  },
  { 
    name: "Daniel Evans",
    role: "Retirement Transition Specialist",
    bio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk." 
  },
  { 
    name: "Amanda Lee",
    role: "Behavioral Finance Expert",
    bio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning." 
  }
];

// Health/Nutrition Authors
const HEALTH_AUTHORS = [
  { name: 'Dr. Marcus Thorne', credentials: 'MD, Endocrinology', bio: 'Dr. Thorne is a board-certified endocrinologist specializing in metabolic disorders and nutritional biochemistry with over 15 years of clinical practice in Boston.' },
  { name: 'Sarah Jenkins', credentials: 'MS, RD, CSSD', bio: 'Sarah is a Registered Dietitian and Board Certified Specialist in Sports Dietetics. She consults for Olympic athletes and focuses on performance nutrition.' },
  { name: 'Dr. Emily Carter', credentials: 'PhD, Nutritional Science', bio: 'With a PhD from Stanford, Dr. Carter researchers the impact of micronutrients on cognitive longevity and has published over 30 peer-reviewed papers.' },
  { name: 'James Wilson', credentials: 'MSc, Clinical Nutrition', bio: 'James specializes in gut health and autoimmune dietary protocols. He runs a private practice in Seattle helping patients navigate food sensitivities.' },
  { name: 'Dr. Linda Wei', credentials: 'MD, MPH', bio: 'Dr. Wei combines internal medicine with public health policy. She advocates for evidence-based dietary guidelines to combat chronic disease.' },
  { name: 'Robert H. Davidson', credentials: 'RDN, LDN', bio: 'Robert is a clinical dietitian at a major teaching hospital in Chicago, focusing on cardiac rehabilitation and plant-centric diets.' },
  { name: 'Jessica Miller', credentials: 'FNP-BC, Holistic Health', bio: 'Jessica is a Family Nurse Practitioner who integrates functional medicine principles with conventional care to treat metabolic syndrome.' },
  { name: 'Dr. Alan Grant', credentials: 'PhD, Exercise Physiology', bio: 'Dr. Grant studies the intersection of exercise metabolism and fueling strategies. He is a professor at a leading research university.' },
  { name: 'Maria Gonzalez', credentials: 'MS, Integrative Nutrition', bio: 'Maria is a nutritionist and author specializing in the Mediterranean diet and its effects on longevity and inflammation.' },
  { name: 'David Kim', credentials: 'PharmD, CNS', bio: 'David is a Clinical Nutrition Specialist and Pharmacist who bridges the gap between medication management and nutritional interventions.' }
];

export interface Author {
  name: string;
  bio: string;
  credentials?: string;
  role?: string; // Professional role/title
}

// Helper to assign a consistent author based on title hash
function getDeterministicAuthor(title: string, category: 'finance' | 'health'): Author {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const authors = category === 'finance' ? FINANCE_AUTHORS : HEALTH_AUTHORS;
  const index = Math.abs(hash) % authors.length;
  const author = authors[index];
  
  // Convert health author format to unified format
  if (category === 'health' && 'credentials' in author) {
    return {
      name: author.name,
      bio: author.bio,
      credentials: author.credentials,
      role: author.credentials // Use credentials as role for health authors
    };
  }
  
  // Finance authors already have role
  return author;
}

// Helper to assign a date between Sept 1 2025 and Nov 25 2025
export function getDeterministicDate(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Range approx 85 days
  const daysOffset = Math.abs(hash) % 85; 
  const baseDate = new Date('2025-09-01');
  baseDate.setDate(baseDate.getDate() + daysOffset);
  
  return baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getAuthorForArticle(title: string, category: string, providedAuthor?: string): Author {
  // If author is provided, try to find them
  if (providedAuthor) {
    const categoryType = category.includes('Finance') ? 'finance' : 'health';
    const authors = categoryType === 'finance' ? FINANCE_AUTHORS : HEALTH_AUTHORS;
    const foundAuthor = authors.find(a => 
      a.name.toLowerCase().includes(providedAuthor.toLowerCase()) ||
      providedAuthor.toLowerCase().includes(a.name.toLowerCase())
    );
    
    if (foundAuthor) {
      if (categoryType === 'health' && 'credentials' in foundAuthor) {
        return {
          name: foundAuthor.name,
          bio: foundAuthor.bio,
          credentials: foundAuthor.credentials
        };
      }
      return foundAuthor;
    }
  }
  
  // Otherwise, deterministically assign based on title
  const categoryType = category.includes('Finance') ? 'finance' : 'health';
  return getDeterministicAuthor(title, categoryType);
}

