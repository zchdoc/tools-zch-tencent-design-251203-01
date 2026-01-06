/**
 * 书签路由 - 已迁移到后端动态路由
 *
 * 原有路由已注释，现在从后端 /api/sys/menu/list-i18n 获取
 * 如需恢复前端固定路由，取消下方注释即可
 */

// import { BookmarkIcon } from 'tdesign-icons-vue-next';
// import { shallowRef } from 'vue';
// import Layout from '@/layouts/index.vue';

// export default [
//   {
//     path: '/bookmark',
//     component: Layout,
//     redirect: '/bookmark/zch',
//     name: 'bookmark',
//     meta: {
//       title: {
//         zh_CN: '书签',
//         en_US: 'Bookmark',
//       },
//       icon: shallowRef(BookmarkIcon),
//       orderNo: 1,
//     },
//     children: [
//       {
//         path: 'zch',
//         name: 'BookmarkZch',
//         component: () => import('@/pages/bookmark/zch/index.vue'),
//         meta: {
//           title: {
//             zh_CN: '常用书签',
//             en_US: 'Zch',
//           },
//         },
//       },
//       // ... 其他书签子路由
//     ],
//   },
// ];

// 导出空数组，路由由后端动态提供
export default [];
