import Slider from '@mui/material/Slider';
import { React, useRef, useState } from 'react';
import { useQuery } from "react-query";
import './DelayOptim.css';

const fetchData = async ({ queryKey }) => {
    /* eslint-disable no-unused-vars */
    const [_, delayValue] = queryKey
    const res = await fetch(`${process.env.REACT_APP_URL_API}/delay/optim?timing=${delayValue}`)
    return res.json()
};

export default function DelayOptim() {
    const [delayValue, setDelayValue] = useState(59)
    const prev_data = useRef({ no_course_percentage: 0, saved_course_percentage: 0, no_saved_course_percentage: 0 })

    const { data, status } = useQuery(['delay', delayValue], fetchData);

    const sliderChange = (e) => {
        setDelayValue(e.target.value)
    }

    let data_view = data
    if (status !== 'success' && prev_data.current) {
        data_view = { no_course_percentage: prev_data.current['no_course_percentage'], saved_course_percentage: prev_data.current['saved_course_percentage'], no_saved_course_percentage: prev_data.current['no_saved_course_percentage'] }
    }
    else {
        prev_data.current = data
        data_view = data
    }

    return (
        <div>
            <div className='title_delay'><span className='label'>Gap timing:</span> <span className='value'>{delayValue} min</span></div>
            <div className='subtitle_delay'>Time between contractual checkout and next availability of the car</div>
            <Slider className='slider_delay' aria-label="Volume" value={delayValue} onChange={sliderChange} min={0} max={200} />
            <div className='subbox'><div className='subbox_title'>Negative possible impact on rental</div><div className='subbox_value negative'>{data_view['no_course_percentage']} %</div></div>
            <div className='subbox'><div className='subbox_title'>Rate of rental saved by additional gap timing</div><div className='subbox_value positive'>{data_view['saved_course_percentage']} %</div></div>
            <div className='subbox'><div className='subbox_title'>Rate of probably none honored checkin time</div><div className='subbox_value negative'>{data_view['no_saved_course_percentage']} %</div></div>
        </div>
    )
}
