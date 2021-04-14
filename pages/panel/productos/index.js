import { Button, Fab, makeStyles } from "@material-ui/core";
import { Add, Save } from "@material-ui/icons";
import axios from "axios";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { useState } from "react";
import ProductsList from "../../../components/ProductsList";
import Search from "../../../components/Search";
import { useAppContext } from "../../../context/store";
import { database } from "../../../firebase/app"
import { getItemByRef } from "../../../firebase/utils";
import { COLLECTION_CLIENT, COLLECTION_PRODUCT, COOKIES_USER_ID } from "../../../utils/consts";

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

function Products({ products = [] }) {
    const { setLoading, setAlertMessage, setShowAlert } = useAppContext();
    const router = useRouter();
    const classes = useStyles();
    const [draftMode, setDraftMode] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState(products.sort((a, b) => a.name < b.name ? -1 : 1));
    const handleSearchValueChange = (value) => {
        setFilteredProducts(products.filter(({ name }) => name.includes(value)));
    }
    const handleSetProducts = (value) => {
        setDraftMode(true);
        setFilteredProducts(value.sort((a, b) => a.name < b.name ? -1 : 1));
    }
    const saveChanges = async () => {
        setLoading(true);
        try {
            const result = await axios.patch('/api/product', { products: filteredProducts });
            setDraftMode(false);
        } catch (error) {
            setAlertMessage('Error al enviar los cambios');
            setShowAlert(true);
        }
        setLoading(false);
    }
    const handleAddProduct = () => {
        setLoading(true);
        router.push('/panel/productos/crear').then(() => setLoading(false));
    }
    return (
        <div>
            <Search handleOnChange={handleSearchValueChange} />
            <ProductsList
                products={filteredProducts}
                showActivate={true}
                setProducts={handleSetProducts}
            />
            <div className={classes.buttonAbsolute} onClick={handleAddProduct}>
                <Fab size="medium" color="primary" aria-label="add" className={classes.addButton}>
                    <Add />
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
                        startIcon={<Save />}
                    >
                        Guardar
                    </Button>
                </div>
            }
        </div>
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
    const productsDB = await productsRef.get();
    const products = await Promise.all(productsDB.docs.map(
        async product => ({
            ...product.data(),
            id: product.id,
            measures: await Promise.all(product.data().measures.map(getItemByRef))
        })
    ));

    return {
        props: {
            products
        }
    }
}
export default Products
