import { create } from 'zustand';

const useAreaStore = create((set) => ({
  selectedArea: '성수동', // 초기값이 빈 값이면 새로고침 시 무한 렌더링
  mapCenter: { lat: 37.5487477114048, lon: 127.04589900432654 }, // 지도 중심 상태
  setSelectedArea: (area) => set({ selectedArea: area }),
  setMapCenter: (lat, lon) => set({ mapCenter: { lat, lon } }), // 지도 중심 변경 함수
}));

export default useAreaStore;
