import { Suspense } from 'react';
import JoinNetwork from '@/components/JoinNetwork';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinNetwork />
    </Suspense>
  );
}

