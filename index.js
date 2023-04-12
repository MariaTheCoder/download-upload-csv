async function main() {
  const downloadBtn = document.getElementById("download-btn");
  const uploadBtn = document.getElementById("upload-btn");
  const gridHeaders = document.getElementById("grid-headers");
  const gridRecords = document.getElementById("grid-records");
  const selectFile = document.getElementById("upload");

  const response = await fetch("http://localhost:9000/posts");
  let data;

  if (response.ok) {
    data = await response.json();
  } else {
    console.log(response.status);
    data = {};
  }

  /**
   * Run the render function the first time in order create a grid in the document
   */
  render(data.headers, data.data);

  downloadBtn.addEventListener("click", downloadCSV);

  uploadBtn.addEventListener("click", readCSV);

  function readCSV() {
    /**
     * First check if a file was loaded. If not, jump out of the function
     */
    if (selectFile.files.length <= 0) {
      return;
    }

    /**
     * If a file was correctly selected, use the FileReader object to see the content of the file.
     * Get access to selected file by using the files property of the HTMLInputElement selectFile.
     * This returns a FileList object. Save this into a constant variable called 'file'.
     *
     * To read the file, we can use a FileReader object.
     * Construct a new FileReader object and save it into a constant variable called 'fileReader'.
     * The FileReader object has an instance method called readAsText() which reads the content of a file.
     * If the file is read correctly, the content of the file will be stored inside of the result attribute in the form of a string.
     */
    const file = selectFile.files[0];
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
    fileReader.addEventListener("load", async () => {
      /**
       * Now we iterate over the result with two goals.
       * For starts, we want to find and replace \r at the end of each string line with ''.
       * The invisible character is attached to the value of isSmart in each line, a.k.a. the value in the last column.
       * We can cut this character out with the replaceAll method.
       * Secondly, we want to replace the value of the variable data and change its content content with the content of the file that was just uploaded
       */

      let newData = fileReader.result.replaceAll("\r", "").split("\n");
      newData = newData.map((row) => row.split(";"));
      console.log("data after load: ", newData);

      /**
       * Save the new headers in the same format as the csv variable from earlier
       */

      const currentHeaders = data.headers;
      const newHeaders = newData[0];

      /**
       * Check if the headers of the uploaded file are identical to the headers used in the grid
       *
       * We do this because if the headers are the same, we want to add grid elements to the existing grid rather than replace the entire grid
       * First, we want all headers to be in all lowercase, then we sort the headers alphabetically and compare.
       *
       * If a direct comparison with two equal signs returns a boolean value of true, then the headers are identical
       */

      const sortedHeaders = currentHeaders
        .map((header) => header.toLowerCase())
        .sort();
      const sortedNewHeaders = newHeaders
        .map((header) => header.toLowerCase())
        .sort();
      const newRecords = [];

      /**
       * The records should also be stored separately from the headers in its own constant variable
       * First, we need to get store the part of the newData variable that includes only reocords and no headers
       * Second, we want to lowercase boolean values
       */
      const tempNewRecords = newData.slice(1);
      const tempNewRecordsLowercaseBoolean = tempNewRecords
        .join()
        .replaceAll("TRUE", "true")
        .replaceAll("FALSE", "false")
        .split(",");

      for (
        let i = 0;
        i < tempNewRecordsLowercaseBoolean.length;
        i += newHeaders.length
      ) {
        const chunk = tempNewRecordsLowercaseBoolean.slice(
          i,
          i + newHeaders.length
        );
        newRecords.push(chunk);
      }

      console.log("newRecords: ", newRecords);

      if (sortedHeaders.toString() === sortedNewHeaders.toString()) {
        console.log("The headers are identical!");

        for (let i = 0; i < newRecords.length; i++) {
          const record = newRecords[i];

          record.forEach((record) => {
            let gridItem = document.createElement("div");
            gridItem.setAttribute("class", "grid_element");
            gridItem.innerHTML = record;
            gridHeaders.appendChild(gridItem);
          });
        }
      } else {
        /**
         * Overwrite the old headers and records in the data variable with the data contained in the selected file
         */

        deleteAllPosts();
        console.log(newHeaders);
        data = await sendNewPosts(newHeaders, newRecords);
        console.log("updated data variable: ", data);
        /**
         * Replace existing grid with a new one.
         * The records in the new grid should match the content of the selected csv file
         */

        gridHeaders.innerHTML = "";
        gridRecords.innerHTML = "";

        render(data.headers, data.records);
      }
    });
  }

  function downloadCSV() {
    /**
     * In order for this particular solution to work, we need to work with data types of strings.
     * The following variable is to contain all data we want in our downloaded csv-file.
     * Firstly, we need to add the headers of the data we want to download
     */
    let csv = data.headers.join().concat("\n");

    /**
     * Iterate over the data variable and add each array inside of the array (or "rows") to the original csv variable.
     * Due to how the join method works, all data types in each row are converted into strings.
     * Remember to specify new line with \n.
     */
    data?.data.map((row) => row.map((element) => csv.concat(element)));

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

  function render(headers, records) {
    createGridHeaders(headers);
    createGridElements(records);
  }

  async function deleteAllPosts() {
    const response = await fetch("http://localhost:9000/posts", {
      method: "DELETE",
    });

    if (response.ok) {
      data = await response.json();
      console.log('content of "data": ', data);
    } else {
      console.log(response.status);
    }
  }

  async function sendNewPosts(headers, records) {
    const response = await fetch("http://localhost:9000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      // Adding body or contents to send
      body: JSON.stringify({ headers, records }),
    });

    if (response.ok) {
      return response.json();
    } else {
      console.log(response.status);
      return {};
    }
  }

  async function sendEditedPost(record) {
    const response = await fetch("http://localhost:9000/put/:id", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (response.ok) {
      return response.json();
    } else {
      console.log(response.status);
      return {};
    }
  }

  function createGridElements(data) {
    data.forEach((row) => {
      for (let i = 0; i < row.length - 1; i++) {
        const element = row[i];

        let gridItem = document.createElement("div");
        gridItem.setAttribute("class", "grid_element");
        gridItem.setAttribute("postId", row[0]);
        gridItem.innerHTML = element;
        gridRecords.appendChild(gridItem);
      }
      createEditActionButton(row[0]);
    });
  }

  function createGridHeaders(headers) {
    headers.forEach((header) => {
      let gridItem = document.createElement("div");
      gridItem.setAttribute("class", "grid_header");
      gridItem.innerHTML = header;
      gridHeaders.appendChild(gridItem);
    });
  }

  function createEditActionButton(postId) {
    let editActionButton = document.createElement("div");
    editActionButton.setAttribute("class", "action_buttons");
    editActionButton.setAttribute("postId", postId);
    editActionButton.innerHTML = "✏️";

    editActionButton.addEventListener("click", async (event) => {
      const currentPostId = Number(event.target.getAttribute("postid"));
      console.log("currentPostId: ", currentPostId);

      const foundIndex = data?.data.findIndex(
        (record) => record[0] === currentPostId
      );
      console.log("foundIndex: ", foundIndex);
      let tempCopy = data.data[foundIndex];
      console.log("temp: ", data);
      tempCopy[3]["editOn"] = true;

      console.log("tempCopyEdited: ", tempCopy);
      data.data[foundIndex] = await sendEditedPost(tempCopy);

      console.log("edited?: ", data.data[foundIndex]);
    });

    gridRecords.appendChild(editActionButton);
  }
}

main();
