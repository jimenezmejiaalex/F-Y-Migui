import React, { useState } from 'react';
import List from '@material-ui/core/List';
import ProductItem from './ProductItem';

function ProductsList({ products, showActivate, setProducts }) {
    return (
        <List>
            {products.map(
                product =>
                    <ProductItem
                        key={product.id}
                        product={product}
                        showActivate={showActivate}
                        setProduct={
                            (value) => setProducts([...products.filter(p => p.id !== product.id), value])
                        }
                    />
            )}
        </List>
    )
}

export default ProductsList
