import { MdShield } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className='text-white w-full h-screen relative flex flex-col justify-center items-center overflow-hidden'>
      {/* Background Image Overlay */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          src="/background.png"
          alt="Security Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
      </div>

      <div className='relative z-10 max-w-[1000px] w-full mx-auto text-center flex flex-col justify-center items-center px-4'>

        {/* Badge */}
        <div className='flex items-center bg-emerald-900/40 border border-emerald-500/50 rounded-full px-4 py-1 mb-6 backdrop-blur-sm'>
          <MdShield className='text-emerald-400 mr-2' />
          <p className='text-emerald-400 font-medium text-sm'>AI-Powered Protection</p>
        </div>

        {/* Main Heading */}
        <h1 className='md:text-6xl sm:text-5xl text-4xl font-bold md:leading-tight mb-4 tracking-tight drop-shadow-xl'>
          Real-Time Scam Detection
          <br />
          <span className='text-emerald-400'>Powered by AI</span>
        </h1>

        {/* Subtext */}
        <p className='md:text-xl text-lg font-light text-gray-300 py-4 max-w-[800px] leading-relaxed drop-shadow-md'>
          Submit suspicious URLs or QR codes and let our advanced AI analyze them instantly.
          Combining machine learning, NLP anomaly detection, and phishing classification to
          keep you safe from sophisticated online threats.
        </p>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 my-8'>
          <button
            onClick={() => navigate('/scan')}
            className='bg-emerald-500 w-[200px] rounded-md font-bold my-2 py-3 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2'
          >
            <MdShield size={20} /> Start Scanning
          </button>
          <button
            onClick={() => navigate('/how-it-works')}
            className='bg-white/10 backdrop-blur-md border border-white/20 w-[200px] rounded-md font-bold my-2 py-3 text-white hover:bg-white/20 transition-all duration-300'>
            Learn How It Works
          </button>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 w-full gap-8 mt-12 bg-black/30 p-8 rounded-xl backdrop-blur-sm border border-white/5'>
          <div className='flex flex-col items-center justify-center'>
            <p className='text-4xl font-bold text-emerald-400 mb-2'>99.8%</p>
            <p className='text-gray-400 text-sm uppercase tracking-wider'>Detection Accuracy</p>
          </div>
          <div className='flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0'>
            <p className='text-4xl font-bold text-emerald-400 mb-2'>&lt;2s</p>
            <p className='text-gray-400 text-sm uppercase tracking-wider'>Average Scan Time</p>
          </div>
          <div className='flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0'>
            <p className='text-4xl font-bold text-emerald-400 mb-2'>500K+</p>
            <p className='text-gray-400 text-sm uppercase tracking-wider'>Scans Completed</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
