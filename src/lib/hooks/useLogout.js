import supabase from '@api/supabaseAPI';
import { useNavigate } from 'react-router-dom';
import { openAlert } from '@utils/openAlert';
import { ALERT_TYPE } from '@/constants/alert-constant';
import { PATH } from '@/constants/path-constant';
import useAuthStore from '@/store/zustand/authStore';
const { SUCCESS, WARNING, ERROR } = ALERT_TYPE;
const { HOME } = PATH;

export default function useLogout() {
  const navigate = useNavigate();
  const resetUserData = useAuthStore((state) => state.resetUserData);

  const handleLogout = async () => {
    //로그아웃 confirm message
    const response = await openAlert({ type: WARNING, text: '정말 로그아웃 하시겠습니까', buttonText: '로그아웃' });

    // confirm 후 로그아웃 - 메인화면으로 이동
    if (response.isConfirmed) {
      openAlert({ type: SUCCESS, text: '정상적으로 로그아웃 되었습니다.' });
      const { error } = await supabase.auth.signOut();
      //전역상태 유저정보 리셋
      resetUserData();
      navigate(HOME, { replace: true });

      //에러발생시 alert (범용 메시지 적용)
      if (error) {
        openAlert({ type: ERROR, text: '알 수 없는 문제가 발생했습니다. 다시 시도해주세요.' });
        return;
      }
    }
  };
  return handleLogout;
}
