import React, { useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { Select, Spin } from 'antd';
import { apiGetTeachers } from '../services/TeacherServices';
import { apiGetSubjects } from '../services/SubjectServices';
function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(newOptions);
                setFetching(false);
            });
        };
        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);
    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
}

// Usage of DebounceSelect

async function fetchUserList(username) {
    return apiGetSubjects('ASC', 1, 10, username)
        .then((res) => res.data.data)
        .then((array) => array.map(
            subject => ({
                label: `${subject.name}`,
                value: subject.id,
            })
        ))
}
const MultiSelectSubjects = (props) => {
    // const [value, setValue] = useState([]);
    return (
        <DebounceSelect
            {...props}
            placeholder="Select Subjects"
            fetchOptions={fetchUserList}
        />
    );
};
export default MultiSelectSubjects;