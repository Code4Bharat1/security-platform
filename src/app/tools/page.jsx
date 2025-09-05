import DynamicTool from '@/components/Tool/DynamicTool';

export const generateStaticParams = () => [];
export const revalidate = 0;

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DynamicTool />
    </div>
  );
}