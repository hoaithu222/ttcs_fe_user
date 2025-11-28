import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ServiceManagerState {
  notionApp: any;
}

const initialState: ServiceManagerState = {
  notionApp: null,
};

const serviceManagerSlice = createSlice({
  name: "serviceManager",
  initialState,
  reducers: {
    requestGetNotionApp: (state) => {
      // Placeholder action
    },
  },
});

export const { requestGetNotionApp } = serviceManagerSlice.actions;
export default serviceManagerSlice.reducer;

