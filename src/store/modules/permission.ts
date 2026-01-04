import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import type { MenuTreeResponse } from '@/api/auth';
import { getUserMenus } from '@/api/auth';
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
    whiteListRouters: ['/login', '/register', '/404', '/403', '/bookmark/zch'],
    /** 所有路由 */
    routers: [] as RouteRecordRaw[],
    /** 移除的路由 */
    removeRoutes: [] as string[],
    /** 异步路由 */
    asyncRoutes: [] as RouteRecordRaw[],
    /** 原始菜单数据 */
    menus: [] as MenuTreeResponse[],
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
     * 从后端获取菜单并构建路由
     */
    async buildAsyncRoutes() {
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
