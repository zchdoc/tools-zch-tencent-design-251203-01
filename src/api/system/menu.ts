import { request } from '@/utils/request';

import type { MenuRequest, MenuTreeNode, StatusRequest } from './model';

const Api = {
  tree: '/sys/menu/tree',
  detail: (id: number) => `/sys/menu/${id}`,
  status: (id: number) => `/sys/menu/${id}/status`,
};

export function getMenuTree() {
  return request.get<MenuTreeNode[]>({
    url: Api.tree,
  });
}

export function getMenuDetail(id: number) {
  return request.get<MenuTreeNode>({
    url: Api.detail(id),
  });
}

export function createMenu(data: MenuRequest) {
  return request.post<void>({
    url: '/sys/menu',
    data,
  });
}

export function updateMenu(id: number, data: MenuRequest) {
  return request.put<void>({
    url: Api.detail(id),
    data,
  });
}

export function deleteMenu(id: number) {
  return request.delete<void>({
    url: Api.detail(id),
  });
}

export function updateMenuStatus(id: number, data: StatusRequest) {
  return request.patch<void>({
    url: Api.status(id),
    data,
  });
}
