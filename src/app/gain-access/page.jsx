import { Suspense } from 'react';
import GainAccess from '@/components/GainAcess';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GainAccess />
    </Suspense>
  );
}

