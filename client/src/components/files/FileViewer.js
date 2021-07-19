import React, {Component} from "react";
import {Ets2SessionReader} from "../../adapters/ets2-snapshot";
import "../../styles/files/FileViewer.css";
import {Panel, PanelColumn, PanelItem, PanelRow} from "../viewer/Panel";
import {format, parse} from "date-fns";
import {sprintf} from "sprintf-js";

class FileViewer extends Component {
  state = {
    image: ''
  };
  
  constructor(props) {
    super(props);
    this.fileDataRef = React.createRef();
    
    this.updateImageHeight = this.updateImageHeight.bind(this);
    this.windowResized = this.windowResized.bind(this);
  }
  
  updateImageHeight() {
    const el = this.fileDataRef.current;
    const image = el.querySelector('.file-thumbnail');
    const fileData = el.querySelector('.file-data-panel');

    if(window.innerWidth >= 768) {
      // image.style.display = "none";
      const height = fileData.offsetHeight;
      image.style.height = height + 'px';
      image.style.width = null;
    } else {
      const width = fileData.offsetWidth;
      image.style.height = null;
      image.style.width = width + 'px';
    }
  }
  
  windowResized() {
    let _this = this;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function() {
      _this.updateImageHeight();
    }, 500);
  }
  
  componentDidMount() {
    window.addEventListener('resize', this.windowResized);
    this.updateImageHeight();
    
    Ets2SessionReader.get(this.props.session.name)
      .then(res => {
        const entry = res.data.entries[0];
        
        Ets2SessionReader.getFile(this.props.session.name, entry.image)
          .then(image => {
            this.setState({ image: new Buffer(image.data) });
          });
      });
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResized);
  }
  
  displayDate(d) {
    var date = parse(d, 'yyyymmdd', new Date());
    return format(date, 'dd/MM/yyyy');
  }
  
  render() {
    let img = this.state.image;
    
    return (
      <Panel ref={this.fileDataRef}>
        <PanelColumn className={"file-panel"}>
          <div className={"file-thumbnail"}>
            {img ?
                <img alt={"snapshot"} className={"thumbnail"} src={`data:image/bmp;base64,${img.toString('base64')}`}/> :
                <img alt={"singlepixel"} className={"thumbnail"} src={`data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`}/>
            }
          </div>
          <PanelColumn className={"file-data-panel"}>
            <PanelRow>
              <a className={"file-link"} href={"/data/" + this.props.session.name}>{this.props.session.name}</a>
              <span>&nbsp;({sprintf("%.2f GB", this.props.session.size)})</span>
            </PanelRow>
            <PanelItem label={"Entries"} value={this.props.session.entries_count} />
            <PanelItem label={"Date"} value={this.displayDate(this.props.session.session_data.date) + " " + this.props.session.session_data.gametime} />
            <PanelItem label={"Location"} value={this.props.session.session_data.location} />
            <PanelItem label={"Environment"} value={this.props.session.session_data.environment} />
            <PanelItem label={"Traffic (1-10)"} value={this.props.session.session_data.traffic} />
            <PanelRow>
              <PanelItem label={"Camera parameters"} value={" "} />
              <PanelItem label={"FOV"} value={this.props.session.session_data.camera.fov} />
              <PanelItem label={"Near plane"} value={this.props.session.session_data.camera.near} />
              <PanelItem label={"Far plane"} value={this.props.session.session_data.camera.far} />
            </PanelRow>
          </PanelColumn>
        </PanelColumn>
      </Panel>
    );
  }
}

export default FileViewer;