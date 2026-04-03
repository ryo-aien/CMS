import Image from 'next/image';
import Link from 'next/link';
import type { Cast } from '@/types';

type Props = {
  cast: Cast;
};

export default function CastCard({ cast }: Props) {
  return (
    <Link
      href={`/cast/${cast.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-surface-2 border border-border"
    >
      {cast.main_image_url && (
        <Image
          src={cast.main_image_url}
          alt={cast.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-card-gradient" />

      {/* Status badge */}
      {cast.status && (
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-0.5 text-[10px] tracking-widest font-medium bg-accent text-white rounded-full">
            {cast.status}
          </span>
        </div>
      )}

      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-medium text-sm tracking-wide group-hover:text-accent-light transition-colors">
          {cast.name}
        </p>
        <div className="mt-1 w-6 h-0.5 bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </Link>
  );
}
