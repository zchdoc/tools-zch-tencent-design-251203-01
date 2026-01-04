import 'nprogress/nprogress.css'; // progress bar style

import NProgress from 'nprogress'; // progress bar
import { MessagePlugin } from 'tdesign-vue-next';
import type { RouteRecordRaw } from 'vue-router';

import router from '@/router';
import { getPermissionStore, useUserStore } from '@/store';
import { PAGE_NOT_FOUND_ROUTE } from '@/utils/route/constant';

NProgress.configure({ showSpinner: false });

/**
 * 检查路径是否匹配白名单
 * 支持精确匹配和前缀匹配
 */
function isInWhiteList(path: string, whiteList: string[]): boolean {
  return whiteList.some((whitePath) => {
    // 精确匹配
    if (path === whitePath) return true;
    // 前缀匹配（如 /bookmark/zch 匹配 /bookmark/zch/xxx）
    if (path.startsWith(`${whitePath}/`)) return true;
    return false;
  });
}

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const permissionStore = getPermissionStore();
  const { whiteListRouters } = permissionStore;
  const userStore = useUserStore();

  // 1. 检查是否在白名单中（无需登录即可访问）
  if (isInWhiteList(to.path, whiteListRouters)) {
    next();
    NProgress.done();
    return;
  }

  // 2. 检查是否已登录
  if (userStore.token) {
    // 已登录状态访问登录页，直接放行或重定向到首页
    if (to.path === '/login') {
      next('/dashboard/base');
      NProgress.done();
      return;
    }

    try {
      // 3. 获取用户信息（如果还没有）
      if (!userStore.userInfo?.id) {
        await userStore.getUserInfo();
      }

      // 4. 构建动态路由（如果还没有）
      const { asyncRoutes } = permissionStore;
      if (!asyncRoutes || asyncRoutes.length === 0) {
        try {
          const routeList = await permissionStore.buildAsyncRoutes();
          routeList.forEach((item) => {
            router.addRoute(item as RouteRecordRaw);
          });

          if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
            // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
            next({ path: to.fullPath, replace: true, query: to.query });
            return;
          } else {
            const redirect = decodeURIComponent((from.query.redirect || to.path) as string);
            next(to.path === redirect ? { ...to, replace: true } : { path: redirect, query: to.query });
            return;
          }
        } catch (routeError) {
          console.warn('构建动态路由失败，使用静态路由:', routeError);
          // 构建路由失败，继续使用静态路由
        }
      }

      // 5. 检查路由是否存在
      if (router.hasRoute(to.name!)) {
        next();
      } else {
        // 路由不存在，跳转到首页
        next('/dashboard/base');
      }
    } catch (error: any) {
      console.error('路由守卫错误:', error);
      MessagePlugin.error(error.message || '获取用户信息失败');
      // 获取用户信息失败，跳转登录页
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
    }
  } else {
    // 未登录，跳转到登录页
    next({
      path: '/login',
      query: { redirect: encodeURIComponent(to.fullPath) },
    });
  }

  NProgress.done();
});

router.afterEach(() => {
  // 访问登录页时，不主动退出登录
  // 只有在用户主动点击退出时才清除状态
  NProgress.done();
});
