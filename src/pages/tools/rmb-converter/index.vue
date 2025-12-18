<template>
  <div class="rmb-converter">
    <!-- 标题区域 -->
    <div class="rmb-converter__header">
      <h1 class="rmb-converter__title">{{ t('pages.rmbConverter.title') }}</h1>
      <p class="rmb-converter__description">
        {{ t('pages.rmbConverter.description') }}
      </p>
    </div>

    <t-divider />

    <!-- 主要转换区域 -->
    <div class="rmb-converter__content">
      <!-- 数字转大写面板 -->
      <div class="rmb-converter__panel">
        <div class="rmb-converter__panel-header">
          <h3 class="rmb-converter__panel-title">
            <money-icon class="rmb-converter__panel-icon" />
            {{ t('pages.rmbConverter.numberToChinese') }}
          </h3>
          <t-space size="small">
            <t-button size="small" variant="text" theme="primary" @click="handleClearNumber">
              <template #icon><clear-icon /></template>
              {{ t('pages.rmbConverter.clear') }}
            </t-button>
          </t-space>
        </div>

        <div class="rmb-converter__form">
          <!-- 数字金额输入 -->
          <div class="rmb-converter__form-item">
            <label class="rmb-converter__label">
              {{ t('pages.rmbConverter.numberAmount') }}
              <t-tag size="small" theme="primary" variant="light">{{ t('pages.rmbConverter.input') }}</t-tag>
            </label>
            <div class="rmb-converter__input-wrapper">
              <t-input
                v-model="numberInput"
                :placeholder="t('pages.rmbConverter.numberPlaceholder')"
                clearable
                size="large"
                @input="handleNumberInput"
                @clear="handleClearNumber"
              />
            </div>
          </div>

          <!-- 大写结果输出 -->
          <div class="rmb-converter__form-item">
            <label class="rmb-converter__label">
              {{ t('pages.rmbConverter.chineseAmount') }}
              <t-tag size="small" theme="success" variant="light">{{ t('pages.rmbConverter.output') }}</t-tag>
            </label>
            <div class="rmb-converter__input-wrapper">
              <t-input
                v-model="chineseOutput"
                :placeholder="t('pages.rmbConverter.chineseOutputPlaceholder')"
                readonly
                size="large"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(chineseOutput)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>

          <!-- 数字金额格式化显示 -->
          <div class="rmb-converter__form-item">
            <label class="rmb-converter__label">
              {{ t('pages.rmbConverter.formattedAmount') }}
              <t-tag size="small" theme="warning" variant="light">{{ t('pages.rmbConverter.formatted') }}</t-tag>
            </label>
            <div class="rmb-converter__input-wrapper">
              <t-input
                v-model="formattedNumber"
                :placeholder="t('pages.rmbConverter.formattedPlaceholder')"
                readonly
                size="large"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(formattedNumber)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>
        </div>

        <!-- 快捷示例按钮 -->
        <div class="rmb-converter__examples">
          <span class="rmb-converter__examples-label">{{ t('pages.rmbConverter.quickExamples') }}：</span>
          <t-space size="small">
            <t-button
              v-for="example in numberExamples"
              :key="example"
              size="small"
              variant="outline"
              @click="setNumberExample(example)"
            >
              {{ example }}
            </t-button>
          </t-space>
        </div>
      </div>

      <!-- 大写转数字面板 -->
      <div class="rmb-converter__panel">
        <div class="rmb-converter__panel-header">
          <h3 class="rmb-converter__panel-title">
            <swap-icon class="rmb-converter__panel-icon" />
            {{ t('pages.rmbConverter.chineseToNumber') }}
          </h3>
          <t-space size="small">
            <t-button size="small" variant="text" theme="primary" @click="handleClearChinese">
              <template #icon><clear-icon /></template>
              {{ t('pages.rmbConverter.clear') }}
            </t-button>
          </t-space>
        </div>

        <div class="rmb-converter__form">
          <!-- 大写金额输入 -->
          <div class="rmb-converter__form-item">
            <label class="rmb-converter__label">
              {{ t('pages.rmbConverter.chineseAmount') }}
              <t-tag size="small" theme="primary" variant="light">{{ t('pages.rmbConverter.input') }}</t-tag>
            </label>
            <div class="rmb-converter__input-wrapper">
              <t-input
                v-model="chineseInput"
                :placeholder="t('pages.rmbConverter.chinesePlaceholder')"
                clearable
                size="large"
                @input="handleChineseInput"
                @clear="handleClearChinese"
              />
            </div>
          </div>

          <!-- 数字结果输出 -->
          <div class="rmb-converter__form-item">
            <label class="rmb-converter__label">
              {{ t('pages.rmbConverter.numberAmount') }}
              <t-tag size="small" theme="success" variant="light">{{ t('pages.rmbConverter.output') }}</t-tag>
            </label>
            <div class="rmb-converter__input-wrapper">
              <t-input
                v-model="numberOutput"
                :placeholder="t('pages.rmbConverter.numberOutputPlaceholder')"
                readonly
                size="large"
              />
              <t-button size="small" variant="text" theme="primary" @click="handleCopy(numberOutput)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>
          </div>
        </div>

        <!-- 快捷示例按钮 -->
        <div class="rmb-converter__examples">
          <span class="rmb-converter__examples-label">{{ t('pages.rmbConverter.quickExamples') }}：</span>
          <t-space size="small" break-line>
            <t-button
              v-for="example in chineseExamples"
              :key="example"
              size="small"
              variant="outline"
              @click="setChineseExample(example)"
            >
              {{ example }}
            </t-button>
          </t-space>
        </div>
      </div>
    </div>

    <!-- 使用说明区域 -->
    <t-divider />
    <div class="rmb-converter__usage">
      <t-collapse :default-value="['1']">
        <t-collapse-panel value="1" :header="t('pages.rmbConverter.usageTitle')">
          <div class="rmb-converter__usage-content">
            <h4>{{ t('pages.rmbConverter.numberToChineseTitle') }}</h4>
            <ul>
              <li>{{ t('pages.rmbConverter.tip1') }}</li>
              <li>{{ t('pages.rmbConverter.tip2') }}</li>
              <li>{{ t('pages.rmbConverter.tip3') }}</li>
            </ul>

            <h4>{{ t('pages.rmbConverter.chineseToNumberTitle') }}</h4>
            <ul>
              <li>{{ t('pages.rmbConverter.tip4') }}</li>
              <li>{{ t('pages.rmbConverter.tip5') }}</li>
            </ul>

            <h4>{{ t('pages.rmbConverter.conversionRules') }}</h4>
            <t-table
              :data="conversionRulesData"
              :columns="conversionRulesColumns"
              :bordered="true"
              size="small"
              row-key="number"
            />
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ClearIcon, FileCopyIcon, MoneyIcon, SwapIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 数字转大写的状态
const numberInput = ref('');
const chineseOutput = ref('');
const formattedNumber = ref('');

