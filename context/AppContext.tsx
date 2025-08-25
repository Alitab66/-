
import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { AppState, AppAction } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const initialState: AppState = {
  appName: 'حسابگر دُنگ',
  employees: [],
  items: [],
  expenses: [],
  theme: 'default',
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> }>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'SET_APP_NAME':
      return { ...state, appName: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return { ...state, employees: state.employees.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EMPLOYEE':
      return { ...state, employees: state.employees.filter(e => e.id !== action.payload) };
    case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
        return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_ITEM':
        return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'ADD_EXPENSE_GROUP':
        return { ...state, expenses: [...state.expenses, ...action.payload] };
    case 'UPDATE_EXPENSE':
        return { ...state, expenses: state.expenses.map(ex => ex.id === action.payload.id ? action.payload : ex)};
    case 'DELETE_EXPENSE_GROUP':
        return { ...state, expenses: state.expenses.filter(ex => ex.transactionId !== action.payload) };
    case 'TOGGLE_SETTLE_EXPENSE':
        return { ...state, expenses: state.expenses.map(ex => ex.id === action.payload ? {...ex, isSettled: !ex.isSettled} : ex) };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedState, setStoredState] = useLocalStorage<AppState>('expense-app-state', initialState);
  const [state, dispatch] = useReducer(appReducer, storedState);

  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
