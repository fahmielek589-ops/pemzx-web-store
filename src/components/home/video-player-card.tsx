"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerCardProps {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string;
}

export function VideoPlayerCard({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  category,
}: VideoPlayerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    setPlaying(true);
    // Wait for the video element to mount with controls before playing.
    requestAnimationFrame(() => videoRef.current?.play());
  }

  return (
    <article className="video-player-card">
      <div className="video-player-card__media">
        {playing ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl ?? undefined}
            controls
            className="video-player-card__video"
          />
        ) : (
          <button
            className="video-player-card__poster"
            onClick={handlePlay}
            aria-label={`Play ${title}`}
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="" />
            ) : (
              <div className="video-player-card__poster-placeholder" />
            )}
            <span className="video-player-card__play-btn">
              <Play size={22} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="video-player-card__body">
        <span className="video-player-card__category">{category}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
