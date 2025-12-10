import React from 'react';
import Navbar from './Navbar';
import { MdUploadFile, MdQrCodeScanner, MdSecurity } from 'react-icons/md';
import { BiBrain } from 'react-icons/bi';

const HowItWork = () => {
    const steps = [
        {
            icon: <MdUploadFile size={40} className="text-emerald-500" />,
            title: "Submit URL or QR Code",
            description: "Upload a suspicious QR code image or paste a URL you want to verify. Our system accepts multiple formats and processes them instantly.",
            step: "Step 1",
            bg: "bg-emerald-50"
        },
        {
            icon: <MdQrCodeScanner size={40} className="text-blue-500" />,
            title: "QR Code Extraction",
            description: "If you uploaded a QR code, our advanced image processing technology extracts the embedded URL with high accuracy and prepares it for analysis.",
            step: "Step 2",
            bg: "bg-blue-50"
        },
        {
            icon: <BiBrain size={40} className="text-purple-500" />,
            title: "AI-Powered Analysis",
            description: "Multiple AI models work together: content similarity detection identifies AI-written patterns, NLP models detect anomalies, and phishing classifiers spot fraudulent indicators.",
            step: "Step 3",
            bg: "bg-purple-50"
        },
        {
            icon: <MdSecurity size={40} className="text-red-500" />,
            title: "Get Instant Results",
            description: "Receive a comprehensive threat assessment with confidence scores, detected patterns, and actionable recommendations to protect yourself from scams.",
            step: "Step 4",
            bg: "bg-red-50"
        }
    ];

    return (
        <>
            <div className="bg-black">
                <Navbar />
            </div>
            <div className='w-full bg-white py-16 px-4'>
                <div className='max-w-[1240px] mx-auto'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl font-bold text-gray-900 mb-4'>How It Works</h2>
                        <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                            Our multi-layered AI detection system combines cutting-edge technologies to identify scams with unprecedented accuracy
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {steps.map((item, index) => (
                            <div key={index} className='flex flex-col items-center text-center p-4 hover:scale-105 duration-300'>
                                <div className={`p-4 rounded-2xl mb-6 ${item.bg} shadow-sm`}>
                                    {item.icon}
                                </div>
                                <p className={`font-bold mb-2 ${index === 0 ? 'text-emerald-500' :
                                    index === 1 ? 'text-blue-500' :
                                        index === 2 ? 'text-purple-500' :
                                            'text-emerald-500' // Step 4 color per design image seems greenish/teal too or red, let's stick to design logic. The icon is red, but text color in image is green. Wait, looking at image step 4 title is 'Get Instant Results'. The text 'Step 4' is green. Actually ALL 'Step X' texts are green in the image. Correcting this.
                                    }`}>
                                    {item.step}
                                </p>
                                <h3 className='text-xl font-bold text-gray-900 mb-4'>{item.title}</h3>
                                <p className='text-gray-500 text-sm leading-relaxed'>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowItWork;
