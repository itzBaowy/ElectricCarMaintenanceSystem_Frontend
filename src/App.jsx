import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import Contact from "./pages/customer/Contact";
import PaymentSuccess from "./pages/customer/PaymentSuccess";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requireAuth={false}>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["ROLE_ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute
                requireAuth={true}
                allowedRoles={["ROLE_CUSTOMER"]}
              >
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["ROLE_STAFF"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician"
            element={
              <ProtectedRoute
                requireAuth={true}
                allowedRoles={["ROLE_TECHNICIAN"]}
              >
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute
                requireAuth={true}
                allowedRoles={["ROLE_CUSTOMER"]}
              >
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentSuccess"
            element={
              <ProtectedRoute
                requireAuth={true}
                allowedRoles={["ROLE_CUSTOMER"]}
              >
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
