import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/sea-lion', async(req, res) => {
    try {
        const r = await fetch('https://api.sea-lion.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await r.json();
        res.status(r.status).json(data);
    } catch (e) {
        res.status(500).json({error : String(e) });
    }
});

const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log('SEA-LION proxy on: ' + PORT));