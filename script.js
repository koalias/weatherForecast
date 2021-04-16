let city="";
// declarations
const searchCity = $("#search-city");
const searchButton = $("#search-button");
const clearButton = $("#clear-history");
const currentCity = $("#current-city");
const currentTemperature = $("#temperature");
const currentHumidty= $("#humidity");
const currentWSpeed=$("#wind-speed");
const currentUvindex= $("#uv-index");
let sCity=[];
// searches the city
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

//API key setup
const APIKey="d6c9a2fe14a7cdc4f093d05f17c623d5";

function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

async function currentWeather(city){
  
    const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    
    let response = await fetch(queryURL)
    const data = await response.json()
    console.log(data);
    
    const weathericon = data.weather[0].icon;

    const iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
    // The date format 
    const date=new Date(data.dt*1000).toLocaleDateString();
    //parse the response for name of city and concanatig the date and icon.
    $(currentCity).html(data.name +"("+date+")" + "<img src="+iconurl+">");
    // Convert the temp to fahrenheit
    const tempF = (data.main.temp - 273.15) * 1.80 + 32;
    $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
            // Display humidity
     $(currentHumidty).html(data.main.humidity+"%");
            //Display wind speed & convert to MPH
    const ws = data.wind.speed;
    const windsmph = (ws*2.237).toFixed(1);
            $(currentWSpeed).html(windsmph+"MPH");

            // Display UVIndex.
            UVIndex(data.coord.lon,data.coord.lat);
            forecast(data.id);
            if(data.cod==200){
                sCity=JSON.parse(localStorage.getItem("cityname"));
                console.log(sCity);
                if (sCity==null){
                    sCity=[];
                    sCity.push(city.toUpperCase()
                    );
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
                else {
                    if(find(city)>0){
                        sCity.push(city.toUpperCase());
                        localStorage.setItem("cityname",JSON.stringify(sCity));
                        addToList(city);
                    }
                }
            }

        }

    // returns UVIindex response
async function UVIndex(ln,lt){
    //lets build the url for uvindex.
    const uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    const response = await fetch(uvqURL);
    const data = await response.json()
    $(currentUvindex).html(data.value);
}
    
// 5 days forecast for current city
async function forecast(cityid){
    const dayover= false;
    const queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    const response = await fetch(queryforcastURL);
    const data = await response.json()
    for (i=0;i<5;i++){
        var date= new Date((data.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
        var iconcode= data.list[((i+1)*8)-1].weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
        var tempK= data.list[((i+1)*8)-1].main.temp;
        var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
        var humidity= data.list[((i+1)*8)-1].main.humidity;
    
        $("#fDate"+i).html(date);
        $("#fImg"+i).html("<img src="+iconurl+">");
        $("#fTemp"+i).html(tempF+"&#8457");
        $("#fHumidity"+i).html(humidity+"%");
    }
}

//passed city in search history
function addToList(c){
    const listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    const liEl = event.target;
    if (event.target.matches("li")){
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadlastCity(){
    $("ul").empty();
    let sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear search history
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);


