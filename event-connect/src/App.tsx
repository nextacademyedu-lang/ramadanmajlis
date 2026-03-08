import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import NotificationProvider from './components/NotificationProvider';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetail';
import Leaderboard from './pages/Leaderboard';
import QnA from './pages/QnA';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminQA from './pages/admin/AdminQA';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return user ? <>{children}</> : <Navigate to="/welcome" />;
}

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/manageappramadan" element={<AdminDashboard />} />
            <Route path="/manageappramadan/leaderboard" element={<AdminLeaderboard />} />
            <Route path="/manageappramadan/qa" element={<AdminQA />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Home />} />
              <Route path="task/:id" element={<TaskDetail />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="qna" element={<QnA />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}
