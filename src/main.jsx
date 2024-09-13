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
        <Route path="wishForm" element={<WishForm />} />
        <Route path="wishPool" element={<WishPool />} />
        <Route path="wishcarddetail/:id" element={<WishCardDetail />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/memberpage" element={<MemberPage />}>
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="progress" element={<Progress />} />
          <Route path="message" element={<Message />} />
          <Route path="transaction" element={<Transaction />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
