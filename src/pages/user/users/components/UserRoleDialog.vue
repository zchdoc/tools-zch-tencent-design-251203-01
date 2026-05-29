<template>
  <t-dialog
    v-model:visible="dialogVisible"
    :header="t('pages.system.user.roleDialog.title')"
    :width="560"
    :footer="false"
    destroy-on-close
  >
    <div class="dialog-meta">
      <div class="dialog-title">{{ user?.nickname || user?.username || '-' }}</div>
      <div class="dialog-subtitle">{{ user?.username || '-' }}</div>
    </div>

    <t-loading :loading="loading">
      <t-checkbox-group v-if="roleList.length" v-model="checkedRoleIds">
        <div class="role-list">
          <div v-for="role in roleList" :key="role.id" class="role-item">
            <t-checkbox :value="role.id">
              <div class="role-content">
                <div class="role-name">
                  {{ role.roleName }}
                  <t-tag v-if="role.status !== 1" size="small" theme="default" variant="light">
                    {{ t('pages.system.common.disabled') }}
                  </t-tag>
                </div>
                <div class="role-code">{{ role.roleCode }}</div>
              </div>
            </t-checkbox>
          </div>
        </div>
      </t-checkbox-group>
      <t-empty v-else :description="t('pages.system.user.roleDialog.noRole')" />
    </t-loading>

    <div class="dialog-actions">
      <t-space>
        <t-button theme="default" variant="outline" @click="selectAll">{{
          t('pages.system.user.roleDialog.selectAll')
        }}</t-button>
        <t-button theme="default" variant="outline" @click="clearAll">{{
          t('pages.system.user.roleDialog.clearAll')
        }}</t-button>
        <t-button theme="default" variant="outline" @click="close">{{ t('pages.system.common.cancel') }}</t-button>
        <t-button theme="primary" :loading="submitting" @click="onConfirm">
          {{ t('pages.system.common.confirm') }}
        </t-button>
      </t-space>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import type { SysRole, SysUser } from '@/api/system/model';
import { getRoleList } from '@/api/system/role';
import { assignUserRoles, getUserRoleIds } from '@/api/system/user';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  user?: SysUser | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const dialogVisible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const roleList = ref<SysRole[]>([]);
const checkedRoleIds = ref<number[]>([]);

const loadData = async () => {
  if (!props.user?.id) return;

  loading.value = true;
  try {
    const [roles, checked] = await Promise.all([getRoleList(), getUserRoleIds(props.user.id)]);
    roleList.value = roles;
    checkedRoleIds.value = checked;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.user.roleDialog.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const selectAll = () => {
  checkedRoleIds.value = roleList.value.map((role) => role.id);
};

const clearAll = () => {
  checkedRoleIds.value = [];
};

const close = () => {
  dialogVisible.value = false;
};

const onConfirm = async () => {
  if (!props.user?.id) return;

  submitting.value = true;
  try {
    await assignUserRoles(props.user.id, checkedRoleIds.value);
    MessagePlugin.success(t('pages.system.user.roleDialog.saveSuccess'));
    emit('saved');
    close();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.user.roleDialog.saveFailed'));
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.visible,
  (visible) => {
    dialogVisible.value = visible;
    if (visible) {
      loadData();
    }
  },
  { immediate: true },
);

watch(
  () => dialogVisible.value,
  (visible) => {
    emit('update:visible', visible);
  },
);
</script>
<style lang="less" scoped>
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

.role-list {
  display: grid;
  gap: var(--td-comp-margin-s);
}

.role-item {
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  border: 1px solid var(--td-component-stroke);
  border-radius: 6px;
}

.role-content {
  display: grid;
  gap: 2px;
}

.role-name {
  display: flex;
  gap: var(--td-comp-margin-xs);
  align-items: center;
  color: var(--td-text-color-primary);
  font-weight: 500;
}

.role-code {
  color: var(--td-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--td-comp-margin-xl);
}
</style>
