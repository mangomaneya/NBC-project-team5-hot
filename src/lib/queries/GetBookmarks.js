import useAuthStore from '@/store/zustand/authStore';
import supabase from '@api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';

export const useGetBookmarks = () => {
  const userData = useAuthStore((state) => state.userData);
  const userId = userData.userId; // 현재 로그인 한 사용자의 ID

  const getBookmarks = async () => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, hotplaces(name, img_url)')
      .eq('user_id', userId); // 현재 로그인 한 사용자의 북마크 리스트
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!userId,
  });
};
