import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';
import { Info } from 'lucide-react';

//TODO: move to config
const statusData = [
  {
    label: 'Unknown',
    color: '',
    text: 'Has not even been checked yet',
  },
  {
    label: 'Not Applicable',
    color: 'bg-[#B2B2B2] text-white',
    text: 'Management can ignore them',
  },
  {
    label: 'Not Performed',
    color: 'bg-[#FF0000] text-white',
    text: 'Complete lack of recognizable policy, procedure, control etc.',
  },
  {
    label: 'Performed Informally',
    color: 'bg-[#CA003F] text-white',
    text: 'Development has barely started and will require significant work to fulfill the requirements',
  },
  {
    label: 'Planned',
    color: 'bg-[#666666] text-white',
    text: 'Progressing nicely but not yet complete',
  },
  {
    label: 'Well Defined',
    color: 'bg-[#FFBE00] text-white',
    text: 'Development is more or less complete, although detail is lacking and/or it is not yet implemented, enforced and actively supported by top management',
  },
  {
    label: 'Quantitatively Controlled',
    color: 'bg-[#6AD900] text-white',
    text: 'Development is complete, the process/control has been implemented and recently started operating',
  },
  {
    label: 'Continuously Improving',
    color: 'bg-[#2F8F00] text-white',
    text: 'The requirement is fully satisfied, is operating fully as expected, is being actively monitored and improved, and there is substantial evidence to prove all that to the auditors',
  },
];

const Table = () => {
  return (
    <table className="text-sm w-full">
      <thead>
        <tr className="text-left">
          <th className="py-2 px-3">Status</th>
          <th className="py-2 px-3">Meaning</th>
        </tr>
      </thead>
      <tbody>
        {statusData.map((status) => (
          <tr
            key={status.label}
            className={`px-3 ${status.color} whitespace-normal`}
          >
            <td className="py-2 px-3 font-medium">{status.label}</td>
            <td className="py-2 px-3 leading-snug">{status.text}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const StatusHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <span>Status</span>
        <PopoverTrigger asChild>
          <div className="w-5 h-5 flex items-center justify-center cursor-pointer">
            <Info className="w-3 h-3" />
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="max-w-[450px] w-fit p-3">
        <Table />
      </PopoverContent>
    </Popover>
  );
};

export default StatusHeader;
