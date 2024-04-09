import React from 'react';
import Select from '@atlaskit/select';
import { getFunctions } from '@/components/defaultLanding/data/configs/csc';

const FunctionFilter = ({ setFunctionFilter }) => {
  return (
    <div style={{ margin: '0 5px' }}>
      <Select
        inputId="multi-select-section-filter"
        className="multi-select"
        classNamePrefix="react-select"
        options={getFunctions()}
        onChange={(value) => {
            setFunctionFilter([...value])
        }}
        placeholder="Choose a function"
        isMulti
      />
    </div>
  )
}

export default FunctionFilter
