import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreatStats from './ThreatStats';
import { FiRefreshCw, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { FaRegNewspaper } from "react-icons/fa6";
import { MdShield } from 'react-icons/md';

export default function Dashboard() {
  const navigate = useNavigate();
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

  // For ThreatStats refresh
  const [threatStatsKey, setThreatStatsKey] = useState(0);
  const refreshThreatStats = () => setThreatStatsKey(k => k + 1);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <FiTrendingUp className="text-red-500" />
          Threat Intelligence Dashboard
        </h1>
        <p className="text-gray-400">Live phishing statistics and cybercrime news</p>
      </div>
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phishing Volume Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Phishing Volume</h2>
            <button
              onClick={refreshThreatStats}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              title="Refresh Stats"
            >
              <FiRefreshCw className="" />
            </button>
          </div>
          <ThreatStats key={threatStatsKey} />
          <p className="text-xs text-gray-500 mt-4">Data source: OpenPhish.com</p>
        </div>

        {/* CTA Buttons Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4 flex flex-col gap-4 justify-center items-center">
          <h2 className="text-xl font-bold text-white mb-2">Get Started</h2>
          <button
            onClick={() => navigate('/scan')}
            className="bg-emerald-500 w-full max-w-[250px] rounded-md font-bold py-3 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MdShield size={20} /> Start Scanning
          </button>
          <button
            onClick={() => navigate('/how-it-works')}
            className="bg-white/10 backdrop-blur-md border border-white/20 w-full max-w-[250px] rounded-md font-bold py-3 text-white hover:bg-white/20 transition-all duration-300"
          >
            Learn How It Works
          </button>
        </div>

        {/* Top Phishing Links Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiTrendingUp className="text-orange-500" />
              Top Phishing Links (OpenPhish)
            </h2>
            <button
              onClick={fetchOpenPhishTrends}
              disabled={loading.trends}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              title="Refresh Links"
            >
              <FiRefreshCw className={loading.trends ? 'animate-spin' : ''} />
            </button>
          </div>
          {loading.trends ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin">
                <FiRefreshCw className="text-orange-500" size={32} />
              </div>
            </div>
          ) : error.trends ? (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-4 mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" />
              <p>{error.trends}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {openPhishTrends.length > 0 ? openPhishTrends.slice(0, 10).map((trend, idx) => (
                <li key={idx} className="bg-gray-800 bg-opacity-50 p-3 rounded-lg border border-gray-700 hover:border-orange-500 transition">
                  <span className="font-bold text-orange-400">{trend.target || 'N/A'}</span>
                  {trend.count && <span className="ml-2 text-gray-400">Incidents: {trend.count}</span>}
                </li>
              )) : <li className="text-gray-400">No trend data available</li>}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-4">Data source: OpenPhish.com</p>
        </div>

        {/* News Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaRegNewspaper className="text-blue-500" />
              Latest Phishing & Cybercrime News
            </h2>
            <button
              onClick={fetchPhishingNews}
              disabled={loading.news}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              title="Refresh News"
            >
              <FiRefreshCw className={loading.news ? 'animate-spin' : ''} />
            </button>
          </div>
          {loading.news ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin">
                <FiRefreshCw className="text-blue-500" size={32} />
              </div>
            </div>
          ) : error.news ? (
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded p-4 mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-500" />
              <p>{error.news}</p>
              <p className="text-xs text-gray-400">Note: Set NEWSAPI_KEY environment variable to enable news fetching</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newsArticles.length > 0 ? newsArticles.slice(0, 8).map((article, idx) => (
                <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" className="block bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition group">
                  <p className="text-xs text-blue-400 font-semibold mb-1">{article.source}</p>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition">{article.title}</h3>
                  {article.description && <p className="text-sm text-gray-400 mb-2">{article.description}</p>}
                  {article.publishedAt && <p className="text-xs text-gray-500">{formatDate(article.publishedAt)}</p>}
                </a>
              )) : <p className="text-gray-400">No news articles available</p>}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">Data source: NewsAPI.org (Query: phishing OR scam OR cybercrime)</p>
        </div>
      </div>
    </div>
  );
}
