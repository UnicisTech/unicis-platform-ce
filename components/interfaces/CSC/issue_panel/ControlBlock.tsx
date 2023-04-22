import React, { useState } from 'react'
import Select from '@atlaskit/select'
import Button, { LoadingButton } from '@atlaskit/button'
import TrashIcon from '@atlaskit/icon/glyph/trash'
import TextArea from '@atlaskit/textarea';
import Textfield from '@atlaskit/textfield';
import {WithoutRing} from "sharedStyles"
import { controlOptions } from '../config'

const ControlBlock = ({ 
  control, 
  controls, 
  controlHanlder, 
  isSaving, 
  isDeleting, 
  deleteControlHandler 
} : {
  control: string
  controls: string[],
  controlHanlder: (oldControl: string, newControl: string) => void,
  isSaving: boolean,
  isDeleting: boolean,
  deleteControlHandler: (control: string) => void
}) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const controlData = controlOptions.find(({value}) => value.control === control)?.value
  return (
    <>
      <div>
        <p className='csc_label'>Select a control</p>
        <div style={{ display: 'grid', gridTemplateColumns: '11fr 1fr', alignItems: 'center' }}>
          <WithoutRing>
            <Select
              inputId="single-select-control"
              className="single-select"
              classNamePrefix="react-select"
              options={controlOptions.filter(option => !controls.find(item => item === option.value.control))}
              onChange={(option) => {
                controlHanlder(control, option?.value?.control as string)
              }}
              value={controlOptions.find(({ value }) => value.control === control)}
              placeholder="Choose a control"
              isDisabled={isSaving || isDeleting}
            />
          </WithoutRing>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <LoadingButton 
              appearance='danger' 
              iconBefore={<TrashIcon size="medium" label="Delete" />}
              onClick={async () => {
                setIsButtonLoading(true)
                await deleteControlHandler(control)
                setIsButtonLoading(false)
              }}
              isLoading={isButtonLoading}
              isDisabled={isSaving}
            ></LoadingButton>
          </div>
        </div>
      </div>
      {controlData?.code &&
        <>
          <p className='csc_label'>Code</p>
          <Textfield
            isReadOnly
            value={controlData.code}
          />
        </>
      }
      {controlData?.section &&
        <>
          <p className='csc_label'>Section</p>
          <Textfield
            isReadOnly
            value={controlData?.section}
          />
        </>
      }
      {controlData?.requirements &&
        <>
          <p className='csc_label'>Requirements</p>
          <TextArea
            resize="auto"
            maxHeight="20vh"
            name="area"
            value={controlData?.requirements}
            isReadOnly
          />
        </>
      }
      <div style={{ height: '1px', width: '100%', backgroundColor: 'rgb(223, 225, 231)', margin: '24px 0px' }}></div>
    </>
  )
}

export default ControlBlock