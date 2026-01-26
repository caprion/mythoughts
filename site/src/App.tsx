import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Article from './pages/Article';
import AILab from './pages/AILab';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/ai-lab" element={<AILab />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
