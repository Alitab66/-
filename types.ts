
export interface Employee {
  id: string;
  name: string;
  phone: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
}

export interface ExpenseRecord {
  id: string;
  transactionId: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  description: string;
  isSettled: boolean;
}

export interface AppState {
  appName: string;
  employees: Employee[];
  items: Item[];
  expenses: ExpenseRecord[];
  theme: string;
}

export type AppAction =
  | { type: 'SET_APP_NAME'; payload: string }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_EXPENSE_GROUP'; payload: ExpenseRecord[] }
  | { type: 'UPDATE_EXPENSE'; payload: ExpenseRecord }
  | { type: 'DELETE_EXPENSE_GROUP'; payload: string }
  | { type: 'TOGGLE_SETTLE_EXPENSE'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_STATE'; payload: AppState };

export enum View {
  Expenses,
  Details,
  Employees,
  Settings,
}
