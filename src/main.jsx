import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import WishForm from "./pages/WishForm";
import WishPool from "./pages/WishPool";
import WishCardDetail from "./pages/WishCardDetail";
import Leaderboard from "./pages/Leaderboard";
import MemberPage from "./pages/MemberPage";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Progress from "./pages/Progress";
import Message from "./pages/Message";
import Transaction from "./pages/Transaction";
import "./index.css";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="WishForm" element={<WishForm />} />
        <Route path="WishPool" element={<WishPool />} />
        <Route path="WishCardDetail/:id" element={<WishCardDetail />} />
        <Route path="Leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/MemberPage" element={<MemberPage />}>
        <Route path="Profile" element={<Profile />} />
        <Route path="Favorites" element={<Favorites />} />
        <Route path="Progress" element={<Progress />} />
        <Route path="Message" element={<Message />} />
        <Route path="Transaction" element={<Transaction />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
