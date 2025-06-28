import { StatusHandler } from "../http/handlers/statusHandler";
import RequestConfig from "../http/core/type";
import { HeadersBuilder } from "../http/builders/headers";
import { UrlBuilder } from "../http/builders/url";
import { httpError } from "../http/core/error";
import { InterceptorManager } from "../http/interceptors/interceptorManager";
import { createLoggingInterceptor, createAuthInterceptor, createRetryInterceptor } from "../http/interceptors/commonInterceptors";

const BASE_URL = 'http://localhost:8080'; // 添加后端服务的基础 URL

const interceptorManager = new InterceptorManager();

interceptorManager.use(createLoggingInterceptor());
interceptorManager.use(createAuthInterceptor());
interceptorManager.use(createRetryInterceptor());

const request = async<T>(url: string, config: RequestConfig = {}): Promise<T> => {

    const { params, ...restConfig } = config;

    const urlBuilder = new UrlBuilder(
        url.startsWith('http') ? url : `${BASE_URL}${url}`
    );

    const finalUrl = urlBuilder.addParams(params || {}).build();

    const headersBuilder = new HeadersBuilder()
        .setContentType(restConfig.method || 'GET', restConfig.body);

    // 处理自定义头
    if (restConfig.headers) {
        headersBuilder.setCustomHeaders(restConfig.headers);
    }

    try {

        const interceptedConfig = await interceptorManager.applyRequestInterceptors({
            ...restConfig,
            headers: headersBuilder.getHeaders(),
        })

        const response = await fetch(finalUrl, interceptedConfig);

        const interceptedResponse = await interceptorManager.applyResponseInterceptors(response);

        return await StatusHandler.handle<T>(interceptedResponse, finalUrl);
    } catch (error) {

        const interceptedError = await interceptorManager.applyErrorInterceptors(error);

        if (interceptedError instanceof httpError) {
            throw interceptedError;
        }
        throw new httpError(
            interceptedError instanceof Error ? interceptedError.message : '请求失败',
            0,
            finalUrl,
            { originalError: interceptedError }
        );
    }
}

export const http = {
    get: <T>(url: string, params?: Record<string, any>) =>
        request<T>(url, { method: 'GET', params }),
    post: <T>(url: string, data?: any, config?: RequestConfig) =>
        request<T>(url, { method: 'POST', ...config, body: data instanceof FormData ? data : JSON.stringify(data) }),
    put: <T>(url: string, data?: any) =>
        request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(url: string) =>
        request<T>(url, { method: 'DELETE' })
}