import { useState } from 'react';
import useAreaStore from '@/store/zustand/useAreaStore';
export default function MapController() {
  const [coordinate, setCoordinate] = useState('');
  const { setSelectedArea, setMapCenter } = useAreaStore();

  const locationCoords = {
    '성수동': { lat: 37.5432, lon: 127.0563 },
    '인사동': { lat: 37.5744, lon: 126.9871 },
    '망원동': { lat: 37.5568, lon: 126.9014 },
  };

  const handleSelect = (e) => {
    const area = e.target.value;
    console.log(area);
    setCoordinate(area);

    if (locationCoords[area]) {
      setMapCenter(locationCoords[area].lat, locationCoords[area].lon);
      setSelectedArea(area);
    }
  };
  return (
    <div className='flex items-center gap-4'>
      <select
        className=' w-[200px] h-[50px] border-solid border-[6px] rounded-xl border-neutral-300 hover:border-lime-600 transition-colors duration-200'
        value={coordinate}
        onChange={handleSelect}
      >
        {Object.entries(locationCoords).map(([key]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}
