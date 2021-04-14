import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@material-ui/core';
import { database, storage } from '../../../firebase/app';
import { COLLECTION_CLIENT, COLLECTION_MEASURE, COLLECTION_PRODUCT, COOKIES_USER_ID } from '../../../utils/consts';
import { useAppContext } from '../../../context/store';
import axios from 'axios';
import { getItemByRef } from '../../../firebase/utils';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import FileUpload from '../../../components/FileUpload';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    formControl: {
        margin: theme.spacing(1),
        width: '100%',
    },
    upload: {
        padding: '10px',
    },
    errorMessage: {
        color: 'red',
        fontSize: '14px'
    }
}));

export default function Product({ measuresData, product }) {
    const classes = useStyles();
    const router = useRouter();
    const [measures, setMeasures] = useState(product.measures.map(({ id }) => id))
    const [open, setOpen] = React.useState(false);
    const [image, setImage] = useState(product.image);
    const [name, setName] = useState(product.name);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleNameChange = ({ target }) => setName(target.value);
    const handleChange = (event) => setMeasures(event.target.value);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);
    const { loading, setLoading } = useAppContext();

    const fieldsEmpty = measures.length === 0 || !image || name.length === 0;

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!fieldsEmpty) {
            setError(false);
            let imageURL;
            if (typeof image !== 'string') {
                const storageRef = storage.ref();
                const imageRef = storageRef.child(image.name);
                const imageSnapshot = await imageRef.put(image);
                imageURL = await imageSnapshot.ref.getDownloadURL();
            } else {
                imageURL = image;
            }
            const body = {
                imageURL,
                name,
                measures
            }
            const result = await axios.patch(`/api/product/${router.query.id}`, body);
            router.push('/panel/productos').then(() => setLoading(false))
        } else {
            setLoading(false);
            setError(true);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <form className={classes.form} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                value={name}
                                autoComplete="nombre"
                                name="nombre"
                                variant="outlined"
                                required
                                fullWidth
                                id="nombre"
                                label="Nombre"
                                autoFocus
                                onChange={handleNameChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel id="demo-controlled-open-select-label">Medidas *</InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={open}
                                    onClose={handleClose}
                                    onOpen={handleOpen}
                                    value={measures}
                                    multiple
                                    onChange={handleChange}
                                >{
                                        measuresData.map(measure => (<MenuItem key={measure.id} value={measure.id}>{measure.name}</MenuItem>))
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel className={classes.upload} id="demo-controlled-open-select-label">Subir Imagen *</InputLabel>
                            <FileUpload value={image} setValue={setImage} accept="image/*" />
                        </Grid>
                    </Grid>
                    {error && <FormHelperText className={classes.errorMessage}>Por favor llene los campos requeridos</FormHelperText>}
                    {success && <FormHelperText >Se ha actualizado con exito</FormHelperText>}
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleCreateProduct}
                    >
                        Actualizar
                    </Button>
                </form>
            </div>
        </Container>
    );
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
    const { id } = ctx.query;
    const measuresRef = database.collection(COLLECTION_MEASURE);
    let measuresData = await measuresRef.get();
    measuresData = measuresData.docs.map(measure => ({ ...measure.data(), id: measure.id }));
    const productRef = database.collection(COLLECTION_PRODUCT);
    const productDB = await productRef.doc(id).get();
    const product = {
        id: productDB.id,
        ...productDB.data(),
        measures: await Promise.all(productDB.data().measures.map(getItemByRef))
    };

    return {
        props: {
            measuresData,
            product
        }
    }
}