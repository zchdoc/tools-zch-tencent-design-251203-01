<template>
  <t-dialog v-model:visible="formVisible" :header="dialogTitle" :width="760" :footer="false" destroy-on-close>
    <t-form :data="formData" :rules="rules" :label-width="110" @submit="onSubmit">
      <t-row :gutter="[16, 0]">
        <t-col v-if="!isEdit" :span="6">
          <t-form-item :label="t('pages.system.user.columns.username')" name="username">
            <t-input
              v-model="formData.username"
              :placeholder="t('pages.system.user.form.usernamePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col v-if="!isEdit" :span="6">
          <t-form-item :label="t('pages.system.user.resetPassword.password')" name="password">
            <t-input
              v-model="formData.password"
              type="password"
              :placeholder="t('pages.system.user.form.passwordPlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.nickname')" name="nickname">
            <t-input
              v-model="formData.nickname"
              :placeholder="t('pages.system.user.form.nicknamePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.email')" name="email">
            <t-input v-model="formData.email" :placeholder="t('pages.system.user.form.emailPlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.phone')" name="phone">
            <t-input v-model="formData.phone" :placeholder="t('pages.system.user.form.phonePlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.avatar')" name="avatar">
            <t-input v-model="formData.avatar" :placeholder="t('pages.system.user.form.avatarPlaceholder')" clearable />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.userType')" name="userType">
            <t-select v-model="formData.userType">
              <t-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </t-select>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="t('pages.system.user.columns.status')" name="status">
            <t-radio-group v-model="formData.status">
              <t-radio :value="1">{{ t('pages.system.common.enabled') }}</t-radio>
              <t-radio :value="0">{{ t('pages.system.common.disabled') }}</t-radio>
            </t-radio-group>
          </t-form-item>
        </t-col>
        <t-col :span="12">
          <t-form-item :label="t('pages.system.user.columns.vipExpireTime')" name="vipExpireTime">
            <t-input
              v-model="formData.vipExpireTime"
              :placeholder="t('pages.system.user.form.vipExpireTimePlaceholder')"
              clearable
            />
          </t-form-item>
        </t-col>
        <t-col v-if="!isEdit" :span="12">
          <t-form-item :label="t('pages.system.user.columns.roles')" name="roleIds">
            <t-loading :loading="roleLoading" size="small">
              <t-checkbox-group v-if="roleList.length" v-model="selectedRoleIds">
                <t-space break-line>
                  <t-checkbox v-for="role in roleList" :key="role.id" :value="role.id">
                    {{ role.roleName }} ({{ role.roleCode }})
                  </t-checkbox>
                </t-space>
              </t-checkbox-group>
              <span v-else class="muted-text">{{ t('pages.system.user.roleDialog.noRole') }}</span>
            </t-loading>
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

import type { SysRole, SysUser, UserCreateRequest, UserUpdateRequest } from '@/api/system/model';
import { getRoleList } from '@/api/system/role';
import { createUser, updateUser } from '@/api/system/user';
import { t } from '@/locales';

const props = defineProps<{
  visible: boolean;
  user?: SysUser | null;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  saved: [];
}>();

const initialFormData = (): UserCreateRequest => ({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  status: 1,
  userType: 1,
  vipExpireTime: '',
  roleIds: [],
});

const formVisible = ref(false);
const submitting = ref(false);
const roleLoading = ref(false);
const roleList = ref<SysRole[]>([]);
const selectedRoleIds = ref<number[]>([]);
const formData = reactive<UserCreateRequest>(initialFormData());

const isEdit = computed(() => Boolean(props.user?.id));
const dialogTitle = computed(() =>
  isEdit.value ? t('pages.system.user.form.editTitle') : t('pages.system.user.form.createTitle'),
);
const userTypeOptions = computed(() => [
  { label: t('pages.system.user.type.normal'), value: 1 },
  { label: t('pages.system.user.type.vip'), value: 2 },
  { label: t('pages.system.user.type.admin'), value: 9 },
]);

const rules: FormRules<UserCreateRequest> = {
  username: [{ required: true, message: t('pages.system.user.form.usernameRequired'), type: 'error' }],
  password: [{ required: true, message: t('pages.system.user.form.passwordRequired'), type: 'error' }],
};

const optionalText = (value?: string) => value?.trim() || undefined;

const loadRoles = async () => {
  roleLoading.value = true;
  try {
    roleList.value = await getRoleList();
  } catch (error: any) {
    MessagePlugin.error(error?.message || t('pages.system.user.form.roleLoadFailed'));
  } finally {
    roleLoading.value = false;
  }
};

const resetForm = () => {
  Object.assign(formData, initialFormData(), {
    username: props.user?.username || '',
    nickname: props.user?.nickname || '',
    email: props.user?.email || '',
    phone: props.user?.phone || '',
    avatar: props.user?.avatar || '',
    status: props.user?.status ?? 1,
    userType: props.user?.userType ?? 1,
    vipExpireTime: props.user?.vipExpireTime || '',
  });
  selectedRoleIds.value = props.user?.roleIds?.slice() || [];
};

const close = () => {
  formVisible.value = false;
};

const buildUpdatePayload = (): UserUpdateRequest => ({
  nickname: optionalText(formData.nickname),
  email: optionalText(formData.email),
  phone: optionalText(formData.phone),
  avatar: optionalText(formData.avatar),
  status: formData.status,
  userType: formData.userType,
  vipExpireTime: optionalText(formData.vipExpireTime),
});

const onSubmit = async ({ firstError }: SubmitContext<UserCreateRequest>) => {
  if (firstError) {
    MessagePlugin.warning(firstError);
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && props.user) {
      await updateUser(props.user.id, buildUpdatePayload());
    } else {
      await createUser({
        username: formData.username.trim(),
        password: formData.password,
        ...buildUpdatePayload(),
        roleIds: selectedRoleIds.value,
      });
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
      if (!isEdit.value) {
        loadRoles();
      }
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

.muted-text {
  color: var(--td-text-color-secondary);
}
</style>
