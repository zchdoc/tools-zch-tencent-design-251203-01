import { ToolsIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/tools',
    component: Layout,
    redirect: '/tools/timestamp-converter',
    name: 'tools',
    meta: {
      title: {
        zh_CN: '工具',
        en_US: 'Tools',
      },
      icon: shallowRef(ToolsIcon),
      orderNo: 2,
    },
    children: [
      {
        path: 'timestamp-converter',
        name: 'TimestampConverter',
        component: () => import('@/pages/tools/timestamp-converter/index.vue'),
        meta: {
          title: {
            zh_CN: '时间戳转换',
            en_US: 'Timestamp Converter',
          },
        },
      },
    ],
  },
];
