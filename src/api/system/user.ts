import { request } from '@/utils/request';

import type {
  PageResult,
  StatusRequest,
  SysUser,
  UserCreateRequest,
  UserPageParams,
  UserResetPasswordRequest,
  UserUpdateRequest,
} from './model';

const Api = {
  page: '/sys/user/page',
  list: '/sys/user/list',
  detail: (id: number) => `/sys/user/${id}`,
  status: (id: number) => `/sys/user/${id}/status`,
  roles: (id: number) => `/sys/user/${id}/roles`,
  resetPassword: (id: number) => `/sys/user/${id}/reset-password`,
};

export function getUserPage(params: UserPageParams) {
  return request.get<PageResult<SysUser>>({
    url: Api.page,
    params,
  });
}

export function getUserList() {
  return request.get<SysUser[]>({
    url: Api.list,
  });
}

export function getUserDetail(id: number) {
  return request.get<SysUser>({
    url: Api.detail(id),
  });
}

export function createUser(data: UserCreateRequest) {
  return request.post<void>({
    url: '/sys/user',
    data,
  });
}

export function updateUser(id: number, data: UserUpdateRequest) {
  return request.put<void>({
    url: Api.detail(id),
    data,
  });
}

export function deleteUser(id: number) {
  return request.delete<void>({
    url: Api.detail(id),
  });
}

export function updateUserStatus(id: number, data: StatusRequest) {
  return request.patch<void>({
    url: Api.status(id),
    data,
  });
}

export function getUserRoleIds(id: number) {
  return request.get<number[]>({
    url: Api.roles(id),
  });
}

export function assignUserRoles(id: number, roleIds: number[]) {
  return request.post<void>({
    url: Api.roles(id),
    data: roleIds,
  });
}

export function resetUserPassword(id: number, data: UserResetPasswordRequest) {
  return request.put<void>({
    url: Api.resetPassword(id),
    data,
  });
}
