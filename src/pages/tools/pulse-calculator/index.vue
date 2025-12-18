<template>
  <div class="pulse-calculator">
    <!-- 标题区域 -->
    <div class="pulse-calculator__header">
      <h1 class="pulse-calculator__title">{{ t('pages.pulseCalculator.title') }}</h1>
      <p class="pulse-calculator__description">
        {{ t('pages.pulseCalculator.description') }}
      </p>
    </div>

    <t-divider />

    <!-- 主要计算区域 -->
    <div class="pulse-calculator__content">
      <!-- 费率计算面板 -->
      <div class="pulse-calculator__panel">
        <div class="pulse-calculator__panel-header">
          <h3 class="pulse-calculator__panel-title">
            <calculation-icon class="pulse-calculator__panel-icon" />
            {{ t('pages.pulseCalculator.rateCalculation') }}
          </h3>
          <t-space size="small">
            <t-button size="small" variant="text" theme="primary" @click="handleClear">
              <template #icon><clear-icon /></template>
              {{ t('pages.pulseCalculator.clear') }}
            </t-button>
          </t-space>
        </div>

        <div class="pulse-calculator__form">
          <!-- 水的单价输入 -->
          <div class="pulse-calculator__form-item">
            <label class="pulse-calculator__label">
              {{ t('pages.pulseCalculator.waterPrice') }}
              <t-tag size="small" theme="primary" variant="light">{{ t('pages.pulseCalculator.input') }}</t-tag>
            </label>
            <div class="pulse-calculator__input-group">
              <t-input-number
                v-model="waterPrice"
                :placeholder="t('pages.pulseCalculator.pricePlaceholder')"
                :decimal-places="2"
                :min="0"
                :step="0.1"
                theme="column"
                size="large"
                style="width: 200px"
                @change="calculatePulses"
              />
              <t-select v-model="priceUnit" style="width: 150px" size="large" @change="calculatePulses">
                <t-option value="0.01" :label="t('pages.pulseCalculator.fenPerLiter')" />
                <t-option value="0.1" :label="t('pages.pulseCalculator.jiaoPerLiter')" />
                <t-option value="1" :label="t('pages.pulseCalculator.yuanPerLiter')" />
              </t-select>
            </div>
          </div>

          <!-- 每个脉冲的水量输入 -->
          <div class="pulse-calculator__form-item">
            <label class="pulse-calculator__label">
              {{ t('pages.pulseCalculator.pulseVolume') }}
              <t-tag size="small" theme="success" variant="light">{{ t('pages.pulseCalculator.input') }}</t-tag>
            </label>
            <div class="pulse-calculator__input-group">
              <t-input-number
                v-model="pulseVolume"
                :placeholder="t('pages.pulseCalculator.volumePlaceholder')"
                :decimal-places="3"
                :min="0"
                :step="0.01"
                theme="column"
                size="large"
                style="width: 200px"
                @change="calculatePulses"
              />
              <t-select v-model="volumeUnit" style="width: 150px" size="large" @change="calculatePulses">
                <t-option value="0.001" :label="t('pages.pulseCalculator.milliliter')" />
                <t-option value="1" :label="t('pages.pulseCalculator.liter')" />
              </t-select>
            </div>
          </div>

          <!-- 快捷设置每脉冲水量 -->
          <div class="pulse-calculator__quick-set">
            <span class="pulse-calculator__quick-label">{{ t('pages.pulseCalculator.commonVolumes') }}:</span>
            <t-space size="small">
              <t-button
                v-for="volume in commonVolumes"
                :key="volume"
                size="small"
                :variant="pulseVolume === volume && volumeUnit === '0.001' ? 'base' : 'outline'"
                :theme="pulseVolume === volume && volumeUnit === '0.001' ? 'primary' : 'default'"
                @click="setQuickVolume(volume)"
              >
                {{ volume }} ml
              </t-button>
            </t-space>
          </div>
        </div>

        <t-divider />

        <!-- 计算结果区域 -->
        <div class="pulse-calculator__results">
          <div class="pulse-calculator__result-title">
            <chart-icon class="pulse-calculator__result-icon" />
            {{ t('pages.pulseCalculator.calculationResults') }}
          </div>

          <t-row :gutter="[16, 16]">
            <t-col :xs="24" :sm="12">
              <div class="pulse-calculator__result-card pulse-calculator__result-card--primary">
                <div class="pulse-calculator__result-label">{{ t('pages.pulseCalculator.pulsesPerFen') }}</div>
                <div class="pulse-calculator__result-value">{{ pulsesPerFen }}</div>
                <div class="pulse-calculator__result-desc">{{ t('pages.pulseCalculator.pulsesPerFenDesc') }}</div>
                <t-button
                  size="small"
                  variant="text"
                  theme="primary"
                  class="pulse-calculator__copy-btn"
                  @click="handleCopy(pulsesPerFen)"
                >
                  <template #icon><file-copy-icon /></template>
                </t-button>
              </div>
            </t-col>
            <t-col :xs="24" :sm="12">
              <div class="pulse-calculator__result-card pulse-calculator__result-card--success">
                <div class="pulse-calculator__result-label">{{ t('pages.pulseCalculator.fenPerPulse') }}</div>
                <div class="pulse-calculator__result-value">{{ fenPerPulse }}</div>
                <div class="pulse-calculator__result-desc">{{ t('pages.pulseCalculator.fenPerPulseDesc') }}</div>
                <t-button
                  size="small"
                  variant="text"
                  theme="primary"
                  class="pulse-calculator__copy-btn"
                  @click="handleCopy(fenPerPulse)"
                >
                  <template #icon><file-copy-icon /></template>
                </t-button>
              </div>
            </t-col>
          </t-row>
        </div>
      </div>

      <!-- 倍数计算器面板 -->
      <div class="pulse-calculator__panel">
        <div class="pulse-calculator__panel-header">
          <h3 class="pulse-calculator__panel-title">
            <swap-icon class="pulse-calculator__panel-icon" />
            {{ t('pages.pulseCalculator.multiplierCalculator') }}
          </h3>
          <t-tooltip :content="t('pages.pulseCalculator.multiplierTooltip')">
            <info-circle-icon class="pulse-calculator__info-icon" />
          </t-tooltip>
        </div>

        <div class="pulse-calculator__form">
          <!-- 简单计算器 -->
          <div class="pulse-calculator__calculator">
            <div class="pulse-calculator__calc-row">
              <t-input-number
                v-model="calcNum1"
                :placeholder="t('pages.pulseCalculator.num1Placeholder')"
                :decimal-places="10"
                theme="normal"
                size="large"
                style="flex: 1"
                @change="calculate"
              />
              <t-select v-model="calcOperator" style="width: 80px" size="large" @change="calculate">
                <t-option value="*" label="×" />
                <t-option value="/" label="÷" />
                <t-option value="+" label="+" />
                <t-option value="-" label="-" />
              </t-select>
              <t-input-number
                v-model="calcNum2"
                :placeholder="t('pages.pulseCalculator.num2Placeholder')"
                :decimal-places="4"
                theme="column"
                size="large"
                style="width: 150px"
                @change="calculate"
              />
            </div>

            <div class="pulse-calculator__calc-result">
              <span class="pulse-calculator__calc-equals">=</span>
              <t-input
                v-model="calcResult"
                :placeholder="t('pages.pulseCalculator.resultPlaceholder')"
                readonly
                size="large"
                style="flex: 1"
              />
              <t-button size="large" variant="text" theme="primary" @click="handleCopy(calcResult)">
                <template #icon><file-copy-icon /></template>
              </t-button>
            </div>

            <!-- 快捷倍数按钮 -->
            <div class="pulse-calculator__multipliers">
              <span class="pulse-calculator__multiplier-label">{{ t('pages.pulseCalculator.quickMultipliers') }}:</span>
              <t-space size="small" break-line>
                <t-button
                  v-for="mult in quickMultipliers"
                  :key="mult"
                  size="small"
                  :variant="calcNum2 === mult && calcOperator === '*' ? 'base' : 'outline'"
                  :theme="calcNum2 === mult && calcOperator === '*' ? 'primary' : 'default'"
                  @click="setMultiplier(mult)"
                >
                  × {{ mult }}
                </t-button>
              </t-space>
            </div>
          </div>
        </div>

        <!-- 倍数对照表 -->
        <t-divider />
        <div class="pulse-calculator__table-section">
          <div class="pulse-calculator__table-title">
            <table-icon class="pulse-calculator__table-icon" />
            {{ t('pages.pulseCalculator.multiplierTable') }}
          </div>
          <t-table
            :data="multiplierTableData"
            :columns="multiplierColumns"
            :bordered="true"
            :stripe="true"
            size="small"
            :max-height="400"
          />
        </div>
      </div>
    </div>

    <!-- 使用说明区域 -->
    <t-divider />
    <div class="pulse-calculator__usage">
      <t-collapse :default-value="['1']">
        <t-collapse-panel value="1" :header="t('pages.pulseCalculator.usageTitle')">
          <div class="pulse-calculator__usage-content">
            <h4>{{ t('pages.pulseCalculator.basicUsage') }}</h4>
            <ul>
              <li>{{ t('pages.pulseCalculator.tip1') }}</li>
              <li>{{ t('pages.pulseCalculator.tip2') }}</li>
              <li>{{ t('pages.pulseCalculator.tip3') }}</li>
            </ul>

            <h4>{{ t('pages.pulseCalculator.multiplierUsage') }}</h4>
            <ul>
              <li>{{ t('pages.pulseCalculator.tip4') }}</li>
              <li>{{ t('pages.pulseCalculator.tip5') }}</li>
              <li>{{ t('pages.pulseCalculator.tip6') }}</li>
            </ul>

            <h4>{{ t('pages.pulseCalculator.applicationScenario') }}</h4>
            <ul>
              <li>{{ t('pages.pulseCalculator.scenario1') }}</li>
              <li>{{ t('pages.pulseCalculator.scenario2') }}</li>
              <li>{{ t('pages.pulseCalculator.scenario3') }}</li>
            </ul>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  CalculationIcon,
  ChartIcon,
  ClearIcon,
  FileCopyIcon,
  InfoCircleIcon,
  SwapIcon,
  TableIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 费率计算相关状态
