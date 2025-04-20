import { Triangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Data } from "../App"


interface HealthDashboardProps extends Omit<React.HTMLProps<HTMLDivElement>, 'data'> {
    data: Data[] | null
}

const HealthDashboard = ({data, ...props}: HealthDashboardProps) => {

    const [dashboardData, setDashboardData] = useState<Data[] | null>(data); // For dashboard data
    const triangleRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (data) {
            setDashboardData(data);
        }
    }, [data])

    return (
        <div className="max-h-screen overflow-y-auto border border-slate-300 rounded relative" {...props}>
            {dashboardData ? (
            <table className="w-full table-auto border-spacing-2" cellPadding={4} cellSpacing={2}>
                <thead className="sticky -top-0.5 bg-slate-50 border-b">
                    <tr>
                        <th className="text-center p-4">
                        <button 
                            className="w-full h-full flex items-center justify-center gap-2 hover:opacity-45" 
                            title="Sort by date"
                            onClick={() => {
                                setDashboardData(dashboardData.toReversed())
                                triangleRef.current?.classList.toggle("rotate-180")
                            }}
                        >
                            Date
                            <Triangle className="h-4 w-4 fill-black rotate-180" ref={triangleRef}/>
                        </button>
                        </th>
                        <th className="text-center p-4">Time</th>
                        <th className="text-center p-4">Heart Rate (bpm)</th>
                        <th className="text-center p-4">Systolic Pressure (mmHg)</th>
                        <th className="text-center p-4">Diastolic Pressure (mmHg)</th>
                        <th className="text-center p-4">Temperature (°C)</th>
                        <th className="text-center p-4">Oxygen (%)</th>
                        <th className="text-center p-4">Steps</th>
                    </tr>
                </thead>
                <tbody>
                    {dashboardData.toReversed().map((item, index) => (
                        <tr key={index} className="not-even:bg-slate-100 hover:bg-slate-200">
                            <td
                                className={`text-center border-y border-slate-300 p-4 `}
                            >{new Date(item.created_at).toLocaleDateString()}</td>
                            <td
                                className={`text-center border-y border-slate-300 p-4`}
                            >{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                            <td // 60-100 bpm
                                className={`text-center border-y border-slate-300 p-4 ${item.heartRate < 60 ? "text-red-500" : item.heartRate > 100 ? "text-red-500" : "text-green-400"}`}
                            >{item.heartRate}</td>
                            <td // 90-120 mmHg
                                className={`text-center border-y border-slate-300 p-4 ${Number(item.bloodPressure.split("/")[0]) < 90 ? "text-red-500" : Number(item.bloodPressure.split("/")[0]) > 120 ? "text-red-500" : "text-green-400"}`}
                            >{item.bloodPressure.split("/")[0]}</td>
                            <td // 60-80 mmHg
                                className={`text-center border-y border-slate-300 p-4 ${Number(item.bloodPressure.split("/")[1]) < 60 ? "text-red-500" : Number(item.bloodPressure.split("/")[1]) > 80 ? "text-red-500" : "text-green-400"}`}
                            >{item.bloodPressure.split("/")[1]}</td>
                            <td // 36-37 °C
                                className={`text-center border-y border-slate-300 p-4 ${item.temperature < 35.5 ? "text-red-500" : item.temperature > 37.5 ? "text-red-500" : "text-green-400"}`}
                            >{item.temperature}</td>
                            <td // 95-100%
                                className={`text-center border-y border-slate-300 p-4 ${item.oxygen < 95 ? "text-red-500" : item.oxygen > 100 ? "text-red-500" : "text-green-400"}`}
                            >{item.oxygen}</td>
                            <td 
                                className={`text-center border-y border-slate-300 p-4`}
                            >{item.steps}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div className="w-full h-96 flex items-center justify-center">
                <p className="text-gray-500">No data available</p>
            </div>
        )}
    </div>
    )
}

export default HealthDashboard