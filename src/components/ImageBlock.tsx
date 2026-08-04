import Image from "next/image";

/**
 * A figure in the lesson flow.
 *
 * Figures are allowed to cross into the margin rail — they are one of the
 * three things that may (the others are code blocks and tables). The caption
 * stays left-aligned under the image rather than centred: it is a sentence,
 * and sentences are read from the left.
 */
interface ImageBlockProps {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function ImageBlock({
  src,
  alt,
  title,
  caption,
  width = 800,
  height = 600,
  className = "",
  priority = false,
}: ImageBlockProps) {
  return (
    <figure className={`measure-wide m-0 ${className}`.trim()}>
      {title && <div className="micro mb-3">{title}</div>}

      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--rule)",
          borderRadius: 3,
          background: "var(--bg2)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full object-contain"
          style={{ maxHeight: "70vh" }}
        />
      </div>

      {caption && (
        <figcaption
          className="mt-3"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "var(--text-note)",
            lineHeight: 1.55,
            color: "var(--tx3)",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
