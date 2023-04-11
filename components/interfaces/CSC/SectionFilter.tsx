import React, {Dispatch, SetStateAction} from "react";
import Select from "@atlaskit/select";
import { sections } from "./config";
import styled from "styled-components";

const WithoutRing = styled.div`
  input {
    --tw-ring-shadow: 0 0 #000 !important;
  }
`;

const SectionFilter = ({ 
  setSectionFilter 
}: {
  setSectionFilter: Dispatch<SetStateAction<{label: string, value: string}[] | null>>
}) => {
  return (
    <div style={{ margin: "0 5px" }}>
      <WithoutRing>
        <Select
          inputId="multi-select-section-filter"
          className="multi-select"
          classNamePrefix="react-select"
          options={sections}
          onChange={(value) => {
            setSectionFilter([...value]);
          }}
          placeholder="Choose a section"
          isMulti
        />
      </WithoutRing>
    </div>
  );
};

export default SectionFilter;