// 大写转数字的状态
const chineseInput = ref('');
const numberOutput = ref('');

// 数字示例
const numberExamples = ['1234.56', '10000', '100000000', '0.01', '999999999.99'];

// 大写示例
const chineseExamples = [
  '壹仟贰佰叁拾肆元伍角陆分',
  '壹万元整',
  '壹亿元整',
  '壹分',
  '玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖元玖角玖分',
];

// 大写数字映射
const chineseNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const chineseUnits = ['', '拾', '佰', '仟'];
const chineseBigUnits = ['', '万', '亿', '兆'];

// 大写数字到阿拉伯数字的映射
const chineseToNum: Record<string, number> = {
  零: 0,
  壹: 1,
  贰: 2,
  叁: 3,
  肆: 4,
  伍: 5,
  陆: 6,
  柒: 7,
  捌: 8,
  玖: 9,
};

const unitToNum: Record<string, number> = {
  拾: 10,
  佰: 100,
  仟: 1000,
  万: 10000,
  亿: 100000000,
  兆: 1000000000000,
};

// 转换规则表格数据
const conversionRulesData = computed(() => [
  { number: '0', chinese: '零', desc: t('pages.rmbConverter.digit') },
  { number: '1', chinese: '壹', desc: t('pages.rmbConverter.digit') },
  { number: '2', chinese: '贰', desc: t('pages.rmbConverter.digit') },
  { number: '3', chinese: '叁', desc: t('pages.rmbConverter.digit') },
  { number: '4', chinese: '肆', desc: t('pages.rmbConverter.digit') },
  { number: '5', chinese: '伍', desc: t('pages.rmbConverter.digit') },
  { number: '6', chinese: '陆', desc: t('pages.rmbConverter.digit') },
  { number: '7', chinese: '柒', desc: t('pages.rmbConverter.digit') },
  { number: '8', chinese: '捌', desc: t('pages.rmbConverter.digit') },
  { number: '9', chinese: '玖', desc: t('pages.rmbConverter.digit') },
  { number: '10', chinese: '拾', desc: t('pages.rmbConverter.unit') },
  { number: '100', chinese: '佰', desc: t('pages.rmbConverter.unit') },
  { number: '1000', chinese: '仟', desc: t('pages.rmbConverter.unit') },
  { number: '10000', chinese: '万', desc: t('pages.rmbConverter.bigUnit') },
  { number: '100000000', chinese: '亿', desc: t('pages.rmbConverter.bigUnit') },
]);

