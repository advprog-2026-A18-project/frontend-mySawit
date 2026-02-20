import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './modules/auth/pages/Register';
import Users from './modules/auth/pages/Users';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<Users />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;