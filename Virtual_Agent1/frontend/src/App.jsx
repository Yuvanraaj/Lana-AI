import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import SelectMode from "./pages/SelectMode";
import Interview from "./pages/Interview";
import AgentPage from "./pages/Agent";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import Chatbot from "./pages/Chatbot";
import AnalyticsPage from "./pages/Analytics";
import ProgressDashboard from "./pages/ProgressDashboard";
import JudgeView from "./pages/JudgeView";
import CodePractice from "./pages/CodePractice";

function Router() {
  return (
    <div>
      <Navbar />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        {/* Protected Routes - handle auth internally */}
        <Route path="/profile" component={UserProfile} />
        <Route path="/progress" component={ProgressDashboard} />
        {/* Public Routes */}
        <Route path="/start" component={SelectMode} />
        <Route path="/agent" component={AgentPage} />
        <Route path="/interview" component={Interview} />
        <Route path="/resume-parse" component={ResumeAnalyzerPage} />
        <Route path="/chatbot" component={Chatbot} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/judge" component={JudgeView} />
        <Route path="/code-practice" component={CodePractice} />
      </Switch>
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
