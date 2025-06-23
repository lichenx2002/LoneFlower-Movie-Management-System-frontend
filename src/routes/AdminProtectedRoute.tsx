import React from 'react';
import { useSelector} from "react-redux";
import {Navigate, useLocation} from "react-router-dom";
import { RootState } from "../redux/store";


const AdminProtectedRoute: React.FC<{children:React.ReactNode}> = ({children}) => {

    const isAuthenticated = useSelector((state: RootState) => state.adminAuth.isAuthenticated);
    const location = useLocation();

    if(!isAuthenticated) {

        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};

export default AdminProtectedRoute;