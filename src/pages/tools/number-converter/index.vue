<template>
  <div class="number-converter">
    <!-- 标题区域 -->
    <div class="number-converter__header">
      <h1 class="number-converter__title">{{ t('pages.numberConverter.title') }}</h1>
      <p class="number-converter__description">
        {{ t('pages.numberConverter.description') }}
      </p>
    </div>

    <t-divider />

    <!-- 主要转换区域 -->
    <div class="number-converter__content">
      <!-- 正序转换面板 -->
      <div class="number-converter__panel">
        <div class="number-converter__panel-header">
          <h3 class="number-converter__panel-title">
            <swap-icon class="number-converter__panel-icon" />
            {{ t('pages.numberConverter.normalConvert') }}
          </h3>
          <t-space size="small">
            <t-button size="small" variant="text" theme="primary" @click="handleClearNormal">
              <template #icon><clear-icon /></template>
              {{ t('pages.numberConverter.clear') }}
            </t-button>
          </t-space>
        </div>

        <div class="number-converter__form">
          <!-- 十六进制输入 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.hex') }}
              <t-tag size="small" theme="primary" variant="light">16</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="hexValue"
                :placeholder="t('pages.numberConverter.hexPlaceholder')"
                clearable
                @input="convertFromHex"
                @focus="handleFocus('hex')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(hexValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 十进制输入 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.decimal') }}
              <t-tag size="small" theme="success" variant="light">10</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="decimalValue"
                :placeholder="t('pages.numberConverter.decimalPlaceholder')"
                clearable
                @input="convertFromDecimal"
                @focus="handleFocus('decimal')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(decimalValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 八进制输入 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.octal') }}
              <t-tag size="small" theme="warning" variant="light">8</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="octalValue"
                :placeholder="t('pages.numberConverter.octalPlaceholder')"
                clearable
                @input="convertFromOctal"
                @focus="handleFocus('octal')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(octalValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 二进制输入 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.binary') }}
              <t-tag size="small" theme="danger" variant="light">2</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="binaryValue"
                :placeholder="t('pages.numberConverter.binaryPlaceholder')"
                clearable
                @input="convertFromBinary"
                @focus="handleFocus('binary')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(binaryValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 字符输入 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.character') }}
              <t-tag size="small" variant="light">ASCII</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="characterValue"
                :placeholder="t('pages.numberConverter.characterPlaceholder')"
                clearable
                @input="convertFromCharacter"
                @focus="handleFocus('character')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(characterValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 反序转换面板 -->
      <div class="number-converter__panel">
        <div class="number-converter__panel-header">
          <h3 class="number-converter__panel-title">
            <swap-icon class="number-converter__panel-icon" style="transform: rotate(180deg)" />
            {{ t('pages.numberConverter.reverseConvert') }}
          </h3>
          <t-tooltip :content="t('pages.numberConverter.reverseTooltip')">
            <info-circle-icon class="number-converter__info-icon" />
          </t-tooltip>
        </div>

        <div class="number-converter__form">
          <!-- 反序十六进制 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.hex') }}
              <t-tag size="small" theme="primary" variant="light">16</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input
                v-model="hexReverseValue"
                :placeholder="t('pages.numberConverter.hexReversePlaceholder')"
                clearable
                @input="convertFromHexReverse"
                @focus="handleFocus('hexReverse')"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(hexReverseValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 反序十进制 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.decimal') }}
              <t-tag size="small" theme="success" variant="light">10</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input v-model="decimalReverseValue" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(decimalReverseValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 反序八进制 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.octal') }}
              <t-tag size="small" theme="warning" variant="light">8</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input v-model="octalReverseValue" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(octalReverseValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 反序二进制 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.binary') }}
              <t-tag size="small" theme="danger" variant="light">2</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input v-model="binaryReverseValue" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(binaryReverseValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 反序字符 -->
          <div class="number-converter__form-item">
            <label class="number-converter__label">
              {{ t('pages.numberConverter.character') }}
              <t-tag size="small" variant="light">ASCII</t-tag>
            </label>
            <div class="number-converter__input-wrapper">
              <t-input v-model="characterReverseValue" readonly />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(characterReverseValue)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量转换区域 -->
    <div class="number-converter__batch">
      <t-collapse>
        <t-collapse-panel :header="t('pages.numberConverter.batchConvert')" value="batch">
          <div class="number-converter__batch-content">
            <div class="number-converter__batch-actions">
              <t-radio-group v-model="batchMode" variant="default-filled" size="small">
                <t-radio-button value="hexToDec">{{ t('pages.numberConverter.hexToDec') }}</t-radio-button>
                <t-radio-button value="decToHex">{{ t('pages.numberConverter.decToHex') }}</t-radio-button>
                <t-radio-button value="hexReverse">{{ t('pages.numberConverter.hexReverse') }}</t-radio-button>
              </t-radio-group>
              <t-space>
                <t-button theme="primary" size="small" @click="handleBatchConvert">
                  <template #icon><swap-icon /></template>
                  {{ t('pages.numberConverter.convert') }}
                </t-button>
                <t-button variant="outline" size="small" @click="handleBatchClear">
                  <template #icon><clear-icon /></template>
                  {{ t('pages.numberConverter.clear') }}
                </t-button>
              </t-space>
            </div>

            <div class="number-converter__batch-panels">
              <div class="number-converter__batch-panel">
                <div class="number-converter__batch-panel-header">
                  <span>{{ t('pages.numberConverter.input') }}</span>
                  <t-button size="small" variant="text" theme="primary" @click="handleBatchPaste">
                    <template #icon><paste-icon /></template>
                    {{ t('pages.numberConverter.paste') }}
                  </t-button>
                </div>
                <t-textarea
                  v-model="batchInput"
                  :placeholder="batchInputPlaceholder"
                  :autosize="{ minRows: 8, maxRows: 15 }"
                />
              </div>

              <div class="number-converter__batch-panel">
                <div class="number-converter__batch-panel-header">
                  <span>{{ t('pages.numberConverter.output') }}</span>
                  <t-button
                    size="small"
                    variant="text"
                    theme="primary"
                    :disabled="!batchOutput"
                    @click="handleBatchCopyResult"
                  >
                    <template #icon><file-copy-icon /></template>
                    {{ t('pages.numberConverter.copy') }}
                  </t-button>
                </div>
                <t-textarea
                  v-model="batchOutput"
                  :placeholder="t('pages.numberConverter.outputPlaceholder')"
                  :autosize="{ minRows: 8, maxRows: 15 }"
                  readonly
                />
              </div>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>

    <!-- 使用说明 -->
    <div class="number-converter__tips">
      <t-collapse>
        <t-collapse-panel :header="t('pages.numberConverter.usageTitle')" value="tips">
          <div class="number-converter__tips-content">
            <h4>{{ t('pages.numberConverter.basicConvert') }}</h4>
            <ul>
              <li>{{ t('pages.numberConverter.basicTip1') }}</li>
              <li>{{ t('pages.numberConverter.basicTip2') }}</li>
              <li>{{ t('pages.numberConverter.basicTip3') }}</li>
            </ul>
            <h4>{{ t('pages.numberConverter.byteReverse') }}</h4>
            <ul>
              <li>{{ t('pages.numberConverter.reverseTip1') }}</li>
              <li>{{ t('pages.numberConverter.reverseTip2') }}</li>
              <li>{{ t('pages.numberConverter.reverseTip3') }}</li>
            </ul>
            <h4>{{ t('pages.numberConverter.examples') }}</h4>
            <ul>
              <li>
                <code>FF</code> (Hex) → <code>255</code> (Dec) → <code>377</code> (Oct) → <code>11111111</code> (Bin)
              </li>
              <li><code>12 34 56 78</code> {{ t('pages.numberConverter.reverseTo') }} <code>78 56 34 12</code></li>
              <li><code>12345678</code> (Hex) → <code>305419896</code> (Dec)</li>
            </ul>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ClearIcon, FileCopyIcon, InfoCircleIcon, PasteIcon, SwapIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'NumberConverter',
});

const { t } = useI18n();

// 正序转换的值
const hexValue = ref('');
const decimalValue = ref('');
const octalValue = ref('');
const binaryValue = ref('');
const characterValue = ref('');

// 反序转换的值
const hexReverseValue = ref('');
const decimalReverseValue = ref('');
const octalReverseValue = ref('');
const binaryReverseValue = ref('');
const characterReverseValue = ref('');

// 批量转换
const batchMode = ref<'hexToDec' | 'decToHex' | 'hexReverse'>('hexToDec');
const batchInput = ref('');
const batchOutput = ref('');

// 批量输入占位符
const batchInputPlaceholder = computed(() => {
  switch (batchMode.value) {
    case 'hexToDec':
      return t('pages.numberConverter.hexToDecPlaceholder');
    case 'decToHex':
      return t('pages.numberConverter.decToHexPlaceholder');
    case 'hexReverse':
      return t('pages.numberConverter.batchHexReversePlaceholder');
    default:
      return '';
  }
});

/**
 * 字符串转数字（按字节编码）
 */
function stringToNumber(str: string): number {
  let number = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    number = number * 256 + charCode;
  }
  return number;
}

/**
 * 数字转字符串（按字节编码）
 */
function numberToString(number: number): string {
  let str = '';
  let num = number;
  while (num > 0) {
    const charCode = num & 0xff;
    str = String.fromCharCode(charCode) + str;
    num >>= 8;
  }
  return str;
}

/**
 * 格式化十六进制（补齐偶数位）
 */
function formatHex(hex: string): string {
  let result = hex.toUpperCase();
  while (result.length % 2 !== 0) {
    result = `0${result}`;
  }
  return result;
}

/**
 * 十六进制字节反序
 */
function reverseHexBytes(hex: string): string {
  // 移除空格并确保为偶数位
  const cleanHex = hex.replace(/\s+/g, '');
  const formattedHex = formatHex(cleanHex);
  // 每两个字符一组进行反序
  const bytes = formattedHex.match(/.{1,2}/g) || [];
  return bytes.reverse().join(' ').toUpperCase();
}

/**
 * 更新所有正序值
 */
function updateNormalValues(dec: number) {
  if (Number.isNaN(dec) || !Number.isFinite(dec)) {
    return;
  }

  const hexVal = formatHex(dec.toString(16));
  hexValue.value = hexVal;
  decimalValue.value = dec.toString();
  octalValue.value = dec.toString(8);
  binaryValue.value = dec.toString(2);
  characterValue.value = numberToString(dec);

  // 同步更新反序值
  updateReverseValues(hexVal);
}

/**
 * 更新反序值
 */
function updateReverseValues(hexVal: string) {
  const reversedHex = reverseHexBytes(hexVal);
  hexReverseValue.value = reversedHex;

  const reversedDec = Number.parseInt(reversedHex.replace(/\s+/g, ''), 16);
  if (!Number.isNaN(reversedDec) && Number.isFinite(reversedDec)) {
    decimalReverseValue.value = reversedDec.toString();
    octalReverseValue.value = reversedDec.toString(8);
    binaryReverseValue.value = reversedDec.toString(2);
    characterReverseValue.value = numberToString(reversedDec);
  }
}

/**
 * 从十六进制转换
 */
function convertFromHex() {
  const hex = hexValue.value.replace(/\s+/g, '');
  if (!hex) {
    clearNormalValues();
    return;
  }
  const dec = Number.parseInt(hex, 16);
  if (!Number.isNaN(dec)) {
    updateNormalValues(dec);
  }
}

/**
 * 从十进制转换
 */
function convertFromDecimal() {
  const decimal = decimalValue.value.trim();
  if (!decimal) {
    clearNormalValues();
    return;
  }
  const dec = Number.parseInt(decimal, 10);
  if (!Number.isNaN(dec)) {
    updateNormalValues(dec);
  }
}

/**
 * 从八进制转换
 */
function convertFromOctal() {
  const octal = octalValue.value.trim();
  if (!octal) {
    clearNormalValues();
    return;
  }
  const dec = Number.parseInt(octal, 8);
  if (!Number.isNaN(dec)) {
    updateNormalValues(dec);
  }
}

/**
 * 从二进制转换
 */
function convertFromBinary() {
  const binary = binaryValue.value.trim();
  if (!binary) {
    clearNormalValues();
    return;
  }
  const dec = Number.parseInt(binary, 2);
  if (!Number.isNaN(dec)) {
    updateNormalValues(dec);
  }
}

/**
 * 从字符转换
 */
function convertFromCharacter() {
  const char = characterValue.value;
  if (!char) {
    clearNormalValues();
    return;
  }
  const dec = stringToNumber(char);
  updateNormalValues(dec);
}

/**
 * 从反序十六进制转换
 */
function convertFromHexReverse() {
  const hex = hexReverseValue.value.replace(/\s+/g, '');
  if (!hex) {
    clearReverseValues();
    return;
  }
  const dec = Number.parseInt(hex, 16);
  if (!Number.isNaN(dec)) {
    decimalReverseValue.value = dec.toString();
    octalReverseValue.value = dec.toString(8);
    binaryReverseValue.value = dec.toString(2);
    characterReverseValue.value = numberToString(dec);

    // 反向更新正序值
    const normalHex = reverseHexBytes(hexReverseValue.value);
    hexValue.value = normalHex.replace(/\s+/g, '');
    const normalDec = Number.parseInt(hexValue.value, 16);
    if (!Number.isNaN(normalDec)) {
      decimalValue.value = normalDec.toString();
      octalValue.value = normalDec.toString(8);
      binaryValue.value = normalDec.toString(2);
      characterValue.value = numberToString(normalDec);
    }
  }
}

/**
 * 清空正序值
 */
function clearNormalValues() {
  hexValue.value = '';
  decimalValue.value = '';
  octalValue.value = '';
  binaryValue.value = '';
  characterValue.value = '';
  clearReverseValues();
}

/**
 * 清空反序值
 */
function clearReverseValues() {
  hexReverseValue.value = '';
  decimalReverseValue.value = '';
  octalReverseValue.value = '';
  binaryReverseValue.value = '';
  characterReverseValue.value = '';
}

/**
 * 清空正序面板
 */
function handleClearNormal() {
  clearNormalValues();
  MessagePlugin.success(t('pages.numberConverter.clearSuccess'));
}

/**
 * 处理获取焦点
 */
function handleFocus(field: string) {
  // 可以在这里添加获取焦点时的逻辑，比如自动选择文本
  console.log('Focus on:', field);
}

/**
 * 复制文本
 */
async function handleCopy(text: string) {
  if (!text) {
    MessagePlugin.warning(t('pages.numberConverter.nothingToCopy'));
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    MessagePlugin.success(t('pages.numberConverter.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.numberConverter.copyFailed'));
  }
}

/**
 * 批量转换
 */
function handleBatchConvert() {
  const lines = batchInput.value
    .trim()
    .split('\n')
    .filter((line) => line.trim());

  if (lines.length === 0) {
    MessagePlugin.warning(t('pages.numberConverter.pleaseInput'));
    return;
  }

  const results: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    try {
      switch (batchMode.value) {
        case 'hexToDec': {
          const hex = trimmed.replace(/\s+/g, '');
          const dec = Number.parseInt(hex, 16);
          results.push(`${trimmed} → ${dec}`);
          break;
        }
        case 'decToHex': {
          const dec = Number.parseInt(trimmed, 10);
          const hex = formatHex(dec.toString(16));
          results.push(`${trimmed} → ${hex}`);
          break;
        }
        case 'hexReverse': {
          const reversed = reverseHexBytes(trimmed);
          const dec = Number.parseInt(reversed.replace(/\s+/g, ''), 16);
          results.push(`${trimmed} → ${reversed} → ${dec}`);
          break;
        }
      }
    } catch {
      results.push(`${trimmed} → Error`);
    }
  }

  batchOutput.value = results.join('\n');
  MessagePlugin.success(t('pages.numberConverter.convertSuccess', { count: lines.length }));
}

