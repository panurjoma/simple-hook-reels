# edge-voz.py <voz> <ritmo> <tono> <salida.mp3> <salida.json>  (el texto, por la entrada estándar). Voz neuronal de España con tiempos por palabra.
import asyncio, json, sys, edge_tts
voz, ritmo, tono, mp3, js = sys.argv[1:6]
texto = sys.stdin.buffer.read().decode("utf-8")
async def main():
    c = edge_tts.Communicate(texto, voz, rate=ritmo, pitch=tono, boundary="WordBoundary")
    ws = []
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": ws.append({"texto": ch["text"], "inicio": ch["offset"] / 1e7, "fin": (ch["offset"] + ch["duration"]) / 1e7})
    json.dump(ws, open(js, "w", encoding="utf-8"), ensure_ascii=False)
asyncio.run(main())
