import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ForgetPassword from "./Forgetpassword";

const AuthOverlay = () => {
  const [active, setActive] = useState("login"); // "login" | "signup" | "forgot"

  const handleClose = () => {
    window.location.href = "/"; // go back to home page when closed
  };

  return (
    <div>
      {active === "login" && (
        <Login
          onClose={handleClose}
          onSwitchToSignup={() => setActive("signup")}
          onSwitchToForgot={() => setActive("forgot")}
        />
      )}

      {active === "signup" && (
        <Signup
          onClose={handleClose}
          onSwitchToLogin={() => setActive("login")}
        />
      )}

      {active === "forgot" && (
        <ForgetPassword
          onClose={handleClose}
          onSwitchToLogin={() => setActive("login")}
        />
      )}
    </div>
  );
};

export default AuthOverlay;
