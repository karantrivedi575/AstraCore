import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;