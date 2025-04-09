import { useEffect, useState } from "react"
// import d from "./assets/data.json"
import { Download, Heart } from "lucide-react";
import LiveVitals from "./components/LiveVitals";
import HealthTrends from "./components/HealthTrends";
import { mqttClient, mqttSubscribe } from "./mqtt";

type DataFromMQTT = {
  created_at: string,
  field1: number,
  field2: string,
  field3: number,
  field4: number,
  field5: number
}

interface DataFromThingSpeak extends DataFromMQTT {
  entry_id: number,
}

export type Data = {
  created_at: string,
  heartRate: number,
  bloodPressure: string,
  temperature: number,
  oxygen: number
  steps: number
}

const mapData = (jsonArray: DataFromThingSpeak[]): Data[] => {
  return jsonArray.map((json: DataFromThingSpeak) => ({
      created_at: json.created_at,
      heartRate: json.field1 ? json.field1 : 0,
      bloodPressure: json.field2 ? json.field2 : "0/0",
      temperature: json.field3 ? json.field3 : 0,
      oxygen: json.field4 ? json.field4 : 0,
      steps: json.field5 ? json.field5 : 0
  }))
}

async function fetchDataFromThingSpeak() {
  const apiUrl = `https://api.thingspeak.com/channels/2899415/feeds.json?api_key=${import.meta.env.VITE_THINKSPEAK_READ_API_KEY}&results=1000`
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("response not ok");
  }

  const json = await response.json();

  return json.feeds; // only return the feeds array
}

function App() {

  const topic = "vitals";

  const [data, setData] = useState<Data[] | null>(null);
  const [realTimeData, setRealTimeData] = useState<Data | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Fetch data from the Thingspeak API (Initial Fetch)
  useEffect(() => {
    fetchDataFromThingSpeak()
      .then((json) => {
        const mappedData = mapData(json);
        setData(mappedData);
        setRealTimeData(mappedData[mappedData.length - 1]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    mqttClient.on("connect", () => {
      setIsConnected(true);
    });

    // Subscribe to the MQTT topic
    mqttSubscribe(topic, 1);

    mqttClient.on("message", (topic: string, message) => {
      console.log(`received message: ${message} from topic: ${topic}`);
      const mqttData = JSON.parse(message.toString()) as DataFromMQTT;
      console.log(mqttData);

      // Map the MQTT data to the Data type
      const mappedData: Data = {
        created_at: mqttData.created_at,
        heartRate: mqttData.field1 ? mqttData.field1 : 0,
        bloodPressure: mqttData.field2 ? mqttData.field2 : "0/0",
        temperature: mqttData.field3 ? mqttData.field3 : 0,
        oxygen: mqttData.field4 ? mqttData.field4 : 0,
        steps: mqttData.field5 ? mqttData.field5 : 0
      }
      setRealTimeData(mappedData);

    });

    mqttClient.on("error", (error) => {
      console.error("MQTT error:", error);
    });

  }, [isConnected]);

  // Test: Fetch hello world from backend
  useEffect(() => {
    fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [])

  // const data: Data[] = mapData(d);

  return (
    <>
      <header className="w-full shadow-md mb-4 px-2 md:px-0 border-b h-16">
        <div className="flex items-center justify-between px-0 sm:px-4 xl:px-96">
          <div className="flex h-16 items-center">
            <Heart className="mr-2 h-6 w-6" />
            <h1 className="text-lg font-semibold">HealthMonitor</h1>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">
              MQTT Server: {isConnected ? "Connected" : "Disconnected"}
            </span>
            <button 
              className="flex justify-between rounded border-2 shadow-md px-4 py-2 hover:bg-gray-100"
              onClick={() => window.print()}
              >
              <Download className="mr-2 h-6 w-6" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>
      <main className="px-2 md:px-0">
        <div className="flex flex-col justify-between px-0 sm:px-4 xl:px-96">
          <h1 className="text-4xl font-bold">Health Dashboard</h1>
          <p className="text-sm text-gray-500">Your vitals and health trends</p>
          <div>
            {
              data && realTimeData ? (
                <>
                  <section id="vitals" className="mt-4 mb-2">
                    <div className="sm:flex justify-between mt-4 mb-2">
                      <h2 className="text-lg font-semibold">Live Vitals</h2>
                      <p className='text-sm text-gray-500'>Last updated: {new Date(realTimeData.created_at).toTimeString()}</p> 
                    </div>
                    <LiveVitals data={realTimeData} />
                  </section>
                  <section id="trends" className="mt-4 mb-2">
                    <div className="sm:flex justify-between mt-4 mb-2">
                      <h2 className="text-lg font-semibold">Health Trends</h2>
                      <p className='text-sm text-gray-500'>Last updated: {new Date(realTimeData.created_at).toTimeString()}</p> 
                    </div>
                    <HealthTrends data={data} />
                  </section>
                </>
              ) : (
                <div>
                  <p>Loading...</p>
                </div>
              )
            }
          </div>

        </div>
      </main>
    </>
  )
}

export default App
