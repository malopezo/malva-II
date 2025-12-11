// Analog clock, minimal, works on dark backgrounds, seconds hand a different color
import * as React from "react"
import { addPropertyControls, ControlType, useIsOnFramerCanvas } from "framer"

/**
 * Clock
 * Minimal analog clock for dark backgrounds. Seconds hand is a different color.
 * @framerIntrinsicWidth 180
 * @framerIntrinsicHeight 180
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function Clock(props) {
    const {
        backgroundColor,
        hourColor,
        minuteColor,
        secondColor,
        tickColor,
        showTicks,
    } = props
    const isOnCanvas = useIsOnFramerCanvas()
    const [now, setNow] = React.useState(new Date())

    React.useEffect(() => {
        if (isOnCanvas) return
        const interval = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [isOnCanvas])

    const size = 180
    const center = size / 2
    const radius = center - 8
    const hour = now.getHours() % 12
    const minute = now.getMinutes()
    const second = now.getSeconds()

    // Angles
    const hourAngle = (hour + minute / 60) * 30
    const minuteAngle = (minute + second / 60) * 6
    const secondAngle = second * 6

    // Hand lengths
    const hourLen = radius * 0.5
    const minLen = radius * 0.75
    const secLen = radius * 0.85

    // Ticks
    const ticks = showTicks
        ? Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180)
              const x1 = center + Math.cos(angle) * (radius - 6)
              const y1 = center + Math.sin(angle) * (radius - 6)
              const x2 = center + Math.cos(angle) * (radius - 2)
              const y2 = center + Math.sin(angle) * (radius - 2)
              return (
                  <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={tickColor}
                      strokeWidth={2}
                  />
              )
          })
        : null

    return (
        <div
            style={{
                ...props.style,
                width: size,
                height: size,
                background: backgroundColor,
                borderRadius: "0%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            }}
        >
            <svg width={size} height={size} style={{ display: "block" }}>
                {/* Face */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={backgroundColor}
                />
                {/* Ticks */}
                {ticks}
                {/* Hour hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={
                        center +
                        hourLen * Math.cos((hourAngle - 90) * (Math.PI / 180))
                    }
                    y2={
                        center +
                        hourLen * Math.sin((hourAngle - 90) * (Math.PI / 180))
                    }
                    stroke={hourColor}
                    strokeWidth={5}
                    strokeLinecap="round"
                />
                {/* Minute hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={
                        center +
                        minLen * Math.cos((minuteAngle - 90) * (Math.PI / 180))
                    }
                    y2={
                        center +
                        minLen * Math.sin((minuteAngle - 90) * (Math.PI / 180))
                    }
                    stroke={minuteColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                />
                {/* Second hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={
                        center +
                        secLen * Math.cos((secondAngle - 90) * (Math.PI / 180))
                    }
                    y2={
                        center +
                        secLen * Math.sin((secondAngle - 90) * (Math.PI / 180))
                    }
                    stroke={secondColor}
                    strokeWidth={2}
                />
                {/* Center dot */}
                <circle cx={center} cy={center} r={4} fill={secondColor} />
            </svg>
        </div>
    )
}

addPropertyControls(Clock, {
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#181A1B",
    },
    hourColor: {
        type: ControlType.Color,
        title: "Hour Hand",
        defaultValue: "#fff",
    },
    minuteColor: {
        type: ControlType.Color,
        title: "Minute Hand",
        defaultValue: "#fff",
    },
    secondColor: {
        type: ControlType.Color,
        title: "Second Hand",
        defaultValue: "#FF4B4B",
    },
    tickColor: {
        type: ControlType.Color,
        title: "Ticks",
        defaultValue: "#333",
    },
    showTicks: {
        type: ControlType.Boolean,
        title: "Show Ticks",
        defaultValue: false,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
})

export default Clock
