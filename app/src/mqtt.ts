import mqtt, { IClientSubscribeOptions } from "mqtt";

// Connect to the MQTT broker
export const mqttClient = mqtt.connect({
    host: import.meta.env.VITE_MQTT_BROKER_URL,
    port: import.meta.env.VITE_MQTT_BROKER_PORT,
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