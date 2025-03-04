import { QUERY_KEYS } from '@/constants/query-keys';
import supabase from '@/lib/api/supabaseAPI';
import useAreaStore from '@/store/zustand/useAreaStore';
import { useQuery } from '@tanstack/react-query';

export const useGetHotplaces = ({ area = null }) => {
  const { HOTPLACE } = QUERY_KEYS;
  const selectedArea = useAreaStore((state) => state.selectedArea);
  const getHotplaces = async () => {
    const { data, error } = await supabase.from('hotplaces').select('*').eq('area', selectedArea);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const filterArea = (places) => {
    const areaFilter = area || selectedArea;
    return areaFilter ? places.filter((place) => place.area === areaFilter) : places;
  };

  return useQuery({
    queryKey: selectedArea ? [HOTPLACE, selectedArea] : [HOTPLACE],
    queryFn: getHotplaces,
    select: filterArea,
    staleTime: 60 * 60 * 1000, //1시간
    enabled: !!selectedArea, // selectedArea가 존재할 때만 실행
  });
};
