<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.permission.title') }}</h2>
          <p>{{ t('pages.system.permission.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.common.searchPlaceholder')"
            clearable
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-select v-model="typeFilter" class="type-select">
            <t-option :label="t('pages.system.permission.type.all')" :value="0" />
            <t-option :label="t('pages.system.permission.type.directory')" :value="1" />
            <t-option :label="t('pages.system.permission.type.menu')" :value="2" />
            <t-option :label="t('pages.system.permission.type.button')" :value="3" />
            <t-option :label="t('pages.system.permission.type.api')" :value="4" />
          </t-select>
          <t-button theme="default" variant="outline" @click="fetchData">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.refresh') }}
          </t-button>
          <t-button v-permission="'sys:permission:add'" @click="handleCreateRoot">
            <template #icon>
              <add-icon />
            </template>
            {{ t('pages.system.permission.create') }}
          </t-button>
        </div>
      </div>

      <t-enhanced-table
        row-key="id"
        :data="filteredData"
        :columns="columns"
        :hover="true"
        :loading="loading"
        :tree="{ childrenKey: 'children', defaultExpandAll: true, treeNodeColumnIndex: 0 }"
        :empty="t('pages.system.common.empty')"
      >
        <template #type="{ row }">
          <t-tag variant="light">{{ getTypeLabel(row.type) }}</t-tag>
        </template>
        <template #status="{ row }">
          <t-tag v-if="row.status === 1" theme="success" variant="light">
            {{ t('pages.system.common.enabled') }}
          </t-tag>
          <t-tag v-else theme="default" variant="light">
            {{ t('pages.system.common.disabled') }}
          </t-tag>
        </template>
        <template #operation="{ row }">
          <t-space size="small">
            <t-link v-permission="'sys:permission:add'" theme="primary" @click="handleCreateChild(row)">
              {{ t('pages.system.permission.actions.addChild') }}
            </t-link>
            <t-link v-permission="'sys:permission:edit'" theme="primary" @click="handleEdit(row)">
              {{ t('pages.system.common.edit') }}
            </t-link>
            <t-popconfirm :content="t('pages.system.permission.deleteConfirm')" @confirm="handleDelete(row)">
              <t-link v-permission="'sys:permission:delete'" theme="danger">
                {{ t('pages.system.common.delete') }}
              </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-enhanced-table>
    </t-card>

    <permission-form
      v-model:visible="formVisible"
      :permission="currentPermission"
      :parent="currentParent"
      @saved="fetchData"
    />
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import type { PermissionTreeNode } from '@/api/system/model';
import { deletePermission, getPermissionTree } from '@/api/system/permission';
import { t } from '@/locales';

import PermissionForm from './components/PermissionForm.vue';

defineOptions({
  name: 'UserPermissionManagement',
});

const keyword = ref('');
const typeFilter = ref(0);
const loading = ref(false);
const data = ref<PermissionTreeNode[]>([]);
const formVisible = ref(false);
const currentPermission = ref<PermissionTreeNode | null>(null);
const currentParent = ref<PermissionTreeNode | null>(null);

const columns: PrimaryTableCol<PermissionTreeNode>[] = [
  { title: t('pages.system.permission.columns.name'), colKey: 'name', minWidth: 180 },
  { title: t('pages.system.permission.columns.code'), colKey: 'code', minWidth: 220 },
  { title: t('pages.system.permission.columns.type'), colKey: 'type', width: 120 },
  { title: t('pages.system.permission.columns.path'), colKey: 'path', minWidth: 180, ellipsis: true },
  { title: t('pages.system.permission.columns.sort'), colKey: 'sort', width: 100 },
  { title: t('pages.system.permission.columns.status'), colKey: 'status', width: 120 },
  { title: t('pages.system.common.operation'), colKey: 'operation', fixed: 'right', width: 220 },
];

const getTypeLabel = (type: number) => {
  const map: Record<number, string> = {
    1: t('pages.system.permission.type.directory'),
    2: t('pages.system.permission.type.menu'),
    3: t('pages.system.permission.type.button'),
    4: t('pages.system.permission.type.api'),
  };
  return map[type] || '-';
};

const filterTree = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
  const words = keyword.value.trim().toLowerCase();
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children) : [];
      const matchKeyword =
        !words || [node.name, node.code, node.path].some((item) => item?.toLowerCase().includes(words));
      const matchType = typeFilter.value === 0 || node.type === typeFilter.value;
      if ((matchKeyword && matchType) || children.length) {
        return { ...node, children };
      }
      return null;
    })
    .filter(Boolean) as PermissionTreeNode[];
};

const filteredData = computed(() => filterTree(data.value));

const fetchData = async () => {
  loading.value = true;
  try {
    data.value = await getPermissionTree();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.permission.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCreateRoot = () => {
  currentPermission.value = null;
  currentParent.value = null;
  formVisible.value = true;
};

const handleCreateChild = (parent: PermissionTreeNode) => {
  currentPermission.value = null;
  currentParent.value = parent;
  formVisible.value = true;
};

const handleEdit = (permission: PermissionTreeNode) => {
  currentPermission.value = permission;
  currentParent.value = null;
  formVisible.value = true;
};

const handleDelete = async (permission: PermissionTreeNode) => {
  try {
    await deletePermission(permission.id);
    MessagePlugin.success(t('pages.system.common.deleteSuccess'));
    fetchData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.deleteFailed'));
  }
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
    width: 280px;
    max-width: 100%;
  }

  .type-select {
    width: 160px;
  }
}

@media (width <= 768px) {
  .system-management-page {
    .page-toolbar {
      flex-direction: column;
    }

    .toolbar-actions,
    .search-input {
      width: 100%;
    }

    .type-select {
      width: 100%;
    }
  }
}
</style>
