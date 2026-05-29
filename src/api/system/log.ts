import { request } from '@/utils/request';

import type { LoginLogPageParams, OperationLogPageParams, PageResult, SysLoginLog, SysOperationLog } from './model';

export function getOperationLogPage(params: OperationLogPageParams) {
  return request.get<PageResult<SysOperationLog>>({
    url: '/sys/operation-log/page',
    params,
  });
}

export function getLoginLogPage(params: LoginLogPageParams) {
  return request.get<PageResult<SysLoginLog>>({
    url: '/sys/login-log/page',
    params,
  });
}
