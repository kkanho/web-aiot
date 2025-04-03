

interface ProgressBarProps extends Omit<React.HTMLProps<HTMLDivElement>, 'value' | 'min' | 'max'> {
    value: number
    offset: number
    min: number
    max: number
}

const ProgressBar = ({value, offset, min, max, ...props}: ProgressBarProps) => {

    // Between min +5 and max -5 -> green
    // < min -5 | > max +5 -> red
    // Between min +5 and max -5 -> yellow

    const percentage = value / (max + 30) * 100
    const progressBarStyle = {
        width: `${percentage > max+30 ? 100 : percentage < 10 ? 10 : percentage}%`,
        transition: 'width 0.5s ease-in-out',
    }

    return (
        <div className="w-full h-2.5 bg-gray-600 rounded-full" {...props}>
            <div
                className={`h-2.5 rounded-full ease-in-out an ${value > min + offset && value < max - offset ? 'bg-green-400' : value < min - offset || value > max + offset ? 'bg-red-400' : 'bg-yellow-400'}`}
                style={progressBarStyle}
            ></div>
        </div>
    )
}

export default ProgressBar