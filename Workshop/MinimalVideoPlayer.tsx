// Minimal Video Player
import {
    useState,
    useRef,
    useEffect,
    startTransition,
    type CSSProperties,
} from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

interface MinimalVideoPlayerProps {
    videoFile: string
    videoUrl: string
    useUrl: boolean
    posterImage: any
    showPoster: boolean
    backgroundColor: string
    playButtonColor: string
    progressColor: string
    timeColor: string
    autoPlay: boolean
    autoPlayDelay: number
    showControls: boolean
    borderRadius: number
    playButtonSize: number
    overlayOpacity: number
    progressBarHeight: number
    controlsPadding: number
    timeFont: any
    hoverTransitionDuration: number
    fadeOutDuration: number
    muted: boolean
    loop: boolean
    style?: CSSProperties
}

/**
 * Minimal Video Player
 *
 * @framerIntrinsicWidth 800
 * @framerIntrinsicHeight 450
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function MinimalVideoPlayer(props: MinimalVideoPlayerProps) {
    const {
        videoFile = "",
        videoUrl = "",
        useUrl = true,
        posterImage = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Video poster",
        },
        showPoster = true,
        backgroundColor = "#000000",
        playButtonColor = "#FFFFFF",
        progressColor = "#FF4444",
        timeColor = "#FFFFFF",
        autoPlay = false,
        autoPlayDelay = 0,
        showControls = true,
        borderRadius = 8,
        playButtonSize = 80,
        overlayOpacity = 0.7,
        progressBarHeight = 4,
        controlsPadding = 16,
        timeFont,
        hoverTransitionDuration = 0.3,
        fadeOutDuration = 0.8,
        muted = true,
        loop = true,
    } = props

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showPlayButton, setShowPlayButton] = useState(!autoPlay)
    const [isHovered, setIsHovered] = useState(false)
    const [hasPlayedOnce, setHasPlayedOnce] = useState(autoPlay)
    const [showPosterImage, setShowPosterImage] = useState(showPoster)
    const isStatic = useIsStaticRenderer()

    useEffect(() => {
        const video = videoRef.current
        if (!video || isStatic) return

        const updateTime = () => {
            startTransition(() => {
                setCurrentTime(video.currentTime)
                setDuration(video.duration || 0)
            })
        }

        const handlePlay = () => {
            startTransition(() => {
                setIsPlaying(true)
                setShowPlayButton(false)
                setHasPlayedOnce(true)
            })
        }

        const handlePause = () => {
            startTransition(() => {
                setIsPlaying(false)
                setShowPlayButton(true)
            })
        }

        const handleReady = () => {
            setTimeout(() => setShowPosterImage(false), 50)
        }

        const handleError = () => {
            setShowPosterImage(true)
            setIsPlaying(false)
        }

        video.addEventListener("timeupdate", updateTime)
        video.addEventListener("loadedmetadata", updateTime)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)
        video.addEventListener("playing", handleReady)
        video.addEventListener("error", handleError)

        return () => {
            video.removeEventListener("timeupdate", updateTime)
            video.removeEventListener("loadedmetadata", updateTime)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
            video.removeEventListener("playing", handleReady)
            video.removeEventListener("error", handleError)
        }
    }, [isStatic])

    useEffect(() => {
        const video = videoRef.current
        if (!video || isStatic || !autoPlay) return

        let timer: NodeJS.Timeout | null = null

        if (autoPlayDelay > 0) {
            timer = setTimeout(() => {
                video.play().catch(() => setShowPosterImage(true))
            }, autoPlayDelay)
        } else {
            video.play().catch(() => setShowPosterImage(true))
        }

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [autoPlay, autoPlayDelay, isStatic])

    const togglePlay = () => {
        if (isStatic) return
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play().catch(() => setShowPosterImage(true))
        }
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isStatic) return
        const video = videoRef.current
        if (!video || !duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const newTime = (clickX / rect.width) * duration
        video.currentTime = newTime
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    const videoSource = useUrl ? videoUrl : videoFile

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor,
                overflow: "hidden",
                borderRadius: `${borderRadius}px`,
                display: "flex",
                flexDirection: "column",
                ...props.style,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={togglePlay}
            >
                {showPoster && (
                    <img
                        src={posterImage.src}
                        alt={posterImage.alt || "Poster"}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: `${borderRadius}px`,
                            zIndex: 1,
                            opacity: showPosterImage ? 1 : 0,
                            transition: `opacity ${fadeOutDuration}s ease`,
                        }}
                    />
                )}

                <video
                    ref={videoRef}
                    src={videoSource}
                    muted={muted}
                    loop={loop}
                    playsInline
                    controls={false}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: `${borderRadius}px`,
                        zIndex: 0,
                    }}
                />

                {showPlayButton && !isStatic && (
                    <button
                        onClick={togglePlay}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: `${playButtonSize}px`,
                            height: `${playButtonSize}px`,
                            borderRadius: "50%",
                            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            opacity: isHovered || showPlayButton ? 1 : 0.7,
                            transition: `opacity ${hoverTransitionDuration}s ease`,
                        }}
                    >
                        <div
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: `${playButtonSize * 0.25}px solid ${playButtonColor}`,
                                borderTop: `${playButtonSize * 0.1875}px solid transparent`,
                                borderBottom: `${playButtonSize * 0.1875}px solid transparent`,
                                marginLeft: `${playButtonSize * 0.0625}px`,
                            }}
                        />
                    </button>
                )}
            </div>

            {showControls && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: `${controlsPadding}px`,
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        opacity: isHovered || !hasPlayedOnce ? 1 : 0,
                        transition: `opacity ${hoverTransitionDuration}s ease`,
                        zIndex: 3,
                    }}
                >
                    <button
                        onClick={togglePlay}
                        style={{
                            width: "24px",
                            height: "24px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                        }}
                    >
                        {isPlaying ? (
                            <div style={{ display: "flex", gap: "2px" }}>
                                <div
                                    style={{
                                        width: "3px",
                                        height: "12px",
                                        backgroundColor: playButtonColor,
                                    }}
                                />
                                <div
                                    style={{
                                        width: "3px",
                                        height: "12px",
                                        backgroundColor: playButtonColor,
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `8px solid ${playButtonColor}`,
                                    borderTop: "6px solid transparent",
                                    borderBottom: "6px solid transparent",
                                    marginLeft: "2px",
                                }}
                            />
                        )}
                    </button>

                    <span
                        style={{
                            color: timeColor,
                            minWidth: "40px",
                            ...timeFont,
                        }}
                    >
                        {formatTime(currentTime)}
                    </span>

                    <div
                        onClick={handleProgressClick}
                        style={{
                            flex: 1,
                            height: `${progressBarHeight}px`,
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            borderRadius: `${progressBarHeight / 2}px`,
                            cursor: isStatic ? "default" : "pointer",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: `${progress}%`,
                                height: "100%",
                                backgroundColor: progressColor,
                                borderRadius: `${progressBarHeight / 2}px`,
                                transition: "width 0.1s ease",
                            }}
                        />
                    </div>

                    <span
                        style={{
                            color: timeColor,
                            minWidth: "40px",
                            ...timeFont,
                        }}
                    >
                        {formatTime(duration)}
                    </span>
                </div>
            )}
        </div>
    )
}

addPropertyControls(MinimalVideoPlayer, {
    useUrl: {
        type: ControlType.Boolean,
        title: "Use URL",
        defaultValue: false,
    },
    videoUrl: {
        type: ControlType.String,
        title: "Video URL",
        hidden: ({ useUrl }) => !useUrl,
    },
    videoFile: {
        type: ControlType.File,
        title: "Video File",
        allowedFileTypes: ["mp4", "webm", "mov"],
        hidden: ({ useUrl }) => useUrl,
    },
    showPoster: {
        type: ControlType.Boolean,
        title: "Show Poster",
        defaultValue: true,
    },
    posterImage: {
        type: ControlType.ResponsiveImage,
        title: "Poster Image",
        hidden: ({ showPoster }) => !showPoster,
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#000",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Border Radius",
        defaultValue: 8,
        min: 0,
        max: 50,
        step: 1,
    },
    autoPlay: {
        type: ControlType.Boolean,
        title: "Auto Play",
        defaultValue: false,
    },
    autoPlayDelay: {
        type: ControlType.Number,
        title: "Autoplay Delay (ms)",
        defaultValue: 0,
        min: 0,
        max: 10000,
        step: 500,
        hidden: ({ autoPlay }) => !autoPlay,
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop",
        defaultValue: true,
    },
    muted: {
        type: ControlType.Boolean,
        title: "Sound",
        defaultValue: true,
        enabledTitle: "Muted",
        disabledTitle: "Sound",
    },
    showControls: {
        type: ControlType.Boolean,
        title: "Show Controls",
        defaultValue: true,
    },
    playButtonColor: {
        type: ControlType.Color,
        title: "Play Button Color",
        defaultValue: "#FFF",
    },
    playButtonSize: {
        type: ControlType.Number,
        title: "Play Button Size",
        defaultValue: 80,
        min: 40,
        max: 120,
        step: 5,
    },
    overlayOpacity: {
        type: ControlType.Number,
        title: "Overlay Opacity",
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1,
    },
    progressColor: {
        type: ControlType.Color,
        title: "Progress Color",
        defaultValue: "#FF4444",
    },
    progressBarHeight: {
        type: ControlType.Number,
        title: "Progress Bar Height",
        defaultValue: 4,
        min: 1,
        max: 12,
        step: 1,
    },
    timeColor: {
        type: ControlType.Color,
        title: "Time Color",
        defaultValue: "#FFF",
    },
    timeFont: { type: ControlType.Font, title: "Time Font" },
    controlsPadding: {
        type: ControlType.Number,
        title: "Controls Padding",
        defaultValue: 16,
        min: 1,
        max: 32,
        step: 2,
    },
    hoverTransitionDuration: {
        type: ControlType.Number,
        title: "Hover Transition",
        defaultValue: 0.3,
        min: 0.1,
        max: 1,
        step: 0.1,
    },
    fadeOutDuration: {
        type: ControlType.Number,
        title: "Fade Out (s)",
        defaultValue: 0.8,
        min: 0.1,
        max: 3,
        step: 0.1,
    },
})
