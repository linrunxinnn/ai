import React from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Typography,
  Space,
  message,
} from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import qg from "../../assets/qg.png";
const { Header } = Layout;
const { Title } = Typography;
import style from "./Header.module.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HeaderBar = ({ title }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    //退出登录
    message.success("退出登录成功");
    navigate("/");
  };

  const menuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: onLogout,
    },
  ];

  //获取用户的信息
  // const user = useSelector((state) => state.user.user);
  const user = {
    username: "张三",
    avatar: qg, // 示例头像链接
  };

  return (
    <Header className={style.header}>
      {/* 左侧 Logo */}
      <div className={style.logoContainer}>
        <img src={qg} alt="Logo" className={style.logo} />
      </div>

      {/* 中间标题 */}
      <Title level={4} className={style.title}>
        {title}
      </Title>

      {/* 右侧头像 + 下拉菜单 */}
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space className={style.userInfo}>
          <Avatar
            size="large"
            icon={user ? <UserOutlined /> : null}
            src={user ? user.avatar : null}
          />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default HeaderBar;
