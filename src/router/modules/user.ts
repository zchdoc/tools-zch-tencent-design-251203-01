/**
 * 用户中心和登录页路由 - 已迁移到后端动态路由
 *
 * 原有路由已注释，现在从后端 /api/sys/menu/list-i18n 获取
 * 如需恢复前端固定路由，取消下方注释即可
 */

// import { LogoutIcon } from 'tdesign-icons-vue-next';
// import { shallowRef } from 'vue';
// import Layout from '@/layouts/index.vue';

// export default [
//   {
//     path: '/user',
//     name: 'user',
//     component: Layout,
//     redirect: '/user/index',
//     meta: { title: { zh_CN: '个人中心', en_US: 'User Center' }, icon: 'user-circle' },
//     children: [
//       {
//         path: 'index',
//         name: 'UserIndex',
//         component: () => import('@/pages/user/index.vue'),
//         meta: { title: { zh_CN: '个人中心', en_US: 'User Center' } },
//       },
//     ],
//   },
//   {
//     path: '/loginRedirect',
//     name: 'loginRedirect',
//     redirect: '/login',
//     meta: { title: { zh_CN: '登录页', en_US: 'Login' }, icon: shallowRef(LogoutIcon) },
//     component: () => import('@/layouts/blank.vue'),
//     children: [
//       {
//         path: 'index',
//         redirect: '/login',
//         component: () => import('@/layouts/blank.vue'),
//         meta: { title: { zh_CN: '登录页', en_US: 'Login' } },
//       },
//     ],
//   },
// ];

// 导出空数组，路由由后端动态提供
export default [];
