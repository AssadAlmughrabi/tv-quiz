import React, { useState } from 'react';
import { Dialog } from 'core/components/dialog/dialog';
import { useLanguage } from 'core/i18n/language.context';
import { useBackHandler } from 'core/navigation/navigation.context';
import { platform } from 'core/platform/platform';

export function ExitAppDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useBackHandler(() => {
    setOpen(true);
    return true;
  }, !open);

  if (!open) {
    return null;
  }
  return (
    <Dialog
      title={t.exit.title}
      message={t.exit.message}
      actions={[
        { label: t.exit.stay, onPress: () => setOpen(false) },
        { label: t.exit.exit, onPress: platform.exitApp },
      ]}
      onCancel={() => setOpen(false)}
    />
  );
}
