// Phantom-Inspired Draggable Infinite Gallery - Framer compatible version
import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    startTransition,
} from "react"
import { addPropertyControls, ControlType } from "framer"

interface GalleryItem {
    title: string
    image: { src: string; alt: string }
    year: number
    href: string
}

interface InfiniteGalleryProps {
    items: GalleryItem[]
    cellSize: number
    backgroundColor: string
    textColor: string
    borderColor: string
    cellPadding: number
    gap: number
    zoomValue: number
    arcAmount: number
    arcMaxAngleDeg: number
    arcAxis: "horizontal" | "vertical"
    edgeFade: number
    hoverColor: string
    border: {
        width: number
        style: string
        color: string
        showTop: boolean
        showBottom: boolean
        showLeft: boolean
        showRight: boolean
    }
    parallaxEnabled: boolean
    parallaxStrength: number
    parallaxEase: number
    parallaxWhileDragging: boolean
    inertiaEnabled: boolean
    throwFriction: number
    throwVelocityScale: number
    throwMinSpeed: number
    throwMaxSpeed: number
    style?: React.CSSProperties
}

// helpers (same as before)
function computePinnedOffset(
    prevSize: number,
    nextSize: number,
    pivot: { x: number; y: number },
    prevOffset: { x: number; y: number }
) {
    const worldX = (pivot.x - prevOffset.x) / prevSize
    const worldY = (pivot.y - prevOffset.y) / prevSize
    return {
        x: pivot.x - worldX * nextSize,
        y: pivot.y - worldY * nextSize,
    }
}

function toRadians(deg: number) {
    return (deg * Math.PI) / 180
}

function calcArcTransform(opts: {
    cellCenterX: number
    cellCenterY: number
    viewportW: number
    viewportH: number
    arcAxis: "horizontal" | "vertical"
    arcMaxAngleDeg: number
    arcAmount: number
}) {
    const {
        cellCenterX,
        cellCenterY,
        viewportW,
        viewportH,
        arcAxis,
        arcMaxAngleDeg,
        arcAmount,
    } = opts

    const maxAngle =
        toRadians(arcMaxAngleDeg) * Math.max(0, Math.min(1, arcAmount))
    if (maxAngle === 0) return { z: 0, yawDeg: 0, pitchDeg: 0, edgeFactor: 0 }

    if (arcAxis === "horizontal") {
        const dx = (cellCenterX - viewportW / 2) / (viewportW / 2)
        const angle = dx * maxAngle
        const radius = viewportW / (2 * Math.sin(Math.max(0.001, maxAngle)))
        const z = -radius * (Math.cos(angle) - 1)
        const yawDeg = -(angle * 180) / Math.PI
        const edgeFactor = Math.min(1, Math.abs(dx))
        return { z, yawDeg, pitchDeg: 0, edgeFactor }
    } else {
        const dy = (cellCenterY - viewportH / 2) / (viewportH / 2)
        const angle = dy * maxAngle
        const radius = viewportH / (2 * Math.sin(Math.max(0.001, maxAngle)))
        const z = -radius * (Math.cos(angle) - 1)
        const pitchDeg = (angle * 180) / Math.PI
        const edgeFactor = Math.min(1, Math.abs(dy))
        return { z, yawDeg: 0, pitchDeg, edgeFactor }
    }
}

