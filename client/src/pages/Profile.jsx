import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/axiosSetup';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [ratingsData, setRatingsData] = useState({ ratings: [], averageRating: null });
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const isProvider = Boolean(user?.role && user.role.toUpperCase() !== 'CITIZEN');

  if (!user) {
    return <p style={{ padding: '2rem' }}>No profile information available.</p>;
  }

  useEffect(() => {
    let ignore = false;
    async function fetchRatings() {
      if (!isProvider || !user?.id) return;
      try {
        setRatingsLoading(true);
        const res = await api.get(`/api/ratings/provider/${user.id || user._id}`);
        if (!ignore) {
          setRatingsData({
            ratings: Array.isArray(res.data?.ratings) ? res.data.ratings : [],
            averageRating: res.data?.averageRating
          });
        }
      } catch {
        if (!ignore) {
          setRatingsData({ ratings: [], averageRating: null });
        }
      } finally {
        if (!ignore) setRatingsLoading(false);
      }
    }

    fetchRatings();
    return () => {
      ignore = true;
    };
  }, [isProvider, user?.id, user?._id]);

  const fields = [
    { label: 'Full name', value: user.fullName || user.name },
    { label: 'Email', value: user.email },
    { label: 'Mobile', value: user.mobile },
    { label: 'Role', value: formatRole(user.role) },
    { label: 'User ID', value: user.id || user._id }
  ].filter(field => field.value);

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-avatar">{getInitials(user.fullName || user.name)}</div>
        <h1>{user.fullName || user.name}</h1>
        <p className="profile-role">{formatRole(user.role)}</p>
      </section>

      <section className="profile-details">
        <h2>Your details</h2>
        <div className="profile-grid">
          {fields.map(field => (
            <article key={field.label}>
              <p className="label">{field.label}</p>
              <p className="value">{field.value}</p>
            </article>
          ))}
        </div>
      </section>

      {isProvider && (
        <section className="profile-ratings">
          <div className="profile-ratings__header">
            <h2>Citizen feedback</h2>
            {ratingsData.averageRating && (
              <span className="profile-ratings__average">
                Avg rating: {ratingsData.averageRating}/5
              </span>
            )}
          </div>
          {ratingsLoading ? (
            <p>Loading ratings...</p>
          ) : ratingsData.ratings.length === 0 ? (
            <p>No ratings received yet.</p>
          ) : (
            <div className="profile-ratings__table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Service</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ratingsData.ratings.map(rating => (
                    <tr key={rating._id}>
                      <td>{rating.citizen?.name || 'Citizen'}</td>
                      <td>{rating.rating}★</td>
                      <td>{rating.comment || '—'}</td>
                      <td>{rating.service?.title || 'Service'}</td>
                      <td>{formatDate(rating.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';
}

function formatRole(role = '') {
  return role
    .toString()
    .toLowerCase()
    .split('_')
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default Profile;