const conversionRulesColumns = computed(() => [
  { colKey: 'number', title: t('pages.rmbConverter.arabicNumber'), width: 120 },
  { colKey: 'chinese', title: t('pages.rmbConverter.chineseUpper'), width: 100 },
  { colKey: 'desc', title: t('pages.rmbConverter.tableDescription') },
]);

/**
 * 将数字金额转换为人民币大写
 */
function numberToChinese(num: number): string {
  if (Number.isNaN(num)) return '';

  // 处理负数
  if (num < 0) {
    return `负${numberToChinese(-num)}`;
  }

  // 处理零
  if (num === 0) {
    return '零元整';
  }

  // 处理金额过大的情况
  if (num >= 1000000000000000) {
    return t('pages.rmbConverter.amountTooLarge');
  }

  // 分离整数和小数部分
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  // 处理整数部分
  if (integerPart > 0) {
    result = `${convertIntegerPart(integerPart)}元`;
  }

  // 处理小数部分
  if (decimalPart === 0) {
    result += '整';
  } else {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;

    if (integerPart === 0 && jiao === 0) {
      // 只有分的情况
      result = `${chineseNums[fen]}分`;
    } else {
      if (jiao > 0) {
        result += `${chineseNums[jiao]}角`;
      } else if (integerPart > 0) {
        result += '零';
      }
      if (fen > 0) {
        result += `${chineseNums[fen]}分`;
      }
    }
  }

  return result;
}

/**
 * 转换整数部分
 */
function convertIntegerPart(num: number): string {
  if (num === 0) return '';

  let result = '';
  let bigUnitIndex = 0;
  let needZero = false;

  while (num > 0) {
    const section = num % 10000;
    const sectionStr = convertSection(section);

    if (section > 0) {
      if (needZero && section < 1000) {
        result = `零${result}`;
      }
      result = sectionStr + chineseBigUnits[bigUnitIndex] + result;
      needZero = section < 1000;
    } else if (result) {
      needZero = true;
    }

    num = Math.floor(num / 10000);
    bigUnitIndex++;
  }

  return result;
}

/**
 * 转换四位数字段
 */
function convertSection(num: number): string {
  if (num === 0) return '';

  let result = '';
  let unitIndex = 0;
  let zero = true;

  while (num > 0) {
    const digit = num % 10;

    if (digit === 0) {
      if (!zero && unitIndex > 0) {
        zero = true;
        result = chineseNums[0] + result;
      }
    } else {
      zero = false;
      result = chineseNums[digit] + chineseUnits[unitIndex] + result;
    }

    unitIndex++;
    num = Math.floor(num / 10);
  }

  return result;
}

/**
 * 将人民币大写转换为数字金额
 */
function chineseToNumber(chinese: string): string {
  if (!chinese || chinese.trim() === '') return '';

  try {
    // 移除空格
    chinese = chinese.replace(/\s/g, '');

    // 处理负数
    let negative = false;
    if (chinese.startsWith('负')) {
      negative = true;
      chinese = chinese.substring(1);
    }

    // 移除"元"、"整"等字符进行预处理
    let integerPart = 0;
    let decimalPart = 0;

    // 分割整数部分和小数部分
    const yuanIndex = chinese.indexOf('元');
    let integerStr = '';
    let decimalStr = '';

    if (yuanIndex !== -1) {
      integerStr = chinese.substring(0, yuanIndex);
      decimalStr = chinese.substring(yuanIndex + 1);
    } else {
      // 可能只有角分
      decimalStr = chinese;
    }

    // 处理整数部分
    if (integerStr) {
      integerPart = parseChineseInteger(integerStr);
    }

    // 处理小数部分
    if (decimalStr && decimalStr !== '整') {
      const jiaoIndex = decimalStr.indexOf('角');
      const fenIndex = decimalStr.indexOf('分');

      if (jiaoIndex !== -1) {
        const jiaoChar = decimalStr.substring(jiaoIndex - 1, jiaoIndex);
        const jiaoValue = chineseToNum[jiaoChar];
        if (jiaoValue !== undefined) {
          decimalPart += jiaoValue * 10;
        }
      }

      if (fenIndex !== -1) {
        const fenChar = decimalStr.substring(fenIndex - 1, fenIndex);
        const fenValue = chineseToNum[fenChar];
        if (fenValue !== undefined) {
          decimalPart += fenValue;
        }
      }
    }

    let result = integerPart + decimalPart / 100;

    if (negative) {
      result = -result;
    }

    // 格式化输出，保留2位小数
    return result.toFixed(2);
  } catch {
    return t('pages.rmbConverter.parseError');
  }
}

