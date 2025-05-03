import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useAuthStore } from './store/authStore'; // Import the store

// Initialize the auth listener when the app starts
const unsubscribeAuthListener = useAuthStore.getState().initializeAuthListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Optional: Unsubscribe listener on module unload (though typically not necessary in SPA)
// if (import.meta.hot) {
//   import.meta.hot.dispose(() => {
//     unsubscribeAuthListener();
//   });
// }

