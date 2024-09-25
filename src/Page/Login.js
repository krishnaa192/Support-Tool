import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css"; // Custom CSS for styling

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
        sessionStorage.setItem("Requested Data", JSON.stringify(res.data.data));
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
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img alt="logo" src="login.png" />
        </div>
        <div className="login-form-container">
          <h1 className="login-head">Login
          
          </h1>

          <div className="login-form">
            <form onSubmit={login}>
              <input
                id="email"
                placeholder="Email or Username"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="styled-input"
                autoFocus
              />
              <input
                id="password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="styled-input"
              />
              <button className="login-btn" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
