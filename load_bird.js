const fileInput = document.getElementById('csv');
let birds = null ;

function parse_csv(content) {
  var csv_rows = content.split("\r\n") ;
  for(let i = 0; i < csv_rows.length ; i++){
    csv_rows[i] = csv_rows[i].split(",")
  }
  header = csv_rows[0]
  let maps = new Array( csv_rows.length - 1 )
  for(let j = 1; j < csv_rows.length; j++){
    row = csv_rows[j]
    let tmpmap = new Map()
    for(let k = 0; k <=6; k++){
      tmpmap.set( header[k], row[k] ) ;
    }

    let images = "" ;
    for(let k = 7; k < row.length - 1; k++){
      if (images.length > 0){
        images = images + ", "
      }
      images = images + row[k]
    }
    images = images.substr(1, images.length - 2)
    images = eval(images)
    tmpmap.set( header[7], images )

    tmpmap.set( header[8], row[row.length - 1])
    maps[j - 1] = tmpmap
  }

  return maps
}

function readFile(event){
  const reader = new FileReader()
  reader.onload = function(event){
    raw_content = reader.result
    parsed_content = parse_csv(raw_content)
    birds = parsed_content
    load_random_bird()
  }
  const file = fileInput.files[0]
  console.log(file)
  reader.readAsText(file, 'UTF-8')

}

function getRandomInt() {
  if (birds === null){
    return null;
  }
  return Math.floor(Math.random() * birds.length);
}

function load_random_bird(){
  let randint = getRandomInt()
  if (!(randint === null)){
    randmap = birds[randint]
    document.getElementById("vernacular-name").innerHTML = randmap.get("vernacular")
    document.getElementById("scientific-name").innerHTML = randmap.get("scientific")
    document.getElementById("size-value").innerHTML = randmap.get("size")
    document.getElementById("wingspan-value").innerHTML = randmap.get("wingspan")
    document.getElementById("order-value").innerHTML = randmap.get("order")
    document.getElementById("family-value").innerHTML = randmap.get("family")

    let images_url = randmap.get("image_url")
    randidx = Math.floor(Math.random() * images_url.length)
    bird_image = document.getElementById("bird-img")
    bird_image.src = images_url[randidx]
    document.querySelector(".bird-img-container").style.backgroundColor = random_color()


    audio = document.getElementById("bird-audio")
    audio_url = randmap.get("audio_url")
    if(audio_url.length > 0){
      audio.innerHTML = '<source id="bird-audio-source" type="audio/mpeg" src="' + audio_url + '">'
    }
    else{
      audio.innerHTML = ''
    }
    audio.load()

    map_image = document.getElementById("map-img")
    map_image.src = randmap.get("map_url")

    if(randmap.get("map_url").length > 0){
      map_image.onload = function(event){
        map_container = document.querySelector(".map")
        map_container.style.backgroundColor = "white"
        map_container.style.border = "2px black solid"
      }
    }
    else{
      map_container = document.querySelector(".map")
      map_container.style.backgroundColor = "transparent"
      map_container.style.border = "0px black solid"
    }


    hide_all_guessables()
  }
}

fileInput.addEventListener('change', readFile)
document.getElementById('load-bird-button').addEventListener('click', load_random_bird)


var getFileBlob = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
};

var blobToFile = function (blob, name) {
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
};

var getFileObject = function(filePathOrUrl, cb) {
       getFileBlob(filePathOrUrl, function (blob) {
          cb(blobToFile(blob, 'test.jpg'));
       });
};

var exf = getFileObject('./data/cleanbirdtable.csv', function (fileObject) {
     console.log(fileObject);
}); 

