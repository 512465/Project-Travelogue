import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ReviewList = lazy(() => import('../pages/ReviewList'));
const ReviewDetail = lazy(() => import('../pages/ReviewDetail'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Login />
      </Suspense>
    ),
    errorElement: <ErrorBoundary><Suspense fallback={<div>加载中...</div>}><Login /></Suspense></ErrorBoundary>,
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
        element: <ErrorBoundary><Suspense fallback={<div>加载中...</div>}><Dashboard /></Suspense></ErrorBoundary>,
      },
      {
        path: 'reviews',
        element: <ErrorBoundary><Suspense fallback={<div>加载中...</div>}><ReviewList /></Suspense></ErrorBoundary>,
      },
      {
        path: 'reviews/:id',
        element: <ErrorBoundary><Suspense fallback={<div>加载中...</div>}><ReviewDetail /></Suspense></ErrorBoundary>,
      },
    ],
  },
]);

export default router;