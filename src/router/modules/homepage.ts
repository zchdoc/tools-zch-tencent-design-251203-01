/**
 * 仪表盘路由 - 已迁移到后端动态路由
 *
 * 原有路由已注释，现在从后端 /api/sys/menu/list-i18n 获取
 * 如需恢复前端固定路由，取消下方注释即可
 */

// import { DashboardIcon } from 'tdesign-icons-vue-next';
// import { shallowRef } from 'vue';
// import Layout from '@/layouts/index.vue';

// export default [
//   {
//     path: '/dashboard',
//     component: Layout,
//     redirect: '/dashboard/base',
//     name: 'dashboard',
//     meta: {
//       title: {
//         zh_CN: '仪表盘',
//         en_US: 'Dashboard',
//       },
//       icon: shallowRef(DashboardIcon),
//       orderNo: 0,
//     },
//     children: [
//       {
//         path: 'base',
//         name: 'DashboardBase',
//         component: () => import('@/pages/dashboard/base/index.vue'),
//         meta: {
//           title: {
//             zh_CN: '概览仪表盘',
//             en_US: 'Overview',
//           },
//         },
//       },
//       {
//         path: 'detail',
//         name: 'DashboardDetail',
//         component: () => import('@/pages/dashboard/detail/index.vue'),
//         meta: {
//           title: {
//             zh_CN: '统计报表',
//             en_US: 'Dashboard Detail',
//           },
//         },
//       },
//     ],
//   },
// ];

// 导出空数组，路由由后端动态提供
export default [];
