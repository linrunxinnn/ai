import React from "react";
import { Tabs } from "antd";
import LoginForm from "../component/form/LoginForm.jsx";
import RegisterForm from "../component/form/RegisterForm.jsx";
import ResetForm from "../component/form/ResetForm.jsx";
import style from "./Sign.module.css";

const onChange = (key) => {
  // console.log(key);
};
const items = [
  {
    key: "1",
    label: "登录",
    children: <LoginForm />,
  },
  {
    key: "2",
    label: "注册",
    children: <RegisterForm />,
  },
  {
    key: "3",
    label: "找回密码",
    children: <ResetForm />,
  },
];
const Sign = () => (
  <div className={style.main}>
    <div className={style.container}>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  </div>
);
export default Sign;
