import { Component } from "react";

import "../styles/DatasetNavigator.css"
import SessionList from "./SessionList";
import {Ets2Session, Ets2SessionReader, Ets2Telemetry} from "../adapters/ets2-snapshot";


class DatasetNavigator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      session_name: '',
      session_data: {},
      current: -1
    }

    this.handleSessionChange = this.handleSessionChange.bind(this);
    this.navigateNext = this.navigateNext.bind(this);
    this.navigatePrev = this.navigatePrev.bind(this);
  }

  navigatePrev() {
    const { current, session_data } = this.state;

    if(current - 1 >= 0) {
      this.setState({ current: current - 1 });
      if(this.props.onSnapshotChange) this.props.onSnapshotChange(session_data.entries[current - 1], session_data.name);
    }
  }

  navigateNext() {
    const { current, session_data } = this.state;
    if(current + 1 < this.state.session_data.entries_count) {
      this.setState({ current: current + 1 });
      if(this.props.onSnapshotChange) this.props.onSnapshotChange(session_data.entries[current + 1], session_data.name);
    }
  }

  handleSessionChange(session) {
    console.log("Session changed: " + JSON.stringify(session));
    this.setState({session: session});

    Ets2SessionReader.get(session.name)
      .then(res => {
        const session_data = res.data;
        const current = 0;
        this.setState({ session_data: session_data, current: current });
        if(this.props.onSnapshotChange) this.props.onSnapshotChange(session_data.entries[current], session_data.name);
      });
  }

  render() {
    const { session_data, current } = this.state;

    return (
      <div className="dataset-navigator noselect">
        <div>
          <span className="entry">Session: {current >= 0 ? session_data.name : 'Select a session' } <SessionList onSessionChange={this.handleSessionChange}/></span>
          <span className="entry">Number of snapshots: <span>{current >= 0 ? session_data.entries_count : 0}</span></span>
        </div>
        {current >=0 &&
          <div className="buttons">
            <div className={"current-title"}>Current snapshot</div>
            <span className={"material-icons button" + (current==0 ? " disabled" : "")} onClick={this.navigatePrev}>navigate_before</span>
            <span className={"current"}>{current + 1}</span>
            <span className={"material-icons button" + (current + 1>=session_data.entries_count ? " disabled": "")} onClick={this.navigateNext}>navigate_next</span>
          </div>
        }
      </div>
    );
  }
}

export default DatasetNavigator;