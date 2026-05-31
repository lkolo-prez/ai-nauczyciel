import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Practice from './pages/Practice';
import KnowledgeMap from './pages/KnowledgeMap';
import Tutor from './pages/Tutor';
import Simulator from './pages/Simulator';
import Profile from './pages/Profile';

export default function App() {
  return (
    // Mobile-first shell, centred on larger screens to preview as a phone.
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-ink/40 sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl sm:overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/cwicz" element={<Practice />} />
          <Route path="/mapa" element={<KnowledgeMap />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/symulator" element={<Simulator />} />
          <Route path="/profil" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
