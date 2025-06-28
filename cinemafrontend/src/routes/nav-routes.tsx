import React from "react";
import Home from "../page/Home";
const Movies = React.lazy(() => import("../page/Movies"));
const Rank = React.lazy(() => import("../page/Rank"));
const Orders = React.lazy(() => import("../page/Orders"));
const MovieDetail = React.lazy(() => import("../page/MovieDetail"));
const ScheduleSelection = React.lazy(() => import("../page/ScheduleSelection"));
const SeatSelection = React.lazy(() => import("../page/SeatSelection"));
const OrderConfirm = React.lazy(() => import("../page/OrderConfirm"));
const OrderDetail = React.lazy(() => import("../page/OrderDetail"));
const Profile = React.lazy(() => import("../page/Profile"));
const HallTemplateEdit = React.lazy(() => import("../components/HallTemplateEdit"));
const QRVerification = React.lazy(() => import("../page/QRVerification"));



interface Route {
    id: number;
    path: string;
    name: string;
    component: React.ComponentType;
    exact?: boolean
    ssr?: boolean // 是否启用服务端渲染
    children?: Route[]; // 新增嵌套路由支持
    showInNav: boolean;
}


export const navRoutes: Route[] = [
    {
        id: 1,
        path: '/',
        name: '首页',
        component: Home,
        ssr: true,
        showInNav: true
    }, {
        id: 2,
        path: '/movies',
        name: '电影',
        component: Movies,
        ssr: true,
        showInNav: true,
        children: [


        ]
    }, {
        id: 3,
        path: '/rank',
        name: '排名',
        component: Rank,
        ssr: true,
        showInNav: true
    }, {
        id: 4,
        path: '/orders',
        name: '订单',
        component: Orders,
        ssr: true,
        showInNav: true,
        children: [
            {
                id: 42,
                path: ':orderId',
                name: '订单详情',
                component: OrderDetail,
                showInNav: false
            }
        ]
    }, {
        id: 5,
        path: '/orders/confirm/:userId/:orderId',
        name: '订单确认',
        component: OrderConfirm,
        showInNav: false
    }, {
        id: 6,
        path: '/MovieDetail/:id',
        name: '电影详情',
        component: MovieDetail,
        showInNav: false,
        children: [
            {
                id: 61,
                path: 'schedule',
                name: '场次选择',
                component: ScheduleSelection,
                showInNav: false
            },
        ]
    }, {
        id: 7,
        path: '/seat/movies/:id/schedule/:scheduleId',
        name: '选座',
        component: SeatSelection,
        showInNav: false
    }, {
        id: 8,
        path: '/profile',
        name: '个人信息',
        component: Profile,
        showInNav: false
    }, {
        id: 9,
        path: '/halltemplateEdit',
        name: '影厅模板编辑',
        component: HallTemplateEdit,
        showInNav: false
    }, {
        id: 10,
        path: '/qr-verification/:orderId',
        name: '二维码验证',
        component: QRVerification,
        showInNav: false
    }
]