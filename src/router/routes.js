
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/moj-grafik.vue') },
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '/dane', component: () => import('pages/Dane.vue') },
      { path: '/pracownicy', component: () => import('pages/pracownicy.vue') },
      { path: '/pracownik', component: () => import('pages/pracownik.vue') },
      { path: '/grafiki', component: () => import('pages/grafiki.vue') },
      { path: '/grafik', component: () => import('pages/grafik.vue') },
      { path: '/grafik-moj', component: () => import('pages/moj-grafik.vue') },
      { path: '/stanowiska', component: () => import('pages/stanowiska.vue') },
      { path: '/stanowisko', component: () => import('pages/stanowisko.vue') },
      { path: '/urlopy', component: () => import('pages/urlopy.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '*', component: () => import('pages/Error404.vue') },
    ]
  })
}

export default routes
