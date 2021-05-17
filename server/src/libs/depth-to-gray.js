const zip = require('node-stream-zip');

const DEPTH_DENORM = Math.pow(2, 24) - 1;

class DepthToGray extends Transform {
  static header_size = 26;

  constructor(options) {
    super(options);
    this.readSize = 0;
    this.writeSize = 0;
    this.tempBufferFilled = false;
    this.tempBuffer = Buffer.alloc(0);
    this.rest = Buffer.alloc(0);
  }

  depthToColor(depthValueHex) {
    const norm = parseInt(depthValueHex, 16);
    const val = norm / DEPTH_DENORM;
    const gray = Math.floor(val * 255.0);
    return gray.toString(16).padStart(2, '0');
  }

  _transform(chunk, encoding, callback) {
    this.readSize += chunk.length;

    if(this.readSize <= DepthToGray.header_size) {
      console.log(`Skipping header size: ${this.readSize}`);
      this.tempBuffer = Buffer.concat([this.tempBuffer, chunk]);
      return;
    }

    if(!this.tempBufferFilled) {
      let remaining = DepthToGray.header_size - this.tempBuffer.length;
      this.tempBuffer = chunk.slice(0, remaining);
      chunk = chunk.slice(DepthToGray.header_size);
      this.tempBufferFilled = true;
    }

    if(this.rest.length > 0) {
      chunk = Buffer.concat([ this.rest, chunk ]);
    }

    console.log(`Read ${chunk.length}(${this.readSize})`);

    let length = chunk.length;
    let reminder = chunk.length % 3;

    this.rest = Buffer.from(chunk.slice(length - reminder, length));
    chunk = chunk.slice(0, length - reminder);

    let outStr = "";
    for(let i = 0; i < length; i += 3) {
      let data = chunk.slice(i, i + 3).toString('hex');
      let color = this.depthToColor(data);
      outStr += color;
    }
    let buffer = Buffer.from(outStr, 'hex');
    this.push(buffer);

    this.writeSize += buffer.length;
    console.log(`Write ${outStr.length} -> ${buffer.length} -> ${buffer.toString('hex').length} (${this.writeSize})`)
    callback();
  }

  _flush(done) {
    if(this.rest && this.rest.length > 0) {
      let outStr = "";

      for(let i = 0; i < this.rest.length; i += 3) {
        let data = this.rest.slice(i, i + 3).toString('hex');
        let color = this.depthToColor(data);
        outStr += color;
      }

      let buffer = Buffer.from(outStr, 'hex');
      this.push(buffer);
    }


  }
}
