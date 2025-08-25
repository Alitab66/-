import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ExpenseRecord } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';

const EditExpenseForm: React.FC<{
    expense: ExpenseRecord;
    onSave: (expense: ExpenseRecord) => void;
    onCancel: () => void;
}> = ({ expense, onSave, onCancel }) => {
    const [amount, setAmount] = useState(expense.amount.toString());
    const [date, setDate] = useState(expense.date);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...expense, amount: Number(amount), date });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">کارمند</label>
                <p className="w-full bg-gray-700/50 rounded-lg p-2">{expense.employeeName}</p>
            </div>
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">مبلغ (تومان)</label>
                <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors" />
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">تاریخ</label>
                <input id="date" type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors" />
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500">لغو</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[--primary-600] hover:bg-[--primary-500] text-white font-bold">ذخیره</button>
            </div>
        </form>
    );
}


const DetailsView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
    const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
    const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);


    const filteredExpenses = useMemo(() => {
        return state.expenses
            .filter(exp => !filterEmployeeId || exp.employeeId === filterEmployeeId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [state.expenses, filterEmployeeId]);

    const employeeBalances = useMemo(() => {
        const balances: { [key: string]: { id: string, name: string, total: number } } = {};
        
        state.employees.forEach(emp => {
            balances[emp.id] = { id: emp.id, name: emp.name, total: 0 };
        });

        state.expenses
            .filter(ex => !ex.isSettled && (!filterEmployeeId || ex.employeeId === filterEmployeeId))
            .forEach(ex => {
                if (balances[ex.employeeId]) {
                    balances[ex.employeeId].total += ex.amount;
                }
            });
            
        return Object.values(balances)
            .filter(b => b.total !== 0)
            .sort((a, b) => b.total - a.total);
    }, [state.expenses, state.employees, filterEmployeeId]);

     const groupedExpenses = useMemo(() => {
        const groups: { [transactionId: string]: ExpenseRecord[] } = {};
        filteredExpenses.forEach(expense => {
            if (!groups[expense.transactionId]) {
                groups[expense.transactionId] = [];
            }
            groups[expense.transactionId].push(expense);
        });
        return Object.values(groups).sort((a,b) => b[0].date.localeCompare(a[0].date));
    }, [filteredExpenses]);

    const handleSettle = (id: string) => {
        dispatch({ type: 'TOGGLE_SETTLE_EXPENSE', payload: id });
    };
    
    const handleDelete = (transactionId: string) => {
        if (window.confirm('آیا از حذف این گروه هزینه مطمئن هستید؟ تمام رکوردهای مرتبط حذف خواهند شد.')) {
            dispatch({ type: 'DELETE_EXPENSE_GROUP', payload: transactionId });
        }
    };

    const handleEdit = (expense: ExpenseRecord) => {
        setEditingExpense(expense);
    }
    
    const handleSaveEdit = (expense: ExpenseRecord) => {
        dispatch({type: 'UPDATE_EXPENSE', payload: expense });
        setEditingExpense(null);
    }

    const handleShare = async (groupToShare?: ExpenseRecord[]) => {
        let textToShare: string;
        let title = `گزارش هزینه - ${state.appName}`;

        if (groupToShare) {
            // Sharing a single group
            const transaction = groupToShare[0];
            title = `گزارش گروه: ${transaction.description}`;
            let text = `گزارش گروه هزینه: *${transaction.description}*\n`;
            text += `🗓️ *تاریخ:* ${transaction.date}\n`;
            text += `💰 *سهم هر نفر:* ${Math.round(transaction.amount).toLocaleString('fa-IR')} تومان\n\n`;
            text += '--- اعضا ---\n';
            groupToShare.forEach(exp => {
                text += `👤 ${exp.employeeName} (${exp.isSettled ? 'تسویه شده' : 'تسویه نشده'})\n`;
            });
            textToShare = text;
        } else {
            // Sharing all (filtered) expenses
            title = `گزارش کلی هزینه‌ها - ${state.appName}`;
            let text = `${title}\n\n`;
            
            if (employeeBalances.length > 0) {
                text += "--- خلاصه حساب ---\n";
                employeeBalances.forEach(balance => {
                    if (balance.total > 0) {
                        text += `🔴 ${balance.name}: ${Math.round(balance.total).toLocaleString('fa-IR')} تومان بدهکار\n`;
                    } else {
                        text += `🟢 ${balance.name}: ${Math.round(Math.abs(balance.total)).toLocaleString('fa-IR')} تومان بستانکار\n`;
                    }
                });
                text += "\n";
            }

            text += "--- جزئیات تراکنش‌ها ---\n";
            groupedExpenses.forEach(group => {
                const transaction = group[0];
                text += `\n*${transaction.description}* (${transaction.date})\n`;
                group.forEach(exp => {
                    text += ` - ${exp.employeeName}: ${Math.round(exp.amount).toLocaleString('fa-IR')} تومان (${exp.isSettled ? 'تسویه شده' : 'تسویه نشده'})\n`;
                });
            });
            textToShare = text;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: textToShare,
                });
            } catch (error) {
                console.error('خطا در اشتراک‌گذاری:', error);
            }
        } else {
            alert('مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند. می‌توانید متن را کپی کنید.');
            navigator.clipboard.writeText(textToShare);
        }
    };
    
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[--primary-400] to-[--secondary-500] mb-4">📈 جزئیات هزینه‌ها</h2>
            <div className="flex gap-2">
                <select 
                    value={filterEmployeeId} 
                    onChange={e => setFilterEmployeeId(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                >
                    <option value="">همه کارمندان</option>
                    {state.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                <button onClick={() => handleShare()} className="p-2 rounded-lg bg-blue-500 text-white shrink-0">اشتراک کل</button>
            </div>

            {employeeBalances.length > 0 && (
                <Card>
                    <h3 className="text-lg font-bold mb-3">خلاصه حساب</h3>
                    <div className="space-y-2">
                        {employeeBalances.map(balance => (
                            <div key={balance.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                                <span>{balance.name}</span>
                                {balance.total > 0 ? (
                                    <span className="font-bold text-red-400">{Math.round(balance.total).toLocaleString('fa-IR')} تومان بدهکار</span>
                                ) : (
                                    <span className="font-bold text-green-400">{Math.round(Math.abs(balance.total)).toLocaleString('fa-IR')} تومان بستانکار</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            
            {groupedExpenses.length === 0 ? (
                <Card className="text-center">
                    <p className="text-gray-400">هیچ رکوردی برای نمایش وجود ندارد.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {groupedExpenses.map(group => {
                        const transaction = group[0];
                        const isExpanded = expandedTransactionId === transaction.transactionId;

                        return (
                            <Card key={transaction.transactionId}>
                                <div className="cursor-pointer" onClick={() => setExpandedTransactionId(isExpanded ? null : transaction.transactionId)}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{transaction.description}</p>
                                            <p className="text-sm text-gray-400">{group.length} نفر - سهم هر نفر: {Math.round(transaction.amount).toLocaleString('fa-IR')} تومان</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            <span className="text-sm text-gray-400">{transaction.date}</span>
                                            <span className={`transform transition-transform duration-300 inline-block ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                                        {group.map(expense => (
                                            <div key={expense.id} className={`p-2 rounded-md bg-gray-900/50 ${expense.isSettled ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        <div>
                                                            <p className={`font-bold ${expense.isSettled ? 'line-through text-gray-400' : ''}`}>{expense.employeeName}</p>
                                                            <p className="text-sm text-yellow-400 font-mono">{Math.round(expense.amount).toLocaleString('fa-IR')} تومان</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end items-center gap-1 shrink-0">
                                                        <button onClick={() => handleSettle(expense.id)} className={`text-xs px-2 py-1 rounded-full ${expense.isSettled ? 'bg-green-500/80' : 'bg-gray-600'}`}>
                                                            {expense.isSettled ? 'لغو تسویه' : 'تسویه'}
                                                        </button>
                                                        <button onClick={() => handleEdit(expense)} className="p-2 text-lg">✏️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-700/50">
                                  <button onClick={(e) => { e.stopPropagation(); handleShare(group); }} className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500">📤 اشتراک گروه</button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(transaction.transactionId); }} className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500">🗑️ حذف گروه</button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            
            <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="ویرایش رکورد هزینه">
                {editingExpense && <EditExpenseForm expense={editingExpense} onSave={handleSaveEdit} onCancel={() => setEditingExpense(null)} />}
            </Modal>
        </div>
    );
};

export default DetailsView;