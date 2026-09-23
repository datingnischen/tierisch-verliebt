import Link from "next/link";
import { AuthorSocialIcon } from "@/components/author-social-icon";
import type { AuthorProfile } from "@/lib/author-profiles";

type ExpertTrustCardProps = {
  profile: AuthorProfile;
  eyebrow?: string;
  title?: string;
  primaryLabel?: string;
  primaryHref?: string;
  registrationHref?: string;
  variant?: "full" | "compact";
};

export function ExpertTrustCard({
  profile,
  eyebrow = "Begleitet von unserem Datingexperten",
  title = "Die Inhalte greifen Dating-Erfahrung, Tierliebe und alltagsnahe Fragen rund ums Kennenlernen auf.",
  primaryLabel = "Zum Autorenprofil",
  primaryHref,
  registrationHref = "https://tierisch-verliebt.de/?AID=magazin",
  variant = "full",
}: ExpertTrustCardProps) {
  const compact = variant === "compact";
  const profilePath = primaryHref || profile.profileUrl;

  return (
    <article className={`author-box panel-card${compact ? " author-box-compact" : ""}`}>
      {compact ? null : (
        <div className="author-box-intro">
          <span className="eyebrow eyebrow-brand">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      )}

      <div className="author-box-body">
        <div className="author-box-media">
          {profile.imageUrl ? (
            <img src={profile.imageUrl} alt={`${profile.name} – ${profile.jobTitle}`} loading="lazy" decoding="async" />
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

        <div className="author-box-copy">
          {compact ? <span className="eyebrow eyebrow-brand">{eyebrow}</span> : null}

          <div className="author-box-identity">
            <h3>
              <Link href={profilePath}>{profile.name}</Link>
            </h3>
            <span className="author-box-jobtitle">{profile.jobTitle}</span>
          </div>

          {compact ? null : <p className="expert-role">{profile.role}</p>}

          <p className="author-box-bio">
            {compact ? profile.shortBio : profile.bio}
            {compact ? (
              <>
                {" "}
                <Link className="author-box-bio-link" href={profilePath}>
                  {primaryLabel} <span aria-hidden="true">›</span>
                </Link>
              </>
            ) : null}
          </p>

          {profile.topics.length ? (
            <ul className="author-box-topics" aria-label={`Schwerpunkte von ${profile.name}`}>
              {profile.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : null}

          {compact ? null : (
            <ul className="expert-facts" aria-label="Expertise und Vertrauenssignale">
              {profile.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          )}

          <div className="author-box-footer">
            {profile.socials.length ? (
              <ul className="author-box-socials" aria-label={`${profile.name} in sozialen Netzwerken`}>
                {profile.socials.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={`${profile.name} auf ${social.label}`}
                      title={`${profile.name} auf ${social.label}`}
                    >
                      <AuthorSocialIcon platform={social.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="button-row">
              {compact ? null : (
                <Link className="button button-primary" href={profilePath}>
                  {primaryLabel}
                </Link>
              )}
              <Link className={`button ${compact ? "button-primary button-small" : "button-secondary"}`} href={registrationHref}>
                Kostenlos registrieren
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
