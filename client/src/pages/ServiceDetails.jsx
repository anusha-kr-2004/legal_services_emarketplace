import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axiosSetup';
import RatingStars from '../components/RatingStars';
import BookingForm from '../components/BookingForm';
import { useNotification } from '../components/NotificationProvider.jsx';
import './ServiceDetails.css';

function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingState, setBookingState] = useState({ status: 'idle', message: '' });
  const { notify } = useNotification();

  useEffect(() => {
    let ignore = false;
    async function fetchService() {
      try {
        setLoading(true);
        const res = await api.get(`/api/services/${id}`);
        if (!ignore) {
          setService(res.data);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          const message = err.response?.data?.message || 'Failed to load service details';
          setError(message);
          notify({ type: 'error', message });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchService();
    return () => {
      ignore = true;
    };
  }, [id, notify]);

  const handleBook = async bookingDate => {
    if (!bookingDate) return;
    setBookingState({ status: 'loading', message: '' });
    try {
      await api.post('/api/bookings/create', { serviceId: id, bookingDate });
      const message = 'Booking request sent. A provider will confirm shortly.';
      setBookingState({ status: 'success', message });
      notify({ type: 'success', title: 'Booking submitted', message });
    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed';
      setBookingState({ status: 'error', message });
      notify({ type: 'error', message });
    }
  };

  const perks = useMemo(
    () => [
      'Secure in-app messaging',
      'Transparent pricing',
      'Verified legal experts'
    ],
    []
  );

  if (loading) {
    return (
      <div className="service-details-page">
        <p className="service-details-state">Loading service details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-details-page">
        <p className="service-details-state error">{error}</p>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="service-details-page">
      <section className="service-details-hero">
        <div>
          <p className="label">{service.category || 'Legal Service'}</p>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
          <div className="service-meta">
            <span>Provided by <strong>{service.provider?.name}</strong></span>
            <span>₹{service.price}</span>
            <span>
              <RatingStars rating={service.avgRating || 0} /> ({service.avgRating || 0})
            </span>
          </div>
        </div>
        <ul className="service-perks">
          {perks.map(perk => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      </section>

      <section className="service-details-body">
        <article className="service-details-card">
          <h2>What&apos;s included</h2>
          <p>{service.description}</p>
          {service.highlights && service.highlights.length > 0 && (
            <ul>
              {service.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </article>

        <aside className="booking-card">
          <h3>Ready to get started?</h3>
          <p>Pick a preferred date and the provider will confirm the exact slot.</p>
          <BookingForm onBook={handleBook} ctaLabel="Request booking" />
          {bookingState.message && (
            <p className={`booking-state ${bookingState.status}`}>
              {bookingState.message}
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}

export default ServiceDetails;
