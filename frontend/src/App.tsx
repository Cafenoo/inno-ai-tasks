import React, { useState, useEffect } from 'react';
import { User } from './types/user.types';
import { UserTable } from './components/UserTable/UserTable';
import { UserModal } from './components/UserModal/UserModal';
import { userService } from './services/userService';
import styles from './App.module.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>User Directory</h1>
      </header>
      <main className={styles.main}>
        <UserTable
          users={users}
          onUserClick={handleUserClick}
          onDeleteUser={handleDeleteUser}
        />
      </main>
      <UserModal
        user={selectedUser}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
