import { auth, database } from "../../firebase/app";
import { COLLECTION_CLIENT, ERROR_EMAIL_ALREADY_IN_USE, ERROR_WRONG_PASSWORD } from "../../utils/consts";

export default async (req, res) => {
    const { method } = req;
    switch (method) {
        case 'POST':
            try {
                const params = req.query;
                if (params.type === 'login') {
                    const { email, pass } = req.body;
                    await auth.signInWithEmailAndPassword(email, pass);
                    const userRef = database.collection(COLLECTION_CLIENT);
                    const userDB = await userRef.where('email', '==', email).get();
                    const user = {
                        id: userDB.docs[0].id,
                        email: userDB.docs[0].data().email,
                        isAdmin: !!userDB.isAdmin
                    };
                    res.json(user);
                } else if (params.type === 'logout') {
                    // const result = auth.cur.out
                }
            } catch (error) {
                if (error.code === ERROR_WRONG_PASSWORD) {
                    res.status(400).json({ message: 'Contraseña errónea' })
                } else {
                    res.status(400).json({ message: 'Ocurrio un error al registrar' })
                }
            }
            break;
    }
}