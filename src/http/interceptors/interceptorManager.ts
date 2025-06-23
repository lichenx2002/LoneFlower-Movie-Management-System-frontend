import { RequestInterceptor, InterceptorConfig } from './type';
import RequestConfig from '../core/type';

export class InterceptorManager {
    private interceptors: RequestInterceptor[] = [];

    use(interceptor: RequestInterceptor) {
        this.interceptors.push(interceptor);
        return this.interceptors.length - 1; // 返回拦截器ID
    }

    eject(id: number) {
        this.interceptors.splice(id, 1);
    }

    private getEnabledInterceptors(): RequestInterceptor[] {
        return this.interceptors
            .filter(interceptor => interceptor.config?.enabled !== false)
            .sort((a, b) => (b.config?.priority || 0) - (a.config?.priority || 0));
    }

    async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
        const enabledInterceptors = this.getEnabledInterceptors();
        let finalConfig = { ...config };

        for (const interceptor of enabledInterceptors) {
            if (interceptor.beforeRequest) {
                finalConfig = await interceptor.beforeRequest(finalConfig);
            }
        }

        return finalConfig;
    }

    async applyResponseInterceptors(response: Response): Promise<Response> {
        const enabledInterceptors = this.getEnabledInterceptors();
        let finalResponse = response;

        for (const interceptor of enabledInterceptors) {
            if (interceptor.afterRequest) {
                finalResponse = await interceptor.afterRequest(finalResponse);
            }
        }

        return finalResponse;
    }

    async applyErrorInterceptors(error: any): Promise<any> {
        const enabledInterceptors = this.getEnabledInterceptors();
        let finalError = error;

        for (const interceptor of enabledInterceptors) {
            if (interceptor.onError) {
                finalError = await interceptor.onError(finalError);
            }
        }

        return finalError;
    }
}