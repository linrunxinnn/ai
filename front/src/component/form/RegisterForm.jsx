import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { MailOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";

const RegisterForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleGetCode = async () => {
    try {
      const email = form.getFieldValue("email");
      if (!email) {
        message.warning("请先输入邮箱");
        return;
      }
      form.validateFields(["email"]);
      setCodeLoading(true);
      // 模拟发送验证码
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("验证码已发送");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // 验证失败不处理
    } finally {
      setCodeLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`注册成功，欢迎 ${values.email}`);
    } catch {
      message.error("注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card style={{ width: 400, border: "none" }}>
        <Form form={form} onFinish={handleRegister} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Form.Item
              name="code"
              rules={[{ required: true, message: "请输入验证码" }]}
              style={{ display: "inline-block", width: "60%" }}
            >
              <Input prefix={<SafetyOutlined />} placeholder="验证码" />
            </Form.Item>
            <Form.Item
              style={{
                display: "inline-block",
                width: "38%",
                marginLeft: "2%",
              }}
            >
              <Button
                onClick={handleGetCode}
                disabled={countdown > 0}
                loading={codeLoading}
                block
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </Button>
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
