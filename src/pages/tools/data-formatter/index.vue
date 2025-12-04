<template>
  <div class="data-formatter">
    <!-- 标题区域 -->
    <div class="data-formatter__header">
      <h1 class="data-formatter__title">数据格式转换工具</h1>
      <p class="data-formatter__description">将竖列数据转换为横列，支持多种输出格式，批量处理数据清洗、替换和格式化</p>
    </div>

    <t-divider />

    <!-- 操作按钮区域 -->
    <div class="data-formatter__actions">
      <t-space>
        <t-button theme="primary" @click="handleConvert">
          <template #icon><swap-icon /></template>
          开始转换
        </t-button>
        <t-button theme="default" variant="outline" @click="handleClear">
          <template #icon><clear-icon /></template>
          清空
        </t-button>
        <t-button theme="default" variant="outline" @click="handleLoadExample">
          <template #icon><file-add-icon /></template>
          加载示例
        </t-button>
      </t-space>

      <t-space>
        <t-dropdown :options="presetOptions" @click="handlePresetClick">
          <t-button theme="default" variant="outline">
            <template #icon><setting-icon /></template>
            快捷预设
            <template #suffix><chevron-down-icon /></template>
          </t-button>
        </t-dropdown>
      </t-space>
    </div>

    <!-- 内容区域 -->
    <div class="data-formatter__content">
      <!-- 输入区域 -->
      <div class="data-formatter__panel">
        <div class="data-formatter__panel-header">
          <h3 class="data-formatter__panel-title">
            <edit-icon class="data-formatter__panel-icon" />
            输入数据
          </h3>
          <t-button size="small" variant="text" theme="primary" @click="handlePaste">
            <template #icon><paste-icon /></template>
            粘贴
          </t-button>
        </div>
        <t-textarea
          v-model="inputValue"
          placeholder="请输入要转换的数据，每行一个项目...

