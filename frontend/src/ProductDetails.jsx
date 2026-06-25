import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  useEffect(() => {
    const syncUser = () => {
      try { setCurrentUser(JSON.parse(localStorage.getItem('user'))); } catch { setCurrentUser(null); }
    };
    window.addEventListener('authUpdated', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('authUpdated', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/products/details/${slug}`)
      .then(res => {
        const p = res.data;
        setProduct({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          old_price: p.oldPrice || null,
          category: p.category ? p.category.name : "Hardware",
          is_trending: p.isTrending || false,
          stock_status: p.stockStatus || "In Stock",
          sku: `ASTRA-${p.id}00${p.id}`,
          description: p.description || "High-performance AstraCore component.",
          socket: p.socket,
          specs: p.specs,
          wattage: p.wattage,
          images: [p.image || '/pc-computer.png']
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product && product.id) {
      axios.get(`http://localhost:8080/api/reviews/${product.id}`)
        .then(res => setReviews(res.data))
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [product]);

  const handleThumbnailClick = (imgSrc) => {
    setMainImage(imgSrc);
  };

  const handleQuantity = (type) => {
    if (type === 'minus' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'plus' && quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!currentUser || !currentUser.token) {
      alert("Please log in or register to add items to your cart!");
      navigate('/login');
      return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${quantity}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!currentUser || !currentUser.token) {
      alert("Please log in or register to purchase items!");
      navigate('/login');
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a comment.");
    
    setIsSubmitting(true);
    
    axios.post(`http://localhost:8080/api/reviews/${product.id}`, 
      { rating, comment }, 
      { headers: { Authorization: `Bearer ${currentUser.token}` } }
    )
    .then(() => {
      alert("Review posted successfully!");
      setComment("");
      setRating(5);
      return axios.get(`http://localhost:8080/api/reviews/${product.id}`);
    })
    .then(res => setReviews(res.data))
    .catch(err => {
      alert(err.response?.data?.error || "Failed to post review. Please try again.");
    })
    .finally(() => setIsSubmitting(false));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px' }}>Product not found. <br/><Link to="/products" style={{color: 'var(--primary)', fontSize: '16px'}}>Return to Shop</Link></div>;

  return (
    <div className="product-details-container">
      
      <div className="product-details-wrapper">
        
        <div className="product-image-gallery">
          <div className="main-image-container">
            <img src={mainImage || '/pc-computer.png'} alt={product.name} onError={(e) => e.target.src = '/pc-computer.png'} />
          </div>
          
          <div className="thumbnail-list">
            {product.images.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(img)}
              >
                <img src={img} alt={`${product.name} View ${index + 1}`} onError={(e) => e.target.src = '/pc-computer.png'} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-info-section">
          
          <div className="product-badges">
            {product.is_trending && <span className="badge trending">Trending</span>}
            <span className={`badge ${product.stock_status === 'In Stock' ? 'stock' : 'out-stock'}`}>
              {product.stock_status}
            </span>
          </div>

          <h1>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ color: '#f1c40f', fontSize: '14px' }}>
              {[...Array(5)].map((_, i) => (
                <i key={i} className={i < Math.round(averageRating) ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setActiveTab('reviews')}>
              {averageRating > 0 ? `${averageRating} / 5.0 (${reviews.length} Reviews)` : "No reviews yet"}
            </span>
          </div>
          
          <div className="price-block">
            <span className="new-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.old_price && (
              <>
                <span className="old-price">₹{product.old_price.toLocaleString('en-IN')}</span>
                <span className="discount-badge">
                  {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="short-description">{product.description}</p>

          <div className="quantity-selector">
            <span style={{ fontWeight: 600 }}>Quantity:</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => handleQuantity('minus')}>-</button>
              <input type="text" className="qty-input" value={quantity} readOnly />
              <button className="qty-btn" onClick={() => handleQuantity('plus')}>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={handleAddToCart}>
              <i className="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <button className="btn-buy-now" onClick={handleBuyNow}>
              <i className="fa-solid fa-bolt"></i> Buy Now
            </button>
          </div>

          <div className="product-meta">
            <p>Category: <span style={{color: 'var(--text-main)'}}>{product.category}</span></p>
            <p>SKU: <span style={{color: 'var(--text-main)'}}>{product.sku}</span></p>
          </div>

        </div>
      </div>

      <div className="product-tabs">
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
            Description
          </button>
          <button className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`} onClick={() => setActiveTab('specifications')}>
            Specifications
          </button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews ({reviews.length})
          </button>
        </div>

        <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`}>
          <h3>Product Overview</h3>
          <p style={{ marginTop: '15px' }}>{product.description}</p>
          <p style={{ marginTop: '10px' }}>Experience seamless gaming and rendering with the latest architecture. Designed to handle the most demanding tasks without breaking a sweat, ensuring your system stays cool under pressure.</p>
        </div>

        <div className={`tab-content ${activeTab === 'specifications' ? 'active' : ''}`}>
          <h3>Technical Specifications</h3>
          <ul style={{ marginTop: '15px', marginLeft: '20px', lineHeight: '2' }}>
            <li><strong>Brand:</strong> AstraCore Hardware</li>
            <li><strong>Model:</strong> {product.sku}</li>
            {product.socket && <li><strong>Socket:</strong> {product.socket}</li>}
            {product.specs && <li><strong>Key Specs:</strong> {product.specs}</li>}
            {product.wattage && <li><strong>TDP / Power Draw:</strong> {product.wattage}W</li>}
            <li><strong>Warranty:</strong> 3 Years Manufacturer Warranty</li>
          </ul>
        </div>

        <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            
            <div style={{ flex: '1 1 500px' }}>
              <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Customer Reviews</h3>
              
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px', background: 'var(--bg-light)', borderRadius: '8px' }}>
                  There are no reviews for this product yet. Be the first to review!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)', fontSize: '15px', display: 'block' }}>{review.username}</strong>
                          <div style={{ color: '#f1c40f', fontSize: '12px', marginTop: '3px' }}>
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={i < review.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                            ))}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: '1 1 300px', background: 'var(--bg-light)', padding: '30px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)' }}>Write a Review</h4>
              
              {!currentUser ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: '32px', color: 'var(--border-color)', marginBottom: '15px' }}></i>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>You must be logged in to leave a review.</p>
                  <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
                    Log In Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Your Rating</label>
                    <div style={{ display: 'flex', gap: '5px', fontSize: '24px', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                          key={star}
                          className={(hoveredStar || rating) >= star ? "fa-solid fa-star" : "fa-regular fa-star"}
                          style={{ color: (hoveredStar || rating) >= star ? '#f1c40f' : 'var(--border-color)', transition: 'color 0.2s' }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setRating(star)}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Your Review</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike?"
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;