'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@/components/common/ErrorPage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <ErrorPage
      errorCode={500}
      showRetryButton={true}
      onRetry={() => reset()}
    />
  );
}