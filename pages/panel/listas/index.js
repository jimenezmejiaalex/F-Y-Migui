import { Grid } from '@material-ui/core';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useState } from 'react'
import OrderList from '../../../components/orders/OrderList';
import Search from '../../../components/Search';
import { useAppContext } from '../../../context/store';
import { database } from '../../../firebase/app';
import { getItemByRef } from '../../../firebase/utils';
import { COLLECTION_CLIENT, COLLECTION_LIST, COOKIES_USER_ID } from '../../../utils/consts';
import { getDateFormatted } from '../../../utils/utils';

function Listas({ orders }) {
    const { setLoading } = useAppContext();
    const router = useRouter();
    const params = router.query;
    const orderParsed = orders.map(
        order => ({
            ...order,
            client: `${order.client.firstName} ${order.client.lastName}`,
            handleEdit: () => handleEditOrder(order.id),
            handleDelete: () => handleDeleteOrder(order.id),
            products: order.products ? order.products.map(p => ({ ...p, ...p.product })) : []
        })
    );
    const [ordersFiltered, setOrdersFiltered] = useState(orderParsed);
    const handleDeleteOrder = (id) => { }
    const handleEditOrder = (id) => {
        setLoading(true);
        router.push(`listas/${id}`).then(() => setLoading(false))
    }
    const handleSearchChange = (value) => {
        setLoading(true);
        setOrdersFiltered(
            orderParsed.filter(
                order =>
                    order.name.toLowerCase().includes(value) ||
                    order.date.toLowerCase().includes(value) ||
                    order.client.toLowerCase().includes(value)
            )
        );
        setLoading(false);
    }

    return (
        <>
            <Grid>
                <Search handleOnChange={handleSearchChange} />
            </Grid>
            <Grid>
                <OrderList showProducts={!!params.fecha} orders={ordersFiltered} />
            </Grid>
        </>
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
    const params = ctx.query;
    const orderRef = database.collection(COLLECTION_LIST);
    const orderDB = !params.fecha
        ? await orderRef
            .where('sent', '==', true)
            .limit(50)
            .get()
        : await orderRef
            .where('date', '==', params.fecha === 'hoy' ? getDateFormatted() : params.fecha)
            .where('sent', '==', true)
            .get();
    const orders = await Promise.all(orderDB.docs.map(
        async order => {
            const obj = {
                name: order.data().name,
                date: order.data().date,
                client: '',
                id: order.id,
                client: await getItemByRef(order.data().client)
            }
            if (order.data().products && params.fecha === 'hoy') {
                obj.products = await Promise.all(
                    order.data().products.map(async p => {
                        const product = await getItemByRef(p.product);
                        const measures = await Promise.all(product.measures.map(getItemByRef));
                        return { ...p, id: p.product.id, product: { ...product, measures } }
                    }));
            }
            return obj;
        }
    ));
    return {
        props: {
            orders
        }
    }
}

export default Listas
