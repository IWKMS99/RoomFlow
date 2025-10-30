import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom';

import './index.css';
import {AuthProvider} from './context/AuthContext.tsx';

import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import SchedulePage from './pages/SchedulePage.tsx';
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import BookingPage from './pages/BookingPage.tsx';
import ConfirmationPage from './pages/ConfirmationPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage/>
    },
    {
        path: '/register',
        element: <RegisterPage/>
    },
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
                element: <ProtectedRoute/>,
                children: [
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
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </React.StrictMode>,
);