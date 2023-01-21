import { React } from 'react';
import DataGrid from '../components/DataGrid';
import PricePredict from '../components/PricePredict';
import './Prices.css';

export default function Prices() {
    const title = 'Prices prediction'

    return (
        <div className='container'>
            <h1>{title}</h1>
            <section className='board-section'>
                <div className='box-graph'>
                    <div className='head-box'>Estimate the daily price</div>
                    <div className='container-graph'>
                        <div style={{ marginBottom: 40 }}>We strongly suggest to fill all fields to get an accurate price estimation.</div>
                        <PricePredict />
                    </div>
                </div>
                <div className='box-graph data-list'>
                    <div className='head-box'>Data list</div>
                    <div className='container-graph'><DataGrid height={400} dataSource='prices' autoSize={false} /></div>
                </div>
            </section>
        </div >
    );
}
