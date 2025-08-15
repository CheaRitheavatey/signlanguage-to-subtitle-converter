import { model } from "@tensorflow/tfjs";

export async function glossesToText({items, targetLang = 'en', prev = ''}) {
    const system = `You are a low-latency subtitle formatter for sign-language glosses
    Rules:
    - Convert glosses to fluent ${targetLang} sentences with punctuation.
    - Merge repeats, fix minor ASL-to-English grammar.
    - Keep names, times and number intact.
    - Return plain text only. `;

    const user = JSON.stringify({targetLang, prevContent: prev, items });
    const r = await fetch('/api/sea-lion', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            model: 'aisingapore/Llama-SEA-LION-v3.5-8B-R',
            messages:[
                {role: 'system', content: system}, 
                {role: 'user', content: user}
            ] 
        })
    });

    const data = await r.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
}