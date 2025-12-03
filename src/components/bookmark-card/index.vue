<template>
  <t-card
    class="bookmark-card"
    :class="{ 'bookmark-card--no-hover': !displayOptions.showHoverEffect }"
    :bordered="false"
    :hover-shadow="displayOptions.showHoverEffect"
    @click="handleClick"
  >
    <template #header>
      <div class="bookmark-card__header" :class="{ 'bookmark-card__header--no-icon': !displayOptions.showIcon }">
        <div v-if="displayOptions.showIcon" class="bookmark-card__icon">
          <t-avatar size="36px" shape="round" :style="{ background: getIconBgColor(bookmark.title) }">
            <template #icon>
              <component :is="getIcon(bookmark.title)" />
            </template>
          </t-avatar>
        </div>
        <div v-if="displayOptions.showTitle || displayOptions.showDescription" class="bookmark-card__info">
          <div v-if="displayOptions.showTitle" class="bookmark-card__title" :title="bookmark.title">
            {{ bookmark.title }}
          </div>
          <div v-if="displayOptions.showDescription" class="bookmark-card__url" :title="bookmark.url">
            {{ formatUrl(bookmark.url) }}
          </div>
        </div>
      </div>
    </template>
  </t-card>
</template>
<script setup lang="ts">
import {
  BookmarkIcon,
  BrowseIcon,
  ChatIcon,
  CloudIcon,
  CodeIcon,
  ControlPlatformIcon,
  DataBaseIcon,
  DesktopIcon,
  EarthIcon,
  FilePasteIcon,
  GitRepositoryIcon,
  HomeIcon,
  LinkIcon,
  MailIcon,
  RootListIcon,
  SearchIcon,
  ServerIcon,
  SettingIcon,
  StarIcon,
  ToolsIcon,
  TranslateIcon,
  UserCircleIcon,
} from 'tdesign-icons-vue-next';
import type { Component, PropType } from 'vue';

import type { BookmarkLink } from '@/constants/bookmarks-zch';

// 显示选项接口
export interface BookmarkDisplayOptions {
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showHoverEffect: boolean;
}

const props = defineProps({
  bookmark: {
    type: Object as PropType<BookmarkLink>,
    required: true,
  },
  displayOptions: {
    type: Object as PropType<BookmarkDisplayOptions>,
    default: () => ({
      showIcon: true,
      showTitle: true,
      showDescription: true,
      showHoverEffect: true,
    }),
  },
});

