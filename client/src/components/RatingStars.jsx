import React from 'react';

function RatingStars({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? '#facc15' : '#e2e8f0', fontSize: '1.3rem' }}>
        ★
      </span>
    );
  }
  return <span>{stars}</span>;
}

export default RatingStars;
