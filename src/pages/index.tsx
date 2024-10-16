// pages/dual-video.tsx
import { useRef, useState } from 'react'

const FEDERER_CONTACT = 2.33

const DualVideo = () => {
    const videoRef1 = useRef<HTMLVideoElement | null>(null)
    const videoRef2 = useRef<HTMLVideoElement | null>(null)
    const seekBarRef = useRef<HTMLInputElement | null>(null)
    const [seekTime, setSeekTime] = useState<number>(0)
    const [videoSrc1, setVideoSrc1] = useState<string>('')
    const [contactTimestamp, setContactTimestamp] = useState<number>(0) // To store the current timestamp
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    const videoOffset = contactTimestamp - FEDERER_CONTACT
    console.log(videoOffset, 'videoOffset')

    // Set the playback rate to half speed
    const setPlaybackRate = (rate: number) => {
        if (videoRef1.current) {
            videoRef1.current.playbackRate = rate
        }
        if (videoRef2.current) {
            videoRef2.current.playbackRate = rate
        }
    }

    const handleSeek = (seekTime: number) => {
        if (videoRef1.current) {
            videoRef1.current.currentTime = seekTime
            if (videoRef2.current) {
                if (seekTime - videoOffset < 0) {
                    videoRef2.current.currentTime = 0
                } else {
                    videoRef2.current.currentTime = seekTime - videoOffset
                }
                if (isPlaying) {
                    videoRef1.current?.play()
                }
            }
        }
    }

    const handleSeekEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = Number(event.target.value) / 1000.0
        handleSeek(seekTime)
    }

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef1.current?.pause()
            videoRef2.current?.pause()
        } else {
            handleSeek(seekTime / 1000.0)
            videoRef1.current?.play()
            console.log(seekTime, 'seekTime play pause')
            console.log(videoOffset, 'videoOffset play pause')
            if (seekTime / 1000.0 > videoOffset) {
                videoRef2.current?.play()
            }
        }
        setIsPlaying(!isPlaying)
    }

    const handleSubmit = async () => {
        if (videoRef1.current) {
            setContactTimestamp(videoRef1.current.currentTime)
            setSeekTime(0)
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
        if (videoRef2.current && videoRef2.current.paused) {
            if (seekTime / 1000.0 > videoOffset && isPlaying) {
                videoRef2.current.play()
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
    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const videoUrl = URL.createObjectURL(file)
            setVideoSrc1(videoUrl)
        }
    }

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
                    handleVideoUpload(event)
                }}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
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

                {!!contactTimestamp && (
                    <video
                        ref={videoRef2}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        style={{ width: '45%' }}
                    >
                        <source src="/fed.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
            {/* Submit Button */}
            {!!videoSrc1 && (
                <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
                    Set Ball Contact Timestamp
                </button>
            )}
            {!!videoRef1.current && (
                <div style={{ width: '100%', margin: 'auto' }}>
                    <input
                        type="range"
                        min="0"
                        max={videoRef1.current.duration * 1000 || 2}
                        onChange={handleSeekEvent}
                        value={seekTime}
                        ref={seekBarRef}
                        style={{
                            width: '80%',
                            margin: 'auto',
                            marginTop: '20px',
                        }}
                    />
                    <div>{seekTime / 1000.0} seconds</div>
                    {!!contactTimestamp && (
                        <div>
                            <button onClick={handlePlayPause}>
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                            <div style={{ display: 'flex' }}>
                                <button onClick={() => setPlaybackRate(0.1)}>
                                    0.1x
                                </button>
                                <button onClick={() => setPlaybackRate(0.5)}>
                                    0.5x
                                </button>
                                <button onClick={() => setPlaybackRate(1.0)}>
                                    1x
                                </button>
                            </div>
                            <div>Ball contact at {contactTimestamp}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DualVideo
