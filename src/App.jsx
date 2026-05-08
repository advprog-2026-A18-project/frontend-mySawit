import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './modules/auth/pages/Register';
import Users from './modules/auth/pages/Users';
import KebunList from './modules/manajemen_kebun_sawit/pages/KebunList';
import KebunForm from './modules/manajemen_kebun_sawit/pages/KebunForm';
import KebunDetail from './modules/manajemen_kebun_sawit/pages/KebunDetail';
import AssignUser from './modules/manajemen_kebun_sawit/pages/AssignUser';
import MoveUser from './modules/manajemen_kebun_sawit/pages/MoveUser';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<Users />} />
        <Route path="/kebun" element={<KebunList />} />
        <Route path="/kebun/new" element={<KebunForm />} />
        <Route path="/kebun/:kode/edit" element={<KebunForm />} />
        <Route path="/kebun/:kode" element={<KebunDetail />} />
        <Route path="/kebun/:kode/assign/:type" element={<AssignUser />} />
        <Route path="/kebun/:kode/move/:type/:userId?" element={<MoveUser />} />
        <Route path="/" element={<Navigate to="/kebun" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;