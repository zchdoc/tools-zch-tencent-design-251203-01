<template>
  <t-dialog v-model:visible="formVisible" :header="dialogTitle" :width="820" :footer="false" destroy-on-close>
    <t-form :data="formData" :rules="rules" :label-width="120" @submit="onSubmit">
      <t-row :gutter="[16, 0]">
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.parentId')" name="parentId">
            <t-select v-model="formData.parentId" filterable>
              <t-option :label="t('pages.system.menu.form.rootMenu')" :value="0" />
              <t-option v-for="item in parentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </t-select>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.title')" name="titleZhCn">
            <t-input
              v-model="formData.titleZhCn"
              :placeholder="t('pages.system.menu.form.titlePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.titleEnUs')" name="titleEnUs">
            <t-input
              v-model="formData.titleEnUs"
              :placeholder="t('pages.system.menu.form.titleEnPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.name')" name="name">
            <t-input v-model="formData.name" :placeholder="t('pages.system.menu.form.namePlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.path')" name="path">
            <t-input v-model="formData.path" :placeholder="t('pages.system.menu.form.pathPlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.component')" name="component">
            <t-input
              v-model="formData.component"
              :placeholder="t('pages.system.menu.form.componentPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.redirect')" name="redirect">
            <t-input
              v-model="formData.redirect"
              :placeholder="t('pages.system.menu.form.redirectPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.icon')" name="icon">
            <t-input v-model="formData.icon" :placeholder="t('pages.system.menu.form.iconPlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.permissionCode')" name="permissionCode">
            <t-select
              v-model="formData.permissionCode"
              :placeholder="t('pages.system.menu.form.permissionCodePlaceholder')"
              :loading="permissionLoading"
              clearable
              filterable
            >
              <t-option v-for="item in permissionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </t-select>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.frameSrc')" name="frameSrc">
            <t-input
              v-model="formData.frameSrc"
              :placeholder="t('pages.system.menu.form.frameSrcPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.sort')" name="orderNo">
            <t-input-number v-model="formData.orderNo" :min="0" :max="9999" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.status')" name="status">
            <t-radio-group v-model="formData.status">
              <t-radio :value="1">{{ t('pages.system.common.enabled') }}</t-radio>
              <t-radio :value="0">{{ t('pages.system.common.disabled') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.hidden')" name="hidden">
            <t-radio-group v-model="formData.hidden">
              <t-radio :value="0">{{ t('pages.system.common.visible') }}</t-radio>
              <t-radio :value="1">{{ t('pages.system.common.hidden') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.frameBlank')" name="frameBlank">
            <t-switch v-model="frameBlankChecked" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.keepAlive')" name="keepAlive">
            <t-switch v-model="keepAliveChecked" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.menu.columns.isVip')" name="isVip">
            <t-switch v-model="isVipChecked" />
          </t-form-item>
        </t-col>
      </t-row>

      <t-form-item class="form-actions">
        <t-space>
          <t-button theme="default" variant="outline" @click="close">{{ t('pages.system.common.cancel') }}</t-button>
          <t-button theme="primary" type="submit" :loading="submitting">
            {{ t('pages.system.common.confirm') }}
          </t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormRules, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref, watch } from 'vue';

import { createMenu, updateMenu } from '@/api/system/menu';
import type { MenuRequest, MenuTreeNode, PermissionTreeNode } from '@/api/system/model';
import { getPermissionTree } from '@/api/system/permission';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  menu?: MenuTreeNode | null;
  parent?: MenuTreeNode | null;
  tree?: MenuTreeNode[];
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

interface ParentOption {
  label: string;
  value: number;
}

interface PermissionOption {
  label: string;
  value: string;
}

const initialFormData = (): MenuRequest => ({
  parentId: 0,
  name: '',
  path: '',
  component: '',
  redirect: '',
  titleZhCn: '',
  titleEnUs: '',
  icon: '',
  orderNo: 0,
  hidden: 0,
  status: 1,
  frameSrc: '',
  frameBlank: 0,
  keepAlive: 1,
  isVip: 0,
  permissionCode: '',
});

const formVisible = ref(false);
const submitting = ref(false);
const permissionLoading = ref(false);
const permissionOptions = ref<PermissionOption[]>([]);
const formData = reactive<MenuRequest>(initialFormData());

const isEdit = computed(() => Boolean(props.menu?.id));
const dialogTitle = computed(() => {
  if (isEdit.value) return t('pages.system.menu.form.editTitle');
  if (props.parent) return t('pages.system.menu.form.createChildTitle');
  return t('pages.system.menu.form.createTitle');
});

const rules: FormRules<MenuRequest> = {
  titleZhCn: [{ required: true, message: t('pages.system.menu.form.titleRequired'), type: 'error' }],
  name: [{ required: true, message: t('pages.system.menu.form.nameRequired'), type: 'error' }],
  path: [{ required: true, message: t('pages.system.menu.form.pathRequired'), type: 'error' }],
  component: [{ required: true, message: t('pages.system.menu.form.componentRequired'), type: 'error' }],
};

const frameBlankChecked = computed({
  get: () => formData.frameBlank === 1,
  set: (value: boolean) => {
    formData.frameBlank = value ? 1 : 0;
  },
});
const keepAliveChecked = computed({
  get: () => formData.keepAlive === 1,
  set: (value: boolean) => {
    formData.keepAlive = value ? 1 : 0;
  },
});
const isVipChecked = computed({
  get: () => formData.isVip === 1,
  set: (value: boolean) => {
    formData.isVip = value ? 1 : 0;
  },
});

const collectExcludedIds = (node?: MenuTreeNode | null): number[] => {
  if (!node) return [];
  return [node.id, ...(node.children || []).flatMap((child) => collectExcludedIds(child))];
};

const flattenMenuOptions = (nodes: MenuTreeNode[], level = 0, excludedIds: number[] = []): ParentOption[] =>
  nodes.flatMap((node) => {
    const children = node.children?.length ? flattenMenuOptions(node.children, level + 1, excludedIds) : [];
    if (excludedIds.includes(node.id)) return children;
    return [
      {
        label: `${'--'.repeat(level)} ${node.titleZhCn || node.name}`,
        value: node.id,
      },
      ...children,
    ];
  });

const parentOptions = computed(() =>
  flattenMenuOptions(props.tree || [], 0, collectExcludedIds(isEdit.value ? props.menu : null)),
);

const flattenPermissionOptions = (nodes: PermissionTreeNode[], level = 0): PermissionOption[] =>
  nodes.flatMap((node) => {
    const children = node.children?.length ? flattenPermissionOptions(node.children, level + 1) : [];
    if (!node.code) return children;
    return [
      {
        label: `${'--'.repeat(level)} ${node.name} (${node.code})`,
        value: node.code,
      },
      ...children,
    ];
  });

const loadPermissionOptions = async () => {
  if (permissionOptions.value.length) return;

  permissionLoading.value = true;
  try {
    permissionOptions.value = flattenPermissionOptions(await getPermissionTree());
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.menu.form.permissionLoadFailed'));
  } finally {
    permissionLoading.value = false;
  }
};

const optionalText = (value?: string) => value?.trim() || undefined;

const resetForm = () => {
  Object.assign(formData, initialFormData(), {
    parentId: props.parent?.id ?? props.menu?.parentId ?? 0,
    name: props.menu?.name || '',
    path: props.menu?.path || '',
    component: props.menu?.component || '',
    redirect: props.menu?.redirect || '',
    titleZhCn: props.menu?.titleZhCn || '',
    titleEnUs: props.menu?.titleEnUs || '',
    icon: props.menu?.icon || '',
    orderNo: props.menu?.orderNo ?? 0,
    hidden: props.menu?.hidden ?? 0,
    status: props.menu?.status ?? 1,
    frameSrc: props.menu?.frameSrc || '',
    frameBlank: props.menu?.frameBlank ?? 0,
    keepAlive: props.menu?.keepAlive ?? 1,
    isVip: props.menu?.isVip ?? 0,
    permissionCode: props.menu?.permissionCode || '',
  });
};

const buildPayload = (): MenuRequest => ({
  parentId: formData.parentId,
  name: formData.name.trim(),
  path: formData.path.trim(),
  component: formData.component.trim(),
  redirect: optionalText(formData.redirect),
  titleZhCn: formData.titleZhCn.trim(),
  titleEnUs: optionalText(formData.titleEnUs),
  icon: optionalText(formData.icon),
  orderNo: formData.orderNo,
  hidden: formData.hidden,
  status: formData.status,
  frameSrc: optionalText(formData.frameSrc),
  frameBlank: formData.frameBlank,
  keepAlive: formData.keepAlive,
  isVip: formData.isVip,
  permissionCode: optionalText(formData.permissionCode),
});

const close = () => {
  formVisible.value = false;
};

const onSubmit = async ({ firstError }: SubmitContext<MenuRequest>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && props.menu) {
      await updateMenu(props.menu.id, buildPayload());
    } else {
      await createMenu(buildPayload());
    }
    MessagePlugin.success(t('pages.system.common.saveSuccess'));
    emit('saved');
    close();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.common.saveFailed'));
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.visible,
  (visible) => {
    formVisible.value = visible;
    if (visible) {
      resetForm();
      loadPermissionOptions();
    }
  },
  { immediate: true },
);

watch(
  () => formVisible.value,
  (visible) => {
    emit('update:visible', visible);
  },
);
</script>
<style lang="less" scoped>
.form-actions {
  :deep(.t-form__controls-content) {
    justify-content: flex-end;
  }
}
</style>
