from fastapi import FastAPI
from fastapi_mqtt import FastMQTT, MQTTConfig

app = FastAPI()

mqtt_config = MQTTConfig(
    host = 'mosquitto',
    port = 1883,
    keepalive = 60,
    username = None,
    password = None
)

mqtt = FastMQTT(config=mqtt_config)
mqtt.init_app(app)

@mqtt.on_connect()
def connect(client, flags, rc, properties):
    print("Connected: ", client, flags, rc, properties)

@mqtt.on_message()
def message(client, topic, payload, qos, properties):
    print("Received message: ", topic, payload)

@mqtt.on_disconnect()
def disconnect(client, packet, exc=None):
    print("Disconnected")

@mqtt.on_subscribe()
def subscribe(client, mid, qos, properties):
    print("Subscribed: ", client, mid, qos, properties)

@app.get("/")
async def root():
    return {"message": "Hello World"}