import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, Pill } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/medicines?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-neutral-50">
      {/* Big 404 */}
      <div className="relative mb-8">
        <div className="text-[10rem] md:text-[14rem] font-black text-primary-100 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center shadow-glow">
            <Pill className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-3">
        Page Not Found
      </h1>
      <p className="text-neutral-500 max-w-md text-base mb-8 leading-relaxed">
        The page you are looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      {/* Search box */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 w-full max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search MediFind..."
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary btn-md px-4">
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-md flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link to="/" className="btn-primary btn-md flex items-center gap-2">
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
        <Link to="/medicines" className="btn-secondary btn-md flex items-center gap-2">
          <Pill className="w-4 h-4" /> Browse Medicines
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
