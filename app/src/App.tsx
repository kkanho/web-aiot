import { useEffect, useState } from "react"
import { ChartColumnIcon, ChartSpline, Download, Heart, History, Radio } from "lucide-react";
import LiveVitals from "./components/LiveVitals";
import HealthTrends from "./components/HealthTrends";
import { mqttClient, mqttSubscribe } from "./mqtt";
import { formatDistanceToNow } from "date-fns";
import HealthDashboard from "./components/HealthDashboard";
import WeeklyHealthTrends from "./components/WeeklyHealthTrends";

type DataFromMQTT = {
  created_at: string,
  field1: number,
  field2: string,
  field3: number,
  field4: number,
  field5: number,
  alert?: string // alert message
}

interface DataFromThingSpeak extends Omit<DataFromMQTT, "alert"> {
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

//FIXME: REMOVE THIS
// import d from "./assets/data.json"
// const mapJSONData = (jsonArray: DataFromMQTT[]): Data[] => {
//   return jsonArray.map((json: DataFromMQTT) => ({
//       created_at: json.created_at,
//       heartRate: json.field1 ? json.field1 : 0,
//       bloodPressure: json.field2 ? json.field2 : "0/0",
//       temperature: json.field3 ? json.field3 : 0,
//       oxygen: json.field4 ? json.field4 : 0,
//       steps: json.field5 ? json.field5 : 0
//   }))
// }

async function fetchDataFromThingSpeak() {
  const apiUrl = `https://api.thingspeak.com/channels/2899415/feeds.json?api_key=${import.meta.env.VITE_THINKSPEAK_READ_API_KEY}&results=1000`
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("response not ok");
  }

  const json = await response.json();

  return json.feeds; // only return the feeds array
}

// filter out data(created_at) not on today
function filterData(datas: Data[], timeRange: string = "15 minutes") {
  const now = new Date();
  let startTime;
  
  if (timeRange === "today") { // today
    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeRange === "hour") { // 1 hour
    startTime = new Date(now.getTime() - 60 * 60 * 1000);
  } else { // 15 minutes (default)
    startTime = new Date(now.getTime() - 15 * 60 * 1000);
  }
  
  const filteredData = datas.filter((data) => {
    const dataDate = new Date(data.created_at);
    return dataDate >= startTime && dataDate <= now;
  });

  // if the data is empty after filtering, return the last 50 data entries
  if (filteredData.length <= 10) {
    return datas.slice(-50);
  }
  
  return filteredData;
}

