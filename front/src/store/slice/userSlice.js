import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login } from "../../api/userservice/user.js";

//导入axios的登录，退出账号等，这里假定导入为axios

//登录
export const loginUser = createAsyncThunk(
  "", //登录用户API
  async (userData, { rejectWithValue }) => {
    try {
      const response = await login(userData);
      // 假设login函数返回的response.data包含user, token, role等信息
      if (!response || !response.user || !response.token || !response.role) {
        throw new Error("Invalid response structure");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// // 获取用户信息
// export const fetchUserInfo = createAsyncThunk(
//   "", //获取用户信息API
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await axios.getUserInfo(userId);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: localStorage.getItem("token") ? localStorage.getItem("token") : null,
    loading: false,
    error: null,
  },
  reducers: {
    //登录存入信息
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    //获取用户信息
    getUserInfo: (state, action) => {
      state.user = action.payload;
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
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, loginSuccess } = userSlice.actions;
export default userSlice.reducer;
