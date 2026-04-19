import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../api/axios';
import getImageUrl from '../utils/getImageUrl';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        setError('Listing not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  if (error) return (
    <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <div className="bg-red-50 text-red-700 p-6 rounded-xl mb-6">
        <p>{error}</p>
      </div>
      <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
        Back to Home
      </button>
    </div>
  );

  const sanitizedDescription = DOMPurify.sanitize(listing.description);
  const canContactSeller = Boolean(listing.owner?.email);
  const handleContactSeller = () => {
    if (!canContactSeller) return;
    const subject = encodeURIComponent(`CampusTrade inquiry: ${listing.title}`);
    const body = encodeURIComponent(`Hi ${listing.owner.displayName},\n\nI am interested in your listing: "${listing.title}".`);
    window.location.href = `mailto:${listing.owner.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-[calc(100vh-64px)]">
      <button 
        onClick={() => navigate(-1)} 
        className="text-slate-500 hover:text-slate-700 mb-6 flex items-center text-sm font-medium"
      >
        ← Back
      </button>
      
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-slate-50 flex items-center justify-center min-h-[300px]">
          {listing.imageUrl && !imageLoadFailed ? (
            <img 
              src={getImageUrl(listing.imageUrl)} 
              alt={listing.title} 
              className="w-full h-full object-cover max-h-[500px]" 
              onError={() => setImageLoadFailed(true)}
            />
          ) : (
            <div className="text-slate-400 p-12 text-center">
              <span className="block text-4xl mb-2">📷</span>
              <p>No image provided</p>
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {listing.category}
              </span>
              <span className="text-sm text-slate-400">
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-3xl font-syne font-bold text-slate-900 mb-4">{listing.title}</h1>
            <p className="text-2xl font-bold text-blue-600 mb-6">Rs {listing.price.toLocaleString()}</p>
            
            <div className="border-t border-slate-100 pt-6 mb-6">
              <h3 className="text-sm font-medium text-slate-900 mb-2">Description</h3>
              <div 
                className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100 mt-6 md:mt-0">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Seller</p>
              <p className="font-medium text-slate-900">{listing.owner?.displayName}</p>
            </div>
            <button
              onClick={handleContactSeller}
              disabled={!canContactSeller}
              className={`px-6 py-2 rounded-md font-medium transition-colors shadow-sm ${canContactSeller ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