/**
 * 解析中文整数部分
 */
function parseChineseInteger(chinese: string): number {
  let result = 0;
  let temp = 0;
  let currentSection = 0;

  for (let i = 0; i < chinese.length; i++) {
    const char = chinese[i];
    const numValue = chineseToNum[char];
    const unitValue = unitToNum[char];

    if (numValue !== undefined) {
      temp = numValue;
    } else if (unitValue !== undefined) {
      if (unitValue >= 10000) {
        // 万、亿等大单位
        currentSection = (currentSection + temp) * unitValue;
        if (unitValue >= 100000000) {
          result += currentSection;
          currentSection = 0;
        }
        temp = 0;
      } else {
        // 拾、佰、仟
        currentSection += temp * unitValue;
        temp = 0;
      }
    }
  }

  result += currentSection + temp;
  return result;
}

/**
 * 格式化数字金额（添加千分位分隔符）
 */
function formatNumber(num: number): string {
  if (Number.isNaN(num)) return '';

  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `￥${parts.join('.')}`;
}

/**
 * 处理数字输入
 */
function handleNumberInput() {
  const value = numberInput.value.trim();
  if (value === '') {
    chineseOutput.value = '';
    formattedNumber.value = '';
    return;
  }

  // 只允许数字和小数点
  const num = Number.parseFloat(value);
  if (!Number.isNaN(num)) {
    chineseOutput.value = numberToChinese(num);
    formattedNumber.value = formatNumber(num);
  } else {
    chineseOutput.value = t('pages.rmbConverter.invalidNumber');
    formattedNumber.value = '';
  }
}

/**
 * 处理大写输入
 */
function handleChineseInput() {
  const value = chineseInput.value.trim();
  if (value === '') {
    numberOutput.value = '';
    return;
  }

  numberOutput.value = chineseToNumber(value);
}

/**
 * 清空数字转换区域
 */
function handleClearNumber() {
  numberInput.value = '';
  chineseOutput.value = '';
  formattedNumber.value = '';
  MessagePlugin.success(t('pages.rmbConverter.clearSuccess'));
}

/**
 * 清空大写转换区域
 */
function handleClearChinese() {
  chineseInput.value = '';
  numberOutput.value = '';
  MessagePlugin.success(t('pages.rmbConverter.clearSuccess'));
}

/**
 * 设置数字示例
 */
function setNumberExample(example: string) {
  numberInput.value = example;
  handleNumberInput();
}

/**
 * 设置大写示例
 */
function setChineseExample(example: string) {
  chineseInput.value = example;
  handleChineseInput();
}

/**
 * 复制到剪贴板
 */
async function handleCopy(text: string) {
  if (!text) {
    MessagePlugin.warning(t('pages.rmbConverter.nothingToCopy'));
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    MessagePlugin.success(t('pages.rmbConverter.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.rmbConverter.copyFailed'));
  }
}
</script>
<style lang="less" scoped>
.rmb-converter {
  padding: 16px;
  background-color: var(--td-bg-color-container);

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 20px;
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
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-top: 16px;
  }

  &__panel {
    padding: 20px;
    background-color: var(--td-bg-color-secondarycontainer);
    border-radius: 8px;
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__panel-icon {
    font-size: 20px;
    color: var(--td-brand-color);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__examples {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--td-component-stroke);
  }

  &__examples-label {
    font-size: 13px;
    color: var(--td-text-color-secondary);
  }

  &__usage {
    margin-top: 16px;
  }

  &__usage-content {
    h4 {
      margin: 16px 0 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--td-text-color-primary);

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        font-size: 13px;
        color: var(--td-text-color-secondary);
        line-height: 1.6;
      }
    }
  }
}

@media (width <= 768px) {
  .rmb-converter {
    &__content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
