import React, { useState } from 'react'
import InactiveData from './InactiveData';
import DataList from './DataList';
import './style.css';
import './header.css'

const Header = () => {
    const [tab, setTab] = useState('all');


    return (
        <>
            <div className="billex-main">
                <div className="table-one p-2">
                    <div>
                        <div className="p-2">
                            <div className="row">
                            <div className='tab'>
                                    <button onClick={() => setTab('all')} className={tab === 'all' ? 'active' : ''}>
                                        All Data
                                    </button>
                                    <button onClick={() => setTab('inactive')} className={tab === 'inactive' ? 'active' : ''}>
                                        Inactive Data
                                    </button>
                                </div>
                                <h3 className="head2">Globocom Support Monitoring</h3>
                                <div className='stats-container'>
                <div className='stats-data-item'>
                    <h3>All IDs </h3>
                    <a href='#'>      <p className='green'>302</p></a>
                </div>
                <div className='stats-data-item'>
                    <h3>Active IDs</h3>
                    <a href='#'>     <p className='green'>151</p></a>
                </div>
                <div className='stats-data-item'>
                    <h3>No Traffic</h3>
                    <a href='#'>    <p className='red'>100</p></a>
                </div>
                <div className='stats-data-item'>
                    <h3 >Inactive</h3>
                    <a href='#'> <p className='grey'>51</p></a>
                       
                </div>
            </div>
     
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            {tab === 'all' && <DataList />}
            {tab === 'inactive' && <InactiveData />}


        </>
    )
}

export default Header
