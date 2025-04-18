import { Data } from '../App'
import WeeklyTrendCard from './WeeklyTrendCard';
import { Footprints, Heart } from "lucide-react";

interface WeeklyHealthTrendsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'data'> {
    data: Data[] | null
}


const WeeklyHealthTrends = ({data, ...props}: WeeklyHealthTrendsProps) => {

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const now = new Date();

    // filter the data to only include the past week (7 days)
    const pastWeekData = data ? data.filter((item) => {
        const itemDate = new Date(item.created_at);
        const diffTime = now.getTime() - itemDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }) : [];

    const calculateDailyAverages = (data: Data[], key: keyof Data) => {
        // Initialize the object
        const dailySums: { 
            [key: string]: {
                sum: number; 
                count: number 
            } 
        } = {};
        
        // Initialize dailySums
        weekday.forEach(day => {
            dailySums[day] = { sum: 0, count: 0 };
        });
        
        // Calculate the sum and count for each day
        data.forEach((d) => {
            const itemDate = new Date(d.created_at);
            const day = weekday[itemDate.getDay()];
            const value = parseFloat(String(d[key]));
            
            if (!isNaN(value)) {
                dailySums[day].sum += value;
                dailySums[day].count += 1;
            } else {
                console.warn(`Invalid value for ${key} on ${day}: ${d[key]}`);
            }
        });
        
        // Return the average for each day
        const dailyAverages = weekday.map((day) => {
            const dayData = dailySums[day];
            return dayData.count > 0 ? (dayData.sum / dayData.count).toFixed(2) : '0.00';
        });


        const todayIndex = now.getDay();
        const adjustedAverages = dailyAverages.slice(todayIndex + 1).concat(dailyAverages.slice(0, todayIndex + 1));

         // Map today's data to index 6
        return adjustedAverages.slice(0, 6).concat(adjustedAverages.slice(6, 7));
    };
    

    const weeklyLabels = weekday.slice(now.getDay() + 1).concat(weekday.slice(0, now.getDay() + 1)).map((day, index) => {
        if (index === 6) {
            return `${day} (today)`;
        }
        const itemDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
        return `${day} (${itemDate.getDate()}/${itemDate.getMonth() + 1})`;
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