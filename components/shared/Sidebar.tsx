// import {
//   CodeBracketIcon,
//   Cog6ToothIcon,
//   LockClosedIcon,
//   RectangleStackIcon,
//   UserCircleIcon,
//   UsersIcon
// } from '@heroicons/react/24/outline';
// import { forwardRef } from 'react';
// import { useTranslation } from 'next-i18next';
// import {
//   QueueListIcon
// } from "@heroicons/react/24/solid";
// import useTeams from 'hooks/useTeams';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import React, { useEffect } from 'react';
// import Icon from './Icon';

// import TeamDropdown from './TeamDropdown';
// import SidebarItem, { type SidebarMenuItem } from './SidebarItem';

// interface SidebarMenus {
//   [key: string]: SidebarMenuItem[];
// }

// export default forwardRef<HTMLElement, { isCollapsed: boolean }>(
//   function Sidebar({ isCollapsed }, ref) {
//     const router = useRouter();
//     const { t } = useTranslation('common');
//     const { slug } = router.query;

//     useEffect(() => {
//       if (typeof slug === 'string') {
//         document.title = `Unicis Platform - ${slug}`
//       } else {
//         document.title = 'Unicis Platform';
//       }

//       return () => {
//         document.title = 'Unicis Platform';
//       };
//     }, [slug])

//     const sidebarMenus: SidebarMenus = {
//       personal: [
//         {
//           name: t('all-teams'),
//           href: '/teams',
//           icon: RectangleStackIcon,
//         },
//         {
//           name: t('account'),
//           href: '/settings/account',
//           icon: UserCircleIcon,
//         },
//         {
//           name: t('password'),
//           href: '/settings/password',
//           icon: LockClosedIcon,
//         },
//       ],
//       team: [
//         {
//           name: t('all-tasks'),
//           href: `/teams/${slug}/tasks`,
//           icon: QueueListIcon,
//           className: "fill-blue-600"
//         },
//         {
//           name: t('rpa-activities'),
//           href: `/teams/${slug}/rpa`,
//           icon: () => <Icon src="/unicis-rpa-logo.png" />,
//         },
//         {
//           name: t('tia'),
//           href: `/teams/${slug}/tia`,
//           icon: () => <Icon src="/unicis-tia-logo.png" />,
//         },
//         {
//           name: t('csc'),
//           href: `/teams/${slug}/csc`,
//           icon: () => <Icon src="/unicis-csc-logo.png" />,
//         },
//         // {
//         //   name: t('iap'),
//         //   href: `/teams/${slug}/iap`,
//         //   icon: () => <Icon src="/unicis-iap-logo.png" />
//         // },
//         {
//           name: t('all-products'),
//           href: 'https://www.unicis.tech/docs',
//           icon: CodeBracketIcon,
//         },
//         {
//           name: t('settings'),
//           href: `/teams/${slug}/settings`,
//           icon: Cog6ToothIcon,
//         },
//       ],
//     };

//     const menus = sidebarMenus[slug ? 'team' : 'personal'];

//     return (
//       <>
//         <aside
//           className="transition-width fixed top-0 left-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-12 duration-75 lg:flex"
//           aria-label="Sidebar"
//         >
//           <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0 dark:border-gray-600 dark:bg-black">
//             <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
//               <div className="flex-1 space-y-1 divide-y bg-white dark:border-gray-600 bg-white dark:bg-black">
//                 <TeamDropdown />
//                 <div className="p-4 dark:border-gray-600">
//                   <ul className="space-y-1">
//                     {menus.map((menu) => (
//                       <li key={menu.name}>
//                         <SidebarItem
//                           href={menu.href}
//                           name={t(menu.name)}
//                           icon={menu.icon}
//                           active={router.asPath === menu.href}
//                           items={menu.items}
//                         />
//                         <div className="flex-1">
//                           <div className="mt-1 space-y-1">
//                             {menu?.items?.map((submenu) => (
//                               <SidebarItem
//                                 key={submenu.name}
//                                 href={submenu.href}
//                                 name={submenu.name}
//                                 active={router.asPath === submenu.href}
//                                 className="pl-8"
//                               />
//                             ))}
//                           </div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </aside>
//         <div
//           className="fixed inset-0 z-10 hidden bg-gray-900 opacity-50"
//           id="sidebarBackdrop"
//         />
//       </>
//     );
//   }
// );
