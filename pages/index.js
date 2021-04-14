import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Frutas y Verduras Miguel
        </h1>

        <p className={styles.description}>
          Inicia sesion o cree una cuenta para empezar a generar sus pedidos.
        </p>
      </main>
    </div>
  )
}
