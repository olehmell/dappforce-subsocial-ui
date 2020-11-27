// TODO remove global import of all AntD CSS, use modular LESS loading instead.
// See .babelrc options: https://github.com/ant-design/babel-plugin-import#usage
import 'src/styles/antd.css'

import 'src/styles/bootstrap-utilities-4.3.1.css'
import 'src/styles/components.scss'
import 'src/styles/github-markdown.css'
import 'easymde/dist/easymde.min.css'

// Subsocial custom styles:
import 'src/styles/subsocial.scss'
import 'src/styles/utils.scss'
import 'src/styles/subsocial-mobile.scss'

import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import MainPage from '../layout/MainPage'
import { Provider } from 'react-redux'
import store from 'src/redux/store'
import rtkStore from 'src/rtk/app/store'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

function MyApp (props) {
  const { Component, pageProps } = props
  return (
    <>
      <Head>
        <script src="/env.js" />
        {/*
          See how to work with custom fonts in Next.js:
          https://codeconqueror.com/blog/using-google-fonts-with-next-js
        */}
        {/* <link rel="font/ttf" href="/fonts/PTSerif-Bold.ttf" /> */}
        {/* <link rel="font/ttf" href="/fonts/NotoSerif-Bold.ttf" /> */}
        {/* <link rel="font/ttf" href="/fonts/Merriweather-Bold.ttf" /> */}
      </Head>
      <Provider store={store}>
        <Provider store={rtkStore}>
          <MainPage>
            <Component {...pageProps} />
          </MainPage>
        </Provider>
      </Provider>
    </>
  )
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)

  return { ...appProps }
}

export default MyApp
