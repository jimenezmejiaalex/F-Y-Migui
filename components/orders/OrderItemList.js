import { ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, ListItemSecondaryAction, Typography, Divider, Collapse, List, ListItemIcon, makeStyles } from '@material-ui/core'
import { ArrowDownward, ArrowDropDown, ArrowDropUp, ChevronRight, Delete, Edit, EditRounded, ListOutlined, Star } from '@material-ui/icons'
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
    nested: {
        paddingLeft: theme.spacing(4),
    },
    listItem: {
        padding: theme.spacing(2)
    }
}));

function OrderItemList({ name, date, client, handleEdit, handleDelete, showProducts, products = [] }) {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    return (
        <>
            <ListItem>
                <ListItemAvatar>
                    <IconButton onClick={handleEdit} edge="end" aria-label="delete">
                        <EditRounded />
                    </IconButton>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <>
                            <Typography variant="body1" color="secondary">{client}</Typography>
                            <Typography variant="body2" color="textSecondary">{name}</Typography>
                        </>
                    }
                    secondary={date}
                />
                <ListItemSecondaryAction>
                    {
                        open ?
                            (
                                <IconButton onClick={() => setOpen(false)} edge="end" aria-label="delete">
                                    <ArrowDropDown />
                                </IconButton>
                            ) :
                            (
                                <IconButton onClick={() => setOpen(true)} edge="end" aria-label="delete">
                                    <ArrowDropUp />
                                </IconButton>
                            )
                    }
                </ListItemSecondaryAction>
            </ListItem>
            {
                showProducts &&
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" className={classes.nested} disablePadding>
                        {
                            products.map(
                                product =>
                                (
                                    <ListItem key={product.id}>
                                        {/* <ListItemIcon>
                                            <ChevronRight />
                                        </ListItemIcon> */}
                                        <ListItemAvatar>
                                            <Avatar alt={`${product.name} image`} src={product.image} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.name}
                                        />
                                        <ListItemSecondaryAction>
                                            <Typography className={classes.listItem} variant="body2" color="textSecondary">
                                                {`${product.amount} ${product.measure}`}
                                            </Typography>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            )
                        }
                    </List>
                </Collapse>
            }
            <Divider />
        </>
    )
}

export default OrderItemList
