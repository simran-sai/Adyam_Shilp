import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("login function executed", formData);
    let responseData;
    await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then((r) => r.json()).then((data) => responseData = data);
    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  const signup = async () => {
    console.log("signup function executed", formData);
    let responseData;
    await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then((r) => r.json()).then((data) => responseData = data);
    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <div className="ls-logo-badge">
          <span>✦ Adyam Shilp</span>
        </div>
        <h1>{state}</h1>
        <p className="loginsignup-subtitle">
          {state === "Login"
            ? "Welcome back! Sign in to your account."
            : "Create your account to get started."}
        </p>

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder='Your Full Name'
            />
          )}
          <input
            name='email'
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder='Email Address'
          />
          <input
            name='password'
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder='Password'
          />
        </div>

        <button onClick={() => { state === "Login" ? login() : signup(); }}>
          {state === "Login" ? "Sign In →" : "Create Account →"}
        </button>

        {state === "Sign Up"
          ? <p className="loginsignup-login">Already have an account? <span onClick={() => setState("Login")}>Sign in here</span></p>
          : <p className="loginsignup-login">Don't have an account? <span onClick={() => setState("Sign Up")}>Create one</span></p>
        }

        <div className="loginsignup-agree">
          <input type="checkbox" id="terms" />
          <p>By continuing, I agree to the <strong>Terms of Use</strong> &amp; <strong>Privacy Policy</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
