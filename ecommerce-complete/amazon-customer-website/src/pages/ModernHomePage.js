import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModernHeader from '../components/ModernHeader';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import FilterSidebar from '../components/FilterSidebar';
import '../styles/HomePage.css';

const HomePage = () => {
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchParams] = useSearchParams();
  const [filterOptions, setFilterOptions] = useState({});
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE}/products/filters/options`);
        setFilterOptions(response.data);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Load products based on filters and search params
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          ...filters,
          page: currentPage,
          limit: 12,
          ...Object.fromEntries(searchParams)
        });

        const response = await axios.get(`${API_BASE}/products?${params}`);
        setProducts(response.data.products);
        setTotalProducts(response.data.total);

        // Save search history if search exists
        if (searchParams.get('search')) {
          const token = localStorage.getItem('authToken');
          if (token) {
            await axios.post(
              `${API_BASE}/search-history/add`,
              { query: searchParams.get('search') },
              { headers: { Authorization: `Bearer ${token}` } }
            ).catch(err => console.log('Search history error:', err));
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, currentPage, searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const saleProducts = products.filter(p => p.is_on_sale);

  return (
    <div className="fashion-home">
      <ModernHeader />

      {currentPage === 1 && !searchParams.get('search') && (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to FashionHub</h1>
              <p className="hero-subtitle">Discover the Latest Trends in Fashion</p>
              <p className="hero-desc">Premium clothing for Men, Women & Kids at unbeatable prices</p>
              <Link to="/browse" className="hero-btn">Start Shopping 🛍️</Link>
            </div>
            <div className="hero-background">
              <div className="hero-gradient"></div>
            </div>
          </section>

          {/* Sale Section */}
          {saleProducts.length > 0 && (
            <section className="sale-section">
              <h2 className="section-title">🔥 Hot Sale Items</h2>
              <ProductCarousel products={saleProducts.slice(0, 6)} />
            </section>
          )}
        </>
      )}

      <div className="products-container">
        {/* Filters */}
        <FilterSidebar
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        {/* Products Grid */}
        <div className="products-section">
          <div className="section-header">
            <h2>{searchParams.get('search') ? `Search Results for "${searchParams.get('search')}"` : 'Our Collection'}</h2>
            <p className="product-count">Showing {products.length} products</p>
          </div>

          {loading ? (
            <div className="loader">Loading products...</div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                {currentPage > 1 && (
                  <button onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">
                    ← Previous
                  </button>
                )}
                <span className="page-info">Page {currentPage}</span>
                {products.length >= 12 && (
                  <button onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">
                    Next →
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>No products found. Try adjusting your filters.</p>
              <Link to="/browse" className="reset-btn">Browse All</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
