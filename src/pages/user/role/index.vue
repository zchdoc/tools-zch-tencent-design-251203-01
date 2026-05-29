<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.role.title') }}</h2>
          <p>{{ t('pages.system.role.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.common.searchPlaceholder')"
            clearable
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="default" variant="outline" @click="handleReset">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.reset') }}
          </t-button>
          <t-button v-permission="'sys:role:add'" @click="handleCreate">
            <template #icon>
              <add-icon />
            </template>
            {{ t('pages.system.role.create') }}
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
            {{ t('pages.system.common.enabled') }}
          </t-tag>
          <t-tag v-else theme="default" variant="light">
            {{ t('pages.system.common.disabled') }}
          </t-tag>
        </template>
        <template #description="{ row }">
          <span class="muted-text">{{ row.description || '-' }}</span>
        </template>
        <template #operation="{ row }">
          <t-space size="small" break-line>
            <t-link v-permission="'sys:role:edit'" theme="primary" @click="handleEdit(row)">
              {{ t('pages.system.common.edit') }}
            </t-link>
            <t-link v-permission="'sys:role:permission'" theme="primary" @click="handleAssignPermission(row)">
              {{ t('pages.system.role.actions.permission') }}
            </t-link>
            <t-link v-permission="'sys:role:menu'" theme="primary" @click="handleAssignMenu(row)">
              {{ t('pages.system.role.actions.menu') }}
            </t-link>
            <t-popconfirm :content="t('pages.system.role.deleteConfirm')" @confirm="handleDelete(row)">
              <t-link v-permission="'sys:role:delete'" theme="danger">
                {{ t('pages.system.common.delete') }}
              </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <role-form v-model:visible="formVisible" :role="currentRole" @saved="fetchData" />
    <permission-drawer v-model:visible="permissionVisible" :role="currentRole" />
    <menu-drawer v-model:visible="menuVisible" :role="currentRole" @saved="onMenuSaved" />
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import type { SysRole } from '@/api/system/model';
import { deleteRole, getRolePage } from '@/api/system/role';
import { t } from '@/locales';

import MenuDrawer from './components/MenuDrawer.vue';
import PermissionDrawer from './components/PermissionDrawer.vue';
import RoleForm from './components/RoleForm.vue';

defineOptions({
  name: 'UserRoleManagement',
});

const keyword = ref('');
const loading = ref(false);
const data = ref<SysRole[]>([]);
const formVisible = ref(false);
const permissionVisible = ref(false);
const menuVisible = ref(false);
const currentRole = ref<SysRole | null>(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
});

const columns: PrimaryTableCol<SysRole>[] = [
  { title: t('pages.system.role.columns.name'), colKey: 'roleName', minWidth: 180 },
  { title: t('pages.system.role.columns.code'), colKey: 'roleCode', minWidth: 200 },
  { title: t('pages.system.role.columns.description'), colKey: 'description', minWidth: 220 },
  { title: t('pages.system.role.columns.sort'), colKey: 'sort', width: 100 },
  { title: t('pages.system.role.columns.status'), colKey: 'status', width: 120 },
  { title: t('pages.system.common.operation'), colKey: 'operation', fixed: 'right', width: 260 },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const result = await getRolePage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
    });
    data.value = result.list;
    pagination.total = result.total;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.role.loadFailed'));
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
  handleSearch();
};

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

const handleCreate = () => {
  currentRole.value = null;
  formVisible.value = true;
};

const handleEdit = (role: SysRole) => {
  currentRole.value = role;
  formVisible.value = true;
};

const handleAssignPermission = (role: SysRole) => {
  currentRole.value = role;
  permissionVisible.value = true;
};

const handleAssignMenu = (role: SysRole) => {
  currentRole.value = role;
  menuVisible.value = true;
};

const handleDelete = async (role: SysRole) => {
  try {
    await deleteRole(role.id);
    MessagePlugin.success(t('pages.system.common.deleteSuccess'));
    fetchData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.deleteFailed'));
  }
};

const onMenuSaved = () => {
  MessagePlugin.info(t('pages.system.role.menuDrawer.refreshTip'));
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

  .muted-text {
    color: var(--td-text-color-secondary);
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
  }
}
</style>
