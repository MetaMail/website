import axios, { Axios, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { userLocalStorage } from 'lib/utils';

//const BASE_URL = 'https://api.metamail.ink/';
//const BASE_URL = 'http://localhost:8080';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-v2.mmail-test.ink/';
export const PostfixOfAddress = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || '@mmail-test.ink';

export abstract class MMHttp {
    private _baseUrl: string;
    private _axios: Axios;
    private static _onUnAuthHandle: () => void;

    static set onUnAuthHandle(onUnAuthHandle: () => void) {
        MMHttp._onUnAuthHandle = onUnAuthHandle;
    }

    constructor() {
        this._baseUrl = BASE_URL;

        this._axios = axios.create({
            baseURL: this._baseUrl,
            withCredentials: true,
            timeout: 10000,
        });

        // 设置拦截器
        this.setInterceptors();
    }

    get baseUrl() {
        return this._baseUrl;
    }

    get axios() {
        return this._axios;
    }

    private setInterceptors() {
        this.axios.interceptors.request.use(
            config => {
                const token = userLocalStorage.getToken();
                if (token) {
                    config.headers.authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );
        //响应拦截
        this.axios.interceptors.response.use(
            res => {
                return this.checkResponse(res);
            },
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    return MMHttp._onUnAuthHandle?.();
                }
                if (error.response?.status === 404) {
                    return Promise.resolve();
                }
                return Promise.reject(error);
            }
        );
    }

    private checkResponse(res: AxiosResponse) {
        if (res && (res.status === 200 || res.status === 304)) {
            return res.data.data;
        }
        if (res && res.status === 401) {
            return MMHttp._onUnAuthHandle?.();
        }
        throw new Error('http error with status: ' + res.status);
    }

    async get<In, Out>(url: string, content?: In, config?: AxiosRequestConfig): Promise<Out> {
        return this.axios.get(url, { ...config, params: content });
    }

    async post<In, Out>(url: string, content?: In, config?: AxiosRequestConfig): Promise<Out> {
        return this.axios.post(url, content, config);
    }

    async patch<In, Out>(url: string, content?: In, config?: AxiosRequestConfig): Promise<Out> {
        return this.axios.patch(url, content, config);
    }

    async put<In, Out>(url: string, content?: In, config?: AxiosRequestConfig): Promise<Out> {
        return this.axios.put(url, content, config);
    }

    async delete<In, Out>(url: string, content?: In, config?: AxiosRequestConfig): Promise<Out> {
        return this.axios.delete(url, { ...config, data: content });
    }
}
