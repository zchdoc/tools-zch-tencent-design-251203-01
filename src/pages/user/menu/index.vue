<template>
  <div class="system-management-page">
    <t-card class="management-card" :bordered="false">
      <div class="page-toolbar">
        <div class="page-heading">
          <h2>{{ t('pages.system.menu.title') }}</h2>
          <p>{{ t('pages.system.menu.subtitle') }}</p>
        </div>

        <div class="toolbar-actions">
          <t-input
            v-model="keyword"
            class="search-input"
            :placeholder="t('pages.system.menu.searchPlaceholder')"
            clearable
          >
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-button theme="default" variant="outline" @click="fetchData">
            <template #icon>
              <refresh-icon />
            </template>
            {{ t('pages.system.common.refresh') }}
          </t-button>
          <t-button v-permission="'sys:menu:add'" @click="handleCreateRoot">
            <template #icon>
              <add-icon />
            </template>
            {{ t('pages.system.menu.create') }}
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
        <template #titleZhCn="{ row }">
          <div class="menu-title-cell">
            <span>{{ row.titleZhCn }}</span>
            <span v-if="row.titleEnUs" class="muted-text">{{ row.titleEnUs }}</span>
          </div>
        </template>
        <template #component="{ row }">
          <span class="code-text">{{ row.component }}</span>
        </template>
        <template #path="{ row }">
          <span class="code-text">{{ row.path }}</span>
        </template>
        <template #hidden="{ row }">
          <t-tag v-if="row.hidden === 1" theme="warning" variant="light">
            {{ t('pages.system.common.hidden') }}
          </t-tag>
          <t-tag v-else theme="success" variant="light">
            {{ t('pages.system.common.visible') }}
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
        <template #isVip="{ row }">
          <t-tag v-if="row.isVip === 1" theme="warning" variant="light">VIP</t-tag>
          <span v-else class="muted-text">-</span>
        </template>
        <template #operation="{ row }">
          <t-space size="small" break-line>
            <t-link v-permission="'sys:menu:add'" theme="primary" @click="handleCreateChild(row)">
              {{ t('pages.system.menu.actions.addChild') }}
            </t-link>
            <t-link v-permission="'sys:menu:edit'" theme="primary" @click="handleEdit(row)">
              {{ t('pages.system.common.edit') }}
            </t-link>
            <t-link v-permission="'sys:menu:edit'" theme="primary" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? t('pages.system.menu.actions.disable') : t('pages.system.menu.actions.enable') }}
            </t-link>
            <t-popconfirm :content="t('pages.system.menu.deleteConfirm')" @confirm="handleDelete(row)">
              <t-link v-permission="'sys:menu:delete'" theme="danger">
                {{ t('pages.system.common.delete') }}
              </t-link>
            </t-popconfirm>
          </t-space>
        </template>
      </t-enhanced-table>
    </t-card>

    <menu-form
      v-model:visible="formVisible"
      :menu="currentMenu"
      :parent="currentParent"
      :tree="data"
      @saved="handleMenuSaved"
    />
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { deleteMenu, getMenuTree, updateMenuStatus } from '@/api/system/menu';
import type { MenuTreeNode } from '@/api/system/model';
import { t } from '@/locales';

import MenuForm from './components/MenuForm.vue';

defineOptions({
  name: 'UserMenuManagement',
});

const keyword = ref('');
const loading = ref(false);
const data = ref<MenuTreeNode[]>([]);
const formVisible = ref(false);
const currentMenu = ref<MenuTreeNode | null>(null);
const currentParent = ref<MenuTreeNode | null>(null);

const columns: PrimaryTableCol<MenuTreeNode>[] = [
  { title: t('pages.system.menu.columns.title'), colKey: 'titleZhCn', minWidth: 200 },
  { title: t('pages.system.menu.columns.name'), colKey: 'name', minWidth: 200 },
  { title: t('pages.system.menu.columns.path'), colKey: 'path', minWidth: 180, ellipsis: true },
  { title: t('pages.system.menu.columns.component'), colKey: 'component', minWidth: 220, ellipsis: true },
  { title: t('pages.system.menu.columns.icon'), colKey: 'icon', width: 120 },
  { title: t('pages.system.menu.columns.sort'), colKey: 'orderNo', width: 100 },
  { title: t('pages.system.menu.columns.hidden'), colKey: 'hidden', width: 110 },
  { title: t('pages.system.menu.columns.status'), colKey: 'status', width: 110 },
  { title: t('pages.system.menu.columns.isVip'), colKey: 'isVip', width: 90 },
  { title: t('pages.system.common.operation'), colKey: 'operation', fixed: 'right', width: 280 },
];

const filterTree = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
  const words = keyword.value.trim().toLowerCase();
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children) : [];
      const fields = [
        node.titleZhCn,
        node.titleEnUs,
        node.name,
        node.path,
        node.component,
        node.icon,
        node.permissionCode,
      ];
      const matchKeyword = !words || fields.some((item) => item?.toLowerCase().includes(words));
      if (matchKeyword || children.length) {
        return { ...node, children };
      }
      return null;
    })
    .filter(Boolean) as MenuTreeNode[];
};

const filteredData = computed(() => filterTree(data.value));

const fetchData = async () => {
  loading.value = true;
  try {
    data.value = await getMenuTree();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.menu.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCreateRoot = () => {
  currentMenu.value = null;
  currentParent.value = null;
  formVisible.value = true;
};

const handleCreateChild = (parent: MenuTreeNode) => {
  currentMenu.value = null;
  currentParent.value = parent;
  formVisible.value = true;
};

const handleEdit = (menu: MenuTreeNode) => {
  currentMenu.value = menu;
  currentParent.value = null;
  formVisible.value = true;
};

const handleToggleStatus = async (menu: MenuTreeNode) => {
  try {
    await updateMenuStatus(menu.id, {
      status: menu.status === 1 ? 0 : 1,
    });
    MessagePlugin.success(t('pages.system.common.saveSuccess'));
    fetchData();
    MessagePlugin.info(t('pages.system.menu.refreshTip'));
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.saveFailed'));
  }
};

const handleMenuSaved = () => {
  fetchData();
  MessagePlugin.info(t('pages.system.menu.refreshTip'));
};

const handleDelete = async (menu: MenuTreeNode) => {
  try {
    await deleteMenu(menu.id);
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

  .menu-title-cell {
    display: grid;
    gap: 2px;
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
    .search-input {
      width: 100%;
    }
  }
}
</style>
