import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('title');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:8082/api/books');
      if (searchQuery) {
        url.searchParams.append('query', searchQuery);
        url.searchParams.append('filterBy', filterBy);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Basic ${user.basicAuth}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        setHasSearched(!!searchQuery);
      } else {
        setError('Failed to fetch books');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading inventory...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="header-row">
        <h2>Inventory Dashboard</h2>
        {['ADMIN', 'MANAGER'].includes(user.role) && (
          <button className="btn">Add New Book</button>
        )}
      </div>

      <div className="search-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder={`Search by ${filterBy}...`} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
          style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
        <select 
          value={filterBy} 
          onChange={(e) => setFilterBy(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="genre">Genre</option>
        </select>
        <button className="btn btn-primary" onClick={fetchBooks}>Search</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>
                <span style={{ 
                  color: book.quantity < 5 ? 'var(--danger)' : 'var(--text-primary)',
                  fontWeight: book.quantity < 5 ? 'bold' : 'normal'
                }}>
                  {book.quantity}
                </span>
              </td>
              <td>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', fontSize: '0.875rem' }}>Edit</button>
                {['ADMIN'].includes(user.role) && (
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
          {books.length === 0 && !loading && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                {hasSearched ? `No results found for '${searchQuery}' in ${filterBy}` : 'No books in inventory'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
