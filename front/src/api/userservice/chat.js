import aiApi from "../aiapi.js";
import { getUserInfo } from "../../store/slice/userSlice.js";
import { useSelector } from "react-redux";

//一个发送信息的接口
//在home页面的onSend回调中调用
export const sendMessage = async (message) => {
  console.log("发送信息：", message);
  try {
    console.log("发送信息的用户ID：", message);
    const response = await aiApi.post("", { ...message });
    console.log("发送信息成功，响应数据：", response.data);
    return response.data;
  } catch (error) {
    console.error("发送信息失败：", error);
    throw error;
  }
};

//一个用来轮询接收信息的接口
export const receiveMessages = async () => {
  try {
    const response = await aiApi.post("", {
      user_id: JSON.parse(localStorage.getItem("user")).id,
      type: "question",
    });

    //!这里为什么返回为空
    console.log("接收信息成功，响应数据：", response);
    return response;
  } catch (error) {
    console.error("接收信息失败：", error);
    throw error;
  }
};

//给ai返回一个用户的id
