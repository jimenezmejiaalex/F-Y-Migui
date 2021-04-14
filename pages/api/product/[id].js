import { database } from "../../../firebase/app";
import { getItemByRef } from "../../../firebase/utils";
import { COLLECTION_MEASURE, COLLECTION_PRODUCT } from "../../../utils/consts";

export default async (req, res) => {
    const { method } = req;
    switch (method) {
        case 'GET':
            // try {
            //     const productRef = database.collection(COLLECTION_PRODUCT);
            //     const productsDB = await productRef.get();
            //     const products = await Promise.all(productsDB.docs.map(async p => {
            //         const productData = p.data();
            //         const measures = await Promise.all(productData.measures.map(getItemByRef));
            //         console.log(measures);
            //         const result = { id: p.id, ...p.data(), measures };
            //         return result;
            //     }));
            //     res.status(200).json(products);
            // } catch (error) {
            //     res.status(400).end();
            // }
            break
        case 'PATCH':
            try {
                const { imageURL, name, measures } = req.body;
                const productRef = database.collection(COLLECTION_PRODUCT);
                await productRef.doc(req.query.id).update({
                    image: imageURL,
                    name,
                    measures: measures.map(measureId => database.doc(`/${COLLECTION_MEASURE}/${measureId}`))
                });
                res.status(200).end();
            } catch (error) {
                console.error(error);
                res.status(400).end();
            }
            break;
    }
}