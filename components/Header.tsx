
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
    const { state } = useAppContext();
    return (
        <header className="fixed top-0 right-0 left-0 bg-gray-900/80 backdrop-blur-sm z-10 shadow-lg shadow-[--shadow-color-hover]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[--primary-400] to-[--secondary-500] text-transparent bg-clip-text animate-pulse">
                        {state.appName} ✨
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
