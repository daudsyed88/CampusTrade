import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import getImageUrl from '../utils/getImageUrl';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await api.get('/listings/my/listings');
        setListings(res.data);
      } catch (err) {
        setError('Failed to fetch your listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading your listings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-syne font-bold text-slate-900">My Listings</h1>
        <Link to="/create" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium text-white transition-colors">
          Post New Item
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500 text-lg mb-4">You have not posted anything yet.</p>
          <Link to="/create" className="text-blue-600 font-medium hover:underline">Create your first listing</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {listings.map(listing => (
              <li key={listing.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  {listing.imageUrl ? (
                    <img
                      src={getImageUrl(listing.imageUrl)}
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">No Img</div>
                  )}
                  {listing.imageUrl && (
                    <div className="w-16 h-16 bg-slate-100 rounded-md items-center justify-center text-xs text-slate-400 hidden">No Img</div>
                  )}
                  <div>
                    <Link to={`/listings/${listing.id}`} className="font-syne font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                      {listing.title}
                    </Link>
                    <div className="flex items-center mt-1 text-sm text-slate-500 space-x-3">
                      <span className="font-semibold text-slate-700">Rs {listing.price.toLocaleString()}</span>
                      <span>•</span>
                      <span>{listing.category}</span>
                      <span>•</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/edit/${listing.id}`)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(listing.id)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Listing?</h3>
            <p className="text-slate-500 mb-6 text-sm">Are you sure you want to remove this listing? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
