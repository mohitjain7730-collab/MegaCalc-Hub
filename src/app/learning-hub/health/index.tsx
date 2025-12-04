import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { getAuthorForArticle, Article } from './article';
import { nutritionArticles } from './nutrition-diet/nutrition1';
import { nutritionArticlesPart2 } from './nutrition-diet/nutrition2';
import { nutritionArticlesPart3 } from './nutrition-diet/nutrition3';
import { nutritionArticlesPart4 } from './nutrition-diet/nutrition4';
import { nutritionArticlesPart5 } from './nutrition-diet/nutrition5';

// --- Icons ---
const Icons = {
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  ),
  Heart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  Apple: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
  ),
  Scale: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  ),
  Dumbbell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Clipboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
  ),
  Infinity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
  ),
  Flower: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m3 4.5a4.5 4.5 0 1 0 4.5-4.5M12 16.5V15m4.5-3H15"/></svg>
  ),
  LightBulb: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
  ),
};

// --- Data ---
const subCategories = [
  { id: 1, title: 'Nutrition & Diet', icon: Icons.Apple, color: 'bg-green-100 text-green-600' },
  { id: 2, title: 'Weight & Metabolism', icon: Icons.Scale, color: 'bg-orange-100 text-orange-600' },
  { id: 3, title: 'Fitness & Sports', icon: Icons.Dumbbell, color: 'bg-blue-100 text-blue-600' },
  { id: 4, title: 'Body Composition', icon: Icons.User, color: 'bg-purple-100 text-purple-600' },
  { id: 5, title: "Women's Health", icon: Icons.Flower, color: 'bg-pink-100 text-pink-600' },
  { id: 6, title: 'Medical Risk Scores', icon: Icons.Clipboard, color: 'bg-red-100 text-red-600' },
  { id: 7, title: 'Mental Health & Sleep', icon: Icons.Brain, color: 'bg-indigo-100 text-indigo-600' },
  { id: 8, title: 'Longevity & Wellness', icon: Icons.Infinity, color: 'bg-teal-100 text-teal-600' },
];

// Combine all articles
const articles: Article[] = [
  ...nutritionArticles,
  ...nutritionArticlesPart2,
  ...nutritionArticlesPart3,
  ...nutritionArticlesPart4,
  ...nutritionArticlesPart5
];

// --- Components ---

