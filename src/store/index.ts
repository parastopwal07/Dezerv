import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import riskProfileReducer from './slices/riskProfileSlice';
import portfolioReducer from './slices/portfolioSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    riskProfile: riskProfileReducer,
    portfolio: portfolioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;