import { QUERY_KEYS } from '@/constants/query-keys';
import supabase from '@/lib/api/supabaseAPI';
import useAreaStore from '@/store/zustand/useAreaStore';
import { useQuery } from '@tanstack/react-query';
export const useGetHotplaces = ({ area = null } = {}) => {
  const { HOTPLACE } = QUERY_KEYS;
  const selectedArea = useAreaStore((state) => state.selectedArea);
  let query = supabase.from(HOTPLACE).select('*');
  if (area) query.eq('area', area);
  const getHotplaces = async () => {
    const { data, error } = await query; // area:현재 지역
    if (error) {
      throw new Error(error.message);
    }
    return data; // 현재 지역에 해당하는 area를 가진 테이블의 값들을 return
  };
  const filterArea = (places) => {
    return places.filter((place) => place.area === selectedArea);
  };

  return useQuery({
    queryKey: [HOTPLACE, selectedArea || 'default'], //selectedArea가 null 일 때는 default로 캐싱
    queryFn: getHotplaces,
    select: filterArea, // 가공한 값을 전달
    staleTime: 60 * 60 * 1000, //1시간
    enabled: !!area, // selectedArea가 존재할 때만 실행
  });
};
