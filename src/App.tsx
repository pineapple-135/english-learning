import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import StudyPlanPage from './pages/StudyPlan'
import VocabularyPage from './pages/Vocabulary'
import GrammarPage from './pages/Grammar'
import ReadingPage from './pages/Reading'
import ListeningPage from './pages/Listening'
import ExamCenter from './pages/ExamCenter'
import Leaderboard from './pages/Leaderboard'
import Shop from './pages/Shop'
import Achievements from './pages/Achievements'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/exam" element={<ExamCenter />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
