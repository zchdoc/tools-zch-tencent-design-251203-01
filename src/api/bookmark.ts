import { request } from '@/utils/request';

// ==================== 类型定义 ====================

export interface BookmarkCategory {
  id: number;
  parentId: number;
  name: string;
  icon?: string;
  sort: number;
  status: number;
  children?: BookmarkCategory[];
}

export interface Bookmark {
  id: number;
  categoryId: number;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  tags?: string;
  sort: number;
  isPublic: number;
  isVip: number;
  clickCount: number;
  status: number;
}

export interface BookmarkGroup {
  categoryId: number;
  categoryName: string;
  categoryIcon?: string;
  bookmarks: Bookmark[];
}

export interface BookmarkCategoryRequest {
  parentId?: number;
  name: string;
  icon?: string;
  sort?: number;
  status?: number;
}

export interface BookmarkRequest {
  categoryId: number;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  tags?: string;
  sort?: number;
  isPublic?: number;
  isVip?: number;
  status?: number;
}

// ==================== 公开接口 ====================

/**
 * 获取所有启用的书签分类
 */
export function getBookmarkCategories() {
  return request.get<BookmarkCategory[]>({
    url: '/bookmark/category/list',
  });
}

/**
 * 获取按分类分组的书签（公开）
 */
export function getGroupedBookmarks() {
  return request.get<BookmarkGroup[]>({
    url: '/bookmark/list',
  });
}

// ==================== 管理接口 - 分类 ====================

/**
 * 获取分类树（管理员）
 */
export function getCategoryTree() {
  return request.get<BookmarkCategory[]>({
    url: '/bookmark/admin/category/tree',
  });
}

/**
 * 新增分类
 */
export function createCategory(data: BookmarkCategoryRequest) {
  return request.post<void>({
    url: '/bookmark/admin/category',
    data,
  });
}

/**
 * 编辑分类
 */
export function updateCategory(id: number, data: BookmarkCategoryRequest) {
  return request.put<void>({
    url: `/bookmark/admin/category/${id}`,
    data,
  });
}

/**
 * 删除分类
 */
export function deleteCategory(id: number) {
  return request.delete<void>({
    url: `/bookmark/admin/category/${id}`,
  });
}

// ==================== 管理接口 - 书签 ====================

/**
 * 获取书签列表（管理员，可按分类筛选）
 */
export function getBookmarks(categoryId?: number) {
  return request.get<Bookmark[]>({
    url: '/bookmark/admin/list',
    params: categoryId ? { categoryId } : undefined,
  });
}

/**
 * 新增书签
 */
export function createBookmark(data: BookmarkRequest) {
  return request.post<void>({
    url: '/bookmark/admin',
    data,
  });
}

/**
 * 编辑书签
 */
export function updateBookmark(id: number, data: BookmarkRequest) {
  return request.put<void>({
    url: `/bookmark/admin/${id}`,
    data,
  });
}

/**
 * 删除书签
 */
export function deleteBookmark(id: number) {
  return request.delete<void>({
    url: `/bookmark/admin/${id}`,
  });
}
