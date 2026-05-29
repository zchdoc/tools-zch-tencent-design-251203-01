<template>
  <t-dialog v-model:visible="formVisible" :header="dialogTitle" :width="680" :footer="false" destroy-on-close>
    <t-form :data="formData" :rules="rules" :label-width="110" @submit="onSubmit">
      <t-row :gutter="[16, 0]">
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.type')" name="dictType">
            <t-input v-model="formData.dictType" :placeholder="t('pages.system.dict.form.typePlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.name')" name="dictName">
            <t-input v-model="formData.dictName" :placeholder="t('pages.system.dict.form.namePlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.label')" name="dictLabel">
            <t-input
              v-model="formData.dictLabel"
              :placeholder="t('pages.system.dict.form.labelPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.value')" name="dictValue">
            <t-input
              v-model="formData.dictValue"
              :placeholder="t('pages.system.dict.form.valuePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.status')" name="status">
            <t-radio-group v-model="formData.status">
              <t-radio :value="1">{{ t('pages.system.common.enabled') }}</t-radio>
              <t-radio :value="0">{{ t('pages.system.common.disabled') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.sort')" name="sort">
            <t-input-number v-model="formData.sort" :min="0" :max="9999" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.dict.columns.isSystem')" name="isSystem">
            <t-switch v-model="isSystemChecked" />
          </t-form-item>
        </t-col>
        <t-col :span="12">
          <t-form-item :label="t('pages.system.dict.columns.description')" name="description">
            <t-textarea
              v-model="formData.description"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="t('pages.system.dict.form.descriptionPlaceholder')"
            />
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

import { createDict, updateDict } from '@/api/system/dict';
import type { DictRequest, SysDict } from '@/api/system/model';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  dict?: SysDict | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const initialFormData = (): DictRequest => ({
  dictType: '',
  dictName: '',
  dictLabel: '',
  dictValue: '',
  description: '',
  sort: 0,
  status: 1,
  isSystem: 0,
});

const formVisible = ref(false);
const submitting = ref(false);
const formData = reactive<DictRequest>(initialFormData());

const isEdit = computed(() => Boolean(props.dict?.id));
const dialogTitle = computed(() =>
  isEdit.value ? t('pages.system.dict.form.editTitle') : t('pages.system.dict.form.createTitle'),
);
const isSystemChecked = computed({
  get: () => formData.isSystem === 1,
  set: (value: boolean) => {
    formData.isSystem = value ? 1 : 0;
  },
});

const rules: FormRules<DictRequest> = {
  dictType: [{ required: true, message: t('pages.system.dict.form.typeRequired'), type: 'error' }],
  dictName: [{ required: true, message: t('pages.system.dict.form.nameRequired'), type: 'error' }],
  dictLabel: [{ required: true, message: t('pages.system.dict.form.labelRequired'), type: 'error' }],
  dictValue: [{ required: true, message: t('pages.system.dict.form.valueRequired'), type: 'error' }],
};

const optionalText = (value?: string) => value?.trim() || undefined;

const resetForm = () => {
  Object.assign(formData, initialFormData(), {
    dictType: props.dict?.dictType || '',
    dictName: props.dict?.dictName || '',
    dictLabel: props.dict?.dictLabel || '',
    dictValue: props.dict?.dictValue || '',
    description: props.dict?.description || '',
    sort: props.dict?.sort ?? 0,
    status: props.dict?.status ?? 1,
    isSystem: props.dict?.isSystem ?? 0,
  });
};

const buildPayload = (): DictRequest => ({
  dictType: formData.dictType.trim(),
  dictName: formData.dictName.trim(),
  dictLabel: formData.dictLabel.trim(),
  dictValue: formData.dictValue.trim(),
  description: optionalText(formData.description),
  sort: formData.sort,
  status: formData.status,
  isSystem: formData.isSystem,
});

const close = () => {
  formVisible.value = false;
};

const onSubmit = async ({ firstError }: SubmitContext<DictRequest>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && props.dict) {
      await updateDict(props.dict.id, buildPayload());
    } else {
      await createDict(buildPayload());
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
