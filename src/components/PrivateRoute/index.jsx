import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";

const PrivateRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return children;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
