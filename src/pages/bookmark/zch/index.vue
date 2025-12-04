<template>
  <div class="bookmark-zch">
    <!-- 可折叠设置面板 - 整合所有控制 -->
    <div class="bookmark-zch__toolbar">
      <t-collapse v-model="settingsPanelExpanded" class="bookmark-zch__settings-collapse">
        <t-collapse-panel value="settings">
          <template #header>
            <div class="settings-collapse-header">
              <setting-icon />
              <span>设置</span>
              <t-tag theme="primary" variant="light" size="small" style="margin-left: 8px">
                {{ filteredBookmarks.length }} 书签
              </t-tag>
            </div>
          </template>
          <template #headerRightContent>
            <div class="settings-collapse-actions">
              <t-button size="small" theme="primary" variant="outline" @click.stop="saveDisplaySettings">
                <template #icon><save-icon /></template>
                保存设置
              </t-button>
              <t-button size="small" variant="outline" @click.stop="resetDisplaySettings">
                <template #icon><rollback-icon /></template>
                重置设置
              </t-button>
            </div>
          </template>

          <div class="settings-panel">
            <!-- 分组筛选区 -->
            <div class="settings-panel__row">
              <div class="settings-panel__label">分组筛选</div>
              <div class="settings-panel__control settings-panel__control--full">
                <t-button size="small" variant="outline" @click="showSelectedDialog = true">
                  <template #icon><view-list-icon /></template>
                  已选分组（{{ selectedGroups.length }}）
                </t-button>
                <t-button size="small" variant="outline" @click="selectAll">
                  <template #icon><check-double-icon /></template>
                  全选
                </t-button>
                <t-button size="small" variant="outline" @click="clearSelection">
                  <template #icon><clear-icon /></template>
                  清空
                </t-button>
                <t-button size="small" variant="outline" @click="invertSelection">
                  <template #icon><swap-icon /></template>
                  反选
                </t-button>
              </div>
            </div>

            <!-- 搜索区 -->
            <div class="settings-panel__row">
              <div class="settings-panel__label">搜索书签</div>
              <div class="settings-panel__control settings-panel__control--search">
                <t-input v-model="searchValue" placeholder="输入关键词搜索..." clearable size="small">
                  <template #prefix-icon><search-icon /></template>
                </t-input>
              </div>
            </div>

            <!-- 每行数量设置 -->
            <div class="settings-panel__row">
              <div class="settings-panel__label">每行卡片数</div>
              <div class="settings-panel__control">
                <t-input-number
                  v-model="globalCardsPerRow"
                  :min="2"
                  :max="12"
                  theme="column"
                  size="small"
                  style="width: 100px"
                />
              </div>
            </div>

            <!-- 显示选项开关 -->
            <div class="settings-panel__row settings-panel__row--toggles">
              <div class="settings-panel__label">显示选项</div>
              <div class="settings-panel__toggles">
                <t-switch v-model="displayOptions.showIcon" size="small">
                  <template #label>图标</template>
                </t-switch>
                <t-switch v-model="displayOptions.showTitle" size="small">
                  <template #label>标题</template>
                </t-switch>
                <t-switch v-model="displayOptions.showDescription" size="small">
                  <template #label>描述</template>
                </t-switch>
                <t-switch v-model="displayOptions.showHoverEffect" size="small">
                  <template #label>悬浮效果</template>
                </t-switch>
                <t-switch v-model="displayOptions.showContent" size="small">
                  <template #label>内容区</template>
                </t-switch>
                <t-switch v-model="displayOptions.showGroupTag" size="small">
                  <template #label>分组标签</template>
                </t-switch>
              </div>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>

    <!-- 书签分组展示 -->
    <div v-if="selectedGroups.length > 0" class="bookmark-zch__content">
      <template v-for="groupKey in selectedGroups" :key="groupKey">
        <div v-if="getFilteredGroupBookmarks(groupKey).length > 0" class="bookmark-zch__group">
          <div class="bookmark-zch__group-header">
            <div class="bookmark-zch__group-left">
              <h3 class="bookmark-zch__group-title">
                <folder-open-icon class="bookmark-zch__group-icon" />
                {{ bookmarkDataZch[groupKey].title }}
              </h3>
              <!-- 每行数量控制器 -->
              <div class="bookmark-zch__group-counter">
                <t-button
                  size="small"
                  variant="text"
                  shape="square"
                  :disabled="getGroupCardsPerRow(groupKey) <= 2"
                  @click="decreaseGroupCardsPerRow(groupKey)"
                >
                  <remove-icon />
                </t-button>
                <span class="bookmark-zch__group-counter-value">{{ getGroupCardsPerRow(groupKey) }}</span>
                <t-button
                  size="small"
                  variant="text"
                  shape="square"
                  :disabled="getGroupCardsPerRow(groupKey) >= 12"
                  @click="increaseGroupCardsPerRow(groupKey)"
                >
                  <add-icon />
                </t-button>
              </div>
            </div>
            <t-tag v-if="displayOptions.showGroupTag" size="small" theme="primary" variant="light">
              {{ getFilteredGroupBookmarks(groupKey).length }}
            </t-tag>
          </div>

          <div v-if="displayOptions.showContent" class="bookmark-zch__group-content">
            <t-row :gutter="[12, 12]">
              <t-col
                v-for="bookmark in getFilteredGroupBookmarks(groupKey)"
                :key="bookmark.url"
                :span="getColSpan(groupKey)"
              >
                <bookmark-card :bookmark="bookmark" :display-options="cardDisplayOptions" />
              </t-col>
            </t-row>
          </div>
        </div>
      </template>
    </div>

    <!-- 空状态 -->
    <div v-else class="bookmark-zch__empty">
      <t-empty theme="default" title="暂无选中分组" description="请在设置面板中选择要显示的书签分组" />
    </div>

    <!-- 已选分组弹窗 -->
    <t-dialog v-model:visible="showSelectedDialog" header="管理书签分组" width="600px">
      <div class="selected-groups-dialog">
        <t-checkbox-group v-model="selectedGroups">
          <div class="selected-groups-list">
            <div v-for="[key, group] in Object.entries(bookmarkDataZch)" :key="key" class="selected-groups-item">
              <t-checkbox :value="key">
                {{ group.title }}
                <t-tag size="small" theme="default" variant="light" style="margin-left: 8px">
                  {{ group.links.length }}
                </t-tag>
              </t-checkbox>
            </div>
          </div>
        </t-checkbox-group>
      </div>
      <template #footer>
        <div class="selected-groups-footer">
          <t-button theme="default" variant="outline" @click="selectAll">全选</t-button>
          <t-button theme="default" variant="outline" @click="clearSelection">清空</t-button>
          <t-button theme="default" variant="outline" @click="invertSelection">反选</t-button>
          <t-button theme="primary" @click="saveAndClose">确定</t-button>
        </div>
      </template>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import {
  AddIcon,
  CheckDoubleIcon,
  ClearIcon,
  FolderOpenIcon,
  RemoveIcon,
  RollbackIcon,
  SaveIcon,
  SearchIcon,
  SettingIcon,
  SwapIcon,
  ViewListIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import BookmarkCard from '@/components/bookmark-card/index.vue';
import { bookmarkDataZch } from '@/constants/bookmarks-zch';

defineOptions({
  name: 'BookmarkZch',
});

// 搜索值
const searchValue = ref('');

// 选中的分组
const selectedGroups = ref<string[]>([]);

// 显示已选分组弹窗
const showSelectedDialog = ref(false);

// 设置面板展开状态
const settingsPanelExpanded = ref<string[]>([]);

// 全局每行卡片数
const globalCardsPerRow = ref(4);

// 每个分组的每行卡片数
const groupCardsPerRow = reactive<Record<string, number>>({});

// 显示选项
const displayOptions = reactive({
  showIcon: true,
  showTitle: true,
  showDescription: true,
  showHoverEffect: true,
  showContent: true,
  showGroupTag: true,
});

// 传递给卡片组件的显示选项
const cardDisplayOptions = computed(() => ({
  showIcon: displayOptions.showIcon,
  showTitle: displayOptions.showTitle,
  showDescription: displayOptions.showDescription,
  showHoverEffect: displayOptions.showHoverEffect,
}));

// 获取分组的每行卡片数
const getGroupCardsPerRow = (groupKey: string): number => {
  return groupCardsPerRow[groupKey] ?? globalCardsPerRow.value;
};

// 增加分组每行卡片数
const increaseGroupCardsPerRow = (groupKey: string) => {
  const current = getGroupCardsPerRow(groupKey);
  if (current < 12) {
    groupCardsPerRow[groupKey] = current + 1;
  }
};

// 减少分组每行卡片数
const decreaseGroupCardsPerRow = (groupKey: string) => {
  const current = getGroupCardsPerRow(groupKey);
  if (current > 2) {
    groupCardsPerRow[groupKey] = current - 1;
  }
};

// 根据每行卡片数计算 col span
const getColSpan = (groupKey: string): number => {
  const cardsPerRow = getGroupCardsPerRow(groupKey);
  return Math.floor(12 / cardsPerRow);
};

// 获取过滤后的某个分组的书签
const getFilteredGroupBookmarks = (groupKey: string) => {
  const group = bookmarkDataZch[groupKey];
  if (!group) return [];

  if (!searchValue.value) {
    return group.links;
  }

  const search = searchValue.value.toLowerCase();
  return group.links.filter(
    (link) => link.title.toLowerCase().includes(search) || link.url.toLowerCase().includes(search),
  );
};

// 过滤后的所有书签数量
const filteredBookmarks = computed(() => {
  return selectedGroups.value.flatMap((groupKey) => getFilteredGroupBookmarks(groupKey));
});

// 全选
const selectAll = () => {
  selectedGroups.value = Object.keys(bookmarkDataZch);
};

// 清空选择
const clearSelection = () => {
  selectedGroups.value = [];
};

// 反选
const invertSelection = () => {
  const allKeys = Object.keys(bookmarkDataZch);
  selectedGroups.value = allKeys.filter((key) => !selectedGroups.value.includes(key));
};

// 保存并关闭弹窗
const saveAndClose = () => {
  localStorage.setItem('bookmarkSelectedGroups', JSON.stringify(selectedGroups.value));
  showSelectedDialog.value = false;
};

// 保存显示设置
const saveDisplaySettings = () => {
  const settings = {
    displayOptions: { ...displayOptions },
    globalCardsPerRow: globalCardsPerRow.value,
    groupCardsPerRow: { ...groupCardsPerRow },
  };
  localStorage.setItem('bookmarkDisplaySettings', JSON.stringify(settings));
  MessagePlugin.success('设置已保存');
};

// 重置显示设置
const resetDisplaySettings = () => {
  displayOptions.showIcon = true;
  displayOptions.showTitle = true;
  displayOptions.showDescription = true;
  displayOptions.showHoverEffect = true;
  displayOptions.showContent = true;
  displayOptions.showGroupTag = true;
  globalCardsPerRow.value = 4;
  Object.keys(groupCardsPerRow).forEach((key) => {
    delete groupCardsPerRow[key];
  });
  localStorage.removeItem('bookmarkDisplaySettings');
  MessagePlugin.success('设置已重置');
};

// 监听选中分组变化，自动保存
watch(
  selectedGroups,
  (newVal) => {
    localStorage.setItem('bookmarkSelectedGroups', JSON.stringify(newVal));
  },
  { deep: true },
);

// 初始化时从 localStorage 读取
onMounted(() => {
  // 读取选中分组
  const savedGroups = localStorage.getItem('bookmarkSelectedGroups');
  if (savedGroups) {
    try {
      const parsed = JSON.parse(savedGroups);
      if (Array.isArray(parsed)) {
        selectedGroups.value = parsed.filter((key) => bookmarkDataZch[key]);
      }
    } catch {
      selectedGroups.value = Object.keys(bookmarkDataZch);
    }
  } else {
    selectedGroups.value = Object.keys(bookmarkDataZch);
  }

  // 读取显示设置
  const savedSettings = localStorage.getItem('bookmarkDisplaySettings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.displayOptions) {
        Object.assign(displayOptions, settings.displayOptions);
      }
      if (settings.globalCardsPerRow) {
        globalCardsPerRow.value = settings.globalCardsPerRow;
      }
      if (settings.groupCardsPerRow) {
        Object.assign(groupCardsPerRow, settings.groupCardsPerRow);
      }
    } catch {
      // 忽略解析错误
    }
  }
});
</script>
<style lang="less" scoped>
.bookmark-zch {
  &__toolbar {
    margin-bottom: 20px;
  }

  &__settings-collapse {
    background: var(--td-bg-color-container);
    border-radius: 8px;
    border: 1px solid var(--td-component-stroke);

    :deep(.t-collapse-panel__header) {
      padding: 10px 16px;
    }

    :deep(.t-collapse-panel__content) {
      padding: 0 16px 16px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__group {
    background: var(--td-bg-color-container);
    border-radius: 10px;
    padding: 16px;
    border: 1px solid var(--td-component-stroke);
  }

  &__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--td-component-stroke);
  }

  &__group-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  &__group-icon {
    color: var(--td-brand-color);
    font-size: 16px;
  }

  &__group-counter {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 6px;
    padding: 2px 4px;
  }

  &__group-counter-value {
    min-width: 22px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  &__group-content {
    // 书签卡片区域
    border-radius: 5px;
  }

  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background: var(--td-bg-color-container);
    border-radius: 10px;
    border: 1px solid var(--td-component-stroke);
  }
}

.settings-collapse-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.settings-collapse-actions {
  display: flex;
  gap: 8px;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;

    &--toggles {
      align-items: flex-start;
    }
  }

  &__label {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    min-width: 70px;
    flex-shrink: 0;
  }

  &__control {
    display: flex;
    align-items: center;
    gap: 8px;

    &--full {
      flex-wrap: wrap;
    }

    &--search {
      flex: 1;
      max-width: 300px;
    }
  }

  &__toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;

    :deep(.t-switch__label) {
      font-size: 12px;
      color: var(--td-text-color-primary);
    }
  }
}

.selected-groups-dialog {
  max-height: 400px;
  overflow-y: auto;
}

.selected-groups-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.selected-groups-item {
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--td-bg-color-secondarycontainer);

  &:hover {
    background: var(--td-bg-color-secondarycontainer-hover);
  }
}

.selected-groups-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
