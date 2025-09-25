import React, {useState} from 'react';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'citizen'
    });

    const handleChange = (e) => {
        setFormData ({ ...FormData, [e.target.name] : e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/users/register', formData);
            alert(res.data.message);
        }
        catch(error){
            alert("Registration Failed");
        }
    };
    return (
        <form onSubmit = { handleSubmit }>
            <h2>Register</h2>

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required/>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required/>
            <input type="password" name="name" value={formData.password} onChange={handleChange} placeholder="Password" required/>

            <select name="role" value={formData.role} onChange={handleChange}>
                <option value="citizen">Citizen</option>
                <option value="advocate">Advocate</option>
                <option value="mediator">Mediator</option>
                <option value="arbitrator">Arbitrator</option>
                <option value="notary">Notary</option>
                <option value="documnet_writer">Document Writer</option>
            </select>

            <button type="Submit">Register</button>

        </form>
    );
}
export default Register;