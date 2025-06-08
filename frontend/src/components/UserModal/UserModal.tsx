import React from 'react';
import { User } from '../../types/user.types';
import styles from './UserModal.module.css';

interface UserModalProps {
  user: User | null;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const mapUrl = `https://www.google.com/maps?q=${user.address.geo.lat},${user.address.geo.lng}`;

  return (
    <button 
      className={styles.modalOverlay} 
      onClick={onClose}
      aria-label="Close modal"
    >
      <button 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        aria-label="Modal content"
      >
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close modal"
          tabIndex={0}
        >×</button>
        
        <div className={styles.modalContent}>
          <h2 className={styles.title}>{user.name}</h2>
          <p className={styles.emailTop}>{user.email}</p>
          
          <div className={styles.section}>
            <h3>Address</h3>
            <p>{user.address.street}, {user.address.suite}</p>
            <p>{user.address.city}, {user.address.zipcode}</p>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
              <span className={styles.mapPin}>📍</span> View on map
            </a>
          </div>

          <div className={styles.section}>
            <h3>Contact</h3>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Website:</strong> <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website}</a></p>
          </div>

          <div className={styles.section}>
            <h3>Company</h3>
            <p><strong>Name:</strong> {user.company.name}</p>
            <p><strong>Catchphrase:</strong> {user.company.catchPhrase}</p>
            <p><strong>Business:</strong> {user.company.bs}</p>
          </div>
        </div>
      </button>
    </button>
  );
}; 