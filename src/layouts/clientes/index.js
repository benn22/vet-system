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
import TablePagination from "@mui/material/TablePagination";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

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

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    num_doc: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  // Cargar clientes al inicio
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("fecha_registro", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      alert("Error al cargar clientes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setEditMode(true);
      setSelectedCliente(cliente);
      setFormData({
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        num_doc: cliente.num_doc,
        telefono: cliente.telefono || "",
        email: cliente.email || "",
        direccion: cliente.direccion || "",
      });
    } else {
      setEditMode(false);
      setSelectedCliente(null);
      setFormData({
        nombres: "",
        apellidos: "",
        num_doc: "",
        telefono: "",
        email: "",
        direccion: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedCliente(null);
    setFormData({
      nombres: "",
      apellidos: "",
      num_doc: "",
      telefono: "",
      email: "",
      direccion: "",
    });
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
      if (editMode) {
        // Actualizar cliente
        const { error } = await supabase
          .from("clientes")
          .update(formData)
          .eq("cliente_id", selectedCliente.cliente_id);

        if (error) throw error;
        alert("Cliente actualizado exitosamente");
      } else {
        // Crear nuevo cliente
        const { error } = await supabase.from("clientes").insert([formData]);

        if (error) throw error;
        alert("Cliente registrado exitosamente");
      }

      handleCloseDialog();
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar cliente: " + error.message);
    }
  };

  const handleDelete = async (clienteId) => {
    if (!window.confirm("¿Está seguro de eliminar este cliente?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("cliente_id", clienteId);

      if (error) throw error;
      alert("Cliente eliminado exitosamente");
      cargarClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Error al eliminar cliente: " + error.message);
    }
  };

  // Función para filtrar clientes
  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    const nombres = cliente.nombres?.toLowerCase() || "";
    const apellidos = cliente.apellidos?.toLowerCase() || "";
    const numDoc = cliente.num_doc?.toLowerCase() || "";
    const telefono = cliente.telefono?.toLowerCase() || "";
    const email = cliente.email?.toLowerCase() || "";

    return (
      nombres.includes(searchLower) ||
      apellidos.includes(searchLower) ||
      numDoc.includes(searchLower) ||
      telefono.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  // Función para obtener clientes paginados
  const paginatedClientes = filteredClientes.slice(
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
    setPage(0);
  };

  // Configurar columnas y filas para la tabla
  const columns = [
    { Header: "Nombres", accessor: "nombres", width: "20%" },
    { Header: "Apellidos", accessor: "apellidos", width: "20%" },
    { Header: "DNI", accessor: "num_doc", width: "15%" },
    { Header: "Teléfono", accessor: "telefono", width: "15%" },
    { Header: "Email", accessor: "email", width: "20%" },
    { Header: "Acciones", accessor: "acciones", width: "10%" },
  ];

  const rows = paginatedClientes.map((cliente) => ({
    nombres: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cliente.nombres}
      </MDTypography>
    ),
    apellidos: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cliente.apellidos}
      </MDTypography>
    ),
    num_doc: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cliente.num_doc}
      </MDTypography>
    ),
    telefono: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cliente.telefono || "-"}
      </MDTypography>
    ),
    email: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {cliente.email || "-"}
      </MDTypography>
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleOpenDialog(cliente)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(cliente.cliente_id)}
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
                    Gestión de Clientes
                  </MDTypography>
                  <MDButton
                    variant="contained"
                    color="white"
                    onClick={() => handleOpenDialog()}
                  >
                    <Icon>add</Icon>&nbsp; Nuevo Cliente
                  </MDButton>
                </MDBox>

                {/* Campo de búsqueda */}
                <MDBox>
                  <TextField
                    placeholder="Buscar por nombre, apellido, DNI, teléfono o email..."
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
                      Cargando clientes...
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
                      filteredClientes.length
                    )}{" "}
                    de {filteredClientes.length} clientes
                    {searchTerm && ` (filtrados de ${clientes.length} totales)`}
                  </MDTypography>
                  <TablePagination
                    component="div"
                    count={filteredClientes.length}
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
            {editMode ? "Editar Cliente" : "Nuevo Cliente"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="DNI"
                  name="num_doc"
                  value={formData.num_doc}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, num_doc: value });
                    }
                  }}
                  fullWidth
                  required
                  disabled={editMode}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="text"
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 9) {
                      setFormData({ ...formData, telefono: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={1}
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

export default Clientes;