const waterPrice = ref<number>(2);
const priceUnit = ref<string>('0.1'); // 默认毛/升
const pulseVolume = ref<number>(1.67);
const volumeUnit = ref<string>('0.001'); // 默认毫升

// 常见脉冲水量
const commonVolumes = [1.67, 2.38, 3.33, 5, 10];

// 计算器相关状态
const calcNum1 = ref<number | undefined>(undefined);
const calcNum2 = ref<number>(2);
const calcOperator = ref<string>('*');
const calcResult = ref<string>('');

// 快捷倍数
const quickMultipliers = [2, 4, 8, 16, 32, 64, 100, 128, 256];

// 计算每分钱对应的脉冲数
const pulsesPerFen = computed(() => {
  if (waterPrice.value > 0 && pulseVolume.value > 0) {
    const priceInYuan = waterPrice.value * Number.parseFloat(priceUnit.value);
    const volumeInLiters = pulseVolume.value * Number.parseFloat(volumeUnit.value);
    // 每分钱 = 0.01 元
    // 每分钱能买的水量（升） = 0.01 / priceInYuan
    // 每分钱对应的脉冲数 = 每分钱能买的水量 / 每脉冲水量
    const result = 0.01 / (priceInYuan * volumeInLiters);
    return result.toFixed(10);
  }
  return '0';
});

