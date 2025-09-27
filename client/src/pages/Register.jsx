import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen'
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/register', formData);
      alert(res.data.message);
    } catch (err) {
      alert( 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input 
        type="text" name="name" placeholder="Name" required 
        value={formData.name} onChange={handleChange} 
      />
      <input 
        type="email" name="email" placeholder="Email" required 
        value={formData.email} onChange={handleChange} 
      />
      <input 
        type="password" name="password" placeholder="Password" required 
        value={formData.password} onChange={handleChange} 
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="citizen">Citizen</option>
        <option value="advocate">Advocate</option>
        <option value="mediator">Mediator</option>
        <option value="arbitrator">Arbitrator</option>
        <option value="notary">Notary</option>
        <option value="document_writer">Document Writer</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
