import React from "react";
import AdminLayout from "../layout/AdminLayout";
import AdminLogin from '../page/Admin/AdminLogin';
import AdminRegister from '../page/Admin/AdminRegister';

// 懒加载后台管理页面
const Dashboard = React.lazy(() => import("../page/Admin/Dashboard"));
const MovieManagement = React.lazy(() => import("../page/Admin/MovieManagement"));
const ScheduleManagement = React.lazy(() => import("../page/Admin/ScheduleManagement"));
const HallManagement = React.lazy(() => import("../page/Admin/HallManagement"));
const CommentManagement = React.lazy(() => import("../page/Admin/CommentManagement"));
const OrderManagement = React.lazy(() => import("../page/Admin/OrderManagement"));
const UserManagement = React.lazy(() => import("../page/Admin/UserManagement"));
const CinemaManagement = React.lazy(() => import("../page/Admin/CinemaManagement"));

interface AdminRoute {
  id: number;
  path: string;
  name: string;
  component: React.ComponentType;
  exact?: boolean;
  showInNav: boolean;
}

export const adminRoutes: AdminRoute[] = [
  {
    id: 1,
    path: '/admin',
    name: '仪表板',
    component: Dashboard,
    showInNav: true
  },
  {
    id: 2,
    path: '/admin/movies',
    name: '电影管理',
    component: MovieManagement,
    showInNav: true
  },
  {
    id: 3,
    path: '/admin/schedules',
    name: '场次管理',
    component: ScheduleManagement,
    showInNav: true
  },
  {
    id: 4,
    path: '/admin/halls',
    name: '影厅管理',
    component: HallManagement,
    showInNav: true
  },
  {
    id: 5,
    path: '/admin/comments',
    name: '评论管理',
    component: CommentManagement,
    showInNav: true
  },
  {
    id: 6,
    path: '/admin/orders',
    name: '订单管理',
    component: OrderManagement,
    showInNav: true
  },
  {
    id: 7,
    path: '/admin/users',
    name: '用户管理',
    component: UserManagement,
    showInNav: true
  },
  {
    id: 8,
    path: '/admin/cinemas',
    name: '影院管理',
    component: CinemaManagement,
    showInNav: true
  },
  {
    id: 9,
    path: '/admin/login',
    name: '登录',
    component: AdminLogin,
    showInNav: false
  },
  {
    id: 10,
    path: '/admin/register',
    name: '注册',
    component: AdminRegister,
    showInNav: false
  }
];

// 包装组件，使用AdminLayout
const AdminRouteWrapper: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
};

// 生成带AdminLayout的路由，登录和注册页面不包裹AdminLayout
export const adminRoutesWithLayout = adminRoutes.map(route => {
  if (route.path === '/admin/login' || route.path === '/admin/register') {
    return route;
  }
  return {
    ...route,
    component: () => <AdminRouteWrapper component={route.component} />
  };
}); 