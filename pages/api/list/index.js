import { database } from "../../../firebase/app";
import { COLLECTION_LIST, COLLECTION_CLIENT } from "../../../utils/consts";

export default async (req, res) => {
    const { method } = req;
    const listRef = database.collection(COLLECTION_LIST);
    switch (method) {
        case 'POST':
            try {
                const { name, date, userId, status } = req.body;
                const listDB = await listRef
                    .where('date', '==', date)
                    .where('client', '==', `${COLLECTION_CLIENT}/${userId}`)
                    .get();
                if (!listDB.empty) {
                    res.status(409).end();
                    return;
                }
                const list = await listRef.add({
                    name,
                    date,
                    client: database.doc(`${COLLECTION_CLIENT}/${userId}`),
                    sent: status ? status : false,
                });
                res.status(200).json({ id: list.id, date });
            } catch (error) {
                console.error(error);
                res.status(400).end();
            }
            break;

        default:
            break;
    }
}