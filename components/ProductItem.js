import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { useAppContext } from '../context/store';
import { useRouter } from 'next/router';

function ProductListItem({ product, showActivate, setProduct }) {
    const { setLoading } = useAppContext();
    const router = useRouter();
    const [checked, setChecked] = useState(product.status);
    const handleChange = async ({ target }) => {
        setLoading(true);
        setProduct({ ...product, status: target.checked })
        setChecked(target.checked);
        setLoading(false);
    }
    const handleEdit = (id) => {
        setLoading(true);
        router.push(`/panel/productos/${id}`).then(() => setLoading(false));
    }
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt={`${product.name} image`} src={product.image} />
            </ListItemAvatar>
            <ListItemText
                primary={product.name}
            />
            <ListItemSecondaryAction>
                {
                    showActivate &&
                    <FormControlLabel
                        control={
                            <Switch
                                checked={checked}
                                onChange={handleChange}
                                name="checkedB"
                                color="primary"
                            />
                        }
                        label={checked ? 'Activo' : 'Inactivo'}
                    />
                }
                <IconButton edge="end" aria-label="delete" onClick={() => handleEdit(product.id)}>
                    <EditIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default ProductListItem
