import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RiskProfile } from '../../types';

interface RiskProfileState {
  currentProfile: RiskProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: RiskProfileState = {
  currentProfile: null,
  loading: false,
  error: null,
};

const riskProfileSlice = createSlice({
  name: 'riskProfile',
  initialState,
  reducers: {
    setRiskProfile: (state, action: PayloadAction<RiskProfile>) => {
      state.currentProfile = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRiskProfile: (state) => {
      state.currentProfile = null;
      state.error = null;
    },
  },
});

export const { setRiskProfile, setLoading, setError, clearRiskProfile } = riskProfileSlice.actions;
export default riskProfileSlice.reducer;