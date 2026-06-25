import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [initialProducts, setInitialProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 8; 

  const categoriesList = [
    { name: 'Processors', slug: 'processors' },
    { name: 'Graphics Cards', slug: 'graphic-cards' },
    { name: 'Motherboards', slug: 'motherboards' },
    { name: 'Memory (RAM)', slug: 'memory' }
  ];

  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(100000); 
  const [sortOrder, setSortOrder] = useState('Latest');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      axios.get('http://localhost:8080/api/wishlist', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => {
        const ids = res.data.map(item => item.id);
        setWishlistIds(ids);
      })
      .catch(err => console.error("Error fetching wishlist:", err));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    
    axios.get('http://localhost:8080/api/products?page=0&size=1000')
      .then(res => {
        const fetchedProducts = res.data.products.map(p => ({
          ...p,
          category: p.category ? p.category.slug : '', 
          is_trending: p.isTrending !== undefined ? p.isTrending : p.is_trending,
          old_price: p.oldPrice !== undefined ? p.oldPrice : p.old_price,
          stock_status: p.stockStatus !== undefined ? p.stockStatus : p.stock_status || 'In Stock'
        }));
        
        setInitialProducts(fetchedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []); 

  useEffect(() => {
    let filtered = [...initialProducts];

    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    filtered = filtered.filter(p => p.price <= priceRange);

    if (sortOrder === 'Price: Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'Price: High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    const startIndex = currentPage * pageSize;
    let paginated = filtered.slice(startIndex, startIndex + pageSize);

    if (paginated.length === 0 && filtered.length > 0) {
      setCurrentPage(0);
      paginated = filtered.slice(0, pageSize);
    }

    setProducts(paginated);
  }, [selectedCategories, priceRange, sortOrder, searchQuery, initialProducts, currentPage]);

  const handleCategoryChange = (slug) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const handleToggleWishlist = (e, productId) => {
    e.preventDefault(); 
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert("Please log in to save items to your wishlist!");
      navigate('/login');
      return;
    }

    if (wishlistIds.includes(productId)) {
      setWishlistIds(wishlistIds.filter(id => id !== productId));
    } else {
      setWishlistIds([...wishlistIds, productId]);
    }

    axios.post(`http://localhost:8080/api/wishlist/toggle/${productId}`, {}, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .catch(err => {
      console.error("Wishlist error:", err);
      alert("Failed to update wishlist.");
    });
  };

  const handleAddToCart = (product, e) => {
    if (e) e.preventDefault(); 

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert("Please log in or register to add items to your cart!");
      navigate('/login'); 
      return; 
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated')); 
    alert(`${product.name} added to cart!`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  return (
    <section className="products-page">
      <div className="products-container">
        
        <div className="products-header">
          <div>
            <h1>Explore Our Products</h1>
            <p>High-performance hardware for gamers & professionals.</p>
          </div>
          <div className="products-controls">
            <span>Showing {products.length} products on this page </span>
            <select id="sortSelect" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="Latest">Sort by Latest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          
          <aside className="products-sidebar">
            <div className="filter-box">
              <h4>Categories</h4>
              {categoriesList.map(cat => (
                <label key={cat.slug}>
                  <input 
                    type="checkbox" 
                    value={cat.slug} 
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryChange(cat.slug)}
                  /> {cat.name}
                </label>
              ))}
            </div>

            <div className="filter-box">
              <h4>Price Range</h4>
              <input 
                type="range" 
                min="1000" 
                max="100000" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="price-value">Up to ₹{priceRange.toLocaleString('en-IN')}</div>
            </div>
          </aside>

          <div className="products-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', width: '100%', gridColumn: '1 / -1' }}>
                <h3>Loading hardware from database...</h3>
              </div>
            ) : products.length > 0 ? (
              products.map(product => (
                <div className="product-card" key={product.id} style={{ position: 'relative' }}>
                  
                  <button 
                    onClick={(e) => handleToggleWishlist(e, product.id)}
                    style={{
                      position: 'absolute', top: '15px', right: '15px', zIndex: 10,
                      background: '#fff', border: 'none', borderRadius: '50%', 
                      width: '35px', height: '35px', cursor: 'pointer', 
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      color: wishlistIds.includes(product.id) ? '#ff4e4e' : '#ccc',
                      transition: '0.2s'
                    }}
                  >
                    <i className={`${wishlistIds.includes(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ fontSize: '16px' }}></i>
                  </button>

                  <div className="product-image">
                    {product.is_trending && <span className="product-badge">Trending</span>}
                    <img src={product.image || '/pc-computer.png'} alt={product.name} onError={(e) => e.target.src = '/pc-computer.png'} />
                  </div>

                  <div className="product-info">
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3>{product.name}</h3>
                    </Link>
                    <div className="stock-status in-stock">
                      <i className="fa-solid fa-circle-check"></i> {product.stock_status}
                    </div>
                    
                    <div className="product-price">
                      {product.old_price && <span className="old-price">₹{product.old_price.toLocaleString('en-IN')}</span>}
                      <span className="new-price">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="product-actions">
                      <button className="add-cart-btn" onClick={(e) => handleAddToCart(product, e)}>
                        <i className="fa-solid fa-cart-plus"></i>
                      </button>
                      <Link to={`/product/${product.slug}`} className="buy-now-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fa-solid fa-microchip-slash"></i>
                <h3>No Hardware Found</h3>
                {searchQuery ? (
                  <>
                    <p>We couldn't find any components matching "<strong>{searchQuery}</strong>".</p>
                    <Link to="/products" className="btn-clear" onClick={() => window.location.search = ''}>Clear Search</Link>
                  </>
                ) : (
                  <p>Try adjusting your price range or categories.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 0}>
              <i className="fa-solid fa-arrow-left"></i> Prev
            </button>
            <button className="active" style={{ pointerEvents: 'none' }}>
              Page {currentPage + 1} of {totalPages}
            </button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
              Next <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default ProductList;