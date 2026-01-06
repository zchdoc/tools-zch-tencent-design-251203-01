/**
 * 认证 API 接口
 * 对接后端认证中心
 */
import { request } from '@/utils/request';

// ==================== 请求类型定义 ====================

/** 登录请求参数 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 注册请求参数 */
export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
  nickname?: string;
}

/** 刷新 Token 请求参数 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== 响应类型定义 ====================

/** 用户信息 */
export interface UserInfoResponse {
  id: number;
  username: string;
  nickname?: string;
  /** 兼容旧版本的 name 字段 */
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  userType: number;
  vipExpireTime?: string;
  roles: string[];
  permissions: string[];
}

/** 登录响应 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfoResponse;
}

/** 菜单树响应（旧版本，保留兼容） */
export interface MenuTreeResponse {
  id: number;
  parentId: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  sort: number;
  visible: number;
  isVip: number;
  children?: MenuTreeResponse[];
}

/** 菜单路由响应（新版本，与前端格式完全匹配） */
export interface MenuRouteResponse {
  path: string;
  name: string;
  component?: string;
  redirect?: string;
  meta?: {
    title?: {
      zh_CN: string;
      en_US: string;
    };
    icon?: string;
    hidden?: boolean;
    single?: boolean;
    frameSrc?: string;
    frameBlank?: boolean;
    keepAlive?: boolean;
    orderNo?: number;
    isVip?: boolean;
    menuId?: number;
  };
  children?: MenuRouteResponse[];
}

/** 通用响应包装 */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// ==================== API 接口 ====================

const AuthApi = {
  /** 用户登录 */
  login: '/auth/login',
  /** 用户注册 */
  register: '/auth/register',
  /** 退出登录 */
  logout: '/auth/logout',
  /** 刷新 Token */
  refresh: '/auth/refresh',
  /** 获取当前用户信息 */
  me: '/auth/me',
  /** 获取当前用户菜单（旧版本） */
  menus: '/sys/permission/menus',
  /** 获取当前用户权限编码 */
  codes: '/sys/permission/codes',
  /** 获取菜单列表（新版本，国际化） */
  menuListI18n: '/sys/menu/list-i18n',
};

/**
 * 用户登录
 * @returns 登录响应（包含 token 和用户信息）
 */
export function login(data: LoginRequest) {
  return request.post<LoginResponse>({
    url: AuthApi.login,
    data,
  });
}

/**
 * 用户注册
 */
export function register(data: RegisterRequest) {
  return request.post<void>({
    url: AuthApi.register,
    data,
  });
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<void>({
    url: AuthApi.logout,
  });
}

/**
 * 刷新 Token
 * @returns 新的登录响应（包含新 token）
 */
export function refreshToken(data: RefreshTokenRequest) {
  return request.post<LoginResponse>({
    url: AuthApi.refresh,
    data,
  });
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export function getCurrentUser() {
  return request.get<UserInfoResponse>({
    url: AuthApi.me,
  });
}

/**
 * 获取当前用户菜单
 * @returns 菜单树列表
 */
export function getUserMenus() {
  return request.get<MenuTreeResponse[]>({
    url: AuthApi.menus,
  });
}

/**
 * 获取当前用户权限编码
 * @returns 权限编码列表
 */
export function getUserPermissionCodes() {
  return request.get<string[]>({
    url: AuthApi.codes,
  });
}

/**
 * 获取菜单列表（国际化版本）
 * 返回格式与前端路由格式完全匹配
 * @returns 菜单路由列表
 */
export function getMenuListI18n() {
  return request.get<{ list: MenuRouteResponse[] }>({
    url: AuthApi.menuListI18n,
  });
}
