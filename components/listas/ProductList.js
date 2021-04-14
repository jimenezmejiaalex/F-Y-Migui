import { List } from '@material-ui/core'
import React from 'react'
import ProductListItem from '../ProductListItem'

function ProductList({ products, setProducts, deleteItem, sent }) {
    // const handleSetProducts = () => {}
    const parseProps = product => ({
        ...product,
        measures: product.measures,
        measure: product.measures.find(({ id }) => id === product.measure) ?
            product.measure :
            product.measures.find(({ name }) => name === product.measure).id,
        setMeasure: (id) => {
            const index = products.findIndex(p => p.id === product.id);
            const newProducts = products;
            newProducts[index] = {
                ...newProducts[index],
                measure: product.measures.find(p => p.id === id).name
            }
            setProducts([...newProducts]);
        },
        setAmount: (value) => {
            const index = products.findIndex(p => p.id === product.id);
            const newProducts = products;
            newProducts[index] = {
                ...newProducts[index],
                amount: value
            }
            setProducts([...newProducts]);
        },
        deleteItem: () => deleteItem(product.id),
        sent
    })
    return (
        <List>
            {products.map(
                product =>
                    <ProductListItem
                        key={product.id}
                        {...parseProps(product)}
                    />
            )}
        </List>
    )
}

export default ProductList
