import type { Testimonial } from "@/types";

const img = (id: string, w = 200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "tst_001",
    name: "Ayesha",
    partner: "Imran",
    location: "Dhaka",
    weddingDate: "December 2025",
    rating: 5,
    text: "WedPlan connected us with the most incredible photographer. James and his team captured moments we didn't even know were happening. Every time we open the album, we relive the day.",
    avatar: img("photo-1580489944761-15a19d654956"),
    serviceName: "Carter Photography Studio",
  },
  {
    id: "tst_002",
    name: "Nusrat",
    partner: "Rahim",
    location: "Chattogram",
    weddingDate: "January 2026",
    rating: 5,
    text: "Booking the Grand Ballroom through WedPlan was effortless. We compared venues, read reviews, and secured our date within a week. The venue team was outstanding from start to finish.",
    avatar: img("photo-1544005313-94ddf0286df2"),
    serviceName: "Grand Meridian Venues",
  },
  {
    id: "tst_003",
    name: "Farhana",
    partner: "David",
    location: "Sylhet",
    weddingDate: "February 2026",
    rating: 4.5,
    text: "As an inter-faith couple, finding vendors who understood our blended ceremony felt impossible. WedPlan's filters helped us find decorators who nailed both traditions beautifully.",
    avatar: img("photo-1524504388940-b1c1722653e1"),
    serviceName: "Ever After Events",
  },
  {
    id: "tst_004",
    name: "Sadia",
    partner: "Tanvir",
    location: "Dhaka",
    weddingDate: "November 2025",
    rating: 5,
    text: "My bridal makeup was flawless — it survived twelve hours, three outfit changes, and a lot of happy tears. Ayesha understood exactly the look I wanted from one reference photo.",
    avatar: img("photo-1531123897727-8f129e1688ce"),
    serviceName: "Blush & Bloom Bridal Beauty",
  },
  {
    id: "tst_005",
    name: "Priya",
    partner: "Arjun",
    location: "Dhaka",
    weddingDate: "March 2026",
    rating: 4.5,
    text: "The catering team from Saffron Tales gave our 400 guests a feast they still talk about. The live jilapi station was the highlight of the night. Booking through the platform was seamless.",
    avatar: img("photo-1599566150163-29194dcaad36"),
    serviceName: "Saffron Tales Catering",
  },
  {
    id: "tst_006",
    name: "Mim",
    partner: "Sakib",
    location: "Cox's Bazar",
    weddingDate: "October 2025",
    rating: 5,
    text: "We planned our entire beach wedding on WedPlan — photographer, decor, and makeup. Tracking every booking request in one dashboard kept us completely stress-free.",
    avatar: img("photo-1573496359142-b8d87734a5a2"),
    serviceName: "Multiple vendors",
  },
];

export const WHY_CHOOSE = [
  {
    icon: "ShieldCheck",
    title: "Trusted Wedding Professionals",
    description:
      "Every vendor is reviewed by our team before their services go live, so you browse with complete confidence.",
  },
  {
    icon: "Search",
    title: "Easy Service Discovery",
    description:
      "Search, filter, and compare hundreds of wedding services by category, price, and location in seconds.",
  },
  {
    icon: "CalendarCheck",
    title: "Simplified Booking",
    description:
      "Send booking requests directly to vendors and track their status — all from one organised dashboard.",
  },
  {
    icon: "BadgeDollarSign",
    title: "Transparent Pricing",
    description:
      "Clear, upfront pricing on every listing means no hidden costs and no awkward negotiations.",
  },
  {
    icon: "Heart",
    title: "Personalised Planning",
    description:
      "Message vendors with your vision, from mandap themes to bridal glam, and get responses tailored to you.",
  },
  {
    icon: "Lock",
    title: "Secure & Convenient",
    description:
      "Your bookings and conversations happen on a secure platform built for peace of mind.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Explore Services",
    description: "Browse verified photographers, venues, decorators, and artists across the country.",
  },
  {
    step: "02",
    title: "Find Your Perfect Vendor",
    description: "Compare portfolios, prices, and reviews to shortlist the team that fits your vision.",
  },
  {
    step: "03",
    title: "Submit Your Booking",
    description: "Request bookings with your event date and details — vendors respond within the platform.",
  },
  {
    step: "04",
    title: "Plan Your Dream Wedding",
    description: "Track every booking in your dashboard and count down to the big day with confidence.",
  },
] as const;
