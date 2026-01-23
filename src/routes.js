// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import Clientes from "layouts/clientes";
import Mascotas from "layouts/mascotas";
import Citas from "layouts/citas";
import Historial from "layouts/historial";
import Productos from "layouts/productos";
import Ventas from "layouts/ventas";
import Usuarios from "layouts/usuarios";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Clientes",
    key: "clientes",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/clientes",
    component: <Clientes />,
  },
  {
    type: "collapse",
    name: "Mascotas",
    key: "mascotas",
    icon: <Icon fontSize="small">pets</Icon>,
    route: "/mascotas",
    component: <Mascotas />,
  },
  {
    type: "collapse",
    name: "Citas",
    key: "citas",
    icon: <Icon fontSize="small">event</Icon>,
    route: "/citas",
    component: <Citas />,
  },
  {
    type: "collapse",
    name: "Historial Médico",
    key: "historial",
    icon: <Icon fontSize="small">medical_services</Icon>,
    route: "/historial",
    component: <Historial />,
  },
  {
    type: "collapse",
    name: "Productos",
    key: "productos",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/productos",
    component: <Productos />,
  },
  {
    type: "collapse",
    name: "Ventas",
    key: "ventas",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/ventas",
    component: <Ventas />,
  },
  {
    type: "collapse",
    name: "Usuarios",
    key: "usuarios",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/usuarios",
    component: <Usuarios />,
  },
];

export default routes;
