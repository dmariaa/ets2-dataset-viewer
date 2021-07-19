import React, {Component, Fragment} from "react";
import {sprintf} from "sprintf-js";
import {format, parse} from 'date-fns';

import "../../styles/viewer/DatasetViewer.css";
import {Panel, PanelImageItem, PanelItem, PanelRow, PanelTitle} from "./Panel";
import {Ets2Snapshot, Ets2TelemetryVector} from "../../adapters/ets2-snapshot";

class DatasetViewer extends Component {
  static props = {
    snapshot: new Ets2Snapshot()
  }
  
  state = {
    min_val: 0.0,
    max_val: 0.0,
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
    this.depthReal = React.createRef();
    this.imageOver = this.imageOver.bind(this);
  }
  
  componentDidMount() {
    this._loadImage(this.props.snapshot);
    this._loadDepth(this.props.snapshot);
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.snapshot || this.props.snapshot.id !== prevProps.snapshot.id) {
      this._loadImage(this.props.snapshot);
      this._loadDepth(this.props.snapshot);
      
      if (prevProps.snapshot) {
        this.setState({
          deltaPosition: this.props.snapshot.telemetry.position.minus(prevProps.snapshot.telemetry.position)
        });
      }
    }
  }
  
  _loadImage(snapshot) {
    if (!snapshot || snapshot === null) return;
    
    this.setState({loadingImage: true});
    
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
    if (!snapshot || snapshot === null) return;
    
    this.setState({loadingDepth: true});
    
    snapshot.getDepth()
      .then((res) => {
        const buffer = new Buffer(res.data);
        const length = buffer.length;
        const min_val = buffer.readFloatLE(0);
        const max_val = buffer.readFloatLE(4);
  
        this.setState({
          min_val: min_val,
          max_val: max_val,
          depth: buffer.slice(8),
          loadingDepth: false
        })
      });
  }
  
  toUnnormDepth(depthValue, min, max) {
    return depthValue * (max - min) + min;
  }
  
  toRealDepth(depthValue, near = 0.1, far = 3000.0)
  {
      const denormValue = this.toUnnormDepth(depthValue,this.state.min_val, this.state.max_val);
      const p33 = far / (far - near)
      const p43 = (-far * near) / (far - near)
      return p43 / (denormValue - p33)
  }
  
  imageOver(e) {
    const image = e.currentTarget;
    const imageType = image.getAttribute('alt');
    const isDepth = (imageType === 'depth');
    
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
    const real = isDepth ? this.depthReal.current : null;
    
    const d = (parseInt(color.substring(0, 2), 16) / 255);
    
    ref.value = sprintf("(%d, %d)", px, py);
    col.value = isDepth ? this.toUnnormDepth(d, this.state.min_val, this.state.max_val) : "#" + color;
    
    if(real != null)
    {
      real.value = this.toRealDepth(d);
    }
  }
  
  displayDate(d) {
    var date = parse(d, 'yyyymmdd', new Date());
    return format(date, 'dd/MM/yyyy');
  }
  
  renderTelemetry(telemetry) {
    var session_data = this.props.snapshot.session_data;
    return (
      <Fragment>
        <div className={"telemetry-session-data"}>
          <Panel className={"session-data"}>
            <PanelTitle>Session data</PanelTitle>
            <PanelRow>
              <PanelItem label={"Date"} value={this.displayDate(session_data.date)}/>
              <PanelItem label={"Hour of day"} value={session_data.gametime}/>
              <PanelItem label={"Weather"} value={session_data.weather || 'nice'}/>
            </PanelRow>
            <PanelRow>
              <PanelItem label={"Location"} value={session_data.location}/>
              <PanelItem label={"Environment"} value={session_data.environment}/>
              <PanelItem label={"Traffic level (1-10)"} value={session_data.traffic || 1}/>
            </PanelRow>
            <PanelRow>
              <div className={"camera-parameters"}>Camera parameters</div>
            </PanelRow>
            <PanelRow>
              <PanelItem label={"FOV"} value={session_data.camera.fov}/>
              <PanelItem label={"Near plane"} value={session_data.camera.near}/>
              <PanelItem label={"Far plane"} value={session_data.camera.far}/>
            </PanelRow>
          </Panel>
          <div className={"separator"}/>
          <Panel className={"telemetry"}>
            <PanelTitle>Telemetry</PanelTitle>
            <PanelRow>
              <PanelItem label={"Position"} value={telemetry.position.render()}/>
              <PanelItem label={"Delta"} value={this.state.deltaPosition.render()}/>
              <PanelItem label={"Delta magnitude"}
                         value={`${sprintf("%.2f", this.state.deltaPosition.magnitude())} meters`}/>
            </PanelRow>
            <PanelItem label={"Orientation"} value={telemetry.orientation.render()}/>
            <PanelRow>
              <PanelItem label={"Linear Speed"} value={telemetry.linear_velocity.render()}/>
              <PanelItem label={"Truck Speed"}
                         value={`${Math.trunc(telemetry.linear_velocity.magnitude() * 3.6)} kms/h`}/>
            </PanelRow>
          </Panel>
        </div>
        <div className={"separator"}/>
        <div className={"images"}>
          <Panel className={"image"}>
            <PanelTitle>BMP Image</PanelTitle>
            <PanelImageItem>
              <div className={"panel-backdrop " + (this.state.loadingImage ? "loading" : "")}>
                <div className={"loading-image"}>LOADING IMAGE</div>
              </div>
              {this.state.image ?
                <img alt={"snapshot"} onMouseMove={this.imageOver}
                     src={`data:image/bmp;base64,${this.state.image.toString('base64')}`}/> :
                <img alt={"singlepixel"}
                     src={`data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`}/>
              }
              <PanelRow>
                <PanelItem label={"Coords"} ref={this.imageCoord} value={"(0,0)"}/>
                <PanelItem label={"Color"} ref={this.imageColor} value={"(0,0)"}/>
              </PanelRow>
            </PanelImageItem>
          </Panel>
          <div className={"separator"}/>
          <Panel className={"image depth"}>
            <PanelTitle>Depth</PanelTitle>
            <PanelImageItem>
              <div className={"panel-backdrop " + (this.state.loadingDepth ? "loading" : "")}>
                <div className={"loading-image"}>LOADING DEPTH</div>
              </div>
              {this.state.depth ?
                <img alt={"depth"} onMouseMove={this.imageOver}
                     src={`data:image/bmp;base64,${this.state.depth.toString('base64')}`}/> :
                <img alt={"singlepixel"}
                     src={`data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`}/>
              }
              <PanelRow>
                <PanelItem label={"Coords"} ref={this.depthCoord} value={"(0,0)"}/>
                <PanelItem label={"Depth"} ref={this.depthColor} value={"(0,0)"}/>
                <PanelItem label={"Depth"} ref={this.depthReal} value={"(0,0)"}/>
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
        {telemetry
          ? this.renderTelemetry(telemetry, session)
          : <div className={"no-data"}>NO DATA TO SHOW<br/>PLEASE SELECT A SESSION IN THE PANEL ABOVE</div>}
      </div>
    );
  }
}

export default DatasetViewer;