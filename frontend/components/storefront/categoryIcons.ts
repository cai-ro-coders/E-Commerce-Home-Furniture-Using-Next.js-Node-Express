import {
  Armchair,
  Baby,
  Bed,
  BedDouble,
  Boxes,
  Briefcase,
  CookingPot,
  Lamp,
  LayoutGrid,
  Sofa,
  Table2,
  Trees,
  Tv,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * A small, hand-picked icon per category slug.
 *
 * The category table has no icon column, and a generic folder for every row
 * makes the mega menu read like a file browser. Matching on the slug keeps the
 * mapping local and falls back gracefully for categories created later.
 */
const ICONS: Record<string, LucideIcon> = {
  'living-room': Sofa,
  'sofas-sectionals': Armchair,
  'coffee-tables': Table2,
  bedroom: BedDouble,
  'beds-bed-frames': Bed,
  mattresses: Bed,
  'dining-room': UtensilsCrossed,
  'office-study': Briefcase,
  'outdoor-patio': Trees,
  'decor-lighting': Lamp,
  'kitchen-storage': CookingPot,
  'kids-nursery': Baby,
  'tv-media-units': Tv,
  'clearance-archive': Boxes,
};

export function categoryIcon(slug: string | undefined): LucideIcon {
  return (slug && ICONS[slug]) || LayoutGrid;
}
