
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';
import FloatingActionButton from '../components/FloatingActionButton';

const EmployeeForm: React.FC<{
    employee?: Employee;
    onSave: (employee: Omit<Employee, 'id'>) => void;
    onCancel: () => void;
}> = ({ employee, onSave, onCancel }) => {
    const [name, setName] = useState(employee?.name || '');
    const [phone, setPhone] = useState(employee?.phone || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone) {
            onSave({ name, phone });
        }
    };
    
    const handleImportContact = async () => {
        if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
            try {
                const props = ['name', 'tel'];
                const opts = { multiple: false };
                const contacts = await (navigator as any).contacts.select(props, opts);
                if (contacts.length > 0) {
                    const contact = contacts[0];
                    if (contact.name && contact.name.length > 0) setName(contact.name[0]);
                    if (contact.tel && contact.tel.length > 0) {
                        let phoneNumber = contact.tel[0].replace(/[\s-()]/g, '');
                        if (!phoneNumber.startsWith('0')) {
                           phoneNumber = '0' + phoneNumber.slice(phoneNumber.startsWith('+98') ? 3 : 0);
                        }
                        setPhone(phoneNumber);
                    }
                }
            } catch (ex) {
                console.error('Error selecting contact.', ex);
                alert('خطا در انتخاب مخاطب.');
            }
        } else {
            alert('مرورگر شما از قابلیت انتخاب مخاطب پشتیبانی نمی‌کند.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <button type="button" onClick={handleImportContact} className="w-full text-center p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:opacity-90 transition-opacity mb-4">
                    افزودن از مخاطبین 📱
                </button>
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">نام کارمند</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">شماره تماس</label>
                <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                />
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">لغو</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors">ذخیره</button>
            </div>
        </form>
    );
};

const EmployeesView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

    const handleOpenModal = (employee?: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(undefined);
    };

    const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
        if (editingEmployee) {
            dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...editingEmployee, ...employeeData } });
        } else {
            dispatch({ type: 'ADD_EMPLOYEE', payload: { id: Date.now().toString(), ...employeeData } });
        }
        handleCloseModal();
    };

    const handleDeleteEmployee = (id: string) => {
        if (window.confirm('آیا از حذف این کارمند مطمئن هستید؟')) {
            dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
        }
    };

    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">👥 مدیریت کارمندان</h2>
            {state.employees.length === 0 ? (
                <Card className="text-center">
                    <p className="text-gray-400">هنوز کارمندی اضافه نشده است. برای شروع روی دکمه + کلیک کنید.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.employees.map(employee => (
                        <Card key={employee.id}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">{employee.name}</p>
                                    <p className="text-sm text-gray-400" dir="ltr">{employee.phone}</p>
                                </div>
                                <div className="flex space-x-2 space-x-reverse">
                                    <button onClick={() => handleOpenModal(employee)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">✏️</button>
                                    <button onClick={() => handleDeleteEmployee(employee.id)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">🗑️</button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            <FloatingActionButton
                onClick={() => handleOpenModal()}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingEmployee ? 'ویرایش کارمند' : 'افزودن کارمند جدید'}
            >
                <EmployeeForm 
                    employee={editingEmployee}
                    onSave={handleSaveEmployee}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default EmployeesView;
   