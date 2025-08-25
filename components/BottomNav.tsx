
import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    view: View,
    label: string,
    isActive: boolean,
    onClick: () => void,
}> = ({ view, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-300 ${isActive ? 'text-[--primary-400]' : 'text-gray-400 hover:text-[--primary-300]'}`}
        >
            {ICONS[view]}
            <span className={`text-xs font-medium mt-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>{label}</span>
            {isActive && <div className="w-10 h-1 bg-[--primary-400] rounded-full mt-1 animate-pulse"></div>}
        </button>
    );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 right-0 left-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 shadow-lg z-10">
      <div className="max-w-4xl mx-auto grid grid-cols-4">
        <NavItem view={View.Expenses} label="هزینه ها" isActive={activeView === View.Expenses} onClick={() => setActiveView(View.Expenses)} />
        <NavItem view={View.Details} label="جزئیات" isActive={activeView === View.Details} onClick={() => setActiveView(View.Details)} />
        <NavItem view={View.Employees} label="کارمندان" isActive={activeView === View.Employees} onClick={() => setActiveView(View.Employees)} />
        <NavItem view={View.Settings} label="تنظیمات" isActive={activeView === View.Settings} onClick={() => setActiveView(View.Settings)} />
      </div>
    </nav>
  );
};

export default BottomNav;
