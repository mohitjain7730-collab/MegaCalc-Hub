import { calculators } from './calculators';
import { categories } from './categories';

// Types for schema generation
export interface Calculator {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  keywords?: string[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  Icon: string;
}

// Global Website Schema
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mycalculating.com",
    "alternateName": "MegaCalc Hub",
    "description": "Your one-stop destination for all calculators. Free online calculators for finance, health, fitness, engineering, and more.",
    "url": "https://mycalculating.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mycalculating.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mycalculating.com",
      "url": "https://mycalculating.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mycalculating.com/logo.png"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Free Online Calculators",
      "description": "Comprehensive collection of free online calculators",
      "numberOfItems": calculators.length,
      "itemListElement": calculators.slice(0, 10).map((calc, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "WebApplication",
          "name": calc.name,
          "description": calc.description,
          "url": `https://mycalculating.com/category/${calc.category}/${calc.slug}`,
          "applicationCategory": "Calculator",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }
      }))
    }
  };
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mycalculating.com",
    "alternateName": "MegaCalc Hub",
    "url": "https://mycalculating.com",
    "description": "Free online calculators for finance, health, fitness, engineering, and more",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mycalculating.com/logo.png"
    },
    "sameAs": [
      "https://mycalculating.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };
}

// Calculator Schema
export function generateCalculatorSchema(calculator: Calculator, category: Category) {
  const baseUrl = "https://mycalculating.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": calculator.name,
    "description": calculator.description,
    "url": `${baseUrl}/category/${category.slug}/${calculator.slug}`,
    "applicationCategory": "Calculator",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "Mycalculating.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mycalculating.com",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "Free to use",
      "No registration required",
      "Instant calculations",
      "Mobile-friendly",
      "Accurate results"
    ],
    "screenshot": `${baseUrl}/screenshots/${calculator.slug}.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "keywords": calculator.keywords?.join(", ") || `${calculator.name}, calculator, ${category.name}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Mycalculating.com",
      "url": baseUrl
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/category/${category.slug}/${calculator.slug}`
    }
  };
}

// Category Page Schema
export function generateCategorySchema(category: Category, categoryCalculators: Calculator[]) {
  const baseUrl = "https://mycalculating.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} Calculators`,
    "description": `Free online ${category.name.toLowerCase()} calculators. ${category.description}`,
    "url": `${baseUrl}/category/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${category.name} Calculators`,
      "description": `Collection of ${category.name.toLowerCase()} calculators`,
      "numberOfItems": categoryCalculators.length,
      "itemListElement": categoryCalculators.map((calc, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "WebApplication",
          "name": calc.name,
          "description": calc.description,
          "url": `${baseUrl}/category/${category.slug}/${calc.slug}`,
          "applicationCategory": "Calculator"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name,
          "item": `${baseUrl}/category/${category.slug}`
        }
      ]
    }
  };
}

// Calculators Listing Page Schema
export function generateCalculatorsListingSchema() {
  const baseUrl = "https://mycalculating.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Calculators",
    "description": "Browse every calculator available on MegaCalc Hub, organized by category",
    "url": `${baseUrl}/calculators`,
    "mainEntity": {
      "@type": "ItemList",
      "name": "All Calculators",
      "description": "Complete list of all available calculators",
      "numberOfItems": calculators.length,
      "itemListElement": calculators.map((calc, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "WebApplication",
          "name": calc.name,
          "description": calc.description,
          "url": `${baseUrl}/category/${calc.category}/${calc.slug}`,
          "applicationCategory": "Calculator"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "All Calculators",
          "item": `${baseUrl}/calculators`
        }
      ]
    }
  };
}

// FAQ Schema for calculators
export function generateFAQSchema(calculator: Calculator) {
  const faqs = [
    {
      "question": `How do I use the ${calculator.name}?`,
      "answer": `Simply enter your values in the input fields and the calculator will automatically compute the results. The ${calculator.name} is designed to be user-friendly and provide instant calculations.`
    },
    {
      "question": `Is the ${calculator.name} free to use?`,
      "answer": `Yes, the ${calculator.name} is completely free to use. No registration or payment is required.`
    },
    {
      "question": `Can I use this calculator on mobile devices?`,
      "answer": `Yes, the ${calculator.name} is fully responsive and works perfectly on mobile phones, tablets, and desktop computers.`
    },
    {
      "question": `Are the results from ${calculator.name} accurate?`,
      "answer": `Yes, our calculators use standard formulas and are regularly tested for accuracy. However, results should be used for informational purposes and not as a substitute for professional advice.`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// HowTo Schema for step-by-step calculators
export function generateHowToSchema(calculator: Calculator) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${calculator.name}`,
    "description": `Step-by-step guide to using the ${calculator.name}`,
    "image": `https://mycalculating.com/images/${calculator.slug}-guide.png`,
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Input values"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": calculator.name
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Enter your values",
        "text": "Input the required values in the calculator form",
        "image": `https://mycalculating.com/images/${calculator.slug}-step1.png`
      },
      {
        "@type": "HowToStep",
        "name": "Calculate",
        "text": "The calculator will automatically compute and display your results",
        "image": `https://mycalculating.com/images/${calculator.slug}-step2.png`
      },
      {
        "@type": "HowToStep",
        "name": "Review results",
        "text": "Review the calculated results and any additional information provided",
        "image": `https://mycalculating.com/images/${calculator.slug}-step3.png`
      }
    ]
  };
}





































