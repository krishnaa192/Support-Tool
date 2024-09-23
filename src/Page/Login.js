import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBInput,
} from 'mdb-react-ui-kit';
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
    <MDBContainer className="login-container my-5">
      <MDBCard className="login-card shadow-lg">
        <MDBRow className="g-0">
          <MDBCol md="6">
            <MDBCardBody className="d-flex flex-column justify-content-center">
              <div className="d-flex flex-row mt-2 mb-4">
                <img alt="logo" src="logo0.png" />
                <span className="h1 fw-bold mb-0">Globocom Support</span>
              </div>
              <div className="login-form">
                <form onSubmit={login}>
                  <MDBInput 
                    wrapperClass="mb-4" 
                
                    id="email" 
                    placeholder="Email or Username" 
                    type="email" 
                    size="lg" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="styled-input" 
                    autoFocus
                  />
                  <MDBInput 
                    wrapperClass="mb-4" 
                 
                    id="password" 
                    placeholder="password" 
                    type="password" 
                    size="lg" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="styled-input" 
                    autoFocus
                  />
                  <MDBBtn className="mb-4 px-5 login-btn" color="dark" size="lg" type="submit">
                    Login
                  </MDBBtn>
                </form>
              </div>
            </MDBCardBody>
          </MDBCol>
          {/* You can add your image or any content for the second column here */}
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
};

export default Login;
