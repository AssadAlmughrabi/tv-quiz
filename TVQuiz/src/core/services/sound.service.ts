import Sound from 'react-native-sound';
import { SoundName } from 'types/sound.interface';

const loaded = new Map<SoundName, Sound>();

/**
 * Loads a sound once and keeps it, so later plays start at once.
 * On Android a plain file name is read from android/app/src/main/res/raw.
 */
function load(name: SoundName): Promise<Sound> {
  const ready = loaded.get(name);
  if (ready) {
    return Promise.resolve(ready);
  }
  return new Promise((resolve, reject) => {
    // The folder must be given before the callback: with the callback second, the library
    // glues it onto the file name and Android finds no such sound.
    const sound = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, error => {
      if (error) {
        reject(error);
        return;
      }
      loaded.set(name, sound);
      resolve(sound);
    });
  });
}

/** Native (Android): plays the bundled WAV files with react-native-sound. */
export const soundService = {
  /** Loads every sound ahead of time, so the first answer is not silent while loading. */
  preload(): void {
    (['correct', 'wrong'] as SoundName[]).forEach(name => {
      load(name).catch(() => {});
    });
  },

  /** Plays from the start, even if the same sound is still playing. A failure is silent: sound is never needed to play. */
  play(name: SoundName): void {
    load(name)
      .then(sound => sound.stop(() => sound.play()))
      .catch(() => {});
  },
};
