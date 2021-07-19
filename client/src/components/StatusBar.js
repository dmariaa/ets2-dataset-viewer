import {Component} from "react";

import "../styles/StatusBar.css";

import ReactNotice from "./ReactNotice";

class StatusBar extends Component {
  render() {
    return (
      <div className="status-bar">
        <ReactNotice className="right-align"/>
      </div>
    );
  }
}

export default StatusBar;