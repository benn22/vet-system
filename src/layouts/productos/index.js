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

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    estado: "activo",
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      alert("Error al cargar productos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (producto = null) => {
    if (producto) {
      setEditMode(true);
      setSelectedProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: producto.precio,
        stock: producto.stock,
        estado: producto.estado,
      });
    } else {
      setEditMode(false);
      setSelectedProducto(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        estado: "activo",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedProducto(null);
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
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
      };

      if (editMode) {
        const { error } = await supabase
          .from("productos")
          .update(dataToSave)
          .eq("producto_id", selectedProducto.producto_id);

        if (error) throw error;
        alert("Producto actualizado exitosamente");
      } else {
        const { error } = await supabase.from("productos").insert([dataToSave]);

        if (error) throw error;
        alert("Producto registrado exitosamente");
      }

      handleCloseDialog();
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar producto: " + error.message);
    }
  };

  const handleDelete = async (productoId) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("producto_id", productoId);

      if (error) throw error;
      alert("Producto eliminado exitosamente");
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto: " + error.message);
    }
  };

  const getEstadoColor = (estado) => {
    return estado === "activo" ? "success" : "error";
  };

  const getStockColor = (stock) => {
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };

  const columns = [
    { Header: "Nombre", accessor: "nombre", width: "25%" },
    { Header: "Descripción", accessor: "descripcion", width: "30%" },
    { Header: "Precio", accessor: "precio", width: "12%" },
    { Header: "Stock", accessor: "stock", width: "12%" },
    { Header: "Estado", accessor: "estado", width: "10%" },
    { Header: "Acciones", accessor: "acciones", width: "11%" },
  ];

  const rows = productos.map((producto) => ({
    nombre: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {producto.nombre}
      </MDTypography>
    ),
    descripcion: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {producto.descripcion || "-"}
      </MDTypography>
    ),
    precio: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        S/ {parseFloat(producto.precio).toFixed(2)}
      </MDTypography>
    ),
    stock: (
      <Chip
        label={producto.stock}
        color={getStockColor(producto.stock)}
        size="small"
        sx={{ minWidth: "60px" }}
      />
    ),
    estado: (
      <Chip
        label={producto.estado}
        color={getEstadoColor(producto.estado)}
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
          onClick={() => handleOpenDialog(producto)}
        >
          <Icon>edit</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(producto.producto_id)}
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
                  Gestión de Productos
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="white"
                  onClick={() => handleOpenDialog()}
                >
                  <Icon>add</Icon>&nbsp; Nuevo Producto
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando productos...
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
            {editMode ? "Editar Producto" : "Nuevo Producto"}
          </MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Nombre del Producto"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MDInput
                  type="text"
                  label="Precio (S/)"
                  name="precio"
                  value={formData.precio}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    if (value === "" || parseFloat(value) <= 10000) {
                      setFormData({ ...formData, precio: value });
                    }
                  }}
                  fullWidth
                  required
                  inputProps={{ maxLength: 8 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MDInput
                  type="text"
                  label="Stock"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "" || parseInt(value) <= 9999) {
                      setFormData({ ...formData, stock: value });
                    }
                  }}
                  fullWidth
                  required
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
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

export default Productos;
