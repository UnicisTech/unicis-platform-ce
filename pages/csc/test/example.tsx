import React from 'react';

import DynamicTable from '@atlaskit/dynamic-table';

import { head, rows } from './design-system/dynamic-table/examples/content/sample-data';

export default function TableUncontrolled() {
  return (
    <DynamicTable
      head={head}
      rows={rows}
      rowsPerPage={5}
      defaultPage={1}
      loadingSpinnerSize="large"
      isRankable
    />
  );
}
