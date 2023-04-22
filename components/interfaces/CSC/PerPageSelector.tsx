import React, {Dispatch, SetStateAction} from "react";
import Select from "@atlaskit/select";
import { WithoutRing } from "sharedStyles";
import { perPageOptions } from "./config";

const PerPageSelector = ({ 
  setPerPage 
}: {
  setPerPage: Dispatch<SetStateAction<number>>
}) => {
  return (
    <div style={{ margin: "0 5px" }}>
      <WithoutRing>
        <Select
          inputId="single-select-status-per-page"
          className="single-select"
          classNamePrefix="react-select"
          options={perPageOptions}
          onChange={(option) => {
            const value = option?.value as number
            setPerPage(value);
          }}
          defaultValue={{
            label: "10",
            value: 10,
          }}
          placeholder="Controls per page"
        />
      </WithoutRing>
    </div>
  );
};

export default PerPageSelector;
