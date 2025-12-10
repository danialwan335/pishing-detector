import React, { useState } from 'react';
import Navbar from './Navbar';
import { MdSearch, MdWarning, MdCheckCircle, MdQrCodeScanner } from 'react-icons/md';

const ScanPage = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const scanApiCall = async (endpoint, body, headers) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to connect to scanner service');
            }

            const data = await response.json();
            setResult(data);
            if (data.url) setUrl(data.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleScan = async () => {
        if (!url) return;
        scanApiCall('http://localhost:8000/api/scan', JSON.stringify({ url }), { 'Content-Type': 'application/json' });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        scanApiCall('http://localhost:8000/api/scan/qr', formData, {});
    };

    return (
        <div className='bg-black min-h-screen text-white'>
            <Navbar />

            {/* Background Overlay */}
            <div className="fixed top-0 left-0 w-full h-full z-0">
                <img
                    src="/background.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
            </div>

            <div className='relative z-10 max-w-[800px] w-full mx-auto px-4 pt-24'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>Scan for Threats</h2>
                    <p className='text-gray-400 text-lg'>Enter a suspicious URL or upload a QR code to detect phishing attempts.</p>
                </div>

                <div className='bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-gray-700 shadow-2xl'>
                    <div className='flex flex-col gap-4'>
                        <label className='text-emerald-400 font-semibold uppercase text-sm tracking-wider'>Target URL / QR Code</label>
                        <div className='flex items-center bg-black/50 border border-gray-600 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors'>
                            <MdSearch className='text-gray-400 ml-4' size={24} />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste URL here (e.g., http://example.com/login)"
                                className='bg-transparent text-white w-full p-4 focus:outline-none'
                            />

                            {/* File Upload Button */}
                            <label className='p-4 cursor-pointer hover:text-emerald-400 transition-colors border-l border-gray-700' title="Upload QR Code">
                                <MdQrCodeScanner size={24} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={loading}
                            className={`font-bold py-4 rounded-lg mt-4 transition-all shadow-lg flex justify-center items-center gap-2
                                ${loading
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}
                        >
                            {loading ? 'ANALYZING...' : 'ANALYZE NOW'}
                        </button>
                    </div>

                    {/* Results Section */}
                    {error && (
                        <div className='mt-6 p-4 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-center'>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className={`mt-8 p-6 rounded-xl border ${result.is_phishing ? 'bg-red-900/20 border-red-500' : 'bg-emerald-900/20 border-emerald-500'} animate-fade-in`}>
                            <div className='flex items-center justify-center mb-4'>
                                {result.is_phishing
                                    ? <MdWarning size={48} className='text-red-500' />
                                    : <MdCheckCircle size={48} className='text-emerald-500' />
                                }
                            </div>
                            <h3 className={`text-2xl font-bold text-center mb-2 ${result.is_phishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                {result.is_phishing ? 'PHISHING DETECTED' : 'SAFE TO VISIT'}
                            </h3>
                            <p className='text-center text-gray-300 mb-4'>{result.message}</p>

                            <div className='grid grid-cols-2 gap-4 text-center mt-4 border-t border-gray-700/50 pt-4'>
                                <div>
                                    <p className='text-gray-400 text-sm uppercase'>Confidence</p>
                                    <p className='text-xl font-bold'>{(result.confidence * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className='text-gray-400 text-sm uppercase'>Time Taken</p>
                                    <p className='text-xl font-bold'>{result.scan_duration}s</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScanPage;
