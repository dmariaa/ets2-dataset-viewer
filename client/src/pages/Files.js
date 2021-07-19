import {Component, Fragment} from "react";
import {Ets2SessionReader} from "../adapters/ets2-snapshot";
import FileViewer from "../components/files/FileViewer";
import {Panel, PanelColumn, PanelRow} from "../components/viewer/Panel";

class Files extends Component {
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
    return (
      <Fragment>
        <PanelRow className={"intro-text"}>
          <p>
          Here you can find all ETS2 Dataset files generated so far and some details about their contents. Every file contains the screenshots and their related depth map, together with a telemetry.txt file with telemetry data for each screenshot. You can click on each file name to download it, or you can <a href={"/dataset.txt"}>download here</a> a list with all the URLs so you can batch download them.
          </p>
        </PanelRow>
        <PanelColumn>
        {
          this.state.files.map((file) => {
            return (
              <Fragment>
                <FileViewer key={file.name} session={file} />
                <div className={"separator"} />
              </Fragment>
            );
          })
        }
        </PanelColumn>
      </Fragment>
    );
  }
}

export default Files;