import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import SelectMode from "./pages/SelectMode";
import Interview from "./pages/Interview";
import AgentPage from "./pages/Agent";
import ResumeParse from "./pages/ResumeParse";
import Chatbot from "./pages/Chatbot";
import AnalyticsPage from "./pages/Analytics";
import ProgressDashboard from "./pages/ProgressDashboard";

// Note: UserProfile and ProgressDashboard handle their own authentication checks
// in their useEffect hooks, so we don't need a wrapper component here

function Router() {
  return (
    <div>
      <Navbar />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        {/* Protected Routes - Handle auth internally */}
        <Route path="/profile" component={UserProfile} />
        <Route path="/progress" component={ProgressDashboard} />
        {/* Public Routes */}
        <Route path="/start" component={SelectMode} />
        <Route path="/agent" component={AgentPage} />
        <Route path="/interview" component={Interview} />
        <Route path="/resume-parse" component={ResumeParse} />
        <Route path="/chatbot" component={Chatbot} />
        <Route path="/analytics" component={AnalyticsPage} />
      </Switch>
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
