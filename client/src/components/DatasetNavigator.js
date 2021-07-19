import {Component} from "react";

import "../styles/DatasetNavigator.css"
import SessionList from "./SessionList";
import {Ets2SessionReader} from "../adapters/ets2-snapshot";
import {sprintf} from "sprintf-js";
import {PanelItem, PanelRow} from "./viewer/Panel";


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
    this.navigate = this.navigate.bind((this));
  }
  
  navigatePrev(amount) {
    const {current, session_data} = this.state;
    const v = Math.max(0, current + amount);
    console.log(v);
    this.setState({current: v});
    if (this.props.onSnapshotChange) this.props.onSnapshotChange(session_data, v);
  }
  
  navigateNext(amount) {
    const {current, session_data} = this.state;
    const v = Math.min(this.state.session_data.entries_count - 1, current + amount);
    console.log(v);
    this.setState({current: v});
    if (this.props.onSnapshotChange) this.props.onSnapshotChange(session_data, v);
  }
  
  navigate(e) {
    const amount = parseInt(e.currentTarget.getAttribute('data-amount'));
    if (amount >= 0) {
      this.navigateNext(amount);
    } else {
      this.navigatePrev(amount);
    }
  }
  
  handleSessionChange(session) {
    console.log("Session changed: " + JSON.stringify(session));
    this.setState({session: session});
    
    Ets2SessionReader.get(session.name)
      .then(res => {
        const session_data = res.data;
        const current = 0;
        this.setState({session_data: session_data, current: current});
        if (this.props.onSnapshotChange) this.props.onSnapshotChange(session_data, current);
      });
  }
  
  render() {
    const {session_data, current} = this.state;
    
    return (
      <div className="dataset-navigator noselect">
        <div>
          <span className="entry">Session: {current >= 0 ? session_data.name : 'Select a session'} <SessionList onSessionChange={this.handleSessionChange}/></span>
          <PanelRow>
            <span className="entry">Number of snapshots: <span>{current >= 0 ? session_data.entries_count : 0}</span></span>
          </PanelRow>
        </div>
        {current >= 0 &&
        <div className="buttons">
          <div className={"current-title"}>Current snapshot</div>
          <span className={"material-icons button double" + (current === 0 ? " disabled" : "")} onClick={this.navigate}
                data-amount={"-10"}>&#xE408;&#xE408;</span>
          <span className={"material-icons button" + (current === 0 ? " disabled" : "")} onClick={this.navigate}
                data-amount={"-1"}>navigate_before</span>
          <span className={"current"}>{current + 1}</span>
          <span className={"material-icons button" + (current + 1 >= session_data.entries_count ? " disabled" : "")}
                onClick={this.navigate} data-amount={"1"}>navigate_next</span>
          <span
            className={"material-icons button double + (current + 1>=session_data.entries_count ? \" disabled\": \"\")"}
            onClick={this.navigate} data-amount={"10"}>&#xE409;&#xE409;</span>
        </div>
        }
      </div>
    );
  }
}

export default DatasetNavigator;