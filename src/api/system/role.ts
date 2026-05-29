import { request } from '@/utils/request';

import type { PageParams, PageResult, RoleRequest, SysRole } from './model';

const Api = {
  page: '/sys/role/page',
  list: '/sys/role/list',
  detail: (id: number) => `/sys/role/${id}`,
  permissions: (id: number) => `/sys/role/${id}/permissions`,
  menus: (id: number) => `/sys/role/${id}/menus`,
};

export function getRolePage(params: PageParams) {
  return request.get<PageResult<SysRole>>({
    url: Api.page,
    params,
  });
}

export function getRoleList() {
  return request.get<SysRole[]>({
    url: Api.list,
  });
}

export function getRoleDetail(id: number) {
  return request.get<SysRole>({
    url: Api.detail(id),
  });
}

export function createRole(data: RoleRequest) {
  return request.post<void>({
    url: '/sys/role',
    data,
  });
}

export function updateRole(id: number, data: RoleRequest) {
  return request.put<void>({
    url: Api.detail(id),
    data,
  });
}

export function deleteRole(id: number) {
  return request.delete<void>({
    url: Api.detail(id),
  });
}

export function getRolePermissionIds(id: number) {
  return request.get<number[]>({
    url: Api.permissions(id),
  });
}

export function assignRolePermissions(id: number, permissionIds: number[]) {
  return request.post<void>({
    url: Api.permissions(id),
    data: permissionIds,
  });
}

export function getRoleMenuIds(id: number) {
  return request.get<number[]>({
    url: Api.menus(id),
  });
}

export function assignRoleMenus(id: number, menuIds: number[]) {
  return request.post<void>({
    url: Api.menus(id),
    data: menuIds,
  });
}
