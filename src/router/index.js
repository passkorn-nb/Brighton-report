import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'ReportExport',
        component: () => import('@/views/ReportExportPage.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
