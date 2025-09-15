import React from 'react'
import VideoPanel from './components/VideoPanel'
import SignDetectionCard from './components/SignDetectionCard'
import SubtitleHistory from './components/SubtitleHistory'


export default function App(){
return (
<div className="container">
<div className="left">
<div className="card video-wrap">
<div className="live-badge">LIVE</div>
<VideoPanel />
</div>
</div>
<div className="right">
<div className="card" style={{marginBottom:18}}>
<SignDetectionCard />
</div>
<div className="card">
<SubtitleHistory />
</div>
</div>
</div>
)
}