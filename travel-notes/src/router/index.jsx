import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ReviewList from '../pages/ReviewList';
import ReviewDetail from '../pages/ReviewDetail';
import ErrorBoundary from '../components/ErrorBoundary';

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary><Login /></ErrorBoundary>,
  },
  {
    path: '/',
    element: <ErrorBoundary><Layout /></ErrorBoundary>,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
      },
      {
        path: 'reviews',
        element: <ErrorBoundary><ReviewList /></ErrorBoundary>,
      },
      {
        path: 'reviews/:id',
        element: <ErrorBoundary><ReviewDetail /></ErrorBoundary>,
      },
    ],
  },
]);

export default router;