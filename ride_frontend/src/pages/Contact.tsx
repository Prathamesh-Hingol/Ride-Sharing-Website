import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../components/Button';
import axiosInstance from '../api/axiosInstance';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Matches ride_backend/src/routes/supportRoutes.js → POST /contact
      await axiosInstance.post('/contact', formData);
      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[110px] top-16 -left-16 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-10 -right-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-center mb-4 text-ink">Get in Touch</h1>
          <p className="text-center text-ink-variant mb-14">
            Questions, feedback, or an issue to report? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="glass-strong rounded-md p-8">
              <h2 className="font-display text-xl font-semibold mb-6 text-ink">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="glass rounded-lg p-2.5 mr-3">
                    <Mail className="w-5 h-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">Email</h3>
                    <p className="text-sm text-ink-variant">support@rideshare.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="glass rounded-lg p-2.5 mr-3">
                    <Phone className="w-5 h-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">Phone</h3>
                    <p className="text-sm text-ink-variant">+91 91566 13991</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="glass rounded-lg p-2.5 mr-3">
                    <MapPin className="w-5 h-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">Address</h3>
                    <p className="text-sm text-ink-variant">IIT Indore, 452020</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/60">
                <h2 className="font-display text-lg font-semibold mb-3 text-ink">Office Hours</h2>
                <p className="text-sm text-ink-variant">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-sm text-ink-variant">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="text-sm text-ink-variant">Sunday: Closed</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-strong rounded-md p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                    Name
                  </label>
                  <div className="glass-input rounded-lg">
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-transparent px-4 py-2.5 focus:outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                    Email
                  </label>
                  <div className="glass-input rounded-lg">
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-transparent px-4 py-2.5 focus:outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-ink mb-1.5">
                    Subject
                  </label>
                  <div className="glass-input rounded-lg">
                    <input
                      type="text"
                      id="subject"
                      className="w-full bg-transparent px-4 py-2.5 focus:outline-none"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">
                    Message
                  </label>
                  <div className="glass-input rounded-lg">
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full bg-transparent px-4 py-2.5 focus:outline-none resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {status.message && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium ${
                      status.type === 'success'
                        ? 'bg-secondary/10 text-secondary-dark border border-secondary/30'
                        : 'bg-danger/10 text-danger border border-danger/20'
                    }`}
                    role="alert"
                  >
                    {status.message}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={submitting}>
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
