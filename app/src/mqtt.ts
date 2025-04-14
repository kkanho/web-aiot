import mqtt, { IClientSubscribeOptions } from "mqtt";

const isHttps = window.location.protocol === 'https:';

const wsProtocol = isHttps ? 'wss://' : 'ws://';
const proxyRoute = isHttps ? '/ws' : '';
const port = !isHttps ? `:${import.meta.env.VITE_MQTT_BROKER_PORT}` : '';
const mqttBrokerDomain = isHttps ? "web-aiot.azurewebsites.net" : "localhost";

// Connect to the MQTT broker
// Reverse proxy route all /ws traffic to the MQTT broker
export const mqttClient = mqtt.connect(`${wsProtocol}${mqttBrokerDomain}${port}${proxyRoute}`, {
    clientId: "react_mqtt_".concat(Math.random().toString(16).slice(2)),
})

export const mqttSubscribe = (topic: string | string[] | mqtt.ISubscriptionMap, qos: IClientSubscribeOptions["qos"]) => {
    if (!mqttClient) return;

    mqttClient.subscribe(topic, { qos }, (err) => {
    if (err) {
        console.error("Subscription error:", err);
    } else {
        console.log("Subscribed to topic:", topic);
    }
    });
}

export const mqttUnsubscribe = (topic: string | string[]) => {
    if (!mqttClient) return;
    mqttClient.unsubscribe(topic, error => {
    if (error) {
        console.log('Unsubscribe error', error)
        return
    }
    console.log(`unsubscribed topic: ${topic}`)
    })
}