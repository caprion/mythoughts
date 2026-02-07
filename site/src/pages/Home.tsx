import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  source?: string;
  author?: string;
  date: string;
  tags: string[];
  reading_time?: string;
  content: string;
  visibility?: string;
  type?: string;
}

interface SearchIndex {
  articles: Article[];
  tags: string[];
  stats: {
    total: number;
    bySource: Record<string, number>;
    byType?: Record<string, number>;
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);
  
  const allPublicArticles = index?.articles.filter(a => a.visibility !== 'hidden') || [];
  
  // Separate articles by type
  const technicalArticles = allPublicArticles
    .filter(a => (a.type || 'article') === 'technical')
    .slice(0, 3);
  
  const thoughtsArticles = allPublicArticles
    .filter(a => {
      const articleType = a.type || 'article';
      return articleType === 'thoughts' || articleType === 'article';
    })
    .slice(0, 3);
  
  // Fallback: if no type separation, show recent articles
  const recentArticles = allPublicArticles.slice(0, 6);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
      <Header />
      
      {/* Hero + Stats Combined */}
      <section className="pt-8 pb-6 border-b border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-2">
                Personal Blog
              </p>
              <p className="text-lg text-gray-600 dark:text-stone-300">
                Ideas, reflections, and technical insights on systems at scale.
              </p>
            </div>
            {index && (
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-stone-400 flex-shrink-0">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-stone-200">{index.stats.total}</span> articles
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-stone-200">{index.tags.length}</span> tags
                </div>
                {index.stats.byType && (
                  <>
                    {index.stats.byType.technical > 0 && (
                      <div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{index.stats.byType.technical}</span> technical
                      </div>
                    )}
                    {index.stats.byType.thoughts > 0 && (
                      <div>
                        <span className="font-semibold text-accent-600 dark:text-accent-400">{index.stats.byType.thoughts}</span> thoughts
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {!loading && index && (
            <div className="max-w-2xl">
              <SearchBar 
                articles={index.articles}
                onSelect={(slug) => navigate(`/article/${slug}`)}
                placeholder="Search articles, topics, ideas..."
                large
              />
            </div>
          )}
        </div>
      </section>
      
      {/* Recent Articles - Show separate sections if we have both types, otherwise unified */}
      {!loading && (technicalArticles.length > 0 || thoughtsArticles.length > 0) ? (
        <>
          {/* Technical Articles */}
          {technicalArticles.length > 0 && (
            <section className="py-8">
              <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl md:text-2xl font-semibold text-gray-900 dark:text-stone-100">
                    Technical Insights
                  </h2>
                  <button 
                    onClick={() => navigate('/browse?type=technical')}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {technicalArticles.map(article => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Thoughts Articles */}
          {thoughtsArticles.length > 0 && (
            <section className="py-8 border-t border-gray-200 dark:border-stone-800">
              <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl md:text-2xl font-semibold text-gray-900 dark:text-stone-100">
                    Thoughts & Reflections
                  </h2>
                  <button 
                    onClick={() => navigate('/browse?type=thoughts')}
                    className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {thoughtsArticles.map(article => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-gray-900 dark:text-stone-100">
                Recent Articles
              </h2>
              <button 
                onClick={() => navigate('/browse')}
                className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300"
              >
                View all →
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 bg-white dark:bg-stone-800 rounded-xl border border-gray-100 dark:border-stone-700 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-100 dark:bg-stone-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-stone-700 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="mb-4">No articles yet.</p>
                <p className="text-sm">Add URLs to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">input/urls.txt</code> and run <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run scrape</code></p>
              </div>
            )}
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
}