interface CardProps {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
  colorClass: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon: Icon, onClick, colorClass, className = '' }) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col h-full justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass || 'bg-slate-100 text-slate-600'}`}>
          <Icon />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{title}</h3>
          <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
            <Icons.ChevronRight />
          </div>
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  onBack?: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onBack, title }) => (
  <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
      {onBack && (
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Go back"
        >
          <Icons.ArrowLeft />
        </button>
      )}
      <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{title}</h1>
    </div>
  </header>
);

interface CategoryViewProps {
  category: (typeof subCategories)[number];
  onArticleClick: (article: Article) => void;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, onArticleClick, onBack }) => {
  // Filter articles for this category
  const categoryArticles = articles.filter(a => a.categoryId === category.id);
  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={category.title} onBack={onBack} />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8 flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${category.color}`}>
             <Icon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
            <p className="text-slate-500">{categoryArticles.length} Articles available</p>
          </div>
        </div>

        <div className="space-y-4">
          {categoryArticles.map(article => {
            const author = getAuthorForArticle(article.id);
            return (
              <div 
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium tracking-wide uppercase">
                      Analysis
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{author.name}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-emerald-500 transition-colors mt-2">
                     <Icons.ChevronRight />
                  </div>
                </div>
              </div>
            );
          })}
          
          {categoryArticles.length === 0 && (
             <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                <p className="text-slate-400">Articles coming soon.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ArticleView = ({ article, onBack }: { article: Article, onBack: () => void }) => {
  const author = useMemo(() => getAuthorForArticle(article.id), [article.id]);
  const content = article.content;

  // Generate JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "author": {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.credentials,
      "description": author.bio
    },
    "description": content.intro,
    "articleBody": content.sections.map(s => s.title + ": " + s.body).join(' '),
    "publisher": {
      "@type": "Organization",
      "name": "Health Dashboard",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png" // Placeholder
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Inject Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header title="" onBack={onBack} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                {author.name.charAt(0)}
             </div>
             <div>
                <div className="font-semibold text-slate-900">{author.name}, {author.credentials}</div>
                <div className="text-sm text-slate-500">Evidence Based • {article.readTime}</div>
             </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-emerald-500 pl-4 italic">
            {content.intro}
          </p>
        </header>

        {/* Key Takeaways Box */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 mb-10 border border-slate-100">
           <div className="flex items-center space-x-2 mb-4 text-emerald-700 font-bold uppercase tracking-wider text-sm">
              <Icons.LightBulb />
              <span>Key Takeaways</span>
           </div>
           <ul className="space-y-3">
              {content.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start">
                   <span className="mr-3 text-emerald-500 font-bold">•</span>
                   <span className="text-slate-800 leading-relaxed font-medium">{point}</span>
                </li>
              ))}
           </ul>
        </div>

        {/* Why It Matters */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why It Matters (US Context)</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            {content.whyItMatters}
          </p>
        </section>

        {/* Detailed Sections */}
        <div className="space-y-10 mb-12">
           {content.sections.map((section, idx) => (
             <section key={idx}>
               <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h2>
               <p className="text-lg text-slate-700 leading-relaxed">
                 {section.body}
               </p>
             </section>
           ))}
        </div>

        {/* Workflow Steps */}
        <section className="mb-12">
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Actionable Workflow</h2>
           <div className="space-y-4">
              {content.workflow.map((step) => (
                <div key={step.step} className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mt-1 mr-4">
                      {step.step}
                   </div>
                   <div className="bg-white border border-slate-200 rounded-xl p-5 w-full shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-600">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
           <div className="space-y-6 divide-y divide-slate-100">
              {content.faq.map((item, idx) => (
                <div key={idx} className="pt-6 first:pt-0">
                   <p className="font-bold text-emerald-800 mb-2 flex items-start">
                      <span className="mr-2 text-emerald-400">?</span> 
                      {item.q}
                   </p>
                   <p className="text-slate-700 pl-6 leading-relaxed">
                      {item.a}
                   </p>
                </div>
              ))}
           </div>
        </section>

        {/* Author Footer */}
        <footer className="border-t border-slate-200 pt-8 mt-12">
           <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                 {author.name.charAt(0)}
              </div>
              <div>
                 <div className="font-bold text-slate-900 text-lg">{author.name}, {author.credentials}</div>
                 <p className="text-slate-600 mt-2 leading-relaxed">
                    {author.bio}
                 </p>
              </div>
           </div>
        </footer>

      </article>
    </div>
  );
};

const App = () => {
  // State machine for navigation
  const [viewState, setViewState] = useState<{
    view: 'home' | 'health' | 'category' | 'article';
    categoryId?: number;
    articleId?: number;
  }>({ view: 'home' });

  // Navigation handlers
  const goHome = () => setViewState({ view: 'home' });
  const goHealth = () => setViewState({ view: 'health' });
  const goCategory = (id: number) => setViewState({ view: 'category', categoryId: id });
  const goArticle = (id: number) => setViewState({ ...viewState, view: 'article', articleId: id });

  // Helpers to get current objects
  const currentCategory = subCategories.find(c => c.id === viewState.categoryId);
  const currentArticle = articles.find(a => a.id === viewState.articleId);

  // --- Views ---

  const HomeView = () => (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="text-slate-500">Select a category to explore your wellness journey.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {/* Main Health Card */}
        <div
          onClick={goHealth}
          className="cursor-pointer bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Health</h2>
              <p className="text-slate-500 text-sm mt-1">8 Categories</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
             <Icons.ChevronRight />
          </div>
        </div>

        {/* Placeholder for future top-level categories */}
        <div className="opacity-50 pointer-events-none grayscale filter blur-[1px]">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Icons.Activity />
                     </div>
                     <span className="font-semibold text-lg">Activity</span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );

  const HealthView = () => (
    <div className="min-h-screen bg-gray-50">
      <Header title="Health Categories" onBack={goHome} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <p className="text-slate-500">Manage and track your comprehensive health metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subCategories.map((sub) => (
            <Card
              key={sub.id}
              title={sub.title}
              icon={sub.icon}
              colorClass={sub.color}
              onClick={() => {
                if (sub.title === 'Nutrition & Diet') {
                  goCategory(sub.id);
                } else {
                  console.log(`Clicked ${sub.title} - Content not implemented`);
                }
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <>
      {viewState.view === 'home' && <HomeView />}
      {viewState.view === 'health' && <HealthView />}
      {viewState.view === 'category' && currentCategory && (
        <CategoryView 
          category={currentCategory} 
          onBack={goHealth} 
          onArticleClick={(a) => goArticle(a.id)}
        />
      )}
      {viewState.view === 'article' && currentArticle && (
        <ArticleView 
          article={currentArticle} 
          onBack={() => goCategory(currentArticle.categoryId)} 
        />
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);