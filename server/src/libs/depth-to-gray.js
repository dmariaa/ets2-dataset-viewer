const Transform = require('stream').Transform;
const DEPTH_DENORM = Math.pow(2, 24) - 1;

class DepthToGray extends Transform {
  static header_size = 26;

  constructor(options) {
    super(options);
    this.headerBuffer = Buffer.alloc(0);
    this.tmpBuffer = Buffer.alloc(0);
    this.readBytes = 0;
    this.processedBytes = 0;
    this.generatedBytes = 0;

    this.header = {
      magic: '',
      size: 0,
      width: 0,
      height: 0,
      min_val: 0,
      max_val: 0,
      offset: 0
    }
  }

  generateBMPHeader() {
    let dataOffset = 54;
    let dataSize = (this.header.size - this.header.offset);

    const header = Buffer.alloc(54);
    header.write("BM", 0);                  //  0 + 2b
    header.writeInt32LE(dataSize, 2);             //  2 + 4b
    header.writeInt32LE(0, 6)               //  6 + 4b
    header.writeInt32LE(dataOffset, 10);          // 10 + 4b
    header.writeInt32LE(40, 14);            // 14 + 4b
    header.writeInt32LE(this.header.width, 18);   // 18 + 4b
    header.writeInt32LE(-this.header.height, 22);  // 22 + 4b
    header.writeInt16LE(1, 26);             // 26 + 2b
    header.writeInt16LE(24, 28);            // 28 + 2b
    header.writeInt32LE(0, 30);             // 30 + 4b
    header.writeInt32LE(dataSize, 34);            // 34 + 4b
    header.writeInt32LE(0x03c3, 38);        // 38 + 4b
    header.writeInt32LE(0x03c3, 42);        // 42 + 4b
    header.writeInt32LE(0, 46);             // 46 + 4b
    header.writeInt32LE(0, 50);             // 54 + 4b
    return header;
  }

  depthToColor(depthValueHex) {
    const norm = depthValueHex.readUIntLE(0, 3);
    const val = norm / DEPTH_DENORM;
    const nval = (val - this.header.min_val) / this.range;
    const gray = Math.trunc( nval * 255);
    const strColor = gray.toString(16).padStart(2, '0');
    return strColor + strColor + strColor;
  }

  processHeader() {
    this.header.magic = this.headerBuffer.slice(0, 2).toString();
    this.header.size = this.headerBuffer.readInt32LE(2);
    this.header.width = this.headerBuffer.readInt32LE(6);
    this.header.height = this.headerBuffer.readInt32LE(10);
    this.header.min_val = this.headerBuffer.readFloatLE(14);
    this.header.max_val = this.headerBuffer.readFloatLE(18);
    this.header.offset = this.headerBuffer.readInt32LE(22);
    this.range = (this.header.max_val - this.header.min_val);
  }

  _transform(chunk, encoding, next) {
    this.readBytes += chunk.length;
    this.tmpBuffer = Buffer.concat([ this.tmpBuffer, chunk ]);

    // Accumulate chunks until all header is read
    if(this.tmpBuffer.length < DepthToGray.header_size) {
      next();
      return;
    }

    // Read header
    if(this.headerBuffer.length===0) {
      this.headerBuffer = Buffer.from(this.tmpBuffer.slice(0, DepthToGray.header_size));
      this.processHeader();
  
      console.log(`Header read:\n${JSON.stringify(this.header, null, 4)}`);
      
      let outBuffer = Buffer.alloc(8);
      outBuffer.writeFloatLE(this.header.min_val, 0);
      outBuffer.writeFloatLE(this.header.max_val, 4);
      this.push(outBuffer)
  
      const header = this.generateBMPHeader();
      this.push(header);
      this.tmpBuffer = Buffer.from(this.tmpBuffer.slice(this.header.offset));
    }

    // Process data
    let reminder = this.tmpBuffer.length % 3;
    let pLength = this.tmpBuffer.length - reminder;
    let str = "";

    for(let i=0; i < pLength; i += 3) {
      let depth = this.tmpBuffer.slice(i, i + 3);
      this.processedBytes += 3;
      let depthColor = this.depthToColor(depth);
      str += depthColor;
    }

    let outBuffer = Buffer.from(str, 'hex');
    this.generatedBytes += outBuffer.length;

    this.push(outBuffer);
    this.tmpBuffer = this.tmpBuffer.slice(pLength);
    next();
  }

  _flush(done) {
    if(this.header.size !== this.readBytes) {
      console.log(`read size not correct: ${this.header.size} !== ${this.readBytes}`);
    }

    if(this.tmpBuffer.length > 0) {
      console.log(`missing bytes: ${this.tmpBuffer.length}`);
    }

    console.log(`
    depth transform stats:
    total bytes read: ${this.readBytes}
    header size: ${DepthToGray.header_size}
    total bytes processed: ${this.processedBytes}
    total bytes generated: ${this.generatedBytes}
    `);
    
    done();
  }
}

module.exports=DepthToGray;