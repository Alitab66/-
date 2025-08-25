
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Item, Employee, ExpenseRecord } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';

const ItemForm: React.FC<{
    onSave: (item: Omit<Item, 'id'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && price && !isNaN(Number(price))) {
            onSave({ name, price: Number(price) });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="item-name" className="block text-sm font-medium text-gray-300 mb-1">نام آیتم</label>
                <input id="item-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors" required />
            </div>
            <div>
                <label htmlFor="item-price" className="block text-sm font-medium text-gray-300 mb-1">قیمت (تومان)</label>
                <input id="item-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors" required />
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500">لغو</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[--primary-600] hover:bg-[--primary-500] text-white font-bold">ذخیره</button>
            </div>
        </form>
    );
};

const ExpensesView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { items, employees } = state;

    const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    
    const { totalCost, costPerPerson } = useMemo(() => {
        const total = items
            .filter(item => selectedItems[item.id])
            .reduce((sum, item) => sum + (item.price * selectedItems[item.id]), 0);
        
        const cost = selectedEmployees.size > 0 ? total / selectedEmployees.size : 0;
        
        return { totalCost: total, costPerPerson: cost };
    }, [items, selectedItems, selectedEmployees]);
    
    const handleItemQuantityChange = (itemId: string, change: number) => {
        setSelectedItems(prev => {
            const newQuantities = { ...prev };
            const currentQuantity = newQuantities[itemId] || 0;
            const newQuantity = currentQuantity + change;

            if (newQuantity > 0) {
                newQuantities[itemId] = newQuantity;
            } else {
                delete newQuantities[itemId];
            }
            return newQuantities;
        });
    };

    const handleToggleEmployee = (employeeId: string) => {
        const newSelection = new Set(selectedEmployees);
        if (newSelection.has(employeeId)) {
            newSelection.delete(employeeId);
        } else {
            newSelection.add(employeeId);
        }
        setSelectedEmployees(newSelection);
    };

    const handleSaveItem = (itemData: Omit<Item, 'id'>) => {
        dispatch({ type: 'ADD_ITEM', payload: { id: Date.now().toString(), ...itemData } });
        setIsItemModalOpen(false);
    };

    const handleSaveSplit = () => {
        if (totalCost === 0 || selectedEmployees.size === 0) {
            alert('لطفا آیتم‌ها و کارمندان را انتخاب کنید.');
            return;
        }

        const transactionId = Date.now().toString();
        const description = items
            .filter(i => selectedItems[i.id])
            .map(i => `${i.name} (×${selectedItems[i.id]})`)
            .join('، ');

        const newExpenseRecords: ExpenseRecord[] = Array.from(selectedEmployees).map((employeeId: string) => {
            const employee = employees.find(e => e.id === employeeId);
            return {
                id: `${transactionId}-${employeeId}`,
                transactionId,
                employeeId,
                employeeName: employee?.name || 'ناشناس',
                amount: costPerPerson,
                date,
                description,
                isSettled: false,
            };
        });

        dispatch({ type: 'ADD_EXPENSE_GROUP', payload: newExpenseRecords });
        alert('هزینه با موفقیت ثبت و تقسیم شد!');
        setSelectedItems({});
        setSelectedEmployees(new Set());
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[--primary-400] to-[--secondary-500]">💰 ثبت و تقسیم هزینه جدید</h2>
            
            <Card>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">۱. انتخاب آیتم‌ها</h3>
                    <button onClick={() => setIsItemModalOpen(true)} className="text-sm font-semibold text-[--primary-400] hover:text-[--primary-300]">+ آیتم جدید</button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                     {items.length === 0 && <p className="text-gray-400 text-center p-4">آیتمی برای انتخاب وجود ندارد. ابتدا یک آیتم جدید اضافه کنید.</p>}
                    {items.map(item => {
                        const quantity = selectedItems[item.id] || 0;
                        return (
                            <div key={item.id} className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${quantity > 0 ? 'bg-[--primary-500]/30' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>
                                <div className="flex-grow">
                                    <span>{item.name}</span>
                                    <br/>
                                    <span className="text-sm text-gray-400 font-mono">{item.price.toLocaleString('fa-IR')} تومان</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button aria-label={`کاهش تعداد ${item.name}`} onClick={() => handleItemQuantityChange(item.id, -1)} className="w-8 h-8 rounded-full bg-red-500/50 hover:bg-red-500/80 text-white font-bold text-xl flex items-center justify-center transition-transform transform active:scale-90">-</button>
                                    <span className="w-8 text-center font-bold text-lg tabular-nums">{quantity}</span>
                                    <button aria-label={`افزایش تعداد ${item.name}`} onClick={() => handleItemQuantityChange(item.id, 1)} className="w-8 h-8 rounded-full bg-green-500/50 hover:bg-green-500/80 text-white font-bold text-xl flex items-center justify-center transition-transform transform active:scale-90">+</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold mb-3">۲. انتخاب کارمندان</h3>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {employees.length === 0 && <p className="text-gray-400 text-center p-4">کارمندی برای انتخاب وجود ندارد. لطفا از تب کارمندان اضافه کنید.</p>}
                    {employees.map(employee => (
                        <div key={employee.id} onClick={() => handleToggleEmployee(employee.id)} className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedEmployees.has(employee.id) ? 'bg-[--primary-500]/30' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>
                            <input type="checkbox" readOnly checked={selectedEmployees.has(employee.id)} className="ml-3 form-checkbox h-5 w-5 text-[var(--primary-600)] bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-[var(--primary-500)] transition"/>
                            <span>{employee.name}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold mb-3">۳. تاریخ و جمع‌بندی</h3>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="expense-date" className="block text-sm font-medium text-gray-300 mb-1">تاریخ</label>
                        <input id="expense-date" type="text" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors" />
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg space-y-2 text-center">
                        <p>جمع کل: <span className="font-bold text-xl text-green-400">{totalCost.toLocaleString('fa-IR')} تومان</span></p>
                        <p>سهم هر نفر ({selectedEmployees.size} نفر): <span className="font-bold text-xl text-yellow-400">{Math.round(costPerPerson).toLocaleString('fa-IR')} تومان</span></p>
                    </div>
                </div>
            </Card>
            
            <button
                onClick={handleSaveSplit}
                disabled={totalCost === 0 || selectedEmployees.size === 0}
                className="w-full text-center p-4 rounded-lg bg-gradient-to-r from-[--primary-600] to-[--secondary-500] text-white font-bold text-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
            >
                ذخیره و تقسیم کن 💾
            </button>

            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="افزودن آیتم جدید">
                <ItemForm onSave={handleSaveItem} onCancel={() => setIsItemModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ExpensesView;