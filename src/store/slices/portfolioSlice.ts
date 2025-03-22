import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Portfolio } from '../../types';

interface PortfolioState {
  currentPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  currentPortfolio: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.currentPortfolio = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearPortfolio: (state) => {
      state.currentPortfolio = null;
      state.error = null;
    },
  },
});

export const { setPortfolio, setLoading, setError, clearPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;