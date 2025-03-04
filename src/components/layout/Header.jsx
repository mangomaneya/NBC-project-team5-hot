import { Link } from 'react-router-dom';
import Nav from './Nav';
import { PATH } from '@/constants/path-constant';

const { HOME } = PATH;

export default function Header() {
  return (
    <header className='flexCenter !justify-between bg-bg-primary py-[20px] px-[2%] w-full fixed top-0 left-0'>
      <h1 className='font-gugi text-3xl'>
        <Link to={HOME}>핫플 인 서울</Link>
      </h1>
      <Nav />
    </header>
  );
}
