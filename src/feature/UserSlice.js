import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  userInfo: null,
  loginHistory: [],
  error: null,
};

export const storeUserInfo = createAsyncThunk(
  "user/storeUserInfo",
  async ({ userId, deviceInfo }, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/store-user-info",
        { userId, deviceInfo }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchLoginHistory = createAsyncThunk(
  "user/fetchLoginHistory",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}/login-history`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userInfo = null;
      state.loginHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(storeUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(storeUserInfo.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchLoginHistory.fulfilled, (state, action) => {
        state.loginHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchLoginHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { login, logout } = UserSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectUserInfo = (state) => state.user.userInfo;
export const selectLoginHistory = (state) => state.user.loginHistory;
export const selectError = (state) => state.user.error;
export default UserSlice.reducer;
