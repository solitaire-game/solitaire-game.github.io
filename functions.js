console.log("functions.js loaded");

function importCss(path){

let name = path.split('/');
const last = name.length -1;
name = name[last].split('.');
name = name[0];
    const cssId = name;  // you could encode the css path itself to generate id..
        if (!document.getElementById(cssId)) {
          var head = document.getElementsByTagName('head')[0];
          var link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = path;
          link.media = 'all';
          head.appendChild(link);
        }
}


export{importCss}