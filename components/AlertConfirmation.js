import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useAppContext } from '../context/store';

export default function AlertConfirmation({ message, title, open, handleClose, handleAgree, handleCancel }) {
    const { setShowAlertConfirmation } = useAppContext();
    const handleCloseDialog = () => {
        setShowAlertConfirmation(false);
        handleClose();
    }
    const handleAgreeDialog = () => {
        setShowAlertConfirmation(false);
        handleAgree();
    }
    const handleCancelDialog = () => {
        setShowAlertConfirmation(false);
        handleCancel();
    }
    return (
        <div>
            <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAgreeDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleCancelDialog} color="primary" autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
