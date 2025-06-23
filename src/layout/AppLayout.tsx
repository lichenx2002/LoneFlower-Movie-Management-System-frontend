import React from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// @ts-ignore
import styles from './AppLayout.module.css';
import { Watermark } from 'antd';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className={styles['app-layout']}>
            <Navbar />
            <Watermark content="孤芳电影">
                <main className={styles['main-content']}>
                    {children}
                </main>
            </Watermark>
            <div style={{ flex: 1 }} />
            <Footer />
        </div>
    );
};

export default AppLayout;