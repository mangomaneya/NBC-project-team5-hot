import { STORE_CONSTANT } from '@/constants/store-constant';
import { useGetHotplaces } from '@/lib/queries/GetHotplaces';
import { useState } from 'react';
import DetailModal from '../modal/detail-modal';
import YoutubeModal from '../modal/youtube-modal';

const HotplaceList = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: hotplaces = [], isPending, isError } = useGetHotplaces();
  const [openModal, setOpenModal] = useState({ detail: false, youtube: false });

  const handleOpenModal = (id) => {
    setSelectedPost(id);
    setOpenModal({
      detail: true,
      youtube: false,
    });
  };

  function toggleHotPlaceList() {
    setIsVisible((prev) => !prev);
  }

  if (isPending) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return <div>에러가 발생했습니다.</div>;
  }

  document.body.style.overflow = isVisible ? 'hidden' : 'auto';

  return (
    <article className='m-3 w-[250px] overflow-y-auto h-[80vh]'>
      {isVisible && (
        <div className='slide-up opacity-100 transition-opacity duration-300 bg-neutral-50 w-[250px] pb-[50px]'>
          {hotplaces.map((data) => (
            <section
              key={data.id}
              onClick={() => handleOpenModal(data.id)}
              className='border-2 w-[250px] p-3 mb-3 bg-neutral-50 cursor-pointer'
            >
              <div className='flex items-center gap-4'>
                <h3 className='text-orange-400 text-[23px]'>{data[STORE_CONSTANT.STORE_NAME]}</h3>
                <p className='text-neutral-400 text-[15px]'>{data[STORE_CONSTANT.CATEGORY]}</p>
              </div>
              <p className='text-[13px]'>{data[STORE_CONSTANT.STORE_ADDRESS]}</p>
              <div className='flex items-center gap-4'>
                <p className='text-lime-600'>{data[STORE_CONSTANT.STORE_CONTACT]}</p>
              </div>
            </section>
          ))}
        </div>
      )}
      <button onClick={toggleHotPlaceList} className='fixed p-2 w-[250px] bg-button bottom-0 border-2 rounded-t-2xl'>
        {isVisible ? '핫플 닫기' : '핫플 보기'}
      </button>
      {openModal.detail && <DetailModal id={selectedPost} setOpenModal={setOpenModal} />}
      {openModal.youtube && <YoutubeModal id={selectedPost} setOpenModal={setOpenModal} />}
    </article>
  );
};

export default HotplaceList;
