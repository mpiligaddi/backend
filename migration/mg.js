const fs = require('fs');
const path = require("path")

function csv_to_json() {
  const mainPath = path.join(__dirname, "csv/");
  const files = fs.readdirSync(mainPath);
  const jsPath = path.join(__dirname, "js/");
  const existingFiles = fs.readdirSync(jsPath);
  for (const file of files) {
    const file_path = path.join(mainPath, file);
    var index = files.indexOf(file);
    if(existingFiles[index] != null && existingFiles[index].startsWith(file)) continue;

    const data = fs.readFileSync(file_path, { encoding: 'utf-8' });

    /**
     * HEADERS -> 0 ;
     * lines -> >1 ;
     */

    const data_list = data.split("\n");

    const headers = data_list[0].split(";")
    const final_list = [];


    for (let data_index = 1; data_index < data_list.length; data_index++) {
      const final_object = {};
      const elements = data_list[data_index].split(";");
      for (let index = 0; index < headers.length; index++) {
        if (headers[index] == null || elements[index] == null
          || headers[index].trim() == "" || elements[index].trim("") == "" ) continue;
        const head = headers[index].trim().replace("\r", "");
        final_object[head] = elements[index].trim().replace("\r", "");
      }
      final_list.push(final_object);
    }

    fs.writeFile(path.join(__dirname, "js", `${file}.json`), JSON.stringify(final_list, null, 4), () => {
      console.log(`const ${file.split(".")[0]} = require("./js/${file}.json")`)
    })
  }
}

csv_to_json();