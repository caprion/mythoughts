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
    'technical': { label: 'Technical', className: 'bg-blue-100 text-blue-700' },
    'thoughts': { label: 'Thoughts', className: 'bg-accent-100 text-accent-700' },
    'article': { label: 'Article', className: 'bg-gray-100 text-gray-700' },
  };
  const typeInfo = typeMap[articleType] || typeMap['article'];
  
  return (
    <Link 
      to={`/article/${article.slug}`}
      className="block p-6 bg-white rounded-xl border border-gray-100 hover:border-accent-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3 mb-2">
        <h3 className="flex-1 font-serif text-xl font-semibold text-gray-900 group-hover:text-accent-600 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {articleType !== 'article' && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.className}`}>
              {typeInfo.label}
            </span>
          )}
          {isDraft && (
            <span className="text-amber-500 text-lg" title="Early Draft">
              ✏️
            </span>
          )}
        </div>
      </div>
      {isDraft && article.wip_notes && (
        <p className="text-amber-700 text-xs italic mb-2">
          {article.wip_notes}
        </p>
      )}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {article.source && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
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
