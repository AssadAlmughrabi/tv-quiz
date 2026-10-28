import React from 'react';
import { AsyncView } from 'core/components/async-view/async-view';
import { RailSkeleton } from 'core/components/skeleton/skeleton';
import { AsyncStatus } from 'core/hooks/use-async-data';

interface RailsStatusProps {
  status: AsyncStatus;
  onRetry: () => void;
  takeFocus: boolean;
}

export function RailsStatus({ status, onRetry, takeFocus }: RailsStatusProps) {
  return (
    <AsyncView
      status={status}
      onRetry={onRetry}
      takeFocus={takeFocus}
      loading={
        <>
          <RailSkeleton />
          <RailSkeleton />
          <RailSkeleton />
        </>
      }
    >
      {() => null}
    </AsyncView>
  );
}
