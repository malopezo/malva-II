import {
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
} from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type ShadowSize = "none" | "sm" | "md" | "lg"
type ObjectFit = "contain" | "cover" | "fill"
type SourceType = "upload" | "url" | "youtube"

declare global {
    interface Window {
        YT?: any
        _ytApiLoading?: boolean
    }
}

interface AmbilightVideoProps {
    sourceType: SourceType
    src: string
    fileSrc: string
    youtubeUrl: string
    privacyMode: boolean

    autoplay: boolean
    muted: boolean
    loop: boolean
    controls: boolean
    startTime: number

    radius: number
    shadow: ShadowSize
    objectFit: ObjectFit

    blur: number
    spread: number
    intensity: number
    saturate: number
    brightness: number

    style?: CSSProperties
}

function ytId(url: string) {
    try {
        const u = new URL(url)
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1)
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v")
            if (v) return v
            const m = u.pathname.match(/\/(embed|shorts)\/([^\/\?]+)/)
            if (m) return m[2]
        }
    } catch {}
    return ""
}

function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return
    if (window._ytApiLoading) return
    window._ytApiLoading = true
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
}

/**
 * AmbiLight Video Player
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 960
 * @framerIntrinsicHeight 540
 * @framerLockAspectRatio true
 */

export default function AmbiLightVideo(props: AmbilightVideoProps) {
    const {
        sourceType,
        src,
        fileSrc,
        youtubeUrl,
        autoplay,
        muted,
        loop,
        controls,
        startTime,
        radius,
        shadow,
        objectFit,
        blur,
        spread,
        intensity,
        saturate,
        brightness,
        style,
        privacyMode,
    } = props

    const videoRef = useRef<HTMLVideoElement>(null)
    const glowVideoRef = useRef<HTMLVideoElement>(null)
    const ytMainRef = useRef<HTMLIFrameElement>(null)
    const ytGlowRef = useRef<HTMLIFrameElement>(null)
    const ytPlayerRef = useRef<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const boxShadow =
        shadow === "sm"
            ? "0 1px 2px rgba(0,0,0,0.06)"
            : shadow === "md"
              ? "0 8px 24px rgba(0,0,0,0.12)"
              : shadow === "lg"
                ? "0 16px 48px rgba(0,0,0,0.18)"
                : "none"

    const isYouTube = sourceType === "youtube"
    const youTubeId = useMemo(
        () => (isYouTube ? ytId(youtubeUrl) : ""),
        [isYouTube, youtubeUrl]
    )
    const origin =
        typeof window !== "undefined"
            ? window.location.origin
            : "https://framer.com"

    const effectiveSrc = useMemo(() => {
        if (sourceType === "upload") return fileSrc || ""
        if (sourceType === "url") return src || ""
        return ""
    }, [sourceType, fileSrc, src])

    useEffect(() => {
        if (
            RenderTarget.current() !== RenderTarget.preview &&
            RenderTarget.current() !== RenderTarget.canvas
        )
            return
        if (!isYouTube || !youTubeId) return
        if (!(window.YT && window.YT.Player)) {
            loadYouTubeAPI()
            const i = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(i)
                    setupYT()
                }
            }, 100)
            return () => clearInterval(i)
        } else {
            setupYT()
        }
        function setupYT() {
            if (!ytMainRef.current) return
            ytPlayerRef.current = new window.YT.Player(ytMainRef.current, {
                events: {
                    onReady: (e: any) => {
                        if (startTime > 0) e.target.seekTo(startTime, true)
                        if (autoplay) e.target.playVideo()
                    },
                    onStateChange: (e: any) => {
                        const st = e.data
                        if (st === 1) setIsPlaying(true)
                        if (st === 2 || st === 0) setIsPlaying(false)
                    },
                },
            })
        }
    }, [isYouTube, youTubeId, autoplay, startTime])

    useEffect(() => {
        if (isYouTube) return
        const v = videoRef.current,
            g = glowVideoRef.current
        if (!v || !g) return
        const sync = () => {
            try {
                if (Math.abs((g.currentTime ?? 0) - (v.currentTime ?? 0)) > 0.2)
                    g.currentTime = v.currentTime
                if (v.paused && !g.paused) g.pause()
                if (!v.paused && g.paused) g.play().catch(() => {})
            } catch {}
        }
        v.addEventListener("timeupdate", sync)
        v.addEventListener("play", () => {
            startTransition(() => setIsPlaying(true))
            g.play().catch(() => {})
        })
        v.addEventListener("pause", () =>
            startTransition(() => setIsPlaying(false))
        )
        v.addEventListener("ended", () =>
            startTransition(() => setIsPlaying(false))
        )
        return () => v.removeEventListener("timeupdate", sync)
    }, [isYouTube])

    useEffect(() => {
        if (isYouTube) return
        const v = videoRef.current,
            g = glowVideoRef.current
        if (!v || !g) return
        if (startTime > 0) {
            const seek = () => {
                v.currentTime = Math.max(0, startTime)
                g.currentTime = Math.max(0, startTime)
            }
            if (v.readyState >= 1) seek()
            else v.addEventListener("loadedmetadata", seek, { once: true })
            if (g.readyState < 1)
                g.addEventListener(
                    "loadedmetadata",
                    () => (g.currentTime = Math.max(0, startTime)),
                    { once: true }
                )
        }
    }, [startTime, isYouTube])

    const outer: CSSProperties = {
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "visible",
        background: "transparent",
    }

    const shell: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
    }

    const playerFrame: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: radius,
        boxShadow,
        background: "transparent",
        zIndex: 1,
    }

    const glowVisible = intensity > 0
    const glowOpacity = glowVisible ? (isPlaying ? intensity : 0) : 0

    const glowBase: CSSProperties = {
        position: "absolute",
        inset: 0,
        transform: `scale(${spread})`,
        filter: `blur(${blur}px) saturate(${saturate}) brightness(${brightness})`,
        opacity: glowOpacity,
        transition: "opacity 180ms",
        pointerEvents: "none",
        zIndex: 0,
    }

    const mediaStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        objectFit,
        display: "block",
    }

    if (RenderTarget.current() === RenderTarget.thumbnail) return null
    const ytBase = privacyMode
        ? "https://www.youtube-nocookie.com/embed/"
        : "https://www.youtube.com/embed/"

    const ytCommonQuery =
        `?enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1&playsinline=1` +
        `&controls=${controls ? 1 : 0}&mute=${muted ? 1 : 0}&autoplay=${autoplay ? 1 : 0}` +
        `&loop=${loop ? 1 : 0}&playlist=${loop && youTubeId ? youTubeId : ""}`

    const ytGlowQuery =
        `?enablejsapi=0&rel=0&modestbranding=1&playsinline=1&controls=0&mute=1&autoplay=1&loop=${loop ? 1 : 0}` +
        `${loop && youTubeId ? `&playlist=${youTubeId}` : ""}`

    const ytThumb = youTubeId
        ? `https://img.youtube.com/vi/${youTubeId}/maxresdefault.jpg`
        : ""

    return (
        <div style={outer}>
            {/* Glow layer (immer an, immer muted) */}
            {!isYouTube ? (
                <video
                    ref={glowVideoRef}
                    src={effectiveSrc}
                    muted
                    loop={loop}
                    playsInline
                    preload="metadata"
                    style={{ ...glowBase, ...mediaStyle }}
                />
            ) : youTubeId ? (
                <iframe
                    ref={ytGlowRef}
                    src={`${ytBase}${youTubeId}${ytGlowQuery}`}
                    allow="autoplay; encrypted-media"
                    style={{
                        ...glowBase,
                        border: 0,
                        width: "100%",
                        height: "100%",
                    }}
                    referrerPolicy="strict-origin-when-cross-origin"
                    tabIndex={-1}
                    aria-hidden="true"
                    title=""
                />
            ) : (
                // Fallback, falls YT-ID fehlt
                <div
                    style={{
                        ...glowBase,
                        background: ytThumb
                            ? `center / cover no-repeat url(${ytThumb})`
                            : "transparent",
                    }}
                />
            )}

            {/* Player */}
            <div style={shell}>
                <div style={playerFrame}>
                    {!isYouTube ? (
                        <video
                            ref={videoRef}
                            src={effectiveSrc}
                            autoPlay={autoplay}
                            muted={muted}
                            loop={loop}
                            controls={controls}
                            playsInline
                            preload="metadata"
                            style={mediaStyle}
                            onPlay={() =>
                                startTransition(() => setIsPlaying(true))
                            }
                            onPause={() =>
                                startTransition(() => setIsPlaying(false))
                            }
                            onEnded={() =>
                                startTransition(() => setIsPlaying(false))
                            }
                            crossOrigin="anonymous"
                        />
                    ) : youTubeId ? (
                        <iframe
                            ref={ytMainRef}
                            src={`${ytBase}${youTubeId}${ytCommonQuery}`}
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            style={{ ...mediaStyle, border: 0 }}
                            referrerPolicy="strict-origin-when-cross-origin"
                            title="YouTube video"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(AmbiLightVideo, {
    sourceType: {
        type: ControlType.Enum,
        title: "Source",
        options: ["upload", "url", "youtube"],
        optionTitles: ["Upload", "Video URL", "YouTube"],
        defaultValue: "upload",
        description: "Select the video source.",
    },
    fileSrc: {
        type: ControlType.File,
        title: "Video Upload",
        allowedFileTypes: ["mp4", "webm", "mov"],
        hidden: (p) => p.sourceType !== "upload",
    },
    src: {
        type: ControlType.String,
        title: "Video URL",
        placeholder: "https://…/video.mp4",
        hidden: (p) => p.sourceType !== "url",
    },
    youtubeUrl: {
        type: ControlType.String,
        title: "YouTube",
        placeholder: "https://youtube.com/watch?v=…",
        hidden: (p) => p.sourceType !== "youtube",
        description:
            "Important note: In some regions (especially EU), you may need user consent to load YouTube videos. Also, be sure to reference YouTube/Google in your privacy policy if required in your region.",
    },

    privacyMode: {
        type: ControlType.Boolean,
        title: "Enhanced Privacy",
        defaultValue: true,
        hidden: (p) => p.sourceType !== "youtube",
        description:
            "Uses YouTube's [privacy-enhanced mode](https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode) (youtube-nocookie.com).",
    },

    autoplay: {
        type: ControlType.Boolean,
        title: "Autoplay",
        defaultValue: true,
    },
    muted: { type: ControlType.Boolean, title: "Muted", defaultValue: true },
    loop: { type: ControlType.Boolean, title: "Loop", defaultValue: false },
    controls: {
        type: ControlType.Boolean,
        title: "Controls",
        defaultValue: true,
    },

    startTime: {
        type: ControlType.Number,
        title: "Start Delay(s)",
        defaultValue: 0,
        min: 0,
        max: 36000,
        step: 1,
        displayStepper: true,
        hidden: (p) => p.sourceType === "youtube",
    },

    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 128,
        step: 1,
        unit: "px",
        displayStepper: true,
    },
    shadow: {
        type: ControlType.Enum,
        title: "Shadow",
        options: ["none", "sm", "md", "lg"],
        optionTitles: ["None", "Small", "Medium", "Large"],
        defaultValue: "md",
    },
    objectFit: {
        type: ControlType.Enum,
        title: "Object Fit",
        options: ["cover", "contain", "fill"],
        optionTitles: ["Fill", "Fit", "Stretch"],
        defaultValue: "cover",
        hidden: (props) => props.sourceType === "youtube",
    },

    blur: {
        type: ControlType.Number,
        title: "Blur",
        defaultValue: 48,
        min: 5,
        max: 120,
        step: 1,
        unit: "px",
        description: "Large blur values can impact performance.",
    },
    spread: {
        type: ControlType.Number,
        title: "Spread",
        defaultValue: 1,
        min: 1,
        max: 1.6,
        step: 0.01,
    },
    intensity: {
        type: ControlType.Number,
        title: "Intensity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.05,
    },
    saturate: {
        type: ControlType.Number,
        title: "Saturate",
        defaultValue: 1.5,
        min: 0,
        max: 2,
        step: 0.05,
    },
    brightness: {
        type: ControlType.Number,
        title: "Brightness",
        defaultValue: 1.5,
        min: 0.5,
        max: 2,
        step: 0.05,
        description:
            "An out of storage component. Need help? → framer@outofstorage.de",
    },
})
