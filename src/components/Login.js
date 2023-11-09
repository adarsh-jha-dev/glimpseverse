import React, { useState } from "react";
import "../css/login.css";
// import { useNavigate } from "react-router-dom";

const Login = () => {

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  // const navigate = useNavigate();
  // const [alertVisible, setAlertVisible] = useState(false); // State to control alert visibility

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        localStorage.setItem('token', json.authtoken);
        // setAlertVisible(true);
        // props.showAlert("success", "Logged in successfully");
        // navigate('/', { props: { userName: json.username } });
      } else {
        // // Show the error alert
        // setAlertVisible(true);
        // props.showAlert("danger", "Invalid Credentials");
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while logging in.');
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };


  return (
    <div className="container">
      <div class="wrapper">
        <div class="title-text">
          <div class="title login">Login Form</div>
          <div class="title signup">Signup Form</div>
        </div>
        <div class="form-container">
          <div class="slide-controls">
            <input type="radio" name="slide" id="login" checked />
            <input type="radio" name="slide" id="signup" />
            <label for="login" class="slide login">
              Login
            </label>
            <label for="signup" class="slide signup">
              Signup
            </label>
            <div class="slider-tab"></div>
          </div>
          <div class="form-inner">
            <form onSubmit={handleSubmit} class="login">
              <div class="field">
                <input type="text" name="username" id="username" value={credentials.username} onChange={onChange} placeholder="Username" required />
              </div>
              <div class="field">
                <input type="password" name="password" id="password" value={credentials.password} onChange={onChange} placeholder="Password" required />
              </div>
              <div class="pass-link">
                <a href="/">Forgot password?</a>
              </div>
              <div class="field btn">
                <div class="btn-layer"></div>
                <input type="submit" value="Login" />
              </div>
              <div class="signup-link">
              {/* eslint-disable-next-line */}
                Not a member? <a href="">Signup now</a>
              </div>
            </form>
            <form  class="signup">
              <div class="field">
                <input type="text" placeholder="Email Address" required />
              </div>
              <div class="field">
                <input type="password" placeholder="Password" required />
              </div>
              <div class="field">
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                />
              </div>
              <div class="field btn">
                <div class="btn-layer"></div>
                <input type="submit" value="Signup" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
