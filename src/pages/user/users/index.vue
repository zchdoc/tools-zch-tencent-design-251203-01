<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.user.title') }}</h2>
          <p>{{ t('pages.system.user.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.user.searchPlaceholder')"
            clearable
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-select
            v-model="statusFilter"
            class="filter-select"
            :placeholder="t('pages.system.user.statusFilterPlaceholder')"
            clearable
            @change="handleSearch"
          >
            <t-option :label="t('pages.system.common.enabled')" :value="1" />
            <t-option :label="t('pages.system.common.disabled')" :value="0" />
          </t-select>
          <t-select
            v-model="userTypeFilter"
            class="filter-select"
            :placeholder="t('pages.system.user.typeFilterPlaceholder')"
            clearable
            @change="handleSearch"
          >
            <t-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
          <t-button theme="default" variant="outline" @click="handleReset">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.reset') }}
          </t-button>
          <t-button v-permission="'sys:user:add'" @click="handleCreate">
            <template #icon>
              <add-icon />
            </template>
            {{ t('pages.system.user.create') }}
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
        <template #nickname="{ row }">
          <span class="muted-text">{{ row.nickname || '-' }}</span>
        </template>
        <template #email="{ row }">
          <span class="muted-text">{{ row.email || '-' }}</span>
        </template>
        <template #phone="{ row }">
          <span class="muted-text">{{ row.phone || '-' }}</span>
        </template>
        <template #userType="{ row }">
          <t-tag :theme="getUserTypeTheme(row.userType)" variant="light">
            {{ getUserTypeLabel(row.userType) }}
          </t-tag>
        </template>
        <template #status="{ row }">
          <t-tag v-if="row.status === 1" theme="success" variant="light">
            {{ t('pages.system.common.enabled') }}
          </t-tag>
          <t-tag v-else theme="default" variant="light">
            {{ t('pages.system.common.disabled') }}
          </t-tag>
        </template>
        <template #roleCodes="{ row }">
          <div v-if="row.roleCodes?.length" class="tag-list">
            <t-tag v-for="roleCode in row.roleCodes" :key="roleCode" theme="primary" variant="light">
              {{ roleCode }}
            </t-tag>
          </div>
          <span v-else class="muted-text">-</span>
        </template>
        <template #lastLoginTime="{ row }">
          <span class="muted-text">{{ row.lastLoginTime || '-' }}</span>
        </template>
        <template #operation="{ row }">
          <t-space size="small" break-line>
            <t-link v-permission="'sys:user:edit'" theme="primary" @click="handleEdit(row)">
              {{ t('pages.system.common.edit') }}
            </t-link>
            <t-link v-permission="'sys:user:role'" theme="primary" @click="handleAssignRole(row)">
              {{ t('pages.system.user.actions.role') }}
            </t-link>
            <t-link v-permission="'sys:user:reset-password'" theme="primary" @click="handleOpenResetPassword(row)">
              {{ t('pages.system.user.actions.resetPassword') }}
            </t-link>
            <t-link v-permission="'sys:user:status'" theme="primary" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? t('pages.system.user.actions.disable') : t('pages.system.user.actions.enable') }}
            </t-link>
            <t-popconfirm :content="t('pages.system.user.deleteConfirm')" @confirm="handleDelete(row)">
              <t-link v-permission="'sys:user:delete'" theme="danger">
                {{ t('pages.system.common.delete') }}
              </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <user-form v-model:visible="formVisible" :user="currentUser" @saved="fetchData" />
    <user-role-dialog v-model:visible="roleVisible" :user="currentUser" @saved="fetchData" />

    <t-dialog
      v-model:visible="resetPasswordVisible"
      :header="t('pages.system.user.resetPassword.title')"
      :width="520"
      :footer="false"
      destroy-on-close
    >
      <div class="dialog-meta">
        <div class="dialog-title">{{ currentUser?.nickname || currentUser?.username || '-' }}</div>
        <div class="dialog-subtitle">{{ currentUser?.username || '-' }}</div>
      </div>
      <t-form :data="resetPasswordForm" :rules="resetPasswordRules" :label-width="110" @submit="handleResetPassword">
        <t-form-item :label="t('pages.system.user.resetPassword.password')" name="password">
          <t-input
            v-model="resetPasswordForm.password"
            type="password"
            :placeholder="t('pages.system.user.resetPassword.passwordPlaceholder')"
            clearable
          />
        </t-form-item>
        <t-form-item :label="t('pages.system.user.resetPassword.confirmPassword')" name="confirmPassword">
          <t-input
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            :placeholder="t('pages.system.user.resetPassword.confirmPlaceholder')"
            clearable
          />
        </t-form-item>
        <t-form-item class="form-actions">
          <t-space>
            <t-button theme="default" variant="outline" @click="closeResetPassword">
              {{ t('pages.system.common.cancel') }}
            </t-button>
            <t-button theme="primary" type="submit" :loading="resetPasswordSubmitting">
              {{ t('pages.system.common.confirm') }}
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { FormRules, PageInfo, PrimaryTableCol, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import type { SysUser } from '@/api/system/model';
import { deleteUser, getUserPage, resetUserPassword, updateUserStatus } from '@/api/system/user';
import { t } from '@/locales';

import UserForm from './components/UserForm.vue';
import UserRoleDialog from './components/UserRoleDialog.vue';

defineOptions({
  name: 'UserManagement',
});

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const keyword = ref('');
const statusFilter = ref<number>();
const userTypeFilter = ref<number>();
const loading = ref(false);
const data = ref<SysUser[]>([]);
const formVisible = ref(false);
const roleVisible = ref(false);
const resetPasswordVisible = ref(false);
const resetPasswordSubmitting = ref(false);
const currentUser = ref<SysUser | null>(null);
const resetPasswordForm = reactive<ResetPasswordForm>({
  password: '',
  confirmPassword: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
});

const userTypeOptions = computed(() => [
  { label: t('pages.system.user.type.normal'), value: 1 },
  { label: t('pages.system.user.type.vip'), value: 2 },
  { label: t('pages.system.user.type.admin'), value: 9 },
]);

const resetPasswordRules: FormRules<ResetPasswordForm> = {
  password: [{ required: true, message: t('pages.system.user.resetPassword.passwordRequired'), type: 'error' }],
  confirmPassword: [{ required: true, message: t('pages.system.user.resetPassword.confirmRequired'), type: 'error' }],
};

const columns: PrimaryTableCol<SysUser>[] = [
  { title: t('pages.system.user.columns.username'), colKey: 'username', minWidth: 160 },
  { title: t('pages.system.user.columns.nickname'), colKey: 'nickname', minWidth: 140 },
  { title: t('pages.system.user.columns.email'), colKey: 'email', minWidth: 200 },
  { title: t('pages.system.user.columns.phone'), colKey: 'phone', minWidth: 150 },
  { title: t('pages.system.user.columns.userType'), colKey: 'userType', width: 120 },
  { title: t('pages.system.user.columns.status'), colKey: 'status', width: 110 },
  { title: t('pages.system.user.columns.roles'), colKey: 'roleCodes', minWidth: 220 },
  { title: t('pages.system.user.columns.lastLoginTime'), colKey: 'lastLoginTime', minWidth: 180 },
  { title: t('pages.system.common.operation'), colKey: 'operation', fixed: 'right', width: 330 },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const result = await getUserPage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      status: statusFilter.value,
      userType: userTypeFilter.value,
    });
    data.value = result.list;
    pagination.total = result.total;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.user.loadFailed'));
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
  statusFilter.value = undefined;
  userTypeFilter.value = undefined;
  handleSearch();
};

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

