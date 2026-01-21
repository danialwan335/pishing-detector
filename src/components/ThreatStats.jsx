import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function ThreatStats() {
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const v = await fetch('http://localhost:8000/api/stats/phishing-volume').then(r => r.json());
      setVolumeData(v);
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Line chart data
  const lineData = {
    labels: volumeData.map(d => d.date),
    datasets: [
      {
        label: 'Phishing URLs per Day',
        data: volumeData.map(d => d.count),
        borderColor: '#f87171',
        backgroundColor: 'rgba(248,113,113,0.2)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 py-8">
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Phishing Volume Over Time</h2>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : volumeData.length === 0 || lineData.labels.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">No phishing volume data available yet.<br/>Run the fetch script periodically to build a time series.</div>
        ) : (
          <Line data={lineData} options={{
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Based on OpenPhish feed', color: '#f3f4f6' },
            },
            scales: {
              x: { ticks: { color: '#f3f4f6' } },
              y: { ticks: { color: '#f3f4f6' } },
            },
          }} />
        )}
      </div>
    </div>
  );
}
