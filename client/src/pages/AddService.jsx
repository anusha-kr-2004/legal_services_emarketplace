import React, { useState } from 'react';
import api from '../utils/axiosSetup';
import { useNotification } from '../components/NotificationProvider.jsx';
import './AddService.css';

function AddService() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    deliveryTime: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotification();

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim()
      };
      const res = await api.post('/api/services/add', payload);
      setFormData({ title: '', category: '', description: '', price: '', deliveryTime: '' });
      notify({
        type: 'success',
        title: 'Service published',
        message: res.data?.message || 'Your service is now visible to citizens.'
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add service';
      notify({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <section className="form-hero">
        <p className="label">Provider workspace</p>
        <h1>Publish a new legal service</h1>
        <p>
          Craft a clear pitch highlighting your expertise, pricing, and delivery timelines. Citizens
          can discover, compare, and book you straight from this marketplace.
        </p>
        <ul>
          <li>Highlight what makes your service unique</li>
          <li>Set transparent pricing and timelines</li>
          <li>Respond quickly to convert more requests</li>
        </ul>
      </section>

      <section className="form-card">
        <h2>Service details</h2>
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-grid">
            <label>
              Service title
              <input
                name="title"
                placeholder="Eg. Property registration consultation"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Category
              <input
                name="category"
                placeholder="Eg. Property law, contracts, arbitration"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              placeholder="Explain your expertise, inclusions, and what citizens can expect."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </label>
          <div className="form-grid">
            <label>
              Starting price (₹)
              <input
                name="price"
                type="number"
                min="0"
                placeholder="₹"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Typical delivery time
              <input
                name="deliveryTime"
                placeholder="Eg. 3 business days"
                value={formData.deliveryTime}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish service'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddService;
