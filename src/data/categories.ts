import type { Category } from "@/types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORY_IMAGES = {
  photography: img("photo-1529636798458-92182e662485"),
  venues: img("photo-1519167758481-83f550bb49b3"),
  decoration: img("photo-1478146896981-b80fe463b330"),
  catering: img("photo-1414235077428-338989a2e8c0"),
  makeup: img("photo-1487412947147-5cebf100ffc2"),
  fashion: img("photo-1595959183082-7b570b7e08e2"),
} as const;

export const CATEGORIES: Category[] = [
  {
    id: "photography-videography",
    name: "Photography & Videography",
    description:
      "Award-winning photographers and cinematographers who capture every fleeting moment of your celebration.",
    image: CATEGORY_IMAGES.photography,
  },
  {
    id: "wedding-venues",
    name: "Wedding Venues",
    description:
      "From grand ballrooms to riverside gardens, discover breathtaking spaces that set the stage for your day.",
    image: CATEGORY_IMAGES.venues,
  },
  {
    id: "decoration-florist",
    name: "Decoration & Florist",
    description:
      "Stunning floral installations, mandap styling, and ambient decor tailored to your wedding theme.",
    image: CATEGORY_IMAGES.decoration,
  },
  {
    id: "catering-services",
    name: "Catering Services",
    description:
      "Curated menus from royal Bengali feasts to contemporary continental spreads your guests will remember.",
    image: CATEGORY_IMAGES.catering,
  },
  {
    id: "makeup-styling",
    name: "Makeup & Styling",
    description:
      "Bridal artists who create radiant, camera-ready looks for every event on your wedding calendar.",
    image: CATEGORY_IMAGES.makeup,
  },
  {
    id: "wedding-fashion",
    name: "Wedding Fashion",
    description:
      "Bespoke gowns, hand-embroidered lehengas, and tailored sherwanis crafted by master designers.",
    image: CATEGORY_IMAGES.fashion,
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
