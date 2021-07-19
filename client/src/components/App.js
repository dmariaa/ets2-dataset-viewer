import '../styles/App.css';

import { Router } from "@reach/router";

import NavigationBar from "./NavigationBar";
import StatusBar from "./StatusBar";
import Home from '../pages/Home';
import About from '../pages/About';
import Files from '../pages/Files';


function App() {
  const location = window.location.pathname;
  console.log("Location: " + location);
  
  return (
    <div className="app">
      <NavigationBar/>
      <Router className="app-block">
        <Home path={"/"} />
        <Files path={"/files"} />
        <About path={"/about"} />
      </Router>
      <StatusBar/>
    </div>
  );
}

export default App;
