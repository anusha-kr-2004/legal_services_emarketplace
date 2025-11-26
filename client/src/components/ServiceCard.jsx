import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

function ServiceCard({ title, price, provider, id }) {
  return (
    <div className="service-card">
      <h3>{title}</h3>
      <p>Provider: {provider}</p>
      <p>Price: ₹{price}</p>
      <Link to={`/service/${id}`} className="book-btn">View Details</Link>
    </div>
  );
}

export default ServiceCard;
