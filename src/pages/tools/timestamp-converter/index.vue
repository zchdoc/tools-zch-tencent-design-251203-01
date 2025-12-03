<template>
  <div class="timestamp-converter">
    <!-- 标题区域 -->
    <div class="timestamp-converter__header">
      <h1 class="timestamp-converter__title">时间戳转换工具</h1>
      <p class="timestamp-converter__description">
        批量将时间戳转换为人类可读的时间格式，支持秒级与毫秒级自动识别与相互转换
      </p>
    </div>

    <t-divider />

    <!-- 操作按钮区域 -->
    <div class="timestamp-converter__actions">
      <t-space>
        <t-button theme="primary" @click="handleConvert">
          <template #icon><swap-icon /></template>
          转换
        </t-button>
        <t-button theme="default" variant="outline" @click="handleClear">
          <template #icon><clear-icon /></template>
          清空
        </t-button>
      </t-space>

      <!-- 转换模式选择 -->
      <div class="timestamp-converter__mode">
        <span class="timestamp-converter__mode-label">转换模式：</span>
        <t-radio-group v-model="convertMode" variant="default-filled" size="small">
          <t-radio-button value="toDate">时间戳 → 日期</t-radio-button>
          <t-radio-button value="toTimestamp">日期 → 时间戳</t-radio-button>
        </t-radio-group>
      </div>
    </div>

    <!-- 转换选项 -->
    <div v-if="convertMode === 'toTimestamp'" class="timestamp-converter__options">
      <span class="timestamp-converter__option-label">输出格式：</span>
      <t-radio-group v-model="timestampUnit" variant="default-filled" size="small">
        <t-radio-button value="auto">自动</t-radio-button>
        <t-radio-button value="seconds">秒级</t-radio-button>
        <t-radio-button value="milliseconds">毫秒级</t-radio-button>
      </t-radio-group>
    </div>

    <div v-if="convertMode === 'toDate'" class="timestamp-converter__options">
      <span class="timestamp-converter__option-label">日期格式：</span>
      <t-select v-model="dateFormat" size="small" style="width: 260px">
        <t-option value="YYYY-MM-DD HH:mm:ss" label="YYYY-MM-DD HH:mm:ss" />
        <t-option value="YYYY-MM-DD HH:mm:ss.SSS" label="YYYY-MM-DD HH:mm:ss.SSS (毫秒)" />
        <t-option value="YYYY/MM/DD HH:mm:ss" label="YYYY/MM/DD HH:mm:ss" />
        <t-option value="DD/MM/YYYY HH:mm:ss" label="DD/MM/YYYY HH:mm:ss" />
        <t-option value="MM/DD/YYYY HH:mm:ss" label="MM/DD/YYYY HH:mm:ss" />
        <t-option value="YYYY年MM月DD日 HH:mm:ss" label="YYYY年MM月DD日 HH:mm:ss" />
        <t-option value="YYYY-MM-DD" label="YYYY-MM-DD (仅日期)" />
        <t-option value="HH:mm:ss" label="HH:mm:ss (仅时间)" />
      </t-select>
    </div>

    <!-- 内容区域 -->
    <div class="timestamp-converter__content">
      <!-- 输入区域 -->
      <div class="timestamp-converter__panel">
        <div class="timestamp-converter__panel-header">
          <h3 class="timestamp-converter__panel-title">
            <edit-icon class="timestamp-converter__panel-icon" />
            {{ convertMode === 'toDate' ? '输入时间戳' : '输入日期时间' }}
          </h3>
          <t-button size="small" variant="text" theme="primary" @click="handlePaste">
            <template #icon><paste-icon /></template>
            粘贴
          </t-button>
        </div>
        <t-textarea
          v-model="inputValue"
          :placeholder="inputPlaceholder"
          :autosize="{ minRows: 15, maxRows: 25 }"
          class="timestamp-converter__textarea"
        />
        <div class="timestamp-converter__panel-footer">
          <span class="timestamp-converter__count">共 {{ inputLines }} 行</span>
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="timestamp-converter__panel">
        <div class="timestamp-converter__panel-header">
          <h3 class="timestamp-converter__panel-title">
            <file-icon class="timestamp-converter__panel-icon" />
            转换结果
          </h3>
          <t-space size="small">
            <t-button size="small" variant="text" theme="primary" :disabled="!outputValue" @click="handleCopyResult">
              <template #icon><file-copy-icon /></template>
              复制
            </t-button>
            <t-button size="small" variant="text" theme="primary" :disabled="!outputValue" @click="handleDownload">
              <template #icon><download-icon /></template>
              下载
            </t-button>
          </t-space>
        </div>
        <div class="timestamp-converter__result">
          <div v-if="outputValue" class="timestamp-converter__result-content">
            <div v-for="(item, index) in outputList" :key="index" class="timestamp-converter__result-item">
              <div class="timestamp-converter__result-row">
                <span class="timestamp-converter__result-index">{{ index + 1 }}</span>
                <span class="timestamp-converter__result-original">{{ item.original }}</span>
                <span class="timestamp-converter__result-arrow">→</span>
                <span
                  class="timestamp-converter__result-converted"
                  :class="{ 'timestamp-converter__result-converted--error': item.error }"
                >
                  {{ item.converted }}
                </span>
                <t-tag
                  v-if="item.type"
                  size="small"
                  :theme="item.type === 'ms' ? 'primary' : 'success'"
                  variant="light"
                >
                  {{ item.type === 'ms' ? '毫秒' : '秒' }}
                </t-tag>
                <t-button size="small" variant="text" shape="square" @click="handleCopySingle(item.converted)">
                  <file-copy-icon />
                </t-button>
              </div>
            </div>
          </div>
          <div v-else class="timestamp-converter__result-empty">
            <info-circle-icon class="timestamp-converter__result-empty-icon" />
            <span>转换结果将显示在这里</span>
          </div>
        </div>
        <div class="timestamp-converter__panel-footer">
          <span v-if="outputValue" class="timestamp-converter__count">
            成功 {{ successCount }} 条，失败 {{ errorCount }} 条
          </span>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="timestamp-converter__tips">
      <t-collapse>
        <t-collapse-panel header="使用说明" value="tips">
          <div class="timestamp-converter__tips-content">
            <h4>时间戳 → 日期</h4>
            <ul>
              <li>每行输入一个时间戳，支持秒级（10位）和毫秒级（13位）</li>
              <li>自动识别时间戳精度，无需手动指定</li>
              <li>支持多种日期输出格式</li>
            </ul>
            <h4>日期 → 时间戳</h4>
            <ul>
              <li>每行输入一个日期时间，支持多种格式</li>
              <li>
                支持的格式：<code>YYYY-MM-DD HH:mm:ss</code>, <code>YYYY/MM/DD HH:mm:ss</code>,
                <code>YYYY年MM月DD日 HH:mm:ss</code> 等
              </li>
              <li>可以选择输出秒级或毫秒级时间戳</li>
            </ul>
            <h4>示例</h4>
            <ul>
              <li>秒级时间戳：<code>1701676800</code> → <code>2023-12-04 16:00:00</code></li>
              <li>毫秒级时间戳：<code>1701676800000</code> → <code>2023-12-04 16:00:00</code></li>
              <li>
                日期时间：<code>2023-12-04 16:00:00</code> → <code>1701676800</code> (秒) /
                <code>1701676800000</code> (毫秒)
              </li>
            </ul>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import {
  ClearIcon,
  DownloadIcon,
  EditIcon,
  FileCopyIcon,
  FileIcon,
  InfoCircleIcon,
  PasteIcon,
  SwapIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

defineOptions({
  name: 'TimestampConverter',
});

// 转换模式：toDate - 时间戳转日期，toTimestamp - 日期转时间戳
const convertMode = ref<'toDate' | 'toTimestamp'>('toDate');

// 时间戳输出单位（日期转时间戳时使用）
const timestampUnit = ref<'auto' | 'seconds' | 'milliseconds'>('auto');

// 日期输出格式（时间戳转日期时使用）
const dateFormat = ref('YYYY-MM-DD HH:mm:ss');

// 输入值
const inputValue = ref('');

// 输出值
const outputValue = ref('');

// 输出列表
interface OutputItem {
  original: string;
  converted: string;
  error: boolean;
  type?: 'ms' | 's';
}
const outputList = ref<OutputItem[]>([]);

// 输入占位符
const inputPlaceholder = computed(() => {
  if (convertMode.value === 'toDate') {
    return '每行输入一个时间戳，支持秒级和毫秒级时间戳\n例如：\n1701676800\n1701676800000';
  }
  return '每行输入一个日期时间\n例如：\n2023-12-04 16:00:00\n2023/12/04 16:00:00';
});

// 计算输入行数
const inputLines = computed(() => {
  if (!inputValue.value.trim()) return 0;
  const lines = inputValue.value.trim().split('\n');
  return lines.filter((line) => line.trim()).length;
});

// 成功数量
const successCount = computed(() => {
  return outputList.value.filter((item) => !item.error).length;
});

// 失败数量
const errorCount = computed(() => {
  return outputList.value.filter((item) => item.error).length;
});

/**
 * 判断是否为毫秒级时间戳
 * 13位数字认为是毫秒级，10位数字认为是秒级
 */
function isMilliseconds(timestamp: number): boolean {
  // 13位时间戳的范围大约是 2001年 ~ 2286年
  return timestamp > 9999999999;
}

/**
 * 时间戳转日期
 */
function timestampToDate(input: string): OutputItem {
  const trimmed = input.trim();
  const num = Number(trimmed);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { original: trimmed, converted: '无效的时间戳', error: true };
  }

  try {
    const isMs = isMilliseconds(num);
    const timestamp = isMs ? num : num * 1000;
    const date = dayjs(timestamp);

    if (!date.isValid()) {
      return { original: trimmed, converted: '无效的时间戳', error: true };
    }

    return {
      original: trimmed,
      converted: date.format(dateFormat.value),
      error: false,
      type: isMs ? 'ms' : 's',
    };
  } catch {
    return { original: trimmed, converted: '转换失败', error: true };
  }
}

