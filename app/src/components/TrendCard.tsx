import React from 'react'
import { Chart as ChartJS, CategoryScale, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TrendCardProps extends Omit<React.HTMLProps<HTMLDivElement>, 'value' | 'icon' | 'labels' | 'data'> {
    vital: string
    icon: React.ReactNode
    labels: string[]
    data: number[]
    data2?: number[] 
    borderColor: string
    backgroundColor: string
    borderColor2?: string
    backgroundColor2?: string
}

const TrendCard = ({vital, icon, labels, data, data2, borderColor, backgroundColor, borderColor2, backgroundColor2, ...props}: TrendCardProps) => {
    return (
        <div className='w-full rounded-sm border p-4 flex flex-col gap-2' {...props}>
            <div className='flex justify-between'>
                <h2 className='text-lg'>{vital}</h2>
                {icon}
            </div>
            <div>
                <Line data={{
                    labels: labels,
                    datasets: data2 ? [
                        {
                            label: "Blood Presure Systolic",
                            data: data,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                        },
                        {
                            label: "Blood Presure Diatolic",
                            data: data2,
                            borderColor: borderColor2,
                            backgroundColor: backgroundColor2,
                        },
                    ] : [
                        {
                            label: vital,
                            data: data,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                        },
                    ],
                }} className="forChartPrinting"/>
            </div>
        </div>
    )
}

export default TrendCard