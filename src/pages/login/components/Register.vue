<template>
  <t-form
    ref="form"
    class="item-container register-form"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <!-- 用户名 -->
    <t-form-item name="username">
      <t-input v-model="formData.username" size="large" placeholder="请输入用户名（4-20个字符）">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>

    <!-- 邮箱（可选） -->
    <t-form-item name="email">
      <t-input v-model="formData.email" type="text" size="large" placeholder="请输入邮箱（可选）">
        <template #prefix-icon>
          <t-icon name="mail" />
        </template>
      </t-input>
    </t-form-item>

    <!-- 密码 -->
    <t-form-item name="password">
      <t-input
        v-model="formData.password"
        size="large"
        :type="showPsw ? 'text' : 'password'"
        clearable
        placeholder="请输入密码（6-20个字符）"
      >
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
        </template>
      </t-input>
    </t-form-item>

    <!-- 确认密码 -->
    <t-form-item name="confirmPassword">
      <t-input
        v-model="formData.confirmPassword"
        size="large"
        :type="showConfirmPsw ? 'text' : 'password'"
        clearable
        placeholder="请再次输入密码"
      >
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon :name="showConfirmPsw ? 'browse' : 'browse-off'" @click="showConfirmPsw = !showConfirmPsw" />
        </template>
      </t-input>
    </t-form-item>

    <!-- 协议勾选 -->
    <t-form-item class="check-container" name="checked">
      <t-checkbox v-model="formData.checked">我已阅读并同意 </t-checkbox>
      <span class="link">《服务协议》</span> 和
      <span class="link">《隐私政策》</span>
    </t-form-item>

    <!-- 注册按钮 -->
    <t-form-item>
      <t-button block size="large" type="submit" :loading="loading"> 注册 </t-button>
    </t-form-item>
  </t-form>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { register } from '@/api/auth';

const emit = defineEmits(['register-success']);

const INITIAL_DATA = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  checked: false,
};

// 自定义确认密码验证器
const confirmPasswordValidator = (val: string) => {
  if (val !== formData.value.password) {
    return { result: false, message: '两次输入的密码不一致', type: 'error' as const };
  }
  return { result: true, message: '', type: 'success' as const };
};

const FORM_RULES: Record<string, FormRule[]> = {
  username: [
    { required: true, message: '用户名必填', type: 'error' },
    { min: 4, message: '用户名至少4个字符', type: 'error' },
    { max: 20, message: '用户名最多20个字符', type: 'error' },
  ],
  email: [{ email: true, message: '请输入正确的邮箱地址', type: 'warning' }],
  password: [
    { required: true, message: '密码必填', type: 'error' },
    { min: 6, message: '密码至少6个字符', type: 'error' },
    { max: 20, message: '密码最多20个字符', type: 'error' },
  ],
  confirmPassword: [{ required: true, message: '请确认密码', type: 'error' }, { validator: confirmPasswordValidator }],
};

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const loading = ref(false);

const showPsw = ref(false);
const showConfirmPsw = ref(false);

/**
 * 表单提交 - 注册
 */
const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    if (!formData.value.checked) {
      MessagePlugin.error('请同意服务协议和隐私政策');
      return;
    }

    loading.value = true;
    try {
      // 调用后端注册 API
      await register({
        username: formData.value.username,
        password: formData.value.password,
        confirmPassword: formData.value.confirmPassword,
        email: formData.value.email || undefined,
      });

      MessagePlugin.success('注册成功，请登录');

      // 清空表单
      formData.value = { ...INITIAL_DATA };

      // 触发注册成功事件，切换到登录页
      emit('register-success');
    } catch (e: any) {
      console.error('注册失败:', e);
      MessagePlugin.error(e.message || '注册失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  }
};
</script>
<style lang="less" scoped>
@import '../index.less';

.link {
  color: var(--td-brand-color);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
