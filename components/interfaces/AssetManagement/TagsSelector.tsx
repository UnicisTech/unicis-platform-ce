import React from 'react';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { useTags } from '@/hooks/fleets/Tags/useTags';

interface TagsSelectorProps {
  fleetTeamId: string;
  fleetAccessPhrase: string;
  onSelect: (nodeIds: string[]) => void;
  setSectionTag: (tagIds: string[]) => void;
}

const TagsSelector: React.FC<TagsSelectorProps> = ({ fleetTeamId, fleetAccessPhrase, onSelect, setSectionTag }) => {

  const { tags, isLoading, isError } = useTags(fleetTeamId!, fleetAccessPhrase!);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const tagOptions = tags.map((tag) => ({
    value: tag.value,
    label: `${tag.value || 'Unknown Tag'} - p:${tag.packs_count} - n:${tag.nodes_count} - n:${tag.nodes_count}`
  }));

  const handleTagChange = (selectedOptions: any) => {
    // Extract only the values (tag IDs) from the selected options
    const selectedTagIds = selectedOptions.map((option: { value: string }) => option.value);

    // Set the selected tag IDs to state
    setSectionTag(selectedTagIds);

    // Call onSelect with the selected tag IDs
    onSelect(selectedTagIds);
  };

  return (
    <WithoutRing>
      {tags.length === 0 ? (
        <p>No tags found</p>
      ) : (
       <Select
        inputId="multi-select-tags"
        className="multi-select text-sm text-red-500 ring-1 ring-red-500 rounded"
        classNamePrefix="react-select"
        options={tagOptions}
        onChange={handleTagChange}
        placeholder="Select a Tag(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default TagsSelector;
