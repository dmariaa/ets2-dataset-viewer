import {Component} from "react";
import {Panel, PanelColumn} from "../components/viewer/Panel";
import '../styles/About.css'
import {Ets2SessionReader} from "../adapters/ets2-snapshot";

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    }
  }
  
  componentDidMount() {
    Ets2SessionReader.list()
      .then(res => {
        const data = res.data;
        this.setState({files: data});
      });
  }
  
  render() {
    const total_entries = this.state.files.map((x) => x.entries_count).reduce((prev, next) => prev + next, 0);
    return (
      <Panel className={"about-root"}>
        <PanelColumn>
          <h1>This is the ETS2 Dataset website</h1>
          <h2>David María Arribas [dmariaa70@gmail.com]</h2>
          <div className={"about-content"}>
            <p>The ETS2 Dataset contains sequences of frames obtained by driving along different kind of roads at different
            light, traffic and environment conditions. All frames have been obtained by navigating different areas of the
            game Euro Truck Simulator 2 (Euro Truck Simulator 2 is property of SCS Software).
            </p>
            <p>The dataset is divided in sessions, each presented as a zip file. Each session correspond with a different
            navigation recording, with different environmental conditions. Actually, the dataset contains {this.state.files.length} sessions,
              for a total of {total_entries} frames.</p>
            <p>For each of the frames we record the color image from a virtual camera, a dense depth map
              and the telemetry of the driving vehicle, all synchronized at a 10fps rate.
            </p>
            <p>The dataset is well suited to train neural networks that are feed with sequences of images and or images
            with ground truth depth data. You can explore it in the Home section of this website, and download it in the
              Files section of this website.
            </p>
            <br/><br/>
            <p class={"centered"}>This dataset and all related works are part of my final degree in Game Development and Design project, <br/>at
            &nbsp;<a href={"https://www.urjc.es/"}>URJC University</a>
            </p>
          </div>
        </PanelColumn>
      </Panel>
    );
  }
}

export default About;