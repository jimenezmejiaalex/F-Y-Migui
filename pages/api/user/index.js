import { auth, database } from "../../../firebase/app";
import { COLLECTION_CLIENT, ERROR_EMAIL_ALREADY_IN_USE, ERROR_WRONG_PASSWORD } from "../../../utils/consts";

export default async (req, res) => {
    const { method } = req;
    switch (method) {
        case 'GET':
            try {
                const { email } = req.query;
                const userRef = database.collection(COLLECTION_CLIENT);
                const userDB = await userRef.where('email', '==', email).get();
                const user = {
                    id: userDB.docs[0].id,
                    email: userDB.docs[0].data().email,
                    isAdmin: userDB.docs[0].data().isAdmin
                };
                res.json(user);
            } catch (error) {
                if (error.code === ERROR_WRONG_PASSWORD) {
                    res.status(400).json({ message: 'Contraseña errónea' })
                } else {
                    res.status(400).json({ message: 'Ocurrio un error al registrar' })
                }
            }
            break;
        case 'POST':
            try {
                const { body } = req;
                const {
                    firstName,
                    lastName,
                    comercio,
                    email,
                    password,
                } = body;
                const userCredentials = await auth.createUserWithEmailAndPassword(email, password);
                const clientRef = database.collection(COLLECTION_CLIENT);
                const client = await clientRef.add({
                    address: comercio,
                    firstName,
                    lastName,
                    email
                });
                res.json({ id: client.id, email });
            } catch (error) {
                if (error.code === ERROR_EMAIL_ALREADY_IN_USE) {
                    res.status(400).json({ message: 'Correo en uso' })
                } else {
                    res.status(400).json({ message: 'Ocurrio un error al registrar' })
                }
            }
            break;
    }
}