/**
 * 清空批量转换
 */
function handleBatchClear() {
  batchInput.value = '';
  batchOutput.value = '';
  MessagePlugin.success(t('pages.numberConverter.clearSuccess'));
}

/**
 * 粘贴到批量输入
 */
async function handleBatchPaste() {
  try {
    const text = await navigator.clipboard.readText();
    batchInput.value = text;
    MessagePlugin.success(t('pages.numberConverter.pasteSuccess'));
  } catch {
    MessagePlugin.error(t('pages.numberConverter.pasteFailed'));
  }
}

/**
 * 复制批量结果
 */
async function handleBatchCopyResult() {
  try {
    await navigator.clipboard.writeText(batchOutput.value);
    MessagePlugin.success(t('pages.numberConverter.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.numberConverter.copyFailed'));
  }
}
</script>
<style lang="less" scoped>
.number-converter {
  &__header {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px;
  }

  &__description {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin: 0;
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
    border-radius: 10px;
    border: 1px solid var(--td-component-stroke);
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
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  &__panel-icon {
    color: var(--td-brand-color);
    font-size: 16px;
  }

  &__info-icon {
    color: var(--td-text-color-placeholder);
    font-size: 16px;
    cursor: help;
  }

  &__form {
    padding: 16px;
  }

  &__form-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .t-input {
      flex: 1;
    }
  }

  &__batch {
    margin-bottom: 20px;

    :deep(.t-collapse) {
      background: var(--td-bg-color-container);
      border-radius: 10px;
      border: 1px solid var(--td-component-stroke);
    }
  }

  &__batch-content {
    padding: 0;
  }

  &__batch-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__batch-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (width <= 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__batch-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__batch-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 500;
    color: var(--td-text-color-secondary);
  }

  &__tips {
    :deep(.t-collapse) {
      background: var(--td-bg-color-container);
      border-radius: 10px;
      border: 1px solid var(--td-component-stroke);
    }
  }

  &__tips-content {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    line-height: 1.8;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 16px 0 8px;

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

    code {
      background: var(--td-bg-color-secondarycontainer);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
      font-size: 12px;
      color: var(--td-brand-color);
    }
  }
}
</style>
