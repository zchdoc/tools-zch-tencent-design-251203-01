<template>
  <div class="random-generator">
    <!-- 标题区域 -->
    <div class="random-generator__header">
      <h1 class="random-generator__title">{{ t('pages.randomGenerator.title') }}</h1>
      <p class="random-generator__description">
        {{ t('pages.randomGenerator.description') }}
      </p>
    </div>

    <t-divider />

    <!-- 主要内容区域 -->
    <div class="random-generator__content">
      <!-- 参数设置面板 -->
      <div class="random-generator__panel">
        <div class="random-generator__panel-header">
          <h3 class="random-generator__panel-title">
            <setting-icon class="random-generator__panel-icon" />
            {{ t('pages.randomGenerator.settings') }}
          </h3>
        </div>

        <div class="random-generator__form">
          <t-row :gutter="[16, 16]">
            <!-- 最小值 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.minValue') }}</label>
                <t-input-number
                  v-model="minValue"
                  :min="-999999999"
                  :max="maxValue - 1"
                  theme="column"
                  :allow-input-over-limit="false"
                  style="width: 100%"
                />
              </div>
            </t-col>

            <!-- 最大值 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.maxValue') }}</label>
                <t-input-number
                  v-model="maxValue"
                  :min="minValue + 1"
                  :max="999999999"
                  theme="column"
                  :allow-input-over-limit="false"
                  style="width: 100%"
                />
              </div>
            </t-col>

            <!-- 生成数量 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.count') }}</label>
                <t-input-number
                  v-model="count"
                  :min="1"
                  :max="1000"
                  theme="column"
                  :allow-input-over-limit="false"
                  style="width: 100%"
                />
              </div>
            </t-col>

            <!-- 是否允许重复 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.allowDuplicate') }}</label>
                <t-switch v-model="allowDuplicate" />
                <span class="random-generator__switch-label">
                  {{ allowDuplicate ? t('pages.randomGenerator.yes') : t('pages.randomGenerator.no') }}
                </span>
              </div>
            </t-col>

            <!-- 是否排序 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.sortResult') }}</label>
                <t-select v-model="sortMode" style="width: 100%">
                  <t-option value="none" :label="t('pages.randomGenerator.noSort')" />
                  <t-option value="asc" :label="t('pages.randomGenerator.ascending')" />
                  <t-option value="desc" :label="t('pages.randomGenerator.descending')" />
                </t-select>
              </div>
            </t-col>

            <!-- 分隔符 -->
            <t-col :xs="12" :sm="6" :md="6" :lg="4">
              <div class="random-generator__form-item">
                <label class="random-generator__label">{{ t('pages.randomGenerator.separator') }}</label>
                <t-select v-model="separator" style="width: 100%">
                  <t-option value=" " :label="t('pages.randomGenerator.space')" />
                  <t-option value="," :label="t('pages.randomGenerator.comma')" />
                  <t-option value="\n" :label="t('pages.randomGenerator.newLine')" />
                  <t-option value="; " :label="t('pages.randomGenerator.semicolon')" />
                  <t-option value=" | " :label="t('pages.randomGenerator.pipe')" />
                </t-select>
              </div>
            </t-col>
          </t-row>

          <!-- 操作按钮 -->
          <div class="random-generator__actions">
            <t-space>
              <t-button theme="primary" @click="generateRandom">
                <template #icon><play-icon /></template>
                {{ t('pages.randomGenerator.generate') }}
              </t-button>
              <t-button variant="outline" @click="handleClear">
                <template #icon><clear-icon /></template>
                {{ t('pages.randomGenerator.clear') }}
              </t-button>
            </t-space>
          </div>
        </div>
      </div>

      <!-- 结果展示面板 -->
      <div class="random-generator__panel">
        <div class="random-generator__panel-header">
          <h3 class="random-generator__panel-title">
            <view-list-icon class="random-generator__panel-icon" />
            {{ t('pages.randomGenerator.result') }}
            <t-tag v-if="resultList.length > 0" size="small" theme="primary" variant="light" style="margin-left: 8px">
              {{ resultList.length }}
            </t-tag>
          </h3>
          <t-space size="small">
            <t-button
              v-if="resultList.length > 0"
              size="small"
              variant="text"
              theme="primary"
              @click="handleCopyResult"
            >
              <template #icon><file-copy-icon /></template>
              {{ t('pages.randomGenerator.copy') }}
            </t-button>
          </t-space>
        </div>

        <div class="random-generator__result">
          <t-textarea
            v-model="resultText"
            :placeholder="t('pages.randomGenerator.resultPlaceholder')"
            readonly
            :autosize="{ minRows: 4, maxRows: 12 }"
          />
        </div>

        <!-- 统计信息 -->
        <div v-if="resultList.length > 0" class="random-generator__stats">
          <t-row :gutter="[16, 8]">
            <t-col :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.total') }}</span>
                <span class="random-generator__stat-value">{{ resultList.length }}</span>
              </div>
            </t-col>
            <t-col :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.min') }}</span>
                <span class="random-generator__stat-value">{{ stats.min }}</span>
              </div>
            </t-col>
            <t-col :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.max') }}</span>
                <span class="random-generator__stat-value">{{ stats.max }}</span>
              </div>
            </t-col>
            <t-col :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.average') }}</span>
                <span class="random-generator__stat-value">{{ stats.avg }}</span>
              </div>
            </t-col>
            <t-col :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.sum') }}</span>
                <span class="random-generator__stat-value">{{ stats.sum }}</span>
              </div>
            </t-col>
            <t-col v-if="!allowDuplicate" :xs="6" :sm="4" :md="3">
              <div class="random-generator__stat-item">
                <span class="random-generator__stat-label">{{ t('pages.randomGenerator.unique') }}</span>
                <span class="random-generator__stat-value">{{ stats.unique }}</span>
              </div>
            </t-col>
          </t-row>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="random-generator__panel">
        <div class="random-generator__panel-header">
          <h3 class="random-generator__panel-title">
            <info-circle-icon class="random-generator__panel-icon" />
            {{ t('pages.randomGenerator.usageTitle') }}
          </h3>
        </div>

        <div class="random-generator__usage">
          <t-collapse>
            <t-collapse-panel :header="t('pages.randomGenerator.basicUsage')">
              <ul class="random-generator__tips">
                <li>{{ t('pages.randomGenerator.tip1') }}</li>
                <li>{{ t('pages.randomGenerator.tip2') }}</li>
                <li>{{ t('pages.randomGenerator.tip3') }}</li>
              </ul>
            </t-collapse-panel>
            <t-collapse-panel :header="t('pages.randomGenerator.advancedOptions')">
              <ul class="random-generator__tips">
                <li>{{ t('pages.randomGenerator.tip4') }}</li>
                <li>{{ t('pages.randomGenerator.tip5') }}</li>
                <li>{{ t('pages.randomGenerator.tip6') }}</li>
              </ul>
            </t-collapse-panel>
          </t-collapse>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ClearIcon, FileCopyIcon, InfoCircleIcon, PlayIcon, SettingIcon, ViewListIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 参数设置
