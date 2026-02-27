import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Planning from './pages/Planning';
import Shooting from './pages/Shooting';
import PostProduction from './pages/PostProduction';
import JoinProject from './pages/JoinProject';
import './App.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ideation" element={<Ideation />} />
          <Route path="/ideation/:projectId" element={<Ideation />} />
          <Route path="/planning/:projectId" element={<Planning />} />
          <Route path="/shooting/:projectId" element={<Shooting />} />
          <Route path="/post-production/:projectId" element={<PostProduction />} />
          <Route path="/join/:projectId" element={<JoinProject />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;