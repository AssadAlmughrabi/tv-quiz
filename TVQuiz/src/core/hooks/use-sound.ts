import { useCallback } from 'react';
import { soundService } from 'core/services/sound.service';
import { useSettings } from 'core/settings/settings.context';
import { SoundName } from 'types/sound.interface';

/**
 * Returns a play function that respects the Sound setting: with sound Off it does nothing.
 * Screens call this instead of soundService, so none of them has to check the setting.
 */
export function useSound() {
  const enabled = useSettings().settings.sound;
  return useCallback(
    (name: SoundName) => {
      if (enabled) {
        soundService.play(name);
      }
    },
    [enabled],
  );
}
