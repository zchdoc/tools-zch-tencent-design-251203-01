export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export interface PageParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

export interface SysRole {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
  status: number;
  sort: number;
  createTime?: string;
  updateTime?: string;
}

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  status?: number;
  sort?: number;
}

export interface SysPermission {
  id: number;
  parentId: number;
  name: string;
  code: string;
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  visible?: number;
  status: number;
  isVip?: number;
  createTime?: string;
  updateTime?: string;
}

export interface PermissionTreeNode extends SysPermission {
  children?: PermissionTreeNode[];
}

export type PermissionRequest = Omit<SysPermission, 'id' | 'createTime' | 'updateTime'>;

export interface SysMenu {
  id: number;
  parentId: number;
  name: string;
  path: string;
  component: string;
  redirect?: string;
  titleZhCn: string;
  titleEnUs?: string;
  icon?: string;
  orderNo: number;
  hidden: number;
  status: number;
  frameSrc?: string;
  frameBlank: number;
  keepAlive: number;
  isVip: number;
  permissionCode?: string;
  createTime?: string;
  updateTime?: string;
}

export interface MenuTreeNode extends SysMenu {
  children?: MenuTreeNode[];
}

export type MenuRequest = Omit<SysMenu, 'id' | 'createTime' | 'updateTime'>;

export interface SysUser {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  userType: number;
  vipExpireTime?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  createTime?: string;
  updateTime?: string;
  roleIds?: number[];
  roleCodes?: string[];
}

export interface UserPageParams extends PageParams {
  status?: number;
  userType?: number;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  userType?: number;
  vipExpireTime?: string;
  roleIds?: number[];
}

export interface UserUpdateRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  userType?: number;
  vipExpireTime?: string;
}

export interface StatusRequest {
  status: number;
}

export interface UserResetPasswordRequest {
  password: string;
}

export interface SysDict {
  id: number;
  dictType: string;
  dictName: string;
  dictLabel: string;
  dictValue: string;
  description?: string;
  sort: number;
  status: number;
  isSystem: number;
  createTime?: string;
  updateTime?: string;
}

export interface DictType {
  dictType: string;
  dictName: string;
}

export interface DictPageParams extends PageParams {
  dictType?: string;
  status?: number;
}

export type DictRequest = Omit<SysDict, 'id' | 'createTime' | 'updateTime'>;

export interface SysOperationLog {
  id: number;
  userId?: number;
  username?: string;
  module?: string;
  action?: string;
  requestMethod?: string;
  requestUri?: string;
  requestParams?: string;
  status: number;
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
  costTime?: number;
  operationTime?: string;
}

export interface OperationLogPageParams extends PageParams {
  module?: string;
  status?: number;
}

export interface SysLoginLog {
  id: number;
  userId?: number;
  username: string;
  status: number;
  message?: string;
  ip?: string;
  userAgent?: string;
  loginTime?: string;
}

export interface LoginLogPageParams extends PageParams {
  status?: number;
}
