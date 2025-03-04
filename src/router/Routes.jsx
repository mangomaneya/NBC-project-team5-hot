import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PATH } from '@/constants/path-constant';
import Home from '@/pages/Home';
import ProtectedRouter from '@router/ProtectedRouter';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import BookMark from '@/pages/BookMark';
import NotFoundedPage from '@/pages/NotFoundedPage';
import { useEffect } from 'react';
import supabase from '@api/supabaseAPI';
const { LOGIN, SIGN_UP, HOME, BOOK_MARK } = PATH;

function Routes() {
  useEffect(() => {
    // Supabase 토큰이 갱신된 케이스에만 콘솔로그로 알림
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('액세스 토큰이 갱신되었습니다.');
      }
    });

    return () => {
      authListener.subscription.unsubscribe(); // cleanup - 구독해제
    };
  }, []);

  const AuthenticatedRouter = [
    {
      path: HOME,
      element: <Layout />,
      children: [
        { path: '', element: <Home /> },
        {
          path: '',
          element: <ProtectedRouter />,
          children: [
            {
              path: BOOK_MARK,
              element: <BookMark />, //북마크 페이지 경로 추가
            },
          ],
        },
        {
          path: SIGN_UP,
          element: <SignUp />,
        },
        {
          path: LOGIN,
          element: <Login />,
        },
        {
          path: '*',
          element: <NotFoundedPage />,
        },
      ],
    },
  ];

  const router = createBrowserRouter([...AuthenticatedRouter]);
  return <RouterProvider router={router} />;
}

export default Routes;
