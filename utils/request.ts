import { useRouter } from 'next/router'
import axios from 'axios';
import { mergeUrlWithParams } from './url';

const BASE_URL = 'https://api.metamail.ink/';

const ajax = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});

// ajax.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
ajax.defaults.headers.common['Access-Control-Allow-Origin'] ='https://api.metamail.ink/';

type requestParams = Record<string, any>;

const checkResponse = (res: any) => {
  if (res && (res?.status === 200 || res?.status === 304)) {
    return res?.data ?? {};
  }
};

const checkLoginStatus = (e: unknown) => {

};

const request = (url: string, config?: Record<string, string>) => {
  return {
    post: async (params: requestParams = {}, config: requestParams = {}) => {
      let res;
      try {
        res = await ajax.post(url, params, {
          ...(config ? { ...config } : {}),
        });
      } catch (e) {
        // const isCancel = axios.isCancel(e);
        checkLoginStatus(e);
      }

      return checkResponse(res);
    },

    get: async (params: requestParams = {}, config: requestParams = {}) => {
      let res;
      const _url = mergeUrlWithParams(url, params);
      try {
        res = await ajax.get(_url, { ...(config ? { ...config } : {}) });
      } catch (e) {
        // const isCancel = axios.isCancel(e);
        checkLoginStatus(e);
      }

      return checkResponse(res);
    },

    patch: async (params: requestParams = {}, config: requestParams = {}) => {
      let res;
      try {
        res = await ajax.patch(url, params, {
          ...(config ? { ...config } : {}),
        });
      } catch (e) {
        checkLoginStatus(e);
      }

      return checkResponse(res);
    },

    delete: async (config: requestParams = {}) => {
      let res;
      try {
        res = await ajax.delete(url, {
          ...(config ? { ...config } : {}),
        });
      } catch (e) {
        checkLoginStatus(e);
      }

      return checkResponse(res);
    },
  };
};

export default request;
