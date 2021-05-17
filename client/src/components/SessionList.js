import React, { Component } from "react";
import "../styles/SessionList.css"

import { Ets2SessionReader } from "../adapters/ets2-snapshot";

class SessionList extends Component {
  static defaultProps = {
    session: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      list_shown: false,
      list_items: props.items ? props.items : []
    };

    this.listRef = React.createRef();
    this.buttonRef = React.createRef();
    this.toggleVisible = this.toggleVisible.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    Ets2SessionReader.list()
      .then(res => {
        const data = res.data;
        this.setState({ list_items: data });
      });

    document.addEventListener('mousedown', this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick);
  }

  toggleVisible() {
    let shown = !this.state.list_shown;
    this.setState(s => s.list_shown = shown );
  }

  handleClick(e) {
    if(this.buttonRef && this.buttonRef.current.contains(e.target)) {
      this.toggleVisible();
    } else if(this.listRef && this.listRef.current.contains(e.target)) {
      if(this.state.list_shown) {
        if (e.target.classList.contains('session-list-list-item')) {
          if(this.props.onSessionChange) {
            const index = e.target.getAttribute('data-id');
            let selectedSession = this.state.list_items[index];
            this.props.onSessionChange(selectedSession);
          }
          this.toggleVisible();
        }
      }
    } else {
      if(this.state.list_shown) {
        this.toggleVisible();
      }
    }
  }

  render() {
    const list_shown = this.state.list_shown;
    const selected = this.props.session;

    let items = [ <span key={"no-items"} className={"session-list-list-item no-items"}>No sessions available</span> ];

    if(this.state.list_items.length > 0) {
      items = this.state.list_items.map((item, index) => {
        let name = item.name;
        return <li key={name} data-id={index} className={"session-list-list-item"}>{name.substring(0, name.length - 4)}</li>;
      });
    }

    return(
      <span className={"session-list"}>
        <span ref={this.buttonRef} className={"material-icons session-list-icon"}>search</span>
        <div ref={this.listRef} className={"session-list-list" + (list_shown ? " visible" : "") }>
          <span className={"session-list-list-title"}>Available sessions</span>
          <ul>
            {items}
          </ul>
        </div>
      </span>
    );
  }

}

export default SessionList;