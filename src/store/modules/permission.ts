import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import type { MenuTreeResponse } from '@/api/auth';
import { getMenuListI18n, getUserMenus } from '@/api/auth';
import type { RouteItem } from '@/api/model/permissionModel';
import router, { fixedRouterList, homepageRouterList } from '@/router';
import { store } from '@/store';
import { transformObjectToRoute } from '@/utils/route';

/**
 * 将后端菜单数据转换为前端路由格式
 */
function transformMenuToRoute(menus: MenuTreeResponse[]): RouteItem[] {
  return menus.map((menu) => {
    const route: RouteItem = {
      path: menu.path,
      name: menu.name || `menu_${menu.id}`,
      component: menu.component || 'LAYOUT',
      meta: {
        title: {
          zh_CN: menu.name,
          en_US: menu.name,
        },
        icon: menu.icon,
        hidden: menu.visible === 0,
        // 自定义元数据
        isVip: menu.isVip === 1,
        menuId: menu.id,
      },
    };

    // 处理重定向
    if (menu.children && menu.children.length > 0) {
      route.redirect = `${menu.path}/${menu.children[0].path}`.replace('//', '/');
      route.children = transformMenuToRoute(menu.children);
    }

    return route;
  });
}

/**
 * 构建菜单树结构
 * 后端可能返回平铺数据，需要组装成树形结构
 */
function buildMenuTree(menus: MenuTreeResponse[]): MenuTreeResponse[] {
  const menuMap = new Map<number, MenuTreeResponse>();
  const rootMenus: MenuTreeResponse[] = [];

  // 先建立 id -> menu 的映射
  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // 组装树结构
  menus.forEach((menu) => {
    const currentMenu = menuMap.get(menu.id)!;
    if (menu.parentId === 0 || !menuMap.has(menu.parentId)) {
      // 根节点
      rootMenus.push(currentMenu);
    } else {
      // 子节点
      const parent = menuMap.get(menu.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(currentMenu);
    }
  });

  // 按 sort 字段排序
  const sortMenus = (items: MenuTreeResponse[]) => {
    items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        sortMenus(item.children);
      }
    });
  };
  sortMenus(rootMenus);

  return rootMenus;
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    /** 白名单路由路径 */
    whiteListRouters: ['/login', '/register', '/404', '/403', '/bookmark/zch', '/error'],
    /** 所有路由 */
    routers: [] as RouteRecordRaw[],
    /** 移除的路由 */
    removeRoutes: [] as string[],
    /** 异步路由 */
    asyncRoutes: [] as RouteRecordRaw[],
    /** 原始菜单数据 */
    menus: [] as MenuTreeResponse[],
    /** 后端服务是否可用 */
    isBackendAvailable: true,
    /** 后端错误信息 */
    backendErrorMessage: '',
  }),
  actions: {
    /**
     * 初始化路由
     */
    async initRoutes() {
      const accessedRouters = this.asyncRoutes;

      // 在菜单展示全部路由
      this.routers = [...homepageRouterList, ...accessedRouters, ...fixedRouterList];
    },

    /**
     * 从后端获取菜单并构建路由（新版本：国际化格式）
     */
    async buildAsyncRoutes() {
      try {
        // 从后端获取菜单列表（国际化版本，返回格式与前端完全匹配）
        const response = await getMenuListI18n();

        console.log('[Permission] API 原始响应:', response);
        console.log('[Permission] API 原始响应 JSON:', JSON.stringify(response, null, 2));

        const menuList = response.list || [];

        console.log('[Permission] 解析后的菜单列表:', menuList);
        console.log('[Permission] 菜单数量:', menuList.length);

        // 打印每个顶级菜单
        menuList.forEach((menu: any, index: number) => {
          console.log(`[Permission] 菜单[${index}]:`, menu.name, menu.path, menu.meta?.title?.zh_CN);
        });

        // 直接使用后端返回的数据（已经是前端格式，无需转换）
        this.asyncRoutes = transformObjectToRoute(menuList as RouteItem[]);
        this.isBackendAvailable = true;
        this.backendErrorMessage = '';
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error: any) {
        console.error('[Permission] 构建路由失败:', error);
        // 记录后端不可用状态
        this.isBackendAvailable = false;
        this.backendErrorMessage = error?.message || '后端服务不可用，请稍后重试';
        // 如果后端菜单获取失败，使用空路由
        this.asyncRoutes = [];
        await this.initRoutes();
        // 不抛出错误，让路由守卫可以跳转到错误页
        return this.asyncRoutes;
      }
    },

    /**
     * 从后端获取菜单并构建路由（旧版本：兼容旧格式）
     * @deprecated 使用 buildAsyncRoutes 代替
     */
    async buildAsyncRoutesLegacy() {
      try {
        // 从后端获取菜单列表
        const menuList = await getUserMenus();

        // 保存原始菜单数据
        this.menus = menuList;

        // 如果后端返回的是平铺数据，需要构建树结构
        const menuTree = buildMenuTree(menuList);

        // 将菜单转换为路由格式
        const routeItems = transformMenuToRoute(menuTree);

        // 使用现有的转换函数处理路由
        this.asyncRoutes = transformObjectToRoute(routeItems);
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        console.error('构建路由失败:', error);
        // 如果后端菜单获取失败，使用空路由
        this.asyncRoutes = [];
        await this.initRoutes();
        throw new Error("Can't build routes");
      }
    },

    /**
     * 恢复路由（退出登录时）
     */
    async restoreRoutes() {
      this.asyncRoutes.forEach((item) => {
        if (item.name) {
          router.removeRoute(item.name as string);
        }
      });
      this.asyncRoutes = [];
      this.menus = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
