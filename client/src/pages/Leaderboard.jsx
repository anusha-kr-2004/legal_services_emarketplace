import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/axiosSetup';
import { useNotification } from '../components/NotificationProvider.jsx';
import './Leaderboard.css';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    let ignore = false;
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await api.get('/api/users/leaderboard');
        if (!ignore) {
          setLeaders(Array.isArray(res.data) ? res.data : []);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          const message = err.response?.data?.message || 'Failed to fetch leaderboard';
          setError(message);
          notify({ type: 'error', message });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => {
      ignore = true;
    };
  }, [notify]);

  const podium = useMemo(() => leaders.slice(0, 3), [leaders]);

  return (
    <div className="leaderboard-page">
      <section className="leaderboard-hero">
        <p className="label">Top legal experts</p>
        <h1>Celebrating consistent impact</h1>
        <p>
          These professionals delivered timely responses, high ratings, and exceptional service
          quality over the past month.
        </p>
      </section>

      <section className="leaderboard-podium">
        {loading ? (
          <p>Loading leaderboard…</p>
        ) : error ? (
          <p className="leaderboard-state error">{error}</p>
        ) : podium.length === 0 ? (
          <p className="leaderboard-state">No leaderboard data available yet.</p>
        ) : (
          podium.map((leader, index) => (
            <article key={leader._id} className={`podium-card place-${index + 1}`}>
              <p className="podium-rank">#{index + 1}</p>
              <h3>{leader.name}</h3>
              <p className="podium-role">{formatRole(leader.role)}</p>
              <p className="podium-points">{leader.points} pts</p>
            </article>
          ))
        )}
      </section>

      {!loading && !error && leaders.length > 3 && (
        <section className="leaderboard-table">
          <div className="table-header">
            <p>Rank</p>
            <p>Provider</p>
            <p>Role</p>
            <p>Points</p>
          </div>
          {leaders.slice(3).map((leader, idx) => (
            <div key={leader._id} className="table-row">
              <span>#{idx + 4}</span>
              <strong>{leader.name}</strong>
              <span>{formatRole(leader.role)}</span>
              <span>{leader.points}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function formatRole(role = '') {
  return role
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase()) || 'Provider';
}

export default Leaderboard;
