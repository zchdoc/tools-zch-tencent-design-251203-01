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
      {
        path: 'data-formatter',
        name: 'DataFormatter',
        component: () => import('@/pages/tools/data-formatter/index.vue'),
        meta: {
          title: {
            zh_CN: '数据格式化',
            en_US: 'Data Formatter',
          },
        },
      },
      {
        path: 'number-converter',
        name: 'NumberConverter',
        component: () => import('@/pages/tools/number-converter/index.vue'),
        meta: {
          title: {
            zh_CN: '进制转换',
            en_US: 'Number Converter',
          },
        },
      },
      {
        path: 'rmb-converter',
        name: 'RmbConverter',
        component: () => import('@/pages/tools/rmb-converter/index.vue'),
        meta: {
          title: {
            zh_CN: '人民币大小写转换',
            en_US: 'RMB Case Converter',
          },
        },
      },
      {
        path: 'pulse-calculator',
        name: 'PulseCalculator',
        component: () => import('@/pages/tools/pulse-calculator/index.vue'),
        meta: {
          title: {
            zh_CN: '水控费率计算器',
            en_US: 'Water Pulse Rate Calculator',
          },
        },
      },
      {
        path: 'ip-checker',
        name: 'IpChecker',
        component: () => import('@/pages/tools/ip-checker/index.vue'),
        meta: {
          title: {
            zh_CN: 'IP 地址检测',
            en_US: 'IP Address Checker',
          },
        },
      },
      {
        path: 'random-generator',
        name: 'RandomGenerator',
        component: () => import('@/pages/tools/random-generator/index.vue'),
        meta: {
          title: {
            zh_CN: '随机数生成',
            en_US: 'Random Generator',
          },
        },
      },
    ],
  },
];
