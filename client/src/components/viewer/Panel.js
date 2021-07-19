import React, {forwardRef, Fragment} from "react";

import "../../styles/viewer/Panel.css"


const Panel = React.forwardRef((props, ref)  => {
  let title = undefined;
  let items = [];
  
  React.Children.forEach(props.children, (child) => {
    if (child.type === PanelTitle) {
      title = child;
    } else if (child.type === PanelItem
      || child.type === PanelImageItem
      || child.type === PanelRow
      || child.type === PanelColumn) {
      items.push(child);
    }
  });
  
  return (
    <div ref={ref} className={"dataset-viewer-panel " + (props.className || '')}>
      {title}
      <div className={"panel-items"}>
        {items && items.length > 0 &&
        items.map(function (item) {
          return item;
        })
        }
      </div>
    </div>
  );
});

function PanelTitle(props) {
  return (
    <div className={"title"}>{props.children}</div>
  );
}

class PanelItem extends React.Component {
  set value(val) {
    this.setState({value: val});
  }
  
  constructor(props) {
    super(props);
    
    this.state = {
      label: props.label,
      value: props.value || '',
      separator: (props.separator === undefined) ? ': ' : props.separator
    };
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.value || prevProps.value !== this.props.value) {
      this.setState({value: this.props.value});
    }
  }
  
  render() {
    return (
      <Fragment>
        <div className={"panel-item"}>
          <span className={"panel-label"}>{this.state.label + this.state.separator}</span>
          <span className={"panel-value"}>{this.state.value}</span>
        </div>
      </Fragment>
    )
  }
}

function PanelImageItem(props) {
  return (
    <div className={"panel-image-item"}>
      {props.children}
    </div>
  );
}

function PanelRow(props) {
  return (
    <div className={"panel-row " + (props.className || '')}>
      {props.children}
    </div>
  );
}

function PanelColumn(props) {
  return (
    <div className={"panel-column " + (props.className || '')}>
      {props.children}
    </div>
  );
}

export {
  PanelItem,
  PanelColumn,
  PanelRow,
  PanelImageItem,
  PanelTitle,
  Panel
};