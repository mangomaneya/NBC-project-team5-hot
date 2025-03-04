import { useState } from 'react';
import { useGetHotplaces } from '@/lib/queries/GetHotplaces';
import DetailModal from '@/components/modal/detail-modal';
import { STORE_CONSTANT } from '@/constants/store-constant';
import Loading from '@/components/common/Loading';
import Error from '@/components/common/Error';
import useAreaStore from '@/store/zustand/useAreaStore';

const HotplaceList = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const selectedArea = useAreaStore((state) => state.selectedArea);
  const { data: hotplaces = [], isPending, isError } = useGetHotplaces({ area: selectedArea });

  function toggleHotPlaceList() {
    setIsVisible((prev) => !prev);
  }

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  function closeModal() {
    setSelectedPost(null);
  }

  document.body.style.overflow = isVisible ? 'hidden' : 'auto';

  return (
    <article className='m-3 w-[250px] overflow-y-auto h-[80vh]'>
      {isVisible && (
        <div className='slide-up opacity-100 transition-opacity duration-300 bg-neutral-50 w-[250px] pb-[50px]'>
          {hotplaces.map((data) => (
            <section
              key={data.id}
              onClick={() => setSelectedPost(data.id)}
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
      {selectedPost && <DetailModal id={selectedPost} closeModal={closeModal} />}
    </article>
  );
};

export default HotplaceList;
