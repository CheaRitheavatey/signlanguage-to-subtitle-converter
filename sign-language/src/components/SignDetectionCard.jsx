import React,{useState} from 'react'


export default function SignDetectionCard(){
const [method,setMethod] = useState('mediapipe')
return (
<div>
<div className="card-header">
<div>
<h3 style={{margin:0}}>Sign Detection</h3>
<div className="small-muted">Active method</div>
</div>
<div style={{display:'flex',gap:8}}>
<button className="btn">⚙</button>
<button className="btn">🔔</button>
</div>
</div>


<div style={{marginBottom:12}}>
<div className="small-muted">Detection Method:</div>
<div className="methods" style={{marginTop:8}}>
<div className={`method ${method==='mediapipe'?'active':''}`} onClick={()=>setMethod('mediapipe')}>MediaPipe</div>
<div className={`method ${method==='basic'?'active':''}`} onClick={()=>setMethod('basic')}>Basic + AI</div>
<div className={`method ${method==='custom'?'active':''}`} onClick={()=>setMethod('custom')}>Custom Model</div>
</div>
</div>


<div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
<div className="small-muted">No signs detected yet</div>
<div className="small-muted">Start detection to see results</div>
</div>
</div>
)
}