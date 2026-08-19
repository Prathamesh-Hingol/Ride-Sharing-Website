import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Find from "./pages/Find";
import Offer from "./pages/Offer";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Safety from "./pages/Safety";
import BookRide from "./pages/BookRide";
import BookingSuccess from "./pages/BookingSuccess";
import GroupMembers from "./pages/GroupMembers";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ParallaxProvider } from "react-scroll-parallax";
import Chat from "./pages/Chats";

// Note: manual Sign Up was removed — the backend only supports Google OAuth
// (see ride_backend/src/routes/loginRoutes.js), so /signup now redirects to /signin.
function App() {
  return (
    <ParallaxProvider>
      <Router>
        {/* AuthProvider is inside Router so it can use useLocation()
            to detect the ?status=success redirect from Google OAuth */}
        <AuthProvider>
          <div className="lumina-bg min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<Navigate to="/signin" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/safety" element={<Safety />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/find" element={<Find />} />
                  <Route path="/offer" element={<Offer />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book-ride" element={<BookRide />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route path="/rides/:rideID/group" element={<GroupMembers />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:rideID" element={<Chat />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ParallaxProvider>
  );
}

export default App;
