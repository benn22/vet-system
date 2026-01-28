import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
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

function Mantenedores() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados para Especies
  const [especies, setEspecies] = useState([]);
  const [especieDialogOpen, setEspecieDialogOpen] = useState(false);
  const [especieEditMode, setEspecieEditMode] = useState(false);
  const [selectedEspecie, setSelectedEspecie] = useState(null);
  const [especieFormData, setEspecieFormData] = useState({
    nombre: "",
    estado: "activo",
  });

  // Estados para Razas
  const [razas, setRazas] = useState([]);
  const [razaDialogOpen, setRazaDialogOpen] = useState(false);
  const [razaEditMode, setRazaEditMode] = useState(false);
  const [selectedRaza, setSelectedRaza] = useState(null);
  const [razaFormData, setRazaFormData] = useState({
    nombre: "",
    especie_id: "",
    estado: "activo",
  });

  // Estados para Colores
  const [colores, setColores] = useState([]);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [colorEditMode, setColorEditMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorFormData, setColorFormData] = useState({
    nombre: "",
    estado: "activo",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar especies
      const { data: especiesData, error: especiesError } = await supabase
        .from("especies")
        .select("*")
        .order("nombre", { ascending: true });
      if (especiesError) throw especiesError;
      setEspecies(especiesData || []);

      // Cargar razas con especies
      const { data: razasData, error: razasError } = await supabase
        .from("razas")
        .select("*, especies(nombre)")
        .order("nombre", { ascending: true });
      if (razasError) throw razasError;
      setRazas(razasData || []);

      // Cargar colores
      const { data: coloresData, error: coloresError } = await supabase
        .from("colores")
        .select("*")
        .order("nombre", { ascending: true });
      if (coloresError) throw coloresError;
      setColores(coloresData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ==================== ESPECIES ====================

  const handleOpenEspecieDialog = (especie = null) => {
    if (especie) {
      setEspecieEditMode(true);
      setSelectedEspecie(especie);
      setEspecieFormData({ nombre: especie.nombre, estado: especie.estado });
    } else {
      setEspecieEditMode(false);
      setSelectedEspecie(null);
      setEspecieFormData({ nombre: "", estado: "activo" });
    }
    setEspecieDialogOpen(true);
  };

  const handleCloseEspecieDialog = () => {
    setEspecieDialogOpen(false);
    setEspecieEditMode(false);
    setSelectedEspecie(null);
  };

  const handleSubmitEspecie = async (e) => {
    e.preventDefault();
    try {
      if (especieEditMode) {
        const { error } = await supabase
          .from("especies")
          .update(especieFormData)
          .eq("especie_id", selectedEspecie.especie_id);
        if (error) throw error;
        alert("Especie actualizada exitosamente");
      } else {
        const { error } = await supabase
          .from("especies")
          .insert([especieFormData]);
        if (error) throw error;
        alert("Especie registrada exitosamente");
      }
      handleCloseEspecieDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar especie:", error);
      alert("Error al guardar especie: " + error.message);
    }
  };

  const handleDeleteEspecie = async (especieId) => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar esta especie? Se eliminarán también sus razas asociadas."
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase
        .from("especies")
        .delete()
        .eq("especie_id", especieId);
      if (error) throw error;
      alert("Especie eliminada exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar especie:", error);
      alert("Error al eliminar especie: " + error.message);
    }
  };

  // ==================== RAZAS ====================

  const handleOpenRazaDialog = (raza = null) => {
    if (raza) {
      setRazaEditMode(true);
      setSelectedRaza(raza);
      setRazaFormData({
        nombre: raza.nombre,
        especie_id: raza.especie_id,
        estado: raza.estado,
      });
    } else {
      setRazaEditMode(false);
      setSelectedRaza(null);
      setRazaFormData({ nombre: "", especie_id: "", estado: "activo" });
    }
    setRazaDialogOpen(true);
  };

  const handleCloseRazaDialog = () => {
    setRazaDialogOpen(false);
    setRazaEditMode(false);
    setSelectedRaza(null);
  };

  const handleSubmitRaza = async (e) => {
    e.preventDefault();
    try {
      if (razaEditMode) {
        const { error } = await supabase
          .from("razas")
          .update(razaFormData)
          .eq("raza_id", selectedRaza.raza_id);
        if (error) throw error;
        alert("Raza actualizada exitosamente");
      } else {
        const { error } = await supabase.from("razas").insert([razaFormData]);
        if (error) throw error;
        alert("Raza registrada exitosamente");
      }
      handleCloseRazaDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar raza:", error);
      alert("Error al guardar raza: " + error.message);
    }
  };

  const handleDeleteRaza = async (razaId) => {
    if (!window.confirm("¿Está seguro de eliminar esta raza?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from("razas")
        .delete()
        .eq("raza_id", razaId);
      if (error) throw error;
      alert("Raza eliminada exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar raza:", error);
      alert("Error al eliminar raza: " + error.message);
    }
  };

  // ==================== COLORES ====================

  const handleOpenColorDialog = (color = null) => {
    if (color) {
      setColorEditMode(true);
      setSelectedColor(color);
      setColorFormData({ nombre: color.nombre, estado: color.estado });
    } else {
      setColorEditMode(false);
      setSelectedColor(null);
      setColorFormData({ nombre: "", estado: "activo" });
    }
    setColorDialogOpen(true);
  };

  const handleCloseColorDialog = () => {
    setColorDialogOpen(false);
    setColorEditMode(false);
    setSelectedColor(null);
  };

  const handleSubmitColor = async (e) => {
    e.preventDefault();
    try {
      if (colorEditMode) {
        const { error } = await supabase
          .from("colores")
          .update(colorFormData)
          .eq("color_id", selectedColor.color_id);
        if (error) throw error;
        alert("Color actualizado exitosamente");
      } else {
        const { error } = await supabase
          .from("colores")
          .insert([colorFormData]);
        if (error) throw error;
        alert("Color registrado exitosamente");
      }
      handleCloseColorDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar color:", error);
      alert("Error al guardar color: " + error.message);
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (!window.confirm("¿Está seguro de eliminar este color?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from("colores")
        .delete()
        .eq("color_id", colorId);
      if (error) throw error;
      alert("Color eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar color:", error);
      alert("Error al eliminar color: " + error.message);
    }
  };

  // ==================== TABLAS ====================

  const getEstadoColor = (estado) =>
    estado === "activo" ? "success" : "error";

  // Columnas y filas para Especies
  const especiesColumns = [
    { Header: "Nombre", accessor: "nombre", width: "60%" },
    { Header: "Estado", accessor: "estado", width: "20%" },
    { Header: "Acciones", accessor: "acciones", width: "20%" },
  ];

  const especiesRows = especies.map((especie) => ({
    nombre: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {especie.nombre}
      </MDTypography>
    ),
    estado: (
      <Chip
        label={especie.estado}
        color={getEstadoColor(especie.estado)}
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
          onClick={() => handleOpenEspecieDialog(especie)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDeleteEspecie(especie.especie_id)}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  // Columnas y filas para Razas
  const razasColumns = [
    { Header: "Nombre", accessor: "nombre", width: "40%" },
    { Header: "Especie", accessor: "especie", width: "30%" },
    { Header: "Estado", accessor: "estado", width: "15%" },
    { Header: "Acciones", accessor: "acciones", width: "15%" },
  ];

  const razasRows = razas.map((raza) => ({
    nombre: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {raza.nombre}
      </MDTypography>
    ),
    especie: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {raza.especies?.nombre || "-"}
      </MDTypography>
    ),
    estado: (
      <Chip
        label={raza.estado}
        color={getEstadoColor(raza.estado)}
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
          onClick={() => handleOpenRazaDialog(raza)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDeleteRaza(raza.raza_id)}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  // Columnas y filas para Colores
  const coloresColumns = [
    { Header: "Nombre", accessor: "nombre", width: "60%" },
    { Header: "Estado", accessor: "estado", width: "20%" },
    { Header: "Acciones", accessor: "acciones", width: "20%" },
  ];

  const coloresRows = colores.map((color) => ({
    nombre: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {color.nombre}
      </MDTypography>
    ),
    estado: (
      <Chip
        label={color.estado}
        color={getEstadoColor(color.estado)}
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
          onClick={() => handleOpenColorDialog(color)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDeleteColor(color.color_id)}
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
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
              >
                <MDTypography variant="h6" color="white">
                  Mantenedores de Mascotas
                </MDTypography>
              </MDBox>

              <MDBox pt={3}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{ px: 2 }}
                >
                  <Tab label="Especies" />
                  <Tab label="Razas" />
                  <Tab label="Colores" />
                </Tabs>

                {/* Tab de Especies */}
                {tabValue === 0 && (
                  <MDBox p={3}>
                    <MDBox mb={2} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleOpenEspecieDialog()}
                      >
                        <Icon>add</Icon>&nbsp; Nueva Especie
                      </MDButton>
                    </MDBox>
                    {loading ? (
                      <MDTypography
                        variant="h6"
                        color="text"
                        textAlign="center"
                      >
                        Cargando...
                      </MDTypography>
                    ) : (
                      <DataTable
                        table={{ columns: especiesColumns, rows: especiesRows }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    )}
                  </MDBox>
                )}

                {/* Tab de Razas */}
                {tabValue === 1 && (
                  <MDBox p={3}>
                    <MDBox mb={2} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleOpenRazaDialog()}
                      >
                        <Icon>add</Icon>&nbsp; Nueva Raza
                      </MDButton>
                    </MDBox>
                    {loading ? (
                      <MDTypography
                        variant="h6"
                        color="text"
                        textAlign="center"
                      >
                        Cargando...
                      </MDTypography>
                    ) : (
                      <DataTable
                        table={{ columns: razasColumns, rows: razasRows }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    )}
                  </MDBox>
                )}

                {/* Tab de Colores */}
                {tabValue === 2 && (
                  <MDBox p={3}>
                    <MDBox mb={2} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleOpenColorDialog()}
                      >
                        <Icon>add</Icon>&nbsp; Nuevo Color
                      </MDButton>
                    </MDBox>
                    {loading ? (
                      <MDTypography
                        variant="h6"
                        color="text"
                        textAlign="center"
                      >
                        Cargando...
                      </MDTypography>
                    ) : (
                      <DataTable
                        table={{ columns: coloresColumns, rows: coloresRows }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    )}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog para Especie */}
      <Dialog
        open={especieDialogOpen}
        onClose={handleCloseEspecieDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">
            {especieEditMode ? "Editar Especie" : "Nueva Especie"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmitEspecie}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Nombre de la Especie"
                  value={especieFormData.nombre}
                  onChange={(e) =>
                    setEspecieFormData({
                      ...especieFormData,
                      nombre: e.target.value,
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="especie-estado-label" sx={{ top: "-7px" }}>
                    Estado
                  </InputLabel>
                  <Select
                    labelId="especie-estado-label"
                    value={especieFormData.estado}
                    onChange={(e) =>
                      setEspecieFormData({
                        ...especieFormData,
                        estado: e.target.value,
                      })
                    }
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseEspecieDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton type="submit" variant="gradient" color="info">
              {especieEditMode ? "Actualizar" : "Guardar"}
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Raza */}
      <Dialog
        open={razaDialogOpen}
        onClose={handleCloseRazaDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">
            {razaEditMode ? "Editar Raza" : "Nueva Raza"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmitRaza}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Nombre de la Raza"
                  value={razaFormData.nombre}
                  onChange={(e) =>
                    setRazaFormData({ ...razaFormData, nombre: e.target.value })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="raza-especie-label" sx={{ top: "-7px" }}>
                    Especie
                  </InputLabel>
                  <Select
                    labelId="raza-especie-label"
                    value={razaFormData.especie_id}
                    onChange={(e) =>
                      setRazaFormData({
                        ...razaFormData,
                        especie_id: e.target.value,
                      })
                    }
                    label="Especie"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione una especie</MenuItem>
                    {especies
                      .filter((e) => e.estado === "activo")
                      .map((especie) => (
                        <MenuItem
                          key={especie.especie_id}
                          value={especie.especie_id}
                        >
                          {especie.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="raza-estado-label" sx={{ top: "-7px" }}>
                    Estado
                  </InputLabel>
                  <Select
                    labelId="raza-estado-label"
                    value={razaFormData.estado}
                    onChange={(e) =>
                      setRazaFormData({
                        ...razaFormData,
                        estado: e.target.value,
                      })
                    }
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseRazaDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton type="submit" variant="gradient" color="info">
              {razaEditMode ? "Actualizar" : "Guardar"}
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Color */}
      <Dialog
        open={colorDialogOpen}
        onClose={handleCloseColorDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">
            {colorEditMode ? "Editar Color" : "Nuevo Color"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmitColor}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Nombre del Color"
                  value={colorFormData.nombre}
                  onChange={(e) =>
                    setColorFormData({
                      ...colorFormData,
                      nombre: e.target.value,
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="color-estado-label" sx={{ top: "-7px" }}>
                    Estado
                  </InputLabel>
                  <Select
                    labelId="color-estado-label"
                    value={colorFormData.estado}
                    onChange={(e) =>
                      setColorFormData({
                        ...colorFormData,
                        estado: e.target.value,
                      })
                    }
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseColorDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton type="submit" variant="gradient" color="info">
              {colorEditMode ? "Actualizar" : "Guardar"}
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Mantenedores;
