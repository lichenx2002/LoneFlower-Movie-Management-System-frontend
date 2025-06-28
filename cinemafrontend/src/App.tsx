import React, { Suspense } from 'react';
import AppLayout from "./layout/AppLayout";
import { BrowserRouter, Routes, Route, HashRouter,  } from 'react-router-dom';
import { navRoutes } from "./routes/nav-routes";
import { adminRoutesWithLayout } from "./routes/admin-routes";
import { Provider } from 'react-redux';
import store from './redux/store';
import './styles/App.css';  // 确保导入样式文件
import Login from './page/Login';
import Register from './page/Register';
import AuthProvider, { useAuth } from './context/AuthContext';
import AdminLogin from './page/Admin/AdminLogin';
import AdminRegister from './page/Admin/AdminRegister';
import AdminProtectedRoute from './routes/AdminProtectedRoute';


function App() {
    const renderRoutes = (routes: typeof navRoutes) => {
        return routes.map((route) => (
            <Route
                key={route.path}
                path={route.path}
                element={
                    route.children && route.children.length > 0 ? (
                        <route.component />
                    ) : (
                        <route.component />
                    )
                }
            >
                {route.children && route.children.map((childRoute) => (
                    <Route
                        key={childRoute.path}
                        path={childRoute.path}
                        element={<childRoute.component />}
                    />
                ))}
            </Route>
        ));
    };

    const renderAdminRoutes = (routes: typeof adminRoutesWithLayout) => {
        return routes.map((route) => (
            <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
            />
        ));
    };

    return (
        <Provider store={store}>
            <AuthProvider>
                <Suspense fallback={<div>加载中...</div>}>
                    <BrowserRouter>
                        <div className="App">
                            <Routes>
                                {/* 前台路由使用AppLayout */}
                                <Route path="/*" element={
                                    <AppLayout>
                                        <Routes>
                                            {renderRoutes(navRoutes)}
                                        </Routes>
                                    </AppLayout>
                                } />
                                {/* 后台路由直接渲染，不使用AppLayout */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin/register" element={<AdminRegister />} />
                                <Route
                                    path="/admin/*"
                                    element={
                                        <AdminProtectedRoute>
                                            <Routes>
                                                {adminRoutesWithLayout
                                                    .filter(r => r.path !== '/admin/login' && r.path !== '/admin/register')
                                                    .map(route => (
                                                        <Route key={route.path} path={route.path.replace('/admin', '') || '/'} element={<route.component />} />
                                                    ))}
                                            </Routes>
                                        </AdminProtectedRoute>
                                    }
                                />
                            </Routes>
                            <AuthPages />
                        </div>
                    </BrowserRouter>
                </Suspense>
            </AuthProvider>
        </Provider>
    );
}

const AuthPages: React.FC = () => {
    const { showLogin, showRegister, setShowLogin, setShowRegister } = useAuth();

    return (
        <>
            {showLogin && (
                <div className="auth-overlay">
                    <Login
                        onClose={() => setShowLogin(false)}
                        onToRegister={() => {
                            setShowLogin(false);
                            setShowRegister(true);
                        }}
                    />
                </div>
            )}
            {showRegister && (
                <div className="auth-overlay">
                    <Register
                        onClose={() => setShowRegister(false)}
                        onRegisterSuccess={() => {
                            setShowRegister(false);
                            setShowLogin(true);
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default App;
