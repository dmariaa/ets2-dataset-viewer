import '../styles/App.css';

import { Router } from "@reach/router";

import NavigationBar from "./NavigationBar";
import StatusBar from "./StatusBar";
import Home from '../pages/Home'
import About from '../pages/About'



function App() {
  return (
    <div className="app">
      <NavigationBar/>
      <Router className="app-block">
        <Home path="/" />
        <About path="/about" />
      </Router>
      <StatusBar />
    </div>
  );
}

export default App;
