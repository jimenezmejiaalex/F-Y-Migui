import { database } from "../../../firebase/app";
import { getItemByRef } from "../../../firebase/utils";
import { sendEmail } from "../../../mailer";
import { clientSendOrder, clientSendOrderConfirmation } from "../../../mailer/templates";
import { COLLECTION_LIST, COLLECTION_PRODUCT } from "../../../utils/consts";


export default async (req, res) => {
    const { method } = req;
    const { id } = req.query;
    const listRef = database.collection(COLLECTION_LIST);
    switch (method) {
        case 'DELETE':
            try {
                await listRef.doc(id).delete();
                res.status(200).end();
            } catch (error) {
                res.status(400).end();
            }
            break;
        case 'PATCH':
            const body = req.body
            if (body.status) {
                try {
                    await listRef.doc(id).update({
                        sent: body.status
                    });
                    const listDB = await listRef.doc(id).get();
                    const list = listDB.data();
                    const client = await getItemByRef(list.client);
                    let response = await sendEmail(
                        process.env.MAILER_EMAIL,
                        `Pedido Enviado - ${client.firstName} ${client.lastName}`,
                        clientSendOrder(`${client.firstName} ${client.lastName}`, list.date)
                    );

                    response = await sendEmail(
                        client.email,
                        `Pedido enviado - ${list.name} - ${list.date}`,
                        clientSendOrderConfirmation(list.name, list.date)
                    );

                    res.status(200).end();
                } catch (error) {
                    console.error(error);
                    res.status(400).end();
                }
            } else {
                const { products } = body;
                try {
                    const listDB = await listRef.doc(id).get();
                    if (listDB.exists) {
                        const list = listDB.data();
                        const productsObj = products.map(
                            product => (
                                {
                                    amount: product.amount,
                                    measure: product.measure,
                                    product: database.doc(`${COLLECTION_PRODUCT}/${product.id}`),
                                }
                            )
                        );
                        list.products = [...productsObj];
                        if (body.date) {
                            list.date = body.date;
                        }
                        const data = await listRef.doc(listDB.id);
                        await data.set(list);
                        res.status(200).end();
                    } else res.status(400).end();
                } catch (error) {
                    console.log(error);
                    res.status(400).end();
                }
            }
            break;
        default:
            break;
    }
}
