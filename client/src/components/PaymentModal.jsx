import React from 'react';
import Checkout from '../Checkout';

/**
 * PaymentModal
 * Seamless wrapper around Checkout component to maintain full backward compatibility
 * with all existing views and routes.
 */
export default function PaymentModal({ book, isOpen, onClose, onSuccess }) {
  if (!isOpen || !book) return null;

  return (
    <Checkout
      book={book}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
