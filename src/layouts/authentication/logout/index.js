import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { replace } from "stylis";

function Logout() {
  //Modificacion -> Se agrega navigate
  const navigate = useNavigate();

/*   useEffect(() => {
    console.log("Componente Logout montado");

    //Limpiar todo
    //localStorage.clear();
    //Modificacion -> Solo eliminar la informacion de sesion, las preferencias y ajustes se quedan
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.clear();

    //console.log("localStorage limpiado");

    //Esperar un momento y redirigir
    const timer = setTimeout(() => {
      //console.log("Redirigiendo a login...");
      window.location.href = "/authentication/sign-in";
    }, 100);
    

    return () => {
      clearTimeout(timer);
    };
  }, []); */

      useEffect(() => {
        localStorage.clear();
        sessionStorage.clear();

        navigate("/authentication/sign-in", {replace: true});
      }, [navigate]);      

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "20px",
        fontFamily: "Arial",
      }}
    >
      Cerrando sesión...
    </div>
  );
}

export default Logout;
