import BasicNetworkScan from '@/components/basicNetworkScan/BasicNetworkScan'

export const metadata = {
  title: 'Basic Network Scanning | Nexcore Security Platform',
  description: 'Probe target surfaces for foundational exposure. Identify open ports, running services, and high-risk attack vectors across your network perimeter.',
}

export default function Page() {
  return (
    <div className="tool-route-premium">
      <BasicNetworkScan />
    </div>
  )
}
