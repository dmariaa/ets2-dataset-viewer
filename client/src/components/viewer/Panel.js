import React, { Children } from "react";

import "../../styles/viewer/Panel.css"

function Panel(props) {
  let title = undefined;
  let items = [];

  React.Children.forEach(props.children, (child) => {
    if (child.type == PanelTitle) {
      title = child;
    } else if(child.type == PanelItem || child.type == PanelImageItem) {
      items.push(child);
    }
  });

  return (
    <div className={"dataset-viewer-panel " + (props.className || '' )}>
      {title}
      <div className={"panel-items"}>
      {items && items.length > 0 &&
        items.map(function(item) {
          return item;
        })
      }
      </div>
    </div>
  );
}

function PanelTitle(props) {
  return (
    <div className={"title"}>{props.children}</div>
  );
}

function PanelItem(props) {
  return (
    <div className={"panel-item"}>
      <span className={"panel-label"}>{props.label}{props.separator || ": "}</span>
      <span className={"panel-value"}>{props.value}</span>
    </div>
  );
}

function PanelImageItem(props) {
  return (
    <div className={"panel-image-item"}>
      {props.children}
    </div>
  )
}

export {
  PanelItem,
  PanelImageItem,
  PanelTitle,
  Panel
};