import { HeadersInit } from '../core/type';

export class HeadersBuilder {
    private headers: Headers;

    constructor() {
        this.headers = new Headers();
    }

    setContentType(method: string, body?: any): this {
        if (method === 'GET') {
            return this;
        }

        if (body instanceof FormData) {
            // FormData 不需要设置 Content-Type
            return this;
        }

        if (body instanceof URLSearchParams) {
            this.headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            this.headers.set('Content-Type', 'application/json');
        }
        return this;
    }

    setAuthHeader(token: string): this {
        if (token) {
            this.headers.set('Authorization', `Bearer ${token}`);
        }
        return this;
    }

    setCustomHeaders(headers: HeadersInit): this {
        if (headers instanceof Headers) {
            headers.forEach((value, key) =>
                this.headers.set(key, value));
        } else if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                this.headers.set(key, String(value));
            });
        }
        return this;
    }

    getHeaders(): Headers {
        return this.headers;
    }
}