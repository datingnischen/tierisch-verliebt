import data from "../data/nl-audio.json" with { type: "json" };

/**
 * Audio-Samenvattingen für tierisch-verliebt.nl (ElevenLabs eleven_v4, Stimme Roos, Christians Wahl 2026-10-26).
 * Schlüssel „dating/<stad>“ bzw. „magazine/<ras>“; MP3 unter public/audio/nl/, Sprechtext als Transcriptie.
 */
export type NlAudio = { src: string; seconds: number; text: string };

const AUDIO: Record<string, NlAudio> = data;

export function getNlAudio(key: string): NlAudio | null {
  return AUDIO[key] ?? null;
}

/** „0:54“ – Dauer für die Beschriftung. */
export function nlAudioDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
