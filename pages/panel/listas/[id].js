import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { database } from '../../../firebase/app';
import { COLLECTION_CLIENT, COLLECTION_LIST, COOKIES_USER_ID } from '../../../utils/consts';
import Error from 'next/error';
import { Button, Dialog, DialogContent, DialogTitle, Fab, Grid, Icon, ListItemSecondaryAction, makeStyles, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { getItemByRef } from '../../../firebase/utils';
import { SaveRounded } from '@material-ui/icons';
import ProductList from '../../../components/listas/ProductList';
import AddProductList from '../../../components/listas/AddProductList';
import axios from 'axios';
import { useAppContext } from '../../../context/store';
import SaveIcon from '@material-ui/icons/Save';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { getDateFormatted } from '../../../utils/utils';


const useStyles = makeStyles((theme) => ({
    addButton: {
        margin: theme.spacing(1),
        left: 0
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    panelContainer: {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    },
    buttonAbsolute: {
        position: 'absolute',
        right: 10,
        bottom: 10
    },
    buttonDraft: {
        position: 'absolute',
        right: 80,
        bottom: 20
    },
    anchor: {
        textDecoration: 'none',
        color: theme.palette.primary.dark
    },
    listHeader: {
        // display: 'flex',
        padding: theme.spacing(2),
    },
    headerTitle: {
        flexBasis: '100%'
    }
}));

function Lista({ listData }) {
    if (!listData) return <Error statusCode={404} title="Página no encontrada" />
    const router = useRouter();
    const classes = useStyles();
    const { setLoading, setAlertMessage, setShowAlert } = useAppContext();
    useEffect(() => {
        history.replaceState(null, '', location.href.split('?')[0]);
    });

    const [products, setProducts] = useState(listData.products.map(
        ({ amount, measure, product }) => ({ ...product, measure, amount })
    ))

    const [productsInList, setProductsInList] = useState(products);

    const [open, setOpen] = useState(false);

    const [draftMode, setDraftMode] = useState(false);

    const [date, setDate] = useState(listData.date);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const itemSelected = (product) => {
        setDraftMode(true);
        setProducts([...products, product]);
        setProductsInList([...products, product]);
    }

    const handleProductsChange = (products) => {
        setDraftMode(true);
        setProducts(products);
    }

    const handleDeleteItem = (id) => {
        setDraftMode(true);
        setProducts(products.filter(p => p.id !== id));
        setProductsInList(products.filter(p => p.id !== id));
    }

    const handleSetDate = (value) => {
        setDraftMode(true);
        setDate(value);
    }

    const saveChanges = async () => {
        setLoading(true);
        await axios.patch(`/api/list/${listData.id}`, { products, date: getDateFormatted(new Date(date)) });
        setDraftMode(false);
        setLoading(false);
    }
    return (
        <div className={classes.panelContainer}>
            <Grid container className={classes.listHeader}>
                <Grid item xs={12} md={6}>
                    <Typography className={classes.headerTitle} component="h3" variant="h5">
                        {`${listData.client.firstName} ${listData.client.lastName}`}
                    </Typography>
                    <Typography variant="body1" className={classes.headerTitle}>
                        {`${listData.name}`}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="date-picker-inline"
                            label="Fecha *"
                            value={date}
                            onChange={handleSetDate}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                {
                    products.length === 0 ?
                        <Typography
                            className={classes.noProducts}
                            variant="body2"
                            color="textSecondary">
                            No hay productos en la lista, por favor agreguelos.
                        </Typography> :
                        <ProductList
                            deleteItem={handleDeleteItem}
                            products={products}
                            setProducts={handleProductsChange}
                        />
                }
                {/* <ProductList deleteItem={handleDeleteItem} products={products} setProducts={handleProductsChange} /> */}
            </Grid>
            <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                <DialogTitle>
                    Seleccione algun producto
                </DialogTitle>
                <DialogContent>
                    <AddProductList itemSelected={itemSelected} productsInList={productsInList} />
                </DialogContent>
            </Dialog>
            <div className={classes.buttonAbsolute} onClick={handleOpen}>
                <Fab size="medium" color="primary" aria-label="add" className={classes.addButton}>
                    <AddIcon />
                </Fab>
            </div>
            {
                draftMode &&
                <div className={classes.buttonDraft} onClick={saveChanges}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        className={classes.button}
                        startIcon={<SaveIcon />}
                    >
                        Guardar
                    </Button>
                </div>
            }
        </div >
    )
}

export const getServerSideProps = async (ctx) => {
    const userId = parseCookies(ctx)[COOKIES_USER_ID];
    if (userId) {
        const clientRef = database.collection(COLLECTION_CLIENT);
        const client = await clientRef.doc(userId).get();
        if (client.exists && client.data().isAdmin) {

        } else {
            return {
                redirect: {
                    permanent: false,
                    destination: '/listas'
                }
            }
        }
    }
    const { id } = ctx.query;
    const listRef = database.collection(COLLECTION_LIST);
    const result = await listRef.doc(id).get();
    let listData;
    if (result.exists) {
        // const listResult = result.docs;
        const list = result.data();
        const client = (await list.client.get()).data();
        let products = []
        if (list.products) {
            products = await Promise.all(
                list.products.map(async p => {
                    const product = await getItemByRef(p.product);
                    const measures = await Promise.all(product.measures.map(getItemByRef));
                    return { ...p, id: p.product.id, product: { ...product, measures } }
                }));
        }
        listData = {
            ...list,
            id: result.id,
            client,
            products
        }
        return {
            props: {
                listData
            }
        }
    } else {
        // if (create) {
        //     const userId = parseCookies(ctx)[COOKIES_USER_ID];
        //     const list = await listRef.add({
        //         date: id,
        //         client: database.doc(`${COLLECTION_CLIENT}/${userId}`)
        //     });
        //     listData = {
        //         id: list.id,
        //         client: userId,
        //         products: []
        //     };
        //     return {
        //         props: {
        //             listData
        //         }
        //     }
        // } else {

        // }
        return {
            props: {}
        };
    }
}

export default Lista;

