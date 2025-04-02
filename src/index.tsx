import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const theme = extendTheme({
  colors: {
    gold: {
      50: '#FFF9E5',
      100: '#FFEEB8',
      200: '#FFE38A',
      300: '#FFD85C',
      400: '#FFCD2E',
      500: '#FFC300',
      600: '#CCA000',
      700: '#997800',
      800: '#665000',
      900: '#332800',
    },
    brand: {
      100: '#f7fafc',
      500: '#718096',
      900: '#171923',
    },
  },
  fonts: {
    heading: '"Montserrat", sans-serif',
    body: '"Roboto", sans-serif',
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
