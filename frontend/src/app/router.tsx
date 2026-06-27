import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { AdminRoute } from '@/components/AdminRoute'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminCategoriesPage } from '@/pages/AdminCategoriesPage'
import { BlogPage } from '@/pages/BlogPage'
import { CreatePostPage } from '@/pages/CreatePostPage'
import { EditPostPage } from '@/pages/EditPostPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PostPage } from '@/pages/PostPage'
import { RegisterPage } from '@/pages/RegisterPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'posts/new', element: <CreatePostPage /> },
          { path: 'posts/:id/edit', element: <EditPostPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [{ path: 'admin/categories', element: <AdminCategoriesPage /> }],
      },
      { path: 'posts/:id', element: <PostPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
