/// <reference lib="dom" />
import correctUrl from 'assets/sounds/correct.wav';
import wrongUrl from 'assets/sounds/wrong.wav';
import { SoundName } from 'types/sound.interface';

const URLS: Record<SoundName, string> = { correct: correctUrl, wrong: wrongUrl };
const NAMES: SoundName[] = ['correct', 'wrong'];

/**
 * Web (browsers, webOS, Tizen): Web Audio, not <audio> elements.
 * On TVs every <audio> element runs on the hardware media pipeline, which is released when a
 * clip ends; replaying the same element then reports success but stays silent (seen on an LG
 * webOS 22 TV after one or two answers). Web Audio decodes each file once into memory and plays
 * it with a new one-shot source each time, without the media pipeline.
 */
type AudioContextClass = typeof AudioContext;
const AudioContextImpl: AudioContextClass | undefined =
  typeof window === 'undefined'
    ? undefined
    : window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextClass })
        .webkitAudioContext;

let context: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
const loading = new Set<SoundName>();

function getContext(): AudioContext | null {
  if (!context && AudioContextImpl) {
    context = new AudioContextImpl();
  }
  return context;
}

/**
 * Downloads and decodes one sound into memory, once. XMLHttpRequest, not fetch: TV apps are
 * loaded from local files, which fetch refuses and older engines do not have.
 */
function load(name: SoundName): void {
  const ctx = getContext();
  if (!ctx || buffers.has(name) || loading.has(name)) {
    return;
  }
  loading.add(name);
  const request = new XMLHttpRequest();
  request.open('GET', URLS[name]);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    // Local files answer with status 0, so check the data, not the status.
    if (!request.response) {
      loading.delete(name);
      return;
    }
    // Callback form: older engines return no promise from decodeAudioData.
    ctx.decodeAudioData(
      request.response,
      buffer => {
        buffers.set(name, buffer);
        loading.delete(name);
      },
      () => loading.delete(name),
    );
  };
  request.onerror = () => loading.delete(name);
  request.send();
}

/** No Web Audio at all: a fresh <audio> element per play, so a released one is never reused. */
function playWithElement(name: SoundName): void {
  const audio = new Audio(URLS[name]);
  audio.play()?.catch(() => {});
}

export const soundService = {
  /** Decodes every sound ahead of time, so the first answer is not silent. */
  preload(): void {
    NAMES.forEach(load);
  },

  /**
   * Plays from the start, even while the same sound is still playing (each play is its own
   * source). Browsers keep audio suspended until the first key press; it is resumed here,
   * which runs right after a press. A failure is silent: sound is never needed to play.
   */
  play(name: SoundName): void {
    const ctx = getContext();
    if (!ctx) {
      playWithElement(name);
      return;
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const buffer = buffers.get(name);
    if (!buffer) {
      // Not decoded yet (or it failed): start loading for next time.
      load(name);
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  },
};
