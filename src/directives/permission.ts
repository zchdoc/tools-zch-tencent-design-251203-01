/**
 * 权限控制指令
 * v-permission - 按钮级权限控制
 * v-role - 角色级权限控制
 */
import type { App, Directive, DirectiveBinding } from 'vue';

import { useUserStore } from '@/store';

/**
 * 权限指令
 * 使用方式:
 * - v-permission="'sys:user:add'" 单个权限
 * - v-permission="['sys:user:add', 'sys:user:edit']" 多个权限（满足任一即可）
 */
const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value) {
      return;
    }

    // 获取用户权限列表
    const permissions = userStore.permissions;

    // 判断是否有权限
    let hasPermission = false;
    if (typeof value === 'string') {
      // 单个权限
      hasPermission = permissions.includes(value);
    } else if (Array.isArray(value)) {
      // 多个权限，满足任一即可
      hasPermission = value.some((p: string) => permissions.includes(p));
    }

    // 没有权限则移除元素
    if (!hasPermission) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 角色指令
 * 使用方式:
 * - v-role="'ROLE_ADMIN'" 单个角色
 * - v-role="['ROLE_ADMIN', 'ROLE_VIP']" 多个角色（满足任一即可）
 */
const roleDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value) {
      return;
    }

    // 获取用户角色列表
    const roles = userStore.roles;

    // 判断是否有角色
    let hasRole = false;
    if (typeof value === 'string') {
      // 单个角色
      hasRole = roles.includes(value);
    } else if (Array.isArray(value)) {
      // 多个角色，满足任一即可
      hasRole = value.some((r: string) => roles.includes(r));
    }

    // 没有角色则移除元素
    if (!hasRole) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 全部权限指令
 * 使用方式:
 * - v-permission-all="['sys:user:add', 'sys:user:edit']" 必须满足全部权限
 */
const permissionAllDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value || !Array.isArray(value)) {
      return;
    }

    // 获取用户权限列表
    const permissions = userStore.permissions;

    // 必须满足全部权限
    const hasAllPermissions = value.every((p: string) => permissions.includes(p));

    // 没有全部权限则移除元素
    if (!hasAllPermissions) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 全部角色指令
 * 使用方式:
 * - v-role-all="['ROLE_ADMIN', 'ROLE_VIP']" 必须满足全部角色
 */
const roleAllDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value || !Array.isArray(value)) {
      return;
    }

    // 获取用户角色列表
    const roles = userStore.roles;

    // 必须满足全部角色
    const hasAllRoles = value.every((r: string) => roles.includes(r));

    // 没有全部角色则移除元素
    if (!hasAllRoles) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 注册权限相关指令
 */
export function setupPermissionDirectives(app: App) {
  app.directive('permission', permissionDirective);
  app.directive('role', roleDirective);
  app.directive('permission-all', permissionAllDirective);
  app.directive('role-all', roleAllDirective);
}

export { permissionAllDirective, permissionDirective, roleAllDirective, roleDirective };