const handleCreate = () => {
  currentUser.value = null;
  formVisible.value = true;
};

const handleEdit = (user: SysUser) => {
  currentUser.value = user;
  formVisible.value = true;
};

const handleAssignRole = (user: SysUser) => {
  currentUser.value = user;
  roleVisible.value = true;
};

const handleOpenResetPassword = (user: SysUser) => {
  currentUser.value = user;
  resetPasswordForm.password = '';
  resetPasswordForm.confirmPassword = '';
  resetPasswordVisible.value = true;
};

const closeResetPassword = () => {
  resetPasswordVisible.value = false;
};

const handleResetPassword = async ({ firstError }: SubmitContext<ResetPasswordForm>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }
  if (resetPasswordForm.password.length < 6) {
    MessagePlugin.warning(t('pages.system.user.resetPassword.passwordLength'));
    return;
  }
  if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
    MessagePlugin.warning(t('pages.system.user.resetPassword.passwordMismatch'));
    return;
  }
  if (!currentUser.value?.id) return;

  resetPasswordSubmitting.value = true;
  try {
    await resetUserPassword(currentUser.value.id, {
      password: resetPasswordForm.password,
    });
    MessagePlugin.success(t('pages.system.user.resetPassword.saveSuccess'));
    closeResetPassword();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.user.resetPassword.saveFailed'));
  } finally {
    resetPasswordSubmitting.value = false;
  }
};

const handleToggleStatus = async (user: SysUser) => {
  try {
    await updateUserStatus(user.id, {
      status: user.status === 1 ? 0 : 1,
    });
    MessagePlugin.success(t('pages.system.common.saveSuccess'));
    fetchData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.saveFailed'));
  }
};

const handleDelete = async (user: SysUser) => {
  try {
    await deleteUser(user.id);
    MessagePlugin.success(t('pages.system.common.deleteSuccess'));
    fetchData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.deleteFailed'));
  }
};

const getUserTypeLabel = (userType: number) => {
  const option = userTypeOptions.value.find((item) => item.value === userType);
  return option?.label || String(userType);
};

const getUserTypeTheme = (userType: number) => {
  if (userType === 9) return 'danger';
  if (userType === 2) return 'warning';
  return 'primary';
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

  .filter-select {
    width: 150px;
    max-width: 100%;
  }

  .muted-text {
    color: var(--td-text-color-secondary);
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--td-comp-margin-xs);
  }

  .dialog-meta {
    padding-bottom: var(--td-comp-paddingTB-l);
    margin-bottom: var(--td-comp-margin-l);
    border-bottom: 1px solid var(--td-component-stroke);
  }

  .dialog-title {
    color: var(--td-text-color-primary);
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  .dialog-subtitle {
    margin-top: var(--td-comp-margin-xxs);
    color: var(--td-text-color-secondary);
    font-size: 13px;
    line-height: 20px;
  }

  .form-actions {
    :deep(.t-form__controls-content) {
      justify-content: flex-end;
    }
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
