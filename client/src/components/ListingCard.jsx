import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import getImageUrl from '../utils/getImageUrl';

export default function ListingCard({ id, title, description, price, category, imageUrl, owner }) {
  // XSS Prevention: DOMPurify sanitizes user-generated HTML before rendering
  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <Link to={`/listings/${id}`} className="group block h-full">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {imageUrl ? (
          <>
            <img
              src={getImageUrl(imageUrl)}
              alt={title}
              className="h-48 w-full object-cover group-hover:opacity-90 transition-opacity"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="h-48 w-full bg-slate-100 items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors hidden">
              <span className="text-sm">No Image</span>
            </div>
          </>
        ) : (
          <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-syne font-bold text-slate-900 line-clamp-1 flex-grow pr-2">{title}</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full shrink-0">
              {category}
            </span>
          </div>
          
          <div 
            className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
          
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xl font-bold text-slate-900">Rs {price.toLocaleString()}</span>
            <span className="text-xs text-slate-500">by {owner?.displayName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
