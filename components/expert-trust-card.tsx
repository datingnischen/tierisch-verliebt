import Link from "next/link";
import type { AuthorProfile } from "@/lib/author-profiles";

type ExpertTrustCardProps = {
  profile: AuthorProfile;
  eyebrow?: string;
  title?: string;
  primaryLabel?: string;
  primaryHref?: string;
  registrationHref?: string;
};

export function ExpertTrustCard({
  profile,
  eyebrow = "Begleitet von unserem Datingexperten",
  title = "Die Inhalte greifen Dating-Erfahrung, Tierliebe und alltagsnahe Fragen rund ums Kennenlernen auf.",
  primaryLabel = "Zum Autorenprofil",
  primaryHref,
  registrationHref = "https://tierisch-verliebt.de/?AID=magazin",
}: ExpertTrustCardProps) {
  return (
    <article className="expert-card panel-card">
      <div className="expert-card-media">
        {profile.imageUrl ? (
          <img src={profile.imageUrl} alt={profile.name} loading="lazy" decoding="async" />
        ) : (
          <div className="expert-card-avatar-fallback" aria-hidden="true">
            {profile.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
      </div>

      <div className="expert-card-copy">
        <span className="eyebrow eyebrow-brand">{eyebrow}</span>
        <h2>{title}</h2>
        <h3>{profile.name}</h3>
        <p className="expert-role">{profile.role}</p>
        <p>{profile.bio}</p>

        <ul className="expert-facts" aria-label="Expertise und Vertrauenssignale">
          {profile.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>

        <div className="button-row">
          <Link className="button button-primary" href={primaryHref || profile.profileUrl}>
            {primaryLabel}
          </Link>
          <Link className="button button-secondary" href={registrationHref}>
            Kostenlos registrieren
          </Link>
        </div>
      </div>
    </article>
  );
}
