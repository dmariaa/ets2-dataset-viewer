import axios from "axios";
var sprintf = require('sprintf-js').sprintf;

const Ets2SessionReader = (function () {
  const uris = {
    listUri: '/api/sessions',
    getUri: (...p) => `/api/sessions/${p[0]}`,
    getFile: (...p) => `/api/sessions/${p[0]}/${p[1]}`
  };

  const axiosInstance = axios.create({
    baseurl: '/',
    withCredentials: false
  });

  const cancelTokens = {};

  function _createCancelToken(apiCall) {
    cancelTokens[apiCall] &&
      cancelTokens[apiCall].cancel(`Previous ${apiCall} cancelled`);

    cancelTokens[apiCall] = axios.CancelToken.source();
    return cancelTokens[apiCall].token;
  }

  function list() {
    return axiosInstance.request({
      method: 'GET',
      url: uris.listUri,
      cancelToken: _createCancelToken(list.name)
    });
  }

  function get(id) {
    return axiosInstance.request({
      method: 'GET',
      url: uris.getUri(id),
      cancelToken: _createCancelToken(get.name)
    });
  }

  function getFile(id, file) {
    let uri = uris.getFile(id, file);
    return axiosInstance.request({
      method: 'GET',
      url: uri,
      responseType: "arraybuffer",
      cancelToken: _createCancelToken(uri)
    });
  }

  return {
    list: list,
    get: get,
    getFile: getFile
  }
})();


class Ets2TelemetryVector {
  constructor(data = {x: 0.0, y: 0.0, z: 0.0}) {
    this.x = parseFloat(data.x);
    this.y = parseFloat(data.y);
    this.z = parseFloat(data.z);
  }

  scalarProduct(value) {
    return new Ets2TelemetryVector({x: this.x * value, y: this.y * value, z: this.z * value });
  }

  scalarDivision(value) {
    return new Ets2TelemetryVector({x: this.x / value, y: this.y / value, z: this.z / value });
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  minus(other) {
    return new Ets2TelemetryVector({ x: other.x - this.x, y: other.y - this.y, z: other.z - this.z});
  }

  render() {
    let r = sprintf("(%.2f, %.2f, %.2f)", this.x, this.y, this.z );
    return (
      <span>{r}</span>
    );
  }
}

class Ets2TelemetryPosition extends Ets2TelemetryVector {
}

class Ets2TelemetryOrientation extends Ets2TelemetryVector {
}

class Ets2Snapshot {
  constructor(snapshot = {telemetry: {}}, name = '') {
    this.id = snapshot.id;
    this.name = name;
    this.image = snapshot.image;
    this.depth = snapshot.depth;
    this.telemetry = {
      position: new Ets2TelemetryPosition(snapshot.telemetry.position),
      orientation: new Ets2TelemetryOrientation(snapshot.telemetry.orientation),
      linear_velocity: new Ets2TelemetryVector(snapshot.telemetry.linear_velocity),
      angular_velocity: new Ets2TelemetryVector(snapshot.telemetry.angular_velocity),
      linear_acceleration: new Ets2TelemetryVector(snapshot.telemetry.linear_acceleration),
      angular_acceleration: new Ets2TelemetryVector(snapshot.telemetry.angular_acceleration),
      local_scale: parseFloat(snapshot.telemetry.local_scale)
    }
  }

  getImage() {
    return Ets2SessionReader.getFile(this.name, this.image);
  }

  getDepth() {
    return Ets2SessionReader.getFile(this.name, this.depth);
  }
}

export {
  Ets2SessionReader,
  Ets2TelemetryPosition,
  Ets2TelemetryVector,
  Ets2TelemetryOrientation,
  Ets2Snapshot
};