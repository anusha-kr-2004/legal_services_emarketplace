import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api, { API_BASE_URL } from '../utils/axiosSetup';
import { useAuth } from '../context/AuthContext.jsx';
import './Dashboard.css';
import { useNotification } from '../components/NotificationProvider.jsx';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const socketRef = useRef(null);
  const selectedBookingIdRef = useRef(null);
  const querySectionRef = useRef(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get('/api/services');
        setServices(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
      } catch {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
  }, []);

  useEffect(() => {
    if (!token) {
      setBookings([]);
      return;
    }

    let ignore = false;
    async function fetchBookings() {
      try {
        setBookingsLoading(true);
        setBookingsError('');
        const res = await api.get('/api/bookings/my-bookings');
        if (!ignore) {
          setBookings(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (!ignore) {
          setBookings([]);
          setBookingsError('Unable to load service queries right now.');
        }
      } finally {
        if (!ignore) setBookingsLoading(false);
      }
    }

    fetchBookings();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!bookings.length) {
      setSelectedBooking(null);
      return;
    }

    setSelectedBooking(prev => {
      if (prev && bookings.some(booking => booking._id === prev._id)) {
        return prev;
      }
      return bookings[0];
    });
  }, [bookings]);

  useEffect(() => {
    selectedBookingIdRef.current = selectedBooking?._id || null;
    if (selectedBooking?.status === 'Completed' && selectedBooking.rating) {
      setRatingValue(selectedBooking.rating.rating || 5);
      setRatingComment(selectedBooking.rating.comment || '');
    } else {
      setRatingValue(5);
      setRatingComment('');
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE_URL, { auth: { token } });
    socketRef.current = socket;

    const handleNewMessage = ({ bookingId, message }) => {
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId ? { ...booking, lastMessage: message } : booking
        )
      );

      if (selectedBookingIdRef.current === bookingId) {
        setMessages(prev => {
          if (prev.some(existing => existing._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socket.on('chat:new-message', handleNewMessage);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const activeBookingId = selectedBooking?._id;
  const chatAccessibleStatuses = ['Confirmed', 'Resolved', 'Closed', 'Completed'];
  const chatAccessible = chatAccessibleStatuses.includes(selectedBooking?.status || '');
  const canSendMessages = ['Confirmed', 'Resolved'].includes(selectedBooking?.status || '');
  const chatNotice = useMemo(() => {
    if (!selectedBooking) return '';
    if (selectedBooking.status === 'Closed') {
      return 'This query is closed. Messaging is read-only.';
    }
    return '';
  }, [selectedBooking]);

  useEffect(() => {
    if (!activeBookingId) {
      setMessages([]);
      setChatError('');
      return;
    }

    if (!chatAccessible) {
      setChatLoading(false);
      setMessages([]);
      setChatError('Chat will activate once the provider accepts this request.');
      return;
    }

    let ignore = false;
    setChatLoading(true);
    setChatError('');
    setMessages([]);

    async function fetchConversation() {
      try {
        const res = await api.get(`/api/chat/${activeBookingId}`);
        if (ignore) return;
        setMessages(res.data?.messages || []);
        if (res.data?.booking) {
          setSelectedBooking(res.data.booking);
        }
      } catch (err) {
        if (!ignore) {
          setMessages([]);
          if (err.response?.status === 403) {
            setChatError(err.response?.data?.message || 'Chat will activate once the provider accepts this request.');
          } else {
            setChatError('Unable to load conversation right now.');
          }
        }
      } finally {
        if (!ignore) setChatLoading(false);
      }
    }

    fetchConversation();

    if (socketRef.current) {
      socketRef.current.emit('joinBooking', activeBookingId);
    }

    return () => {
      ignore = true;
    };
  }, [activeBookingId, chatAccessible]);

  useEffect(() => {
    if (!activeBookingId || !messages.length) return;
    const lastMessage = messages[messages.length - 1];
    setBookings(prev =>
      prev.map(booking =>
        booking._id === activeBookingId ? { ...booking, lastMessage } : booking
      )
    );
  }, [messages, activeBookingId]);

  const firstName = useMemo(() => {
    const displayName = user?.fullName || user?.name || 'Guest';
    return displayName.split(' ')[0];
  }, [user]);

  const normalizedRole = useMemo(() => user?.role?.toLowerCase?.() || 'citizen', [user]);
  const isCitizen = normalizedRole === 'citizen';
  const isProvider = !isCitizen;

  const formattedRole = useMemo(() => {
    if (!user?.role) return 'Citizen';
    return user.role
      .toString()
      .toLowerCase()
      .split('_')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }, [user]);

  const heroTitle = isCitizen
    ? 'Access trusted legal services in a few clicks'
    : 'Manage citizen legal queries from one workspace';
  const heroSubtitle = isCitizen
    ? 'Book consultations, track requests, and manage your legal needs from a single citizen workspace.'
    : 'Track new requests, chat with citizens instantly, and grow your reputation with timely responses.';

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!messageDraft.trim() || !selectedBooking?._id) return;
    if (!chatAccessible) {
      notify({ type: 'info', message: 'Chat will activate once the provider accepts this request.' });
      return;
    }
    if (!canSendMessages) {
      notify({ type: 'warning', message: 'This conversation is closed. Messaging is disabled.' });
      return;
    }
    try {
      setSendingMessage(true);
      const res = await api.post(`/api/chat/${selectedBooking._id}`, {
        content: messageDraft.trim()
      });
      setMessageDraft('');
      const newMessage = res.data?.message;
      if (newMessage) {
        setMessages(prev => {
          if (prev.some(existing => existing._id === newMessage._id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    } catch {
      notify({ type: 'error', message: 'Failed to send message. Please try again.' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBookingStatusChange = async nextStatus => {
    if (!selectedBooking?._id) return;
    try {
      setUpdatingStatus(true);
      const res = await api.put(`/api/bookings/${selectedBooking._id}/status`, { status: nextStatus });
      const updatedBooking = res.data?.booking || { ...selectedBooking, status: nextStatus };
      setSelectedBooking(prev =>
        prev && prev._id === updatedBooking._id ? updatedBooking : prev
      );
      setBookings(prev =>
        prev.map(booking =>
          booking._id === updatedBooking._id ? { ...booking, status: updatedBooking.status } : booking
        )
      );
      notify({
        type: 'success',
        message: `Booking marked as ${nextStatus}.`
      });
    } catch {
      notify({ type: 'error', message: 'Failed to update booking status. Try again.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitRating = async e => {
    e.preventDefault();
    if (!selectedBooking?._id) return;
    try {
      setSubmittingRating(true);
      const res = await api.post('/api/ratings/add', {
        bookingId: selectedBooking._id,
        rating: Number(ratingValue),
        comment: ratingComment.trim() || undefined
      });
      const ratingPayload = res.data?.rating;
      setSelectedBooking(prev =>
        prev && prev._id === selectedBooking._id ? { ...prev, rating: ratingPayload } : prev
      );
      setBookings(prev =>
        prev.map(booking =>
          booking._id === selectedBooking._id ? { ...booking, rating: ratingPayload } : booking
        )
      );
      if (ratingPayload) {
        setRatingValue(ratingPayload.rating || 5);
        setRatingComment(ratingPayload.comment || '');
      }
    } catch (err) {
      notify({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit rating. Try again.'
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const queryTitle = isCitizen ? 'Your service queries' : 'Citizen service queries';
  const querySubtitle = isCitizen
    ? 'Track the status of every request you have raised and stay connected with providers.'
    : 'See every citizen query assigned to you and chat with them as soon as they reach out.';

  const handleRefreshBookings = async () => {
    if (!token) return;
    try {
      setBookingsLoading(true);
      setBookingsError('');
      const res = await api.get('/api/bookings/my-bookings');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setBookingsError('Unable to refresh right now.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleScrollToQueries = () => {
    if (querySectionRef.current) {
      querySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderQueryList = () => {
    if (bookingsLoading) {
      return <p className="conversation-empty">Loading service queries…</p>;
    }
    if (bookingsError) {
      return <p className="conversation-empty error">{bookingsError}</p>;
    }
    if (!bookings.length) {
      return (
        <p className="conversation-empty">
          {isCitizen
            ? 'You have not raised any queries yet. Book a service to get started.'
            : 'No citizen queries yet. Once a citizen books your service, their request will appear here.'}
        </p>
      );
    }

    return (
      <ul className="conversation-items">
        {bookings.map(booking => {
          const counterparty = isCitizen
            ? booking.provider?.name || 'Service Provider'
            : booking.citizen?.name || 'Citizen';
          const latestMessage = booking.lastMessage?.content;
          const bookingDate = formatShortDate(booking.bookingDate);
          const isActive = selectedBooking?._id === booking._id;

          const statusKey = booking.status?.toLowerCase?.() || 'pending';
          return (
            <li
              key={booking._id}
              className={`conversation-item ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="conversation-item__top">
                <div>
                  <p className="conversation-name">{counterparty}</p>
                  <p className="conversation-meta">
                    {booking.service?.title || 'Legal Service'} · {bookingDate}
                  </p>
                </div>
                <div className="conversation-item__status">
                  <span className={`status-pill status-${statusKey}`}>
                    {booking.status || 'Pending'}
                  </span>
                  {booking.rating && (
                    <span className="rating-badge">{booking.rating.rating}★</span>
                  )}
                </div>
              </div>
              <p className="conversation-preview">
                {latestMessage || 'No messages yet. Click to start chatting.'}
              </p>
            </li>
          );
        })}
      </ul>
    );
  };

  const counterpartName = isCitizen
    ? selectedBooking?.provider?.name
    : selectedBooking?.citizen?.name;
  const counterpartEmail = isCitizen
    ? selectedBooking?.provider?.email
    : selectedBooking?.citizen?.email;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Welcome back, {firstName}</p>
          <h1>{heroTitle}</h1>
          <p className="dashboard-subtitle">{heroSubtitle}</p>
          <div className="dashboard-cta">
            {isCitizen ? (
              <>
                <button type="button" onClick={() => navigate('/services')} className="primary-btn">
                  Explore Services
                </button>
                <button type="button" onClick={() => navigate('/leaderboard')} className="ghost-btn">
                  View Leaderboard
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={handleScrollToQueries} className="primary-btn">
                  View citizen queries
                </button>
                <button type="button" onClick={() => navigate('/add-service')} className="ghost-btn">
                  List a new service
                </button>
              </>
            )}
          </div>
        </div>
        <div className="dashboard-profile-card">
          <p className="label">Your Profile</p>
          <h3>{user?.fullName || user?.name}</h3>
          <p className="muted">{user?.email}</p>
          <div className="profile-tags">
            <span>{formattedRole}</span>
            <span>User #{(user?.id || user?._id || '----').toString().slice(-6)}</span>
          </div>
        </div>
      </section>

      {isCitizen && (
        <section className="dashboard-section">
          <h2>Book a service</h2>
          <p className="section-subtitle">Browse services published by verified legal providers.</p>
          {loadingServices ? (
            <p>Loading services...</p>
          ) : services.length === 0 ? (
            <p>No services available yet. Please check back soon.</p>
          ) : (
            <div className="service-grid">
              {services.map(service => (
                <article key={service._id} className="service-card">
                  <div className="service-card__header">
                    <h3>{service.title}</h3>
                    <span className="service-price">₹{service.price}</span>
                  </div>
                  <p className="service-provider">{service.provider?.name || 'Legal Expert'}</p>
                  <p className="service-description">
                    {service.description?.slice(0, 120) || 'Trusted legal help'}
                  </p>
                  <button type="button" onClick={() => navigate(`/service/${service._id}`)}>
                    View details
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="dashboard-section" ref={querySectionRef}>
        <h2>{queryTitle}</h2>
        <p className="section-subtitle">{querySubtitle}</p>

        <div className="conversation-layout">
          <article className="conversation-list">
            <header className="conversation-header">
              <div>
                <p className="label">Open queries</p>
                <strong>{bookings.length}</strong>
              </div>
              <button
                type="button"
                className="refresh-btn"
                disabled={bookingsLoading}
                onClick={handleRefreshBookings}
              >
                {bookingsLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </header>
            {renderQueryList()}
          </article>

          <article className="chat-window">
            {!selectedBooking ? (
              <div className="chat-placeholder">
                <p>Select a query to read the details and start chatting.</p>
              </div>
            ) : (
              <>
                <header className="chat-window__header">
                  <div>
                    <p className="label">Chat with</p>
                    <h3>{counterpartName || 'Participant'}</h3>
                    <p className="chat-subtext">{counterpartEmail || 'Email not shared'}</p>
                  </div>
                  <div className="chat-meta">
                    <span
                      className={`status-pill status-${selectedBooking.status?.toLowerCase?.() || 'pending'}`}
                    >
                      {selectedBooking.status || 'Pending'}
                    </span>
                    <p className="chat-subtext">
                      {selectedBooking.service?.title || 'Service details pending'}
                    </p>
                    {isProvider &&
                      ['Pending', 'Confirmed', 'Resolved'].includes(selectedBooking.status) && (
                        <div className="status-actions">
                          {selectedBooking.status === 'Pending' && (
                            <button
                              type="button"
                              className="status-btn"
                              disabled={updatingStatus}
                              onClick={() => handleBookingStatusChange('Confirmed')}
                            >
                              {updatingStatus ? 'Updating…' : 'Accept booking'}
                            </button>
                          )}
                          {selectedBooking.status === 'Confirmed' && (
                            <button
                              type="button"
                              className="status-btn secondary"
                              disabled={updatingStatus}
                              onClick={() => handleBookingStatusChange('Resolved')}
                            >
                              {updatingStatus ? 'Updating…' : 'Mark resolved'}
                            </button>
                          )}
                          {selectedBooking.status === 'Resolved' && (
                            <button
                              type="button"
                              className="status-btn outline"
                              disabled={updatingStatus}
                              onClick={() => handleBookingStatusChange('Closed')}
                            >
                              {updatingStatus ? 'Updating…' : 'Close query'}
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </header>
                <div className={`chat-messages ${!chatAccessible ? 'locked' : ''}`}>
                  {chatError ? (
                    <p className="conversation-empty">{chatError}</p>
                  ) : chatLoading ? (
                    <p className="conversation-empty">Loading conversation…</p>
                  ) : messages.length === 0 ? (
                    <p className="conversation-empty">No messages yet. Say hello!</p>
                  ) : (
                    messages.map(message => {
                      const isSelf = (user?.id || user?._id) === message.sender?._id;
                      return (
                        <div key={message._id} className={`chat-bubble ${isSelf ? 'self' : ''}`}>
                          <p>{message.content}</p>
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                {chatNotice && !chatError && (
                  <p className="chat-notice">{chatNotice}</p>
                )}
                <form className="chat-input" onSubmit={handleSendMessage}>
                  <textarea
                    rows="2"
                    placeholder="Type your message..."
                    value={messageDraft}
                    onChange={e => setMessageDraft(e.target.value)}
                    disabled={!canSendMessages || sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!canSendMessages || sendingMessage || !messageDraft.trim()}
                  >
                    {sendingMessage ? 'Sending…' : 'Send'}
                  </button>
                </form>
                {isCitizen &&
                  ['Resolved', 'Closed', 'Completed'].includes(selectedBooking.status || '') && (
                    selectedBooking.rating ? (
                      <div className="rating-summary">
                        <p>
                          You rated this service <strong>{selectedBooking.rating?.rating}/5</strong>
                        </p>
                        {selectedBooking.rating?.comment && <p>{selectedBooking.rating.comment}</p>}
                      </div>
                    ) : (
                      <form className="rating-form" onSubmit={handleSubmitRating}>
                        <div>
                          <label htmlFor="rating-value">Rate your experience</label>
                          <select
                            id="rating-value"
                            value={ratingValue}
                            onChange={e => setRatingValue(Number(e.target.value))}
                          >
                            {[5, 4, 3, 2, 1].map(value => (
                              <option key={value} value={value}>
                                {value} Star{value > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          rows="2"
                          placeholder="Share brief feedback (optional)"
                          value={ratingComment}
                          onChange={e => setRatingComment(e.target.value)}
                        />
                        <button type="submit" disabled={submittingRating}>
                          {submittingRating ? 'Submitting…' : 'Submit rating'}
                        </button>
                      </form>
                    )
                  )}
                {isProvider && selectedBooking.rating && (
                  <div className="rating-summary neutral">
                    <p>
                      Citizen rated this query <strong>{selectedBooking.rating?.rating}/5</strong>
                    </p>
                    {selectedBooking.rating?.comment && <p>{selectedBooking.rating.comment}</p>}
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </section>

      {!isCitizen && services.length > 0 && (
        <section className="dashboard-section">
          <h2>Your listed services</h2>
          <p className="section-subtitle">Quick snapshot of the offerings citizens can view.</p>
          <div className="service-grid">
            {services.map(service => (
              <article key={service._id} className="service-card">
                <div className="service-card__header">
                  <h3>{service.title}</h3>
                  <span className="service-price">₹{service.price}</span>
                </div>
                <p className="service-description">
                  {service.description?.slice(0, 140) || 'Legal service'}
                </p>
                <button type="button" onClick={() => navigate(`/service/${service._id}`)}>
                  View details
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatShortDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  });
}

function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default Dashboard;