// 计算每个脉冲的费用（分）
const fenPerPulse = computed(() => {
  if (waterPrice.value > 0 && pulseVolume.value > 0) {
    const priceInYuan = waterPrice.value * Number.parseFloat(priceUnit.value);
    const volumeInLiters = pulseVolume.value * Number.parseFloat(volumeUnit.value);
    // 每脉冲水量 * 单价 * 100（转为分）
    const result = priceInYuan * volumeInLiters * 100;
    return result.toFixed(10);
  }
  return '0';
});

// 倍数对照表数据
const multiplierTableData = computed(() => {
  const baseValue = Number.parseFloat(pulsesPerFen.value);
  if (baseValue <= 0 || Number.isNaN(baseValue)) return [];

  return quickMultipliers.map((mult) => ({
    multiplier: `× ${mult}`,
    value: (baseValue * mult).toFixed(6),
    rounded: Math.round(baseValue * mult),
    error: (((Math.round(baseValue * mult) - baseValue * mult) / (baseValue * mult)) * 100).toFixed(4),
  }));
});

// 表格列配置
const multiplierColumns = computed(() => [
  {
    colKey: 'multiplier',
    title: t('pages.pulseCalculator.multiplier'),
    width: 100,
  },
  {
    colKey: 'value',
    title: t('pages.pulseCalculator.exactValue'),
    width: 180,
  },
  {
    colKey: 'rounded',
    title: t('pages.pulseCalculator.roundedValue'),
    width: 120,
  },
  {
    colKey: 'error',
    title: t('pages.pulseCalculator.errorPercent'),
    width: 120,
    cell: (_h: any, { row }: any) => {
      return `${row.error}%`;
    },
  },
]);

