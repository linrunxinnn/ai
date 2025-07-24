import { message } from "antd";
import api from "../index";

export const login = async (credentials) => {
  try {
    const response = await api.post("/user/loginbypassword", credentials);
    return response.data;
  } catch (error) {
    message.error("登录失败");
    console.log("登录失败", error);
    throw error;
  }
};

export const faceLogin = async () => {};

// export const logout = async () => {
//   try {
//     const response = await api.post("/logout");
//     return response.data;
//   } catch (error) {
//     console.error("Logout failed", error);
//     throw error;
//   }
// };
