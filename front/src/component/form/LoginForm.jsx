import React, { useState } from "react";
import { Card, Tabs, Form, Input, Button, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SmileOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccountLogin = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`登录成功，欢迎 ${values.username}`);
      //这里需要加上判断，如果已经采集过了就跳转到主页，否则跳转到采集页面
      //navigate("/Home");
      navigate("/Collect");
    } catch {
      message.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("人脸识别登录成功");
    } catch {
      message.error("人脸识别失败");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "account",
      label: "账号密码登录",
      children: (
        <Form form={form} onFinish={handleAccountLogin} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "face",
      label: "人脸识别登录",
      children: (
        <Button
          type="primary"
          icon={<SmileOutlined />}
          block
          onClick={handleFaceLogin}
          loading={loading}
        >
          识别人脸并登录
        </Button>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card style={{ width: 400, border: "none" }}>
        <Tabs defaultActiveKey="account" items={tabItems} />
      </Card>
    </div>
  );
};

export default LoginForm;
