import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/public/Home';
import Projects from '@/pages/public/Projects';
import ProjectDetail from '@/pages/public/ProjectDetail';
import Contact from '@/pages/public/Contact';
import AdminLogin from '@/pages/admin/Login';
import ProjectsTab from '@/pages/admin/ProjectsTab';
import SkillsTab from '@/pages/admin/SkillsTab';
import ExperiencesTab from '@/pages/admin/ExperiencesTab';
import MessagesTab from '@/pages/admin/MessagesTab';

export default function App() {
    return (
        <>
        <Toaster position="bottom-right" theme="dark" richColors />
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:slug" element={<ProjectDetail />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/projects" replace />} />
                    <Route path="projects" element={<ProjectsTab />} />
                    <Route path="skills" element={<SkillsTab />} />
                    <Route path="experiences" element={<ExperiencesTab />} />
                    <Route path="messages" element={<MessagesTab />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
        </>
    );
}
