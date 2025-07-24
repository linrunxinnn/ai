import React from "react";
import { useState } from "react";
import Header from "../component/header/Header.jsx";
import ChatModule from "../component/chat/Chatmodule.jsx";
import style from "./Home.module.css";

export default function Home() {
  const [title, setTitle] = React.useState("");

  return (
    <div className={style.container}>
      <Header title={title} />
      <ChatModule
        className={style.chatModule}
        initialMessages={
          [
            // { role: "assistant", content: "你好，我是AI助手。" },
            // { role: "user", content: "你好" },
          ]
        }
        onSend={(message) => {
          console.log("用户发送的消息：", message);
          // 可以调用后端接口、更新聊天记录等
        }}
        getTitle={(titleText) => {
          setTitle(titleText); // 设置标题
        }}
      />
    </div>
  );
}
