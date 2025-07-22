import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

//导入axios的登录，退出账号等，这里假定导入为axios

//登录
export const loginUser = createAsyncThunk(
  "", //登录用户API
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/login", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 获取用户信息
export const fetchUserInfo = createAsyncThunk(
  "", //获取用户信息API
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.getUserInfo(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
    token: localStorage.getItem("token") ? localStorage.getItem("token") : null,
    role: localStorage.getItem("role") ? localStorage.getItem("role") : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.error = null;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
