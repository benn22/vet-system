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

function Citas() {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    motivo: "",
    estado: "pendiente",
    mascota_id: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar citas con información de mascota y cliente
      const { data: citasData, error: citasError } = await supabase
        .from("citas")
        .select(
          `
          *,
          mascotas (
            mascota_id,
            nombre,
            especie,
            clientes (
              nombres,
              apellidos,
              telefono
            )
          ),
          usuarios (
            nombre,
            apellido
          )
        `
        )
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true });

      if (citasError) throw citasError;
      setCitas(citasData || []);

      // Cargar mascotas con sus dueños
      const { data: mascotasData, error: mascotasError } = await supabase
        .from("mascotas")
        .select(
          `
          mascota_id,
          nombre,
          especie,
          clientes (
            nombres,
            apellidos
          )
        `
        )
        .order("nombre", { ascending: true });

      if (mascotasError) throw mascotasError;
      setMascotas(mascotasData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cita = null) => {
    if (cita) {
      setEditMode(true);
      setSelectedCita(cita);
      setFormData({
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: cita.estado,
        mascota_id: cita.mascota_id,
      });
    } else {
      setEditMode(false);
      setSelectedCita(null);
      setFormData({
        fecha: "",
        hora: "",
        motivo: "",
        estado: "pendiente",
        mascota_id: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedCita(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Obtener usuario actual
      const userData = JSON.parse(localStorage.getItem("user"));

      const dataToSave = {
        ...formData,
        usuario_id: userData.usuario_id,
      };

      if (editMode) {
        const { error } = await supabase
          .from("citas")
          .update(dataToSave)
          .eq("cita_id", selectedCita.cita_id);

        if (error) throw error;
        alert("Cita actualizada exitosamente");
      } else {
        const { error } = await supabase.from("citas").insert([dataToSave]);

        if (error) throw error;
        alert("Cita registrada exitosamente");
      }

      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar cita:", error);
      alert("Error al guardar cita: " + error.message);
    }
  };

  const handleDelete = async (citaId) => {
    if (!window.confirm("¿Está seguro de eliminar esta cita?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("citas")
        .delete()
        .eq("cita_id", citaId);

      if (error) throw error;
      alert("Cita eliminada exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      alert("Error al eliminar cita: " + error.message);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "warning";
      case "atendida":
        return "success";
      case "cancelada":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    { Header: "Fecha", accessor: "fecha", width: "12%" },
    { Header: "Hora", accessor: "hora", width: "10%" },
    { Header: "Mascota", accessor: "mascota", width: "15%" },
    { Header: "Dueño", accessor: "dueno", width: "20%" },
    { Header: "Motivo", accessor: "motivo", width: "25%" },
    { Header: "Estado", accessor: "estado", width: "10%" },
    { Header: "Acciones", accessor: "acciones", width: "8%" },
  ];

  const rows = citas.map((cita) => ({
    fecha: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatearFecha(cita.fecha)}
      </MDTypography>
    ),
    hora: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cita.hora}
      </MDTypography>
    ),
    mascota: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cita.mascotas
          ? `${cita.mascotas.nombre} (${cita.mascotas.especie})`
          : "-"}
      </MDTypography>
    ),
    dueno: (
      <MDBox>
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          display="block"
        >
          {cita.mascotas?.clientes
            ? `${cita.mascotas.clientes.nombres} ${cita.mascotas.clientes.apellidos}`
            : "-"}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {cita.mascotas?.clientes?.telefono || ""}
        </MDTypography>
      </MDBox>
    ),
    motivo: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cita.motivo}
      </MDTypography>
    ),
    estado: (
      <Chip
        label={cita.estado}
        color={getEstadoColor(cita.estado)}
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
          onClick={() => handleOpenDialog(cita)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(cita.cita_id)}
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
                  Gestión de Citas
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="white"
                  onClick={() => handleOpenDialog()}
                >
                  <Icon>add</Icon>&nbsp; Nueva Cita
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando citas...
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
            {editMode ? "Editar Cita" : "Nueva Cita"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="date"
                  label="Fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="time"
                  label="Hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="mascota-label" sx={{ top: "-7px" }}>
                    Mascota
                  </InputLabel>
                  <Select
                    labelId="mascota-label"
                    name="mascota_id"
                    value={formData.mascota_id}
                    onChange={handleInputChange}
                    label="Mascota"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione una mascota</MenuItem>
                    {mascotas.map((mascota) => (
                      <MenuItem
                        key={mascota.mascota_id}
                        value={mascota.mascota_id}
                      >
                        {mascota.nombre} ({mascota.especie}) - Dueño:{" "}
                        {mascota.clientes
                          ? `${mascota.clientes.nombres} ${mascota.clientes.apellidos}`
                          : "Sin dueño"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="atendida">Atendida</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Motivo de la Cita"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                />
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

export default Citas;
