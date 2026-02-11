import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import Tag from '../components/Tag';

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
  status?: string;
  visibility?: string;
  wip_notes?: string;
  type?: string;
}

interface SearchIndex {
  articles: Article[];
  tags: string[];
  stats: {
    total: number;
    byTag: Record<string, number>;
    byType?: Record<string, number>;
  };
}

type ArticleType = 'all' | 'technical' | 'thoughts';

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideDrafts, setHideDrafts] = useState(false);
  
  const selectedTag = searchParams.get('tag') || '';
  const selectedType = (searchParams.get('type') || 'all') as ArticleType;
  
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
  
  const filteredArticles = useMemo(() => {
    if (!index) return [];
    let articles = index.articles;
    
    // Filter out hidden articles (always)
    articles = articles.filter(a => a.visibility !== 'hidden');
    
    // Filter by type
    if (selectedType !== 'all') {
      const typeMap: Record<string, ArticleType> = {
        'technical': 'technical',
        'thoughts': 'thoughts',
        'article': 'thoughts', // Default old articles to thoughts
      };
      articles = articles.filter(a => {
        const articleType = typeMap[a.type || 'article'] || 'thoughts';
        return articleType === selectedType;
      });
    }
    
    // Filter by tag
    if (selectedTag) {
      articles = articles.filter(a => a.tags.includes(selectedTag));
    }
    
    // Filter drafts if requested
    if (hideDrafts) {
      articles = articles.filter(a => a.status !== 'draft');
    }
    
    return articles;
  }, [index, selectedType, selectedTag, hideDrafts]);
  
  const handleTypeChange = (type: ArticleType) => {
    if (type === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', type);
    }
    setSearchParams(searchParams);
  };
  
  const handleTagClick = (tag: string) => {
    if (tag === selectedTag) {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };
  
  // Get popular tags (top 15 by count)
  const popularTags = useMemo(() => {
    if (!index) return [];
    return Object.entries(index.stats.byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));
  }, [index]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900">
            Browse Articles
          </h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hideDrafts}
                onChange={(e) => setHideDrafts(e.target.checked)}
                className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
              />
              Hide Drafts
            </label>
            <span className="text-sm text-gray-500">
              {filteredArticles.length} articles
            </span>
          </div>
        </div>
        
        {/* Type Filter Tabs */}
        <div className="mb-4 flex gap-2 border-b border-gray-200">
          {(['all', 'technical', 'thoughts'] as ArticleType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                selectedType === type
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'all' ? 'All' : type === 'technical' ? 'Technical' : 'Thoughts'}
              {index?.stats.byType && index.stats.byType[type] !== undefined && (
                <span className="ml-2 text-xs opacity-70">({index.stats.byType[type]})</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Search */}
        {index && (
          <div className="mb-6">
            <SearchBar 
              articles={index.articles}
              onSelect={(slug) => navigate(`/article/${slug}`)}
              placeholder="Search..."
            />
          </div>
        )}
        
        {/* Tags */}
        {popularTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }) => (
                <Tag 
                  key={tag}
                  tag={tag}
                  count={count}
                  selected={tag === selectedTag}
                  onClick={() => handleTagClick(tag)}
                />
              ))}
              {selectedTag && (
                <button 
                  onClick={() => handleTagClick(selectedTag)}
                  className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No articles found{selectedTag ? ` for tag "${selectedTag}"` : ''}.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
