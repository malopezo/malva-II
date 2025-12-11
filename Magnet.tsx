// Get Started: https://www.framer.com/developers
import { useRef, Children } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    motion,
    animate,
    useMotionValue,
    useAnimationFrame,
} from "framer-motion"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function Magnet({ transition, children, intensity }) {
    const hasChild = Children.count(children) > 0

    const isHoveringRef = useRef(false)
    const lastEvent = useRef<React.PointerEvent | null>(null)

    const x = useMotionValue<number>(0)
    const y = useMotionValue<number>(0)

    useAnimationFrame(() => {
        const e = lastEvent.current
        if (isHoveringRef.current && e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            const _x = (e.clientX - rect.left - rect.width / 2) * intensity
            const _y = (e.clientY - rect.top - rect.height / 2) * intensity
            animate(x, _x, transition.frame)
            animate(y, _y, transition.frame)
        }
    })
    return (
        <motion.div
            style={{
                x,
                y,
            }}
            onHoverStart={() => {
                isHoveringRef.current = true
            }}
            onHoverEnd={() => {
                isHoveringRef.current = false
                lastEvent.current = null
                animate(x, 0, transition.end)
                animate(y, 0, transition.end)
            }}
            onPointerMove={(e) => {
                lastEvent.current = e
            }}
        >
            {hasChild ? children : <Placeholder />}
        </motion.div>
    )
}

function Placeholder() {
    return (
        <div
            style={{
                backgroundColor: "rgba(0,0,0,0.9)",
                width: 320,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                lineHeight: 1,
                textAlign: "center",
                fontSize: 12,
            }}
        >
            <div>
                <p>🧲</p>
                <strong>Connect to Content</strong>
                <p>Add children to use the Magnet effect</p>
            </div>
        </div>
    )
}

addPropertyControls(Magnet, {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    transition: {
        type: ControlType.Object,
        controls: {
            frame: {
                type: ControlType.Transition,
                defaultValue: {
                    type: "tween",
                    duration: 0.4,
                    ease: [0, 0, 1, 1],
                },
            },
            end: {
                type: ControlType.Transition,
                defaultValue: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    mass: 3,
                },
            },
        },
    },
    intensity: {
        type: ControlType.Number,
        defaultValue: 1,
        min: 0,
        max: 2,
        step: 0.01,
    },
})
