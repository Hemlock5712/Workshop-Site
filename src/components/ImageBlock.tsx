import Image from "next/image";

/**
 * Optimized image display component for workshop content
 * Features:
 * - Next.js Image optimization with lazy loading
 * - Consistent styling and responsive behavior
 * - Optional titles and captions for educational context
 * - Configurable dimensions and priority loading
 * - Professional presentation for hardware/technical images
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
    <figure className={`my-8 ${className}`}>
      {title && (
        <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          {title}
        </h4>
      )}

      <div className="card overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="w-full h-auto object-contain"
          style={{ maxHeight: "70vh" }}
        />
      </div>

      {caption && (
        <figcaption className="text-sm text-[var(--muted-foreground)] mt-3 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
