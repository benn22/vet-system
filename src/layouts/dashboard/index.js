import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalMascotas: 0,
    citasHoy: 0,
    ventasMes: 0,
  });
  const [citasHoy, setCitasHoy] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [ultimasMascotas, setUltimasMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Total de clientes
      const { count: clientesCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      // Total de mascotas
      const { count: mascotasCount } = await supabase
        .from("mascotas")
        .select("*", { count: "exact", head: true });

      // Citas de hoy
      const hoy = new Date().toISOString().split("T")[0];
      const { data: citasHoyData, count: citasHoyCount } = await supabase
        .from("citas")
        .select(
          `
          *,
          mascotas (
            nombre,
            especie,
            clientes (
              nombres,
              apellidos,
              telefono
            )
          )
        `,
          { count: "exact" }
        )
        .eq("fecha", hoy)
        .order("hora", { ascending: true });

      setCitasHoy(citasHoyData || []);

      // Ventas del mes actual
      const primerDiaMes = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      const { data: ventasMesData } = await supabase
        .from("ventas")
        .select("total")
        .gte("fecha", primerDiaMes);

      const totalVentasMes =
        ventasMesData?.reduce(
          (sum, venta) => sum + parseFloat(venta.total),
          0
        ) || 0;

      // Últimas 5 ventas
      const { data: ventasRecientesData } = await supabase
        .from("ventas")
        .select(
          `
          *,
          clientes (
            nombres,
            apellidos
          )
        `
        )
        .order("fecha", { ascending: false })
        .limit(5);

      setVentasRecientes(ventasRecientesData || []);

      // Últimas 5 mascotas registradas
      const { data: mascotasRecientesData } = await supabase
        .from("mascotas")
        .select(
          `
          *,
          clientes (
            nombres,
            apellidos
          )
        `
        )
        .order("fecha_registro", { ascending: false })
        .limit(5);

      setUltimasMascotas(mascotasRecientesData || []);

      setStats({
        totalClientes: clientesCount || 0,
        totalMascotas: mascotasCount || 0,
        citasHoy: citasHoyCount || 0,
        ventasMes: totalVentasMes,
      });
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
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

  const getEstadoCitaColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "warning";
      case "atendida":
        return "success";
      case "cancelada":
        return "error";
      default:
        return "info";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDBox p={3} textAlign="center">
            <MDTypography variant="h6" color="text">
              Cargando dashboard...
            </MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Estadísticas principales */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="people"
                title="Total Clientes"
                count={stats.totalClientes}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Clientes registrados",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="pets"
                title="Total Mascotas"
                count={stats.totalMascotas}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Mascotas registradas",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="event"
                title="Citas Hoy"
                count={stats.citasHoy}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Citas programadas",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="attach_money"
                title="Ventas del Mes"
                count={`S/ ${stats.ventasMes.toFixed(2)}`}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Ingresos totales",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Citas de hoy y Ventas recientes */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={6}>
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
                <MDTypography variant="h6" color="white">
                  Citas de Hoy
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2} pb={2}>
                {citasHoy.length === 0 ? (
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="body2" color="text">
                      No hay citas programadas para hoy
                    </MDTypography>
                  </MDBox>
                ) : (
                  citasHoy.map((cita) => (
                    <MDBox
                      key={cita.cita_id}
                      mb={2}
                      pb={2}
                      borderBottom="1px solid #e0e0e0"
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <MDTypography
                            variant="button"
                            fontWeight="bold"
                            color={getEstadoCitaColor(cita.estado)}
                          >
                            {cita.hora}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={9}>
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            display="block"
                          >
                            {cita.mascotas?.nombre || "-"} (
                            {cita.mascotas?.especie || "-"})
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                          >
                            Dueño:{" "}
                            {cita.mascotas?.clientes
                              ? `${cita.mascotas.clientes.nombres} ${cita.mascotas.clientes.apellidos}`
                              : "-"}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                          >
                            Tel: {cita.mascotas?.clientes?.telefono || "-"}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                          >
                            Motivo: {cita.motivo}
                          </MDTypography>
                        </Grid>
                      </Grid>
                    </MDBox>
                  ))
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  Últimas Ventas
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2} pb={2}>
                {ventasRecientes.length === 0 ? (
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="body2" color="text">
                      No hay ventas registradas
                    </MDTypography>
                  </MDBox>
                ) : (
                  ventasRecientes.map((venta) => (
                    <MDBox
                      key={venta.venta_id}
                      mb={2}
                      pb={2}
                      borderBottom="1px solid #e0e0e0"
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            display="block"
                          >
                            {venta.clientes
                              ? `${venta.clientes.nombres} ${venta.clientes.apellidos}`
                              : "Sin cliente"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {formatearFechaHora(venta.fecha)}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <MDTypography
                            variant="button"
                            fontWeight="bold"
                            color="success"
                          >
                            S/ {parseFloat(venta.total).toFixed(2)}
                          </MDTypography>
                        </Grid>
                      </Grid>
                    </MDBox>
                  ))
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Últimas mascotas registradas */}
        <Grid container spacing={3}>
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
                  Últimas Mascotas Registradas
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2} pb={2}>
                {ultimasMascotas.length === 0 ? (
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="body2" color="text">
                      No hay mascotas registradas
                    </MDTypography>
                  </MDBox>
                ) : (
                  <Grid container spacing={2}>
                    {ultimasMascotas.map((mascota) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={2.4}
                        key={mascota.mascota_id}
                      >
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            p: 2,
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <MDBox textAlign="center" mb={1}>
                            <Icon fontSize="large" color="info">
                              pets
                            </Icon>
                          </MDBox>
                          <MDTypography variant="h6" textAlign="center" mb={1}>
                            {mascota.nombre}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            textAlign="center"
                            display="block"
                          >
                            {mascota.especie} - {mascota.raza || "Sin raza"}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            color="text"
                            textAlign="center"
                            display="block"
                          >
                            {formatearEdad(mascota.edad_meses)}
                          </MDTypography>
                          <MDBox mt="auto" pt={2}>
                            <MDTypography
                              variant="caption"
                              color="text"
                              textAlign="center"
                              display="block"
                            >
                              Dueño:
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              fontWeight="medium"
                              textAlign="center"
                              display="block"
                            >
                              {mascota.clientes
                                ? `${mascota.clientes.nombres} ${mascota.clientes.apellidos}`
                                : "-"}
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
