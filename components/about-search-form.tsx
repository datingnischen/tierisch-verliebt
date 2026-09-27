import { ABOUT_SEARCH_PATH } from "@/lib/about-section";
import { withTrailingSlash } from "@/lib/markets";
import "./about-search.css";

type Props = { query?: string; autoFocus?: boolean; label?: string };

/**
 * GET-Formular der Seitensuche. Das Ziel bleibt relativ (/ueber-uns/suche/): Die Route wird live von
 * nginx an Next.js durchgereicht und liegt auf der Vercel-Vorschau ohne Präfix im Markt de.
 */
export function AboutSearchForm({ query = "", autoFocus = false, label = "Magazin und Städte durchsuchen" }: Props) {
  return (
    <form className="about-search-form" action={withTrailingSlash(ABOUT_SEARCH_PATH)} method="get" role="search">
      <label className="sr-only" htmlFor="about-search-q">{label}</label>
      <input
        id="about-search-q"
        className="about-search-input"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="z. B. Labrador, Katze oder Hamburg"
        maxLength={100}
        autoFocus={autoFocus}
      />
      <button className="button button-primary about-search-button" type="submit">Suchen</button>
    </form>
  );
}
