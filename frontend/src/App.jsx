import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import Login from './Login';
import Register from './Register';
import Cart from './Cart'; 

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/cart" element={<Cart />} /> 
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;