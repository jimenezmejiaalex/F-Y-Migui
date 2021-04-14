import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useRouter } from 'next/router'
import { parseCookies, setCookie } from 'nookies'
import { COLLECTION_CLIENT, COOKIES_USER_EMAIL, COOKIES_USER_ID } from '../utils/consts';
import { encryptResult } from '../crypto';
import { useAppContext } from '../context/store';
import { auth, database } from '../firebase/app';

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
        color: theme.palette.text.main,
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
    link: {
        cursor: 'pointer'
    }
}));

function SignUp() {
    const { setLoading } = useAppContext();
    const classes = useStyles()
    const router = useRouter()
    const initialForm = {
        firstName: '',
        lastName: '',
        comercio: '',
        email: '',
        password: '',
        terms: false,
    }
    const formRef = React.createRef();
    const [form, setForm] = useState(initialForm)
    const [showSpinner, setShowSpinner] = useState(false)
    const [errors, setErrors] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const validEmailRegex = RegExp(
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    );

    const handleChange = (prop) => (event) => {
        setForm({ ...form, [prop]: event.target.value });
    };
    const handleTermsChange = () => {
        setForm({ ...form, terms: !form.terms });
    };
    const registerClient = async event => {
        setShowSpinner(true)
        event.preventDefault()
        if (validateInputs()) {
            if (validEmailRegex.test(form.email)) {
                if (form.password && form.password.length < 6) {
                    setErrors(true)
                    setErrorMessage("La contraseña debe tener mínimo 6 caracteres")
                    setShowSpinner(false);
                    return;
                }
                setErrors(false)
                try {
                    const { data } = await axios.post('/api/user', form);
                    const result = await auth.signInWithEmailAndPassword(form.email, form.password);
                    if (result.user) {
                        setCookie(null, COOKIES_USER_EMAIL, data.email, {
                            maxAge: 1 * 24 * 60 * 60,
                            path: '/',
                        });
                        setCookie(null, COOKIES_USER_ID, data.id, {
                            maxAge: 1 * 24 * 60 * 60,
                            path: '/',
                        });
                        if (data.isAdmin) {
                            router.push('/panel').then(() => setLoading(false));
                        } else {
                            router.push('/listas').then(() => setLoading(false))
                        }
                    }
                } catch (error) {
                    setErrors(true)
                    setErrorMessage(error.response.data.message);
                    setShowSpinner(false)
                }
                setShowSpinner(false)
            } else {
                setErrors(true)
                setErrorMessage("Debe colocar un correo electrónico válido")
                setShowSpinner(false)
            }
        } else {
            setErrors(true)
            setErrorMessage("Todos los campos son obligatorios")
            setShowSpinner(false)
        }
    }
    const validateInputs = () => {
        if (form.firstName && form.lastName && form.comercio
            && form.email && form.password
            && form.firstName.trim().length > 0
            && form.lastName.trim().length > 0
            && form.comercio.trim().length > 0 && form.email.trim().length > 0
            && form.password.trim().length > 0) {
            return true
        } else {
            return false
        }
    }

    const goToLoginPage = () => {
        setLoading(true);
        router.push('/inicio-sesion').then(() => setLoading(false));
    }

    return (
        <div className={classes.page}>
            <Container component="main" maxWidth="xs" className={classes.container}>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Registro
                    </Typography>
                    <form className={classes.form} onSubmit={registerClient} ref={formRef} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    className={classes.textfield}
                                    autoComplete="fname"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="Nombre"
                                    autoFocus
                                    onChange={handleChange('firstName')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    className={classes.textfield}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Apellidos"
                                    name="lastName"
                                    autoComplete="lname"
                                    onChange={handleChange('lastName')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.textfield}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="comercio"
                                    label="Comercio"
                                    name="id"
                                    autoComplete="id"
                                    onChange={handleChange('comercio')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.textfield}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Correo Electrónico"
                                    name="email"
                                    autoComplete="email"
                                    onChange={handleChange('email')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.textfield}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Contraseña"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={handleChange('password')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                        {errors && (<p className={classes.error}>{errorMessage}</p>)}
                        {success && (<p className={classes.success}>Se ha registrado correctamente</p>)}
                        <Button
                            color="inherit"
                            type="submit"
                            fullWidth
                            variant="contained"
                            className={classes.submit}
                        >
                            Crear
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Typography className={classes.link} variant="body2" onClick={goToLoginPage}>
                                    ¿Ya tiene una cuenta?
                                </Typography>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                {showSpinner && (<LinearProgress color="secondary" />)}
            </Container>
        </div>
    );
}

export const getServerSideProps = async (ctx) => {
    const userId = parseCookies(ctx)[COOKIES_USER_ID];
    if (userId) {
        const clientRef = database.collection(COLLECTION_CLIENT);
        const client = await clientRef.doc(userId).get();
        if (client.exists && client.data().isAdmin) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/panel'
                }
            }
        } else {
            return {
                redirect: {
                    permanent: false,
                    destination: '/listas'
                }
            }
        }
    }
    return {
        props: {
            data: null
        }
    }
}

export default SignUp;