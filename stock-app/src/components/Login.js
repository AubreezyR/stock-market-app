// Login.js
import React from 'react';
import { useState } from 'react';
import { auth } from 'firebase';
import { signInWihEmailAndPassword } from 'firebase'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const signIn = (e) =>{
        e.preventDefault();//prevents reload so we dont lose email and password
        signInWihEmailAndPassword(auth,email,password)
        .then((userCredentials) => {
            console.log(userCredentials);
        }).catch((error) => {
            console.log(error);
        })
    }

  return (
    <div className='sign-in-container'>
        <form onSubmit={signIn}>
            <h2>Login</h2>
            <input type='email' placeholder='Enter your email address' value={email} onChange={e => setEmail(e.target.value)} ></input>
            <input type='password' placeholder='Enter your password'value={password} onChange={e => setPassword(e.target.value)}></input>
            <button type="submit">Log In</button>
        </form>
    </div>
  );
};

export default Login;