import fastapi
import webbrowser
from fastapi import FastAPI
import fastapi.staticfiles
import uvicorn
import logging
from fastapi import responses
from contextlib import asynccontextmanager

with open("cords.txt", "r", encoding="utf-8") as f:
    cords = [list(map(float, x.split(maxsplit=1))) for x in f.read().strip().split("\n")]

def generate_yandex_panorama_url(
    longitude: float,
    latitude: float,
    azimuth: float = 0.0,
    tilt: float = 0.0,
    zoom: float = 13.5,
    panorama_id: str = None,
    layer: str = "stv,sta"
) -> str:
    base_url = "https://yandex.ru/map-widget/v1/?"
    params = {
        'l': layer.replace(',', '%2C'),
        'll': f"{longitude}%2C{latitude}",
        'z': str(zoom),
        'panorama[point]': f"{longitude}%2C{latitude}",
        'panorama[direction]': f"{azimuth}%2C{tilt}",
        'panorama[full]': 'true',
        'panorama[span]': '96.335379%2C60.000000'
    }
    if panorama_id:
        params['panorama[id]'] = panorama_id
    param_strings = []
    for key, value in params.items():
        encoded_key = key.replace('[', '%5B').replace(']', '%5D')
        param_strings.append(f"{encoded_key}={value}")
    full_url = base_url + "&".join(param_strings)
    return full_url

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Webserver is up on http://localhost/")
    webbrowser.open("http://localhost/")
    yield
    print("Webserver is shutting down")

# logging.getLogger('uvicorn').setLevel(logging.ERROR)
# logging.getLogger('uvicorn.access').setLevel(logging.CRITICAL)
# logging.getLogger('uvicorn.error').setLevel(logging.ERROR)

app = FastAPI(lifespan=lifespan)
app.mount(
    "/static", 
    fastapi.staticfiles.StaticFiles(directory="static"), 
    name="static"
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/from_cords")
async def from_cords(longitude, latitude):
    resp = generate_yandex_panorama_url(longitude, latitude)
    logging.info(resp)
    return responses.RedirectResponse(resp)

@app.get("/")
async def index():
    return responses.FileResponse(path="static/html/index.html")

@app.get("/map")
async def get_map():
    return responses.FileResponse(path="static/html/map.html")

@app.get("/answer_map")
async def get_map():
    return responses.FileResponse(path="static/html/answer_map.html")

@app.get("/cords")
async def get_cords():
    return responses.JSONResponse(cords)

def main():
    port = 80
    host = "0.0.0.0"
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="warning",
        # access_log=False,
        # use_colors=False
    )

if __name__ == "__main__":
    print("Starting webserver")
    main()