export default function PhantomInfiniteGallery(props: InfiniteGalleryProps) {
    const {
        items = [],
        cellSize = 200,
        backgroundColor = "#000000",
        textColor = "#808080",
        borderColor = "#FFFFFF",
        cellPadding = 10,
        gap = 12,
        arcAmount = 0.6,
        arcMaxAngleDeg = 28,
        arcAxis = "horizontal",
        edgeFade = 0.25,
        border = {
            width: 1,
            style: "solid",
            color: "#FFFFFF",
            showTop: false,
            showBottom: true,
            showLeft: true,
            showRight: true,
        },
        parallaxEnabled = true,
        parallaxStrength = 0.1,
        parallaxEase = 0.12,
        parallaxWhileDragging = false,
        inertiaEnabled = true,
        throwFriction = 0.92,
        throwVelocityScale = 1.0,
        throwMinSpeed = 80,
        throwMaxSpeed = 2500,
    } = props as any

    const containerRef = useRef<HTMLDivElement>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [currentCellSize, setCurrentCellSize] = useState(cellSize)
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
    const [targetMouseOffset, setTargetMouseOffset] = useState({ x: 0, y: 0 })

    // ... (keep all your refs, inertia, pointer handlers, RAF loop exactly as in your original code) ...

    // Generate grid cells
    const gridCells = []
    const gridSize = 20
    const cellWithGap = currentCellSize
    const startX = Math.floor(-offset.x / cellWithGap) - 5
    const startY = Math.floor(-offset.y / cellWithGap) - 5

    for (let y = startY; y < startY + gridSize; y++) {
        for (let x = startX; x < startX + gridSize; x++) {
            const itemIndex = Math.abs((x + y * 3) % items.length)
            const item = items[itemIndex]

            const tileLeft = x * cellWithGap + offset.x + mouseOffset.x
            const tileTop = y * cellWithGap + offset.y + mouseOffset.y
            const tileW = currentCellSize
            const tileH = currentCellSize

            const cellCenterX = tileLeft + tileW / 2
            const cellCenterY = tileTop + tileH / 2

            const { z, yawDeg, pitchDeg, edgeFactor } = calcArcTransform({
                cellCenterX,
                cellCenterY,
                viewportW: 800,
                viewportH: 600,
                arcAxis,
                arcMaxAngleDeg,
                arcAmount,
            })

            const scale = 1 - edgeFade * (edgeFactor * edgeFactor)
            const opacity = 1 - 0.4 * (edgeFactor * arcAmount)

            gridCells.push(
                <a
                    key={`${x}-${y}`}
                    href={item?.href || "#"}
                    onClick={(e) => {
                        if (isDragging) {
                            e.preventDefault() // block navigation if user dragged
                        }
                    }}
                    style={{
                        position: "absolute",
                        left: tileLeft,
                        top: tileTop,
                        width: tileW,
                        height: tileH,
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            borderTop: border.showTop
                                ? `${border.width}px ${border.style} ${border.color}`
                                : "none",
                            borderLeft: border.showLeft
                                ? `${border.width}px ${border.style} ${border.color}`
                                : "none",
                            borderRight: border.showRight
                                ? `${border.width}px ${border.style} ${border.color}`
                                : "none",
                            borderBottom: border.showBottom
                                ? `${border.width}px ${border.style} ${border.color}`
                                : "none",
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            padding: `${cellPadding}px`,
                            boxSizing: "border-box",
                            transformStyle: "preserve-3d",
                            transform: `translate3d(0, 0, ${z}px) rotateY(${yawDeg}deg) rotateX(${pitchDeg}deg) scale(${scale})`,
                            opacity,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                props.hoverColor || "#FF5588"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                backgroundImage: `url(${item?.image?.src || ""})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                marginBottom: `${gap}px`,
                            }}
                        />
                        <div
                            style={{
                                color: textColor,
                                fontSize: "12px",
                                fontFamily: "monospace",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                }}
                            >
                                {item?.title || "Project"}
                            </span>
                            <span>{item?.year || 2024}</span>
                        </div>
                    </div>
                </a>
            )
        }
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor,
                position: "relative",
                overflow: "hidden",
                touchAction: "none",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                perspective: "1000px",
                transformStyle: "preserve-3d",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    transformStyle: "preserve-3d",
                }}
            >
                {gridCells}
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.8) 90%, rgba(0,0,0,1) 100%)`,
                }}
            />
        </div>
    )
}

// keep property controls so panel works
addPropertyControls(PhantomInfiniteGallery, {
    items: {
        type: ControlType.Array,
        title: "Items",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, defaultValue: "Project" },
                image: { type: ControlType.ResponsiveImage },
                year: {
                    type: ControlType.Number,
                    defaultValue: 2024,
                    min: 1900,
                    max: 2100,
                    displayStepper: true,
                },
                href: {
                    type: ControlType.String,
                    defaultValue: "/sample-project",
                },
            },
        },
    },
    cellSize: {
        type: ControlType.Number,
        title: "Cell Size",
        defaultValue: 200,
    },
    gap: { type: ControlType.Number, title: "Image Gap", defaultValue: 12 },
    backgroundColor: { type: ControlType.Color, title: "Background" },
    textColor: { type: ControlType.Color, title: "Text Color" },
    hoverColor: {
        type: ControlType.Color,
        title: "Hover Color",
        defaultValue: "#FF5588",
    },
})
