import { useYoutubeQuery } from '@/lib/queries/useYoutubeQuery';
import { formatDateFromISO } from '@/lib/utils/formatDate';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { openAlert } from '@/lib/utils/openAlert';
import { ALERT_TYPE } from '@/constants/alert-constant';
import { useGetHotplaces } from '@/lib/queries/GetHotplaces';
import { STORE_CONSTANT } from '@/constants/store-constant';
const { ERROR } = ALERT_TYPE;
const { STORE_NAME, AREA } = STORE_CONSTANT;

export default function YoutubeModal({ id: storeId, setOpenModal }) {
  const { data } = useGetHotplaces();
  const _data = data.filter(({ id }) => id === storeId)[0];
  const { youtubeData, isPending, isError, error } = useYoutubeQuery({
    storeName: _data[STORE_NAME],
    area: _data[AREA],
    storeId,
  });

  const closeYoutubeModal = () => {
    setOpenModal({ detail: false, youtube: false });
  };

  if (isPending) {
    return (
      <div className='youtubeModal'>
        <Loading />
      </div>
    );
  }

  if (isError) {
    openAlert({ type: ERROR, text: `[${error.code}]${error.message}` });
    return (
      <div className='youtubeModal'>
        <Error />
      </div>
    );
  }

  return (
    <section className='youtubeModal fixedCenter z-[1000]'>
      <button className='modalBtn !py-2 !mb-4' onClick={closeYoutubeModal}>
        유튜브 닫기
      </button>
      {youtubeData?.map((data, index) => (
        <div
          key={data.title}
          className={`py-[20px] ${index === youtubeData.length - 1 ? null : 'border-b-2 border-stone-200'}`}
        >
          <div className='flexCenter !justify-between mb-3'>
            <p>{data.channelTitle}</p>
            <p>{formatDateFromISO(data.publishedAt)}</p>
          </div>
          <div className='w-full h-[50vh] mb-5'>
            <iframe width={'100%'} height={'100%'} src={`https://www.youtube.com/embed/${data.videoId}`}></iframe>
          </div>
          <h4 className='text-xl font-bold'>{data.title}</h4>
          <p className='mb-2'>{data.description}</p>
        </div>
      ))}
    </section>
  );
}