/**
 * 日期转时间戳
 */
function dateToTimestamp(input: string): OutputItem {
  const trimmed = input.trim();

  try {
    // 尝试多种日期格式解析
    let date = dayjs(trimmed);

    // 如果默认解析失败，尝试其他格式
    if (!date.isValid()) {
      const formats = [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm:ss.SSS',
        'YYYY/MM/DD HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss',
        'MM/DD/YYYY HH:mm:ss',
        'YYYY年MM月DD日 HH:mm:ss',
        'YYYY年MM月DD日 HH时mm分ss秒',
        'YYYY-MM-DD',
        'YYYY/MM/DD',
        'YYYY年MM月DD日',
      ];

      for (const format of formats) {
        date = dayjs(trimmed, format);
        if (date.isValid()) break;
      }
    }

    if (!date.isValid()) {
      return { original: trimmed, converted: '无效的日期格式', error: true };
    }

    let result: string;
    let type: 'ms' | 's';

    if (timestampUnit.value === 'milliseconds') {
      result = String(date.valueOf());
      type = 'ms';
    } else if (timestampUnit.value === 'seconds') {
      result = String(Math.floor(date.valueOf() / 1000));
      type = 's';
    } else {
      // auto: 默认输出秒级
      result = String(Math.floor(date.valueOf() / 1000));
      type = 's';
    }

    return {
      original: trimmed,
      converted: result,
      error: false,
      type,
    };
  } catch {
    return { original: trimmed, converted: '转换失败', error: true };
  }
}

