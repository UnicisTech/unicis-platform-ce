import React, { useState, useEffect } from 'react'
import Select from '@atlaskit/select'
import type { Task } from "@prisma/client";
import styled from 'styled-components'

const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

interface Option {
    label: string,
    value: number
}

const IssueSelector = ({ 
    issues, 
    control, 
    handler 
} : {
    issues: Array<Task>
    control: string,
    handler: (action: string, dataToRemove: any, control: string) => Promise<void>
}) => {
    const [value, setValue] = useState<Option[]>([])
    const [options, setOptions] = useState<Option[]>([])

    useEffect(() => {
        const options = issues.map(issue => ({ label: issue.title, value: issue.id }))
        //const selectedOptions = issues.filter(issue => issue.properties["csc_controls"]?.find(item => item.control === control))?.map(issue => ({ label: issue.key, value: issue.id }))
        setOptions(options)
        //setValue(selectedOptions)
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
                placeholder="Issues"
                isMulti
            />
        </WithoutRing>
    )
}

export default IssueSelector