import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import PrivateRoute from "./components/PrivateRoute";
import { UnreadMessagesProvider } from "./Context/UnreadMessagesContext.jsx";
import { WishesProvider } from "./Context/WishesContext.jsx";
import "./index.css";
import Category from "./pages/Category";
import Chat from "./pages/Chat";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import MemberPage from "./pages/MemberPage";
import Message from "./pages/Message";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import WishCardDetail from "./pages/WishCardDetail";
import WishForm from "./pages/WishForm";
import WishPoolWithProvider from "./pages/WishPool";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <UnreadMessagesProvider>
    <WishesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="landingPage" element={<LandingPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="wishForm" element={<WishForm />} />
            <Route path="wishPool" element={<WishPoolWithProvider />} />{" "}
            <Route
              path="wishcarddetail/:id"
              element={
                <WishesProvider>
                  <WishCardDetail />
                </WishesProvider>
              }
            />
            <Route path="category" element={<Category />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route
              path="/memberpage"
              element={
                <PrivateRoute>
                  <MemberPage />
                </PrivateRoute>
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="progress" element={<Progress />} />
              <Route path="message" element={<Message />} />
              <Route path="chat/:id" element={<Chat />} />
              <Route path="transaction" element={<Transaction />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WishesProvider>
  </UnreadMessagesProvider>
);
