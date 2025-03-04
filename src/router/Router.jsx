import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { PATH } from '@constants/path-constant';
import Home from '@pages/Home';
import BookMark from '@/pages/BookMark';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
const { LOGIN, SIGN_UP, BOOK_MARK } = PATH;
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={LOGIN} element={<Login />} />
          <Route path={SIGN_UP} element={<SignUp />} />
          <Route path={BOOK_MARK} element={<BookMark />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
