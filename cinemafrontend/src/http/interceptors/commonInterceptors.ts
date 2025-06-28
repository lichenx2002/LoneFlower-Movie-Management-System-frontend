import { RequestInterceptor } from './type';
import RequestConfig from '../core/type';

export const createLoggingInterceptor = (): RequestInterceptor => ({
    beforeRequest: (config: RequestConfig) => {
        // console.log('Request:', config);
        return config;
    },
    afterRequest: (response: Response) => {
        // console.log('Response:', response);
        return response;
    },
    onError: (error: any) => {
        console.error('Error:', error);
        return error;
    },
    config: {
        enabled: true,
        priority: 1
    }
});

export const createAuthInterceptor = (): RequestInterceptor => ({
    beforeRequest: (config: RequestConfig) => {
        // 只处理需要认证的请求
        if (config.url?.includes('/api/admin/')) {
            const token = localStorage.getItem('admin_token');
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                };
            } else {
                // 如果没有token，可以选择抛出错误或继续请求
                console.warn('No admin token found for admin API request');
            }
        }
        return config;
    },
    onError: (error: any) => {
        // 处理认证相关的错误
        if (error.status === 401) {
            // 清除无效的token
            localStorage.removeItem('admin_token');
            // 可以在这里添加重定向到登录页面的逻辑
            console.warn('Authentication failed, please login again');
        }
        return error;
    },
    config: {
        enabled: true,
        priority: 2
    }
});

// 重试拦截器
export const createRetryInterceptor = (maxRetries: number = 3): RequestInterceptor => ({
    beforeRequest: async (config: RequestConfig) => {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                return config;
            } catch (error) {
                retries++;
                if (retries === maxRetries) {
                    throw error;
                }
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
        return config;
    },
    config: {
        enabled: true,
        priority: 3
    }
});