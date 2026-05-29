<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.dict.title') }}</h2>
          <p>{{ t('pages.system.dict.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.dict.searchPlaceholder')"
            clearable
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-select
            v-model="dictTypeFilter"
            class="filter-select"
            :placeholder="t('pages.system.dict.typeFilterPlaceholder')"
            clearable
            filterable
            @change="handleSearch"
          >
            <t-option
              v-for="item in dictTypes"
              :key="item.dictType"
              :label="`${item.dictName} (${item.dictType})`"
              :value="item.dictType"
            />
          </t-select>
          <t-select
            v-model="statusFilter"
            class="filter-select"
            :placeholder="t('pages.system.dict.statusFilterPlaceholder')"
            clearable
            @change="handleSearch"
          >
            <t-option :label="t('pages.system.common.enabled')" :value="1" />
            <t-option :label="t('pages.system.common.disabled')" :value="0" />
          </t-select>
          <t-button theme="default" variant="outline" @click="handleReset">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.reset') }}
          </t-button>
          <t-button v-permission="'sys:dict:add'" @click="handleCreate">
            <template #icon>
              <add-icon />
            </template>
            {{ t('pages.system.dict.create') }}
          </t-button>
        </div>
      </div>

      <t-table
        row-key="id"
        :data="data"
        :columns="columns"
        :hover="true"
        :loading="loading"
        :pagination="pagination"
        :empty="t('pages.system.common.empty')"
        @page-change="handlePageChange"
      >
        <template #dictType="{ row }">
          <span class="code-text">{{ row.dictType }}</span>
        </template>
        <template #dictValue="{ row }">
          <span class="code-text">{{ row.dictValue }}</span>
        </template>
        <template #status="{ row }">
          <t-tag v-if="row.status === 1" theme="success" variant="light">
            {{ t('pages.system.common.enabled') }}
          </t-tag>
          <t-tag v-else theme="default" variant="light">
            {{ t('pages.system.common.disabled') }}
          </t-tag>
        </template>
        <template #isSystem="{ row }">
          <t-tag v-if="row.isSystem === 1" theme="warning" variant="light">
            {{ t('pages.system.dict.systemBuiltIn') }}
          </t-tag>
          <span v-else class="muted-text">-</span>
        </template>
        <template #description="{ row }">
          <span class="muted-text">{{ row.description || '-' }}</span>
        </template>
        <template #operation="{ row }">
          <t-space size="small">
            <t-link v-permission="'sys:dict:edit'" theme="primary" @click="handleEdit(row)">
              {{ t('pages.system.common.edit') }}
            </t-link>
            <t-popconfirm
              v-if="row.isSystem !== 1"
              :content="t('pages.system.dict.deleteConfirm')"
              @confirm="handleDelete(row)"
            >
              <t-link v-permission="'sys:dict:delete'" theme="danger">
                {{ t('pages.system.common.delete') }}
              </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <dict-form v-model:visible="formVisible" :dict="currentDict" @saved="handleSaved" />
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { deleteDict, getDictPage, getDictTypes } from '@/api/system/dict';
import type { DictType, SysDict } from '@/api/system/model';
import { t } from '@/locales';

import DictForm from './components/DictForm.vue';

defineOptions({
  name: 'UserDictManagement',
});

const keyword = ref('');
const dictTypeFilter = ref<string>();
const statusFilter = ref<number>();
const loading = ref(false);
const data = ref<SysDict[]>([]);
const dictTypes = ref<DictType[]>([]);
const formVisible = ref(false);
const currentDict = ref<SysDict | null>(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
});

const columns: PrimaryTableCol<SysDict>[] = [
  { title: t('pages.system.dict.columns.name'), colKey: 'dictName', minWidth: 150 },
  { title: t('pages.system.dict.columns.type'), colKey: 'dictType', minWidth: 180 },
  { title: t('pages.system.dict.columns.label'), colKey: 'dictLabel', minWidth: 150 },
  { title: t('pages.system.dict.columns.value'), colKey: 'dictValue', minWidth: 140 },
  { title: t('pages.system.dict.columns.sort'), colKey: 'sort', width: 90 },
  { title: t('pages.system.dict.columns.status'), colKey: 'status', width: 110 },
  { title: t('pages.system.dict.columns.isSystem'), colKey: 'isSystem', width: 120 },
  { title: t('pages.system.dict.columns.description'), colKey: 'description', minWidth: 220, ellipsis: true },
  { title: t('pages.system.common.operation'), colKey: 'operation', fixed: 'right', width: 150 },
];

const fetchTypes = async () => {
  try {
    dictTypes.value = await getDictTypes();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.dict.typeLoadFailed'));
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const result = await getDictPage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      dictType: dictTypeFilter.value,
      status: statusFilter.value,
    });
    data.value = result.list;
    pagination.total = result.total;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.dict.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  keyword.value = '';
  dictTypeFilter.value = undefined;
  statusFilter.value = undefined;
  handleSearch();
};

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

const handleCreate = () => {
  currentDict.value = null;
  formVisible.value = true;
};

const handleEdit = (dict: SysDict) => {
  currentDict.value = dict;
  formVisible.value = true;
};

const handleDelete = async (dict: SysDict) => {
  try {
    await deleteDict(dict.id);
    MessagePlugin.success(t('pages.system.common.deleteSuccess'));
    handleSaved();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.deleteFailed'));
  }
};

const handleSaved = () => {
  fetchTypes();
  fetchData();
};

onMounted(() => {
  fetchTypes();
  fetchData();
});
</script>
<style lang="less" scoped>
.system-management-page {
  .management-card {
    padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

    :deep(.t-card__body) {
      padding: 0;
    }
  }

  .page-toolbar {
    display: flex;
    gap: var(--td-comp-margin-xl);
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--td-comp-margin-xxl);
  }

  .page-heading {
    min-width: 220px;

    h2 {
      margin: 0;
      color: var(--td-text-color-primary);
      font-weight: 600;
      font-size: 20px;
      line-height: 28px;
    }

    p {
      margin: var(--td-comp-margin-xs) 0 0;
      color: var(--td-text-color-secondary);
      font-size: 14px;
      line-height: 22px;
    }
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--td-comp-margin-s);
    justify-content: flex-end;
  }

  .search-input {
    width: 240px;
    max-width: 100%;
  }

  .filter-select {
    width: 180px;
    max-width: 100%;
  }

  .muted-text {
    color: var(--td-text-color-secondary);
  }

  .code-text {
    color: var(--td-text-color-secondary);
    font-family: var(--td-font-family-medium);
  }
}

@media (width <= 768px) {
  .system-management-page {
    .page-toolbar {
      flex-direction: column;
    }

    .toolbar-actions,
    .search-input,
    .filter-select {
      width: 100%;
    }
  }
}
</style>
