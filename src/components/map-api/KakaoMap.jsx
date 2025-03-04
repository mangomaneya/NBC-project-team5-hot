import { useEffect, useRef, useState } from 'react';
// import { positions } from './boundary'; 마커 표시 임시 데이터
import supabase from '../../lib/api/supabaseAPI';
import MapController from './MapController';
import { openAlert } from '@/lib/utils/openAlert';
import { ALERT_TYPE } from '@/constants/alert-constant';
import useAreaStore from '@/store/zustand/useAreaStore';
import DetailModal from '../modal/detail-modal';
import YoutubeModal from '../modal/youtube-modal';
const { ERROR } = ALERT_TYPE;
function KakaoMap() {
  const mapContainer = useRef(null); //지도 컨테이너
  const [markerData, setMarkerData] = useState([]); //supabase에서 불러온 데이터 다룰때 쓰기기
  const { mapCenter, setMapCenter } = useAreaStore(); // map API 중심 좌표 설,zusatand 사용용
  const [clickedMarker, setClickedMarker] = useState({}); // toggle여부를 위한 상태
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커의
  const [dataLoading, setDataLoading] = useState(true);
  //현재 컴포넌트 렌더링 시 markerData===0이기 때문에 로딩 상태를 위한 상태 선언

  const [openModal, setOpenModal] = useState({ detail: false, youtube: false });
  //supabase의 데이터 호출부
  //supabase의 hotplaces 데이터 테이블로부터 데이터를 불러온다
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

  //KakaoMap API 호출부
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const { kakao } = window;
      //API 호출 시 window.kakao를 받는다

      const options = {
        center: new kakao.maps.LatLng(mapCenter.lat, mapCenter.lon),
        level: 5,
      };
      const map = new kakao.maps.Map(mapContainer.current, options); //#map을 가리킴
      //지도생성
      if (!dataLoading && markerData.length === 0) {
        openAlert({ type: ERROR, text: '마커 데이터를 불러오는데 실패했습니다, 새로고침해주세요' });
        return;
      }

      const makeCustomOverlay = ({ item }) => {
        const overlayContent = document.createElement('div');
        overlayContent.innerHTML = `
                    <div class="bg-orange-500 w-[200px] p-4 rounded-md shadow-lg text-white">
            <h3 class="font-bold">${item.name}</h3>
            <p>${item.area}</p>
            <button id="detail-btn-${item.id}" class="bg-lime-300 px-2 py-1 mt-2 text-white rounded-md w-full">
              자세히 보기
            </button>
          </div>
        `;
        return overlayContent;
      };

      markerData.forEach((item) => {
        //지도 마커 좌표 설정
        const lat = parseFloat(item.latitude);
        const lon = parseFloat(item.longitude);
        const markerPosition = new kakao.maps.LatLng(lat, lon);

        //커스텀 오버레이 설정 변수
        //마커 이미지
        const clickedMarkerImgSrc = '/activeMarker.svg';
        const hotplaceMarkerImgSrc = '/hotplaceMarker.svg';
        //
        const isMarkerClicked = clickedMarker[item.id] || false; //클릭 여부에 따른 상태
        //다음의 순서대로 사용하기 (이미지 소스,사이즈,옵션)
        const markerImgSrc = isMarkerClicked ? clickedMarkerImgSrc : hotplaceMarkerImgSrc;
        const hotplaceMarkerSize = new kakao.maps.Size(25, 45);
        const hotplaceMarkerOption = { offset: new kakao.maps.Point(20, 40) };

        //커스텀 오버레이 마커 생성
        const hotplaceMarker = new kakao.maps.MarkerImage(markerImgSrc, hotplaceMarkerSize, hotplaceMarkerOption);
        //마커 생성자
        const marker = new kakao.maps.Marker({
          map: map,
          position: markerPosition,
          image: hotplaceMarker,
        });

        //커스텀 오버레이 내부 요소
        const overlayContent = makeCustomOverlay({ item });
        //커스텀 오버레이 호출]
        const customInfoOverlay = new kakao.maps.CustomOverlay({
          content: overlayContent,
          removable: true,
          position: markerPosition,
          yAnchor: 2,
          zIndex: 3,
        });
        //커스텀 오버레이 이벤트 등록록
        overlayContent.querySelector(`#detail-btn-${item.id}`).addEventListener('click', () => {
          setSelectedMarker({ id: item.id, name: item.name, area: item.area });
          setOpenModal({ detail: true, youtube: false });
        });

        //이벤트 등록
        kakao.maps.event.addListener(marker, 'click', function () {
          setClickedMarker((prev) => {
            const toggleMarker = !prev[item.id];

            if (toggleMarker) {
              marker.setImage(
                new kakao.maps.MarkerImage(clickedMarkerImgSrc, new kakao.maps.Size(40, 75), {
                  offset: new kakao.maps.Point(28, 70),
                })
              );
            } else {
              marker.setImage(
                new kakao.maps.MarkerImage(hotplaceMarkerImgSrc, new kakao.maps.Size(25, 45), {
                  offset: new kakao.maps.Point(20, 40),
                })
              );
            }
            return { ...prev, [item.id]: toggleMarker };
          });

          if (customInfoOverlay.getMap()) {
            customInfoOverlay.setMap(null);
          } else {
            customInfoOverlay.setMap(map);
          }
        });
      });
    } else {
      openAlert({ type: ERROR, text: '마커 데이터 로드를 실패했습니다' });
    }
  }, [markerData, mapCenter]);
  const handlePlaceSelect = (lat, lon) => {
    setMapCenter(lat, lon);
  };
  return (
    <div className='flex flex-col w-[1200px] '>
      <div className='flex w-full h-[50px] mx-auto bg-lime-500 '>
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
