
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

const themes = [
    { id: 'default', name: 'پیش‌فرض', colors: 'from-purple-500 to-pink-500' },
    { id: 'ocean', name: 'اقیانوس', colors: 'from-sky-500 to-cyan-500' },
    { id: 'sunset', name: 'غروب', colors: 'from-orange-500 to-red-500' },
    { id: 'forest', name: 'جنگل', colors: 'from-green-500 to-teal-500' },
];

const SettingsView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [appName, setAppName] = useState(state.appName);

    useEffect(() => {
        setAppName(state.appName);
    }, [state.appName]);

    const handleSave = () => {
        if(appName.trim()){
            dispatch({ type: 'SET_APP_NAME', payload: appName });
            alert('نام برنامه با موفقیت تغییر کرد!');
        }
    };

    const handleThemeChange = (themeId: string) => {
        dispatch({ type: 'SET_THEME', payload: themeId });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[--primary-400] to-[--secondary-500] mb-6">⚙️ تنظیمات برنامه</h2>
            
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-2">نام برنامه</label>
                        <input
                            type="text"
                            id="appName"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full text-center p-3 rounded-lg bg-gradient-to-r from-[--primary-600] to-[--secondary-500] text-white font-bold hover:opacity-90 transition-opacity"
                    >
                        ذخیره تغییرات
                    </button>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-gray-200 mb-3">انتخاب تم</h3>
                <div className="grid grid-cols-2 gap-4">
                    {themes.map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`relative p-4 rounded-lg flex items-center justify-center text-white font-semibold bg-gradient-to-br ${theme.colors} transition-all duration-200 transform hover:scale-105`}
                        >
                            {state.theme === theme.id && (
                                <div className="absolute inset-0 rounded-lg border-2 border-white/80 ring-2 ring-white/50"></div>
                            )}
                            {theme.name}
                        </button>
                    ))}
                </div>
            </Card>

             <Card>
                <div className="text-center text-gray-400 text-sm">
                    <p>طراحی و توسعه با ❤️</p>
                    <p>نسخه 1.0.0</p>
                </div>
            </Card>
        </div>
    );
};

export default SettingsView;