// 计算脉冲数（用于触发更新）
const calculatePulses = () => {
  // 计算结果会通过 computed 自动更新
  // 同时更新计算器的第一个数值
  calcNum1.value = Number.parseFloat(pulsesPerFen.value);
  calculate();
};

// 简单计算器计算
const calculate = () => {
  if (calcNum1.value !== undefined && calcNum2.value !== undefined) {
    const num1 = calcNum1.value;
    const num2 = calcNum2.value;
    let result: number | string;

    switch (calcOperator.value) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        result = num1 - num2;
        break;
      case '*':
        result = num1 * num2;
        break;
      case '/':
        result = num2 !== 0 ? num1 / num2 : t('pages.pulseCalculator.divideByZero');
        break;
      default:
        result = '';
    }
    calcResult.value = typeof result === 'number' ? result.toFixed(10) : String(result);
  } else {
    calcResult.value = '';
  }
};

// 设置快捷脉冲水量
const setQuickVolume = (volume: number) => {
  pulseVolume.value = volume;
  volumeUnit.value = '0.001';
  calculatePulses();
};

// 设置倍数
const setMultiplier = (mult: number) => {
  calcNum2.value = mult;
  calcOperator.value = '*';
  calculate();
};

// 清空
const handleClear = () => {
  waterPrice.value = 2;
  priceUnit.value = '0.1';
  pulseVolume.value = 1.67;
  volumeUnit.value = '0.001';
  calcNum1.value = undefined;
  calcNum2.value = 2;
  calcResult.value = '';
  MessagePlugin.success(t('pages.pulseCalculator.clearSuccess'));
};

// 复制
const handleCopy = async (text: string) => {
  if (!text) {
    MessagePlugin.warning(t('pages.pulseCalculator.nothingToCopy'));
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    MessagePlugin.success(t('pages.pulseCalculator.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.pulseCalculator.copyFailed'));
  }
};

// 监听计算结果变化，自动更新计算器
watch(pulsesPerFen, (newVal) => {
  calcNum1.value = Number.parseFloat(newVal);
  calculate();
});

