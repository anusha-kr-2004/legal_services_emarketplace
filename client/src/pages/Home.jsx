import React, { useEffect, useMemo, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import api from '../utils/axiosSetup';
import './Home.css';

function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const steps = useMemo(
    () => [
      {
        title: 'Share your requirement',
        description: 'Tell us what you need help with and when you would like to speak to an expert.'
      },
      {
        title: 'Match with vetted experts',
        description: 'We surface providers who specialise in your matter, complete with transparent pricing.'
      },
      {
        title: 'Collaborate in one workspace',
        description: 'Book sessions, exchange documents, and chat securely without switching tools.'
      },
      {
        title: 'Close the loop together',
        description: 'Providers update progress, you share feedback, and both parties retain records.'
      }
    ],
    []
  );

  const values = useMemo(
    () => [
      {
        title: 'Vetted legal partners',
        description: 'Advocates, mediators, arbitrators, and notaries go through identity, credential, and practice checks before onboarding.'
      },
      {
        title: 'Human + technology support',
        description: 'Our workspace blends personalised provider attention with automated reminders, document checklists, and status updates.'
      },
      {
        title: 'Pan-India coverage',
        description: 'From metropolitan courts to tier-2 cities, we help citizens reach the right specialist without travelling across states.'
      }
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: 'Citizen queries resolved', value: '4,800+' },
      { label: 'Verified legal professionals', value: '320+' },
      { label: 'Avg. rating', value: '4.8/5' }
    ],
    []
  );

  useEffect(() => {
    let ignore = false;
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await api.get('/api/services');
        if (!ignore) {
          setServices(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
          setError('');
        }
      } catch {
        if (!ignore) {
          setServices([]);
          setError('Failed to load services. Please try again later.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>Find Trusted Legal Services in India</h1>
        <p>Connect with advocates, notaries, mediators & more, all on one platform.</p>
        <input type="search" placeholder="Search services, providers..." />
      </header>

      <section className="about-app">
        <div className="about-copy">
          <p className="section-eyebrow">Why LegalConnect</p>
          <h2>Technology-powered legal help with a human heart</h2>
          <p>
            LegalConnect is India&apos;s legal services marketplace built for both citizens and
            practising professionals. We simplify discovery, collaboration, and compliance so you
            can focus on the matter at hand while we handle coordination, reminders, and records.
          </p>
          <p>
            Every provider brings verified experience and domain expertise, ensuring conversations
            move from questions to resolutions quickly.
          </p>
        </div>
        <div className="stats-grid">
          {stats.map(stat => (
            <article key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="featured-services">
        <h2>Popular Legal Services</h2>
        {loading ? (
          <p>Loading featured services…</p>
        ) : error ? (
          <p>{error}</p>
        ) : services.length === 0 ? (
          <p>No services available yet. Please check back soon.</p>
        ) : (
          <div className="service-grid">
            {services.map(service => (
              <ServiceCard
                key={service._id}
                id={service._id}
                title={service.title}
                price={service.price}
                provider={service.provider?.name || 'Legal Expert'}
              />
            ))}
          </div>
        )}
      </section>

      <section className="service-values">
        {values.map(value => (
          <article key={value.title} className="value-card">
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </article>
        ))}
      </section>

      <section className="how-it-works">
        <p className="section-eyebrow">How we work</p>
        <h2>From enquiry to outcome in four steps</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="step-card">
              <span className="step-index">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="service-promise">
        <div>
          <p className="section-eyebrow">Our service promise</p>
          <h2>Clear communication, reliable timelines, and measured outcomes</h2>
        </div>
        <p>
          We provide structured intake forms, transparent quotes, session notes, and follow-up
          reminders so every stakeholder stays aligned. Whether you need a one-time consultation or
          ongoing representation, your progress, files, and conversations remain available inside
          the dashboard 24/7.
        </p>
      </section>
    </div>
  );
}

export default Home;
