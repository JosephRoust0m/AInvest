import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  advisors: [],
};

const advisorsSlice = createSlice({
  name: 'advisors',
  initialState,
  reducers: {
    setAdvisors: (state, action) => {
      state.advisors = action.payload;
    },
    clearAdvisors: (state) => {
      state.advisors = [];
    },
  },
});

export const { setAdvisors, clearAdvisors } = advisorsSlice.actions;
export default advisorsSlice.reducer;
