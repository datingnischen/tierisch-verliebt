/**
 * Veröffentlichungen in Nachrichten- und Community-Portalen. Gekaufte Gastbeiträge und Community-Posts
 * werden ausdrücklich so gekennzeichnet – nie als „bekannt aus“ oder redaktionelle Berichterstattung.
 * Ist das Original offline, verlinkt die Karte die Archivfassung der Wayback Machine.
 */
export type PressMention = {
  outlet: string;
  label: string;
  title: string;
  summary: string;
  publishedOn: string;
  url: string;
  archiveUrl?: string;
  archivedOn?: string;
  online: boolean;
};

export const PRESS_MENTIONS: PressMention[] = [
  {
    outlet: "MeinBezirk.at",
    label: "Gastbeitrag in der Regionauten-Community",
    title: "Partnersuche für tierliebe Singles: Auf der Suche nach Liebe und Trost von einem tierischen Partner",
    summary: "Wie tierliebe Singles jemanden finden, der Hund, Katze & Co. genauso liebt – und warum Plattformen mit Tierfokus dabei helfen.",
    publishedOn: "2024-01-10",
    url: "https://www.meinbezirk.at/baden/c-regionauten-community/partnersuche-fuer-tierliebe-singles-auf-der-suche-nach-liebe-und-trost-von-einem-tierischen-partner_a6469597",
    archiveUrl: "https://web.archive.org/web/20240110203735/https://www.meinbezirk.at/baden/c-regionauten-community/partnersuche-fuer-tierliebe-singles-auf-der-suche-nach-liebe-und-trost-von-einem-tierischen-partner_a6469597",
    archivedOn: "2024-01-10",
    online: false,
  },
];

export function formatPressDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
