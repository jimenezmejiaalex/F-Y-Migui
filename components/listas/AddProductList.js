import { InputBase, List, makeStyles, fade } from '@material-ui/core'
import { SearchOutlined } from '@material-ui/icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/store';
import Loading from '../Loading';
import AddProductItem from './AddProductItem';

const useStyles = makeStyles((theme) => ({
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}))

function AddProductList({ productsInList, itemSelected }) {
    const [searchValue, setSearchValue] = useState('');
    const classes = useStyles();
    const { setLoading, loading } = useAppContext();
    const [products, setProducts] = useState([]);
    const [productsFiltered, setProductsFiltered] = useState(products);
    const filterProducts = (products) => products.filter(product => !productsInList.some(p => p.id === product.id));
    useEffect(async () => {
        setLoading(true);
        const { data } = await axios.get('/api/product');
        setProducts(data);
        setProductsFiltered(filterProducts(data));
        setLoading(false);
    }, [productsInList]);

    const handleSearchChange = ({ target }) => {
        setSearchValue(target.value);
        setProductsFiltered(
            products.filter(
                ({ name, id }) =>
                    name
                        .toLowerCase()
                        .includes(target.value.toLowerCase()) &&
                    !productsInList.some(p => p.id === id)
            )
        )
    };
    return (
        <>
            {loading && <Loading />}
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchOutlined />
                </div>
                <InputBase
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Buscar…"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                />
            </div>
            {
                productsFiltered.length > 0 ?
                    (
                        <List>
                            {productsFiltered.map(
                                product =>
                                    <AddProductItem
                                        key={product.id}
                                        product={product}
                                        selected={() => itemSelected({ ...product, measure: product.measures[0].name, amount: 1 })}
                                    />
                            )}
                        </List>
                    ) :
                    (
                        <h4>Ningun producto encontrado...</h4>
                    )
            }
        </>
    )
}

export default AddProductList
