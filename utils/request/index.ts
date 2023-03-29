import axios from 'axios';
import { mergeUrlWithParams } from '@utils/url';

//const BASE_URL = 'https://api.metamail.ink/';
const BASE_URL = 'http://localhost:8080';
//const BASE_URL = 'https://api-v2.metamail.ink/';
const ajax = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});

ajax.defaults.headers.common['Access-Control-Allow-Origin'] = 'http://localhost:8080';
//ajax.defaults.headers.common['Access-Control-Allow-Origin'] = 'https://api.metamail.ink/';
//ajax.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
//ajax.defaults.headers.common['Access-Control-Allow-Origin'] = 'https://api-v2.metamail.ink/';

type requestParams = Record<string, any>;

const checkResponse = (res: any) => {
  console.log(res);
  if (res && (res?.status === 200 || res?.status === 304)) {
    return res?.data ?? {};
  }
};

const checkLoginStatus = (e: unknown) => {
  console.log(e);
};

const checkAPIConnected = (e: any) => {
  if (e?.response?.data?.error) return true;
  else return false;
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
        console.log(e)
      }

      return checkResponse(res);
    },

    get: async (params: requestParams = {}, config: requestParams = {}) => {
      let res;
      const _url = mergeUrlWithParams(url, params);
      console.log(_url);
      try {
        res = await ajax.get(_url, { ...(config ? { ...config } : {}) });
      } catch (e) {
        // const isCancel = axios.isCancel(e);
        checkLoginStatus(e);
        if (checkAPIConnected(e)) {
          return 404;
          }
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

    put: async (params: requestParams = {}, config: requestParams = {}) => {
      let res;
      try {
        res = await ajax.put(url, params, {
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
