import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { CloudUpload, Delete } from '@material-ui/icons';
import { Avatar, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    input: {
        display: 'none',
    },
}));

export default function FileUpload({ value, setValue, accept }) {
    const classes = useStyles();
    const fileRef = useRef();
    const [localValue, setLocalValue] = useState(value);
    const handleFileChange = ({ target }) => {
        setLocalValue(target.files[0]);
        setValue(target.files[0]);
    }
    const handleRemoveFile = () => {
        fileRef.current.value = '';
        setLocalValue(null);
        setValue(null);
    }
    useEffect(() => {
        setValue(value);
    }, [value]);
    return (
        <div>
            <input
                ref={fileRef}
                accept={accept}
                className={classes.input}
                id="contained-button-file"
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor="contained-button-file">
                <Button fullWidth variant="contained" color="secondary" component="span">
                    <CloudUpload />
                </Button>
            </label>
            {
                localValue &&
                <List>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar src={typeof value === 'string' ? value : URL.createObjectURL(localValue)} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={localValue.name}
                        />
                        <ListItemSecondaryAction onClick={handleRemoveFile}>
                            <IconButton edge="end" aria-label="delete">
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            }
        </div>
    );
}