import React, { useState } from 'react';
import './BookingForm.css';

function BookingForm({ onBook, ctaLabel = 'Book consultation' }) {
  const [date, setDate] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (onBook) onBook(date);
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>
        Preferred booking date
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </label>
      <button type="submit">{ctaLabel}</button>
    </form>
  );
}

export default BookingForm;
