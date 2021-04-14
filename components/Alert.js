import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useAppContext } from '../context/store';

function AlertComponent({ message }) {
    const { setShowAlert } = useAppContext();
    return (
        <Alert
            style={{
                position: 'fixed',
                width: '100%',
                zIndex: '10'
            }}
            severity="error"
            action={
                <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setShowAlert(false)}
                >
                    <Close fontSize="inherit" />
                </IconButton>
            }
        >
            <AlertTitle>Error</AlertTitle>
            {message}
        </ Alert>
    )
}

export default AlertComponent
