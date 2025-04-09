import random
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mqtt import FastMQTT, MQTTConfig
from datetime import datetime

logging.basicConfig(level=logging.DEBUG)

MQTT_HOST = "mosquitto"
MQTT_PORT = 1883
MQTT_TOPIC = "vitals"
MQTT_CLIENT_ID = f'fastapi-mqtt-{random.randint(0, 1000)}'
mqtt_latest_data = None

mqtt_config = MQTTConfig(
    host = MQTT_HOST,
    port = 1883,
    keepalive = 60,
    username = None,
    password = None
)
fast_mqtt = FastMQTT(config=mqtt_config)

@asynccontextmanager
async def _lifespan(_app: FastAPI):
    await fast_mqtt.mqtt_startup()
    yield
    await fast_mqtt.mqtt_shutdown()

app = FastAPI(lifespan=_lifespan)

origins = [
    "http://localhost:5173",  # Vite development server
    "localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def index():
    return {"message": "Hello, World!"}

# endpoint for publishing vitals to mqtt broker
@app.post("/api/mqtt/publish")
def mqtt_public(field1: str, field2: str, field3: str, field4: str, field5: str):
    """
    Publish a message to the MQTT broker.
    Args:
        field1 (str): Heart Rate
        field2 (str): Blood Pressure
        field3 (str): Temperature
        field4 (str): Oxygen
        field5 (str): Steps
    """

    # current time
    current_time = datetime.utcnow()
    formatted_time = current_time.strftime('%Y-%m-%dT%H:%M:%SZ')

    # Publish a message to the MQTT broker
    mqtt_latest_data = {
        "created_at": formatted_time,
        "field1": field1,
        "field2": field2,
        "field3": field3,
        "field4": field4,
        "field5": field5
    }
    fast_mqtt.publish(MQTT_TOPIC, json.dumps(mqtt_latest_data))  # publishing mqtt topic

    return {"result": True, "message": "Published"}