支持多种输入格式：
- 每行一个数据项
- 逗号/分号/空格分隔的数据
- 带前缀后缀的数据（如 tradeNo-xxx,）"
          :autosize="{ minRows: 18, maxRows: 30 }"
          class="data-formatter__textarea"
        />
        <div class="data-formatter__panel-footer">
          <span class="data-formatter__count">共 {{ inputCount }} 项</span>
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="data-formatter__panel">
        <div class="data-formatter__panel-header">
          <h3 class="data-formatter__panel-title">
            <file-icon class="data-formatter__panel-icon" />
            格式化结果
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
        <div class="data-formatter__result">
          <div v-if="outputValue" class="data-formatter__result-content">
            <pre class="data-formatter__result-text">{{ outputValue }}</pre>
          </div>
          <div v-else class="data-formatter__result-empty">
            <info-circle-icon class="data-formatter__result-empty-icon" />
            <span>输入数据后将显示格式化结果</span>
          </div>
        </div>
        <div class="data-formatter__panel-footer">
          <span v-if="outputValue" class="data-formatter__count">输出 {{ outputCount }} 项</span>
        </div>
      </div>
    </div>

    <!-- 格式化选项区域 -->
    <div class="data-formatter__options-section">
      <!-- 输出格式选择 -->
      <t-card title="输出格式" class="data-formatter__options-card" :bordered="true" header-bordered>
        <div class="data-formatter__format-grid">
          <div
            v-for="format in formatOptions"
            :key="format.value"
            class="data-formatter__format-item"
            :class="{ 'data-formatter__format-item--active': selectedFormat === format.value }"
            @click="selectedFormat = format.value"
          >
            <div class="data-formatter__format-name">{{ format.label }}</div>
            <div class="data-formatter__format-example">{{ format.example }}</div>
          </div>
        </div>

        <!-- 自定义格式配置 -->
        <div v-if="selectedFormat === 'custom'" class="data-formatter__custom-format">
          <t-divider>自定义格式配置</t-divider>
          <t-form layout="inline">
            <t-form-item label="前缀">
              <t-input v-model="customPrefix" placeholder="如：'" style="width: 120px" />
            </t-form-item>
            <t-form-item label="后缀">
              <t-input v-model="customSuffix" placeholder="如：'" style="width: 120px" />
            </t-form-item>
            <t-form-item label="分隔符">
              <t-input v-model="customSeparator" placeholder="如：," style="width: 120px" />
            </t-form-item>
            <t-form-item label="包裹符">
              <t-input v-model="customWrapper" placeholder="如：()" style="width: 120px" />
            </t-form-item>
          </t-form>
        </div>

        <!-- 竖列转横向时的输入分隔符选择 -->
        <div v-if="selectedFormat === 'vertical'" class="data-formatter__custom-format">
          <t-divider>横向转竖列配置</t-divider>
          <t-form layout="inline">
            <t-form-item label="分隔符">
              <t-select v-model="verticalSeparator" style="width: 200px">
                <t-option value="," label="逗号 (,)" />
                <t-option value="，" label="中文逗号 (，)" />
                <t-option value=";" label="分号 (;)" />
                <t-option value="；" label="中文分号 (；)" />
                <t-option value=" " label="空格" />
                <t-option value="|" label="管道符 (|)" />
                <t-option value="." label="英文句号 (.)" />
                <t-option value="。" label="中文句号 (。)" />
                <t-option value="\t" label="制表符 (Tab)" />
                <t-option value="custom" label="自定义" />
              </t-select>
            </t-form-item>
            <t-form-item v-if="verticalSeparator === 'custom'" label="自定义分隔符">
              <t-input v-model="customVerticalSeparator" placeholder="输入分隔符" style="width: 120px" />
            </t-form-item>
          </t-form>
        </div>
      </t-card>

      <!-- 高级选项 -->
      <t-card title="高级选项" class="data-formatter__options-card" :bordered="true" header-bordered>
        <div class="data-formatter__advanced-options">
          <div class="data-formatter__option-row">
            <div class="data-formatter__option-item">
              <span>去除空行</span>
              <t-switch v-model="options.removeEmpty" />
            </div>
            <div class="data-formatter__option-item">
              <span>去除首尾空格</span>
              <t-switch v-model="options.trim" />
            </div>
            <div class="data-formatter__option-item">
              <span>去除重复项</span>
              <t-switch v-model="options.unique" />
            </div>
            <div class="data-formatter__option-item">
              <span>排序</span>
              <t-switch v-model="options.sort" />
            </div>
          </div>

          <t-divider />

          <div class="data-formatter__option-row">
            <div class="data-formatter__option-item">
              <span>转换为大写</span>
              <t-switch
                v-model="options.toUpperCase"
                @change="() => options.toUpperCase && (options.toLowerCase = false)"
              />
            </div>
            <div class="data-formatter__option-item">
              <span>转换为小写</span>
              <t-switch
                v-model="options.toLowerCase"
                @change="() => options.toLowerCase && (options.toUpperCase = false)"
              />
            </div>
          </div>

          <t-divider />

          <!-- 字符替换 -->
          <div class="data-formatter__replace-section">
            <div class="data-formatter__replace-header">
              <span class="data-formatter__replace-title">字符替换</span>
              <t-button size="small" variant="text" theme="primary" @click="addReplaceRule">
                <template #icon><add-icon /></template>
                添加规则
              </t-button>
            </div>
            <div v-if="replaceRules.length > 0" class="data-formatter__replace-rules">
              <div v-for="(rule, index) in replaceRules" :key="index" class="data-formatter__replace-rule">
                <t-input v-model="rule.from" placeholder="查找内容" style="width: 150px" />
                <span class="data-formatter__replace-arrow">→</span>
                <t-input v-model="rule.to" placeholder="替换为" style="width: 150px" />
                <t-checkbox v-model="rule.regex" size="small">正则</t-checkbox>
                <t-button size="small" variant="text" theme="danger" shape="square" @click="removeReplaceRule(index)">
                  <delete-icon />
                </t-button>
              </div>
            </div>
            <div v-else class="data-formatter__replace-empty">
              <span>暂无替换规则，点击"添加规则"按钮添加</span>
            </div>
          </div>

          <t-divider />

          <!-- 前缀后缀处理 -->
          <div class="data-formatter__prefix-section">
            <t-form layout="inline">
              <t-form-item label="移除前缀">
                <t-input v-model="options.removePrefix" placeholder="如：tradeNo-" style="width: 150px" />
              </t-form-item>
              <t-form-item label="移除后缀">
                <t-input v-model="options.removeSuffix" placeholder="如：," style="width: 150px" />
              </t-form-item>
              <t-form-item label="添加前缀">
                <t-input v-model="options.addPrefix" placeholder="添加的前缀" style="width: 150px" />
              </t-form-item>
              <t-form-item label="添加后缀">
                <t-input v-model="options.addSuffix" placeholder="添加的后缀" style="width: 150px" />
              </t-form-item>
            </t-form>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 使用说明 -->
    <div class="data-formatter__tips">
      <t-collapse>
        <t-collapse-panel header="使用说明" value="tips">
          <div class="data-formatter__tips-content">
            <h4>基本使用</h4>
            <ul>
              <li>在左侧输入框中输入要转换的数据，每行一个项目</li>
              <li>选择所需的输出格式，点击"开始转换"按钮</li>
              <li>转换结果将显示在右侧，可以直接复制或下载</li>
            </ul>

            <h4>输出格式说明</h4>
            <ul>
              <li><code>逗号分隔</code>：item1,item2,item3</li>
              <li><code>双引号+逗号</code>："item1","item2","item3"</li>
              <li><code>单引号+逗号</code>：'item1','item2','item3'</li>
              <li><code>SQL IN (字符串)</code>：('item1','item2','item3')</li>
              <li><code>SQL IN (数字)</code>：(1,2,3)</li>
              <li><code>数组格式</code>：["item1","item2","item3"]</li>
              <li><code>空格分隔</code>：item1 item2 item3</li>
              <li><code>横向转竖列</code>：将一行数据按分隔符拆分为多行</li>
              <li><code>自定义格式</code>：自由定义前缀、后缀、分隔符和包裹符</li>
            </ul>

            <h4>常用场景示例</h4>
            <ul>
              <li>
                <strong>处理交易号：</strong>
                设置移除前缀为 <code>tradeNo-</code>，移除后缀为 <code>,</code>
              </li>
              <li>
                <strong>中文标点转换：</strong>
                使用"横向转竖列"功能，分隔符选择中文句号 <code>。</code>
              </li>
              <li>
                <strong>生成SQL查询条件：</strong>
                选择"SQL IN (字符串)"格式，可直接用于数据库查询
              </li>
            </ul>

            <h4>快捷预设</h4>
            <ul>
              <li><strong>清理交易号</strong>：自动移除 tradeNo- 前缀和逗号后缀</li>
              <li><strong>中文句号换行</strong>：将中文句号转为换行符</li>
              <li><strong>去重并排序</strong>：去除重复项并按字母排序</li>
              <li><strong>转SQL IN</strong>：直接转换为SQL IN语句格式</li>
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
  AddIcon,
  ChevronDownIcon,
  ClearIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  FileAddIcon,
  FileCopyIcon,
  FileIcon,
  InfoCircleIcon,
  PasteIcon,
  SettingIcon,
  SwapIcon,
} from 'tdesign-icons-vue-next';
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';

