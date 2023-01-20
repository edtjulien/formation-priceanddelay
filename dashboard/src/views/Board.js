import { React } from 'react';
import Chart from '../components/Chart';
import DataGrid from '../components/DataGrid';
import DelayOptim from '../components/DelayOptim';
import './Board.css';

export default function Board() {
    const title = 'Delay and checkout times'

    return (
        <div className='container'>
            <h1>{title}</h1>
            <section className='board-section'>
                <div className='box-graph' style={{ width: '10%' }}>
                    <div className='head-box'>Delay optimization</div>
                    <div className='container-graph'><DelayOptim /></div>
                </div>
                <div className='box-graph'>
                    <div className='head-box'>Data list</div>
                    <div className='container-graph'><DataGrid height={400} dataSource='delay' /></div>
                </div>
            </section>
            <section className='board-section'>
                <div className='box-graph'>
                    <div className='head-box'>Distribution of rental number for one car</div>
                    <div className='container-graph'><Chart chartType="rental_nb" /></div>
                </div>
                <div className='box-graph'>
                    <div className='head-box'>Part of ended and cancelled rental</div>
                    <div className='container-graph'><Chart chartType="state" /></div>
                </div>
                <div className='box-graph'>
                    <div className='head-box'>Part of mobile and connect checkin</div>
                    <div className='container-graph'><Chart chartType="checkin_type" /></div>
                </div>
            </section>
        </div>
    );
}
