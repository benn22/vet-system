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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
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

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    producto_id: "",
    cantidad: "1",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar ventas con detalles
      const { data: ventasData, error: ventasError } = await supabase
        .from("ventas")
        .select(
          `
          *,
          clientes (
            nombres,
            apellidos
          ),
          usuarios (
            nombre,
            apellido
          )
        `
        )
        .order("fecha", { ascending: false });

      if (ventasError) throw ventasError;
      setVentas(ventasData || []);

      // Cargar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("cliente_id, nombres, apellidos, num_doc")
        .order("nombres", { ascending: true });

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Cargar productos activos con stock
      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select("*")
        .eq("estado", "activo")
        .gt("stock", 0)
        .order("nombre", { ascending: true });

      if (productosError) throw productosError;
      setProductos(productosData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setCarrito([]);
    setFormData({
      cliente_id: "",
      producto_id: "",
      cantidad: "1",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCarrito([]);
  };

  const handleOpenDetalle = async (venta) => {
    try {
      // Cargar detalles de la venta
      const { data, error } = await supabase
        .from("detalle_venta")
        .select(
          `
          *,
          productos (
            nombre,
            descripcion
          )
        `
        )
        .eq("venta_id", venta.venta_id);

      if (error) throw error;

      setSelectedVenta({
        ...venta,
        detalles: data || [],
      });
      setDetalleDialogOpen(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      alert("Error al cargar detalles: " + error.message);
    }
  };

  const handleCloseDetalleDialog = () => {
    setDetalleDialogOpen(false);
    setSelectedVenta(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const agregarAlCarrito = () => {
    if (!formData.producto_id || !formData.cantidad) {
      alert("Seleccione un producto y cantidad");
      return;
    }

    const producto = productos.find(
      (p) => p.producto_id === formData.producto_id
    );
    const cantidad = parseInt(formData.cantidad);

    if (cantidad > producto.stock) {
      alert(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(
      (item) => item.producto_id === producto.producto_id
    );

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        alert(`Stock insuficiente. Disponible: ${producto.stock}`);
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.producto_id === producto.producto_id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.producto_id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          subtotal: producto.precio * cantidad,
        },
      ]);
    }

    setFormData({
      ...formData,
      producto_id: "",
      cantidad: "1",
    });
  };

  const eliminarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter((item) => item.producto_id !== producto_id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    if (!formData.cliente_id) {
      alert("Seleccione un cliente");
      return;
    }

    try {
      // Obtener usuario actual
      const userData = JSON.parse(localStorage.getItem("user"));
      const total = calcularTotal();

      // Crear la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert([
          {
            total: total,
            cliente_id: formData.cliente_id,
            usuario_id: userData.usuario_id,
          },
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Crear los detalles de venta
      const detalles = carrito.map((item) => ({
        venta_id: ventaData.venta_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }));

      const { error: detalleError } = await supabase
        .from("detalle_venta")
        .insert(detalles);

      if (detalleError) throw detalleError;

      // Actualizar stock de productos
      for (const item of carrito) {
        const producto = productos.find(
          (p) => p.producto_id === item.producto_id
        );
        const nuevoStock = producto.stock - item.cantidad;

        const { error: stockError } = await supabase
          .from("productos")
          .update({ stock: nuevoStock })
          .eq("producto_id", item.producto_id);

        if (stockError) throw stockError;
      }

      alert("Venta registrada exitosamente");
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error("Error al registrar venta:", error);
      alert("Error al registrar venta: " + error.message);
    }
  };

  const handleDelete = async (ventaId) => {
    if (!window.confirm("¿Está seguro de eliminar esta venta?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("venta_id", ventaId);

      if (error) throw error;
      alert("Venta eliminada exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      alert("Error al eliminar venta: " + error.message);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    { Header: "Fecha", accessor: "fecha", width: "20%" },
    { Header: "Cliente", accessor: "cliente", width: "25%" },
    { Header: "Total", accessor: "total", width: "15%" },
    { Header: "Atendido por", accessor: "usuario", width: "20%" },
    { Header: "Acciones", accessor: "acciones", width: "20%" },
  ];

  const rows = ventas.map((venta) => ({
    fecha: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {formatearFecha(venta.fecha)}
      </MDTypography>
    ),
    cliente: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {venta.clientes
          ? `${venta.clientes.nombres} ${venta.clientes.apellidos}`
          : "Sin cliente"}
      </MDTypography>
    ),
    total: (
      <MDTypography variant="caption" color="text" fontWeight="bold">
        S/ {parseFloat(venta.total).toFixed(2)}
      </MDTypography>
    ),
    usuario: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {venta.usuarios
          ? `${venta.usuarios.nombre} ${venta.usuarios.apellido}`
          : "-"}
      </MDTypography>
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="text"
          color="success"
          size="small"
          onClick={() => handleOpenDetalle(venta)}
        >
          <Icon>visibility</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(venta.venta_id)}
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
                  Gestión de Ventas
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="white"
                  onClick={handleOpenDialog}
                >
                  <Icon>add</Icon>&nbsp; Nueva Venta
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Cargando ventas...
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

      {/* Dialog para Nueva Venta */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">Nueva Venta</MDTypography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="cliente-label" sx={{ top: "-7px" }}>
                    Cliente
                  </InputLabel>
                  <Select
                    labelId="cliente-label"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    label="Cliente"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione un cliente</MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem
                        key={cliente.cliente_id}
                        value={cliente.cliente_id}
                      >
                        {cliente.nombres} {cliente.apellidos} - DNI:{" "}
                        {cliente.num_doc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
                <MDTypography variant="h6" mt={2} mb={2}>
                  Agregar Productos
                </MDTypography>
              </Grid>

              <Grid item xs={12} md={7}>
                <FormControl fullWidth>
                  <InputLabel id="producto-label" sx={{ top: "-7px" }}>
                    Producto
                  </InputLabel>
                  <Select
                    labelId="producto-label"
                    name="producto_id"
                    value={formData.producto_id}
                    onChange={handleInputChange}
                    label="Producto"
                    sx={{
                      height: "45px",
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione un producto</MenuItem>
                    {productos.map((producto) => (
                      <MenuItem
                        key={producto.producto_id}
                        value={producto.producto_id}
                      >
                        {producto.nombre} - S/{" "}
                        {parseFloat(producto.precio).toFixed(2)} (Stock:{" "}
                        {producto.stock})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <MDInput
                  type="text"
                  label="Cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value === "" || parseInt(value) <= 999) {
                      setFormData({ ...formData, cantidad: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <MDButton
                  variant="gradient"
                  color="success"
                  fullWidth
                  onClick={agregarAlCarrito}
                  sx={{ height: "45px" }}
                >
                  <Icon>add_shopping_cart</Icon>
                </MDButton>
              </Grid>

              {carrito.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                    <MDTypography variant="h6" mt={2} mb={2}>
                      Carrito de Compra
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio Unit.</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Acción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {carrito.map((item) => (
                            <TableRow key={item.producto_id}>
                              <TableCell>{item.nombre}</TableCell>
                              <TableCell align="center">
                                {item.cantidad}
                              </TableCell>
                              <TableCell align="right">
                                S/ {parseFloat(item.precio).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                S/ {parseFloat(item.subtotal).toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    eliminarDelCarrito(item.producto_id)
                                  }
                                >
                                  <Icon>delete</Icon>
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <strong>TOTAL:</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>S/ {calcularTotal().toFixed(2)}</strong>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton
              type="submit"
              variant="gradient"
              color="info"
              disabled={carrito.length === 0}
            >
              Registrar Venta
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Ver Detalle de Venta */}
      <Dialog
        open={detalleDialogOpen}
        onClose={handleCloseDetalleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5">Detalle de Venta</MDTypography>
        </DialogTitle>
        <DialogContent>
          {selectedVenta && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDBox p={2} bgColor="grey-100" borderRadius="lg">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="bold"
                      >
                        Fecha:
                      </MDTypography>
                      <MDTypography variant="body2">
                        {formatearFecha(selectedVenta.fecha)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="bold"
                      >
                        Cliente:
                      </MDTypography>
                      <MDTypography variant="body2">
                        {selectedVenta.clientes
                          ? `${selectedVenta.clientes.nombres} ${selectedVenta.clientes.apellidos}`
                          : "-"}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="bold"
                      >
                        Atendido por:
                      </MDTypography>
                      <MDTypography variant="body2">
                        {selectedVenta.usuarios
                          ? `${selectedVenta.usuarios.nombre} ${selectedVenta.usuarios.apellido}`
                          : "-"}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="h6" mb={2}>
                  Productos
                </MDTypography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedVenta.detalles?.map((detalle) => (
                        <TableRow key={detalle.detalle_id}>
                          <TableCell>
                            {detalle.productos?.nombre || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detalle.cantidad}
                          </TableCell>
                          <TableCell align="right">
                            S/ {parseFloat(detalle.precio_unitario).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            S/ {parseFloat(detalle.subtotal).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>TOTAL:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            S/ {parseFloat(selectedVenta.total).toFixed(2)}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
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

export default Ventas;
