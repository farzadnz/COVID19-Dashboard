//Author: Farzad Khaleghi

//window.onload();
window.onload = fetchGlobalData();


let currentData;

function fetchGlobalData() {

    document.getElementById('globalOption').style.color = "orange";
    document.getElementById('dropDownOption').style.color = "white";

    document.getElementById('graphDetails').innerHTML = "";
    document.getElementById('totalCasesNum').innerHTML = "-";
    document.getElementById('totalRecNum').innerHTML = "-";
    document.getElementById('totalDeathsNum').innerHTML = "-";

    fetch('https://disease.sh/v3/covid-19/historical/all', {headers: {"Accept":"application/json"}})
    .then(response => response.json())
    .then(data => {

        currentData = data;
        //console.log(data);
        //console.log(data['cases']["12/20/20"]);
        let allDates = Object.keys(data['cases']);
        
        let mostRecentDate = new Date(allDates[0]);
        let recentDateIndex = 0;
        for (let i = 1; i < allDates.length; i++){
            let currDate = new Date(allDates[i]);
            if (currDate > mostRecentDate){
                mostRecentDate = currDate;
                recentDateIndex = i;
            }
        }

        //console.log(mostRecentDate);
        let globalCases = data['cases'][allDates[recentDateIndex]];
        let globalDeaths = data['deaths'][allDates[recentDateIndex]];
        let globalRecovered = data['recovered'][allDates[recentDateIndex]];

        let splittedDate = allDates[recentDateIndex].split('/');
        let formattedGlobalDate = splittedDate[1] + "/" + splittedDate[0] + "/" + "20" + splittedDate[2];

        document.getElementById('updateInfo').innerHTML = "All following info was last update on " + formattedGlobalDate;

        document.getElementById('countryChoice').innerHTML = "Global COVID-19 Statistics"
        document.getElementById('totalCasesNum').innerHTML = globalCases.toLocaleString();
        document.getElementById('totalRecNum').innerHTML = globalRecovered.toLocaleString();
        document.getElementById('totalDeathsNum').innerHTML = globalDeaths.toLocaleString();

        setupInput();
        
    });
}



fetch('https://disease.sh/v3/covid-19/historical', {headers: {"Accept":"application/json"}})
.then(response => response.json())
.then(data => getCountries(data));


function getCountries(data) {

    let allCountries = [];
    //console.log(data);

    data.forEach(element => {

        if (allCountries.indexOf(element['country']) === -1){
            allCountries.push(element['country']);
        }

    });

    allCountries.sort();
    //console.log(allCountries);

    allCountries.forEach(el => {
        let dropDownItem = document.createElement('a');
        let funcCall = "fetchCountry(\'" + el + "\')";
        dropDownItem.setAttribute('onclick', funcCall);
        dropDownItem.innerHTML = el;
        document.getElementById('dropDownContent').appendChild(dropDownItem);
        
    });
         
}

function fetchCountry(countryName) {

    document.getElementById('globalOption').style.color = "white";
    document.getElementById('dropDownOption').style.color = "orange";

    document.getElementById('graphDetails').innerHTML = "";


    document.getElementById('totalCasesNum').innerHTML = "-";
    document.getElementById('totalRecNum').innerHTML = "-";
    document.getElementById('totalDeathsNum').innerHTML = "-";
    
    let countryURL = 'https://disease.sh/v3/covid-19/historical/' + countryName;
    
    let countryNameTitle = countryName + " COVID-19 Statistics";

    document.getElementById('countryChoice').innerHTML = countryNameTitle;

    fetch(countryURL, {headers: {"Accept":"application/json"}})
    .then(response => response.json())
    .then(data => getData(data));
}


function getData(data) {

    currentData = data;

    let allData = data;
    //console.log(allData);

    let allCountrydates = Object.keys(data['timeline']['cases']);

    //console.log(allCountrydates);
        
    let latestDate = new Date(allCountrydates[0]);
    //console.log('look here:::: ' + allCountrydates[allCountrydates.length - 1]);
    let latestDateIndex = 0;
    for (let i = 1; i < allCountrydates.length; i++){
        let currentDate = new Date(allCountrydates[i]);
        if (currentDate > latestDate){
            latestDate = currentDate;
            latestDateIndex = i;
        }
    }

    let dateSplit = allCountrydates[latestDateIndex].split('/');
    let formattedDate = dateSplit[1] + "/" + dateSplit[0] + "/" + "20" + dateSplit[2];

    let cases = data['timeline']['cases'][allCountrydates[latestDateIndex]];
    let deaths = data['timeline']['deaths'][allCountrydates[latestDateIndex]];
    let recovered = data['timeline']['recovered'][allCountrydates[latestDateIndex]];


    document.getElementById('totalCasesNum').innerHTML = cases.toLocaleString();
    document.getElementById('totalRecNum').innerHTML = recovered.toLocaleString();
    document.getElementById('totalDeathsNum').innerHTML = deaths.toLocaleString();

    document.getElementById('updateInfo').innerHTML = "All following info was last update on " + formattedDate;

    setupInput();
    

}


