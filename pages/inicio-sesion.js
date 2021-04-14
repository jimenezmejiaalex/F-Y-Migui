import { useState } from 'react';
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useAppContext } from '../context/store';
import axios from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { COOKIES_USER_EMAIL, COOKIES_USER_ID } from '../utils/consts';
import { useRouter } from 'next/router';
import { auth } from '../firebase/app';

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
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function SignIn() {
    const router = useRouter();
    const { setLoading } = useAppContext();
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = ({ target }) => setEmail(target.value);
    const handlePasswordChange = ({ target }) => setPassword(target.value);

    const handleLogin = async (e) => {
        setLoading(true);
        try {
            // const { data } = await axios.post('api/account?type=login', { email, pass: password });
            const result = await auth.signInWithEmailAndPassword(email, password);
            if (result.user) {
                const { data } = await axios.get(`api/user?email=${email}`);
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
            setLoading(false);
            console.error(error);
            // setErrorMessage(error.response.data.message);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Inicio de sesion
                </Typography>
                <div className={classes.form} >
                    <TextField
                        value={email}
                        onChange={handleEmailChange}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <TextField
                        value={password}
                        onChange={handlePasswordChange}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <Button
                        onClick={handleLogin}
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Iniciar
                    </Button>
                    <Grid container>
                        {/* <Grid item xs>
                            <Link href="#" variant="body2">
                                Olvidaste la clave?
                             </Link>
                        </Grid> */}
                        <Grid item>
                            <Link href="#" variant="body2">
                                {"No tienes cuenta? Crea una"}
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </Container>
    );
}