//import { useNavigate } from "react-router-dom";
//import MenuItem from "@mui/material/MenuItem";
//import Menu from "@mui/material/Menu";
//import Divider from "@mui/material/Divider";

import { useState, useEffect } from "react";

// react-router components
//import { useLocation, Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
//import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
//import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  // Obtener datos del usuario
  const [userData, setUserData] = useState(null);
  //Modificacion -> Mejora de este bloque
  /*   useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []); */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    } else {
      //Si no hay usuario, forzar logout limpio
      navigate("/logout");
    }
  }, [navigate]);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    window.addEventListener("scroll", handleTransparentNavbar);

    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleLogout = () => {
    console.log("Ejecutando logout..."); // Para debug
    handleCloseMenu(); // Cerrar el menú primero
    navigate("/logout");
  };

  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) =>
        navbar(theme, { transparentNavbar, absolute, light, darkMode })
      }
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={light}
          />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox
              color={light ? "white" : "inherit"}
              display="flex"
              alignItems="center"
            >
              {/* Información del usuario */}
              {userData && (
                <MDBox mr={2} display="flex" alignItems="center">
                  <Icon sx={iconsStyle} fontSize="medium">
                    account_circle
                  </Icon>
                  <MDBox
                    ml={1}
                    lineHeight={0}
                    display={{ xs: "none", sm: "block" }}
                  >
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      color={light ? "white" : "dark"}
                    >
                      {userData.nombre} {userData.apellido}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color={light ? "white" : "text"}
                      display="block"
                    >
                      {userData.rol}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              )}

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>logout</Icon>
              </IconButton>
              <Menu
                anchorEl={openMenu}
                anchorReference={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                open={Boolean(openMenu)}
                onClose={handleCloseMenu}
                sx={{ mt: 2 }}
              >
                <MenuItem disabled>
                  <MDBox display="flex" alignItems="center">
                    <Icon>account_circle</Icon>
                    <MDBox ml={1}>
                      <MDTypography variant="button" fontWeight="medium">
                        {userData?.username}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MenuItem>
                <Divider />
                <MenuItem
                  //Modificacion -> Cambio del onClick
                  /*
                  onClick={() => {
                    console.log("Click en cerrar sesión");
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.replace("/authentication/sign-in");
                  }}
                    */
                  onClick={handleLogout}
                >
                  <MDBox display="flex" alignItems="center" color="error">
                    <Icon color="error">logout</Icon>
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      color="error"
                      ml={1}
                    >
                      Cerrar Sesión
                    </MDTypography>
                  </MDBox>
                </MenuItem>
              </Menu>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
