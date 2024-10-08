import React, { useRef, useState } from 'react';

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference to the video element
  const [videoFile, setVideoFile] = useState<File | null>(null); // Store the uploaded video file
  const [videoURL, setVideoURL] = useState<string | null>(null); // To store the video file URL
  const [timestamp, setTimestamp] = useState<number>(0); // To store the current timestamp
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload and set the video source
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoSrc = URL.createObjectURL(file);
      setVideoURL(videoSrc);
    }
  };

  // Capture the current timestamp from the video player
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setTimestamp(videoRef.current.currentTime);
    }
  };

  // Handle submission of the timestamp to the server
  const handleSubmit = async () => {
    if (!videoFile) {
      alert('Please upload a video first.');
      return;
    }

    setIsSubmitting(true);

    // Create FormData to send the video and timestamp
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('timestamp', timestamp.toFixed(2));

    try {
      const response = await fetch('/api/ffmpeg', {
        method: 'POST',
        body: formData, // Send the form data with video and timestamp
      });

      const data = await response.json();
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <h1>Video Timestamp Seeker with FFmpeg</h1>

      <div>
        <input type="file" accept="video/*" onChange={handleFileUpload} />
      </div>

      {/* Video Player */}
      {videoFile && videoURL && (
        <div>
          <video
            ref={videoRef}
            controls
            width="600"
            src={videoURL}
            onTimeUpdate={handleTimeUpdate} // Update the timestamp as the user seeks
            style={{ marginTop: '20px', maxHeight: '70vh' }}
          />
        </div>
      )}

      {/* Display the current timestamp */}
      <div style={{ marginTop: '20px' }}>
        <h3>Current Timestamp: {timestamp.toFixed(2)} seconds</h3>
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '20px' }}>
        {isSubmitting ? 'Submitting...' : 'Submit Timestamp'}
      </button>
    </div>
  );
};

export default Home;
