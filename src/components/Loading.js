
import React from 'react'
import { LifeLine } from "react-loading-indicators";
import '../css/Loading.css'

function Loading() {
  return (
    <div className='mid'>
        <div className='loader'>
        <LifeLine color="#cc3197" size="medium" text="Hang on" textColor="#NaNNaNNaN" />
        </div>
   
    </div>
  )
}

export default Loading

