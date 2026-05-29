<template>
  <t-drawer
    v-model:visible="drawerVisible"
    :header="t('pages.system.role.menuDrawer.title')"
    size="420px"
    :confirm-btn="t('pages.system.common.confirm')"
    :cancel-btn="t('pages.system.common.cancel')"
    :confirm-loading="submitting"
    @confirm="onConfirm"
  >
    <div class="drawer-meta">
      <div class="drawer-role">{{ role?.roleName || '-' }}</div>
      <div class="drawer-code">{{ role?.roleCode || '-' }}</div>
    </div>

    <t-loading :loading="loading">
      <t-tree
        v-model:value="checkedKeys"
        :data="treeData"
        checkable
        expand-all
        hover
        value-mode="all"
        :empty="t('pages.system.common.empty')"
      />
    </t-loading>
  </t-drawer>
</template>
<script setup lang="ts">
import type { TreeNodeValue, TreeOptionData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { getMenuTree } from '@/api/system/menu';
import type { MenuTreeNode, SysRole } from '@/api/system/model';
import { assignRoleMenus, getRoleMenuIds } from '@/api/system/role';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  role?: SysRole | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const drawerVisible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const checkedKeys = ref<TreeNodeValue[]>([]);
const treeData = ref<TreeOptionData[]>([]);

const toTreeData = (nodes: MenuTreeNode[]): TreeOptionData[] =>
  nodes.map((node) => ({
    label: `${node.titleZhCn || node.name} (${node.path})`,
    value: node.id,
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));

const loadData = async () => {
  if (!props.role?.id) return;

  loading.value = true;
  try {
    const [tree, checked] = await Promise.all([getMenuTree(), getRoleMenuIds(props.role.id)]);
    treeData.value = toTreeData(tree);
    checkedKeys.value = checked;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.role.menuDrawer.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const onConfirm = async () => {
  if (!props.role?.id) return;

  submitting.value = true;
  try {
    await assignRoleMenus(props.role.id, checkedKeys.value.map(Number));
    MessagePlugin.success(t('pages.system.role.menuDrawer.saveSuccess'));
    emit('saved');
    drawerVisible.value = false;
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.role.menuDrawer.saveFailed'));
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.visible,
  (visible) => {
    drawerVisible.value = visible;
    if (visible) {
      loadData();
    }
  },
  { immediate: true },
);

watch(
  () => drawerVisible.value,
  (visible) => {
    emit('update:visible', visible);
  },
);
</script>
<style lang="less" scoped>
.drawer-meta {
  padding-bottom: var(--td-comp-paddingTB-l);
  margin-bottom: var(--td-comp-margin-l);
  border-bottom: 1px solid var(--td-component-stroke);
}

.drawer-role {
  color: var(--td-text-color-primary);
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}

.drawer-code {
  margin-top: var(--td-comp-margin-xxs);
  color: var(--td-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}
</style>