/**
 * 执行转换
 */
function handleConvert() {
  const lines = inputValue.value
    .trim()
    .split('\n')
    .filter((line) => line.trim());

  if (lines.length === 0) {
    MessagePlugin.warning('请输入要转换的内容');
    return;
  }

  const results: OutputItem[] = [];

  for (const line of lines) {
    if (convertMode.value === 'toDate') {
      results.push(timestampToDate(line));
    } else {
      results.push(dateToTimestamp(line));
    }
  }

  outputList.value = results;
  outputValue.value = results.map((item) => item.converted).join('\n');

  const successNum = results.filter((item) => !item.error).length;
  const errorNum = results.filter((item) => item.error).length;

  if (errorNum === 0) {
    MessagePlugin.success(`转换成功，共 ${successNum} 条`);
  } else if (successNum === 0) {
    MessagePlugin.error(`转换失败，共 ${errorNum} 条`);
  } else {
    MessagePlugin.warning(`转换完成，成功 ${successNum} 条，失败 ${errorNum} 条`);
  }
}

/**
 * 清空
 */
function handleClear() {
  inputValue.value = '';
  outputValue.value = '';
  outputList.value = [];
  MessagePlugin.success('已清空');
}

/**
 * 粘贴
 */
async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    inputValue.value = text;
    MessagePlugin.success('已粘贴');
  } catch {
    MessagePlugin.error('粘贴失败，请检查剪贴板权限');
  }
}

