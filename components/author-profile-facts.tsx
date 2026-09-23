import { AuthorSocialIcon } from "@/components/author-social-icon";
import type { AuthorProfile } from "@/lib/author-profiles";

/**
 * Scannable summary of the profile. It states the same facts the Person node carries, so machines
 * and readers get one consistent set of answers instead of a prose-only page.
 */
export function AuthorProfileFacts({ profile }: { profile: AuthorProfile }) {
  if (!profile.profileFacts.length) return null;

  return (
    <section className="author-facts-panel panel-card" aria-labelledby="author-facts-title">
      <div className="author-facts-head">
        <span className="eyebrow eyebrow-brand">Auf einen Blick</span>
        <h2 id="author-facts-title">{profile.name} in Kurzform</h2>
      </div>

      <dl className="author-facts-grid">
        {profile.profileFacts.map((fact) => (
          <div key={fact.label} className="author-facts-item">
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {profile.socials.length ? (
        <ul className="author-facts-socials" aria-label={`Profile von ${profile.name}`}>
          {profile.socials.map((social) => (
            <li key={social.href}>
              <a href={social.href} target="_blank" rel="noopener noreferrer nofollow">
                <AuthorSocialIcon platform={social.platform} />
                <span>{social.label}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
