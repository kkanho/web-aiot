import { Data } from "../App"
import TrendCard from "./TrendCard";
import { Activity, Brain, Footprints, Heart, Thermometer } from "lucide-react";


interface HealthTrendsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'data'> {
    data: Data[] | null
}

const HealthTrends = ({data, ...props}: HealthTrendsProps) => {

    // const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    // const weekly = data ? data.slice(-8).map((item) => new Date(item.created_at).getDay()) : [];
    // weekly.map((day) => weekday[day]);

    const lables = data ? data.map((item) => new Date(item.created_at).toLocaleTimeString()) : [];


    return (
        <div {...props}>
            {data ? (
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4 justify-between'>
                    <TrendCard 
                        vital={"Heart Rate"} 
                        icon={<Heart className='text-red-400' />}
                        labels={lables}
                        data={data.map((item) => item.heartRate)}
                        borderColor='rgb(255, 99, 132)'
                        backgroundColor='rgba(255, 99, 132, 0.5)'
                    />
                    <TrendCard 
                        vital={"Blood Pressure"} 
                        icon={<Activity className='text-cyan-400' />}
                        labels={lables}
                        data={data.map((item) => parseFloat(item.bloodPressure.split('/')[0]))}
                        data2={data.map((item) => parseFloat(item.bloodPressure.split('/')[1]))}
                        borderColor='rgb(99, 224, 255)'
                        backgroundColor='rgba(99, 224, 255, 0.5)'
                        borderColor2='rgb(255, 242, 99)'
                        backgroundColor2='rgba(255, 242, 99, 0.5)'
                    />
                    <TrendCard 
                        vital={"Temperature"} 
                        icon={<Thermometer className='text-pink-400' />}
                        labels={lables}
                        data={data.map((item) => item.temperature)}
                        borderColor='rgb(247, 99, 255)'
                        backgroundColor='rgba(247, 99, 255, 0.5)'
                    />
                    <TrendCard 
                        vital={"Oxygen"} 
                        icon={<Brain className='text-blue-400' />}
                        labels={lables}
                        data={data.map((item) => item.oxygen)}
                        borderColor='rgb(99, 169, 255)'
                        backgroundColor='rgba(99, 169, 255, 0.5)'
                    />
                    <TrendCard 
                        vital={"Activity Levels"} 
                        icon={<Footprints className='text-green-400' />}
                        labels={lables}
                        data={data.map((item) => item.steps)}
                        borderColor='rgb(99, 255, 109)'
                        backgroundColor='rgba(99, 255, 109, 0.5)'
                    />
                </div>
            ): (
                <div className="w-full h-96 flex items-center justify-center">
                    <p className="text-gray-500">No data available</p>
                </div>
            )}
        </div>
    )
}

export default HealthTrends