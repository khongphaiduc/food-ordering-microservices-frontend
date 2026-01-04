import { BrowserRouter, Routes, Route ,Navigate} from "react-router-dom";
import Login from "./components/loginpage/login";
import "./components/homepage/home.css"
import Home from "./components/homepage/homepage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
 