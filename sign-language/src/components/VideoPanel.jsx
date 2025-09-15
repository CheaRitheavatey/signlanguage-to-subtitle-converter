import React, {useRef, useState} from 'react'
import SignPredictor from './SignPredictor'


export default function VideoPanel(){
const [running, setRunning] = useState(false)


return (
<div style={{height:'100%',display:'flex',flexDirection:'column'}}>
<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
{/* SignPredictor contains the video tag */}
<SignPredictor running={running} setRunning={setRunning} />
</div>
<div style={{display:'flex',justifyContent:'flex-start',paddingTop:12}}>
<button className="btn" onClick={()=>window.location.reload()}>↺ Reset</button>
<button className="btn primary" style={{marginLeft:8}} onClick={()=>setRunning(s=>!s)}>{running? 'Stop Detection' : 'Start Detection'}</button>
</div>
</div>
)
}