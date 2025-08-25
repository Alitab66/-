
import React from 'react';

interface FabProps {
  onClick: () => void;
  icon: React.ReactNode;
}

const FloatingActionButton: React.FC<FabProps> = ({ onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 left-6 z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-[--primary-600] to-[--secondary-500] text-white shadow-lg shadow-[--shadow-color] flex items-center justify-center transform hover:scale-110 active:scale-95 transition-transform duration-200 animate-pulse-slow"
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
