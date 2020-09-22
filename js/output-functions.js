'use strict';

// заголовок с датой-----------------------------------------------------
function outputHeaderWithTheDate() {
    let datesTitle = document.querySelectorAll('.weather-main__day__date');
    for (let i = 0; i < datesTitle.length; i++) {
        // в каждый заголовок выводим на 1 день больше чем предыдущий
        datesTitle[i].textContent = moment().add(i + 1, 'days').format('dd, DD/MM');

        let textContentDatesTitle = datesTitle[i].textContent;
        // проверяем, выходные ли это дни, если да, добавляем класс с другим цветом текста
        if (textContentDatesTitle.startsWith('Сб') || textContentDatesTitle.startsWith('Вс')) {
            datesTitle[i].classList.add('day__date_weekends');
        }
    }
}
// заголовок с датой-----------------------------------------------------

// иконки погоды---------------------------------------------------------       
function outputOfTheIcons(temperatureDataForAllDaysArray) {
    let iconsWeather = document.querySelectorAll('.weather-main__day > img');
    for (let i = 0; i < iconsWeather.length; i++) {
        // перебираем img, берём из iтого элемента массива объект, в котором получаем код иконки
        let codeIcon = temperatureDataForAllDaysArray[i]['day']['codeIcon'];
        let iconUrl = `https://openweathermap.org/img/wn/${codeIcon}@2x.png`;
        iconsWeather[i].src = iconUrl; // присваиваем каждой img свой src
    }
}
// иконки погоды--------------------------------------------------------- 

// значения температуры--------------------------------------------------
// вывод дневной температуры     
function outputDayTimeTemperature(temperatureDataForAllDaysArray) {
    let outDayTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .day');
    for (let i = 0; i < outDayTimeTemperature.length; i++) {
        let temperature = Math.round(temperatureDataForAllDaysArray[i]['day']['temperature'] - 273.15);
        outDayTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
    }
}
// вывод ночной температуры
function outputNightTimeTemperature(temperatureDataForAllDaysArray) {
    let outNightTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .night');
    for (let i = 0; i < outNightTimeTemperature.length; i++) {
        let temperature = Math.round(temperatureDataForAllDaysArray[i]['night']['temperature'] - 273.15);
        outNightTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
    }
}
// значения температуры--------------------------------------------------

// общее описание погоды-------------------------------------------------
function outputDescription(temperatureDataForAllDaysArray) {
    let outDescriptionWeather = document.querySelectorAll('.weather-main__day_description');
    for (let i = 0; i < outDescriptionWeather.length; i++) {
        let description = temperatureDataForAllDaysArray[i]['day']['description'];
        outDescriptionWeather[i].textContent = description;
    }
}
// общее описание погоды-------------------------------------------------

// вывод давления--------------------------------------------------------
function outputPressure(temperatureDataForAllDaysArray) {
    let itemPressure = document.querySelectorAll('.weather-main__day > ul > li:first-child');
    for (let i = 0; i < itemPressure.length; i++) {
        let pressure = Math.round(temperatureDataForAllDaysArray[i]['day']['pressure'] * 0.737);
        itemPressure[i].innerHTML = `<span class="icon-compass-pointing"></span>${pressure} мм`;
    }
}
// вывод давления--------------------------------------------------------

// вывод влажности--------------------------------------------------------
function outputHumidity(temperatureDataForAllDaysArray) {
    let itemHumidity = document.querySelectorAll('.weather-main__day > ul > li:nth-child(2)');
    for (let i = 0; i < itemHumidity.length; i++) {
        let humidity = temperatureDataForAllDaysArray[i]['day']['humidity'];
        itemHumidity[i].innerHTML = `<span class="icon-drop-of-water"></span>${humidity}%`;
    }
}
// вывод влажности--------------------------------------------------------

// вывод скорости ветра--------------------------------------------------------
function outputWind(temperatureDataForAllDaysArray) {
    let itemWind = document.querySelectorAll('.weather-main__day > ul > li:last-child');
    for (let i = 0; i < itemWind.length; i++) {
        let windSpeed = temperatureDataForAllDaysArray[i]['day']['windSpeed'];
        let windDeg = temperatureDataForAllDaysArray[i]['day']['windDeg'];
        itemWind[i].innerHTML = `<span class="icon-wind-weather"></span>${windSpeed.toFixed(1)} м/c, ${getWindDirection(windDeg)}`;
    }
}
// вывод скорости ветра--------------------------------------------------------

function getTemperature(dayNumber, data) {
    const temperatureData = { // объект куда будем записывать данные температуры за ночь и день
        'night': {},
        'day': {},
    };
    // console.log(temperatureData);

    for (const key in data['list']) { // перебираем list
        // console.log(data['list'][key]);
        for (const key2 in data['list'][key]) { // перебираем значение каждого ключа list, это объект
            // console.log(data['list'][key][key2]);
            // получаем данные о температуре на ночь указанной даты
            if (data['list'][key]['dt_txt'] == `${dayNumber} 00:00:00`) {
                // создаём свойства объекта и записываем в значение данные
                // записываем в значение ключа night, значение это объект и мы записываем свойства с данными
                temperatureData['night']['date'] = data['list'][key]['dt_txt'];

                temperatureData['night']['humidity'] = data['list'][key].main.humidity;
                temperatureData['night']['pressure'] = data['list'][key].main.pressure;
                temperatureData['night']['temperature'] = data['list'][key].main.temp;
                temperatureData['night']['description'] = data['list'][key].weather['0'].description;
                temperatureData['night']['codeIcon'] = data['list'][key].weather['0'].icon;

                temperatureData['night']['windSpeed'] = data['list'][key].wind.speed;
                temperatureData['night']['windDeg'] = data['list'][key].wind.deg;

                break;
            }

            // получаем данные о температуре на полдень указанной даты
            // если значение ключа даты равно завтрашней дате на 12 часов, то мы берём данные из этого объекта
            if (data['list'][key]['dt_txt'] == `${dayNumber} 12:00:00`) {
                // создаём свойства объекта и записываем в значение данные
                // записываем в значение ключа day, значение это объект и мы записываем свойства с данными
                temperatureData['day']['date'] = data['list'][key]['dt_txt'];

                temperatureData['day']['humidity'] = data['list'][key].main.humidity;
                temperatureData['day']['pressure'] = data['list'][key].main.pressure;
                temperatureData['day']['temperature'] = data['list'][key].main.temp;
                temperatureData['day']['description'] = data['list'][key].weather['0'].description;
                temperatureData['day']['codeIcon'] = data['list'][key].weather['0'].icon;

                temperatureData['day']['windSpeed'] = data['list'][key].wind.speed;
                temperatureData['day']['windDeg'] = data['list'][key].wind.deg;

                break;
            }
        }
        // console.log(data['list'][key]);
    }
    return temperatureData; // возвращаем объект с погодой на день и ночь
}