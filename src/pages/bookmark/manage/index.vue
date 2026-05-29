<template>
  <div class="bookmark-manage">
    <!-- 分类管理 -->
    <t-card class="bookmark-manage__section" title="分类管理" :bordered="false">
      <template #actions>
        <t-button v-permission="'bookmark:category:add'" theme="primary" @click="openCategoryDialog()">
          <template #icon><add-icon /></template>
          新增分类
        </t-button>
      </template>
      <t-table
        :data="categoryList"
        :columns="categoryColumns"
        row-key="id"
        :loading="categoryLoading"
        :pagination="categoryPagination"
        size="small"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'default'" variant="light">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="'bookmark:category:edit'" theme="primary" @click="openCategoryDialog(row)">
              编辑
            </t-link>
            <t-popconfirm
              :content="`确定删除分类 '${row.name}' 吗？该分类下的书签也会被删除。`"
              @confirm="handleDeleteCategory(row)"
            >
              <t-link v-permission="'bookmark:category:delete'" theme="danger"> 删除 </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 书签管理 -->
    <t-card class="bookmark-manage__section" title="书签管理" :bordered="false">
      <template #actions>
        <t-button v-permission="'bookmark:add'" theme="primary" @click="openBookmarkDialog()">
          <template #icon><add-icon /></template>
          新增书签
        </t-button>
      </template>
      <t-row class="bookmark-manage__filter" :gutter="[16, 16]">
        <t-col :span="3">
          <t-select v-model="bookmarkFilter.categoryId" placeholder="全部分类" clearable @change="fetchBookmarks">
            <t-option v-for="cat in categoryList" :key="cat.id" :value="cat.id" :label="cat.name" />
          </t-select>
        </t-col>
        <t-col :span="3">
          <t-input v-model="bookmarkFilter.keyword" placeholder="搜索书签名称/URL" clearable @enter="fetchBookmarks">
            <template #suffix-icon><search-icon /></template>
          </t-input>
        </t-col>
        <t-col :span="3">
          <t-button theme="default" @click="resetBookmarkFilter">重置</t-button>
          <t-button theme="primary" @click="fetchBookmarks">查询</t-button>
        </t-col>
      </t-row>
      <t-table
        :data="filteredBookmarks"
        :columns="bookmarkColumns"
        row-key="id"
        :loading="bookmarkLoading"
        :pagination="bookmarkPagination"
        size="small"
      >
        <template #categoryName="{ row }">
          {{ getCategoryName(row.categoryId) }}
        </template>
        <template #url="{ row }">
          <t-link theme="primary" :href="row.url" target="_blank">{{ row.url }}</t-link>
        </template>
        <template #isPublic="{ row }">
          <t-tag :theme="row.isPublic === 1 ? 'success' : 'default'" variant="light">
            {{ row.isPublic === 1 ? '公开' : '私有' }}
          </t-tag>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'default'" variant="light">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="'bookmark:edit'" theme="primary" @click="openBookmarkDialog(row)">编辑</t-link>
            <t-popconfirm :content="`确定删除书签 '${row.name}' 吗？`" @confirm="handleDeleteBookmark(row)">
              <t-link v-permission="'bookmark:delete'" theme="danger">删除</t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 分类编辑弹窗 -->
    <t-dialog
      v-model:visible="categoryDialog.visible"
      :header="categoryDialog.isEdit ? '编辑分类' : '新增分类'"
      width="500px"
    >
      <t-form :data="categoryDialog.form" :rules="categoryFormRules" @submit="handleCategorySubmit">
        <t-form-item label="分类名称" name="name">
          <t-input v-model="categoryDialog.form.name" placeholder="请输入分类名称" />
        </t-form-item>
        <t-form-item label="图标" name="icon">
          <t-input v-model="categoryDialog.form.icon" placeholder="请输入图标（可选）" />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="categoryDialog.form.sort" :min="0" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="categoryDialog.form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
      <template #footer>
        <t-button theme="default" @click="categoryDialog.visible = false">取消</t-button>
        <t-button theme="primary" :loading="categoryDialog.submitting" @click="handleCategorySubmit">确定</t-button>
      </template>
    </t-dialog>

    <!-- 书签编辑弹窗 -->
    <t-dialog
      v-model:visible="bookmarkDialog.visible"
      :header="bookmarkDialog.isEdit ? '编辑书签' : '新增书签'"
      width="560px"
    >
      <t-form :data="bookmarkDialog.form" :rules="bookmarkFormRules" @submit="handleBookmarkSubmit">
        <t-form-item label="所属分类" name="categoryId">
          <t-select v-model="bookmarkDialog.form.categoryId" placeholder="请选择分类">
            <t-option v-for="cat in categoryList" :key="cat.id" :value="cat.id" :label="cat.name" />
          </t-select>
        </t-form-item>
        <t-form-item label="书签名称" name="name">
          <t-input v-model="bookmarkDialog.form.name" placeholder="请输入书签名称" />
        </t-form-item>
        <t-form-item label="URL" name="url">
          <t-input v-model="bookmarkDialog.form.url" placeholder="请输入URL" />
        </t-form-item>
        <t-form-item label="图标" name="icon">
          <t-input v-model="bookmarkDialog.form.icon" placeholder="请输入图标URL（可选）" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="bookmarkDialog.form.description" placeholder="请输入描述（可选）" />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="bookmarkDialog.form.sort" :min="0" />
        </t-form-item>
        <t-form-item label="是否公开" name="isPublic">
          <t-radio-group v-model="bookmarkDialog.form.isPublic">
            <t-radio :value="1">公开</t-radio>
            <t-radio :value="0">私有</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="bookmarkDialog.form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
      <template #footer>
        <t-button theme="default" @click="bookmarkDialog.visible = false">取消</t-button>
        <t-button theme="primary" :loading="bookmarkDialog.submitting" @click="handleBookmarkSubmit">确定</t-button>
      </template>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { FormRules, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import type { Bookmark, BookmarkCategory } from '@/api/bookmark';
import {
  createBookmark,
  createCategory,
  deleteBookmark,
  deleteCategory,
  getBookmarks,
  getCategoryTree,
  updateBookmark,
  updateCategory,
} from '@/api/bookmark';

defineOptions({
  name: 'BookmarkManage',
});

// ==================== 分类管理 ====================

const categoryList = ref<BookmarkCategory[]>([]);
const categoryLoading = ref(false);
const categoryPagination = ref({ defaultPageSize: 10, total: 0, defaultCurrent: 1 });

const categoryColumns: PrimaryTableCol<TableRowData>[] = [
  { title: 'ID', colKey: 'id', width: 80 },
  { title: '分类名称', colKey: 'name', width: 200 },
  { title: '图标', colKey: 'icon', width: 120 },
  { title: '排序', colKey: 'sort', width: 100 },
  { title: '状态', colKey: 'status', width: 100 },
  { title: '操作', colKey: 'op', width: 160, fixed: 'right' },
];

const fetchCategories = async () => {
  categoryLoading.value = true;
  try {
    const data = await getCategoryTree();
    if (Array.isArray(data)) {
      categoryList.value = data;
      categoryPagination.value.total = data.length;
    }
  } catch {
    MessagePlugin.error('获取分类失败');
  } finally {
    categoryLoading.value = false;
  }
};

// 分类弹窗
const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: 0,
    name: '',
    icon: '',
    sort: 0,
    status: 1,
  },
});

