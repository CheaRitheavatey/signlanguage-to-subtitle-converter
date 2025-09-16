export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'


export async function postFrame(blob, clientId){
const fd = new FormData()
fd.append('file', blob, 'frame.jpg')

const res = await fetch(`${API_URL}/predict`, {
method: 'POST',
headers: {
'X-Client-Id': clientId
},
body: fd
})
if(!res.ok) throw new Error('Network error')
return res.json()
}