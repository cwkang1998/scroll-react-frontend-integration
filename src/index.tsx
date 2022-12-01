import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Main from './Main';
import reportWebVitals from './reportWebVitals';
import { EthersConnect } from './components/ethers-connect';
import { WagmiConnect } from './components/wagmi-connect';
import { RainbowkitConnect } from './components/rainbowkit-connect';

import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/ethersjs",
    element: <EthersConnect />,
  },
  {
    path: "/wagmi",
    element: <WagmiConnect />,
  },
  {
    path: "/rainbowkit",
    element: <RainbowkitConnect />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
