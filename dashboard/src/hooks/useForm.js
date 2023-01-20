import { React, useEffect, useState } from 'react';
import { useQuery } from "react-query";
import './useForm.css';

const fetchCategories = async ({ queryKey }) => {
    const res = await fetch(`${process.env.REACT_APP_URL_API}/prices/categories`)
    return res.json()
};

const fetchSchema = async ({ queryKey }) => {
    const res = await fetch(`${process.env.REACT_APP_URL_API}/prices/schema`)
    return res.json()
};

const generateFormField = (itemSchema, formData, handleChange, dataCats = null) => {
    const [key, value] = itemSchema

    let formItem = null
    let formType = ''
    if (value['type'] === "boolean") {
        formType = 'checkbox'
        formItem = <input
            id={key}
            type="checkbox"
            name={key}
            className="form-control"
            onChange={handleChange}
            checked={formData[key] ? 'checked' : ''}
        />
    }
    else if (dataCats && Object.keys(dataCats).includes(key)) {
        formType = 'select'
        formItem = <select
            id={key}
            name={key}
            className="form-control"
            onChange={handleChange}
            defaultValue={formData[key]}
        >
            <option key='other' value='other'>-- Choose a {value['title']} --</option>
            {Object.values(dataCats[key]).map(val => <option key={val} value={val}>{val}</option>)}

        </select>
    } else {
        formType = 'text'
        formItem = <input
            id={key}
            type="text"
            name={key}
            className="form-control"
            value={formData[key]}
            onChange={handleChange}
        />
    }

    return (
        <div key={key} className={`form-group form-type-${formType}`}>
            <label htmlFor={key}>{value['title']}</label>
            {formItem}
        </div>
    )
}

const initialData = (dataSchema) => {
    const initData = {}
    Object.entries(dataSchema['properties']).forEach((item) => {
        const [key, value] = item
        initData[key] = ''
        if (value['type'] === 'boolean')
            initData[key] = false
        else if (value['type'] === 'integer')
            initData[key] = 0
    })
    return initData
}

export default function useForm({ handleSubmitForm }) {
    // eslint-disable-next-line
    const { data: dataCats, status: statusCats } = useQuery('categories', fetchCategories);
    const { data: dataSchema, status: statusSchema } = useQuery('schema', fetchSchema);

    const [formData, setFormData] = useState({});

    const handleChange = (event) => {
        const { name, value, type } = event.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: event.target["checked"] });
        }
        else setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSubmitForm(event, formData)
    }

    useEffect(() => {
        if (statusSchema === "success") {
            setFormData({ ...formData, ...initialData(dataSchema) })
        }
        // eslint-disable-next-line
    }, [statusSchema])

    return (
        <form onSubmit={handleSubmit}>
            <>
                {statusSchema === "success" ? Object.entries(dataSchema['properties']).map(item => generateFormField(item, formData, handleChange, dataCats)) : null}
                <button type="submit" className="form-control">Predict a price</button>
            </>
        </form>
    )
}
