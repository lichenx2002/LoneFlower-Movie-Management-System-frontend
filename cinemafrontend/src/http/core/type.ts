export default interface RequestConfig extends RequestInit {
    params?: Record<string, any>;
    url?: string;
}

export type HeadersInit = Headers | Record<string, string> | Array<[string, string]>;

export type Response = globalThis.Response;