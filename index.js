const downloadBtn = document.getElementById("download-btn");
const data = [
  [1, "Maria", true],
  [2, "Kerim", true],
  [3, "Ms. DumbDumb", false],
];

downloadBtn.addEventListener("click", downloadCSV);

function downloadCSV() {
  console.log("Hello World");
}
