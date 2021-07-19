import {Link} from "@reach/router"

import '../styles/NavigationBar.css'

function NavigationBar() {
  return (
    <div className="navigation-bar">
      <Link to="/">Home</Link>
      <Link to={"/files"}>Files</Link>
      <Link to="/about">About ETS2Dataset</Link>
    </div>
  )
}

export default NavigationBar;