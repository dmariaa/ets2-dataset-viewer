import React, {Component, Fragment} from "react";

import "../../styles/viewer/DatasetViewer.css";
import { PanelItem, PanelImageItem, PanelTitle, Panel } from "./Panel";
import {Ets2Snapshot} from "../../adapters/ets2-snapshot";

class DatasetViewer extends Component {
  static props = {
    snapshot: new Ets2Snapshot()
  }

  state = {
    image: null,
    depth: null,
    loading: false
  }

  componentDidMount() {
    this._loadImage(this.props.snapshot);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(!prevProps.snapshot || this.props.snapshot.id !== prevProps.snapshot.id) {
      this._loadImage(this.props.snapshot);
      this._loadDepth(this.props.depth);
    }
  }

  _loadImage(snapshot) {
    if(!snapshot || snapshot===null) return;

    this.setState({ loading: true });

    snapshot.getImage()
      .then((res) => {
        const buffer = new Buffer(res.data);
        this.setState({
          image: buffer.toString('base64'),
          loading: false
        });
      });
  }

  _loadDepth(snapshot) {
    if(!snapshot || snapshot===null) return;

    this.setState( {loading: true });

    snapshot.getDepth()
      .then((res) => {
        const buffer = new Buffer(res.data);
        this.setState({
          depth: buffer.toString('base64'),
          loading: false
        })
      });
  }

  renderTelemetry(telemetry)
  {
    return (
      <Fragment>
        <Panel className={"telemetry"}>
          <PanelTitle>Telemetry</PanelTitle>
          <PanelItem label={"Position"} value={telemetry.position.render()}/>
          <PanelItem label={"Orientation"} value={telemetry.orientation.render()}/>
        </Panel>
        <div className={"separator"} />
        <div className={"images"}>
          <Panel className={"image"}>
            <PanelTitle>BMP Image</PanelTitle>
            <PanelImageItem>
                <div className={"panel-backdrop " + (this.state.loading ? "loading" : "")}>
                  <div className={"loading-image"}>LOADING IMAGE</div>
                </div>
                <img src={`data:image/bmp;base64,${this.state.image}`} />
            </PanelImageItem>
          </Panel>
          <div className={"separator"} />
          <Panel className={"depth"}>
            <PanelTitle>Depth</PanelTitle>
          </Panel>
        </div>
      </Fragment>
    );
  }

  render() {
    const session = this.props.snapshot;
    const telemetry = session ? session.telemetry : undefined;

    return (
       <div className={"dataset-viewer"}>
         { telemetry
           ? this.renderTelemetry(telemetry)
           : <div className={"no-data"}>NO DATA TO SHOW</div> }
       </div>
    );
  }
}

export default DatasetViewer;