function App() {

  const topic = "vitals";

  const [data, setData] = useState<Data[] | null>(null); // Initial data from ThingSpeak
  const [realTimeData, setRealTimeData] = useState<Data | null>(null); // From MQTT
  const [isConnected, setIsConnected] = useState<boolean>(false); // MQTT connection status
  const [alertTimer, setAlertTimer] = useState<number>(30); // 30 seconds
  const [alertFlag, setAlertFlag] = useState<boolean>(false); // For alerting
  const [isUnhealthy, setIsUnhealthy] = useState<boolean>(false); // For health alerts
  const [period, setPeriod] = useState<string>("15 minutes"); // For trends filtering
  const [filteredData, setFilteredData] = useState<Data[] | null>(null);
  const [lastAlertDate, setLastAlertDate] = useState<Date | null>(null); // For health tracking



  // Fetch data from the Thingspeak API (Initial Fetch)
  useEffect(() => {
    fetchDataFromThingSpeak()
      .then((json) => {
        const mappedData = mapData(json);
        setData(mappedData);
        setRealTimeData(mappedData[mappedData.length - 1]);

        //FIXME: REMOVE THIS
        // // Test data
        // const ddd = mapJSONData(d);
        // setData(ddd);
        // setRealTimeData(ddd[ddd.length - 1]);
        // console.log(data)

      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // MQTT connection and subscription
  useEffect(() => {
    console.log("Executing MQTT useEffect");

    mqttClient.on("connect", () => {
      setIsConnected(true);
    });

    // Subscribe to the MQTT topic
    mqttSubscribe(topic, 1);

    mqttClient.on("message", (_topic: string, message) => {
      // console.log(`received message: ${message} from topic: ${topic}`);
      const mqttData = JSON.parse(message.toString()) as DataFromMQTT;
      console.log("mqttData", mqttData);

      if (mqttData.alert && mqttData.alert == "Unhealthy") {
        setIsUnhealthy(true);
        setLastAlertDate(new Date());
      }

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

      // Append the new data to the existing data
      setData((prev) => {
        if (prev) {
          return [...prev, mappedData];
        } else {
          return [mappedData];
        }
      })

      // Append the new data to dashboard data
      setFilteredData((prev) => {
        if (prev) {
          return [...prev, mappedData];
        } else {
          return [mappedData];
        }
      })

    });

    mqttClient.on("error", (error) => {
      console.error("MQTT error:", error);
    });

  }, []);

  // Alert timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAlertTimer((prev) => prev + 1);
    }, 1000); // 1 second interval

    return () => clearInterval(timer);
  }, []);

  // Alert flag
  useEffect(() => {
    if (alertTimer > 30) setAlertFlag(true);
  }, [alertTimer])

  // Alert for unhealthy vitals
  useEffect(() => {
    if (isUnhealthy && alertFlag) {

      console.log("Alert for unhealthy vitals triggered");
      // wait the ui changes for 2 seconds before alerting
      const f = new Promise((resolve) => setTimeout(resolve, 2000));
      f.then(() => {
        alert("Unhealthy vitals detected! Please check your health.");
        setIsUnhealthy(false); // reset the unhealthy state
        setAlertFlag(false); // reset the alert flag
        setAlertTimer(0); // reset the alert timer
      })
    }
  }, [isUnhealthy, alertFlag]);

  // For Health Trends, filter data based on the selected period
  useEffect(() => {
    if (data) {
      const filtered = filterData(data, period);
      setFilteredData(filtered);
    }
  }, [period, data]);

  return (
    <>
      <header className="w-full shadow-md mb-4 px-2 md:px-0 border-b h-16">
        <div className="flex items-center justify-between px-0 sm:px-4 xl:px-96">
          <div className="flex h-16 items-center">
            <Heart className="mr-2 h-6 w-6" />
            <h1 className="text-lg font-semibold">HealthMonitor</h1>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500 hidden md:block">
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
      <nav className="hidden md:flex flex-col gap-4 z-[9999] p-2 fixed top-[45%] md:right-8 justify-center items-center">
        <ul className="flex flex-col gap-2">
          <li 
            className="text-slate-600 text-center bg-slate-50 border rounded-full p-2 hover:bg-slate-100"
            title="Live Vitals"
          >
            <a href="#vitals" >
              <Radio className="h-6 w-6" />
            </a>
          </li>
          <li 
            className="text-slate-600 text-center bg-slate-50 border rounded-full p-2 hover:bg-slate-100"
            title="Health Trends"
          >
            <a href="#trends">
              <ChartSpline className="h-6 w-6" />
            </a>
          </li>
          <li 
            className="text-slate-600 text-center bg-slate-50 border rounded-full p-2 hover:bg-slate-100"
            title="Weekly Trends"
          >
            <a href="#weekly-trends">
              <ChartColumnIcon className="h-6 w-6" />
            </a>
          </li>
          <li 
            className="text-slate-600 text-center bg-slate-50 border rounded-full p-2 hover:bg-slate-100"
            title="Historical Records"
          >
            <a href="#records">
              <History className="h-6 w-6" />
            </a>
          </li>
        </ul>
      </nav>
      <main className="px-2 md:px-0">
        <div className="flex flex-col justify-between px-0 sm:px-4 xl:px-96">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Health Dashboard</h1>
              <p className="text-sm text-gray-500">Your vitals and health trends</p>
            </div>
            {
              data && (
                <div className={`border rounded-sm p-4 flex flex-col gap-2 mt-4 w-full sm:w-auto ${isUnhealthy ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"}`}>
                  <h2 className="text-lg">Current Status: {isUnhealthy ? "Need Attendtion" : "Healthy"}</h2>
                  <p className="text-sm text-gray-500">{lastAlertDate ? `${formatDistanceToNow(lastAlertDate)} since last alert` : "No recent alert"}</p>
                </div>
              )
            }
          </div>
          <div className="flex flex-col gap-0.5 md:gap-2">
            {
              realTimeData && (
                <section id="vitals" className="mt-4 mb-2">
                  <div className="sm:flex justify-between mt-4 mb-2">
                    <span className="flex items-center">
                      <Radio className="mr-2 h-6 w-6 animate-pulse" />
                      <h2 className="text-lg font-semibold self-center">Live Vitals</h2>
                    </span>
                    <p className='text-sm text-gray-500'>Last updated: {realTimeData?.created_at? new Date(realTimeData.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Data not avalible"}</p> 
                  </div>
                  <LiveVitals data={realTimeData} />
                </section>
              )
            }
            {
              data && (
                <section id="trends" className="mt-4 mb-2">
                  <div className="sm:flex justify-between mt-4 mb-2">
                    <span className="flex items-center">
                      <ChartSpline className="mr-2 h-6 w-6" />
                      <h2 className="text-lg font-semibold">Health Trends</h2>
                    </span>
                    <div className="flex gap-2">
                      <select 
                        className="self-center border rounded px-2 py-1" 
                        value={period} 
                        onChange={(e) => {setPeriod(e.target.value)}}
                      >
                        <option value="15 minutes">15 minutes</option>
                        <option value="hour">1 hour</option>
                        <option value="today">Today</option>
                      </select>
                      <p className='text-sm text-gray-500 self-center'>Last updated: {data[data.length - 1]?.created_at? new Date(data[data.length - 1].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }): "Data not avaliable"}</p> 
                    </div>
                  </div>
                  <HealthTrends data={filteredData? filteredData : null} />
                </section>
              ) 
            }
            {
              data && (
                <section id="weekly-trends" className="mt-4 mb-2">
                  <div className="sm:flex justify-between mt-4 mb-2">
                    <span className="flex items-center">
                      <ChartColumnIcon className="mr-2 h-6 w-6" />
                      <h2 className="text-lg font-semibold">Weekly Trends</h2>
                    </span>
                    <p className='text-sm text-gray-500 self-center'>Last updated: {data[data.length - 1]?.created_at? new Date(data[data.length - 1].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }): "Data not avaliable"}</p> 
                  </div>
                  <WeeklyHealthTrends data={data} />
                </section>
              )
            }
            {
              data && (
                <section id="records" className="mt-4 mb-2">
                  <div className="sm:flex justify-between mt-4 mb-2">
                    <span className="flex items-center">
                      <History className="mr-2 h-6 w-6" />
                      <h2 className="text-lg font-semibold">Historical Records</h2>
                    </span>
                    <p className='text-sm text-gray-500'>Last updated: {data[data.length - 1]?.created_at? new Date(data[data.length - 1].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Data not avaliable"}</p> 
                  </div>
                  <HealthDashboard data={data? data : null} />
                </section>
              )
            }
            {
              !data && !realTimeData && (
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
