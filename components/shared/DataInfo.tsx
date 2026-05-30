import React from 'react'

const DataInfo = ({header, data}: { header: string;  data: string | undefined}) => {
  return (
      <div className="ring-1 ring-gray-300 text-center rounded-sm justify-between">
          <div className="text-md font-extrabold bg-gray-100 bg-opacity-15">{header}</div>
          <span>{data || 'Null'}</span>
      </div>
  )
}

export default DataInfo