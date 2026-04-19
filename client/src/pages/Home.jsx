import { useState, useEffect } from 'react';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        setListings(res.data);
      } catch (err) {
        setError('Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-syne font-bold mb-8 text-slate-900">Latest Finds</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-lg overflow-hidden h-80">
              <div className="bg-slate-200 h-48 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-syne font-bold mb-8 text-slate-900">Latest Finds</h1>
      
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500 text-lg">No listings available yet. Be the first to sell something!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      )}
    </div>
  );
}
