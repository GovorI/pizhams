import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { AppRoutes } from './AppRoutes';
import { Header } from '@widgets/Header';
import { CartSidebar } from '@widgets/CartSidebar';
import { fetchMe } from '@entities/user/user.slice';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const dispatch = store.dispatch;
  
  useEffect(() => {
    // Try to fetch current user if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchMe());
    }
  }, []);
  
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <main className="flex-grow-1">
        <AppRoutes />
      </main>
      <CartSidebar />
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
