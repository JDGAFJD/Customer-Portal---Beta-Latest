import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import AccountSettings from './pages/AccountSettings'
import ActivityLog from './pages/ActivityLog'
import TestLogin from './pages/TestLogin'
import Troubleshoot from './pages/Troubleshoot'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/account" element={<AccountSettings />} />
      <Route path="/activity" element={<ActivityLog />} />
      <Route path="/testing6699452" element={<TestLogin />} />
      <Route path="/troubleshoot" element={<Troubleshoot />} />
    </Routes>
  )
}

export default App
