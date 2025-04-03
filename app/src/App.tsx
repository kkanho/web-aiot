// import { useEffect, useState } from "react"
import d from "./assets/data.json"
import { Download, Heart } from "lucide-react";
import LiveVitals from "./components/LiveVitals";
import HealthTrends from "./components/HealthTrends";
import { useEffect, useState } from "react";

type DataFromThingSpeak = {
  created_at: string,
  field1: number,
  field2: string,
  field3: number,
  field4: number,
  field5: number
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
      heartRate: json.field1,
      bloodPressure: json.field2,
      temperature: json.field3,
      oxygen: json.field4,
      steps: json.field5
  }))
}

function App() {

  // const [data, setData] = useState<Data[] | null>(d);

  // useEffect(() => {
  //   fetch(import.meta.env.VITE_BACKEND_URL)
  //     .then((response) => response.text())
  //     .then((data) => setData(data))
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  const data: Data[] = mapData(d);
  const realTimeData = data[data.length - 1];


  return (
    <>
      <header className="w-full shadow-md mb-4 px-2 md:px-0 border-b h-16">
        <div className="flex items-center justify-between px-0 sm:px-4 xl:px-96">
          <div className="flex h-16 items-center">
            <Heart className="mr-2 h-6 w-6" />
            <h1 className="text-lg font-semibold">HealthMonitor</h1>
          </div>
          <button 
            className="flex justify-between rounded border-2 shadow-md px-4 py-2 hover:bg-gray-100"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-6 w-6" />
            <span>Export</span>
          </button>
        </div>
      </header>
      <main className="px-2 md:px-0">
        <div className="flex flex-col justify-between px-0 sm:px-4 xl:px-96">
          <h1 className="text-4xl font-bold">Health Dashboard</h1>
          <p className="text-sm text-gray-500">Your vitals and health trends</p>
          <div>
            {
              data ? (
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
