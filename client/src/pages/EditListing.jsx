import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        // Object-level permission check
        if (res.data.owner.id !== user.id) {
          setPermissionError(true);
        } else {
          setFormData({
            title: res.data.title,
            description: res.data.description,
            price: res.data.price
          });
        }
      } catch (err) {
        setError('Failed to fetch listing details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, user.id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.patch(`/listings/${id}`, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price)
      });
      navigate('/my-listings');
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.error || 'Failed to update listing.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  if (permissionError) return (
    <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You do not have permission to edit this listing.</p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-64px)]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-syne font-bold mb-8 text-slate-900">Edit Listing</h1>
        
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={100}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (PKR)</label>
            <input
              name="price"
              type="number"
              required
              min="0.01"
              step="any"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="mr-4 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
