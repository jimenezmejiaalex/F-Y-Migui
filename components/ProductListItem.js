import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { InputAdornment, makeStyles, MenuItem, Select, TextField } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    measure: {
        margin: theme.spacing(1),
    },
    measureText: {
        width: '70px'
    },
    deleteButton: {
        color: theme.palette.action.active
    }
}));

function ProductListItem({ name, image, measure, setMeasure, amount, measures, setAmount, deleteItem, sent }) {
    const [secondary, setSecondary] = useState(false);
    const classes = useStyles();
    const [localAmount, setLocalAmount] = useState(amount);
    const [localMeasure, setLocalMeasure] = useState(measure);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);
    const handleAmountChange = ({ target }) => {
        setAmount(target.value);
        setLocalAmount(target.value)
    }
    const handleMeasureChange = ({ target }) => {
        setMeasure(target.value);
        setLocalMeasure(target.value);
    }
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt={`${name} image`} src={image} />
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={secondary ? 'Secondary text' : null}
            />
            <ListItemSecondaryAction>
                <TextField
                    disabled={sent}
                    onChange={handleAmountChange}
                    value={localAmount}
                    className={classes.measureText}
                    id="outlined-basic"
                    type="number"
                    size="small"
                    variant="outlined" />
                <Select
                    disabled={sent}
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={localMeasure}
                    onChange={handleMeasureChange}
                >{
                        measures.map(measure => (<MenuItem key={measure.id} value={measure.id}>{measure.name}</MenuItem>))
                    }
                </Select>
                <IconButton disabled={sent} onClick={deleteItem} edge="end" aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default ProductListItem
