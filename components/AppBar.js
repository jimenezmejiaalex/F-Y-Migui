import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { ExitToAppRounded } from '@material-ui/icons';
import InputIcon from '@material-ui/icons/Input';
import { getUserName } from '../utils/utils';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/store';
import { auth } from '../firebase/app';
import { destroyCookie } from 'nookies';
import { COOKIES_USER_EMAIL, COOKIES_USER_ID } from '../utils/consts';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    account: {
        marginLeft: theme.spacing(2),
    }
}));

export default function ButtonAppBar() {
    const { setLoading, currentUser, setCurrentUser } = useAppContext();
    const router = useRouter();
    const classes = useStyles();
    const goToListsPage = () => {
        setLoading(true);
        router.push('/listas').then(() => setLoading(false));
    };

    const goToRegisterPage = () => {
        setLoading(true);
        router.push('/registro').then(() => setLoading(false));
    }

    const goToLogin = () => {
        setLoading(true);
        router.push('/inicio-sesion').then(() => setLoading(false));
    }

    const goToPanelPage = () => {
        setLoading(true);
        router.push('/panel').then(() => setLoading(false));
    }

    const logout = async () => {
        setLoading(true);
        await auth.signOut();
        destroyCookie(null, COOKIES_USER_EMAIL);
        destroyCookie(null, COOKIES_USER_ID);
        setCurrentUser(null);
        router.push('/').then(() => setLoading(false));
    }

    return (
        <div className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton> */}
                    <Typography variant="h6" className={classes.title}>
                        F&Y Migui
                    </Typography>
                    {
                        currentUser !== null ?
                            (
                                <>
                                    {currentUser.isAdmin && <Button color="inherit" onClick={goToPanelPage}>Panel</Button>}
                                    {!currentUser.isAdmin && <Button color="inherit" onClick={goToListsPage}>Listas</Button>}
                                </>
                            )
                            :
                            (
                                <>
                                    <Button color="inherit" onClick={goToRegisterPage}>Crear cuenta</Button>
                                </>
                            )
                    }
                    {
                        currentUser !== null ?
                            <Button className={classes.account} onClick={logout} color="inherit" endIcon={<ExitToAppRounded />} >
                                {getUserName(currentUser.email)}
                            </Button>
                            :
                            <Button onClick={goToLogin} className={classes.account} color="inherit" startIcon={<InputIcon />}>
                                Login
                            </Button>
                    }
                </Toolbar>
            </AppBar>
        </div>
    );
}
