import { Suspense } from 'react';
import PlatformOverview from '@/components/Tool/PlatformOverview';

export default function Page() {
  return (
    <div className="tool-route-premium">
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <PlatformOverview />
      </Suspense>
    </div>
  );
}
