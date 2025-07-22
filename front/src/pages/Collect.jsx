import React, { useEffect, useRef, useState } from "react";
import { Button, Progress, message, Alert } from "antd";
import style from "./Collect.module.css";

const Collect = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [collecting, setCollecting] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const maxImages = 100;
  const intervalTime = 5000; // 5秒

  useEffect(() => {
    // 打开摄像头
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(() => {
        message.error("无法访问摄像头");
      });

    return () => {
      // 组件销毁时关闭摄像头
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (collecting) {
      timer = setInterval(() => {
        if (capturedImages.length >= maxImages) {
          clearInterval(timer);
          setCollecting(false);
          message.success("采集完成！");
          return;
        }
        captureImage();
      }, intervalTime);
    }
    return () => clearInterval(timer);
  }, [collecting, capturedImages]);

  const captureImage = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const image = canvasRef.current.toDataURL("image/png");
    setCapturedImages((prev) => [...prev, image]);
    setProgress(((capturedImages.length + 1) / maxImages) * 100);
  };

  const handleStart = () => {
    if (!videoRef.current.srcObject) {
      message.warning("摄像头未就绪");
      return;
    }
    setCapturedImages([]);
    setProgress(0);
    setCollecting(true);
  };

  return (
    <div className={style.main}>
      <div className={style.container}>
        <video
          ref={videoRef}
          width="320"
          height="240"
          style={{ border: "1px solid #ccc" }}
        />
        <canvas
          ref={canvasRef}
          width="320"
          height="240"
          style={{ display: "none" }}
        />
        <div>
          <Button type="primary" onClick={handleStart} disabled={collecting}>
            {collecting ? "采集中..." : "开始采集"}
          </Button>
        </div>
        <div style={{ width: 320 }}>
          <Progress
            percent={progress}
            status={collecting ? "active" : "normal"}
          />
        </div>
        <Alert message="请缓慢转动头部，让系统采集更多角度" type="info" />
        <div style={{ marginTop: 10 }}>
          已采集：{capturedImages.length} / {maxImages}
        </div>
      </div>
    </div>
  );
};

export default Collect;
