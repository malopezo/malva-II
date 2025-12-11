import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

interface GridHoverImageProps {
    images: string[]
    mobileColumns?: number
    tabletColumns?: number
    desktopColumns?: number
    gap?: number
    expandScale?: number
    transitionDuration?: number
}

export function GridHoverImage({
    images = [],
    mobileColumns = 1,
    tabletColumns = 2,
    desktopColumns = 3,
    gap = 12,
    expandScale = 1.2,
    transitionDuration = 0.3,
}: GridHoverImageProps) {
    return (
        <div
            data-grid
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${mobileColumns}, 1fr)`,
                gap: `${gap}px`,
            }}
        >
            <style>{`
        @media (min-width: 600px) {
          div[data-grid] {
            grid-template-columns: repeat(${tabletColumns}, 1fr);
          }
        }
        @media (min-width: 900px) {
          div[data-grid] {
            grid-template-columns: repeat(${desktopColumns}, 1fr);
          }
        }
      `}</style>

            {images.map((src, i) => (
                <motion.div
                    key={i}
                    whileHover={{
                        scale: expandScale,
                        zIndex: 2,
                    }}
                    transition={{ duration: transitionDuration }}
                    style={{
                        width: "100%",
                        height: "200px",
                        overflow: "hidden",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    <motion.img
                        src={src}
                        alt={`Grid item ${i + 1}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </motion.div>
            ))}
        </div>
    )
}

// 🔑 Property controls for Framer
addPropertyControls(GridHoverImage, {
    images: {
        type: ControlType.Array,
        propertyControl: { type: ControlType.Image },
        title: "Images",
    },
    mobileColumns: {
        type: ControlType.Number,
        defaultValue: 1,
        min: 1,
        max: 4,
        title: "Mobile Cols",
    },
    tabletColumns: {
        type: ControlType.Number,
        defaultValue: 2,
        min: 1,
        max: 6,
        title: "Tablet Cols",
    },
    desktopColumns: {
        type: ControlType.Number,
        defaultValue: 3,
        min: 1,
        max: 8,
        title: "Desktop Cols",
    },
    gap: { type: ControlType.Number, defaultValue: 12, min: 0, max: 50 },
    expandScale: {
        type: ControlType.Number,
        defaultValue: 1.2,
        min: 1,
        max: 2,
        step: 0.05,
    },
    transitionDuration: {
        type: ControlType.Number,
        defaultValue: 0.3,
        min: 0,
        max: 2,
        step: 0.1,
    },
})
