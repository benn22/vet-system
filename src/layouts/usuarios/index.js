import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    password: "",
    estado: "activo",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar usuarios con sus roles
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select(
          `
          *,
          usuario_rol (
            roles (
              rol_id,
              nombre_rol
            )
          )
        `
        )
        .order("nombre", { ascending: true });

      if (usuariosError) throw usuariosError;
      setUsuarios(usuariosData || []);

      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .order("nombre_rol", { ascending: true });

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditMode(true);
      setSelectedUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        username: usuario.username,
        password: "",
        estado: usuario.estado,
      });
      // Cargar roles seleccionados del usuario
      const rolesUsuario = usuario.usuario_rol.map((ur) => ur.roles.rol_id);
      setRolesSeleccionados(rolesUsuario);
    } else {
      setEditMode(false);
      setSelectedUsuario(null);
      setFormData({
        nombre: "",
        apellido: "",
        username: "",
        password: "",
        estado: "activo",
      });
      setRolesSeleccionados([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedUsuario(null);
    setRolesSeleccionados([]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRolChange = (rolId) => {
    setRolesSeleccionados((prev) => {
      if (prev.includes(rolId)) {
        return prev.filter((id) => id !== rolId);
      } else {
        return [...prev, rolId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rolesSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un rol");
      return;
    }

    try {
      let usuarioId;

      if (editMode) {
        // Actualizar usuario
        const updateData = { ...formData };
        if (!formData.password) {
          delete updateData.password; // No actualizar password si está vacío
        }

        const { error } = await supabase
          .from("usuarios")
          .update(updateData)
          .eq("usuario_id", selectedUsuario.usuario_id);

        if (error) throw error;
        usuarioId = selectedUsuario.usuario_id;

        // Eliminar roles anteriores
        const { error: deleteError } = await supabase
          .from("usuario_rol")
          .delete()
          .eq("usuario_id", usuarioId);

        if (deleteError) throw deleteError;
      } else {
        // Crear nuevo usuario
        const { data: nuevoUsuario, error } = await supabase
          .from("usuarios")
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        usuarioId = nuevoUsuario.usuario_id;
      }

      // Asignar nuevos roles
      const rolesAsignar = rolesSeleccionados.map((rolId) => ({
        usuario_id: usuarioId,
        rol_id: rolId,
      }));

      const { error: rolesError } = await supabase
        .from("usuario_rol")
        .insert(rolesAsignar);

      if (rolesError) throw rolesError;

      alert(
        editMode
          ? "Usuario actualizado exitosamente"
          : "Usuario registrado exitosamente"
      );
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Error al guardar usuario: " + error.message);
    }
  };

  const handleDelete = async (usuarioId) => {
    if (!window.confirm("¿Está seguro de eliminar este usuario?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("usuario_id", usuarioId);

      if (error) throw error;
      alert("Usuario eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error al eliminar usuario: " + error.message);
    }
  };

  const getEstadoColor = (estado) => {
    return estado === "activo" ? "success" : "error";
  };

  const getRolColor = (nombreRol) => {
    switch (nombreRol) {
      case "Administrador":
        return "error";
      case "Veterinario":
        return "info";
      case "Recepcionista":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
    { Header: "Nombre", accessor: "nombre", width: "20%" },
    { Header: "Username", accessor: "username", width: "15%" },
    { Header: "Roles", accessor: "roles", width: "25%" },
    { Header: "Estado", accessor: "estado", width: "12%" },
    { Header: "Acciones", accessor: "acciones", width: "15%" },
  ];

  const rows = usuarios.map((usuario) => ({
    nombre: (
      <MDBox>
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          display="block"
        >
          {usuario.nombre} {usuario.apellido}
        </MDTypography>
      </MDBox>
    ),
    username: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {usuario.username}
      </MDTypography>
    ),
    roles: (
      <MDBox display="flex" gap={0.5} flexWrap="wrap">
        {usuario.usuario_rol.map((ur, index) => (
          <Chip
            key={index}
            label={ur.roles.nombre_rol}
            color={getRolColor(ur.roles.nombre_rol)}
            size="small"
          />
        ))}
      </MDBox>
    ),
    estado: (
      <Chip
        label={usuario.estado}
        color={getEstadoColor(usuario.estado)}
        size="small"
        sx={{ textTransform: "capitalize" }}
      />
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleOpenDialog(usuario)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(usuario.usuario_id)}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Gestión de Usuarios
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="white"
                  onClick={() => handleOpenDialog()}
                >
                  <Icon>add</Icon>&nbsp; Nuevo Usuario
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando usuarios...
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">
            {editMode ? "Editar Usuario" : "Nuevo Usuario"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="password"
                  label={
                    editMode
                      ? "Nueva Contraseña (dejar vacío para no cambiar)"
                      : "Contraseña"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required={!editMode}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="estado-label" sx={{ top: "-7px" }}>
                    Estado
                  </InputLabel>
                  <Select
                    labelId="estado-label"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    label="Estado"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="h6" mb={2}>
                  Asignar Roles
                </MDTypography>
                <FormGroup>
                  {roles.map((rol) => (
                    <FormControlLabel
                      key={rol.rol_id}
                      control={
                        <Checkbox
                          checked={rolesSeleccionados.includes(rol.rol_id)}
                          onChange={() => handleRolChange(rol.rol_id)}
                        />
                      }
                      label={
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium">
                            {rol.nombre_rol}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                          >
                            {rol.descripcion}
                          </MDTypography>
                        </MDBox>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton type="submit" variant="gradient" color="info">
              {editMode ? "Actualizar" : "Guardar"}
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Usuarios;
