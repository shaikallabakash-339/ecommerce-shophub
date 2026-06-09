import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${API_BASE}/products`, { params });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products/categories/list`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPage(1);
  };

  return (
    <div className="home-page">
      <section className="banner">
        <h1>Welcome to ShopHub</h1>
        <p>Discover amazing products at great prices</p>
      </section>

      <section className="shopping-section">
        <aside className="sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="categories">
            <h3>Categories</h3>
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <div className="products-container">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">No products found</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={products.length < 12}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
