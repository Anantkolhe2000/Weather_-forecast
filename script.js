
const weatherApi = {
    key: '50938e2a19693d809cb773a61390d5d6',
    oneCallUrl: 'https://api.openweathermap.org/data/2.5/onecall',
};

let searchInputBox = document.getElementById('input-box');
searchInputBox.addEventListener('keypress', (event) => {
    if (event.keyCode == 13) {
        getWeatherReport(searchInputBox.value);
    }
});

function getWeatherReport(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApi.key}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const { lat, lon } = data.coord;
            fetch(`${weatherApi.oneCallUrl}?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${weatherApi.key}&units=metric`)
                .then(weather => weather.json())
                .then(showWeatherReport)
                .catch(error => {
                    console.error('Error fetching One Call API data:', error);
                    alert('Error fetching weather data. Please try again.');
                });
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Error fetching weather data. Please try again.');
        });
}
function showWeatherReport(weather) {
    let city_code = weather.cod;
    if (city_code === '400') {
        swal("Empty Input", "Please enter any city", "error");
        reset();
    } else if (city_code === '404') {
        swal("Bad Input", "Entered city didn't match", "warning");
        reset();
    } else {
        displayCurrentWeather(weather.current);
        displayHourlyForecast(weather.hourly);
        displayDailyForecast(weather.daily);
        changeBg(weather.current.weather[0].main);

        reset();
    }
}
function displayCurrentWeather(currentWeather) {
    let currentWeatherContainer = document.getElementById('current-weather');
    currentWeatherContainer.innerHTML = '';

    let temp = Math.round(currentWeather.temp);
    let sunrise = getTimeString(new Date(currentWeather.sunrise * 1000));
    let sunset = getTimeString(new Date(currentWeather.sunset * 1000));
    let weatherMain = currentWeather.weather[0].main;
    let iconClass = getIconClass(weatherMain);
    let feelsLike = currentWeather.feels_like;
    let humidity = currentWeather.humidity;
    let pressure = currentWeather.pressure;
    let windSpeed = currentWeather.wind_speed;

    let currentWeatherHTML = `
        <div class="location-details">
        <div class="weather" id="weather">${weatherMain} <i class="${iconClass}"></i></div>
          
            <div class="date" id="date">${dateManage(new Date())}</div>
        </div>
        <div class="weather-status">
            <div class="temp" id="temp">${temp}&deg;C </div>
            <div class="sunrise-sunset" id="sunrise-sunset">
                Sunrise: ${sunrise} / Sunset: ${sunset}
            </div>
        
            <div id="updated_on">Updated as of ${getTimeString(new Date())}</div>
        </div>
        <hr>
        <div class="day-details">
            <div class="basic">Feels like ${feelsLike}&deg;C | Humidity ${humidity}%<br>Pressure ${pressure} mb | Wind ${windSpeed} KMPH</div>
        </div>
    `;
    currentWeatherContainer.innerHTML = currentWeatherHTML;
}
function displayHourlyForecast(hourlyData) {
    let hourlyContainer = document.getElementById('hourly-forecast');
    hourlyContainer.innerHTML = '';

    if (hourlyData && hourlyData.length > 0) {
        hourlyData.forEach(hour => {
            let hourHTML = createHourlyHTML(hour);
            hourlyContainer.innerHTML += hourHTML;
        });
    } else {
        hourlyContainer.innerHTML = 'Hourly forecast data not available';
    }
}

function createHourlyHTML(hour) {
    return `
        <div class="hourly-item">
            <div class="hour">${new Date(hour.dt * 1000).getHours()}:00</div>
            <div class="temp">${Math.round(hour.temp)}&deg;C</div>
            <div class="weather">${hour.weather[0].main} <i class="${getIconClass(hour.weather[0].main)}"></i></div>
        </div>
    `;
}
function displayDailyForecast(dailyData) {
    let dailyContainer = document.getElementById('daily-forecast');
    dailyContainer.innerHTML = '';

    if (dailyData && dailyData.length > 0) {
        dailyData.forEach(day => {
            let dayHTML = `
                <div class="daily-item">
                    <div class="date">${dateManage(new Date(day.dt * 1000))}</div>
                    <div class="temp">${Math.floor(day.temp.min)}&deg;C (min) / ${Math.ceil(day.temp.max)}&deg;C (max)</div>
                    <div class="weather">${day.weather[0].main} <i class="${getIconClass(day.weather[0].main)}"></i></div>
                </div>
            `;
            dailyContainer.innerHTML += dayHTML;
        });
    }
}

function changeBg(status) {
}

function getIconClass(classArg) {
    return 'fas fa-cloud'; 
}
function reset() {
    let input = document.getElementById('input-box');
    input.value = '';
}
function addZero(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}
function getTimeString(todayDate) {
    let hour = addZero(todayDate.getHours());
    let minute = addZero(todayDate.getMinutes());
    return `${hour}:${minute}`;
}
function dateManage(dateArg) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let year = dateArg.getFullYear();
    let month = months[dateArg.getMonth()];
    let date = dateArg.getDate();
    let day = days[dateArg.getDay()];

    return `${date} ${month} (${day}) , ${year}`;
}
