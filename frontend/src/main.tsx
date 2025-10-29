import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import SchedulePage from './pages/SchedulePage.tsx'
import MyBookingsPage from './pages/MyBookingsPage.tsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/schedule" replace />
    },
    {
        path: '/schedule',
        element: <SchedulePage />
    },
    {
        path: '/my-bookings',
        element: <MyBookingsPage />
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)