import { Avatar, Button, Divider, Fab, Grid, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, makeStyles, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import { parseCookies } from 'nookies';
import { COLLECTION_CLIENT, COLLECTION_LIST, COOKIES_USER_ID } from '../../utils/consts';
import { database } from '../../firebase/app';
import { Delete, Edit, Folder, PlaylistAddCheck, Visibility } from '@material-ui/icons';
import { useAppContext } from '../../context/store';
import axios from 'axios';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme) => ({
    addButton: {
        margin: theme.spacing(1),
        left: 0
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    panelContainer: {
        display: 'flex'
    },
    buttonAbsolute: {
        position: 'absolute',
        right: 10,
        bottom: 10
    },
    anchor: {
        textDecoration: 'none',
        color: theme.palette.primary.dark,

    },
    noProducts: {
        textAlign: 'center',
        marginTop: '30%'
    }
}));

function Listas({ listsData = [] }) {
    const classes = useStyles();
    const { setLoading, setAlertMessage, setShowAlert } = useAppContext();
    const router = useRouter();
    const handleDelete = async (id) => {
        setLoading(true);
        await axios.delete(`/api/list/${id}`);
        router.reload();
        setLoading(false);
    };
    const handleEdit = (id) => {
        setLoading(true);
        router.push(`/listas/${id}`).then(() => setLoading(false));
    }
    const handleSendOrder = async (id) => {
        setLoading(true);
        try {
            const response = await axios.patch(`api/list/${id}`, { status: true });
            router.reload();
        } catch (error) {
            setAlertMessage('No se pudo enviar el pedido');
            setShowAlert(true);
            console.error(error);
        }
        setLoading(false);
    }
    const goToCreateOrderPage = () => {
        setLoading(true);
        router.push('/listas/crear').then(() => setLoading(false));
    }
    return (
        <div className={classes.panelContainer}>
            <Grid item xs={12}>
                {
                    listsData.length === 0 &&
                    <Typography
                        className={classes.noProducts}
                        variant="body2"
                        color="textSecondary">
                        No tiene pedidos.
                        </Typography>
                }
                {
                    listsData.length !== 0 &&
                    <List>
                        {
                            listsData.map(
                                list => (
                                    <div key={list.id}>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <PlaylistAddCheck />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <>
                                                        <Typography>{list.name}</Typography>
                                                        {
                                                            list.sent ?
                                                                <Typography variant="body2" color="secondary">Enviado</Typography> :
                                                                <Typography variant="body2" color="error">Borrador</Typography>
                                                        }
                                                    </>
                                                }
                                                secondary={list.date}
                                            />
                                            <ListItemSecondaryAction>
                                                {
                                                    !list.sent ?
                                                        (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleSendOrder(list.id)}
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    endIcon={<Icon>send</Icon>}
                                                                >
                                                                    Enviar
                                                            </Button>
                                                                <IconButton onClick={() => handleDelete(list.id)} edge="end" aria-label="delete">
                                                                    <Delete />
                                                                </IconButton>
                                                                <IconButton onClick={() => handleEdit(list.date)} edge="end" aria-label="delete">
                                                                    <Edit />
                                                                </IconButton>
                                                            </>
                                                        ) : (
                                                            <IconButton onClick={() => handleEdit(list.date)} edge="start" aria-label="view">
                                                                <Visibility />
                                                            </IconButton>
                                                        )
                                                }
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </div>
                                )
                            )
                        }
                    </List>
                }
            </Grid>
            <div className={classes.buttonAbsolute} onClick={goToCreateOrderPage}>
                <Fab size="medium" color="primary" aria-label="add" className={classes.addButton}>
                    <AddIcon />
                </Fab>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx) => {
    const clientId = parseCookies(ctx)[COOKIES_USER_ID];
    if (clientId) {
        const listsRef = database.collection(COLLECTION_LIST);
        const lists = await listsRef
            .where('client', '==', database.doc(`${COLLECTION_CLIENT}/${clientId}`))
            .get();
        const listsData = lists.docs.map(
            list => ({
                id: list.id,
                date: list.data().date,
                name: list.data().name,
                sent: list.data().sent
            })
        )
        return {
            props: {
                listsData,
            }
        }
    } else {
        return {
            props: {
                listsData: [],
            }
        }
    }
}

export default Listas;
