import { BookmarkIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/bookmark',
    component: Layout,
    redirect: '/bookmark/zch',
    name: 'bookmark',
    meta: {
      title: {
        zh_CN: '书签',
        en_US: 'Bookmark',
      },
      icon: shallowRef(BookmarkIcon),
      orderNo: 1,
    },
    children: [
      {
        path: 'zch',
        name: 'BookmarkZch',
        component: () => import('@/pages/bookmark/zch/index.vue'),
        meta: {
          title: {
            zh_CN: '常用',
            en_US: 'Zch',
          },
        },
      },
      {
        path: 'chrome',
        name: 'BookmarkChrome',
        component: () => import('@/pages/bookmark/zch/index.vue'), // 暂时复用 zch 页面，后续可替换
        meta: {
          title: {
            zh_CN: 'Chrome',
            en_US: 'Chrome',
          },
          hidden: true, // 暂时隐藏
        },
      },
      {
        path: 'zch-from-api',
        name: 'BookmarkZchFromApi',
        component: () => import('@/pages/bookmark/zch/index.vue'), // 暂时复用 zch 页面，后续可替换
        meta: {
          title: {
            zh_CN: 'ZchFromApi',
            en_US: 'ZchFromApi',
          },
          hidden: true, // 暂时隐藏
        },
      },
      {
        path: 'chrome-from-api',
        name: 'BookmarkChromeFromApi',
        component: () => import('@/pages/bookmark/zch/index.vue'), // 暂时复用 zch 页面，后续可替换
        meta: {
          title: {
            zh_CN: 'ChromeFromApi',
            en_US: 'ChromeFromApi',
          },
          hidden: true, // 暂时隐藏
        },
      },
    ],
  },
];
