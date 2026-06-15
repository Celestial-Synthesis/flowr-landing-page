type TrackedYouTubeEmbedProps = {
  iframeId: string;
  videoId: string;
  title: string;
  className?: string;
};

export function TrackedYouTubeEmbed({
  iframeId,
  videoId,
  title,
  className = "",
}: TrackedYouTubeEmbedProps) {
  return (
    <iframe
      id={iframeId}
      title={title}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className={className}
    />
  );
}
