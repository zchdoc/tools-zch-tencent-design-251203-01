<template>
  <t-dialog v-model:visible="formVisible" :header="dialogTitle" :width="640" :footer="false" destroy-on-close>
    <t-form :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
      <t-form-item :label="t('pages.system.role.columns.name')" name="roleName">
        <t-input v-model="formData.roleName" :placeholder="t('pages.system.role.form.roleNamePlaceholder')" clearable />
      </t-form-item>
      <t-form-item :label="t('pages.system.role.columns.code')" name="roleCode">
        <t-input v-model="formData.roleCode" :placeholder="t('pages.system.role.form.roleCodePlaceholder')" clearable />
      </t-form-item>
      <t-form-item :label="t('pages.system.role.columns.status')" name="status">
        <t-radio-group v-model="formData.status">
          <t-radio :value="1">{{ t('pages.system.common.enabled') }}</t-radio>
          <t-radio :value="0">{{ t('pages.system.common.disabled') }}</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item :label="t('pages.system.role.columns.sort')" name="sort">
        <t-input-number v-model="formData.sort" :min="0" :max="9999" />
      </t-form-item>
      <t-form-item :label="t('pages.system.role.columns.description')" name="description">
        <t-textarea
          v-model="formData.description"
          :autosize="{ minRows: 3, maxRows: 5 }"
          :placeholder="t('pages.system.role.form.descriptionPlaceholder')"
        />
      </t-form-item>
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

import type { RoleRequest, SysRole } from '@/api/system/model';
import { createRole, updateRole } from '@/api/system/role';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  role?: SysRole | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const initialFormData = (): RoleRequest => ({
  roleCode: '',
  roleName: '',
  description: '',
  status: 1,
  sort: 0,
});

const formVisible = ref(false);
const submitting = ref(false);
const formData = reactive<RoleRequest>(initialFormData());

const isEdit = computed(() => Boolean(props.role?.id));
const dialogTitle = computed(() =>
  isEdit.value ? t('pages.system.role.form.editTitle') : t('pages.system.role.form.createTitle'),
);

const rules: FormRules<RoleRequest> = {
  roleName: [{ required: true, message: t('pages.system.role.form.roleNameRequired'), type: 'error' }],
  roleCode: [{ required: true, message: t('pages.system.role.form.roleCodeRequired'), type: 'error' }],
};

const resetForm = () => {
  Object.assign(formData, initialFormData(), {
    roleCode: props.role?.roleCode || '',
    roleName: props.role?.roleName || '',
    description: props.role?.description || '',
    status: props.role?.status ?? 1,
    sort: props.role?.sort ?? 0,
  });
};

const close = () => {
  formVisible.value = false;
};

const onSubmit = async ({ firstError }: SubmitContext<RoleRequest>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && props.role) {
      await updateRole(props.role.id, formData);
    } else {
      await createRole(formData);
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
