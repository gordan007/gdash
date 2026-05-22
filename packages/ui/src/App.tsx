import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { GdashProvider } from "./context/GdashContext.js";
import { AppShell } from "./layouts/AppShell.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { HomePage } from "./pages/HomePage.js";
import { ProjectDashboardPage } from "./pages/ProjectDashboardPage.js";
import { ProjectCostsPage } from "./pages/ProjectCostsPage.js";
import { GlobalCostsPage } from "./pages/GlobalCostsPage.js";
import { WizardPage } from "./pages/WizardPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { ProjectSettingsPage } from "./pages/ProjectSettingsPage.js";
import "./styles/globals.css";

export function App() {
  return (
    <ErrorBoundary>
      <GdashProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="projects" element={<Navigate to="/" replace />} />
              <Route path="projects/new" element={<ErrorBoundary><WizardPage /></ErrorBoundary>} />
              <Route path="projects/:slug" element={<ErrorBoundary><ProjectDashboardPage /></ErrorBoundary>} />
              <Route path="projects/:slug/costs" element={<ErrorBoundary><ProjectCostsPage /></ErrorBoundary>} />
              <Route path="projects/:slug/settings" element={<ErrorBoundary><ProjectSettingsPage /></ErrorBoundary>} />
              <Route path="costs" element={<ErrorBoundary><GlobalCostsPage /></ErrorBoundary>} />
              <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </GdashProvider>
    </ErrorBoundary>
  );
}
