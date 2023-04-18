import React, { useState, useEffect } from 'react'
import Select from '@atlaskit/select'
import styled from 'styled-components'
import type { Task } from "@prisma/client";
import type { Option } from 'types';

const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

const TaskSelector = ({ 
    tasks, 
    control, 
    handler 
} : {
    tasks: Array<Task>
    control: string,
    handler: (action: string, dataToRemove: any, control: string) => Promise<void>
}) => {
    const [value, setValue] = useState<Option[]>([])
    const [options, setOptions] = useState<Option[]>([])

    useEffect(() => {
        const options = tasks.map(task => ({ label: task.title, value: task.id }))
        const selectedOptions = tasks.filter((task: any) => task.properties?.csc_controls?.find((item: string) => item === control))?.map(issue => ({ label: issue.title, value: issue.id }))
        setOptions(options)
        setValue(selectedOptions)
    }, [])
    return (
        <WithoutRing>
            <Select
                inputId="multi-select-status"
                className="multi-select"
                classNamePrefix="react-select"
                options={options}
                onChange={(selectedIssue, actionMeta) => {
                    const {action, option, removedValue, removedValues } = actionMeta
                    setValue([...selectedIssue])
                    const dataToRemove = option ? [option] : removedValue ? [removedValue] : removedValues
                    handler(action, dataToRemove, control)
                }}
                value={value}
                placeholder="Tasks"
                isMulti
            />
        </WithoutRing>
    )
}

export default TaskSelector