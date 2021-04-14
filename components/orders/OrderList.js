import { List } from '@material-ui/core'
import React from 'react'
import OrderItemList from './OrderItemList'

function OrderList({ orders = [], showProducts }) {
    return (
        <List>
            {orders.map(order => (<OrderItemList key={order.id} showProducts={showProducts} {...order} />))}
        </List>
    )
}

export default OrderList