// 初始化计算
calculatePulses();
</script>
<style lang="less" scoped>
.pulse-calculator {
  padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingLR-xl);
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);

  &__header {
    margin-bottom: var(--td-comp-margin-xl);
  }

  &__title {
    font-size: var(--td-font-size-headline-medium);
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 var(--td-comp-margin-s) 0;
  }

  &__description {
    font-size: var(--td-font-size-body-medium);
    color: var(--td-text-color-secondary);
    margin: 0;
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: var(--td-comp-margin-xl);

    @media (width <= 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &__panel {
    background: var(--td-bg-color-secondarycontainer);
    border-radius: var(--td-radius-medium);
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l);
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--td-comp-margin-l);
  }

  &__panel-title {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-s);
    font-size: var(--td-font-size-title-medium);
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  &__panel-icon {
    font-size: 20px;
    color: var(--td-brand-color);
  }

  &__info-icon {
    font-size: 16px;
    color: var(--td-text-color-placeholder);
    cursor: help;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-l);
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-s);
  }

  &__label {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-xs);
    font-size: var(--td-font-size-body-medium);
    color: var(--td-text-color-primary);
    font-weight: 500;
  }

  &__input-group {
    display: flex;
    gap: var(--td-comp-margin-s);
    align-items: center;
  }

  &__quick-set {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-s);
    flex-wrap: wrap;
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
    background: var(--td-bg-color-container);
    border-radius: var(--td-radius-small);
  }

  &__quick-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
  }

  &__results {
    margin-top: var(--td-comp-margin-l);
  }

  &__result-title {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-s);
    font-size: var(--td-font-size-title-small);
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: var(--td-comp-margin-l);
  }

  &__result-icon {
    font-size: 18px;
    color: var(--td-brand-color);
  }

  &__result-card {
    position: relative;
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l);
    border-radius: var(--td-radius-medium);
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-stroke);

    &--primary {
      border-left: 4px solid var(--td-brand-color);
    }

    &--success {
      border-left: 4px solid var(--td-success-color);
    }
  }

  &__result-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    margin-bottom: var(--td-comp-margin-xs);
  }

  &__result-value {
    font-size: var(--td-font-size-title-large);
    font-weight: 600;
    color: var(--td-text-color-primary);
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    word-break: break-all;
  }

  &__result-desc {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-placeholder);
    margin-top: var(--td-comp-margin-xs);
  }

  &__copy-btn {
    position: absolute;
    top: var(--td-comp-paddingTB-s);
    right: var(--td-comp-paddingLR-s);
  }

  &__calculator {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-l);
  }

  &__calc-row {
    display: flex;
    gap: var(--td-comp-margin-s);
    align-items: center;
  }

  &__calc-result {
    display: flex;
    gap: var(--td-comp-margin-s);
    align-items: center;
  }

  &__calc-equals {
    font-size: var(--td-font-size-title-large);
    font-weight: 600;
    color: var(--td-text-color-primary);
    padding: 0 var(--td-comp-paddingLR-s);
  }

  &__multipliers {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-s);
    flex-wrap: wrap;
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
    background: var(--td-bg-color-container);
    border-radius: var(--td-radius-small);
  }

  &__multiplier-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
  }

  &__table-section {
    margin-top: var(--td-comp-margin-l);
  }

  &__table-title {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-s);
    font-size: var(--td-font-size-title-small);
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: var(--td-comp-margin-l);
  }

  &__table-icon {
    font-size: 18px;
    color: var(--td-brand-color);
  }

  &__usage {
    margin-top: var(--td-comp-margin-xl);
  }

  &__usage-content {
    h4 {
      font-size: var(--td-font-size-body-large);
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: var(--td-comp-margin-l) 0 var(--td-comp-margin-s) 0;

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 0;
      padding-left: var(--td-comp-paddingLR-xl);
      color: var(--td-text-color-secondary);

      li {
        margin-bottom: var(--td-comp-margin-xs);
        line-height: 1.8;
      }
    }
  }
}
</style>