/*This function gets called whenever the selection boxes change values,
it takes the current values from the selection boxes and calls the
createGraph function to make the correspoding graph*/
function setupInput(){

    let choosenGraph = document.getElementById('graphChoices').value;
    let choosenType = document.getElementById('graphTypes').value;

    createGraph(choosenGraph, choosenType);

}

/*The createGraph function takes two inputs, graph is the graph that
user wants to look at, graphType is the type of graph that the user
wants to see i.e. bar chart or line chart. The function then uses
SVG shapes to draw the graph that satisfies these inputs.*/
function createGraph(graph, graphType){

    document.getElementById("graphDetails").innerHTML = "";
    document.getElementById("graphTitle").innerHTML = "";


    let graphName;

    if (graph === "cases"){
        graphName = "cases";
    }
    else if (graph === "deaths"){
        graphName = "deaths";
    }
    else if (graph === "recoveries"){
        graphName = "recovered";
    }
    

    document.getElementById("graphTitle").innerHTML = "The total number of " + graph + " in the last 30 days (from when last updated)";

    let last30Days;

    if (currentData['timeline'] !== undefined){
        last30Days = currentData['timeline'][graphName];
    }
    else{
        last30Days = currentData[graphName];
    }

    let numbers = Object.values(last30Days);

    let last30DaysList = Object.entries(last30Days);

    
    let largest = numbers[0];

    for (let i = 1; i < numbers.length; i++){
        let currVal = numbers[i];
        if (currVal > largest){
            largest = currVal;
        }
    }


    if (graphType === "line" || graphType === "bar"){

        let maxYVal = ((Math.floor(largest / 10)) * 10) + 10;
    
        let eachYNum = maxYVal / 10;
        let currYNum = 0;

        const overallHeight = 145;
        const topHeight = 10;

        let currHeight = overallHeight;
        let eachYLen = (currHeight - topHeight) / 10;

        const originalX = 77;
        const xLength = 323;

        //drawing all the elements for the y-axis
        for (let i = 0; i < 10; i++){

            currHeight = currHeight - eachYLen;
            currYNum += eachYNum;

            let gridLineY = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLineY.setAttribute("x1", originalX);
            gridLineY.setAttribute("x2", xLength);
            gridLineY.setAttribute("y1", currHeight);
            gridLineY.setAttribute("y2", currHeight);
            gridLineY.setAttribute("stroke", "gray");
            gridLineY.setAttribute("opacity", "0.15")
            gridLineY.setAttribute("stroke-width", "0.75");

            document.getElementById('graphDetails').appendChild(gridLineY);

            
            let smallLineY = document.createElementNS("http://www.w3.org/2000/svg", "line");
            smallLineY.setAttribute("x1", originalX - 1);
            smallLineY.setAttribute("x2", originalX + 1);
            smallLineY.setAttribute("y1", currHeight);
            smallLineY.setAttribute("y2", currHeight);
            smallLineY.setAttribute("stroke", "black");
            smallLineY.setAttribute("stroke-width", "0.75");

            let yAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            yAxisText.setAttribute("x", String(originalX - 1 - (String(currYNum).length * 3.5) - 3));
            yAxisText.setAttribute("y", currHeight + 2);
            yAxisText.setAttribute("font-size", "6");
            yAxisText.textContent = currYNum.toLocaleString();

            document.getElementById('graphDetails').appendChild(yAxisText);
            document.getElementById('graphDetails').appendChild(smallLineY);


        }

        let currPos = 77;
        let eachXlen = 237.8 / 30; //

        //drawing all the elements for the x-axis
        for (let i = 0; i < 31; i++){

            currPos += eachXlen;
    
            let gridLineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLineX.setAttribute("x1", currPos);
            gridLineX.setAttribute("x2", currPos);
            gridLineX.setAttribute("y1", overallHeight);
            gridLineX.setAttribute("y2", "10");
            gridLineX.setAttribute("stroke", "gray");
            gridLineX.setAttribute("opacity", "0.15")
            gridLineX.setAttribute("stroke-width", "0.75");
    
            document.getElementById('graphDetails').appendChild(gridLineX);
    
            

            if (i < 30){

                let smallLineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
                smallLineX.setAttribute("x1", currPos);
                smallLineX.setAttribute("x2", currPos);
                smallLineX.setAttribute("y1", overallHeight - 1);
                smallLineX.setAttribute("y2", overallHeight + 1);
                smallLineX.setAttribute("stroke", "black");
                smallLineX.setAttribute("stroke-width", "0.75");
        
                document.getElementById('graphDetails').appendChild(smallLineX);

                let currdateSplit = last30DaysList[i][0].split("/");

                if (currdateSplit[0].length == 1){
                    currdateSplit[0] = "0" + currdateSplit[0];
                }
                
                if (currdateSplit[1].length == 1){
                    currdateSplit[1] = "0" + currdateSplit[1];
                }

                let currdateFormatted = currdateSplit[1] + "/" + currdateSplit[0] + "/" + "20" +currdateSplit[2];
        
                let xAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                xAxisText.setAttribute("x", currPos);
                xAxisText.setAttribute("y", overallHeight);
                xAxisText.setAttribute("font-size", "5");
                xAxisText.setAttribute("transform", "rotate(90 " + (currPos - 2.5) + " " + (overallHeight + 1) + ")");
                xAxisText.textContent = currdateFormatted;
        
                document.getElementById('graphDetails').appendChild(xAxisText);

            }
            
            
        
        }

        if (graphType === "bar"){

            let currLen = 77;

            //drawing the bars
            for (let i = 0; i < 30; i++){

                currLen += eachXlen;

                let currGraphVal = last30DaysList[i][1];
                let currHeight = overallHeight - (((overallHeight - topHeight)/maxYVal)) * currGraphVal;

                let graphBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                graphBar.setAttribute("x", currLen - 1.5);
                graphBar.setAttribute("y", currHeight);
                graphBar.setAttribute("height", overallHeight - currHeight);
                graphBar.setAttribute("width", "3");
                graphBar.setAttribute("stroke", "black");
                graphBar.setAttribute("stroke-width", "0.75");
                graphBar.setAttribute("fill", "green");

                document.getElementById('graphDetails').appendChild(graphBar);
            }


        }

        else if (graphType === "line"){

            let prevVal = {
                x: null,
                y: null
            }
        
            let currLen = 77;
            
            //drawing the lines and dots
            for (let i = 0; i < 30; i++){
        
                currLen += eachXlen;
        
                let currGraphVal = last30DaysList[i][1];
                let dotYLocation = overallHeight - (((overallHeight - topHeight)/maxYVal)) * currGraphVal;
        
                if (prevVal.x !== null && prevVal.y !== null){
        
                    let graphLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    graphLine.setAttribute("x1", prevVal.x);
                    graphLine.setAttribute("x2", currLen);
                    graphLine.setAttribute("y1", prevVal.y);
                    graphLine.setAttribute("y2", dotYLocation);
                    graphLine.setAttribute("stroke", "black");
                    graphLine.setAttribute("stroke-width", "0.75");
        
        
                    document.getElementById('graphDetails').appendChild(graphLine);
        
                }
        
                prevVal.x = currLen;
                prevVal.y = dotYLocation;
                
                let dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                dot.setAttribute("cx", currLen);
                dot.setAttribute("cy", dotYLocation);
                dot.setAttribute("r", "0.5");
                dot.setAttribute("stroke", "black");
                dot.setAttribute("fill", "black");
        
                document.getElementById('graphDetails').appendChild(dot);
        
        
            }



        }


        let xAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xAxisTitle.setAttribute("x", "50%");
        xAxisTitle.setAttribute("y", "185");
        xAxisTitle.setAttribute("text-anchor", "middle");
        xAxisTitle.setAttribute("font-size", "6");
        xAxisTitle.textContent = "Dates";

        document.getElementById('graphDetails').appendChild(xAxisTitle);

        let yAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yAxisTitle.setAttribute("x", "50");

        let yVal = originalX - (String(maxYVal).length * 1.75);
        yAxisTitle.setAttribute("y", yVal);
        yAxisTitle.setAttribute("text-anchor", "middle");
        yAxisTitle.setAttribute("transform", "rotate(-90 50 77.5)");
        yAxisTitle.setAttribute("font-size", "6");
        yAxisTitle.textContent = "The number of " + graph;

        document.getElementById('graphDetails').appendChild(yAxisTitle);


    }


}