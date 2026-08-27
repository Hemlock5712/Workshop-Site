"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  /** The YouTube video id, the part after `/embed/`. */
  id: string;
  /** Names the video for screen readers and for the player frame. */
  title: string;
}

/**
 * A YouTube video that shows a sharp still and loads nothing from
 * youtube.com until someone presses play.
 *
 * The bare `<iframe>` this replaces let YouTube choose its own poster, and
 * YouTube chooses `hqdefault.jpg`: 480x360, 4:3, about 13 KB. Stretched
 * across a 16:9 player at the measure width, that is the blur. Every video
 * on this site has a real `maxresdefault.jpg` at 1280x720 and 100 to 160 KB,
 * so the poster here is the actual frame and there is nothing to upscale.
 *
 * Holding the player back until a click is the second reason to have this.
 * `/privacy` says the YouTube player "loads from youtube.com as soon as the
 * page opens", which was true of the iframe and is not true of this. A
 * lesson page with a video on it now makes no third-party request until a
 * reader asks for one.
 */
export default function VideoEmbed({ id, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        // autoplay because the click that mounted this frame was the play
        // press. Without it a reader presses play twice.
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-lg"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-lg p-0"
      style={{ border: "1px solid var(--rule)", background: "var(--bg2)" }}
    >
      <Image
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        // Decorative: the button's aria-label already names the video, and a
        // second reading of the same title is noise on a screen reader.
        alt=""
        fill
        // Body copy stops at --measure, but a figure may take --gutter more.
        sizes="(max-width: 1000px) 100vw, 1000px"
        className="object-cover"
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110"
          // `--lift` is the site's cool secondary, the one already allowed
          // "where a second signal is unavoidable". A play badge over a
          // photographic still is that case: the warm `--accent` sits in the
          // same hue range as the wood, skin and lighting in these frames and
          // stops reading as a control. `--bg` is the ink because it inverts
          // with the theme in the opposite direction to `--lift`, so the
          // triangle stays high-contrast in both without a new token.
          style={{ background: "var(--lift)", color: "var(--bg)" }}
        >
          <Play className="h-6 w-6" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
