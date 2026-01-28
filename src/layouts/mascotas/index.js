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
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
//Importaciones nuevas para el autocompletado en el campo del dueño
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
//Importaciones para la paginacion
import TablePagination from "@mui/material/TablePagination";
import InputAdornment from "@mui/material/InputAdornment";

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

function Mascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  // Estado para los datos del formulario
  const [selectedCliente, setSelectedCliente] = useState(null);
  //Estado para la paginacion
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    sexo: "",
    edad_meses: "",
    color: "",
    cliente_id: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para convertir meses a formato legible
  const formatearEdad = (meses) => {
    if (!meses) return "-";
    if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    const años = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) return `${años} ${años === 1 ? "año" : "años"}`;
    return `${años} ${años === 1 ? "año" : "años"} y ${mesesRestantes} ${
      mesesRestantes === 1 ? "mes" : "meses"
    }`;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const { data: mascotasData, error: mascotasError } = await supabase
        .from("mascotas")
        .select(
          `
          *,
          clientes (
            cliente_id,
            nombres,
            apellidos,
            num_doc
          )
        `
        )
        .order("fecha_registro", { ascending: false });

      if (mascotasError) throw mascotasError;
      setMascotas(mascotasData || []);

      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("cliente_id, nombres, apellidos, num_doc")
        .order("nombres", { ascending: true });

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mascota = null) => {
    if (mascota) {
      setEditMode(true);
      setSelectedMascota(mascota);
      setFormData({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza || "",
        sexo: mascota.sexo || "",
        edad_meses: mascota.edad_meses || "",
        color: mascota.color || "",
        cliente_id: mascota.cliente_id,
      });
      //Buscar y establecer el cliente seleccionado
      const clienteActual = clientes.find(
        (c) => c.cliente_id === mascota.cliente_id
      );
      setSelectedCliente(clienteActual || null);
    } else {
      setEditMode(false);
      setSelectedMascota(null);
      setFormData({
        nombre: "",
        especie: "",
        raza: "",
        sexo: "",
        edad_meses: "",
        color: "",
        cliente_id: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedMascota(null);
    setSelectedCliente(null);
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
      const dataToSave = {
        ...formData,
        edad_meses: formData.edad_meses ? parseInt(formData.edad_meses) : null,
      };

      if (editMode) {
        const { error } = await supabase
          .from("mascotas")
          .update(dataToSave)
          .eq("mascota_id", selectedMascota.mascota_id);

        if (error) throw error;
        alert("Mascota actualizada exitosamente");
      } else {
        const { error } = await supabase.from("mascotas").insert([dataToSave]);

        if (error) throw error;
        alert("Mascota registrada exitosamente");
      }

      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar mascota:", error);
      alert("Error al guardar mascota: " + error.message);
    }
  };

  const handleDelete = async (mascotaId) => {
    if (!window.confirm("¿Está seguro de eliminar esta mascota?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("mascotas")
        .delete()
        .eq("mascota_id", mascotaId);

      if (error) throw error;
      alert("Mascota eliminada exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      alert("Error al eliminar mascota: " + error.message);
    }
  };

  // Función para filtrar mascotas
  const filteredMascotas = mascotas.filter((mascota) => {
    const searchLower = searchTerm.toLowerCase();
    const nombreMascota = mascota.nombre?.toLowerCase() || "";
    const nombreDueno = mascota.clientes
      ? `${mascota.clientes.nombres} ${mascota.clientes.apellidos}`.toLowerCase()
      : "";
    const especie = mascota.especie?.toLowerCase() || "";
    const raza = mascota.raza?.toLowerCase() || "";

    return (
      nombreMascota.includes(searchLower) ||
      nombreDueno.includes(searchLower) ||
      especie.includes(searchLower) ||
      raza.includes(searchLower)
    );
  });

  // Función para obtener mascotas paginadas
  const paginatedMascotas = filteredMascotas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers para paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler para búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Volver a la primera página al buscar
  };

  const columns = [
    { Header: "Nombre", accessor: "nombre", width: "15%" },
    { Header: "Especie", accessor: "especie", width: "10%" },
    { Header: "Raza", accessor: "raza", width: "15%" },
    { Header: "Sexo", accessor: "sexo", width: "10%" },
    { Header: "Edad", accessor: "edad", width: "15%" },
    { Header: "Dueño", accessor: "dueno", width: "20%" },
    { Header: "Acciones", accessor: "acciones", width: "12%" },
  ];

  const rows = paginatedMascotas.map((mascota) => ({
    nombre: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {mascota.nombre}
      </MDTypography>
    ),
    especie: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {mascota.especie}
      </MDTypography>
    ),
    raza: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {mascota.raza || "-"}
      </MDTypography>
    ),
    sexo: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {mascota.sexo || "-"}
      </MDTypography>
    ),
    edad: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatearEdad(mascota.edad_meses)}
      </MDTypography>
    ),
    dueno: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {mascota.clientes
          ? `${mascota.clientes.nombres} ${mascota.clientes.apellidos}`
          : "Sin dueño"}
      </MDTypography>
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleOpenDialog(mascota)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(mascota.mascota_id)}
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
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <MDTypography variant="h6" color="white">
                    Gestión de Mascotas
                  </MDTypography>
                  <MDButton
                    variant="contained"
                    color="white"
                    onClick={() => handleOpenDialog()}
                  >
                    <Icon>add</Icon>&nbsp; Nueva Mascota
                  </MDButton>
                </MDBox>

                {/* Campo de búsqueda */}
                <MDBox>
                  <TextField
                    placeholder="Buscar por nombre de mascota, dueño, especie o raza..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon sx={{ color: "white" }}>search</Icon>
                        </InputAdornment>
                      ),
                      sx: {
                        /* backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white", */
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        color: "black",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white",
                        },
                        "& input": {
                          color: "white",
                        },
                        "& input::placeholder": {
                          /* color: "rgba(255, 255, 255, 0.7)", */
                          color: "rgba(0, 0, 0, 0.6)",
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando mascotas...
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
                {/* Paginación */}
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={3}
                >
                  <MDTypography variant="caption" color="text">
                    Mostrando {page * rowsPerPage + 1} a{" "}
                    {Math.min(
                      (page + 1) * rowsPerPage,
                      filteredMascotas.length
                    )}{" "}
                    de {filteredMascotas.length} mascotas
                    {searchTerm && ` (filtradas de ${mascotas.length} totales)`}
                  </MDTypography>
                  <TablePagination
                    component="div"
                    count={filteredMascotas.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${
                        count !== -1 ? count : `más de ${to}`
                      }`
                    }
                    sx={{
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                        {
                          margin: 0,
                        },
                    }}
                  />
                </MDBox>
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
            {editMode ? "Editar Mascota" : "Nueva Mascota"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nombre de la Mascota"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Autocomplete
                  options={clientes}
                  value={selectedCliente}
                  onChange={(event, newValue) => {
                    setSelectedCliente(newValue);
                    setFormData({
                      ...formData,
                      cliente_id: newValue ? newValue.cliente_id : "",
                    });
                  }}
                  getOptionLabel={(option) =>
                    `${option.nombres} ${option.apellidos} - DNI: ${option.num_doc}`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.cliente_id === value.cliente_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar Dueño"
                      placeholder="Escriba nombre o DNI..."
                      required={!selectedCliente}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "45px",
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.cliente_id}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {option.nombres} {option.apellidos}
                        </div>
                        <div style={{ fontSize: "0.85em", color: "#666" }}>
                          DNI: {option.num_doc}{" "}
                          {option.telefono && `• Tel: ${option.telefono}`}
                        </div>
                      </div>
                    </li>
                  )}
                  noOptionsText="No se encontraron clientes"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="especie-label" sx={{ top: "-7px" }}>
                    Especie
                  </InputLabel>
                  <Select
                    labelId="especie-label"
                    name="especie"
                    value={formData.especie}
                    onChange={handleInputChange}
                    label="Especie"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione especie</MenuItem>
                    <MenuItem value="Perro">Perro</MenuItem>
                    <MenuItem value="Gato">Gato</MenuItem>
                    <MenuItem value="Ave">Ave</MenuItem>
                    <MenuItem value="Conejo">Conejo</MenuItem>
                    <MenuItem value="Hamster">Hamster</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Raza"
                  name="raza"
                  value={formData.raza}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="sexo-label" sx={{ top: "-7px" }}>
                    Sexo
                  </InputLabel>
                  <Select
                    labelId="sexo-label"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    label="Sexo"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione sexo</MenuItem>
                    <MenuItem value="Macho">Macho</MenuItem>
                    <MenuItem value="Hembra">Hembra</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDInput
                  type="text"
                  label="Edad (meses)"
                  name="edad_meses"
                  value={formData.edad_meses}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "" || parseInt(value) <= 360) {
                      setFormData({ ...formData, edad_meses: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 3 }}
                  helperText={
                    formData.edad_meses
                      ? `Equivalente: ${formatearEdad(
                          parseInt(formData.edad_meses)
                        )}`
                      : "Ingrese edad en meses"
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="color-label" sx={{ top: "-7px" }}>
                    Color
                  </InputLabel>
                  <Select
                    labelId="color-label"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    label="Color"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione color</MenuItem>
                    <MenuItem value="Negro">Negro</MenuItem>
                    <MenuItem value="Blanco">Blanco</MenuItem>
                    <MenuItem value="Marrón">Marrón</MenuItem>
                    <MenuItem value="Dorado">Dorado</MenuItem>
                    <MenuItem value="Gris">Gris</MenuItem>
                    <MenuItem value="Naranja">Naranja</MenuItem>
                    <MenuItem value="Crema">Crema</MenuItem>
                    <MenuItem value="Atigrado">Atigrado</MenuItem>
                    <MenuItem value="Manchado">Manchado</MenuItem>
                    <MenuItem value="Tricolor">Tricolor</MenuItem>
                    <MenuItem value="Bicolor">Bicolor</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
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

export default Mascotas;
