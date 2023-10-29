import React from 'react'
import TextArea from '@atlaskit/textarea'
import Textfield from '@atlaskit/textfield'
import { controlOptions } from '@/components/defaultLanding/data/configs/csc';

const ControlBlockViewOnly = ({
	status,
	control
}: {
	status: string;
	control: string;
}) => {
	const controlData = controlOptions.find(({ value }) => value.control === control)?.value

	return (
		<>
			<div>
				<p className='csc_label'>Select a control</p>
				<Textfield
					isReadOnly
					value={controlOptions.find(({ value }) => value.control === control)?.label}
				/>
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
			<>
				<p className='csc_label'>Status</p>
				<Textfield
					isReadOnly
					value={status}
				/>
			</>
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

export default ControlBlockViewOnly