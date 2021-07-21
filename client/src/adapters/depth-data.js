import {plasma, magma} from "scale-color-perceptual"
import { Float16Array, getFloat16, setFloat16, hfround } from "@petamoriken/float16";

class DepthDataReader
{
  depth_denorm = Math.pow(2, 24) - 1

  depth_header_size = 28
  depth_data_bytes = 0

  depth_header = {
    magic: '',
    size: 0,
    width: 0,
    height: 0,
    min_val: 0,
    max_val: 0,
    bits: 0,
    offset: 0
  }

  constructor(data) {
    this.image_data = undefined;
    this._processData(data);
    this.depth_range = this.depth_header.max_val - this.depth_header.min_val;
  }

  _processData(data)
  {
    this.header_data = new DataView(data.slice(0, this.depth_header_size));
    this.depth_data = new DataView(data.slice(this.depth_header_size));

    this.depth_header.magic = String.fromCharCode(this.header_data.getUint8(0), this.header_data.getUint8(1))
    this.depth_header.size = this.header_data.getInt32(2, true);
    this.depth_header.width = this.header_data.getInt32(6, true);
    this.depth_header.height = this.header_data.getInt32(10, true);
    this.depth_header.min_val = this.header_data.getFloat32(14, true);
    this.depth_header.max_val = this.header_data.getFloat32(18, true);
    this.depth_header.bits = this.header_data.getInt16(22, true);
    this.depth_header.offset = this.header_data.getInt32(24, true);

    this.depth_data_bytes = this.depth_header.bits / 8;
  }

  _getUint24LE(view, offset)
  {
    return view.getUint16(offset + 1, true) * 256 + view.getUint8(offset);
  }

  _getFloat16(view, offset)
  {
    return getFloat16(view, offset, true);
  }

  getDepthFromCoordinates(x, y)
  {
    const coords = y * this.depth_header.width + x;
    return this.getDepth(coords * this.depth_data_bytes);
  }

  getDepth(offset)
  {
    if(this.depth_header.bits==16)
    {
      return this.getRealDepth(offset);
    } else {
      return this.getDepthBufferDepth(offset)
    }

  }

  getDepthBufferDepth(offset)
  {
    let v = this._getUint24LE(this.depth_data, offset);
    return v / this.depth_denorm;
  }

  getRealDepth(offset)
  {
    const real_depth = this._getFloat16(this.depth_data, offset);
    return real_depth == 0 ? this.depth_header.min_val - 100 : real_depth;
  }

  _toColor(value)
  {
    value = (value - this.depth_header.min_val) / this.depth_range;
    value = Math.min(Math.max(value, 0.0), 1.0);
    value = magma(value);
    return value.substring(1);
  }

  _generateBMPHeader() {
    let dataOffset = 54;
    let pixels = this.depth_header.width * this.depth_header.height;
    let dataSize = pixels * 3;  // RGB

    const header = Buffer.alloc(54 + dataSize);
    header.write("BM", 0);                  //  0 + 2b
    header.writeInt32LE(dataSize, 2);             //  2 + 4b
    header.writeInt32LE(0, 6)               //  6 + 4b
    header.writeInt32LE(dataOffset, 10);          // 10 + 4b
    header.writeInt32LE(40, 14);            // 14 + 4b
    header.writeInt32LE(this.depth_header.width, 18);   // 18 + 4b
    header.writeInt32LE(-this.depth_header.height, 22);  // 22 + 4b
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

  generateImage()
  {
    return new Promise((resolve, reject) => {
      if(this.image_data==undefined) {

        this.image_data = this._generateBMPHeader();
        const pixels = this.depth_header.width * this.depth_header.height;
        const start = 54;

        for(let i=0; i < pixels; ++i) {
          const depth = this.getDepth(i * this.depth_data_bytes);
          const color = Buffer.from(this._toColor(depth), 'hex');
          color.copy(this.image_data, start + (i * 3));
        }
      }

      resolve(this.image_data);
    });
  }
}

export {
  DepthDataReader
};