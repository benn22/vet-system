import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Buscar usuario por username
      const { data: usuarios, error: userError } = await supabase
        .from("usuarios")
        .select(
          `
          usuario_id,
          nombre,
          apellido,
          username,
          password,
          estado,
          usuario_rol (
            roles (
              rol_id,
              nombre_rol
            )
          )
        `
        )
        .eq("username", username)
        .eq("estado", "activo")
        .single();

      if (userError || !usuarios) {
        setError("Usuario no encontrado o inactivo");
        setLoading(false);
        return;
      }

      // Verificar contraseña
      if (usuarios.password !== password) {
        setError("Contraseña incorrecta");
        setLoading(false);
        return;
      }

      // Guardar datos del usuario en localStorage
      const userData = {
        usuario_id: usuarios.usuario_id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        username: usuarios.username,
        rol: usuarios.usuario_rol[0]?.roles?.nombre_rol || "Sin rol",
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sistema Veterinaria
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingresa tus credenciales para continuar
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleLogin}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Usuario"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Recordarme
              </MDTypography>
            </MDBox>

            {error && (
              <MDBox mb={2} mt={2}>
                <MDTypography
                  variant="caption"
                  color="error"
                  fontWeight="medium"
                >
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Usuario de prueba: <strong>admin</strong> / Contraseña:{" "}
                <strong>admin123</strong>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
