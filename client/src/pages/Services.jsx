import React, { useEffect, useMemo, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import api from '../utils/axiosSetup';
import { useNotification } from '../components/NotificationProvider.jsx';
import './Services.css';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { notify } = useNotification();

  useEffect(() => {
    let ignore = false;
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await api.get('/api/services');
        if (!ignore) {
          setServices(Array.isArray(res.data) ? res.data : []);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          const message = err.response?.data?.message || 'Failed to load services';
          setError(message);
          notify({ type: 'error', message });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchServices();
    return () => {
      ignore = true;
    };
  }, [notify]);

  const categories = useMemo(() => {
    const unique = new Set(
      services
        .map(service => service.category)
        .filter(Boolean)
        .map(value => value.toLowerCase())
    );
    return ['all', ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchCategory = category === 'all'
        ? true
        : service.category?.toLowerCase() === category;
      const matchQuery = service.title?.toLowerCase().includes(query.toLowerCase()) ||
        service.description?.toLowerCase().includes(query.toLowerCase()) ||
        service.provider?.name?.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [services, category, query]);

  return (
    <div className="services-page">
      <section className="services-hero">
        <div>
          <p className="label">Marketplace</p>
          <h1>Browse trusted legal services</h1>
          <p>
            Filter by category, compare pricing, and connect with vetted experts for everything
            from property matters to dispute resolution.
          </p>
        </div>
        <div className="services-controls">
          <input
            type="search"
            placeholder="Search by service, provider, or keyword"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(option => (
              <option key={option} value={option}>
                {option === 'all'
                  ? 'All categories'
                  : option.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="services-grid">
        {loading ? (
          <p className="services-state">Loading services…</p>
        ) : error ? (
          <p className="services-state error">{error}</p>
        ) : filteredServices.length === 0 ? (
          <p className="services-state">
            No services match your filters. Try a different keyword or category.
          </p>
        ) : (
          filteredServices.map(service => (
            <ServiceCard
              key={service._id}
              id={service._id}
              title={service.title}
              price={service.price}
              provider={service.provider?.name || 'Legal expert'}
            />
          ))
        )}
      </section>
    </div>
  );
}

export default Services;
