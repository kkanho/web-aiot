import { Activity, Brain, Footprints, Heart, Thermometer } from 'lucide-react'
import { Data } from '../App'
import VitalCard from './VitalCard'
import ProgressBar from './ProgressBar'

interface LiveVitalsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'data'> {
    data: Data | null
}

const LiveVitals = ({data, ...props}: LiveVitalsProps) => {
    return (
        <div {...props}>
            {data ?  (
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4 justify-between'>
                    <VitalCard 
                        vital={"Heart Rate"}
                        value={data.heartRate} 
                        icon={<Heart className='text-red-400' />} 
                        unit={"BPM"} 
                        min={60} 
                        max={100}
                        offset={5}
                    />
                    <VitalCard 
                        vital={"Blood Pressure"}
                        value={Number(data.bloodPressure.split('/')[0])} 
                        icon={<Activity className='text-cyan-400' />} 
                        unit={"mmHg"} 
                        min={90} 
                        max={120}
                        offset={10}
                        bloodPressureDiastolicValue={Number(data.bloodPressure.split('/')[1])}
                        bloodPressureDiastolicMin={60}
                        bloodPressureDiastolicMax={80}
                    />
                    <VitalCard 
                        vital={"Temperature"}
                        value={data.temperature} 
                        icon={<Thermometer className='text-pink-400' />} 
                        unit={"°C"} 
                        min={35} 
                        max={37}
                        offset={0}
                    />
                    <VitalCard 
                        vital={"Oxygen"}
                        value={data.oxygen} 
                        icon={<Brain className='text-blue-400' />} 
                        unit={"%"} 
                        min={94} 
                        max={100}
                        offset={0}
                    />

                    <div className='w-full sm:col-span-2 rounded-sm border p-4 flex flex-col gap-2' {...props}>
                        <div className='flex justify-between'>
                            <h2 className='text-lg'>Activity Levels</h2>
                            <Footprints className='text-green-400' />
                        </div>
                        <p className='text-3xl font-extrabold'>{data.steps}</p>
                        <span className="">
                            <p className='text-sm text-gray-500'>Steps today</p>
                        </span>
                        <ProgressBar value={Number(data.steps)} offset={0} min={200} max={15000} />
                    </div>
                </div>
            ) : (
                <div>
                    <p>No data available</p>
                </div>
            )}
        </div>
    )
}

export default LiveVitals