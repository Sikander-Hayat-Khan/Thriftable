import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      {/* Full Page Crisp Hero Video */}
      <div className="absolute inset-0 z-0">
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-center"
        >
          <source
            src="/hero_section/hero_video_3.mp4"
            media="(max-aspect-ratio: 4/5)"
            type="video/mp4"
          />
          <source
            src="/hero_section/hero_video_3.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video> */}
        <Image src="/hero_section/hero_image_3.png" alt="hero image" fill/>
        {/* Subtle cinematic overlay for depth and text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
      </div>
    </div>
  );
}



