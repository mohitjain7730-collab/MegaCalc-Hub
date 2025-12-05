# Article Template Enhancements

This document describes the enhancements made to the dynamic article template to avoid AI-pattern detection and increase uniqueness across all articles.

## Overview

All enhancements use **deterministic randomization** based on the article's topic/slug hash. This ensures:
- Each article has consistent, unique content on every render
- No re-randomization on page loads (stable output)
- Category-based content relevance
- Human-like variations

## Files Created/Modified

### New Files

1. **`src/data/statistics.json`**
   - Contains 50-100 statistics grouped by category
   - Categories: finance, health, business, investing, budgeting, health-fitness, wellness, personal-budgeting, business-startup, cooking-food, home-improvement, technology, general

2. **`src/lib/article-enhancements.ts`**
   - Core utility functions for all enhancements
   - Deterministic hash-based randomization
   - Category mapping and content generation

### Modified Files

1. **`src/app/learning-hub/finance/article-generator.ts`**
   - Updated `ArticleDetail` interface to include optional `topic` and `category` fields
   - Enhanced `generateFullArticleHTML()` with all new features
   - Integrated all enhancement systems

2. **`src/app/article-generator.ts`**
   - Updated with same enhancements for consistency
   - Simplified template version with all features

## Features Implemented

### 1. Dynamic "Unique Example / Case Study" Section

**Function:** `generateExample(topic, category)`

- Generates realistic, human-like examples or mini case studies
- Includes specific numbers and outcomes
- Category-based content (finance, health, business, etc.)
- Injected as "Example Scenario" section with heading variations

**Location in Template:**
- Positioned dynamically (early, middle, or late) based on topic hash
- Uses heading variation system

### 2. Dynamic Statistic Injector

**Function:** `getRandomStatistic(topic, category)`

- Pulls from `statistics.json` (50-100 statistics)
- Category-based selection (automatically maps topic to category)
- Injected as "Quick Stat" section with heading variations

**Location in Template:**
- Positioned dynamically (early, middle, or late) based on topic hash
- Styled with purple accent colors

### 3. Randomized FAQ Count

**Function:** `getRandomizedFAQs(topic, faqs)`

- Each article displays 3-7 FAQs (randomly selected)
- If article has fewer than 7 FAQs, uses available count
- Deterministic selection based on topic hash
- FAQs are shuffled before selection

**Location in Template:**
- Position can be "after-main" or "near-bottom" based on topic hash

### 4. Heading Variations

**Function:** `getHeadingVariation(topic, defaultHeading)`

- 3-4 variations for common section titles:
  - "Key Takeaways" → "Summary Points" / "Main Insights" / "Important Notes" / "Core Concepts"
  - "Why It Matters" → "Why This Topic Matters" / "Why This Is Important" / "Why It's Relevant" / "The Significance"
  - "Frequently Asked Questions" → "Common Questions" / "FAQ" / "Questions & Answers" / "What You Need to Know"
  - And more...

**Location in Template:**
- Applied to all section headings throughout the article

### 5. Optional Micro-Sections

**Function:** `getOptionalSections(topic, category)`

- Randomly includes ONE of:
  - "Common Mistake" (35% chance)
  - "Expert Insight" (35% chance)
  - Nothing (30% chance)
- 2-3 sentence human-like tips
- Category-based content

**Location in Template:**
- Inserted after main content sections, before FAQs

### 6. Expert Commentary

**Function:** `generateExpertCommentary(topic, category)`

- 1-2 sentence "expert tone" comment
- Inserted near the middle of the article
- Varies by topic/category
- Example: "In my experience working with clients on this topic, the biggest mistake I see is..."

**Location in Template:**
- Positioned after one of the main content sections (context, deep dive, or strategy)
- Styled with amber accent colors and italic text

### 7. Shuffled Section Order

**Function:** `getSectionOrder(topic, totalSections)`

- FAQs can appear either:
  - Right after main body content
  - Near the bottom (before author section)
- Example Scenario and Quick Stat sections alternate positions
- All based on deterministic hash of topic/slug

**Location in Template:**
- Section ordering logic integrated throughout template generation

### 8. Category-Based Logic

All new elements use category-based logic:
- Statistics are selected from appropriate category
- Examples are relevant to article topic
- Expert commentary matches the subject matter
- Optional sections are contextually appropriate

**Category Mapping:**
- Automatically infers category from topic/slug keywords
- Falls back to 'general' if no match found
- Can be explicitly provided via `ArticleDetail.category`

### 9. Unchanged Elements

The following remain untouched as requested:
- Internal linking
- Updated-on date
- Author box
- Disclaimer

## Usage

### Basic Usage (Automatic)

```typescript
const article = {
  title: "How to Calculate Mortgage Payments",
  desc: "Learn how to calculate your monthly mortgage payment...",
  intro: "Understanding mortgage payments is crucial...",
  // ... other fields
};

// Topic/category auto-detected from title
const html = generateFullArticleHTML(article);
```

### Advanced Usage (Explicit Topic/Category)

```typescript
const article = {
  title: "How to Calculate Mortgage Payments",
  topic: "mortgage-calculator", // Explicit topic for deterministic hash
  category: "finance", // Explicit category for content selection
  // ... other fields
};

const html = generateFullArticleHTML(article);
```

## Deterministic Randomization

All randomization uses a hash of the topic/slug:

```typescript
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

This ensures:
- Same topic → Same "random" selections
- Different topics → Different selections
- Stable output across page loads

## Integration Points

### In `generateFullArticleHTML()`:

1. **Enhancement Generation** (Lines ~195-218)
   - All enhancement content generated upfront
   - Heading variations determined
   - Section order calculated

2. **Section Building** (Lines ~248+)
   - Sections built in array
   - Dynamic insertion based on `sectionOrder`
   - Expert commentary inserted at calculated position

3. **FAQ Rendering** (Lines ~400+)
   - Randomized FAQs used instead of full list
   - Position determined by `sectionOrder.faqPosition`

## Statistics Data Structure

```json
{
  "finance": ["stat1", "stat2", ...],
  "health": ["stat1", "stat2", ...],
  "business": ["stat1", "stat2", ...],
  // ... more categories
}
```

## Example Output

Each article will have:
- Unique example scenario (positioned early/middle/late)
- Quick stat (positioned early/middle/late)
- Varied section headings
- 3-7 random FAQs (positioned after-main or near-bottom)
- Optional micro-section (30% chance of nothing, 35% each for mistake/insight)
- Expert commentary (positioned in middle sections)
- All based on deterministic hash of article topic

## Testing

To verify enhancements:
1. Generate same article twice → Should get identical output
2. Generate different articles → Should get different variations
3. Check that all sections appear with appropriate styling
4. Verify category-based content relevance

## Future Enhancements

The system is designed to be extensible:
- Add more statistics to `statistics.json`
- Add more example templates to `generateExample()`
- Add more heading variations to `HEADING_VARIATIONS`
- Add more category-specific content

