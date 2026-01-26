import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
  status?: string;
}

interface SearchIndex {
  articles: Article[];
}

export default function AILab() {
  const navigate = useNavigate();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch AI Lab index (contains only hidden articles)
    fetch('/ai-lab-index.json')
      .then(res => res.json())
      .then(data => {
        setAllArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);
  
  // All articles from ai-lab-index are already filtered to hidden only
  const hiddenArticles = allArticles;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔬</span>
            <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-stone-100">
              AI Lab
            </h1>
          </div>
          <p className="text-gray-600 dark:text-stone-400">
            Private brainstorms and AI-assisted explorations. For personal reference only.
          </p>
        </div>
        
        <div className="mb-6 text-sm text-gray-500 dark:text-stone-400">
          {loading ? 'Loading...' : `${hiddenArticles.length} brainstorm${hiddenArticles.length !== 1 ? 's' : ''} found`}
        </div>
        
        {/* Articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 bg-white dark:bg-stone-800 rounded-xl border border-gray-100 dark:border-stone-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 dark:bg-stone-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 dark:bg-stone-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : hiddenArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiddenArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-stone-400 bg-white dark:bg-stone-800 rounded-xl border border-gray-100 dark:border-stone-700">
            <p className="mb-2">No hidden brainstorms yet.</p>
            <p className="text-sm">Add articles with <code className="px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded">visibility: hidden</code> to see them here.</p>
          </div>
        )}
        
        {!loading && hiddenArticles.length > 0 && (
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span>💡</span>
              <div>
                <strong>Note:</strong> These articles are excluded from public search and browse pages, 
                but remain accessible via direct URLs. This page is not linked in navigation.
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
