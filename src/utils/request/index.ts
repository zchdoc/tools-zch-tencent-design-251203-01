// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
import type { AxiosInstance } from 'axios';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import { ContentTypeEnum } from '@/constants';
import { useUserStore } from '@/store';

import { VAxios } from './Axios';
import type { AxiosTransform, CreateAxiosOptions } from './AxiosTransform';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils';

const env = import.meta.env.MODE || 'development';

// 开发环境使用 Vite 代理，不配置 host
// 生产环境可以通过环境变量 VITE_API_URL 配置后端地址
const rawApiHost = import.meta.env.VITE_API_URL || '';
const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
const host = env === 'development' || (isHttpsPage && rawApiHost.startsWith('http://')) ? '' : rawApiHost;

const authApiTarget = import.meta.env.VITE_AUTH_API_TARGET || 'http://127.0.0.1:8079';
const apiTarget = import.meta.env.VITE_API_TARGET || 'http://127.0.0.1:3000';

// ==================== 请求日志工具 ====================
const LOG_ENABLED = env === 'development'; // 仅开发环境打印日志

const logStyles = {
  request: 'background: #3498db; color: white; padding: 2px 6px; border-radius: 3px;',
  response: 'background: #2ecc71; color: white; padding: 2px 6px; border-radius: 3px;',
  error: 'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px;',
  mock: 'background: #9b59b6; color: white; padding: 2px 6px; border-radius: 3px;',
  api: 'background: #e67e22; color: white; padding: 2px 6px; border-radius: 3px;',
};

/** 判断是否是 mock 请求（根据 URL 判断） */
const isMockRequest = (url: string) => {
  // 后端真实接口路径
  const realApiPaths = ['/api/auth/', '/api/sys/', '/api/bookmark/'];
  return !realApiPaths.some((path) => url.includes(path));
};

/** 获取完整的请求地址（包含代理目标） */
const getFullRequestUrl = (config: any) => {
  const url = config.url || '';

  // 判断请求会被代理到哪个后端
  if (url.startsWith('/api/auth') || url.startsWith('/api/sys')) {
    // 这些路径会被 vite 代理到后端认证中心
    return `${authApiTarget}${url}`;
  }

  // 其他请求（mock 或其他代理）
  if (config.baseURL) {
    return `${config.baseURL}${url}`;
  }

  if (url.startsWith(import.meta.env.VITE_API_URL_PREFIX || '/api')) {
    return `${apiTarget}${url}`;
  }

  // 相对路径，使用当前域名
  return `${window.location.origin}${url}`;
};

/** 打印请求日志 */
const logRequest = (config: any) => {
  if (!LOG_ENABLED) return;

  const url = config.url || '';
  const isMock = isMockRequest(url);
  const sourceLabel = isMock ? '[MOCK]' : '[API]';
  const sourceStyle = isMock ? logStyles.mock : logStyles.api;
  const fullUrl = getFullRequestUrl(config);

  console.group(`%c请求%c ${sourceLabel} %c${config.method?.toUpperCase()} ${url}`, logStyles.request, sourceStyle, '');
  console.log('🌐 后端地址:', fullUrl);
  console.log('📋 请求方法:', config.method?.toUpperCase());
  console.log('📦 请求参数:', config.params || '无');
  console.log('📝 请求数据:', config.data || '无');
  console.log('🔑 请求头:', config.headers);
  console.log('⏰ 时间:', new Date().toLocaleTimeString());
  console.groupEnd();
};

/** 打印响应日志 */
const logResponse = (response: any) => {
  if (!LOG_ENABLED) return;

  const url = response.config?.url || '';
  const isMock = isMockRequest(url);
  const sourceLabel = isMock ? '[MOCK]' : '[API]';
  const sourceStyle = isMock ? logStyles.mock : logStyles.api;
  const fullUrl = getFullRequestUrl(response.config);

  console.group(
    `%c响应%c ${sourceLabel} %c${response.config?.method?.toUpperCase()} ${url}`,
    logStyles.response,
    sourceStyle,
    '',
  );
  console.log('🌐 后端地址:', fullUrl);
  console.log('📥 状态码:', response.status);
  console.log('📦 响应数据:', response.data);
  console.log('⏱️ 耗时:', response.config?.__requestTime ? `${Date.now() - response.config.__requestTime}ms` : '未知');
  console.groupEnd();
};

/** 打印错误日志 */
const logError = (error: any) => {
  if (!LOG_ENABLED) return;

  const url = error.config?.url || '';
  const fullUrl = error.config ? getFullRequestUrl(error.config) : url;

  console.group(`%c错误%c ${error.config?.method?.toUpperCase()} ${url}`, logStyles.error, '');
  console.log('🌐 后端地址:', fullUrl);
  console.log('❌ 错误信息:', error.message);
  console.log('📋 错误状态:', error.response?.status || '无响应');
  console.log('📋 错误详情:', error.response?.data || error);
  console.log('📤 请求配置:', error.config);
  console.groupEnd();
};

// 数据处理，方便区分多种处理方式

