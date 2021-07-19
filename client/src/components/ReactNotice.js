import logo from "../logo.svg";

import '../styles/ReactNotice.css'

function ReactNotice(props) {
  return (
    <div className={"react-notice " + props.className}>
      <a className="react-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
        Powered by React
      </a>
      <img src={logo} className="react-logo" alt="logo"/>
    </div>
  );
}

export default ReactNotice;