const categoryFormRules: FormRules<typeof categoryDialog.form> = {
  name: [{ required: true, message: '请输入分类名称', type: 'error' }],
};

const openCategoryDialog = (row?: BookmarkCategory) => {
  categoryDialog.isEdit = !!row;
  if (row) {
    categoryDialog.form = {
      id: row.id,
      name: row.name,
      icon: row.icon || '',
      sort: row.sort,
      status: row.status,
    };
  } else {
    categoryDialog.form = {
      id: 0,
      name: '',
      icon: '',
      sort: categoryList.value.length + 1,
      status: 1,
    };
  }
  categoryDialog.visible = true;
};

const handleCategorySubmit = async () => {
  if (!categoryDialog.form.name.trim()) {
    MessagePlugin.error('请输入分类名称');
    return;
  }
  categoryDialog.submitting = true;
  try {
    const data = {
      name: categoryDialog.form.name,
      icon: categoryDialog.form.icon,
      sort: categoryDialog.form.sort,
      status: categoryDialog.form.status,
    };
    if (categoryDialog.isEdit) {
      await updateCategory(categoryDialog.form.id, data);
      MessagePlugin.success('更新分类成功');
    } else {
      await createCategory(data);
      MessagePlugin.success('新增分类成功');
    }
    categoryDialog.visible = false;
    fetchCategories();
  } catch {
    MessagePlugin.error(categoryDialog.isEdit ? '更新分类失败' : '新增分类失败');
  } finally {
    categoryDialog.submitting = false;
  }
};

const handleDeleteCategory = async (row: BookmarkCategory) => {
  try {
    await deleteCategory(row.id);
    MessagePlugin.success('删除分类成功');
    fetchCategories();
    fetchBookmarks();
  } catch {
    MessagePlugin.error('删除分类失败');
  }
};

// ==================== 书签管理 ====================

const bookmarkList = ref<Bookmark[]>([]);
const bookmarkLoading = ref(false);
const bookmarkPagination = ref({ defaultPageSize: 10, total: 0, defaultCurrent: 1 });

const bookmarkFilter = reactive({
  categoryId: undefined as number | undefined,
  keyword: '',
});