// ========== Token 自动刷新机制 ==========
/** 是否正在刷新 Token 中 */
let isRefreshing = false;
/** 等待 Token 刷新后重试的请求队列 */
let refreshSubscribers: Array<(newToken: string) => void> = [];
/** 刷新失败后的跳转标记，防止多次跳转 */
let hasRedirectedToLogin = false;

/** 通知所有等待的请求用新 Token 重试 */
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

/** 将失败的请求加入等待队列 */
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/** 跳转到登录页（带防重入） */
function redirectToLogin() {
  if (hasRedirectedToLogin) return;
  hasRedirectedToLogin = true;
  const userStore = useUserStore();
  userStore.logout();
  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}
// ========================================

const transform: AxiosTransform = {
  // 处理请求数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: (res, options) => {
    const { isTransformResponse, isReturnNativeResponse } = options;

    // 如果204无内容直接返回
    const method = res.config.method?.toLowerCase();
    if (res.status === 204 && ['put', 'patch', 'delete'].includes(method)) {
      return res;
    }

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    if (!data) {
      throw new Error('请求接口错误');
    }

    //  这里 code为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code } = data;

    // 这里逻辑可以根据项目进行修改
    // 后端返回 code === 0 或 code === 200 都表示成功
    const hasSuccess = data && (code === 0 || code === 200);
    if (hasSuccess) {
      return data.data;
    }

    throw new Error(data.message || `请求接口错误, 错误码: ${code}`);
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const { apiUrl, isJoinPrefix, urlPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    // 添加接口前缀
    if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
      config.url = `${urlPrefix}${config.url}`;
    }

    // 将baseUrl拼接
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    const data = config.data || false;

    if (formatDate && data && !isString(data)) {
      formatRequestDate(data);
    }
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params);
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Array.isArray(data) || Object.keys(config.data).length > 0 || data instanceof FormData)
      ) {
        config.data = data;
        config.params = params;
      } else {
        // 非GET请求如果没有提供data，则将params视为data
        config.data = params;
        config.params = undefined;
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.data });
      }
    } else {
      // 兼容restful风格
      config.url += params;
      config.params = undefined;
    }
    return config;
  },

  // 请求拦截器处理
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    const userStore = useUserStore();
    const { token } = userStore;

    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token;
    }

    // 记录请求开始时间
    (config as any).__requestTime = Date.now();

    // 打印请求日志
    logRequest(config);

    return config;
  },

  // 响应拦截器处理
  responseInterceptors: (res) => {
    // 打印响应日志
    logResponse(res);
    return res;
  },

  // 响应错误处理
  responseInterceptorsCatch: (error: any, instance: AxiosInstance) => {
    const { config, response } = error;

    // 打印错误日志
    logError(error);

    // ========== 处理 401 未授权错误 - Token 过期或无效 ==========
    if (response?.status === 401) {
      const userStore = useUserStore();
      const { refreshToken } = userStore;
      const requestUrl = config?.url || '';

      // 1. 刷新请求本身 401 → Refresh Token 也过期/无效，直接跳转登录
      if (requestUrl.includes('/auth/refresh')) {
        redirectToLogin();
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      // 2. 没有 Refresh Token → 直接跳转登录
      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      // 3. 正在刷新中 → 当前请求加入队列等待新 Token
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance.request(config));
          });
        });
      }

      // 4. 开始刷新 Token
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        import('@/api/auth')
          .then(({ refreshToken: refreshTokenApi }) => {
            return refreshTokenApi({ refreshToken });
          })
          .then((res) => {
            // 刷新成功：更新 store 中的 Token
            userStore.token = res.accessToken;
            userStore.refreshToken = res.refreshToken;

            // 用新 Token 重试当前请求
            config.headers.Authorization = `Bearer ${res.accessToken}`;

            // 通知队列中等待的所有请求
            onTokenRefreshed(res.accessToken);

            resolve(instance.request(config));
          })
          .catch((refreshError: any) => {
            // 刷新失败（Refresh Token 也过期/无效）
            redirectToLogin();
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // 处理 403 无权限错误
    if (response?.status === 403) {
      return Promise.reject(new Error('没有权限访问该资源'));
    }

    if (!config || !config.requestOptions.retry) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.requestOptions.retry.count) return Promise.reject(error);

    config.retryCount += 1;

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config);
      }, config.requestOptions.retry.delay || 1);
    });
    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json };
    return backoff.then((config) => instance.request(config));
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    merge(
      <CreateAxiosOptions>{
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // JWT Bearer Token 认证
        authenticationScheme: 'Bearer',
        // 超时
        timeout: 10 * 1000,
        // 携带Cookie
        withCredentials: true,
        // 头信息
        headers: { 'Content-Type': ContentTypeEnum.Json },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 接口地址
          apiUrl: host,
          // 是否自动添加接口前缀
          isJoinPrefix: true,
          // 接口前缀
          // 例如: https://www.baidu.com/api
          // urlPrefix: '/api'
          urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 是否加入时间戳
          joinTime: true,
          // 是否忽略请求取消令牌
          // 如果启用，则重复请求时不进行处理
          // 如果禁用，则重复请求时会取消当前请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
          // 重试
          retry: {
            count: 3,
            delay: 1000,
          },
        },
      },
      opt || {},
    ),
  );
}
export const request = createAxios();
