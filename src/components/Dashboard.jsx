import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { FaRegNewspaper } from "react-icons/fa6";

export default function Dashboard() {
  const [openPhishTrends, setOpenPhishTrends] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState({ trends: false, news: false });
  const [error, setError] = useState({ trends: '', news: '' });

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch OpenPhish trends
  const fetchOpenPhishTrends = async () => {
    setLoading(prev => ({ ...prev, trends: true }));
    setError(prev => ({ ...prev, trends: '' }));
    try {
      const response = await fetch(`${API_BASE_URL}/trends/openphish`);
      const data = await response.json();
      setOpenPhishTrends(data.data || []);
    } catch (err) {
      setError(prev => ({ ...prev, trends: 'Failed to fetch OpenPhish trends' }));
      console.error('Error fetching OpenPhish trends:', err);
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  };

  // Fetch phishing news
  const fetchPhishingNews = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    setError(prev => ({ ...prev, news: '' }));
    try {
      const response = await fetch(`${API_BASE_URL}/news`);
      const data = await response.json();
      setNewsArticles(data.data || []);
    } catch (err) {
      setError(prev => ({ ...prev, news: 'Failed to fetch phishing news' }));
      console.error('Error fetching news:', err);
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchOpenPhishTrends();
    fetchPhishingNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className='min-h-screen bg-black text-white p-6'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-12'>
        <h1 className='text-4xl font-bold mb-2 flex items-center gap-3'>
          <FiTrendingUp className='text-red-500' />
          Phishing Intelligence Dashboard
        </h1>
        <p className='text-gray-400'>Real-time threat trends and latest cybercrime news</p>
      </div>

      <div className='max-w-7xl mx-auto space-y-8'>
        {/* OpenPhish Trends Section */}
        <div className='bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold flex items-center gap-2'>
              <FiTrendingUp className='text-orange-500' />
              Trending Phishing URLs
            </h2>
            <button
              onClick={fetchOpenPhishTrends}
              disabled={loading.trends}
              className='p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50'
              title='Refresh'
            >
              <FiRefreshCw className={loading.trends ? 'animate-spin' : ''} />
            </button>
          </div>

          {error.trends && (
            <div className='bg-red-900 bg-opacity-30 border border-red-700 rounded p-4 mb-4 flex items-center gap-2'>
              <FiAlertTriangle className='text-red-500' />
              <p>{error.trends}</p>
            </div>
          )}

          {loading.trends ? (
            <div className='flex justify-center py-8'>
              <div className='animate-spin'>
                <FiRefreshCw className='text-orange-500' size={32} />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {openPhishTrends.length > 0 ? (
                openPhishTrends.map((trend, index) => (
                  <div key={index} className='bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 hover:border-orange-500 transition'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='text-gray-400 text-sm'>Rank #{trend.rank || index + 1}</p>
                        <p className='text-lg font-semibold text-orange-400'>{trend.target || 'N/A'}</p>
                        {trend.count && <p className='text-gray-500 text-sm mt-1'>Incidents: {trend.count}</p>}
                      </div>
                      <FiTrendingUp className='text-orange-500 flex-shrink-0' />
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-gray-400 col-span-2'>No trend data available</p>
              )}
            </div>
          )}

          <p className='text-xs text-gray-500 mt-4'>Data source: OpenPhish.com</p>
        </div>

        {/* News Section */}
        <div className='bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold flex items-center gap-2'>
              <FaRegNewspaper className='text-blue-500' />
              Latest Phishing & Cybercrime News
            </h2>
            <button
              onClick={fetchPhishingNews}
              disabled={loading.news}
              className='p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50'
              title='Refresh'
            >
              <FiRefreshCw className={loading.news ? 'animate-spin' : ''} />
            </button>
          </div>

          {error.news && (
            <div className='bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded p-4 mb-4 flex items-center gap-2'>
              <FiAlertTriangle className='text-yellow-500' />
              <p>{error.news}</p>
              <p className='text-xs text-gray-400'>Note: Set NEWSAPI_KEY environment variable to enable news fetching</p>
            </div>
          )}

          {loading.news ? (
            <div className='flex justify-center py-8'>
              <div className='animate-spin'>
                <FiRefreshCw className='text-blue-500' size={32} />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {newsArticles.length > 0 ? (
                newsArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 hover:bg-opacity-70 transition group'
                  >
                    {article.image && (
                      <div className='relative w-full h-40 bg-gray-700 overflow-hidden'>
                        <img
                          src={article.image}
                          alt={article.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition duration-300'
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className='p-4'>
                      <p className='text-xs text-blue-400 font-semibold mb-2'>{article.source}</p>
                      <h3 className='font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition'>
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className='text-sm text-gray-400 line-clamp-2 mb-3'>{article.description}</p>
                      )}
                      {article.publishedAt && (
                        <p className='text-xs text-gray-500'>{formatDate(article.publishedAt)}</p>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                <p className='text-gray-400 col-span-2'>No news articles available</p>
              )}
            </div>
          )}

          <p className='text-xs text-gray-500 mt-4'>Data source: NewsAPI.org (Query: phishing OR scam OR cybercrime)</p>
        </div>
      </div>
    </div>
  );
}
