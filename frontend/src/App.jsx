import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Login from './Login';       
import Register from './Register'; 
import Verify from './Verify';     
import Checkout from './Checkout';
import BuildPC from './BuildPC'; 
import Trending from './Trending';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import MyOrders from './MyOrders';

import Wishlist from './Wishlist';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import AxiosInterceptor from './AxiosInterceptor';

function App() {

  return (
    <Router>
      <AxiosInterceptor />
      <Navbar /> 
      
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />       
          <Route path="/register" element={<Register />} /> 
          <Route path="/verify" element={<Verify />} />   
          <Route path="/build-pc" element={<BuildPC />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} /> 
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;