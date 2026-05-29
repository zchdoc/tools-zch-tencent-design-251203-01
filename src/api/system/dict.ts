import { request } from '@/utils/request';

import type { DictPageParams, DictRequest, DictType, PageResult, SysDict } from './model';

const Api = {
  page: '/sys/dict/page',
  types: '/sys/dict/types',
  items: (dictType: string) => `/sys/dict/items/${dictType}`,
  detail: (id: number) => `/sys/dict/${id}`,
};

export function getDictPage(params: DictPageParams) {
  return request.get<PageResult<SysDict>>({
    url: Api.page,
    params,
  });
}

export function getDictTypes() {
  return request.get<DictType[]>({
    url: Api.types,
  });
}

export function getDictItems(dictType: string) {
  return request.get<SysDict[]>({
    url: Api.items(dictType),
  });
}

export function getDictDetail(id: number) {
  return request.get<SysDict>({
    url: Api.detail(id),
  });
}

export function createDict(data: DictRequest) {
  return request.post<void>({
    url: '/sys/dict',
    data,
  });
}

export function updateDict(id: number, data: DictRequest) {
  return request.put<void>({
    url: Api.detail(id),
    data,
  });
}

export function deleteDict(id: number) {
  return request.delete<void>({
    url: Api.detail(id),
  });
}
