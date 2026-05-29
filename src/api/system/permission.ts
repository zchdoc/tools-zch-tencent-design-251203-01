import { request } from '@/utils/request';

import type { PermissionRequest, PermissionTreeNode } from './model';

const Api = {
  tree: '/sys/permission/tree',
  detail: (id: number) => `/sys/permission/${id}`,
};

export function getPermissionTree() {
  return request.get<PermissionTreeNode[]>({
    url: Api.tree,
  });
}

export function createPermission(data: PermissionRequest) {
  return request.post<void>({
    url: '/sys/permission',
    data,
  });
}

export function updatePermission(id: number, data: PermissionRequest) {
  return request.put<void>({
    url: Api.detail(id),
    data,
  });
}

export function deletePermission(id: number) {
  return request.delete<void>({
    url: Api.detail(id),
  });
}