/**
 * 复制结果
 */
async function handleCopyResult() {
  try {
    await navigator.clipboard.writeText(outputValue.value);
    MessagePlugin.success('已复制到剪贴板');
  } catch {
    MessagePlugin.error('复制失败');
  }
}

/**
 * 复制单条结果
 */
async function handleCopySingle(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    MessagePlugin.success('已复制');
  } catch {
    MessagePlugin.error('复制失败');
  }
}

/**
 * 下载结果
 */
function handleDownload() {
  const content = outputList.value.map((item) => `${item.original} → ${item.converted}`).join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `timestamp-convert-${dayjs().format('YYYYMMDD-HHmmss')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  MessagePlugin.success('下载成功');
}
</script>
<style lang="less" scoped>
.timestamp-converter {
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

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__mode {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__mode-label {
    font-size: 13px;
    color: var(--td-text-color-secondary);
  }

  &__options {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 8px;
  }

  &__option-label {
    font-size: 13px;
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
    border-radius: 10px;
    border: 1px solid var(--td-component-stroke);
    display: flex;
    flex-direction: column;
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
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  &__panel-icon {
    color: var(--td-brand-color);
    font-size: 16px;
  }

  &__panel-footer {
    padding: 8px 16px;
    border-top: 1px solid var(--td-component-stroke);
  }

  &__count {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }

  &__textarea {
    flex: 1;
    border: none;
    border-radius: 0;

    :deep(.t-textarea__inner) {
      border: none;
      border-radius: 0;
      resize: none;
      font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  &__result {
    flex: 1;
    min-height: 350px;
    overflow-y: auto;
  }

  &__result-content {
    padding: 12px 16px;
  }

  &__result-item {
    padding: 8px 0;
    border-bottom: 1px dashed var(--td-component-stroke);

    &:last-child {
      border-bottom: none;
    }
  }

  &__result-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__result-index {
    min-width: 24px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: var(--td-text-color-placeholder);
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 4px;
  }

  &__result-original {
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
    font-size: 13px;
    color: var(--td-text-color-secondary);
    word-break: break-all;
  }

  &__result-arrow {
    color: var(--td-text-color-placeholder);
    font-size: 12px;
  }

  &__result-converted {
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
    font-size: 13px;
    color: var(--td-text-color-primary);
    font-weight: 500;
    word-break: break-all;

    &--error {
      color: var(--td-error-color);
    }
  }

  &__result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 350px;
    color: var(--td-text-color-placeholder);
    gap: 12px;
  }

  &__result-empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  &__tips {
    margin-top: 20px;

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
