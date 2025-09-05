'use client';

import dynamic from 'next/dynamic';

const GreenTool = dynamic(() => import('./GreenTool'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function DynamicTool() {
  return <GreenTool />;
}
