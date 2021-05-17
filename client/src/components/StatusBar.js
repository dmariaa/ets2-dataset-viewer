import { Component } from "react";

import "../styles/StatusBar.css";

import ReactNotice from "./ReactNotice";

class StatusBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="status-bar">
        <ReactNotice className="right-align" />
      </div>
    );
  }
}

export default StatusBar;