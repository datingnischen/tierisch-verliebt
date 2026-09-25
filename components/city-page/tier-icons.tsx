import type { GuideAnimal, GuideTopic } from "@/lib/city-guide";

type IconProps = { className?: string };

export function PawIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" fill="currentColor">
      <path d="M32 34c-8.5 0-16 8.6-16 15.2 0 4.5 3.6 6.8 8 6.8 3.3 0 5.3-1.6 8-1.6s4.7 1.6 8 1.6c4.4 0 8-2.3 8-6.8C48 42.6 40.5 34 32 34Z" />
      <ellipse cx="13" cy="27" rx="6" ry="7.6" transform="rotate(-18 13 27)" />
      <ellipse cx="24.5" cy="15" rx="6" ry="8" transform="rotate(-6 24.5 15)" />
      <ellipse cx="39.5" cy="15" rx="6" ry="8" transform="rotate(6 39.5 15)" />
      <ellipse cx="51" cy="27" rx="6" ry="7.6" transform="rotate(18 51 27)" />
    </svg>
  );
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>{children}</svg>;
}

export function DogIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 8.5 3.5 4.8c-.3-.8.5-1.5 1.2-1l3 2.3h6.6l3-2.3c.7-.5 1.5.2 1.2 1L17 8.5" />
      <path d="M5 8.5c-.6 1.3-1 2.8-1 4.3C4 17 7.6 20 12 20s8-3 8-7.2c0-1.5-.4-3-1-4.3" />
      <circle cx="9.2" cy="11.5" r=".6" fill="currentColor" />
      <circle cx="14.8" cy="11.5" r=".6" fill="currentColor" />
      <path d="M10.6 15h2.8L12 16.6Z" fill="currentColor" />
    </Svg>
  );
}

export function CatIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 10V3.5l4.2 3.2h5.6L19 3.5V10" />
      <path d="M5 10c-.6 1-1 2-1 3.2C4 17.4 7.6 20 12 20s8-2.6 8-6.8c0-1.2-.4-2.2-1-3.2" />
      <path d="M9 12.4c.4-.4 1-.4 1.4 0M13.6 12.4c.4-.4 1-.4 1.4 0" />
      <path d="M12 15v1M12 16l-1.4.8M12 16l1.4.8M2.5 14.5 7 15M2.8 17l4.3-.8M21.5 14.5 17 15M21.2 17l-4.3-.8" />
    </Svg>
  );
}

export function TreeIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 21v-5" /><path d="M12 3c-3 0-5.5 2.4-5.5 5.3-1.4.8-2.3 2.2-2.3 3.8 0 2.4 2.1 4 4.6 4h6.4c2.5 0 4.6-1.6 4.6-4 0-1.6-.9-3-2.3-3.8C17.5 5.4 15 3 12 3Z" /></Svg>;
}

export function CupIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M4 9h13v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6Z" /><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H16.6" /><path d="M8 3.5c-.8 1 .8 1.8 0 3M12 3.5c-.8 1 .8 1.8 0 3" /></Svg>;
}

export function BedIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M3 19V6M3 14h18v5M21 14v-2.5A3.5 3.5 0 0 0 17.5 8H11v6" /><circle cx="7" cy="10.5" r="2" /></Svg>;
}

export function VetIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 12v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="10" r="2" /></Svg>;
}

export function ScissorsIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8.2 7.5 20 18M8.2 16.5 20 6" /></Svg>;
}

export function BoneIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M16.8 3.6a2.4 2.4 0 0 1 3.3 3.3 2.4 2.4 0 1 1-2 4.1L11 18.1a2.4 2.4 0 1 1-4.1 2 2.4 2.4 0 0 1-3.3-3.3 2.4 2.4 0 1 1 3.4-3.6L14 6.1a2.4 2.4 0 1 1 2.8-2.5Z" /></Svg>;
}

export function PinIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>;
}

export function HeartIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 20s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.1-8 11-8 11Z" /></Svg>;
}

export function ClockIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
}

export function HorseIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M8 21v-5.5l-3.2-1.8a1.6 1.6 0 0 1-.5-2.3L9 5l1-2.5 1.6 2.3c4.4.4 7.4 4 7.4 8.7V21" /><circle cx="10.5" cy="8.5" r=".6" fill="currentColor" /></Svg>;
}

export function BunnyIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M9 9.5C7.8 6.8 7.5 3.5 8.8 3.1c1.3-.4 2.4 2.8 2.7 5.8M15 9.5c1.2-2.7 1.5-6 .2-6.4-1.3-.4-2.4 2.8-2.7 5.8" /><path d="M6 15a6 5.5 0 1 0 12 0 6 5.5 0 1 0-12 0Z" /><circle cx="10" cy="14" r=".6" fill="currentColor" /><circle cx="14" cy="14" r=".6" fill="currentColor" /></Svg>;
}

export function BirdIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M16 7h.01M3.5 20h7M10.5 20A7 7 0 0 0 17.5 13V9.5L20.5 8 17 6.3A4 4 0 0 0 10 8.8V12l-6.5 8" /></Svg>;
}

export function TopicIcon({ topic, className }: { topic: GuideTopic; className?: string }) {
  switch (topic) {
    case "walk": return <TreeIcon className={className} />;
    case "food": return <CupIcon className={className} />;
    case "stay": return <BedIcon className={className} />;
    case "cat": return <CatIcon className={className} />;
    case "vet": return <VetIcon className={className} />;
    case "groom": return <ScissorsIcon className={className} />;
    case "school": return <BoneIcon className={className} />;
    case "trip": return <PinIcon className={className} />;
    case "love": return <HeartIcon className={className} />;
    default: return <PawIcon className={className} />;
  }
}

export function AnimalIcon({ animal, className }: { animal: GuideAnimal; className?: string }) {
  switch (animal) {
    case "katze": return <CatIcon className={className} />;
    case "pferd": return <HorseIcon className={className} />;
    case "kleintier": return <BunnyIcon className={className} />;
    case "vogel": return <BirdIcon className={className} />;
    default: return <DogIcon className={className} />;
  }
}
