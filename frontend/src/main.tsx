import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'

import Layout from './components/Layout.tsx'
import SchedulePage from './pages/SchedulePage.tsx'
import MyBookingsPage from './pages/MyBookingsPage.tsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <Navigate to="/schedule" replace/>
            },
            {
                path: 'schedule',
                element: <SchedulePage/>
            },
            {
                path: 'my-bookings',
                element: <MyBookingsPage/>
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
)