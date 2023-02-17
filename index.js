const downloadBtn = document.getElementById("download-btn");
const gridContainer = document.getElementById("grid-container");
const uploadBtn = document.getElementById("upload");
const data = [
  [1, "Maria", true],
  [2, "Kerim", true],
  [3, "Ms. DumbDumb", false],
];
/**
 * In order for this particular solution to work, we need to work with data types of strings.
 * The following variable is to contain all data we want in our downloaded csv-file.
 * Firstly, we need to add the headers of the data we want to download
 */
let csv = "Id,Name,isSmart\n";

/**
 * Convert the header titles in the csv variable above from one long strings to three strings within an array
 */
const headers = csv.slice(0, csv.length - 1);

/**
 * Create grid elements and headers and add to the document so the user can see the data that they can download
 */
createGridHeaders();
createGridElements();

downloadBtn.addEventListener("click", downloadCSV);

uploadBtn.addEventListener("click", readCSV);

function readCSV() {
  /**
   * First check if a file was loaded. If not, jump out of the function
   */
  if (uploadBtn.files.length <= 0) {
    return;
  }

  /**
   * If a file was correctly selected, use the FileReader object to see the content of the file.
   * Get access to selected file by using the files property of the HTMLInputElement uploadBtn.
   * This returns a FileList object. Save this into a constant variable called 'file'.
   *
   * To read the file, we can use a FileReader object.
   * Construct a new FileReader object and save it into a constant variable called 'fileReader'.
   * The FileReader object has an instance method called readAsText() which reads the content of a file.
   * If the file is read correctly, the content of the file will be stored inside of the result attribute in the form of a string.
   */
  const file = uploadBtn.files[0];
  const fileReader = new FileReader();
  fileReader.readAsText(file);

  /**
   * If an error happens while loading the fileReader reads the uploaded file, alert the user.
   */
  fileReader.addEventListener("error", () => {
    alert(fileReader.error);
  });

  /**
   * The contents of the file is read asynchronously. Therefore we call an eventlistener on the fileReader object.
   * We listen for the event "load" and look into the result attribute of the fileReader object once the fileReader object has finished loading.
   */
  fileReader.addEventListener("load", () => {
    const newHeaders = fileReader.result.split("\n")[0];
    let records = "";

    for (let i = 1; i < fileReader.result.split("\n").length - 1; i++) {
      const record = fileReader.result.split("\n")[i];

      records += record;
      records += "\n";
    }

    /**
     * Check if the headers of the uploaded file are identical to the headers used in the grid
     *
     * We do this because if the headers are the same, we want to add grid elements to the existing grid rather than replace the entire grid
     */
    let count = 0;

    console.log("old headers: ", headers.split(","));
    console.log("new headers: ", newHeaders.split(";"));

    headers.split(",").forEach((old_header) => {
      newHeaders.split(";").forEach((new_header) => {
        /**
         * Check if headers are the same. If they are, increase count
         */
        old_header.toLowerCase() === new_header.toLowerCase() ? count++ : null;
      });
    });
    console.log("count: ", count);
    console.log('headers.split(",").length: ', headers.split(",").length);

    /**
     * Check if count is equal to the number of headers in both the existing grid and in the number of headers in the newly uploaded csv file
     */
    if (
      count === headers.split(",").length &&
      count === newHeaders.split(";").length
    ) {
      console.log("The two data tables have the exact same headers");
    } else {
      console.log("The two data tables do not have the same headers");
    }
  });
}

function downloadCSV() {
  /**
   * Iterate over the data variable and add each array inside of the array (or "rows") to the original csv variable.
   * Due to how the join method works, all data types in each row are converted into strings.
   * Remember to specify new line with \n.
   */
  data.forEach((row) => {
    csv += row.join(",");
    csv += "\n";
  });

  /**
   * The goal is to eventually be able to download a csv-file upon button click and the file should contain the content of the csv variable.
   * The content of the csv variable can then be displayed in Excel or similar software in a table.
   *
   * We do this by creating a hidden element which links to the csv file and call the click method on this element within this function to simulate a mouse click.
   * By doing this we make it so the desired file is downloaded when this function is called.
   *
   * In this example, we accomplish this by creating a new anchor (or "link") element within the document.
   * We then set the destination of the link to be a data file of the type text and subtype csv-file. The link is now a hyperlink to a csv data file.
   * By adding the "charset" parameter, we specify the character set used for the characters in the data.
   * The function encodeURI() is then used on the csv variable to convert each character within the variable to be represented by the UTF-8 encoding of the characters.
   * The output of the encodeURI(csv) is added to the hyperlink reference.
   *
   * Then we add the attribute target to the link and give it the value of _blank to ensure that the file is not opened in the current tab.
   * This particular step has been historically important as not all browsers opened links in the same way. This step simply exists to ensure that all browsers, and all versions, open the link in the same way.
   */
  const hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";

  /**
   * Provide a name for the downloadable csv file and call the click() function on the link element to simulate a mouse click
   */
  hiddenElement.download = "data.csv";
  hiddenElement.click();
}

function createGridElements() {
  data.forEach((row) => {
    row.forEach((element) => {
      let gridItem = document.createElement("div");
      gridItem.setAttribute("class", "grid_element");
      gridItem.innerHTML = element;
      gridContainer.appendChild(gridItem);
    });
  });
}

function createGridHeaders() {
  headers.split(",").forEach((header) => {
    let gridItem = document.createElement("div");
    gridItem.setAttribute("class", "grid_header");
    gridItem.innerHTML = header;
    gridContainer.appendChild(gridItem);
  });
}
