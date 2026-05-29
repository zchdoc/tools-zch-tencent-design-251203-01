<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.operationLog.title') }}</h2>
          <p>{{ t('pages.system.operationLog.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.operationLog.searchPlaceholder')"
            clearable
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-input
            v-model="moduleFilter"
            class="filter-input"
            :placeholder="t('pages.system.operationLog.moduleFilterPlaceholder')"
            clearable
            @enter="handleSearch"
          />
          <t-select
            v-model="statusFilter"
            class="filter-select"
            :placeholder="t('pages.system.log.statusFilterPlaceholder')"
            clearable
            @change="handleSearch"
          >
            <t-option :label="t('pages.system.log.success')" :value="1" />
            <t-option :label="t('pages.system.log.failed')" :value="0" />
          </t-select>
          <t-button theme="default" variant="outline" @click="handleReset">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.reset') }}
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
        <template #status="{ row }">
          <t-tag v-if="row.status === 1" theme="success" variant="light">
            {{ t('pages.system.log.success') }}
          </t-tag>
          <t-tag v-else theme="danger" variant="light">
            {{ t('pages.system.log.failed') }}
          </t-tag>
        </template>
        <template #requestMethod="{ row }">
          <t-tag theme="primary" variant="light">{{ row.requestMethod || '-' }}</t-tag>
        </template>
        <template #requestUri="{ row }">
          <span class="code-text">{{ row.requestUri || '-' }}</span>
        </template>
        <template #costTime="{ row }">
          <span class="muted-text">{{ row.costTime ?? '-' }}</span>
        </template>
        <template #errorMessage="{ row }">
          <span class="muted-text">{{ row.errorMessage || '-' }}</span>
        </template>
      </t-table>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { getOperationLogPage } from '@/api/system/log';
import type { SysOperationLog } from '@/api/system/model';
import { t } from '@/locales';

defineOptions({
  name: 'UserOperationLog',
});

const keyword = ref('');
const moduleFilter = ref('');
const statusFilter = ref<number>();
const loading = ref(false);
const data = ref<SysOperationLog[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
});

const columns: PrimaryTableCol<SysOperationLog>[] = [
  { title: t('pages.system.operationLog.columns.module'), colKey: 'module', minWidth: 140 },
  { title: t('pages.system.operationLog.columns.action'), colKey: 'action', minWidth: 180 },
  { title: t('pages.system.operationLog.columns.username'), colKey: 'username', minWidth: 130 },
  { title: t('pages.system.operationLog.columns.method'), colKey: 'requestMethod', width: 100 },
  { title: t('pages.system.operationLog.columns.uri'), colKey: 'requestUri', minWidth: 240, ellipsis: true },
  { title: t('pages.system.log.status'), colKey: 'status', width: 100 },
  { title: t('pages.system.operationLog.columns.ip'), colKey: 'ip', minWidth: 140 },
  { title: t('pages.system.operationLog.columns.costTime'), colKey: 'costTime', width: 120 },
  { title: t('pages.system.operationLog.columns.operationTime'), colKey: 'operationTime', minWidth: 180 },
  { title: t('pages.system.operationLog.columns.errorMessage'), colKey: 'errorMessage', minWidth: 220, ellipsis: true },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const result = await getOperationLogPage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      module: moduleFilter.value || undefined,
      status: statusFilter.value,
    });
    data.value = result.list;
    pagination.total = result.total;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.operationLog.loadFailed'));
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
  moduleFilter.value = '';
  statusFilter.value = undefined;
  handleSearch();
};

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

onMounted(() => {
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

  .filter-input,
  .filter-select {
    width: 160px;
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
    .filter-input,
    .filter-select {
      width: 100%;
    }
  }
}
</style>
