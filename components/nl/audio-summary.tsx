import { nlAudioDuration, type NlAudio } from "@/lib/nl-audio";
import { staticAsset } from "#static-asset";

/** Samenvatting om te beluisteren, met uitklapbare transcriptie (toegankelijk) en hint op de synthetische stem. */
export function NlAudioSummary({ audio, heading }: { audio: NlAudio | null; heading: string }) {
  if (!audio) return null;
  return <section className="nl-audio" aria-label={heading}>
    <div className="nl-audio-head">
      <span className="nl-audio-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4" /></svg>
      </span>
      <div>
        <p className="nl-audio-kicker">Kort beluisteren · {nlAudioDuration(audio.seconds)} min</p>
        <h2>{heading}</h2>
      </div>
    </div>
    <audio className="nl-audio-player" controls preload="metadata" src={staticAsset(audio.src)}>
      Je browser ondersteunt het audio-element niet.
    </audio>
    <p className="nl-audio-note">Tekst geschreven en gecontroleerd door de redactie, voorgelezen door een synthetische stem.</p>
    <details className="nl-audio-transcript">
      <summary>Lees de transcriptie</summary>
      <p>{audio.text}</p>
    </details>
  </section>;
}
