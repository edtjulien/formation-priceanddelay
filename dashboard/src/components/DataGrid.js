import { AgGridReact } from 'ag-grid-react';
import { React, useEffect, useState } from 'react';
import { useQuery } from "react-query";
import './DataGrid.css';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

const fetchData = async ({ queryKey }) => {
    const [dataType] = queryKey

    let url = `${process.env.REACT_APP_URL_API}/delay/list`
    if (dataType === 'prices')
        url = `${process.env.REACT_APP_URL_API}/prices/list`

    const res = await fetch(url)
    return res.json()
};

const columnsDelay = [
    { field: 'rental_id', headerName: 'rental_id' },
    { field: 'car_id', headerName: 'car_id' },
    { field: 'previous_ended_rental_id', headerName: 'previous_rental_id' },
    { field: 'checkin_type', headerName: 'checkin_type' },
    { field: 'state', headerName: 'state' },
    { field: 'delay_at_checkout_in_minutes', headerName: 'delay_at_checkout' },
    { field: 'time_delta_with_previous_rental_in_minutes', headerName: 'time_delta' },
];

const columnsPrices = [
    { field: 'model_key', headerName: 'Model Key' },
    { field: 'mileage', headerName: 'Mileage' },
    { field: 'engine_power', headerName: 'Engine Power' },
    { field: 'fuel', headerName: 'Fuel' },
    { field: 'paint_color', headerName: 'Paint Color' },
    { field: 'car_type', headerName: 'Car Type' },
    { field: 'private_parking_available', headerName: 'Private Parking Available' },
    { field: 'has_gps', headerName: 'Has Gps' },
    { field: 'has_air_conditioning', headerName: 'Has Air Conditioning' },
    { field: 'automatic_car', headerName: 'Automatic Car' },
    { field: 'has_getaround_connect', headerName: 'Has Getaround Connect' },
    { field: 'has_speed_regulator', headerName: 'Has Speed Regulator' },
    { field: 'winter_tires', headerName: 'Winter Tires' },
];

function json_to_records(data) {
    const keys = Object.keys(data)
    const newData = []
    Object.values(data[Object.keys(data)[0]]).forEach((item, index) => {
        const line = { id: index }
        keys.forEach(key => {
            line[key] = data[key][index]
        })
        newData.push(line)
    });
    return newData
}

const defaultColDef = {
    width: 100,
    editable: false,
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
};

export default function DataList({ width = '100%', height = 300, autoSize = true, dataSource }) {

    const { data, status } = useQuery(dataSource, fetchData);

    let columns = columnsDelay
    if (dataSource === 'prices')
        columns = columnsPrices

    // auto resize grid
    const [gridApi, setGridApi] = useState(null)
    useEffect(() => {
        if (gridApi) {
            if (autoSize)
                gridApi.sizeColumnsToFit();
        }
    }, [gridApi, autoSize])
    const onGridReady = (params) => {
        setGridApi(params.api)
    }

    let rowData = null
    if (status === "success") {
        rowData = json_to_records(data)
    }

    return (
        <div className="ag-theme-balham" style={{ width, height }}>

            <AgGridReact
                rowData={rowData}
                columnDefs={columns}
                defaultColDef={defaultColDef}
                pagination
                onGridReady={onGridReady}
            >
            </AgGridReact>

        </div>
    )

}