defineOptions({
  name: 'DataFormatter',
});

// 输入输出值
const inputValue = ref('');
const outputValue = ref('');

// 选中的格式
const selectedFormat = ref('comma');

// 自定义格式配置
const customPrefix = ref('');
const customSuffix = ref('');
const customSeparator = ref(',');
const customWrapper = ref('');

// 竖列转横向配置
const verticalSeparator = ref(',');
const customVerticalSeparator = ref('');

// 高级选项
const options = reactive({
  removeEmpty: true,
  trim: true,
  unique: false,
  sort: false,
  toUpperCase: false,
  toLowerCase: false,
  removePrefix: '',
  removeSuffix: '',
  addPrefix: '',
  addSuffix: '',
});

// 字符替换规则
interface ReplaceRule {
  from: string;
  to: string;
  regex: boolean;
}
const replaceRules = ref<ReplaceRule[]>([]);

// 格式选项
const formatOptions = [
  { value: 'comma', label: '逗号分隔', example: 'item1,item2,item3' },
  { value: 'doubleQuote', label: '双引号+逗号', example: '"item1","item2","item3"' },
  { value: 'singleQuote', label: '单引号+逗号', example: "'item1','item2','item3'" },
  { value: 'sqlInStr', label: 'SQL IN (字符串)', example: "('item1','item2','item3')" },
  { value: 'sqlInNum', label: 'SQL IN (数字)', example: '(1,2,3)' },
  { value: 'array', label: '数组格式', example: '["item1","item2","item3"]' },
  { value: 'space', label: '空格分隔', example: 'item1 item2 item3' },
  { value: 'semicolon', label: '分号分隔', example: 'item1;item2;item3' },
  { value: 'pipe', label: '管道分隔', example: 'item1|item2|item3' },
  { value: 'newline', label: '换行分隔', example: 'item1↵item2↵item3' },
  { value: 'vertical', label: '横向转竖列', example: '按分隔符拆分为多行' },
  { value: 'custom', label: '自定义格式', example: '自定义前缀/后缀/分隔符' },
];

