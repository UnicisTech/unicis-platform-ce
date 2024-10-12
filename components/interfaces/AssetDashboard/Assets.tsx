import AssetCard, { AssetProps } from '@/components/shared/AssetCard'
import React from 'react'

interface Assets {
  assets: AssetProps[]
}
 

const Assets = ({assets}: Assets) => {

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {assets.map((asset, index) =>
        <AssetCard key={index} host={asset.host} total={asset.total}/>
      )}
    </div>
  )
}

export default Assets