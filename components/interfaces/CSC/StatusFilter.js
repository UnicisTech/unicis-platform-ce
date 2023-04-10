import React from "react";
import Select from "@atlaskit/select";
import { statusOptions } from "./config";
import styled from "styled-components";

const WithoutRing = styled.div`
  input {
    --tw-ring-shadow: 0 0 #000 !important;
  }
`;

const StatusFilter = ({ setStatusFilter }) => {
  return (
    <div style={{ margin: "0 5px" }}>
      <WithoutRing>
        <Select
          inputId="multi-select-status-filter"
          className="multi-select"
          classNamePrefix="react-select"
          options={statusOptions}
          onChange={(value) => {
            setStatusFilter([...value]);
          }}
          placeholder="Choose a status"
          isMulti
        />
      </WithoutRing>
    </div>
  );
};

export default StatusFilter;
