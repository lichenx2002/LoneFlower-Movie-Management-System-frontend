import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  FileOutlined,
  CalendarOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  CommentOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { adminLogout } from '../redux/adminAuth/thunks';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((state: RootState) => state.adminAuth.admin);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch<any>(adminLogout());
    navigate('/admin/login');
  };

  // 新的分组菜单结构，所有名称唯一且规范
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '仪表板',
      onClick: () => navigate('/admin')
    },
    {
      key: 'movie-group',
      icon: <FileOutlined />,
      label: '电影业务',
      children: [
        {
          key: '/admin/movies',
          icon: <FileOutlined />,
          label: '电影信息',
          onClick: () => navigate('/admin/movies')
        },
        {
          key: '/admin/schedules',
          icon: <CalendarOutlined />,
          label: '场次信息',
          onClick: () => navigate('/admin/schedules')
        },
        {
          key: '/admin/cinemas',
          icon: <HomeOutlined />,
          label: '影院信息',
          onClick: () => navigate('/admin/cinemas')
        },
        {
          key: '/admin/halls',
          icon: <HomeOutlined />,
          label: '影厅信息',
          onClick: () => navigate('/admin/halls')
        }
      ]
    },
    {
      key: 'user-group',
      icon: <TeamOutlined />,
      label: '用户业务',
      children: [
        {
          key: '/admin/orders',
          icon: <ShoppingCartOutlined />,
          label: '订单信息',
          onClick: () => navigate('/admin/orders')
        },
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: '用户信息',
          onClick: () => navigate('/admin/users')
        },
        {
          key: '/admin/comments',
          icon: <CommentOutlined />,
          label: '评论信息',
          onClick: () => navigate('/admin/comments')
        }
      ]
    }
  ];

  // 处理菜单点击
  const handleMenuClick = (info: any) => {
    const item = findMenuItemByKey(menuItems, info.key);
    if (item && item.onClick) {
      item.onClick();
    }
  };

  // 递归查找菜单项
  function findMenuItemByKey(items: any[], key: string): any {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findMenuItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  }

  // 处理选中项
  const getSelectedKeys = () => {
    // 只高亮二级菜单项
    const path = location.pathname;
    return [path];
  };

  // 处理展开项
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/movies') || path.startsWith('/admin/schedules') || path.startsWith('/admin/cinemas') || path.startsWith('/admin/halls')) {
      return ['movie-group'];
    }
    if (path.startsWith('/admin/orders') || path.startsWith('/admin/users') || path.startsWith('/admin/comments')) {
      return ['user-group'];
    }
    return [];
  };

  // openKeys state，支持手动和自动展开
  const [openKeys, setOpenKeys] = useState<string[]>(getOpenKeys());
  useEffect(() => {
    setOpenKeys(getOpenKeys());
    // eslint-disable-next-line
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{
            margin: 0,
            color: '#1890ff',
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold'
          }}>
            {collapsed ? '孤芳电影' : '孤芳电影管理系统'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          style={{ borderRight: 0 }}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space>
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              返回前台
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: handleLogout
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{admin?.name || admin?.username || '管理员'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 