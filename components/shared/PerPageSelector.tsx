import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';

interface PerPageSelectorProps {
  perPage: number;
  setPerPage: React.Dispatch<React.SetStateAction<number>>;
}

const perPageOptions = [5, 10, 25, 50, 100];

const PerPageSelector = ({ perPage, setPerPage }: PerPageSelectorProps) => {
  return (
    <div className="w-[100px] mr-2">
      <Select
        value={perPage.toString()}
        onValueChange={(val) => setPerPage(Number(val))}
      >
        <SelectTrigger className="h-9 px-2 text-sm">
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent>
          {perPageOptions.map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PerPageSelector;
