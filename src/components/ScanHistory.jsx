import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { MdHistory, MdCheckCircle, MdWarning, MdAccessTime } from 'react-icons/md';

const ScanHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/history'); // Adjust if backend URL differs
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-gray-50 min-h-screen'>
            <div className="bg-black">
                <Navbar />
            </div>

            <div className='max-w-[1240px] mx-auto px-4 py-16'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2'>
                        <MdHistory className="text-emerald-500" /> recent Scan History
                    </h2>
                    <p className='text-gray-600'>View the latest threats analyzed by our system.</p>
                </div>

                {loading ? (
                    <div className='text-center py-20 text-gray-500'>Loading history...</div>
                ) : error ? (
                    <div className='text-center py-20 text-red-500'>Error: {error}</div>
                ) : history.length === 0 ? (
                    <div className='text-center py-20 text-gray-500'>No scan history found yet.</div>
                ) : (
                    <div className='overflow-x-auto shadow-xl rounded-lg'>
                        <table className='w-full text-left bg-white rounded-lg'>
                            <thead className='bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b'>
                                <tr>
                                    <th className='p-4'>Status</th>
                                    <th className='p-4'>URL</th>
                                    <th className='p-4'>Confidence</th>
                                    <th className='p-4'>Time Scanned</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {history.map((scan) => (
                                    <tr key={scan.id} className='hover:bg-gray-50 transition-colors'>
                                        <td className='p-4'>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${scan.is_phishing
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                {scan.is_phishing
                                                    ? <><MdWarning /> PHISHING</>
                                                    : <><MdCheckCircle /> SAFE</>
                                                }
                                            </span>
                                        </td>
                                        <td className='p-4 font-medium text-gray-800 break-all max-w-md'>
                                            {scan.url}
                                        </td>
                                        <td className='p-4 text-gray-600'>
                                            {(scan.confidence * 100).toFixed(1)}%
                                        </td>
                                        <td className='p-4 text-gray-500 text-sm flex items-center gap-1'>
                                            <MdAccessTime />
                                            {new Date(scan.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanHistory;
