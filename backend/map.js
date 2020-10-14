// import fetch from 'node-fetch';
// import { parseData } from "./parse#2.js"
// import dssp_json from "./dssp.json";
const fs = require('fs');

function mapSurfaceData(filePath) {

    // var dssp_json = require('./dssp.json')
    // fetch('./dssp.json')
    // .then(rsp => rsp.json())
    // .then(dssp_json => console.log(dssp_json));

    // var json = $.getJSON({'url': "./dssp.json", 'async': false});  
    var dssp_json = JSON.parse(fs.readFileSync('./dssp.json'));
    // json = JSON.parse(json.responseText); 
    console.log(dssp_json)

    let ma_json = parseData(filePath);


    // let mappedData = new Array();
    // for (let peptide of json) {

    // }
    
}

mapSurfaceData('./ige.xlsx')