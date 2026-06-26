import { useState } from 'react';

function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ text: '', isError: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 3) {
      setStatus({ text: "Please enter a valid name.", isError: true });
      return;
    }
    if (!formData.email.includes("@")) {
      setStatus({ text: "Please enter a valid email address.", isError: true });
      return;
    }

    
    setStatus({ text: "Message sent successfully! We will contact you soon.", isError: false });
    setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
  };

  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch With <span>AstraCore</span></h1>
          <p>We’re here to help you build powerful systems and premium PC solutions.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Full Name" required />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email Address" required />
            </div>
            
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" id="subject" required />
            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Write your message here..." id="message" required></textarea>

            <button type="submit" className="send-btn">Send Message</button>

            {status.text && (
              <p className="form-status" style={{ color: status.isError ? 'red' : 'green', marginTop: '15px', fontWeight: 'bold' }}>
                {status.text}
              </p>
            )}
          </form>
        </div>

        <div className="contact-info">
          <div className="info-box">
            <i className="fa-solid fa-location-dot"></i>
            <div>
              <h4>Visit Us</h4>
              <p>Mumbai, Maharashtra, India</p>
            </div>
          </div>
          <div className="info-box">
            <i className="fa-solid fa-phone"></i>
            <div>
              <h4>Call Us</h4>
              <p>+91 90000 00000</p>
            </div>
          </div>
          <div className="info-box">
            <i className="fa-solid fa-envelope"></i>
            <div>
              <h4>Email Us</h4>
              <p>support@astracore.in</p>
            </div>
          </div>
          <div className="info-box">
            <i className="fa-brands fa-whatsapp"></i>
            <div>
              <h4>WhatsApp</h4>
              <p>Chat with our sales team</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactUs;