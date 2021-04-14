import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { AddCircleOutlined } from '@material-ui/icons';

function AddProductItem({ product, selected }) {
    const [secondary, setSecondary] = useState(false);
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt={`${product.name} image`} src={product.image} />
            </ListItemAvatar>
            <ListItemText
                primary={product.name}
                secondary={secondary ? 'Secondary text' : null}
            />
            <ListItemSecondaryAction>
                <IconButton onClick={selected} edge="start" aria-label="add">
                    <AddCircleOutlined />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default AddProductItem
