import { Data } from '../App'
import WeeklyTrendCard from './WeeklyTrendCard';
import { Footprints, Heart } from "lucide-react";

interface WeeklyHealthTrendsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'data'> {
    data: Data[] | null
}


const WeeklyHealthTrends = ({data, ...props}: WeeklyHealthTrendsProps) => {

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const now = new Date();

    // filter the data to only include the past week
    const pastWeekData = data
        ? data.filter((item) => {
            const itemDate = new Date(item.created_at);
            const diffTime = now.getTime() - itemDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        })
        : [];

    const calculateDailyAverages = (data: Data[], key: keyof Data) => {
        // init the object
        const dailySums: { 
            [key: string]: {
                sum: number; 
                count: number 
            } 
        } = {};

        // calculate the sum and count for each day
        data.forEach((item) => {
            const itemDate = new Date(item.created_at);
            const day = weekday[itemDate.getDay()];
            if (!dailySums[day]) {
                dailySums[day] = { sum: 0, count: 0 };
            }
            dailySums[day].sum += item[key] as number;
            dailySums[day].count += 1;
        });

        // return the average for each day
        return weekday.map((day) => {
            const dayData = dailySums[day];
            return dayData ? (dayData.sum / dayData.count).toFixed(2) : '0.00';
        });
    };

    const weeklyLabels = weekday.slice(now.getDay() + 1).concat(weekday.slice(0, now.getDay() + 1)).map((day, index) => {
        if (index === 6) {
            return `${day} (today)`;
        }
        return day;
    });

    return (
        <div {...props}>
            {
                data ? (
                    <div className='w-full grid grid-cols-1 gap-4 justify-between'>
                        <WeeklyTrendCard 
                            vital={"Heart Rate"}
                            label={"Average Daily Heart Rate"}
                            icon={<Heart className='text-red-400' />}
                            labels={weeklyLabels}
                            data={calculateDailyAverages(pastWeekData, 'heartRate')}
                            borderColor='rgb(255, 99, 132)'
                            backgroundColor='rgba(255, 99, 132, 0.5)'
                        />
                        <WeeklyTrendCard
                            vital={"Activity Levels"} 
                            label={"Daily Steps"}
                            icon={<Footprints className='text-green-400' />}
                            labels={weeklyLabels}
                            data={calculateDailyAverages(pastWeekData, 'steps')}
                            borderColor='rgb(99, 255, 109)'
                            backgroundColor='rgba(99, 255, 109, 0.5)'
                        />
                        
                    </div>
                ) : (
                    <div className="w-full h-96 flex items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                    </div>
                )
            }
        </div>
    )
}

export default WeeklyHealthTrends