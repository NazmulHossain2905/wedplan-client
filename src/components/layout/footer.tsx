import { Logo } from "@/components/shared/logo";
import { CATEGORIES } from "@/data/categories";
import { APP_TAGLINE, CONTACT_INFO } from "@/lib/constants";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "../shared/social-icons";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Twitter", href: "https://twitter.com", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#2b1e24] text-white/85">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            {APP_TAGLINE} Discover trusted wedding professionals, beautiful
            venues, and everything in between — all in one place.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WedPlan on ${s.label}`}
                className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-rose-soft hover:text-burgundy"
              >
                <s.icon aria-hidden className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="mb-4 font-serif text-base font-semibold text-white">
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link className="transition-colors hover:text-rose-soft" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link
                className="transition-colors hover:text-rose-soft"
                href="/services"
              >
                Browse Services
              </Link>
            </li>
            <li>
              <Link
                className="transition-colors hover:text-rose-soft"
                href="/sign-up?role=vendor"
              >
                Become a Vendor
              </Link>
            </li>
            <li>
              <Link
                className="transition-colors hover:text-rose-soft"
                href="/sign-in"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Service categories">
          <h3 className="mb-4 font-serif text-base font-semibold text-white">
            Categories
          </h3>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  className="transition-colors hover:text-rose-soft"
                  href={`/services?category=${encodeURIComponent(c.name)}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 font-serif text-base font-semibold text-white">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-rose-soft"
              />
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="transition-colors hover:text-rose-soft"
              >
                {CONTACT_INFO.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-rose-soft"
              />
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-rose-soft"
              >
                {CONTACT_INFO.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-rose-soft"
              />
              <span>{CONTACT_INFO.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} WedPlan. All rights reserved.</p>
          <p>Crafted with love for beautiful weddings.</p>
        </div>
      </div>
    </footer>
  );
}
