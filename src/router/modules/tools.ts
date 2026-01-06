/**
 * 工具路由 - 已迁移到后端动态路由
 *
 * 原有路由已注释，现在从后端 /api/sys/menu/list-i18n 获取
 * 如需恢复前端固定路由，取消下方注释即可
 */

// import { ToolsIcon } from 'tdesign-icons-vue-next';
// import { shallowRef } from 'vue';
// import Layout from '@/layouts/index.vue';

// export default [
//   {
//     path: '/tools',
//     component: Layout,
//     redirect: '/tools/timestamp-converter',
//     name: 'tools',
//     meta: {
//       title: {
//         zh_CN: '工具',
//         en_US: 'Tools',
//       },
//       icon: shallowRef(ToolsIcon),
//       orderNo: 2,
//     },
//     children: [
//       {
//         path: 'timestamp-converter',
//         name: 'TimestampConverter',
//         component: () => import('@/pages/tools/timestamp-converter/index.vue'),
//         meta: { title: { zh_CN: '时间戳转换', en_US: 'Timestamp Converter' } },
//       },
//       // ... 其他工具子路由
//     ],
//   },
// ];

// 导出空数组，路由由后端动态提供
export default [];
