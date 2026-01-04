import type { TabValue } from 'tdesign-vue-next';
import type { LocationQueryRaw, RouteRecordName } from 'vue-router';

export interface RouteMeta {
  title?: string | Record<string, string>;
  icon?: string;
  expanded?: boolean;
  orderNo?: number;
  hidden?: boolean;
  hiddenBreadcrumb?: boolean;
  single?: boolean;
  keepAlive?: boolean;
  frameSrc?: string;
  frameBlank?: boolean;
  /** 是否为 VIP 功能 */
  isVip?: boolean;
  /** 菜单ID */
  menuId?: number;
}

export interface MenuRoute {
  // TODO: menuitem 组件实际支持 string 类型但是类型错误，暂时使用 any 类型避免打包错误待组件类型修复
  path: any;
  title?: string | Record<string, string>;
  name?: string | symbol;
  icon?:
    | string
    | {
        render: () => void;
      };
  redirect?: any;
  children?: MenuRoute[];
  meta?: RouteMeta;
}

export type ModeType = 'dark' | 'light';

export interface UserInfo {
  id?: number;
  username?: string;
  nickname?: string;
  name?: string; // 兼容旧版本
  email?: string;
  phone?: string;
  avatar?: string;
  userType?: number;
  vipExpireTime?: string;
  roles: string[];
  permissions?: string[];
}

export interface NotificationItem {
  id: string;
  content: string;
  type: string;
  status: boolean;
  collected: boolean;
  date: string;
  quality: string;
}

export interface TRouterInfo {
  path: string;
  query?: LocationQueryRaw;
  routeIdx?: number;
  title?: string;
  name?: RouteRecordName;
  isAlive?: boolean;
  isHome?: boolean;
  meta?: any;
}

export interface TTabRouterType {
  isRefreshing: boolean;
  tabRouterList: Array<TRouterInfo>;
}

export interface TTabRemoveOptions {
  value: TabValue;
  index: number;
  e: MouseEvent;
}
