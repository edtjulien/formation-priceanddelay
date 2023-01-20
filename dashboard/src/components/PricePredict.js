import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { React, useEffect, useState } from 'react';
import { useMutation } from "react-query";
import useForm from '../hooks/useForm';

const fetchData = async (formData) => {
    if (formData['car_type'] === "other" || formData['car_type'] === "")
        formData['car_type'] = "estate"

    const inputData = { inputs: [formData] }

    const res = await fetch(`${process.env.REACT_APP_URL_API}/prices/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
    })
    return res.json()
};


export default function PricePredict() {
    const predictQuery = useMutation(fetchData);
    const [prediction, setPrediction] = useState(0)
    const [openPredictDialog, setOpenPredictDialog] = useState(false);

    const handleSubmit = async (event, formData) => {

        predictQuery.mutate(formData, {
            onSuccess: (data) => {
                if (!data['predictions'])
                    console.log('API Error:', data)
                else
                    setPrediction(data['predictions'])

            },
            onError: (error) => {
                console.log('Error:', error)
            },
        })
    }

    const handleCloseDialog = () => {
        setOpenPredictDialog(false)
    }

    useEffect(() => {
        if (prediction > 0)
            setOpenPredictDialog(true)
    }, [prediction])


    const formElement = useForm({ handleSubmitForm: handleSubmit })
    return (
        <div>
            {formElement}
            <Dialog
                open={openPredictDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Price rental estimation per day is:"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 30, color: 'green', fontWeight: 700 }}>{parseFloat(prediction).toFixed(2)} euro</span>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    )
}
