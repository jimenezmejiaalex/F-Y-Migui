import { Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Fab, Grid, IconButton, List, makeStyles, Typography } from '@material-ui/core';
import { database } from '../../firebase/app';
import { COLLECTION_CLIENT, COLLECTION_LIST, COLLECTION_PRODUCT, COOKIES_USER_ID } from '../../utils/consts';
import ProductsList from '../../components/ProductsList';
import { getItemByRef } from '../../firebase/utils';
import { AddAlarmRounded, AddCircleOutlined, Visibility } from '@material-ui/icons';
import { useRouter } from 'next/router';
import { useAppContext } from '../../context/store';
import { parseCookies } from 'nookies';
import { getDateFormatted } from '../../utils/utils';
import OrderItemList from '../../components/orders/OrderItemList';
import OrderList from '../../components/orders/OrderList';

const useStyles = makeStyles((theme) => ({
    addButton: {
        margin: theme.spacing(1),
        left: 0
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    panelContainer: {
        // display: 'flex',
        // flex
    },
    buttonAbsolute: {
        position: 'absolute',
        right: 10,
        bottom: 10
    },
    card: {
        margin: '10px',
        position: 'relative'
    },
    buttonCard: {
        margin: '0 10px'
    },
    cardHeader: {
        position: 'absolute',
        width: '100%'
    },
    cardContent: {
        marginTop: '35px',
        overflow: 'scroll',
        height: '250px'
    },
    actionButton: {
        margin: theme.spacing(1)
    },
    noOrders: {
        textAlign: 'center',
        paddingTop: '110px'
    }
}));

function Panel({ products, orders }) {
    const router = useRouter();
    const { setLoading } = useAppContext();
    const handleDeleteOrder = (id) => { }
    const handleEditOrder = (id) => {
        setLoading(true);
        router.push(`/listas/${id}`).then(() => setLoading(false))
    }
    const orderParsed = orders.map(
        order => ({
            ...order,
            client: `${order.client.firstName} ${order.client.lastName}`,
            handleEdit: () => handleEditOrder(order.date),
            handleDelete: () => handleDeleteOrder(order.id)
        })
    );
    const classes = useStyles();
    const handleCreateProduct = () => {
        setLoading(true);
        router.push('/panel/productos/crear').then((() => setLoading(false)));
    }
    const handleGoToAllOrders = () => {
        setLoading(true);
        router.push('/panel/listas').then(() => setLoading(false));
    }
    const handleGoToTodayOrders = () => {
        setLoading(true);
        router.push('/panel/listas?fecha=hoy').then(() => setLoading(false));
    }
    const handleGoToAllProducts = () => {
        setLoading(true);
        router.push('/panel/productos').then(() => setLoading(false));
    }
    return (
        <Grid container>
            <Grid item xs={12} md={6} className={classes.gridContainer}>
                <Card className={classes.card}>
                    <CardHeader
                        className={classes.cardHeader}
                        title="Productos"
                        action={
                            <Button
                                className={classes.actionButton}
                                onClick={handleCreateProduct}
                                color="primary"
                                variant="contained"
                                startIcon={<AddCircleOutlined />}
                            >Crear</Button>
                        }
                    />
                    <CardContent className={classes.cardContent}>
                        <ProductsList products={products} />
                    </CardContent>
                    <CardActions>
                        <Button
                            className={classes.actionButton}
                            onClick={handleGoToAllProducts}
                            color="primary"
                            variant="contained"
                            startIcon={<Visibility />}
                        >Todos</Button>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={12} md={6} className={classes.gridContainer}>
                <Card className={classes.card}>
                    <CardHeader
                        className={classes.cardHeader}
                        title={`Pedidos`}
                        action={
                            <Button
                                className={classes.actionButton}
                                onClick={handleCreateProduct}
                                color="primary"
                                variant="contained"
                                startIcon={<AddCircleOutlined />}
                            >Crear</Button>
                        }
                    />
                    <CardContent className={classes.cardContent}>
                        {
                            orderParsed.length > 0 ?
                                <OrderList orders={orderParsed} /> :
                                <Typography className={classes.noOrders} variant="body2" color="textSecondary">
                                    No hay pedidos para el día de hoy
                                </Typography>
                        }
                    </CardContent>
                    <CardActions>
                        <Button
                            className={classes.actionButton}
                            onClick={handleGoToAllOrders}
                            color="primary"
                            variant="contained"
                            startIcon={<Visibility />}
                        >Todos</Button>
                        <Button
                            className={classes.actionButton}
                            onClick={handleGoToTodayOrders}
                            color="primary"
                            variant="contained"
                            startIcon={<Visibility />}
                        >Hoy</Button>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
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
    const productsRef = database.collection(COLLECTION_PRODUCT);
    let products = await productsRef.get();
    products = products.docs.map(value => ({ ...value.data(), id: value.id }));
    products = await Promise.all(
        products.map(
            async value => (
                {
                    ...value,
                    measures: await Promise.all(
                        value.measures.map(getItemByRef)
                    )
                }
            )
        )
    );
    const orderRef = database.collection(COLLECTION_LIST);
    const orderDB = await orderRef
        .where('date', '==', getDateFormatted())
        .where('sent', '==', true)
        .get();
    const orders = await Promise.all(orderDB.docs.map(
        async order => ({
            name: order.data().name,
            date: order.data().date,
            client: '',
            id: order.id,
            client: await getItemByRef(order.data().client)
        })
    ));
    return {
        props: {
            products,
            orders
        }
    }
}

export default Panel