// 预设选项
const presetOptions: DropdownOption[] = [
  { content: '清理交易号 (移除 tradeNo- 和逗号)', value: 'cleanTradeNo' },
  { content: '中文句号换行', value: 'chinesePeriod' },
  { content: '去重并排序', value: 'uniqueSort' },
  { content: '转SQL IN (字符串)', value: 'toSqlInStr' },
  { content: '转SQL IN (数字)', value: 'toSqlInNum' },
  { content: '逗号转换行', value: 'commaToNewline' },
  { content: '重置所有选项', value: 'reset' },
];

// 计算输入项数量
const inputCount = computed(() => {
  if (!inputValue.value.trim()) return 0;
  return parseInput().length;
});

// 计算输出项数量
const outputCount = computed(() => {
  if (!outputValue.value.trim()) return 0;
  if (selectedFormat.value === 'newline' || selectedFormat.value === 'vertical') {
    return outputValue.value.split('\n').filter((line) => line.trim()).length;
  }
  // 简单估算
  const result = outputValue.value;
  if (result.startsWith('[') || result.startsWith('(')) {
    return result.split(',').length;
  }
  return result.split(',').length || result.split('\n').length;
});

/**
 * 解析输入数据
 */
function parseInput(): string[] {
  const text = inputValue.value;

  // 判断输入是否为单行（横向数据）
  const lines = text.split('\n').filter((line) => line.trim());

  let items: string[] = [];

  if (lines.length === 1) {
    // 单行数据，尝试按常见分隔符拆分
    const line = lines[0];
    if (line.includes(',') || line.includes('，')) {
      items = line.split(/[,，]/).map((s) => s.trim());
    } else if (line.includes(';') || line.includes('；')) {
      items = line.split(/[;；]/).map((s) => s.trim());
    } else if (line.includes('|')) {
      items = line.split('|').map((s) => s.trim());
    } else if (line.includes('\t')) {
      items = line.split('\t').map((s) => s.trim());
    } else if (line.includes(' ')) {
      items = line.split(/\s+/).map((s) => s.trim());
    } else {
      items = [line.trim()];
    }
  } else {
    // 多行数据
    items = lines.map((line) => line.trim());
  }

  // 应用高级选项处理
  items = processItems(items);

  return items;
}

/**
 * 处理数据项（应用高级选项）
 */