const minValue = ref(1);
const maxValue = ref(100);
const count = ref(10);
const allowDuplicate = ref(true);
const sortMode = ref<'none' | 'asc' | 'desc'>('none');
const separator = ref(' ');

// 结果
const resultList = ref<number[]>([]);

// 计算结果文本
const resultText = computed(() => {
  if (resultList.value.length === 0) return '';
  const sep = separator.value === '\\n' ? '\n' : separator.value;
  return resultList.value.join(sep);
});

// 统计信息
const stats = computed(() => {
  if (resultList.value.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, unique: 0 };
  }
  const list = resultList.value;
  const min = Math.min(...list);
  const max = Math.max(...list);
  const sum = list.reduce((a, b) => a + b, 0);
  const avg = (sum / list.length).toFixed(2);
  const unique = new Set(list).size;
  return { min, max, avg, sum, unique };
});

// 生成随机数
function generateRandom() {
  const range = maxValue.value - minValue.value + 1;

  // 如果不允许重复，检查是否能生成足够的数量
  if (!allowDuplicate.value && count.value > range) {
    MessagePlugin.warning(t('pages.randomGenerator.rangeError'));
    return;
  }

  const result: number[] = [];

  if (allowDuplicate.value) {
    // 允许重复
    for (let i = 0; i < count.value; i++) {
      const randomNum = Math.floor(Math.random() * range) + minValue.value;
      result.push(randomNum);
    }
  } else {
    // 不允许重复 - 使用 Fisher-Yates 洗牌算法的变体
    const pool = new Set<number>();
    while (pool.size < count.value) {
      const randomNum = Math.floor(Math.random() * range) + minValue.value;
      pool.add(randomNum);
    }
    result.push(...pool);
  }

  // 排序
  if (sortMode.value === 'asc') {
    result.sort((a, b) => a - b);
  } else if (sortMode.value === 'desc') {
    result.sort((a, b) => b - a);
  }

  resultList.value = result;
  MessagePlugin.success(t('pages.randomGenerator.generateSuccess', { count: result.length }));
}

// 清空
function handleClear() {
  resultList.value = [];
  MessagePlugin.success(t('pages.randomGenerator.clearSuccess'));
}

// 复制结果
async function handleCopyResult() {
  if (resultList.value.length === 0) {
    MessagePlugin.warning(t('pages.randomGenerator.nothingToCopy'));
    return;
  }

  try {
    await navigator.clipboard.writeText(resultText.value);
    MessagePlugin.success(t('pages.randomGenerator.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.randomGenerator.copyFailed'));
  }
}
</script>
<style lang="less" scoped>
.random-generator {
  padding: 16px;

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--td-text-color-primary);
  }

  &__description {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__panel {
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-medium);
    padding: 16px;
    box-shadow: var(--td-shadow-1);
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
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: var(--td-text-color-primary);
  }

  &__panel-icon {
    margin-right: 8px;
    font-size: 18px;
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
    font-size: 14px;
    color: var(--td-text-color-secondary);
  }

  &__switch-label {
    margin-left: 8px;
    font-size: 14px;
    color: var(--td-text-color-secondary);
  }

  &__actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 8px;
  }

  &__result {
    margin-bottom: 16px;
  }

  &__stats {
    padding: 12px;
    background-color: var(--td-bg-color-secondarycontainer);
    border-radius: var(--td-radius-default);
  }

  &__stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
  }

  &__stat-label {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 4px;
  }

  &__stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &__usage {
    :deep(.t-collapse) {
      border: none;
      background: transparent;
    }

    :deep(.t-collapse-panel__header) {
      background-color: var(--td-bg-color-secondarycontainer);
      border-radius: var(--td-radius-default);
    }
  }

  &__tips {
    margin: 0;
    padding-left: 20px;
    color: var(--td-text-color-secondary);

    li {
      margin-bottom: 8px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
