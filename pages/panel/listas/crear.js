import { Container, Grid, TextField, makeStyles, Typography, Button, LinearProgress, Select, MenuItem, InputLabel } from '@material-ui/core';
import { createRef, useState } from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { COLLECTION_CLIENT, COOKIES_USER_ID } from '../../../utils/consts';
import { useRouter } from 'next/router';
import { getDateFormatted } from '../../../utils/utils';
import { database } from '../../../firebase/app';
import { getItemByRef } from '../../../firebase/utils';

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        "&:hover": {
            backgroundColor: theme.palette.secondary.main,
        }
    },
    container: {
        marginTop: '10%',
        padding: '2%',
        borderRadius: '10px',
    },
    textfield: {

    },
    page: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: 'calc(var(--vh, 1vh) * 100)'
    },
    error: {
        color: 'red',
    },
    success: {
        color: 'green',
    },
    [theme.breakpoints.down('sm')]: {
        container: {
            width: '80%',
            marginTop: '20%',
        },
        paper: {
            width: '90%',
            margin: 'auto'
        },
    },
}));

function Crear({ clients = [] }) {
    const router = useRouter();
    const initialForm = {
        client: '',
        name: '',
        date: new Date()
    }
    const formRef = createRef();
    const [form, setForm] = useState(initialForm)
    const [showSpinner, setShowSpinner] = useState(false)
    const [errors, setErrors] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false)
    const [success, setSuccess] = useState(false)
    const classes = useStyles();

    const handleChange = (prop) => (event) => {
        if (prop === 'date') {
            setForm({ ...form, [prop]: event })
        } else setForm({ ...form, [prop]: event.target.value });
    };
    const createOrder = async (e) => {
        e.preventDefault();
        try {
            setShowSpinner(true);
            if (form.name.length === 0) {
                setErrors(true);
                setErrorMessage('Llene los campos requeridos');
                setShowSpinner(false);
                return;
            }
            const userId = parseCookies()[COOKIES_USER_ID];
            const { data } = await axios.post('/api/list', { ...form, userId: form.client, date: getDateFormatted(form.date), status: true });
            setErrors(false);
            setSuccess(true);
            router.push(`/panel/listas/${data.id}`).then(() => setShowSpinner(false));
        } catch (error) {
            setErrors(true);
            setErrorMessage(
                error.response.status === 409 ?
                    'Un pedido con esa fecha ya existe' :
                    'Ocurrio un error al crear el pedido'
            );
            setShowSpinner(false);
            setSuccess(false);
        }
    }
    return (
        <div className={classes.page}>
            <Container component="main" maxWidth="xs" className={classes.container}>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Crear Lista
                    </Typography>
                    <form className={classes.form} onSubmit={createOrder} ref={formRef} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} >
                                <TextField
                                    className={classes.textfield}
                                    name="name"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Nombre"
                                    autoFocus
                                    onChange={handleChange('name')}
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <InputLabel id="demo-simple-select-filled-label">Comercio</InputLabel>
                                <Select
                                    fullWidth
                                    label="Comercio"
                                    value={form.client}
                                    onChange={handleChange('client')}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    {
                                        clients.map(
                                            client => <MenuItem key={client.id} value={client.id}>{`${client.firstName} - ${client.address}`}</MenuItem>
                                        )
                                    }
                                </Select>
                            </Grid>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid item xs={12} >
                                    <KeyboardDatePicker
                                        fullWidth
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        id="date-picker-inline"
                                        label="Fecha *"
                                        value={form.date}
                                        onChange={handleChange('date')}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>
                        </Grid>
                        {errors && (<p className={classes.error}>{errorMessage}</p>)}
                        {success && (<p className={classes.success}>Se ha creado correctamente</p>)}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            className={classes.submit}
                        >Crear</Button>
                    </form>
                </div>
                {showSpinner && (<LinearProgress color="secondary" />)}
            </Container>
        </div >
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
    const clientRef = database.collection(COLLECTION_CLIENT);
    const clients = await clientRef.get();
    return {
        props: {
            clients: clients.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(client => !client.isAdmin)
        }
    }
}

export default Crear