function processItems(items: string[]): string[] {
  let result = [...items];

  // 去除首尾空格
  if (options.trim) {
    result = result.map((item) => item.trim());
  }

  // 去除空行
  if (options.removeEmpty) {
    result = result.filter((item) => item.length > 0);
  }

  // 移除前缀
  if (options.removePrefix) {
    result = result.map((item) =>
      item.startsWith(options.removePrefix) ? item.slice(options.removePrefix.length) : item,
    );
  }

  // 移除后缀
  if (options.removeSuffix) {
    result = result.map((item) =>
      item.endsWith(options.removeSuffix) ? item.slice(0, -options.removeSuffix.length) : item,
    );
  }

  // 应用字符替换规则
  for (const rule of replaceRules.value) {
    if (!rule.from) continue;

    if (rule.regex) {
      try {
        const regex = new RegExp(rule.from, 'g');
        result = result.map((item) => item.replace(regex, rule.to));
      } catch {
        // 正则表达式无效，跳过
      }
    } else {
      result = result.map((item) => item.split(rule.from).join(rule.to));
    }
  }

  // 添加前缀
  if (options.addPrefix) {
    result = result.map((item) => options.addPrefix + item);
  }

  // 添加后缀
  if (options.addSuffix) {
    result = result.map((item) => item + options.addSuffix);
  }

  // 转换大小写
  if (options.toUpperCase) {
    result = result.map((item) => item.toUpperCase());
  } else if (options.toLowerCase) {
    result = result.map((item) => item.toLowerCase());
  }

  // 去除重复项
  if (options.unique) {
    result = [...new Set(result)];
  }

  // 排序
  if (options.sort) {
    result.sort((a, b) => a.localeCompare(b));
  }

  return result;
}

/**
 * 格式化输出
 */
function formatOutput(items: string[]): string {
  if (items.length === 0) return '';

  switch (selectedFormat.value) {
    case 'comma':
      return items.join(',');

    case 'doubleQuote':
      return items.map((item) => `"${item}"`).join(',');

    case 'singleQuote':
      return items.map((item) => `'${item}'`).join(',');

    case 'sqlInStr':
      return `(${items.map((item) => `'${item}'`).join(',')})`;

    case 'sqlInNum':
      return `(${items.join(',')})`;

    case 'array':
      return `[${items.map((item) => `"${item}"`).join(',')}]`;

    case 'space':
      return items.join(' ');

    case 'semicolon':
      return items.join(';');

    case 'pipe':
      return items.join('|');

    case 'newline':
      return items.join('\n');

    case 'vertical': {
      // 横向转竖列：将输入按指定分隔符拆分
      const sep = verticalSeparator.value === 'custom' ? customVerticalSeparator.value : verticalSeparator.value;
      const allItems: string[] = [];
      for (const item of items) {
        const parts = item
          .split(sep)
          .map((s) => s.trim())
          .filter((s) => s);
        allItems.push(...parts);
      }
      return allItems.join('\n');
    }

    case 'custom': {
      const prefix = customPrefix.value;
      const suffix = customSuffix.value;
      const separator = customSeparator.value || ',';
      const wrapper = customWrapper.value;

      const formatted = items.map((item) => prefix + item + suffix).join(separator);

      if (wrapper && wrapper.length >= 2) {
        return wrapper[0] + formatted + wrapper[1];
      } else if (wrapper) {
        return wrapper + formatted + wrapper;
      }
      return formatted;
    }

    default:
      return items.join(',');
  }
}

/**
 * 执行转换
 */
function handleConvert() {
  if (!inputValue.value.trim()) {
    MessagePlugin.warning('请输入要转换的数据');
    return;
  }

  const items = parseInput();
  if (items.length === 0) {
    MessagePlugin.warning('解析后无有效数据');
    return;
  }

  outputValue.value = formatOutput(items);
  MessagePlugin.success(`转换成功，共处理 ${items.length} 项`);
}

/**
 * 清空
 */
function handleClear() {
  inputValue.value = '';
  outputValue.value = '';
  MessagePlugin.success('已清空');
}

/**
 * 加载示例数据
 */
