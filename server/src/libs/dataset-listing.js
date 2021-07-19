const path = require('path');
const fs = require('fs');
const { EOL } = require('os');
const zip = require('node-stream-zip');
const DepthToGray = require('./depth-to-gray');
const sharp = require('sharp');

const datasetPath = process.env.DATA_DIR;

function transformEntry(entry) {
  const data_start = 1;
  const id = entry[0];
  const image = id +'.bmp';
  const depth = id + '.depth.raw';

  let data = {
    id: id,
    image: image,
    depth: depth,
    telemetry: {
      position: toVector(entry, data_start),
      orientation: toVector(entry, data_start + 3),
      linear_velocity: toVector(entry, data_start + 6),
      angular_velocity: toVector(entry, data_start + 9),
      linear_accel: toVector(entry, data_start + 12),
      angular_accel: toVector(entry, data_start + 15),
      local_scale: entry[data_start + 18]
    },
  }
  return data;
}

function toVector(entry, start) {
  return {
    x: entry[start],
    y: entry[start+1],
    z: entry[start+2]
  };
}

const dataset = {
  /**
   * Returns a list of the ETS2 capture sessions available
   * @returns {Promise<*>}
   * @constructor
   */
  GetSessions: async function () {
    let files = fs.readdirSync(datasetPath);

    let sessions = await files.reduce(async (list, file_name) => {
      if (path.extname(file_name) === '.zip') {
        try {
          const file = path.join(datasetPath, file_name);
          const fileStats = fs.statSync(file)
          const size = fileStats.size / (1024*1024*1024);
          
          // Read zip file data
          const session = new zip.async({file: file });

          // Names
          const name = path.basename(file_name, '.zip');
          const tel_name = path.posix.join(name, 'telemetry.txt');
          const session_data = path.posix.join(name, 'session.json');
          console.log(`Reading telemetry file ${tel_name}`);

          // Telemetry file contents
          const telemetry_file = await session.entryData(tel_name);
          const lines = telemetry_file.toString().split(EOL).filter(l => l.length > 0);

          // Session file contents
          const data_file = await session.entryData(session_data);
          const data = data_file.toString();
          await session.close();

          let e = {id: name, name: file_name, size: size, entries_count: lines.length, session_data: JSON.parse(data) };
          (await list).push(e);
        } catch(error) {
          console.log(`Error reading file ${file_name}: ${error}`);
        }
      }

      return list;
    }, []);

    return sessions;
  },

  /**
   * Returns the details of a given ETS2 capture session
   * @param id
   * @returns {Promise<*>}
   * @constructor
   */
  GetSession: async function (id) {
    const file = path.join(datasetPath, id);
    const name = path.basename(id, '.zip');
    const tel_name = path.posix.join(name, 'telemetry.txt');
    const session_data = path.posix.join(name, 'session.json');
    console.log(`Reading telemetry file ${tel_name}`);

    const session = new zip.async({file: file});
    const telemetry_file = await session.entryData(tel_name);

    let lines = telemetry_file.toString().split(EOL).filter(l => l.length > 0);

    const data_file = await session.entryData(session_data);
    const data = data_file.toString();

    await session.close();
    lines = lines.map(l => transformEntry(l.split(';')));
    let e = {id: name, name: id, entries_count: lines.length, session_data: JSON.parse(data), entries: lines };
    return e;
  },

  /**
   * Returns an image or depth file from a dataset
   * @param id
   * @param file_name
   * @returns {Promise<*|*>}
   * @constructor
   */
  GetFile: async function(id, file_name)
  {
    const file = path.join(datasetPath, id);
    const name = path.basename(id, '.zip');
    const fname = path.posix.join(name, file_name);
    const session = new zip.async({file: file});
    let pipe = await session.stream(fname);

    const ext = path.extname(file_name);
    if(ext === '.bmp') {
      return pipe.on('finish', function() { console.log(`Closing ${file_name}`); session.close(); });
    } else if(ext ==='.raw') {
      return pipe.pipe(new DepthToGray()).on('finish', function() { console.log(`Closing ${file_name}`); session.close(); });
    }
  },

  GetSessionData: async function(id)
  {
    const file = path.join(datasetPath, id);
    const name = path.basename(id, '.zip');
    const session_file = path.posix.join(name, 'session.json');
    console.log(`Reading session data file ${session_file}`);

    const session = new zip.async({file: file});
    let pipe = await session.stream(session_file);
    return pipe.on('finish', () => { console.log(`Closing ${file}`); session.close(); });
  }
};

module.exports=dataset;
