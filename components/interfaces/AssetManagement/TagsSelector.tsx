// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

import React, { useEffect, useState } from 'react';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { useTags } from '@/hooks/fleets/Tags/useTags';
import { Tag } from '@/types';

interface TagsSelectorProps {
  fleetTeamId: string;
  onSelect: (packIds: string[]) => void;
  setSectionTag: (tagIds: string[]) => void;
  preSelectedTag?: Tag[];
}

const TagsSelector: React.FC<TagsSelectorProps> = ({ fleetTeamId, onSelect, setSectionTag, preSelectedTag = []}) => {

  const { tags, isLoading, isError } = useTags(fleetTeamId!);
  const [selectedTagOptions, setSelectedTagOptions] = useState<any[]>([]);

  useEffect(() => {
    if (tags && preSelectedTag.length > 0) {
      const initialSelectedOptions = tags
        .filter(tag => preSelectedTag.some(preTag => preTag.value === tag.value))
        .map((tag) => ({
          value: tag.value,
          label: `${tag.value || 'Unknown Tag'} - p:${tag.packs_count} - n:${tag.nodes_count} - q:${tag.queries_count}`
        }));
      setSelectedTagOptions(initialSelectedOptions);
    }
  }, [tags, preSelectedTag]);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const tagOptions = tags.map((tag) => ({
    value: tag.value,
    label: `${tag.value || 'Unknown Tag'} - p:${tag.packs_count} - n:${tag.nodes_count} - q:${tag.queries_count}`
  }));

  const handleTagChange = (selectedOptions: any) => {
    const selectedTagIds = selectedOptions.map((option: { value: string }) => option.value);

    setSelectedTagOptions(selectedOptions);
    setSectionTag(selectedTagIds);
    onSelect(selectedTagIds);
  };

  return (
    <WithoutRing>
      {tags.length === 0 ? (
        <p>No tags found</p>
      ) : (
       <Select
        inputId="multi-select-tags"
        className="multi-select text-sm ring-1 rounded"
        classNamePrefix="react-select"
        options={tagOptions}
        onChange={handleTagChange}
        value={selectedTagOptions}
        placeholder="Select Tag(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default TagsSelector;
