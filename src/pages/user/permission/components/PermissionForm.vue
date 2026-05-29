<template>
  <t-dialog v-model:visible="formVisible" :header="dialogTitle" :width="720" :footer="false" destroy-on-close>
    <t-form :data="formData" :rules="rules" :label-width="110" @submit="onSubmit">
      <t-row :gutter="[16, 0]">
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.name')" name="name">
            <t-input
              v-model="formData.name"
              :placeholder="t('pages.system.permission.form.namePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.code')" name="code">
            <t-input
              v-model="formData.code"
              :placeholder="t('pages.system.permission.form.codePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.type')" name="type">
            <t-select v-model="formData.type">
              <t-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </t-select>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.parentId')" name="parentId">
            <t-input-number v-model="formData.parentId" :min="0" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.path')" name="path">
            <t-input v-model="formData.path" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.component')" name="component">
            <t-input v-model="formData.component" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.icon')" name="icon">
            <t-input v-model="formData.icon" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.sort')" name="sort">
            <t-input-number v-model="formData.sort" :min="0" :max="9999" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.status')" name="status">
            <t-radio-group v-model="formData.status">
              <t-radio :value="1">{{ t('pages.system.common.enabled') }}</t-radio>
              <t-radio :value="0">{{ t('pages.system.common.disabled') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.visible')" name="visible">
            <t-radio-group v-model="formData.visible">
              <t-radio :value="1">{{ t('pages.system.common.visible') }}</t-radio>
              <t-radio :value="0">{{ t('pages.system.common.hidden') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.permission.columns.isVip')" name="isVip">
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

import type { PermissionRequest, PermissionTreeNode } from '@/api/system/model';
import { createPermission, updatePermission } from '@/api/system/permission';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  permission?: PermissionTreeNode | null;
  parent?: PermissionTreeNode | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const initialFormData = (): PermissionRequest => ({
  parentId: 0,
  name: '',
  code: '',
  type: 3,
  path: '',
  component: '',
  icon: '',
  sort: 0,
  visible: 1,
  status: 1,
  isVip: 0,
});

const formVisible = ref(false);
const submitting = ref(false);
const formData = reactive<PermissionRequest>(initialFormData());

const isEdit = computed(() => Boolean(props.permission?.id));
const dialogTitle = computed(() => {
  if (isEdit.value) return t('pages.system.permission.form.editTitle');
  if (props.parent) return t('pages.system.permission.form.createChildTitle');
  return t('pages.system.permission.form.createTitle');
});
const isVipChecked = computed({
  get: () => formData.isVip === 1,
  set: (value: boolean) => {
    formData.isVip = value ? 1 : 0;
  },
});

const typeOptions = computed(() => [
  { label: t('pages.system.permission.type.directory'), value: 1 },
  { label: t('pages.system.permission.type.menu'), value: 2 },
  { label: t('pages.system.permission.type.button'), value: 3 },
  { label: t('pages.system.permission.type.api'), value: 4 },
]);

const rules: FormRules<PermissionRequest> = {
  name: [{ required: true, message: t('pages.system.permission.form.nameRequired'), type: 'error' }],
  code: [{ required: true, message: t('pages.system.permission.form.codeRequired'), type: 'error' }],
  type: [{ required: true, message: t('pages.system.permission.form.typeRequired'), type: 'error' }],
};

const resetForm = () => {
  Object.assign(formData, initialFormData(), {
    parentId: props.parent?.id ?? props.permission?.parentId ?? 0,
    name: props.permission?.name || '',
    code: props.permission?.code || '',
    type: props.permission?.type ?? 3,
    path: props.permission?.path || '',
    component: props.permission?.component || '',
    icon: props.permission?.icon || '',
    sort: props.permission?.sort ?? 0,
    visible: props.permission?.visible ?? 1,
    status: props.permission?.status ?? 1,
    isVip: props.permission?.isVip ?? 0,
  });
};

const close = () => {
  formVisible.value = false;
};

const onSubmit = async ({ firstError }: SubmitContext<PermissionRequest>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && props.permission) {
      await updatePermission(props.permission.id, formData);
    } else {
      await createPermission(formData);
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
