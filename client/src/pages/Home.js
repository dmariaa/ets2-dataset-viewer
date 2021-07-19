import {Component, Fragment} from "react";

import "../components/DatasetNavigator"
import DatasetNavigator from "../components/DatasetNavigator";
import DatasetViewer from "../components/viewer/DatasetViewer";
import {Ets2Snapshot} from "../adapters/ets2-snapshot";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snapshot: undefined
    };
    
    this.onSnapshotChange = this.onSnapshotChange.bind(this);
  }
  
  onSnapshotChange(session, current) {
    let snapshot = new Ets2Snapshot(session.entries[current], session);
    console.log(session);
    this.setState({snapshot: snapshot});
  }
  
  render() {
    const snapshot = this.state.snapshot;
    
    return (
      <Fragment>
        <DatasetNavigator onSnapshotChange={this.onSnapshotChange}/>
        <DatasetViewer snapshot={snapshot}/>
      </Fragment>
    );
  }
}

export default Home;