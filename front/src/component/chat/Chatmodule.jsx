import React, { useState, useRef, useEffect } from "react";
import { Button, Input, message } from "antd";
import {
  SendOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from "@ant-design/icons";
import styles from "./ChatModule.module.css";
import { sendMessage, receiveMessages } from "../../api/userservice/chat.js";
// import { encrypt } from "../../component/secret/encrypt.js";
const { TextArea } = Input;
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { encryptData } from "../../utils/encrypt.js";

const ChatModule = ({ onSend, initialMessages = [], getTitle }) => {
  // const [messages, setMessages] = useState(initialMessages);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  // const [activated, setActivated] = useState(initialMessages.length > 0);
  const [activated, setActivated] = useState(false);
  const messageEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id; // 假设用户ID存

  // 语音识别配置
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // ✅ 允许持续识别直到用户手动停止
      recognition.interimResults = false; // 如果需要实时中间结果可以设为 true
      recognition.lang = "zh-CN";

      recognition.onstart = () => {
        setIsListening(true);
        message.info("开始语音识别...");
      };

      recognition.onend = () => {
        // 注意：这只会在手动停止或出错时调用
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        setInput((prev) => prev + transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        message.error("语音识别出错：" + event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);
  // useEffect(() => {
  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;
  //   if (SpeechRecognition) {
  //     const recognition = new SpeechRecognition();
  //     recognition.continuous = false;
  //     recognition.interimResults = false;
  //     recognition.lang = "zh-CN";

  //     recognition.onstart = () => {
  //       setIsListening(true);
  //       message.info("开始语音识别...");
  //     };

  //     recognition.onend = () => {
  //       setIsListening(false);
  //     };

  //     recognition.onresult = (event) => {
  //       const transcript = event.results[0][0].transcript;
  //       setInput((prev) => prev + transcript);
  //       message.success("语音识别完成");
  //     };

  //     recognition.onerror = (event) => {
  //       setIsListening(false);
  //       message.error("语音识别失败，请重试");
  //     };

  //     recognitionRef.current = recognition;
  //   }
  // }, []);

  // 发送消息

  const handleSend = async () => {
    setIsSending(true); // 禁用发送
    recognitionRef.current.stop(); // 停止语音识别
    if (input.trim()) {
      const newMessage = {
        content: input.trim(),
        role: "user",
        timestamp: new Date(),
      };

      //如果为第一条信息，则调用getTitle函数
      if (messages.length === 0) {
        getTitle(newMessage.content);
      }

      //发送信息
      try {
        //! 记得加密解密
        setActivated(true);
        const id = user.id;
        delete user.id; // 删除id字段
        const response = await sendMessage({
          user_id: id,
          info: { ...user },
          input: { type: "text", content: newMessage.content },
        });
        user.id = id; // 恢复id字段
        //这里注意ai返回的信息格式
        setMessages((prev) => [...prev, newMessage]);
        pollForAIResponse();
      } catch (error) {
        message.error("发送信息失败，请稍后重试");
        setMessages((prev) => [
          ...prev,
          {
            content: "发送失败，请稍后重试",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        setIsSending(false);
      }

      console.log("发送信息：", newMessage.content);

      // try {
      //   await changeUserData({
      //     name: "linlinlin1",
      //   });
      //   console.log("更新用户数据成功");
      // } catch (error) {
      //   console.error("更新用户数据失败", error);
      // }

      // try {
      //   const response = await getUserInfo(userId);
      //   console.log("fasongId", userId);
      //   console.log("获取用户信息成功", response);
      //   message.success("获取用户信息成功");
      // } catch (error) {
      //   console.error("获取用户信息失败", error);
      // }

      setInput("");

      //轮询获取回复
      // pollForAIResponse(hash);
    }
  };

  const pollForAIResponse = (hash) => {
    let retries = 0;
    const maxRetries = 10;
    const interval = 1500;

    const poller = setInterval(async () => {
      const response = await receiveMessages();
      console.log("轮询接收信息：", response);
      const data = await response.data;
      // 如果获取到的结果type:"processing"则轮询
      if (data?.type === "processing") {
        // 继续轮询
        return;
      }
      //如果获取到的结果是type:"summary"则生成一个总结表，并提供下载
      const generatePDF = (output) => {
        // 创建PDF文档
        const doc = new jsPDF();

        // 1. 添加标题
        doc.setFontSize(18);
        doc.text("政务服务办理摘要", 105, 20, { align: "center" });

        // 2. 添加分类信息
        doc.setFontSize(14);
        doc.text(`业务分类: ${output.classify}`, 15, 40);

        // 3. 添加表格数据
        doc.setFontSize(12);
        doc.text("相关信息表格:", 15, 60);

        // 转换表格数据为AutoTable需要的格式
        const tableData = output.tables.map((item) => [
          item.name || "",
          item.age || "",
          item.gender || "",
          item.idNumber || "",
        ]);

        // 添加表格
        doc.autoTable({
          startY: 65,
          head: [["姓名", "年龄", "性别", "身份证号"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: [22, 160, 133],
            textColor: 255,
          },
        });

        // 4. 添加办理流程（自动处理换行）
        doc.setFontSize(12);
        doc.text("办理流程:", 15, doc.autoTable.previous.finalY + 20);

        // 处理流程文本的换行
        const splitText = doc.splitTextToSize(output.flow, 180);
        doc.text(splitText, 15, doc.autoTable.previous.finalY + 30);

        // 5. 添加生成时间
        const date = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.text(`生成时间: ${date}`, 15, doc.internal.pageSize.height - 10);

        // 保存PDF
        doc.save(`政务服务摘要_${output.classify}.pdf`);
      };

      // 在你的条件判断中调用
      if (data?.type === "summary") {
        generatePDF(data.output);
        message.success("总结已生成并下载");
        return;
      }

      console.log("轮询接收信息成功1111，响应数据：", data);
      // 收到最终回复
      clearInterval(poller);
      setMessages((prev) => [
        ...prev,
        { ...data.data, role: "assistant", timestamp: new Date() },
      ]);
      setIsSending(false);
    }, interval);

    // const poller = setInterval(() => {
    //   retries++;

    //   // 模拟 AI 返回内容（你可以替换为实际 fetch 请求）
    //   const mockAIResponse = {
    //     content: "这是AI的回复内容。",
    //     role: "assistant",
    //     timestamp: new Date(),
    //   };

    //   // 模拟第3次轮询收到回复
    //   if (retries === 3) {
    //     clearInterval(poller);
    //     setMessages((prev) => [...prev, mockAIResponse]);
    //     setIsSending(false); // 启用发送按钮

    //     // 朗读文字
    //     speakText(mockAIResponse.content);
    //   }

    //   if (retries >= maxRetries) {
    //     clearInterval(poller);
    //     setIsSending(false);
    //     message.error("AI未及时回复，请稍后重试");
    //   }
    // }, interval);
  };

  //将文字转语音
  function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    window.speechSynthesis.speak(utterance);
  }

  // 开始语音识别
  const startListening = () => {
    if (!recognitionRef.current) {
      message.error("您的浏览器不支持语音识别功能");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        message.error("启动语音识别失败");
      }
    }
  };

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染输入区域
  const renderInputArea = () => (
    <div
      className={activated ? styles.chatFooter : styles.initialInputContainer}
    >
      <div className={styles.inputArea}>
        <TextArea
          className={styles.textArea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          autoSize={{ minRows: 2, maxRows: 5 }}
          placeholder="请输入内容..."
        />
        <div className={styles.chatActions}>
          <Button
            icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
            onClick={startListening}
            className={`${styles.voiceButton} ${
              isListening ? styles.listening : ""
            }`}
            type={isListening ? "primary" : "default"}
            danger={isListening}
          >
            {isListening ? "停止录音" : "语音输入"}
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim() || isSending} // 添加 isSending 条件
            className={styles.sendButton}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );

  // 如果未激活，显示初始居中布局
  if (!activated) {
    return (
      <div className={styles.chatWrapper}>
        <div className={styles.initialState}>
          <h1 className={styles.title}>欢迎来到多智能体协同辅助政务服务助手</h1>
          {renderInputArea()}
        </div>
      </div>
    );
  }

  // 激活后的布局
  return (
    <div className={styles.chatWrapper}>
      <div className={styles.activatedLayout}>
        <div className={styles.chatContent} ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.chatMessage} ${
                msg.role === "user" ? styles.messageRight : styles.messageLeft
              }`}
            >
              <div
                className={
                  msg.role === "user"
                    ? styles.chatMessageUser
                    : styles.chatMessageAI
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        {renderInputArea()}
      </div>
    </div>
  );
};

export default ChatModule;
