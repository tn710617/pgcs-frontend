import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import {RecoilRoot} from "recoil";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

import Echo from 'laravel-echo';

import Pusher from "pusher-js";
import {getUserHashId} from "./Messages/handlers";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.REACT_APP_REVERB_APP_KEY,
    wsHost: process.env.REACT_APP_REVERB_HOST,
    wsPort: process.env.REACT_APP_REVERB_PORT,
    wssPort: process.env.REACT_APP_REVERB_PORT,
    forceTLS: (process.env.REACT_APP_REVERB_SCHEME ?? 'https') === 'https',
    auth: {
        headers: {
            'Authorization': `Bearer ${getUserHashId()}`,
        }

    },
    authEndpoint: `https://${process.env.REACT_APP_API_DOMAIN}/broadcasting/auth`,
    enabledTransports: ['ws', 'wss'],
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter basename={process.env.PUBLIC_URL}>
                    <App/>
                    <ReactQueryDevtools initialIsOpen={false}/>
                </BrowserRouter>
            </QueryClientProvider>
        </RecoilRoot>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();