import React from 'react';
import { User } from '../../types/user.types';
import styles from './UserTable.module.css';

interface UserTableProps {
  users: User[];
  onUserClick: (user: User) => void;
  onDeleteUser: (userId: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onUserClick, onDeleteUser }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name / Email</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles.tableRow}>
              <td>
                <div className={styles.userInfo}>
                  <div className={styles.name}>{user.name}</div>
                  <div className={styles.email}>{user.email}</div>
                </div>
              </td>
              <td>
                <div className={styles.address}>
                  {user.address.street}, {user.address.suite}
                  <br />
                  {user.address.city}, {user.address.zipcode}
                </div>
              </td>
              <td>{user.phone}</td>
              <td>
                <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">
                  {user.website}
                </a>
              </td>
              <td>{user.company.name}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => onUserClick(user)}
                  >
                    View
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDeleteUser(user.id)}
                    aria-label="Delete user"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 