const bookmarkColumns: PrimaryTableCol<TableRowData>[] = [
  { title: 'ID', colKey: 'id', width: 80 },
  { title: '所属分类', colKey: 'categoryName', width: 140 },
  { title: '名称', colKey: 'name', width: 160, ellipsis: true },
  { title: 'URL', colKey: 'url', width: 280, ellipsis: true },
  { title: '是否公开', colKey: 'isPublic', width: 100 },
  { title: '排序', colKey: 'sort', width: 80 },
  { title: '状态', colKey: 'status', width: 100 },
  { title: '操作', colKey: 'op', width: 160, fixed: 'right' },
];

const filteredBookmarks = computed(() => {
  let list = bookmarkList.value;
  if (bookmarkFilter.keyword) {
    const kw = bookmarkFilter.keyword.toLowerCase();
    list = list.filter((b) => b.name.toLowerCase().includes(kw) || b.url.toLowerCase().includes(kw));
  }
  return list;
});

watch(
  filteredBookmarks,
  (list) => {
    bookmarkPagination.value.total = list.length;
  },
  { immediate: true },
);

const fetchBookmarks = async () => {
  bookmarkLoading.value = true;
  try {
    const data = await getBookmarks(bookmarkFilter.categoryId);
    if (Array.isArray(data)) {
      bookmarkList.value = data;
      bookmarkPagination.value.total = data.length;
    }
  } catch {
    MessagePlugin.error('获取书签失败');
  } finally {
    bookmarkLoading.value = false;
  }
};

const getCategoryName = (categoryId: number) => {
  const cat = categoryList.value.find((c) => c.id === categoryId);
  return cat ? cat.name : '-';
};

const resetBookmarkFilter = () => {
  bookmarkFilter.categoryId = undefined;
  bookmarkFilter.keyword = '';
  fetchBookmarks();
};

// 书签弹窗
const bookmarkDialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: 0,
    categoryId: undefined as number | undefined,
    name: '',
    url: '',
    icon: '',
    description: '',
    sort: 0,
    isPublic: 1,
    status: 1,
  },
});

const bookmarkFormRules: FormRules<typeof bookmarkDialog.form> = {
  categoryId: [{ required: true, message: '请选择所属分类', type: 'error' }],
  name: [{ required: true, message: '请输入书签名称', type: 'error' }],
  url: [{ required: true, message: '请输入URL', type: 'error' }],
};

const openBookmarkDialog = (row?: Bookmark) => {
  bookmarkDialog.isEdit = !!row;
  if (row) {
    bookmarkDialog.form = {
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      url: row.url,
      icon: row.icon || '',
      description: row.description || '',
      sort: row.sort,
      isPublic: row.isPublic,
      status: row.status,
    };
  } else {
    bookmarkDialog.form = {
      id: 0,
      categoryId: categoryList.value[0]?.id,
      name: '',
      url: '',
      icon: '',
      description: '',
      sort: bookmarkList.value.length + 1,
      isPublic: 1,
      status: 1,
    };
  }
  bookmarkDialog.visible = true;
};

const handleBookmarkSubmit = async () => {
  if (!bookmarkDialog.form.name.trim()) {
    MessagePlugin.error('请输入书签名称');
    return;
  }
  if (!bookmarkDialog.form.url.trim()) {
    MessagePlugin.error('请输入URL');
    return;
  }
  if (!bookmarkDialog.form.categoryId) {
    MessagePlugin.error('请选择所属分类');
    return;
  }
  bookmarkDialog.submitting = true;
  try {
    const data = {
      categoryId: bookmarkDialog.form.categoryId,
      name: bookmarkDialog.form.name,
      url: bookmarkDialog.form.url,
      icon: bookmarkDialog.form.icon,
      description: bookmarkDialog.form.description,
      sort: bookmarkDialog.form.sort,
      isPublic: bookmarkDialog.form.isPublic,
      status: bookmarkDialog.form.status,
    };
    if (bookmarkDialog.isEdit) {
      await updateBookmark(bookmarkDialog.form.id, data);
      MessagePlugin.success('更新书签成功');
    } else {
      await createBookmark(data);
      MessagePlugin.success('新增书签成功');
    }
    bookmarkDialog.visible = false;
    fetchBookmarks();
  } catch {
    MessagePlugin.error(bookmarkDialog.isEdit ? '更新书签失败' : '新增书签失败');
  } finally {
    bookmarkDialog.submitting = false;
  }
};

const handleDeleteBookmark = async (row: Bookmark) => {
  try {
    await deleteBookmark(row.id);
    MessagePlugin.success('删除书签成功');
    fetchBookmarks();
  } catch {
    MessagePlugin.error('删除书签失败');
  }
};

onMounted(() => {
  fetchCategories();
  fetchBookmarks();
});
</script>
<style lang="less" scoped>
.bookmark-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__section {
    :deep(.t-card__title) {
      font-weight: 600;
    }
  }

  &__filter {
    margin-bottom: 16px;
  }
}
</style>
