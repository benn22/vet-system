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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Divider from "@mui/material/Divider";

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

function Historial() {
  const [historial, setHistorial] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHistorial, setSelectedHistorial] = useState(null);
  const [formData, setFormData] = useState({
    fecha_visita: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    peso: "",
    temperatura: "",
    mascota_id: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar historial con información de mascota, cliente y veterinario
      const { data: historialData, error: historialError } = await supabase
        .from("historial")
        .select(
          `
          *,
          mascotas (
            mascota_id,
            nombre,
            especie,
            raza,
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
        .order("fecha_visita", { ascending: false });

      if (historialError) throw historialError;
      setHistorial(historialData || []);

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

  const handleOpenDialog = (registro = null) => {
    if (registro) {
      setEditMode(true);
      setSelectedHistorial(registro);
      setFormData({
        fecha_visita: registro.fecha_visita
          ? new Date(registro.fecha_visita).toISOString().slice(0, 16)
          : "",
        diagnostico: registro.diagnostico,
        tratamiento: registro.tratamiento || "",
        observaciones: registro.observaciones || "",
        peso: registro.peso || "",
        temperatura: registro.temperatura || "",
        mascota_id: registro.mascota_id,
      });
    } else {
      setEditMode(false);
      setSelectedHistorial(null);
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setFormData({
        fecha_visita: localDateTime,
        diagnostico: "",
        tratamiento: "",
        observaciones: "",
        peso: "",
        temperatura: "",
        mascota_id: "",
      });
    }
    setDialogOpen(true);
  };

  const handleOpenDetalle = (registro) => {
    setSelectedHistorial(registro);
    setDetalleDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedHistorial(null);
  };

  const handleCloseDetalleDialog = () => {
    setDetalleDialogOpen(false);
    setSelectedHistorial(null);
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
        peso: formData.peso ? parseFloat(formData.peso) : null,
        temperatura: formData.temperatura
          ? parseFloat(formData.temperatura)
          : null,
        usuario_id: userData.usuario_id,
      };

      if (editMode) {
        const { error } = await supabase
          .from("historial")
          .update(dataToSave)
          .eq("historial_id", selectedHistorial.historial_id);

        if (error) throw error;
        alert("Registro actualizado exitosamente");
      } else {
        const { error } = await supabase.from("historial").insert([dataToSave]);

        if (error) throw error;
        alert("Registro creado exitosamente");
      }

      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar registro:", error);
      alert("Error al guardar registro: " + error.message);
    }
  };

  const handleDelete = async (historialId) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("historial")
        .delete()
        .eq("historial_id", historialId);

      if (error) throw error;
      alert("Registro eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      alert("Error al eliminar registro: " + error.message);
    }
  };

  const formatearFechaHora = (fechaHora) => {
    const date = new Date(fechaHora);
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    { Header: "Fecha/Hora", accessor: "fecha", width: "15%" },
    { Header: "Mascota", accessor: "mascota", width: "15%" },
    { Header: "Dueño", accessor: "dueno", width: "20%" },
    { Header: "Diagnóstico", accessor: "diagnostico", width: "30%" },
    { Header: "Veterinario", accessor: "veterinario", width: "15%" },
    { Header: "Acciones", accessor: "acciones", width: "15%" },
  ];

  const rows = historial.map((registro) => ({
    fecha: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatearFechaHora(registro.fecha_visita)}
      </MDTypography>
    ),
    mascota: (
      <MDBox>
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          display="block"
        >
          {registro.mascotas ? registro.mascotas.nombre : "-"}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {registro.mascotas ? registro.mascotas.especie : ""}
        </MDTypography>
      </MDBox>
    ),
    dueno: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {registro.mascotas?.clientes
          ? `${registro.mascotas.clientes.nombres} ${registro.mascotas.clientes.apellidos}`
          : "-"}
      </MDTypography>
    ),
    diagnostico: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {registro.diagnostico.length > 50
          ? registro.diagnostico.substring(0, 50) + "..."
          : registro.diagnostico}
      </MDTypography>
    ),
    veterinario: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {registro.usuarios
          ? `${registro.usuarios.nombre} ${registro.usuarios.apellido}`
          : "-"}
      </MDTypography>
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="text"
          color="success"
          size="small"
          onClick={() => handleOpenDetalle(registro)}
        >
          <Icon>visibility</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleOpenDialog(registro)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(registro.historial_id)}
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
                  Historial Médico
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="white"
                  onClick={() => handleOpenDialog()}
                >
                  <Icon>add</Icon>&nbsp; Nueva Consulta
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando historial...
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

      {/* Dialog para Nueva/Editar Consulta */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">
            {editMode ? "Editar Consulta" : "Nueva Consulta"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
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
                <MDInput
                  type="datetime-local"
                  label="Fecha y Hora de Visita"
                  name="fecha_visita"
                  value={formData.fecha_visita}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Peso (kg)"
                  name="peso"
                  value={formData.peso}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    if (value === "" || parseFloat(value) <= 200) {
                      setFormData({ ...formData, peso: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Temperatura (°C)"
                  name="temperatura"
                  value={formData.temperatura}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    if (value === "" || parseFloat(value) <= 50) {
                      setFormData({ ...formData, temperatura: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Diagnóstico"
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Tratamiento"
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
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

      {/* Dialog para Ver Detalle */}
      <Dialog
        open={detalleDialogOpen}
        onClose={handleCloseDetalleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">Detalle de Consulta</MDTypography>
        </DialogTitle>
        <DialogContent>
          {selectedHistorial && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDBox
                  p={2}
                  bgColor="grey-100"
                  borderRadius="lg"
                  display="flex"
                  justifyContent="space-between"
                >
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="medium">
                      {selectedHistorial.mascotas?.nombre || "-"}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {selectedHistorial.mascotas?.especie || ""} -{" "}
                      {selectedHistorial.mascotas?.raza || ""}
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="right">
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                    >
                      Dueño:{" "}
                      {selectedHistorial.mascotas?.clientes
                        ? `${selectedHistorial.mascotas.clientes.nombres} ${selectedHistorial.mascotas.clientes.apellidos}`
                        : "-"}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                    >
                      Fecha:{" "}
                      {formatearFechaHora(selectedHistorial.fecha_visita)}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox>
                  <MDTypography
                    variant="caption"
                    color="text"
                    fontWeight="bold"
                  >
                    Peso:
                  </MDTypography>
                  <MDTypography variant="body2">
                    {selectedHistorial.peso
                      ? `${selectedHistorial.peso} kg`
                      : "No registrado"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox>
                  <MDTypography
                    variant="caption"
                    color="text"
                    fontWeight="bold"
                  >
                    Temperatura:
                  </MDTypography>
                  <MDTypography variant="body2">
                    {selectedHistorial.temperatura
                      ? `${selectedHistorial.temperatura} °C`
                      : "No registrado"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <MDBox>
                  <MDTypography
                    variant="caption"
                    color="text"
                    fontWeight="bold"
                  >
                    Diagnóstico:
                  </MDTypography>
                  <MDTypography variant="body2" mt={1}>
                    {selectedHistorial.diagnostico}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <MDBox>
                  <MDTypography
                    variant="caption"
                    color="text"
                    fontWeight="bold"
                  >
                    Tratamiento:
                  </MDTypography>
                  <MDTypography variant="body2" mt={1}>
                    {selectedHistorial.tratamiento || "No registrado"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <MDBox>
                  <MDTypography
                    variant="caption"
                    color="text"
                    fontWeight="bold"
                  >
                    Observaciones:
                  </MDTypography>
                  <MDTypography variant="body2" mt={1}>
                    {selectedHistorial.observaciones || "Sin observaciones"}
                  </MDTypography>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="caption" color="text">
                  Atendido por:{" "}
                  {selectedHistorial.usuarios
                    ? `${selectedHistorial.usuarios.nombre} ${selectedHistorial.usuarios.apellido}`
                    : "No registrado"}
                </MDTypography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseDetalleDialog}
            variant="gradient"
            color="info"
          >
            Cerrar
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Historial;
