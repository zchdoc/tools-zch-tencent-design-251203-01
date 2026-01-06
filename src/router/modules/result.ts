/**
 * 结果页路由 - 已迁移到后端动态路由
 *
 * 原有路由已注释，现在从后端 /api/sys/menu/list-i18n 获取
 * 如需恢复前端固定路由，取消下方注释即可
 */

// import Layout from '@/layouts/index.vue';

// export default [
//   {
//     path: '/result',
//     name: 'result',
//     component: Layout,
//     redirect: '/result/success',
//     meta: {
//       title: {
//         zh_CN: '结果页',
//         en_US: 'Result',
//       },
//       icon: 'check-circle',
//     },
//     children: [
//       {
//         path: 'success',
//         name: 'ResultSuccess',
//         component: () => import('@/pages/result/success/index.vue'),
//         meta: { title: { zh_CN: '成功页', en_US: 'Success' } },
//       },
//       {
//         path: 'fail',
//         name: 'ResultFail',
//         component: () => import('@/pages/result/fail/index.vue'),
//         meta: { title: { zh_CN: '失败页', en_US: 'Fail' } },
//       },
//       // ... 其他结果页子路由
//     ],
//   },
// ];

// 导出空数组，路由由后端动态提供
export default [];
