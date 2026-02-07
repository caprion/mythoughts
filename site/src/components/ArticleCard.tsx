import { Link } from 'react-router-dom';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  source?: string;
  author?: string;
  date: string;
  tags: string[];
  reading_time?: string;
  status?: string;
  wip_notes?: string;
  type?: string;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const isDraft = article.status === 'draft';
  const articleType = article.type || 'article';
  const typeMap: Record<string, { label: string; className: string }> = {
    'technical': { label: 'Technical', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    'thoughts': { label: 'Thoughts', className: 'bg-accent-100 dark:bg-stone-700 text-accent-700 dark:text-accent-300' },
    'article': { label: 'Article', className: 'bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300' },
  };
  const typeInfo = typeMap[articleType] || typeMap['article'];
  
  return (
    <Link 
      to={`/article/${article.slug}`}
      className="block p-6 bg-white dark:bg-stone-800 rounded-xl border border-gray-100 dark:border-stone-700 hover:border-accent-200 dark:hover:border-accent-600 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all group"
    >
      <div className="flex items-start gap-3 mb-2">
        <h3 className="flex-1 font-serif text-xl font-semibold text-gray-900 dark:text-stone-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {articleType !== 'article' && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.className}`}>
              {typeInfo.label}
            </span>
          )}
          {isDraft && (
            <span className="text-amber-500 dark:text-amber-400 text-lg" title="Early Draft">
              ✏️
            </span>
          )}
        </div>
      </div>
      {isDraft && article.wip_notes && (
        <p className="text-amber-700 dark:text-amber-400 text-xs italic mb-2">
          {article.wip_notes}
        </p>
      )}
      <p className="text-gray-600 dark:text-stone-300 text-sm mb-4 line-clamp-2">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-stone-500">
        <div className="flex items-center gap-3">
          {article.source && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 rounded-full">
              {article.source}
            </span>
          )}
          {article.reading_time && (
            <span>{article.reading_time}</span>
          )}
        </div>
        <span>{article.date}</span>
      </div>
    </Link>
  );
}