function handleLoadExample() {
  inputValue.value = `tradeNo-2504021201480001ba9a0212254401fe,
tradeNo-2504021301480001ba980213432302e3,
tradeNo-2504102201480001ba9a102213320205,
tradeNo-2507051301480001ba9805134450053d,`;

  options.removePrefix = 'tradeNo-';
  options.removeSuffix = ',';
  selectedFormat.value = 'sqlInStr';

  MessagePlugin.success('已加载示例数据，点击"开始转换"查看效果');
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
 * 下载结果
 */
function handleDownload() {
  const blob = new Blob([outputValue.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `data-format-${dayjs().format('YYYYMMDD-HHmmss')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  MessagePlugin.success('下载成功');
}

/**
 * 添加替换规则
 */
function addReplaceRule() {
  replaceRules.value.push({ from: '', to: '', regex: false });
}

/**
 * 移除替换规则
 */
function removeReplaceRule(index: number) {
  replaceRules.value.splice(index, 1);
}

/**
 * 预设点击处理
 */
function handlePresetClick(data: DropdownOption) {
  switch (data.value) {
    case 'cleanTradeNo':
      options.removePrefix = 'tradeNo-';
      options.removeSuffix = ',';
      selectedFormat.value = 'comma';
      MessagePlugin.success('已应用"清理交易号"预设');
      break;

    case 'chinesePeriod':
      replaceRules.value = [{ from: '。', to: '\n', regex: false }];
      selectedFormat.value = 'newline';
      MessagePlugin.success('已应用"中文句号换行"预设');
      break;

    case 'uniqueSort':
      options.unique = true;
      options.sort = true;
      MessagePlugin.success('已应用"去重并排序"预设');
      break;

    case 'toSqlInStr':
      selectedFormat.value = 'sqlInStr';
      MessagePlugin.success('已应用"转SQL IN (字符串)"预设');
      break;

    case 'toSqlInNum':
      selectedFormat.value = 'sqlInNum';
      MessagePlugin.success('已应用"转SQL IN (数字)"预设');
      break;

    case 'commaToNewline':
      selectedFormat.value = 'vertical';
      verticalSeparator.value = ',';
      MessagePlugin.success('已应用"逗号转换行"预设');
      break;

    case 'reset':
      resetOptions();
      MessagePlugin.success('已重置所有选项');
      break;
  }
}

/**
 * 重置选项
 */
function resetOptions() {
  selectedFormat.value = 'comma';
  customPrefix.value = '';
  customSuffix.value = '';
  customSeparator.value = ',';
  customWrapper.value = '';
  verticalSeparator.value = ',';
  customVerticalSeparator.value = '';

  options.removeEmpty = true;
  options.trim = true;
  options.unique = false;
  options.sort = false;
  options.toUpperCase = false;
  options.toLowerCase = false;
  options.removePrefix = '';
  options.removeSuffix = '';
  options.addPrefix = '';
  options.addSuffix = '';

  replaceRules.value = [];
}
</script>
<style lang="less" scoped>
.data-formatter {
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
    min-height: 400px;
    overflow-y: auto;
  }

  &__result-content {
    padding: 12px 16px;
    height: 100%;
  }

  &__result-text {
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--td-text-color-primary);
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }

  &__result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    color: var(--td-text-color-placeholder);
    gap: 12px;
  }

  &__result-empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  &__options-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  &__options-card {
    :deep(.t-card__header) {
      padding: 12px 16px;
    }

    :deep(.t-card__body) {
      padding: 16px;
    }
  }

  &__format-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  &__format-item {
    padding: 12px;
    border: 1px solid var(--td-component-stroke);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--td-brand-color);
      background: var(--td-bg-color-secondarycontainer);
    }

    &--active {
      border-color: var(--td-brand-color);
      background: var(--td-brand-color-light);
      box-shadow: 0 0 0 1px var(--td-brand-color);
    }
  }

  &__format-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
  }

  &__format-example {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
  }

  &__custom-format {
    margin-top: 16px;
  }

  &__advanced-options {
    // padding: 16px;
  }

  &__option-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  &__option-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 150px;

    span {
      font-size: 14px;
      color: var(--td-text-color-primary);
    }
  }

  &__replace-section {
    margin-top: 8px;
  }

  &__replace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__replace-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__replace-rules {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__replace-rule {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__replace-arrow {
    color: var(--td-text-color-placeholder);
  }

  &__replace-empty {
    padding: 16px;
    text-align: center;
    color: var(--td-text-color-placeholder);
    font-size: 13px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 6px;
  }

  &__prefix-section {
    margin-top: 8px;

    :deep(.t-form) {
      gap: 16px;
    }
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
