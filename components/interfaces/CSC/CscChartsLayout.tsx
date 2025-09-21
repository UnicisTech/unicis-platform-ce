import PieChart from "./PieChart";
import RadarChart from "./RadarChart";

type Props = {
  statuses: Record<string, string>;
  iso: string;
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full rounded-xl border shadow-sm p-4">
    {children}
  </div>
);

const CscChartsLayout: React.FC<Props> = ({ statuses, iso }) => (
  <div className="grid h-[600px] lg:h-[400px] grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-4 mb-2">
    <Panel>
      <PieChart statuses={statuses} />
    </Panel>
    <Panel>
      <RadarChart statuses={statuses} ISO={iso} />
    </Panel>
  </div>
);

export default CscChartsLayout;
