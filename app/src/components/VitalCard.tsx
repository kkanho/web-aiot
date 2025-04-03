import React from 'react'
import ProgressBar from './ProgressBar'

interface VitalCardProps extends Omit<React.HTMLProps<HTMLDivElement>, 'value' | 'icon' | 'unit' | 'min' | 'max'> {
    vital: string
    value: number | null
    icon: React.ReactNode
    unit: string
    min: number
    max: number
    offset: number
    bloodPressureDiastolicValue?: number
    bloodPressureDiastolicMin?: number
    bloodPressureDiastolicMax?: number

}

const VitalCard = ({vital, value, icon, unit, min, max, offset, bloodPressureDiastolicValue, bloodPressureDiastolicMin, bloodPressureDiastolicMax, ...props}: VitalCardProps) => {

    return (
        <div className='w-full rounded-sm border p-4 flex flex-col gap-2' {...props}>
            <div className='flex justify-between'>
                <h2 className='text-lg'>{vital}</h2>
                {icon}
            </div>
            <p className='text-3xl font-extrabold'>{bloodPressureDiastolicValue? `${value}/${bloodPressureDiastolicValue}`: value} {unit}</p>
            <span>
                <p className='text-sm text-gray-500'>Normal Range: {bloodPressureDiastolicMin? `${min}/${bloodPressureDiastolicMin}`: min}-{bloodPressureDiastolicMax? `${min}/${bloodPressureDiastolicMax}`: max} {unit}</p>
            </span>
            <ProgressBar value={Number(value)} offset={offset} min={min} max={max} />
        </div>
    )
}

export default VitalCard