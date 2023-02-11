const downloadBtn = document.getElementById("download-btn");
const data = [
  [1, "Maria", true],
  [2, "Kerim", true],
  [3, "Ms. DumbDumb", false],
];

downloadBtn.addEventListener("click", downloadCSV);

function downloadCSV() {
  /**
   * In order for this particular solution to work, we need to work with data types of strings.
   * The following variable is to contain all data we want in our downloaded csv-file.
   * Firstly, we need to add the headers of the data we want to download
   */
  let csv = "Id,Name,isSmart\n";

  /**
   * Iterate over the data variable and add each array inside of the array (or "rows") to the original csv variable.
   * Due to how the join method works, all data types in each row are converted into strings.
   * Remember to specify new line with \n.
   */
  data.forEach((row) => {
    csv += row.join(",");
    csv += "\n";
  });

  console.log(csv);
}
