<template>
  <div>
    <template v-for="item in list" :key="item.path">
      <template v-if="!item.children || !item.children.length || item.meta?.single">
        <t-menu-item v-if="getHref(item)" :name="item.path" :value="getPath(item)" @click="openHref(getHref(item)[0])">
          <template v-if="showIcon && item.icon" #icon>
            <t-icon :name="item.icon as string" />
          </template>
          {{ renderMenuTitle(item.title) }}
        </t-menu-item>
        <t-menu-item v-else :name="item.path" :value="getPath(item)" :to="item.path">
          <template v-if="showIcon && item.icon" #icon>
            <t-icon :name="item.icon as string" />
          </template>
          {{ renderMenuTitle(item.title) }}
        </t-menu-item>
      </template>
      <t-submenu v-else :name="item.path" :value="item.path" :title="renderMenuTitle(item.title)">
        <template v-if="showIcon && item.icon" #icon>
          <t-icon :name="item.icon as string" />
        </template>
        <menu-content v-if="item.children" :nav-data="item.children" :level="level + 1" />
      </t-submenu>
    </template>
  </div>
</template>
<script setup lang="tsx">
import { Icon as TIcon } from 'tdesign-icons-vue-next';
import type { PropType } from 'vue';
import { computed } from 'vue';

import { useLocale } from '@/locales/useLocale';
import { getActive } from '@/router';
import type { MenuRoute } from '@/types/interface';

const { navData, level } = defineProps({
  navData: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
  level: {
    type: Number,
    default: 0,
  },
});

/** 仅一级导航显示图标 */
const showIcon = computed(() => level === 1);

const active = computed(() => getActive());

const { locale } = useLocale();
const list = computed(() => {
  return getMenuList(navData);
});

const renderMenuTitle = (title: string | Record<string, string>) => {
  if (typeof title === 'string') return title;
  return title[locale.value];
};

const getMenuList = (list: MenuRoute[], basePath?: string): MenuRoute[] => {
  if (!list || list.length === 0) {
    return [];
  }
  // 如果meta中有orderNo则按照从小到大排序
  list.sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
  return list
    .map((item) => {
      const path = basePath && !item.path.includes(basePath) ? `${basePath}/${item.path}` : item.path;

      return {
        path,
        title: item.meta?.title,
        icon: item.meta?.icon,
        children: getMenuList(item.children, path),
        meta: item.meta,
        redirect: item.redirect,
      };
    })
    .filter((item) => item.meta && item.meta.hidden !== true);
};

const getHref = (item: MenuRoute) => {
  const { frameSrc, frameBlank } = item.meta;
  if (frameSrc && frameBlank) {
    return frameSrc.match(/(https?):\/\/([\w.]+)(?:\/\S*)?/);
  }
  return null;
};

const getPath = (item: MenuRoute) => {
  const activeLevel = active.value.split('/').length;
  const pathLevel = item.path.split('/').length;
  if (activeLevel > pathLevel && active.value.startsWith(item.path)) {
    return active.value;
  }

  if (active.value === item.path) {
    return active.value;
  }

  return item.meta?.single ? item.redirect : item.path;
};

const openHref = (url: string) => {
  window.open(url);
};
</script>
