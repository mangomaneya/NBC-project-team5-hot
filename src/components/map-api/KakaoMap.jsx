import { useEffect, useRef, useState } from 'react';
import supabase from '../../lib/api/supabaseAPI';
import MapController from './MapController';
import { openAlert } from '@/lib/utils/openAlert';
import { ALERT_TYPE } from '@/constants/alert-constant';
import useAreaStore from '@/store/zustand/useAreaStore';
import DetailModal from '../modal/detail-modal';
import YoutubeModal from '../modal/youtube-modal';

const { ERROR } = ALERT_TYPE;

function KakaoMap() {
  const mapContainer = useRef(null);
  const [markerData, setMarkerData] = useState([]);
  const { mapCenter, setMapCenter } = useAreaStore();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [openModal, setOpenModal] = useState({ detail: false, youtube: false });

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const markersRef = useRef({}); //마커 토글 상태
  const overlaysRef = useRef({}); // 커스텀 오버레이 상태

  // Supabase에서 데이터 호출
  useEffect(() => {
    const handlemarkerData = async () => {
      try {
        const { data, error } = await supabase.from('hotplaces').select('*');
        if (error) {
          throw error;
        }
        setMarkerData(data);
      } catch (error) {
        openAlert({ type: ERROR, text: '데이터 로드에 실패했습니다' });
        console.log(error);
      } finally {
        setDataLoading(false);
      }
    };
    handlemarkerData();
  }, []);

  // KakaoMap API 호출
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const { kakao } = window;
      const options = {
        center: new kakao.maps.LatLng(mapCenter.lat, mapCenter.lon),
        level: 5,
      };
      const map = new kakao.maps.Map(mapContainer.current, options);
      if (!dataLoading && markerData.length === 0) {
        openAlert({ type: ERROR, text: '마커 데이터를 불러오는데 실패했습니다, 새로고침해주세요' });
        return;
      }

      // 커스텀 오버레이 생성 함수
      const makeCustomOverlay = ({ item }) => {
        const overlayContent = document.createElement('div');
        overlayContent.innerHTML = `
          <div class="bg-orange-500 w-[200px] p-4 rounded-md shadow-lg text-white">
            <h3 class="font-bold">${item.name}</h3>
            <p>${item.area}</p>
            <button id="detail-btn-${item.id}" class="bg-lime-600 px-2 py-1 mt-2 text-white rounded-md w-full">
              자세히 보기
            </button>
          </div>
        `;
        return overlayContent;
      };

      markerData.forEach((item) => {
        const lat = parseFloat(item.latitude);
        const lon = parseFloat(item.longitude);
        const markerPosition = new kakao.maps.LatLng(lat, lon);

        // 마커 이미지 설정
        const clickedMarkerImgSrc = '/activeMarker.svg';
        const hotplaceMarkerImgSrc = '/hotplaceMarker.svg';
        const hotplaceMarkerSize = new kakao.maps.Size(25, 45);
        const hotplaceMarkerOption = { offset: new kakao.maps.Point(20, 40) };

        // 마커 생성
        const marker = new kakao.maps.Marker({
          map: map,
          position: markerPosition,
          image: new kakao.maps.MarkerImage(hotplaceMarkerImgSrc, hotplaceMarkerSize, hotplaceMarkerOption),
        });
        markersRef.current[item.id] = marker; // 마커 인스턴스 저장

        // 커스텀 오버레이 생성
        const overlayContent = makeCustomOverlay({ item });
        const customInfoOverlay = new kakao.maps.CustomOverlay({
          content: overlayContent,
          removable: true,
          position: markerPosition,
          yAnchor: 2,
          zIndex: 3,
        });
        overlaysRef.current[item.id] = customInfoOverlay; // 커스텀 오버레이 인스턴스 저장

        // "자세히 보기" 버튼 이벤트
        overlayContent.querySelector(`#detail-btn-${item.id}`).addEventListener('click', () => {
          setSelectedMarker({ id: item.id, name: item.name, area: item.area });
          setOpenModal({ detail: true, youtube: false });
        });

        // 마커 클릭 이벤트: 한 번에 하나의 마커만 활성화
        kakao.maps.event.addListener(marker, 'click', function () {
          setActiveMarkerId((prevId) => {
            // 다른 마커가 클릭되었을때, 클릭 전 상태
            if (prevId && prevId !== item.id) {
              const prevMarker = markersRef.current[prevId];
              const prevOverlay = overlaysRef.current[prevId];
              if (prevMarker) {
                prevMarker.setImage(
                  new kakao.maps.MarkerImage(hotplaceMarkerImgSrc, hotplaceMarkerSize, hotplaceMarkerOption)
                );
              }
              if (prevOverlay) {
                prevOverlay.setMap(null);
              }
              // 클릭 마커 활성화
              marker.setImage(
                new kakao.maps.MarkerImage(clickedMarkerImgSrc, new kakao.maps.Size(40, 75), {
                  offset: new kakao.maps.Point(28, 70),
                })
              );
              customInfoOverlay.setMap(map);
              return item.id;
            }
            // 같은 마커를 다시 클릭하면 토글하여 비활성화
            if (prevId === item.id) {
              marker.setImage(
                new kakao.maps.MarkerImage(hotplaceMarkerImgSrc, hotplaceMarkerSize, hotplaceMarkerOption)
              );
              customInfoOverlay.setMap(null);
              return null;
            }
            // 아무것도 활성화되지 않은 경우, 현재 마커 활성화
            marker.setImage(
              new kakao.maps.MarkerImage(clickedMarkerImgSrc, new kakao.maps.Size(40, 75), {
                offset: new kakao.maps.Point(28, 70),
              })
            );
            customInfoOverlay.setMap(map);
            return item.id;
          });
        });
      });
    } else {
      openAlert({ type: ERROR, text: '마커 데이터 로드를 실패했습니다' });
    }
  }, [markerData, mapCenter, dataLoading]);

  const handlePlaceSelect = (lat, lon) => {
    setMapCenter(lat, lon);
  };

  return (
    <div className='flex flex-col w-[1000px] mt-[-25px]'>
      <div className='flex w-full h-[50px] mx-auto mb-4'>
        <MapController handlePlaceSelect={handlePlaceSelect} />
      </div>
      <div className='flex w-full h-[480px]'>
        <div id='map' ref={mapContainer} className='w-full h-full'></div>
        {openModal.detail && selectedMarker && <DetailModal id={selectedMarker.id} setOpenModal={setOpenModal} />}
        {openModal.youtube && selectedMarker && <YoutubeModal id={selectedMarker.id} setOpenModal={setOpenModal} />}
      </div>
    </div>
  );
}

export default KakaoMap;
