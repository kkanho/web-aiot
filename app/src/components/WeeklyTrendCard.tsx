import { Chart as ChartJS, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface WeeklyTrendCardProps extends Omit<React.HTMLProps<HTMLDivElement>, 'value' | 'icon' | 'labels' | 'data'> {
    vital: string
    label: string
    icon: React.ReactNode
    labels: string[]
    data: string[]
    borderColor: string
    backgroundColor: string
}

const WeeklyTrendCard = ({vital, label, icon, labels, data, borderColor, backgroundColor, ...props}: WeeklyTrendCardProps) => {
    return (
        <div className='w-full rounded-sm border p-4 flex flex-col gap-2' {...props}>
            <div className='flex justify-between'>
                <h2 className='text-lg'>{vital}</h2>
                {icon}
            </div>
            <div>
                <Bar data={{
                    labels: labels,
                    datasets: [
                        {
                            label: label,
                            data: data,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                        },
                    ],
                }} className="forPrinting"/>
            </div>
        </div>
    )
}

export default WeeklyTrendCard