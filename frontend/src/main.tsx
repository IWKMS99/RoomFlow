import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom';

import './index.css';

import Layout from './components/Layout.tsx';
import SchedulePage from './pages/SchedulePage.tsx';
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import BookingPage from './pages/BookingPage.tsx';
import ConfirmationPage from './pages/ConfirmationPage.tsx';

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
            },
            {
                path: 'booking/new',
                element: <BookingPage/>
            },
            {
                path: 'booking/confirmed',
                element: <ConfirmationPage/>
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
);