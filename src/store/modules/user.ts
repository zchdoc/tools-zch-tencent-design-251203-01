import { defineStore } from 'pinia';

import type { LoginRequest, UserInfoResponse } from '@/api/auth';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '@/api/auth';
import { usePermissionStore } from '@/store';

/** 初始用户信息 */
const InitUserInfo: UserInfoResponse = {
  id: 0,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  userType: 0,
  vipExpireTime: '',
  roles: [],
  permissions: [],
};

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 访问令牌 */
    token: '',
    /** 刷新令牌 */
    refreshToken: '',
    /** 用户信息 */
    userInfo: { ...InitUserInfo } as UserInfoResponse,
  }),
  getters: {
    /** 用户角色列表 */
    roles: (state) => state.userInfo?.roles || [],
    /** 用户权限列表 */
    permissions: (state) => state.userInfo?.permissions || [],
    /** 是否已登录 */
    isLoggedIn: (state) => !!state.token,
    /** 是否是管理员 */
    isAdmin: (state) => state.userInfo?.roles?.includes('ROLE_ADMIN') || false,
    /** 是否是 VIP */
    isVip: (state) => {
      if (!state.userInfo?.vipExpireTime) return false;
      return new Date(state.userInfo.vipExpireTime) > new Date();
    },
    /** 用户显示名称 */
    displayName: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
  },
  actions: {
    /**
     * 用户登录
     */
    async login(params: LoginRequest) {
      try {
        const result = await loginApi(params);
        // 存储 token
        this.token = result.accessToken;
        this.refreshToken = result.refreshToken;
        // 存储用户信息
        this.userInfo = result.userInfo;
        return result;
      } catch (error: any) {
        throw new Error(error.message || '登录失败');
      }
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
      if (!this.token) {
        throw new Error('未登录');
      }
      try {
        const userInfo = await getCurrentUser();
        this.userInfo = userInfo;
        return userInfo;
      } catch (error: any) {
        // 获取用户信息失败，清除登录状态
        this.logout();
        throw new Error(error.message || '获取用户信息失败');
      }
    },

    /**
     * 退出登录
     */
    async logout() {
      // 尝试调用后端退出接口（如果有 token 的话）
      if (this.token) {
        try {
          await logoutApi();
        } catch (e) {
          // 忽略退出登录的错误
          console.warn('退出登录接口调用失败', e);
        }
      }
      // 清除本地状态
      this.token = '';
      this.refreshToken = '';
      this.userInfo = { ...InitUserInfo };

      // 清除动态路由
      const permissionStore = usePermissionStore();
      permissionStore.restoreRoutes();
    },

    /**
     * 检查并刷新 Token（应用启动时调用）
     * 如果 Access Token 将在 10 分钟内过期，主动刷新，避免用户使用中途过期
     */
    async checkAndRefreshToken() {
      if (!this.token || !this.refreshToken) return;

      try {
        // 解析 JWT payload 获取过期时间（不验签，仅读取）
        const parts = this.token.split('.');
        if (parts.length !== 3) return;

        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp * 1000; // 转为毫秒时间戳
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;

        // Token 将在 10 分钟内过期，主动刷新
        if (exp - now < tenMinutes) {
          console.log('[Auth] Token 即将过期，主动刷新中...');
          const { refreshToken: refreshTokenApi } = await import('@/api/auth');
          const res = await refreshTokenApi({ refreshToken: this.refreshToken });
          this.token = res.accessToken;
          this.refreshToken = res.refreshToken;
          console.log('[Auth] Token 主动刷新成功');
        }
      } catch (e) {
        console.warn('[Auth] Token 刷新检查失败', e);
        // 静默失败，不影响用户使用，等 401 时再被动刷新
      }
    },

    /**
     * 检查是否有指定权限
     */
    hasPermission(code: string): boolean {
      return this.isAdmin || this.permissions.includes(code);
    },

    /**
     * 检查是否有指定角色
     */
    hasRole(role: string): boolean {
      return this.roles.includes(role);
    },

    /**
     * 检查是否有任一权限
     */
    hasAnyPermission(codes: string[]): boolean {
      return this.isAdmin || codes.some((code) => this.permissions.includes(code));
    },

    /**
     * 检查是否有任一角色
     */
    hasAnyRole(roles: string[]): boolean {
      return roles.some((role) => this.roles.includes(role));
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'refreshToken', 'userInfo'],
  },
});
