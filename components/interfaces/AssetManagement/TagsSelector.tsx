import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useTags } from '@/hooks/fleets/Tags/useTags';
import type { Tag } from '@/types';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/shadcn/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/shadcn/ui/command';
import { ChevronDown } from 'lucide-react';

interface TagsSelectorProps {
  fleetTeamId: string;
  onSelect: (tagValues: string[]) => void;
  setSectionTag: (tagValues: string[]) => void;
  preSelectedTag?: Tag[];
}

const TagsSelector: React.FC<TagsSelectorProps> = ({
  fleetTeamId,
  onSelect,
  setSectionTag,
  preSelectedTag = [],
}) => {
  const { t } = useTranslation('common');
  const { tags, isLoading, isError } = useTags(fleetTeamId);
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const options = useMemo(
    () =>
      (tags || []).map((tag) => ({
        value: tag.value,
        label: `${tag.value || t('unknown-tag')} - ${t('packs')}:${tag.packs_count} - ${t('nodes')}:${tag.nodes_count} - ${t('queries')}:${tag.queries_count}`,
      })),
    [tags, t]
  );

  useEffect(() => {
    if (!tags) return;
    if (preSelectedTag && preSelectedTag.length > 0) {
      const preset = preSelectedTag
        .map((t) => t?.value)
        .filter((v): v is string => Boolean(v));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedValues(preset);
      setSectionTag(preset);
      onSelect(preset);
    }
  }, [tags]);

  const toggleValue = (val: string) => {
    setSelectedValues((prev) => {
      const next = prev.includes(val)
        ? prev.filter((v) => v !== val)
        : [...prev, val];
      setSectionTag(next);
      onSelect(next);
      return next;
    });
  };

  if (isLoading) return <p>{t('loading')}</p>;
  if (isError)
    return <p className="text-red-500 text-sm">{t('error-loading-tags')}</p>;
  if (!tags || tags.length === 0) return <p>{t('no-tags-found')}</p>;

  const selectedLabels = options
    .filter((o) => selectedValues.includes(o.value))
    .map((o) => o.label);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValues.length > 0
              ? t('selected-count', { count: selectedValues.length })
              : t('select-tags')}
            <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(36rem,92vw)] p-0">
          <Command>
            <CommandInput placeholder={t('search-tags')} />
            <CommandList>
              <CommandEmpty>{t('no-tags-found')}</CommandEmpty>
              <CommandGroup heading={t('tags')}>
                {options.map((opt) => {
                  const checked = selectedValues.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => toggleValue(opt.value)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={!!checked}
                        onCheckedChange={() => toggleValue(opt.value)}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsSelector;
