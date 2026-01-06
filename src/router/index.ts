import uniq from 'lodash/uniq';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const env = import.meta.env.MODE || 'development';

// 导入homepage相关固定路由
const homepageModules = import.meta.glob('./modules/**/homepage.ts', { eager: true });

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob('./modules/**/!(homepage).ts', { eager: true });

// 其他固定路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/',
    redirect: '/dashboard/base',
  },
];

// =====================================================
// 公开访问的页面（无需登录即可访问）
// 这些路由需要静态定义，因为动态路由需要登录才能获取
// =====================================================
import Layout from '@/layouts/index.vue';

export const publicRouterList: Array<RouteRecordRaw> = [
  {
    path: '/bookmark',
    component: Layout,
    redirect: '/bookmark/zch',
    name: 'bookmarkPublic',
    meta: {
      title: { zh_CN: '书签', en_US: 'Bookmark' },
      icon: 'bookmark',
      hidden: true, // 在菜单中隐藏，避免与动态菜单重复
    },
    children: [
      {
        path: 'zch',
        name: 'BookmarkZchPublic',
        component: () => import('@/pages/bookmark/zch/index.vue'),
        meta: {
          title: { zh_CN: '常用书签', en_US: 'Bookmarks' },
        },
      },
    ],
  },
];

// =====================================================
// 错误页面路由（用于后端故障等情况）
// =====================================================
export const errorRouterList: Array<RouteRecordRaw> = [
  {
    path: '/error',
    name: 'error',
    component: Layout,
    redirect: '/error/service-unavailable',
    meta: {
      title: { zh_CN: '错误', en_US: 'Error' },
      hidden: true,
    },
    children: [
      {
        path: 'service-unavailable',
        name: 'ServiceUnavailable',
        component: () => import('@/pages/result/maintenance/index.vue'),
        meta: {
          title: { zh_CN: '服务不可用', en_US: 'Service Unavailable' },
        },
      },
    ],
  },
];
// 存放固定路由
export const homepageRouterList: Array<RouteRecordRaw> = mapModuleRouterList(homepageModules);
export const fixedRouterList: Array<RouteRecordRaw> = mapModuleRouterList(fixedModules);

export const allRoutes = [
  ...homepageRouterList,
  ...fixedRouterList,
  ...publicRouterList, // 公开访问的页面
  ...errorRouterList, // 错误页面
  ...defaultRouterList,
];

// 固定路由模块转换为路由
export function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-expect-error 外部赋值不太好直接写类型
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

/**
 *
 * @deprecated 未使用
 */
export const getRoutesExpanded = () => {
  const expandedRoutes: Array<string> = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3): string => {
  // 非组件内调用必须通过Router实例获取当前路由
  const route = router.currentRoute.value;

  if (!route.path) {
    return '';
  }

  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('');
};

const router = createRouter({
  history: createWebHistory(env === 'site' ? '/starter/vue-next/' : import.meta.env.VITE_BASE_URL),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
