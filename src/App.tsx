import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                  SchoolOS
                </h1>
                <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
                  Mobile-First School Management System
                </p>
                <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
                  Phase 1 Infrastructure Setup Complete ✓
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
