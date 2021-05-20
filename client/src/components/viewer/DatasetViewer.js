import React, {Component, Fragment} from "react";
import { sprintf } from "sprintf-js";

import "../../styles/viewer/DatasetViewer.css";
import { PanelItem, PanelImageItem, PanelTitle, Panel, PanelRow } from "./Panel";
import {Ets2Snapshot, Ets2TelemetryVector} from "../../adapters/ets2-snapshot";

class DatasetViewer extends Component {
  static props = {
    snapshot: new Ets2Snapshot()
  }

  state = {
    image: null,
    depth: null,
    loadingImage: false,
    loadingDepth: false,
    deltaPosition: new Ets2TelemetryVector()
  }

  constructor(props) {
    super(props);
    this.depthCoord = React.createRef();
    this.imageCoord = React.createRef();
    this.depthColor = React.createRef();
    this.imageColor = React.createRef();
    this.imageOver = this.imageOver.bind(this);
  }

  componentDidMount() {
    this._loadImage(this.props.snapshot);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(!prevProps.snapshot || this.props.snapshot.id !== prevProps.snapshot.id) {
      this._loadImage(this.props.snapshot);
      this._loadDepth(this.props.snapshot);

      if(prevProps.snapshot) {
        this.setState({
          deltaPosition: this.props.snapshot.telemetry.position.minus(prevProps.snapshot.telemetry.position)
        });
      }
    }
  }

  _loadImage(snapshot) {
    if(!snapshot || snapshot===null) return;

    this.setState({ loadingImage: true });

    snapshot.getImage()
      .then((res) => {
        const buffer = new Buffer(res.data);
        this.setState({
          image: buffer,
          loadingImage: false
        });
      });
  }

  _loadDepth(snapshot) {
    if(!snapshot || snapshot===null) return;

    this.setState( {loadingDepth: true });

    snapshot.getDepth()
      .then((res) => {
        const buffer = new Buffer(res.data);
        this.setState({
          depth: buffer,
          loadingDepth: false
        })
      });
  }

  imageOver(e) {
    const image = e.currentTarget;
    const imageType = image.getAttribute('alt');
    const isDepth = (imageType==='depth');

    const imagePos = image.getBoundingClientRect();
    const hRatio = image.naturalWidth / image.width;
    const vRatio = image.naturalHeight / image.height;
    const px = Math.floor((e.clientX - Math.trunc(imagePos.x)) * hRatio);
    const py = Math.floor((e.clientY - Math.trunc(imagePos.y)) * vRatio);
    const bcoord = ((py * 1440) + px) * 3;
    const buffer = isDepth ? this.state.depth.slice(54) : this.state.image.slice(54);
    const color = buffer.slice(bcoord, bcoord + 3).toString("hex");

    const ref = isDepth ? this.depthCoord.current : this.imageCoord.current;
    const col = isDepth ? this.depthColor.current : this.imageColor.current;

    ref.value = sprintf("(%d, %d)", px, py);
    col.value = isDepth ? (parseInt(color.substring(0,2),16) / 255).toString() : "#" + color;
  }

  renderTelemetry(telemetry)
  {
    return (
      <Fragment>
        <Panel className={"telemetry"}>
          <PanelTitle>Telemetry</PanelTitle>
          <PanelRow>
            <PanelItem label={"Position"} value={telemetry.position.render()}/>
            <PanelItem label={"Delta"} value={this.state.deltaPosition.render()}/>
            <PanelItem label={"Delta magnitude"} value={`${sprintf("%.2f", this.state.deltaPosition.magnitude())} meters`} />
          </PanelRow>
          <PanelItem label={"Orientation"} value={telemetry.orientation.render()}/>
          <PanelRow>
            <PanelItem label={"Linear Speed"} value={telemetry.linear_velocity.render()}/>
            <PanelItem label={"Truck Speed"} value={`${Math.trunc(telemetry.linear_velocity.magnitude() * 3.6)} kms/h`}/>
          </PanelRow>
        </Panel>
        <div className={"separator"} />
        <div className={"images"}>
          <Panel className={"image"}>
            <PanelTitle>BMP Image</PanelTitle>
            <PanelImageItem>
              <div className={"panel-backdrop " + (this.state.loadingImage ? "loading" : "")}>
                <div className={"loading-image"}>LOADING IMAGE</div>
              </div>
              { this.state.image ?
                <img alt={"snapshot"} onMouseMove={this.imageOver} src={`data:image/bmp;base64,${this.state.image.toString('base64')}`} /> :
                <img alt={"singlepixel"} src={`data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`} />
              }
              <PanelRow>
                <PanelItem label={"Coords"} ref={this.imageCoord} value={"(0,0)"} />
                <PanelItem label={"Color"} ref={this.imageColor} value={"(0,0)"} />
              </PanelRow>
            </PanelImageItem>
          </Panel>
          <div className={"separator"} />
          <Panel className={"image depth"}>
            <PanelTitle>Depth</PanelTitle>
            <PanelImageItem>
              <div className={"panel-backdrop " + (this.state.loadingDepth ? "loading" : "")}>
                <div className={"loading-image"}>LOADING DEPTH</div>
              </div>
              { this.state.depth ?
                <img alt={"depth"} onMouseMove={this.imageOver} src={`data:image/bmp;base64,${this.state.depth.toString('base64')}`} /> :
                <img alt={"singlepixel"} src={`data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`} />
              }
              <PanelRow>
                <PanelItem label={"Coords"} ref={this.depthCoord}  value={"(0,0)"}/>
                <PanelItem label={"Depth"} ref={this.depthColor}  value={"(0,0)"}/>
              </PanelRow>
            </PanelImageItem>
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