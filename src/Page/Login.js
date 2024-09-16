import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login(event) {
    event.preventDefault();
    try {
      const res = await axios.post("http://103.127.157.221:8080/globobill/api/login", {
        email: email,
        password: password,
      });
      if (res.data.status === true && res.data.message === "Login successful") {
        // Store user data in session storage
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("userId", res.data.data.id);
        // Navigate to the homepage after login
        navigate("/");

      } else {
        alert("Incorrect Email or Password.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while logging in.");
    }
  }
  

  return (
    <>
      <div className="container">
        <div className="screen">
          <div className="screen__content">
            <form className="login" onSubmit={login}>
              <div className="login__field">
                <i className="login__icon fas fa-user"></i>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="login__field">
                <i className="login__icon fas fa-lock"></i>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <button className="button login__submit" type="submit">
                <span className="button__text">Log In</span>
                <i className="button__icon fas fa-chevron-right"></i>
              </button>
            </form>
          </div>
          <div className="screen__background">
            <span className="screen__background__shape screen__background__shape4"></span>
            <span className="screen__background__shape screen__background__shape3"></span>
            <span className="screen__background__shape screen__background__shape2"></span>
            <span className="screen__background__shape screen__background__shape1"></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
