import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { LoginScreen } from "./Screens/LoginScreen.jsx";
import { ClientesScreen } from "./Screens/ClientesScreen.jsx";
import { NuevoPresupuestoScreen } from "./Screens/NuevoPresupuestoScreen.jsx";
import { PresupuestoDetalleScreen } from "./Screens/PresupuestoDetalleScreen.jsx";
import { PresupuestoEditarScreen } from "./Screens/PresupuestoEditarScreen.jsx";
import { PresupuestosScreen } from "./Screens/PresupuestosScreen.jsx";
import { RegisterScreen } from "./Screens/RegisterScreen.jsx";
import { VerifyEmailScreen } from "./Screens/VerifyEmailScreen.jsx";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="page-shell">{children}</main>
    </ProtectedRoute>
  );
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/presupuestos" replace /> : children;
}

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/presupuestos" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<PublicOnly><LoginScreen /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly><RegisterScreen /></PublicOnly>} />
      <Route path="/verificar-email" element={<VerifyEmailScreen />} />
      <Route path="/clientes" element={<ProtectedLayout><ClientesScreen /></ProtectedLayout>} />
      <Route path="/presupuestos" element={<ProtectedLayout><PresupuestosScreen /></ProtectedLayout>} />
      <Route path="/presupuestos/nuevo" element={<ProtectedLayout><NuevoPresupuestoScreen /></ProtectedLayout>} />
      <Route path="/presupuestos/:id" element={<ProtectedLayout><PresupuestoDetalleScreen /></ProtectedLayout>} />
      <Route path="/presupuestos/:id/editar" element={<ProtectedLayout><PresupuestoEditarScreen /></ProtectedLayout>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
