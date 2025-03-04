import { ALERT_TYPE } from '@/constants/alert-constant';
import { STORE_CONSTANT } from '@/constants/store-constant';
import { useBookmarkMutation } from '@/lib/mutation/useBookmarkMutation';
import { useGetHotplaces } from '@/lib/queries/GetHotplaces';
import { useBookmarkQuey } from '@/lib/queries/useBookmarkQuery';
import { openAlert } from '@/lib/utils/openAlert';
import React from 'react';
import { FaBookmark } from 'react-icons/fa';
import { FaRegBookmark, FaYoutube } from 'react-icons/fa6';
import { IoCloseOutline } from 'react-icons/io5';
import Error from '../common/Error';
import Loading from '../common/Loading';
import { useMemo } from 'react';
const { WARNING } = ALERT_TYPE;
const { STORE_NAME, STORE_ADDRESS, STORE_CONTACT, STORE_PIC, BUSINESS_HOUR, CATEGORY } = STORE_CONSTANT;

const DETAIL_LIST = [
  {
    key: CATEGORY,
    title: '분류',
  },
  {
    key: STORE_ADDRESS,
    title: '주소',
    defaultMessage: '등록된 주소가 없습니다.',
  },
  {
    key: STORE_CONTACT,
    title: '전화번호',
    defaultMessage: '등록된 전화번호가 없습니다.',
  },
  {
    key: BUSINESS_HOUR,
    title: '영업 시간',
    defaultMessage: '업체에 직접 문의해 주세요.',
  },
];

export default function DetailModal({ id: storeId, setOpenModal }) {
  const { bookmarkData, isError: bookmarkError, isPending: isBookmarkPending, error } = useBookmarkQuey({ storeId });
  const { data: detailData } = useGetHotplaces();
  const { addMutate, deleteMutate, isMutatePending, error: mutateError } = useBookmarkMutation({ storeId });
  const isBookMarked = bookmarkData?.length > 0;
  const storeData = useMemo(() => detailData.filter(({ id }) => id === storeId)[0], [detailData, storeId]);
  const isError = bookmarkError || mutateError || storeData?.length === 0;
  const isPending = isBookmarkPending || isMutatePending;

  const handleBookmark = () => {
    if (isBookMarked) {
      openAlert({ type: WARNING, text: '북마크에서 삭제하시겠습니까?' }).then((res) => {
        if (res.isConfirmed) return deleteMutate();
      });
    } else {
      openAlert({ type: WARNING, text: '북마크에 추가하시겠습니까?' }).then((res) => {
        if (res.isConfirmed) return addMutate();
      });
    }
  };

  const openYoutubeModal = () => {
    setOpenModal({ youtube: true, detail: false });
  };

  const closeDetailModal = () => {
    setOpenModal({ detail: false, youtube: false });
  };

  if (isPending) return <Loading />;
  if (isError) return <Error isOpenErrorAlert={true} errorMessage={isError ? error.message : mutateError} />;

  return (
    <section className='flex flex-col modal fixedCenter justify-evenly'>
      <p className='max-h-[400px] md:max-h-[65%] mb-5'>
        <img
          src={storeData[STORE_PIC]}
          alt={storeData[STORE_NAME]}
          className='object-cover w-full max-h-[400px] rounded-lg'
        />
      </p>
      <span className='text-text-primary absolute top-2 right-2 text-2xl cursor-pointer' onClick={closeDetailModal}>
        <IoCloseOutline />
      </span>
      <div className='flexCenter !justify-between  mb-[10px]'>
        <h4 className='text-2xl font-bold sm:text-3xl text-accent-active'>{storeData[STORE_NAME]}</h4>
        <span className='text-2xl cursor-pointer' onClick={handleBookmark}>
          {isBookMarked ? <FaBookmark className='text-accent' /> : <FaRegBookmark className='text-accent' />}
        </span>
      </div>

      <dl className='flex flex-wrap mb-[20px] '>
        {DETAIL_LIST.map((list) => (
          <React.Fragment key={list.key}>
            <dt className='w-[30%] sm:w-[80px] mb-1'>{list.title}</dt>
            <dd className='w-[70%] sm:w-[calc(100%-80px)]'>{storeData[list.key] ?? list?.defaultMessage}</dd>
          </React.Fragment>
        ))}
      </dl>
      <button className='modalBtn' onClick={openYoutubeModal}>
        <FaYoutube className='text-4xl w-full text-white' />
      </button>
    </section>
  );
}
