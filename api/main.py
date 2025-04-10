import random
import json
import logging
import joblib
import pandas as pd
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
    "http://192.168.50.61" # ipad
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


def predict_health_status(df: pd.DataFrame):
    try:
        model = joblib.load('./health_monitor_model.pkl')
        scaler = joblib.load('./health_monitor_model_scaler.pkl')
    except:
        raise Exception("Model and scaler not found.")
    
    features = df[['heartRate', 'bloodPressure', 'temperature', 'oxygen', 'steps']]
    
    # Scale features
    scaled_features = scaler.transform(features)
    
    # Predict health status
    health_status = model.predict(scaled_features)
    
    return health_status


# endpoint for publishing vitals to mqtt broker
@app.post("/api/mqtt/publish")
def mqtt_public(message: dict):
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

    # Append created_at to the message
    message["created_at"] = formatted_time

    mqtt_latest_data = {
        "created_at": formatted_time,
        "field1": message["field1"],
        "field2": message["field2"],
        "field3": message["field3"],
        "field4": message["field4"],
        "field5": message["field5"]
    }

    # Use systolic for blood pressure
    data = {
        "created_at": formatted_time,
        "heartRate": message["field1"],
        "bloodPressure": message["field2"].split('/')[0],
        "temperature": message["field3"],
        "oxygen": message["field4"],
        "steps": message["field5"]
    }

    # Convert the data to a DataFrame
    df = pd.DataFrame([data])

    # Predict health status
    health_status = predict_health_status(df)
    mqtt_latest_data["alert"] = "Healthy" if health_status[0] == 1 else "Unhealthy"

    # Publish a message to the MQTT broker
    fast_mqtt.publish(MQTT_TOPIC, json.dumps(mqtt_latest_data))  # publishing mqtt topic

    return {"result": True, "message": "Published"}
