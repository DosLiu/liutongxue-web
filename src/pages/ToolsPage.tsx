import SiteHeader from '../components/SiteHeader';
import ToolsSection from '../components/ToolsSection';

export default function ToolsPage() {
  return (
    <>
      <SiteHeader activeKey="tools" />
      <ToolsSection standalone />
    </>
  );
}
