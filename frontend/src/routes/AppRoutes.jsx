import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import TripsPage from '../pages/TripsPage';
import NewTripPage from '../pages/NewTripPage';
import TripDetailsPage from '../pages/TripDetailsPage';
import EditTripPage from '../pages/EditTripPage';
import ItineraryPage from '../pages/ItineraryPage';
import TripExpensesPage from '../pages/TripExpensesPage';
import TripHistoryPage from '../pages/TripHistoryPage';
import ExplorePage from '../pages/ExplorePage';
import RecommendationsPage from '../pages/RecommendationsPage';
import PublicTripView from '../pages/PublicTripView';
import ReportsPage from '../pages/ReportsPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Unprotected Shared Route */}
      <Route path="/shared/:shareToken" element={<PublicTripView />} />

      {/* Unprotected Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected Main Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<NewTripPage />} />
          <Route path="/trips/:id" element={<TripDetailsPage />} />
          <Route path="/trips/:id/edit" element={<EditTripPage />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryPage />} />
          <Route path="/trips/:id/expenses" element={<TripExpensesPage />} />
          <Route path="/trips/:id/history" element={<TripHistoryPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/recommendations" element={<RecommendationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
