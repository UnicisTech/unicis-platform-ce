import React, {Dispatch, SetStateAction} from "react";
import Select from "@atlaskit/select";
import { statusOptions } from "data/configs/csc";
import { WithoutRing } from "sharedStyles";
import type { CscOption } from "types";

const StatusFilter = ({
   setStatusFilter 
  }: {
    setStatusFilter: Dispatch<SetStateAction<CscOption[] | null>>
  }) => {
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
