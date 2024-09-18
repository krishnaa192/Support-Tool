import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput
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
            <img  alt="logo" src="logo0.png"/>
                <span className="h1 fw-bold mb-0">Globocom Support </span>
              </div>

<div className="login-form">
              <form onSubmit={login}>
                <MDBInput wrapperClass="mb-4" label="Email address" id="email"  placeholder="Email or Username" type="email" size="lg" value={email} onChange={(e) => setEmail(e.target.value)} className="styled-input" />
                <MDBInput wrapperClass="mb-4" label="Password" id="password" placeholder="password" type="password" size="lg" value={password} onChange={(e) => setPassword(e.target.value)} className="styled-input" />

                <MDBBtn className="mb-4 px-5 login-btn" color="dark" size="lg" type="submit">Login</MDBBtn>
              </form>
              </div>
<<<<<<< HEAD
              <button className="button login__submit" type="submit">
                <span className="button__text">Log In</span>
                <i className="button__icon fas fa-chevron-right"></i>
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </>
=======
       
            </MDBCardBody>
          </MDBCol>

        </MDBRow>
      </MDBCard>
    </MDBContainer>
>>>>>>> 35439d2 (Added changes)
  );
};

export default Login;
