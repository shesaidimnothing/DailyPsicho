'use client';

import { motion } from 'framer-motion';
import type { VideoEmbed as VideoEmbedType } from '@/types/topic';

interface VideoEmbedProps {
  video: VideoEmbedType;
  index?: number;
}

export default function VideoEmbed({ video, index = 0 }: VideoEmbedProps) {
  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (platform === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="my-8"
    >
      <div className="border border-foreground/20 p-4 bg-background/50">
        <h3 className="font-title text-lg mb-3 font-semibold" data-translate>{video.title}</h3>
        {video.description && (
          <p className="text-sm text-foreground/70 mb-4" data-translate>{video.description}</p>
        )}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={getEmbedUrl(video.url, video.platform)}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      </div>
    </motion.div>
  );
}

