import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { MdSecurity } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [nav, setNav] = useState(false);
    const navigate = useNavigate();

    const handleNav = () => {
        setNav(!nav);
    }

    const handleScanClick = () => {
        navigate('/scan');
        setNav(false);
    }

    return (
        <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white font-sans relative z-50'>
            <Link to="/" className='flex items-center'>
                <MdSecurity className='text-cyan-400 mr-2' size={30} />
                <h1 className='w-full text-2xl font-bold text-white'>PhishNet</h1>
            </Link>

            <ul className='hidden md:flex items-center font-medium'>
                <li className='p-4 hover:text-cyan-400 cursor-pointer transition-colors'><Link to="/">Home</Link></li>
                <li className='p-4 hover:text-cyan-400 cursor-pointer transition-colors'><Link to="/scan">Submit Scan</Link></li>
                <li className='p-4 hover:text-cyan-400 cursor-pointer transition-colors'><Link to="/how-it-works">How It Works</Link></li>
                <li className='p-4 hover:text-cyan-400 cursor-pointer transition-colors'><Link to="/history">Scan History</Link></li>
                <li className='ml-4'>
                    <button
                        onClick={handleScanClick}
                        className='bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md font-semibold transition-colors'
                    >
                        Scan Now
                    </button>
                </li>
            </ul>

            <div onClick={handleNav} className='block md:hidden cursor-pointer'>
                {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
            </div>

            <div className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 z-50' : 'fixed left-[-100%] top-0 h-full ease-in-out duration-500'}>
                <div className='flex items-center m-4'>
                    <MdSecurity className='text-cyan-400 mr-2' size={30} />
                    <h1 className='w-full text-2xl font-bold text-white'>PhishNet</h1>
                </div>
                <ul className='uppercase p-4'>
                    <li className='p-4 border-b border-gray-600'><Link onClick={() => setNav(false)} to="/">Home</Link></li>
                    <li className='p-4 border-b border-gray-600'><Link onClick={() => setNav(false)} to="/scan">Submit Scan</Link></li>
                    <li className='p-4 border-b border-gray-600'><Link onClick={() => setNav(false)} to="/how-it-works">How It Works</Link></li>
                    <li className='p-4 border-b border-gray-600'><Link onClick={() => setNav(false)} to="/history">Scan History</Link></li>
                    <li className='p-4'>
                        <button
                            onClick={handleScanClick}
                            className='w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md font-semibold'
                        >
                            Scan Now
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Navbar;