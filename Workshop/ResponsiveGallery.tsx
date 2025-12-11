// ResponsiveGallery component with smooth height transitions on window resize
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, startTransition, type CSSProperties } from "react"

interface ResponsiveGalleryImage {
    src: string
    alt: string
}

interface ResponsiveGalleryProps {
    images: ResponsiveGalleryImage[]
    contentWidth: number
    gutter: number
    columns: number
    transitionDuration: number
    backgroundColor: string
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ResponsiveGallery(props: ResponsiveGalleryProps) {
    const {
        images,
        contentWidth = 100,
        gutter = 0.6,
        columns = 3,
        transitionDuration = 0.5,
        backgroundColor = "#F5F5F5",
        style,
    } = props

    const rowSize = `calc((var(--content-width) - (var(--gutter) * (var(--columns) - 1))) / var(--columns))`

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "auto",
                backgroundColor,
            }}
        >
            <div
                className="gallery"
                style={
                    {
                        "--content-width": `${contentWidth}vw`,
                        "--gutter": `${gutter}rem`,
                        "--columns": columns,
                        "--row-size": rowSize,
                        display: "grid",
                        width: "100%",
                        maxWidth: "var(--content-width)",
                        gridTemplateColumns: "repeat(var(--columns), 1fr)",
                        gridAutoRows: "var(--row-size)",
                        gridColumnGap: "var(--gutter)",
                        gridRowGap: "var(--gutter)",
                        margin: "0 auto",
                        padding: "2rem",
                        transition: `height ${transitionDuration}s ease-in-out`,
                    } as CSSProperties
                }
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            borderRadius: "8px",
                            backgroundColor: "#EEEEEE",
                        }}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

addPropertyControls(ResponsiveGallery, {
    images: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                src: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
                alt: {
                    type: ControlType.String,
                    title: "Alt Text",
                    defaultValue: "ResponsiveGallery image",
                },
            },
        },
        defaultValue: [
            {
                src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
                alt: "ResponsiveGallery image 1",
            },
            {
                src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
                alt: "ResponsiveGallery image 2",
            },
            {
                src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
                alt: "ResponsiveGallery image 3",
            },
            {
                src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
                alt: "ResponsiveGallery image 4",
            },
            {
                src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
                alt: "ResponsiveGallery image 5",
            },
            {
                src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
                alt: "ResponsiveGallery image 6",
            },
        ],
    },
    contentWidth: {
        type: ControlType.Number,
        title: "Content Width",
        defaultValue: 100,
        min: 50,
        max: 100,
        step: 1,
        unit: "vw",
    },
    gutter: {
        type: ControlType.Number,
        title: "Gutter",
        defaultValue: 0.6,
        min: 0,
        max: 3,
        step: 0.1,
        unit: "rem",
    },
    columns: {
        type: ControlType.Number,
        title: "Columns",
        defaultValue: 3,
        min: 1,
        max: 6,
        step: 1,
        displayStepper: true,
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition Duration",
        defaultValue: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "s",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#F5F5F5",
    },
})