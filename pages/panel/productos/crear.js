import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@material-ui/core';
import { database, storage } from '../../../firebase/app';
import { COLLECTION_CLIENT, COLLECTION_MEASURE, COOKIES_USER_ID } from '../../../utils/consts';
import FileUpload from '../../../components/FileUpload';
import { useAppContext } from '../../../context/store';
import axios from 'axios';
import { parseCookies } from 'nookies';

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

export default function Crear({ measuresData }) {
    const classes = useStyles();
    const [measures, setMeasures] = useState([])
    const [open, setOpen] = React.useState(false);
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
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
            const storageRef = storage.ref();
            const imageRef = storageRef.child(image.name);
            const imageSnapshot = await imageRef.put(image);
            const imageURL = await imageSnapshot.ref.getDownloadURL();
            const body = {
                imageURL,
                name,
                measures
            }
            const result = await axios.post('/api/product', body);
            setSuccess(true);
            setName('');
            setImage(null);
            setMeasures([]);
        } else {
            setError(true);
        }
        setLoading(false);
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
                    {success && <FormHelperText >Se ha creado con exito</FormHelperText>}
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleCreateProduct}
                    >
                        Crear
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
    const measuresRef = database.collection(COLLECTION_MEASURE);
    let measuresData = await measuresRef.get();
    measuresData = measuresData.docs.map(measure => ({ ...measure.data(), id: measure.id }));
    return {
        props: {
            measuresData
        }
    }
}