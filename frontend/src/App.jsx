import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Pages
import LandingScreen from "../PublicScreens/landingScreen";
import Login from "../AdminScreens/loginScreen";
import AdminHome from "../AdminScreens/adminHomeScreen";
import FixtureScreen from "../PublicScreens/fixtureScreen";
import ResultScreen from "../PublicScreens/resultScreen";
import AddFixtureScreen from "../AdminScreens/addFixtureScreen";
import AddResultScreen from "../AdminScreens/addResultScreen";
import ManageFixtureScreen from "../AdminScreens/manageFixtureScreen";
import ManageResultScreen from "../AdminScreens/manageResultScreen";
import EditFixtures from "../AdminScreens/editFixtureScreen";
import EditResults from "../AdminScreens/editResultScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingScreen />} />

        {/* ADMIN ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin-home-screen" element={<AdminHome />} />
        <Route path="/add-fixture" element={<AddFixtureScreen />} />
        <Route path="/add-result" element={<AddResultScreen />} />
        <Route path="/manage-fixtures" element={<ManageFixtureScreen />} />
        <Route path="/manage-results" element={<ManageResultScreen />} />
        <Route path="/edit-fixtures/:fixtureId" element={<EditFixtures />} />
        <Route path="/edit-results/:resultId" element={<EditResults />} />

        {/* PUBLIC ROUTES */}
        <Route path="/fixtures" element={<FixtureScreen />} />
        <Route path="/results" element={<ResultScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
