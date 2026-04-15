import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import { ProductPage } from '@pages/ProductPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { AdminPage } from '@pages/AdminPage';
import { ProfilePage } from '@pages/ProfilePage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@pages/ResetPasswordPage';
import { OrdersPage } from '@pages/OrdersPage';
import { UsersPage } from '@pages/UsersPage';
import { AdminReviewsPage } from '@pages/AdminReviewsPage';
import { MemoGamePage } from '@features/memo-game/pages/MemoGamePage';
import { CardSetsPage } from '@features/memo-game/pages/CardSetsPage';
import { LeaderboardPage } from '@features/memo-game/pages/LeaderboardPage';
import { CardSetEditorPage } from '@features/memo-game/pages/CardSetEditorPage';
import { MultiplayerPage } from '@features/memo-game/pages/MultiplayerPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Memo Game Routes */}
      <Route path="/memo" element={<CardSetsPage />} />
      <Route path="/memo/multiplayer" element={<MultiplayerPage />} />
      <Route path="/memo/:id" element={<MemoGamePage />} />
      <Route path="/memo/sets/:id/edit" element={<CardSetEditorPage />} />
      <Route path="/memo/leaderboard" element={<LeaderboardPage />} />
    </Routes>
  );
}
