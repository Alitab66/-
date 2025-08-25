
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative p-4 bg-gray-800/50 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[--shadow-color-hover] ${className}`}>
      <div className="absolute -inset-px bg-gradient-to-r from-[--primary-600] to-[--secondary-600] rounded-lg opacity-20 group-hover:opacity-60 transition-opacity duration-300"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