// 根据标题获取对应图标
const getIcon = (title: string): Component => {
  const lowerTitle = title.toLowerCase();

  // AI 相关
  if (
    lowerTitle.includes('grok') ||
    lowerTitle.includes('openai') ||
    lowerTitle.includes('claude') ||
    lowerTitle.includes('gemini') ||
    lowerTitle.includes('deepseek') ||
    lowerTitle.includes('tongyi') ||
    lowerTitle.includes('qwen') ||
    lowerTitle.includes('chat') ||
    lowerTitle.includes('ai')
  ) {
    return ChatIcon;
  }

  // Git 相关
  if (
    lowerTitle.includes('git') ||
    lowerTitle.includes('github') ||
    lowerTitle.includes('gitee') ||
    lowerTitle.includes('gitlab')
  ) {
    return GitRepositoryIcon;
  }

  // 搜索引擎
  if (
    lowerTitle.includes('google') ||
    lowerTitle.includes('bing') ||
    lowerTitle.includes('baidu') ||
    lowerTitle.includes('duckduck') ||
    lowerTitle.includes('sogou') ||
    lowerTitle.includes('search')
  ) {
    return SearchIcon;
  }

  // 翻译
  if (
    lowerTitle.includes('translate') ||
    lowerTitle.includes('youdao') ||
    lowerTitle.includes('deepl') ||
    lowerTitle.includes('cambridge') ||
    lowerTitle.includes('oxford') ||
    lowerTitle.includes('immersive')
  ) {
    return TranslateIcon;
  }

  // 社交媒体
  if (
    lowerTitle.includes('x') ||
    lowerTitle.includes('twitter') ||
    lowerTitle.includes('telegram') ||
    lowerTitle.includes('discord') ||
    lowerTitle.includes('reddit') ||
    lowerTitle.includes('ins') ||
    lowerTitle.includes('bsky') ||
    lowerTitle.includes('zhihu')
  ) {
    return UserCircleIcon;
  }

  // 工具
  if (
    lowerTitle.includes('tool') ||
    lowerTitle.includes('calc') ||
    lowerTitle.includes('convert') ||
    lowerTitle.includes('generate') ||
    lowerTitle.includes('random')
  ) {
    return ToolsIcon;
  }

  // 服务器/登录
  if (lowerTitle.includes('login') || lowerTitle.includes('server') || lowerTitle.includes('client')) {
    return ServerIcon;
  }

  // 数据库/查询
  if (lowerTitle.includes('query') || lowerTitle.includes('database')) {
    return DataBaseIcon;
  }

  // 书签
  if (lowerTitle.includes('bookmark')) {
    return BookmarkIcon;
  }

  // 代码
  if (lowerTitle.includes('code') || lowerTitle.includes('dev')) {
    return CodeIcon;
  }

  // 云服务
  if (lowerTitle.includes('cloud') || lowerTitle.includes('vercel')) {
    return CloudIcon;
  }

  // 浏览器
  if (lowerTitle.includes('chrome') || lowerTitle.includes('browser')) {
    return BrowseIcon;
  }

  // 网络
  if (lowerTitle.includes('net') || lowerTitle.includes('ip')) {
    return EarthIcon;
  }

  // 排行榜
  if (lowerTitle.includes('ranking') || lowerTitle.includes('leaderboard')) {
    return RootListIcon;
  }

  // 平台/控制台
  if (lowerTitle.includes('platform') || lowerTitle.includes('console') || lowerTitle.includes('studio')) {
    return ControlPlatformIcon;
  }

  // 桌面应用
  if (lowerTitle.includes('desktop') || lowerTitle.includes('local')) {
    return DesktopIcon;
  }

  // 邮件
  if (lowerTitle.includes('mail') || lowerTitle.includes('email')) {
    return MailIcon;
  }

  // 首页
  if (lowerTitle.includes('home') || lowerTitle.includes('index')) {
    return HomeIcon;
  }

  // 设置
  if (lowerTitle.includes('setting') || lowerTitle.includes('config')) {
    return SettingIcon;
  }

  // 收藏
  if (lowerTitle.includes('star') || lowerTitle.includes('favorite')) {
    return StarIcon;
  }

  // 复制/粘贴
  if (lowerTitle.includes('copy') || lowerTitle.includes('paste') || lowerTitle.includes('dup')) {
    return FilePasteIcon;
  }

  // 默认图标
  return LinkIcon;
};

// 根据标题生成图标背景色
const getIconBgColor = (title: string): string => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
  ];

  // 根据标题计算一个稳定的索引
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// 格式化 URL 显示
const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url.substring(0, 30) + (url.length > 30 ? '...' : '');
  }
};

// 点击卡片打开链接
const handleClick = () => {
  window.open(props.bookmark.url, '_blank');
};
</script>
<style lang="less" scoped>
.bookmark-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-stroke);
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgb(0 0 0 / 8%);
  }

  &--no-hover {
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  :deep(.t-card__header) {
    padding: 12px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    overflow: hidden;

    &--no-icon {
      justify-content: center;
    }
  }

  &__icon {
    flex-shrink: 0;

    :deep(.t-avatar) {
      color: #fff;
      font-size: 16px;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  &__url {
    font-size: 11px;
    color: var(--td-text-color-placeholder);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
    line-height: 1.4;
  }
}
</style>
