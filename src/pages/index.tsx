// pages/dual-video.tsx
import { useRef, useState } from 'react'

const FEDERER_CONTACT = 2.33

const DualVideo = () => {
    const videoRef1 = useRef<HTMLVideoElement | null>(null)
    const videoRef2 = useRef<HTMLVideoElement | null>(null)
    const seekBarRef = useRef<HTMLInputElement | null>(null)
    const [seekTime, setSeekTime] = useState<number>(0)
    const [videoSrc1, setVideoSrc1] = useState<string>(null)
    const [timestamp, setTimestamp] = useState<number>(0) // To store the current timestamp
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    // Set the playback rate to half speed
    const setPlaybackRate = (rate: number) => {
        if (videoRef1.current) {
            videoRef1.current.playbackRate = rate
        }
        if (videoRef2.current) {
            videoRef2.current.playbackRate = rate
        }
    }

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = Number(event.target.value) / 1000.0
        if (videoRef1.current) {
            if (timestamp) {
                videoRef1.current.currentTime =
                    seekTime + (timestamp - FEDERER_CONTACT)
            } else {
                videoRef1.current.currentTime = seekTime
            }
            if (videoRef2.current) {
                videoRef2.current.currentTime = seekTime
            }
        }
    }

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef1.current?.pause()
            videoRef2.current?.pause()
        } else {
            videoRef1.current?.play()
            videoRef2.current?.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleSubmit = async () => {
        if (videoRef1.current) {
            setTimestamp(videoRef1.current.currentTime)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef1.current) {
            const currentTime = videoRef1.current.currentTime
            setSeekTime(currentTime * 1000.0)
            if (seekBarRef.current) {
                seekBarRef.current.style.setProperty(
                    '--seek-time',
                    `${currentTime}`
                )
            }
        }
    }

    const handleVideoLoadedMetadata = () => {
        if (videoRef1.current && videoRef2.current) {
            const duration = Math.min(
                videoRef1.current.duration,
                videoRef2.current.duration
            )
            if (seekBarRef.current) {
                seekBarRef.current.style.setProperty(
                    '--duration',
                    `${duration}`
                )
            }
        }
    }

    // Handle video file upload and convert it to a URL to be played
    const handleVideoUpload = (
        event: ChangeEvent<HTMLInputElement>,
        setVideoSrc: Function
    ) => {
        const file = event.target.files?.[0]
        if (file) {
            const videoUrl = URL.createObjectURL(file)
            console.log('videoUrl', videoUrl)
            setVideoSrc(videoUrl)
        }
    }

    console.log(videoSrc1)

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <input
                type="file"
                accept="video/*"
                onChange={(event) => {
                    handleVideoUpload(event, setVideoSrc1)
                }}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '80%',
                    maxHeight: '70vh',
                }}
            >
                <video
                    ref={videoRef1}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    style={{ width: '45%' }}
                    src={videoSrc1}
                />

                {timestamp && (
                    <video
                        ref={videoRef2}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        style={{ width: '45%' }}
                    >
                        <source src="/fed.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
            {/* Submit Button */}
            <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
                Submit Timestamp
            </button>
            {videoRef1.current && (
                <input
                    type="range"
                    min="0"
                    max={videoRef1.current.duration * 1000 || 2}
                    onChange={handleSeek}
                    value={seekTime}
                    ref={seekBarRef}
                    style={{ width: '80%', marginTop: '20px' }}
                />
            )}
            <button onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div style={{ display: 'flex' }}>
                <button onClick={() => setPlaybackRate(0.1)}>0.1x</button>
                <button onClick={() => setPlaybackRate(0.5)}>0.5x</button>
                <button onClick={() => setPlaybackRate(1.0)}>1x</button>
            </div>
            <div>{seekTime / 1000.0} seconds</div>
            <div>Ball contact at {timestamp}</div>
        </div>
    )
}

export default DualVideo
