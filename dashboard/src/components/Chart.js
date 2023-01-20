import React from 'react';
import Plot from 'react-plotly.js';
import { useQuery } from "react-query";

const fetchChart = async ({ queryKey }) => {
    const [chartType] = queryKey
    const res = await fetch(`${process.env.REACT_APP_URL_API}/delay/plotlychart?typec=${chartType}`)
    return res.json()
};

export default function Chart({ chartType }) {
    const { data, status } = useQuery(chartType, fetchChart);

    if (status === "success")
        return (
            <Plot data={data.data} layout={{
                autosize: true, margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                    pad: 0
                },
            }} useResizeHandler={true}
                style={{ width: "100%", minHeight: 300 }} />
        )
    return null
}
