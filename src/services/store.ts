import { configureStore, combineReducers } from '@reduxjs/toolkit';
import builderReducer from '../slices/builder-slice';
import feedReducer from '../slices/feed-slice';
import ingredientsReducer from '../slices/ingredients-slice';
import orderReducer from '../slices/order-slice';
import userReducer from '../slices/user-slice';
import {
  TypedUseSelectorHook,
  useDispatch as _useDispatch,
  useSelector as _useSelector
} from 'react-redux';

// Собираем единый редьюсер для проверки в тестах
export const rootReducer = combineReducers({
  builder: builderReducer,
  feed: feedReducer,
  ingredients: ingredientsReducer,
  order: orderReducer,
  user: userReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = _useDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = _useSelector;

export default store;
