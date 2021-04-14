import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../components/theme';
import { AppContextWrapper, useAppContext } from '../context/store';
import AppBar from '../components/AppBar';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import AlertConfirmation from '../components/AlertConfirmation';
import { auth } from '../firebase/app';
import { destroyCookie, parseCookies } from 'nookies';
import { COOKIES_USER_EMAIL, COOKIES_USER_ID } from '../utils/consts';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function MyApp(props) {
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [alertConfirmationMessage, setAlertConfirmationMessage] = useState('');
  const [alertConfirmationTitle, setAlertConfirmationTitle] = useState('');
  const router = useRouter();

  const shareState = {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    alertMessage,
    setAlertMessage,
    showAlert,
    setShowAlert,
    showAlertConfirmation,
    setShowAlertConfirmation,
    alertConfirmationMessage,
    setAlertConfirmationMessage,
    alertConfirmationTitle,
    setAlertConfirmationTitle
  };

  useEffect(async () => {
    const cookies = parseCookies();
    if (!auth.currentUser) {
      if (!cookies[COOKIES_USER_ID] && !cookies[COOKIES_USER_EMAIL]) {
        setCurrentUser(null);
      } else {
        const { data } = await axios.get(`/api/user?email=${cookies[COOKIES_USER_EMAIL]}`);
        setCurrentUser(data);
      }
    } else {
      const { data } = await axios.get(`/api/user?email=${auth.currentUser.email}`);
      setCurrentUser(data);
    }
  }, [auth.currentUser]);

  return (
    <React.Fragment>
      <Head>
        <title>F&V Migui</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {loading && <Loading />}
        <AppContextWrapper shareState={shareState}>
          <AppBar />
          {showAlert && <Alert message={alertMessage} />}
          <AlertConfirmation
            open={showAlertConfirmation}
            message={alertConfirmationMessage}
            title={alertConfirmationTitle}
            handleAgree={() => { }}
            handleCancel={() => { }}
            handleClose={() => { }}
          />
          <div style={{
            opacity: loading ? '.5' : '1',
            marginTop: '70px',
          }}>
            <Component {...pageProps} />
          </div>
        </AppContextWrapper>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
