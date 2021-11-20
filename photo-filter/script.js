let fullscreen = document.querySelector(".fullscreen");
let rangesArr = document.querySelectorAll("input[type='range']");

let fileInput = document.querySelector("input[type='file']");
let btns = document.querySelectorAll(".btn"),
  btnLoad = document.querySelector(".btn-load"),
  btnReset = document.querySelector(".btn-reset"),
  btnNext = document.querySelector(".btn-next"),
  btnSave = document.querySelector(".btn-save");

let canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d"),
  image = new Image();

let currUrl;
let lastUrl = "./assets/img/img.jpg";
let rootUrlImages = "./assets/img/";
let timeOfDay, lastTimeOfDay, lastIndexImage;
let pictureType = ".jpg";

let filtersAssociative = {
    blur: {name: 'blur', value: 0},
    invert: {name: 'invert', value: 0},
    sepia: {name: 'sepia', value: 0},
    saturate: {name: 'saturate', value: 100},
    hue: {name: 'hue-rotate', value: 0}
};

// Отрисовка картинки
draw("./assets/img/img.jpg");

function fillFromObj(){
    let arr = [];
    for(let item in filtersAssociative){
        arr.push(`${filtersAssociative[item].name}(${filtersAssociative[item].value})`);
    }
    return arr.join(" ");
}

function applyFilter(){
    let strFilters = fillFromObj();
    if((image.naturalWidth + image.naturalHeight) < 500) image.src = image.src;
    ctx.filter = strFilters;
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
}

function draw(url){
  image.setAttribute('crossOrigin', 'anonymous');
  image.src = url;
  image.onload = function(){
    canvas.width = image.width;
    canvas.height = image.height;
    applyFilter();
  };
}
// 

rangesArr.forEach(item => {
  changeValueOutput(item);
  item.addEventListener('input', () => changeValueOutput(item));
});

btnReset.addEventListener("click", resetFilters);
btnNext.addEventListener("click", showNextPicture);
fileInput.addEventListener("change", loadPicture); // вместо btnLoad "click"
btnSave.addEventListener("click", downloadPicture);

function changeActiveClassBtn(activeBtn) {
  btns.forEach(elem => {
      if(elem.classList.contains("btn-active")){
          elem.classList.remove("btn-active")
      }
  });
  activeBtn.classList.add("btn-active");
}

function changeValueOutput(item){
    let output = item.nextElementSibling;
    output.value = item.value;

    let currName = item.name;
    filtersAssociative[currName].value = `${item.value}${item.dataset.sizing}`;
    applyFilter();
}

function resetFilters() {
  changeActiveClassBtn(btnReset);
  rangesArr.forEach(item => {
      if(item.getAttribute("name") !== "saturate") item.value = 0;
      else item.value = 100;
      changeValueOutput(item);
  });
}

function determinateTimeOfDay() {
  let date = new Date();
  let hour = date.getHours();
  switch (true){
      case (hour >= 6 && hour < 12):
          timeOfDay = "morning/";
          break;
      case (hour >= 12 && hour < 18):
          timeOfDay = "day/";
          break;
      case (hour >= 18 && hour < 24):
          timeOfDay = "evening/";
          break;
      case (hour >= 0 && hour < 6):
          timeOfDay = "night/";
          break;
  }
}

function showNextPicture() {
  changeActiveClassBtn(btnNext);
  determinateTimeOfDay();

  if (currUrl === undefined || lastTimeOfDay !== timeOfDay) {
      currUrl = rootUrlImages + timeOfDay + "01.jpg"
      lastUrl = currUrl;
      lastTimeOfDay = timeOfDay;
      lastIndexImage = 1;
  }
  else {
    lastIndexImage = (lastIndexImage < 10) ? (lastIndexImage + 1) : 1;
    let currInd = (lastIndexImage < 10) ? `0${lastIndexImage}` : lastIndexImage.toString();
    currUrl = rootUrlImages + lastTimeOfDay + currInd + ".jpg";
  }
  draw(currUrl);
}

function loadPicture() {
  changeActiveClassBtn(btnLoad);
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(){
    matchedResult = reader.result.match(/^data:image.(.\w*)/);
    if(!matchedResult) return;

    pictureType = matchedResult[1];
    image.src = reader.result;
    draw(reader.result);
  };
  fileInput.value = "";
}

function downloadPicture() {
  changeActiveClassBtn(btnSave);
  var link = document.createElement('a');
  link.download = 'download' + pictureType;
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
}

// Полноэкранный режим
fullscreen.addEventListener("click", toggleFullScreen);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}