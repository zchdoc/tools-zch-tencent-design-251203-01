<template>
  <div class="xb-bbs-enc">
    <div class="xb-bbs-enc__header">
      <h1 class="xb-bbs-enc__title">{{ t('pages.xbBbsEnc.title') }}</h1>
      <p class="xb-bbs-enc__description">{{ t('pages.xbBbsEnc.description') }}</p>
    </div>

    <t-divider />

    <div class="xb-bbs-enc__content">
      <div class="xb-bbs-enc__panel">
        <div class="xb-bbs-enc__panel-header">
          <h3 class="xb-bbs-enc__panel-title">
            <lock-on-icon class="xb-bbs-enc__panel-icon" />
            {{ t('pages.xbBbsEnc.encryptPanel') }}
            <t-tag size="small" theme="primary" variant="light">{{ t('pages.xbBbsEnc.algorithmTag') }}</t-tag>
          </h3>
          <t-button size="small" variant="text" theme="primary" @click="handleClearEncrypt">
            <template #icon><clear-icon /></template>
            {{ t('pages.xbBbsEnc.clear') }}
          </t-button>
        </div>

        <div class="xb-bbs-enc__form">
          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.key') }}</label>
            <div class="xb-bbs-enc__input-wrapper">
              <t-input
                v-model="key"
                :type="showKey ? 'text' : 'password'"
                :placeholder="t('pages.xbBbsEnc.keyPlaceholder')"
                clearable
              />
              <t-button size="small" variant="text" theme="primary" @click="showKey = !showKey">
                <template #icon>
                  <browse-icon v-if="showKey" />
                  <browse-off-icon v-else />
                </template>
                {{ showKey ? t('pages.xbBbsEnc.hideKey') : t('pages.xbBbsEnc.showKey') }}
              </t-button>
            </div>
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.text') }}</label>
            <div class="xb-bbs-enc__input-wrapper">
              <t-input
                v-model="text"
                :placeholder="t('pages.xbBbsEnc.textPlaceholder')"
                clearable
                @enter="handleEncrypt"
              />
            </div>
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.result') }}</label>
            <div class="xb-bbs-enc__input-wrapper">
              <t-input v-model="result" :placeholder="t('pages.xbBbsEnc.resultPlaceholder')" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(result)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <t-space>
            <t-button theme="primary" @click="handleEncrypt">{{ t('pages.xbBbsEnc.encrypt') }}</t-button>
            <t-button theme="primary" variant="outline" @click="handleDecrypt">{{
              t('pages.xbBbsEnc.decrypt')
            }}</t-button>
            <t-button variant="outline" :disabled="!result" @click="handleUseResultAsInput">
              <template #icon><swap-icon /></template>
              {{ t('pages.xbBbsEnc.useResultAsInput') }}
            </t-button>
          </t-space>
        </div>
      </div>

      <div class="xb-bbs-enc__panel">
        <div class="xb-bbs-enc__panel-header">
          <h3 class="xb-bbs-enc__panel-title">
            <internet-icon class="xb-bbs-enc__panel-icon" />
            {{ t('pages.xbBbsEnc.queryPanel') }}
          </h3>
        </div>

        <div class="xb-bbs-enc__form">
          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.customHost') }}</label>
            <t-input v-model="customHost" :placeholder="t('pages.xbBbsEnc.customHostPlaceholder')" clearable />
            <p class="xb-bbs-enc__hint">{{ t('pages.xbBbsEnc.customHostHint') }}</p>
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.serverList') }}</label>
            <t-select v-model="selectedHost" filterable>
              <t-option
                v-for="item in XB_SERVERS"
                :key="item.id"
                :value="item.host"
                :label="item.host"
                :disabled="item.disabled"
              />
            </t-select>
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.deviceNum') }}</label>
            <t-input
              v-model="deviceNum"
              :placeholder="t('pages.xbBbsEnc.deviceNumPlaceholder')"
              clearable
              @input="handleDeviceNumInput"
            />
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.deviceSN') }}</label>
            <div class="xb-bbs-enc__input-wrapper">
              <t-input
                v-model="deviceSN"
                :placeholder="t('pages.xbBbsEnc.deviceSNPlaceholder')"
                clearable
                @input="handleDeviceSNInput"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(deviceSN)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <div class="xb-bbs-enc__form-item">
            <label class="xb-bbs-enc__label">{{ t('pages.xbBbsEnc.deviceOriNum') }}</label>
            <div class="xb-bbs-enc__input-wrapper">
              <t-input v-model="deviceOriNum" :placeholder="t('pages.xbBbsEnc.deviceOriNumPlaceholder')" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(deviceOriNum)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <t-space break-line>
            <t-button theme="primary" @click="handleOpenPasswordPage">
              <template #icon><jump-icon /></template>
              {{ t('pages.xbBbsEnc.openPasswordPage') }}
            </t-button>
            <t-button theme="primary" variant="outline" @click="handleQueryDevice">
              <template #icon><jump-icon /></template>
              {{ t('pages.xbBbsEnc.queryDevice') }}
            </t-button>
            <t-button variant="outline" @click="handleConvertFormat">{{ t('pages.xbBbsEnc.convertFormat') }}</t-button>
          </t-space>

          <div v-if="passwordQueryUrl" class="xb-bbs-enc__url">
            <span class="xb-bbs-enc__url-label">{{ t('pages.xbBbsEnc.passwordUrl') }}</span>
            <span class="xb-bbs-enc__url-value">{{ passwordQueryUrl }}</span>
          </div>
          <div v-if="deviceQueryUrl" class="xb-bbs-enc__url">
            <span class="xb-bbs-enc__url-label">{{ t('pages.xbBbsEnc.deviceUrl') }}</span>
            <span class="xb-bbs-enc__url-value">{{ deviceQueryUrl }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="xb-bbs-enc__panel xb-bbs-enc__panel--wide">
      <div class="xb-bbs-enc__panel-header">
        <h3 class="xb-bbs-enc__panel-title">
          <desktop-icon class="xb-bbs-enc__panel-icon" />
          {{ t('pages.xbBbsEnc.serverCopyPanel') }}
        </h3>
      </div>
      <div class="xb-bbs-enc__server-list">
        <div v-for="item in XB_SERVERS_WITH_IP" :key="item.id" class="xb-bbs-enc__server-item">
          <span class="xb-bbs-enc__server-name">{{ item.id.toUpperCase() }}</span>
          <span class="xb-bbs-enc__server-label">{{ t('pages.xbBbsEnc.serverIp') }}:</span>
          <t-link theme="primary" hover="color" @click="handleCopy(item.ip || '')">{{ item.ip }}</t-link>
          <span class="xb-bbs-enc__server-label">{{ t('pages.xbBbsEnc.serverUrl') }}:</span>
          <t-link theme="primary" hover="color" @click="handleCopy(item.urlLabel || item.host)">
            {{ item.urlLabel || item.host }}
          </t-link>
        </div>
      </div>
    </div>

    <div class="xb-bbs-enc__usage">
      <t-collapse :default-value="['1']">
        <t-collapse-panel value="1" :header="t('pages.xbBbsEnc.usageTitle')">
          <div class="xb-bbs-enc__usage-content">
            <h4>{{ t('pages.xbBbsEnc.encryptTitle') }}</h4>
            <ul>
              <li>{{ t('pages.xbBbsEnc.encryptTip1') }}</li>
              <li>{{ t('pages.xbBbsEnc.encryptTip2') }}</li>
              <li>{{ t('pages.xbBbsEnc.encryptTip3') }}</li>
            </ul>
            <h4>{{ t('pages.xbBbsEnc.queryTitle') }}</h4>
            <ul>
              <li>{{ t('pages.xbBbsEnc.queryTip1') }}</li>
              <li>{{ t('pages.xbBbsEnc.queryTip2') }}</li>
              <li>{{ t('pages.xbBbsEnc.queryTip3') }}</li>
            </ul>
            <h4>{{ t('pages.xbBbsEnc.convertTitle') }}</h4>
            <ul>
              <li>{{ t('pages.xbBbsEnc.convertTip1') }}</li>
              <li>{{ t('pages.xbBbsEnc.convertTip2') }}</li>
              <li>{{ t('pages.xbBbsEnc.convertTip3') }}</li>
            </ul>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  BrowseIcon,
  BrowseOffIcon,
  ClearIcon,
  DesktopIcon,
  FileCopyIcon,
  InternetIcon,
  JumpIcon,
  LockOnIcon,
  SwapIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { decryptByDESModeECB, encryptByDES } from './des';
import {
  buildHttpUrl,
  decimalToPaddedHex,
  normalizeHost,
  paddedHexToDecimal,
  XB_SERVERS,
  XB_SERVERS_WITH_IP,
} from './servers';

defineOptions({
  name: 'XBBSEnc',
});

const { t } = useI18n();

const key = ref('abc');
const text = ref('1');
const result = ref('');
const showKey = ref(false);

const customHost = ref('');
const selectedHost = ref(XB_SERVERS[0].host);
const deviceNum = ref('1');
const deviceSN = ref(decimalToPaddedHex('1'));
const deviceOriNum = ref('1');

const activeHost = computed(() => normalizeHost(customHost.value) || selectedHost.value);

const passwordQueryUrl = computed(() => {
  if (!activeHost.value || !result.value) {
    return '';
  }
  return buildHttpUrl(activeHost.value, `/s/suf.do?s=${encodeURIComponent(result.value)}`);
});

const deviceQueryUrl = computed(() => {
  if (!activeHost.value || !deviceNum.value.trim()) {
    return '';
  }
  return buildHttpUrl(activeHost.value, `/s/s.do?s=${encodeURIComponent(deviceNum.value.trim())}`);
});

function encryptToResult(): boolean {
  if (!key.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseInputKey'));
    return false;
  }
  if (!text.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseInputText'));
    return false;
  }
  try {
    result.value = encryptByDES(key.value, text.value);
    return true;
  } catch {
    MessagePlugin.error(t('pages.xbBbsEnc.decryptFailed'));
    return false;
  }
}

function handleEncrypt() {
  if (encryptToResult()) {
    MessagePlugin.success(t('pages.xbBbsEnc.encryptSuccess'));
  }
}

function handleDecrypt() {
  if (!key.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseInputKey'));
    return;
  }
  if (!text.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseInputText'));
    return;
  }
  try {
    const decrypted = decryptByDESModeECB(key.value, text.value);
    if (!decrypted) {
      MessagePlugin.error(t('pages.xbBbsEnc.decryptFailed'));
      return;
    }
    result.value = decrypted;
    MessagePlugin.success(t('pages.xbBbsEnc.decryptSuccess'));
  } catch {
    MessagePlugin.error(t('pages.xbBbsEnc.invalidHex'));
  }
}

function handleUseResultAsInput() {
  if (!result.value) {
    return;
  }
  text.value = result.value;
}

function handleClearEncrypt() {
  key.value = 'abc';
  text.value = '1';
  result.value = '';
  MessagePlugin.success(t('pages.xbBbsEnc.clearSuccess'));
}

function handleDeviceNumInput() {
  try {
    deviceSN.value = decimalToPaddedHex(deviceNum.value);
    if (deviceSN.value) {
      deviceOriNum.value = paddedHexToDecimal(deviceSN.value);
    } else {
      deviceOriNum.value = '';
    }
  } catch {
    deviceSN.value = '';
    deviceOriNum.value = '';
  }
}

function handleDeviceSNInput() {
  try {
    deviceOriNum.value = paddedHexToDecimal(deviceSN.value);
  } catch {
    deviceOriNum.value = '';
  }
}

function handleConvertFormat() {
  if (!deviceNum.value.trim() || !/^\d+$/.test(deviceNum.value.trim())) {
    MessagePlugin.warning(t('pages.xbBbsEnc.invalidDeviceNum'));
    return;
  }
  handleDeviceNumInput();
  MessagePlugin.success(t('pages.xbBbsEnc.convertSuccess'));
}

function handleOpenPasswordPage() {
  if (!activeHost.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseSelectServer'));
    return;
  }
  if (!encryptToResult()) {
    return;
  }
  window.open(passwordQueryUrl.value, '_blank', 'noopener,noreferrer');
  MessagePlugin.success(t('pages.xbBbsEnc.openedInNewTab'));
}

function handleQueryDevice() {
  if (!activeHost.value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.pleaseSelectServer'));
    return;
  }
  if (!deviceNum.value.trim()) {
    MessagePlugin.warning(t('pages.xbBbsEnc.invalidDeviceNum'));
    return;
  }
  window.open(deviceQueryUrl.value, '_blank', 'noopener,noreferrer');
  MessagePlugin.success(t('pages.xbBbsEnc.openedInNewTab'));
}

async function handleCopy(value: string) {
  if (!value) {
    MessagePlugin.warning(t('pages.xbBbsEnc.nothingToCopy'));
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    MessagePlugin.success(t('pages.xbBbsEnc.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.xbBbsEnc.copyFailed'));
  }
}
</script>
<style lang="less" scoped>
.xb-bbs-enc {
  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &__description {
    margin: 0;
    font-size: 14px;
    color: var(--td-text-color-secondary);
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (width <= 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &__panel {
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-stroke);
    border-radius: 10px;

    &--wide {
      margin-bottom: 20px;
    }
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--td-component-stroke);
  }

  &__panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &__panel-icon {
    font-size: 16px;
    color: var(--td-brand-color);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__hint {
    margin: 0;
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .t-input {
      flex: 1;
    }
  }

  &__url {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 6px;
  }

  &__url-label {
    font-size: 12px;
    color: var(--td-text-color-secondary);
  }

  &__url-value {
    overflow-wrap: anywhere;
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
    font-size: 12px;
    color: var(--td-brand-color);
  }

  &__server-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  &__server-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  &__server-name {
    min-width: 36px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &__server-label {
    color: var(--td-text-color-secondary);
  }

  &__usage {
    :deep(.t-collapse) {
      background: var(--td-bg-color-container);
      border: 1px solid var(--td-component-stroke);
      border-radius: 10px;
    }
  }

  &__usage-content {
    font-size: 13px;
    line-height: 1.8;
    color: var(--td-text-color-secondary);

    h4 {
      margin: 16px 0 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--td-text-color-primary);

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 0;
      padding-left: 20px;
    }

    li {
      margin: 4px 0;
    }
  }
}
</style>
