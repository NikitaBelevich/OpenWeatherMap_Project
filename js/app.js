'use strict';

moment.updateLocale('ru', { // добавляем наши сокращения дней
    weekdaysMin : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
});

// дата для города-------------------------------------------------------------------------------
const dateInTitle = document.querySelector('.country-city__date'); // элемент для вывода даты
// функция получает сдвиг по UTC и учитывая это выводит даду для каждого города
function getDateGMTForCity(timezone) {
    const UTCDate = moment.utc().utcOffset(timezone); // даём сдвиг зоны
    const UTCDay = UTCDate.day();
    const UTCMonth = UTCDate.month();
    dateInTitle.textContent = UTCDate.format(`сегодня ${translateIndexDayInTheTitle(UTCDay)}, DD ${translateIndexMonthInTheTitle(UTCMonth)} YYYY, HH:mm`);
}
//получение даты(название дня недели)
function translateIndexDayInTheTitle(day) {
    const weekDays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
    return weekDays[day];
}
//получение месяца
function translateIndexMonthInTheTitle(month) {
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return months[month];
}
// дата для города--------------------------------------------------------------------------------

// функция для вывода температуры со знаком плюс либо минус------------------------
// должна находиться в глобальной видимости! Вызывается в 3 местах
function addTemperatureSign(valueTemperature) {
    return (valueTemperature > 0) ? `+${valueTemperature}&deg;` : `${valueTemperature}&deg;`;
}
// функция для вывода температуры со знаком плюс либо минус------------------------

// функция определяет и возвращает сторону света с которой идёт ветер
function getWindDirection(deg) {
    let titleDirection = '';
    if (deg >= 15 && deg <= 75) {
        titleDirection = 'CB';
    } else if (deg > 75 && deg <= 105) {
        titleDirection = 'B';
    } else if (deg > 105 && deg <= 165) {
        titleDirection = 'ЮВ'; 
    } else if (deg > 165 && deg <= 195) {
        titleDirection = 'Ю';
    } else if (deg > 195 && deg <= 255) {
        titleDirection = 'ЮЗ';
    } else if (deg > 255 && deg <= 285) {
        titleDirection = 'З';
    } else if (deg > 285 && deg <= 345) {
        titleDirection = 'СЗ';
    } else if (deg > 345 || deg < 15) {
        titleDirection = 'С'; 
    }
    return titleDirection;
}

// функция рассчитывает и возвращает уровень влажности в зависимости от процента влажности
function getHumidityLevel(humidityPercentage) {
    let titleHumidity = '';
    if (humidityPercentage <= 20) {
        titleHumidity = 'влажность очень низкая';
    } else if (humidityPercentage > 20 && humidityPercentage <= 40) {
        titleHumidity = 'влажность низкая';
    } else if (humidityPercentage > 40 && humidityPercentage <= 60) {
        titleHumidity = 'влажность оптимальная';
    } else if (humidityPercentage > 60 && humidityPercentage <= 70) {
        titleHumidity = 'влажность повышенная';
    } else if (humidityPercentage > 70 && humidityPercentage <= 80) {
        titleHumidity = 'влажность высокая';
    } else if (humidityPercentage > 80) {
        titleHumidity = 'влажность очень высокая';
    }
    return titleHumidity;
}

// функция определяет и возвращает ветер по шкале Бофорта
function getNameWind(windSpeed) {
    let titleWind = '';
    if (windSpeed <= 1) {
        titleWind = 'штиль';
    } else if (windSpeed > 1 && windSpeed <= 5) {
        titleWind = 'слабый ветер';
    } else if (windSpeed > 5 && windSpeed <= 10) {
        titleWind = 'умеренный ветер';
    } else if (windSpeed > 10 && windSpeed <= 18) {
        titleWind = 'сильный ветер';
    } else if (windSpeed > 18 && windSpeed <= 28) {
        titleWind = 'шторм';
    } else if (windSpeed > 29) {
        titleWind = 'ураган';
    }
    return titleWind;
}

// погода на текущий момент ссылка
// https://api.openweathermap.org/data/2.5/weather?id=520555&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705
       
// погода на 5 дней ссылка
// http://api.openweathermap.org/data/2.5/forecast?id=520555&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705

// https://wallbox.ru/wallpapers/main/201550/fe94967661b23ca.jpg



const preloader = document.querySelector('.preloader');
const containerWeather = document.querySelector('.weather');
// Загружаем первый раз при загрузке страницы, т.к изначально данные стоят для Москвы
awaitLoadPhotoOfCity('./img/Moscow.jpg');
/*
Функция принимает url картинки города, создаёт узел img и ждёт загрузки картинки, затем добавляет её в качестве фона.
Изначально включается прелоадер, чтобы скрыть отрисовку, затем когда всё загрузилось, прелоадер выключается.
*/
function awaitLoadPhotoOfCity(urlCity) {
    // Включаем прелоадер пока будем ждать загрузку картинки
    enablePreloader(preloader);
    
    let promiseLoadImage = new Promise((resolve, reject) => {
        const cityImg = new Image();
        cityImg.src = urlCity;
        cityImg.alt = '';
        cityImg.classList.add('weather__background-city');
        cityImg.onload = () => {resolve(cityImg);}
        cityImg.onerror = () => {reject(new Error(`Image loading error: ${urlCity}`));}
    });
    promiseLoadImage
        .then((img) => {
            // Картинка загружена, вставляем на страницу
            containerWeather.prepend(img);
        })
        .catch((err) => {
            // Если не загрузилась фоновая картинка, даём обычный фон
            console.error(err.message);
            containerWeather.style.backgroundColor = '#3c7bde';
        })
        .finally(() => {
            // При любых обстоятельствах закрываем прелоадер
            setTimeout(() => {disablePreloader(preloader);}, 500);
        })
}
function enablePreloader(preloader) {
    preloader.style.transition = 'none';
    preloader.classList.add('preloader-show');
}
function disablePreloader(preloader) {
    preloader.classList.remove('preloader-show');
    preloader.style.transition = '0.6s ease-out';
}


// первые 2 запроса выполняются при загрузке и выводят данные по погоде Москвы
// запрос погоды на текущий момент---------------------------------------------------------------------------
fetch(`https://api.openweathermap.org/data/2.5/weather?id=524901&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
.then(function (resp) { return resp.json() })
.then(function (data) {
    // console.log(data);

    // вывод даты и времени города со смещением пояса в заголовок
    const timezoneCity = data['timezone'] / 60; // из секунд в минуты по требованию метода
    getDateGMTForCity(timezoneCity);

    // подстановка имени города
    let nameCity = data.name;
    let titleCity = document.querySelector('.country-city > div > span');
    titleCity.textContent = nameCity;

    // подстановка иконки погоды
    let weatherIcon = document.querySelector('#weather-icon');
    let codeIcon = data.weather['0']['icon'];
    let iconUrl = `https://openweathermap.org/img/wn/${codeIcon}@2x.png`;
    weatherIcon.src = iconUrl; // записываем URL в img

    // вывод температуры
    let outTemperature = document.querySelector('.temperature > span');
    let currentTemperature = Math.round(data['main']['temp'] - 273.15); // переводим в цельсии и округляем
    outTemperature.innerHTML = addTemperatureSign(currentTemperature);

    // вывод описания погоды
    let weatherDescription = document.querySelector('.description-weather');
    weatherDescription.textContent = data['weather']['0']['description'];

    // давление
    let pressure = Math.round(data['main']['pressure'] * 0.737); // переводим гектопаскали в мм рт.ст.
    let itemPressure = document.querySelector('.parametr-list > ul #pressure');
    itemPressure.insertAdjacentHTML('beforeend', `${pressure} мм рт. ст.`);

    // влажность 
    let humidity = data['main']['humidity'];
    let itemHumidity = document.querySelector('.parametr-list > ul #humidity');
    itemHumidity.insertAdjacentHTML('beforeend', `${humidity}% ${getHumidityLevel(humidity)}`);

    // ветер
    let wind = data['wind']['speed'];
    let windDirection = data['wind']['deg'];
    let itemWind = document.querySelector('.parametr-list > ul #wind');
    itemWind.insertAdjacentHTML('beforeend', `${wind} м/c, ${getWindDirection(windDirection)}, ${getNameWind(wind)}`);
    // ветер

    // восход, закат
    let sunriseTimeUNIX = data['sys']['sunrise']; // UNIX Time
    let sunsetTimeUNIX = data['sys']['sunset']; // UNIX Time
    // переводим время с помощью библиотеки
    let sunriseTimeNormal = moment.unix(sunriseTimeUNIX).format('HH:mm'); // восход
    let sunsetTimeNormal = moment.unix(sunsetTimeUNIX).format('HH:mm'); // закат

    // выводим время восхода и захода рядом с иконками
    let spanSunrise = document.querySelector('.parametr-list > ul .icon-sunrise');
    spanSunrise.insertAdjacentHTML('afterend', sunriseTimeNormal);
    let spanSunset = document.querySelector('.parametr-list > ul .icon-sunset');
    spanSunset.insertAdjacentHTML('afterend', sunsetTimeNormal);
    // восход, закат
})
.catch(function () {
    // catch any errors
});
// запрос погоды на текущий момент---------------------------------------------------------------------------

// запрос погоды на 5 дней----------------------------------------------------------------------------------
fetch(`https://api.openweathermap.org/data/2.5/forecast?id=524901&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
        .then(function (resp) { return resp.json() })
        .then(function (data) {
            
            // console.log(data);
            
            // day1.setDate(day1.getDate() + 1); // завтрашний день
            let day1 = moment().add(1, 'days').format('YYYY-MM-DD'); // завтрашний день с помощью библиотеки
            let day2 = moment().add(2, 'days').format('YYYY-MM-DD');
            let day3 = moment().add(3, 'days').format('YYYY-MM-DD');
            let day4 = moment().add(4, 'days').format('YYYY-MM-DD');
            // console.log(`${day1} 15:00:00`);

            // вызываем функцию 4 раза, получаем объекты с погодой по каждому дню
            let temperatureDataDay1 = getTemperature(day1);
            let temperatureDataDay2 = getTemperature(day2);
            let temperatureDataDay3 = getTemperature(day3);
            let temperatureDataDay4 = getTemperature(day4);

            // записываем данные по всем дням в массив
            const temperatureDataForAllDaysArray = [
                temperatureDataDay1,
                temperatureDataDay2,
                temperatureDataDay3,
                temperatureDataDay4,
            ];
            // console.log(temperatureDataForAllDaysArray);

            // вывод информации на страницу
            // заголовок с датой----------------------------------------------------
            outputHeaderWithTheDate();
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
            outputOfTheIcons();
            function outputOfTheIcons() {
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
            outputDayTimeTemperature(); 
            function outputDayTimeTemperature() {
                let outDayTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .day');
                for (let i = 0; i < outDayTimeTemperature.length; i++) {
                    let temperature = Math.round(temperatureDataForAllDaysArray[i]['day']['temperature'] - 273.15);
                    outDayTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
                }
            }
            // вывод ночной температуры
            outputNightTimeTemperature(); 
            function outputNightTimeTemperature() {
                let outNightTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .night');
                for (let i = 0; i < outNightTimeTemperature.length; i++) {
                    let temperature = Math.round(temperatureDataForAllDaysArray[i]['night']['temperature'] - 273.15);
                    outNightTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
                }
            }
            // значения температуры--------------------------------------------------
            // общее описание погоды-------------------------------------------------
            outputDescription();
            function outputDescription() {
                let outDescriptionWeather = document.querySelectorAll('.weather-main__day_description');
                for (let i = 0; i < outDescriptionWeather.length; i++) {
                    let description = temperatureDataForAllDaysArray[i]['day']['description'];
                    outDescriptionWeather[i].textContent = description;
                }
            }
            // общее описание погоды-------------------------------------------------
            // вывод давления--------------------------------------------------------
            outputPressure();
            function outputPressure() {
                let itemPressure = document.querySelectorAll('.weather-main__day > ul > li:first-child');
                for (let i = 0; i < itemPressure.length; i++) {
                    let pressure = Math.round(temperatureDataForAllDaysArray[i]['day']['pressure'] * 0.737);
                    itemPressure[i].insertAdjacentHTML('beforeend', `${pressure} мм`);
                }
            }
            // вывод давления--------------------------------------------------------
            // вывод влажности--------------------------------------------------------
            outputHumidity();
            function outputHumidity() {
                let itemHumidity = document.querySelectorAll('.weather-main__day > ul > li:nth-child(2)');
                for (let i = 0; i < itemHumidity.length; i++) {
                    let humidity = temperatureDataForAllDaysArray[i]['day']['humidity'];
                    itemHumidity[i].insertAdjacentHTML('beforeend', `${humidity}%`);
                }
            }
            // вывод влажности--------------------------------------------------------
            // вывод скорости ветра--------------------------------------------------------
            outputWind();
            function outputWind() {
                let itemWind = document.querySelectorAll('.weather-main__day > ul > li:last-child');
                for (let i = 0; i < itemWind.length; i++) {
                    let windSpeed = temperatureDataForAllDaysArray[i]['day']['windSpeed'];
                    let windDeg = temperatureDataForAllDaysArray[i]['day']['windDeg'];
                    itemWind[i].insertAdjacentHTML('beforeend', `${windSpeed.toFixed(1)} м/c, ${getWindDirection(windDeg)}`)
                }
            }
            // вывод скорости ветра--------------------------------------------------------
            // вывод информации на страницу

            function getTemperature(dayNumber) {
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
                        // получаем данные о температуре на ночь указанной даты

                        // получаем данные о температуре на полдень указанной даты
                        // если значение ключа даты равно завтрашней дате на 15 часов, то мы берём данные из этого объекта
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
                        // получаем данные о температуре на полдень указанной даты
                        //     // console.log(data['list'][key]['dt_txt']);
                    }
                    // console.log(data['list'][key]);
                }
                return temperatureData; // возвращаем объект с погодой на день и ночь
            }

        })
        .catch(function () {
            // catch any errors
        });
// запрос погоды на 5 дней----------------------------------------------------------------------------------


        // объект с фотографиями городов
        const photosCities = {
            'Москва': './img/Moscow.jpg',
            // https://avatars.mds.yandex.net/get-zen_doc/50509/pub_5cb067cb19feb400b5a02969_5cb078385c891100b324e6b5/scale_1200
            // https://www.ruspeach.com/upload/iblock/942/942212a3486b45bb5b0501d6cb11a10c.jpg
            'Санкт-Петербург': 'https://cdn.getyourguide.com/img/tour_img-1737994-148.jpg',
            'Нижний Новгород': 'https://avatars.mds.yandex.net/get-pdb/480866/9a17b582-ad01-4753-9143-0a467deb255e/s1200',
            'Владивосток': 'https://forumvostok.ru/upload/medialibrary/d09/d09a266b52d7ebac0915f0f395b7ae64.jpg',
            'Якутск': 'https://putevoditel-oz.ru/sites/default/files/yakutsk-2.png',
            'Сочи': 'https://i.ytimg.com/vi/JT4a1xSB5MI/maxresdefault.jpg',
            'Дубай': 'https://coinrevolution.com/wp-content/uploads/2018/11/The-First-Cryptocurrency-Exchange-in-Dubai-UAE_coinrevolution.com-news.jpg',
            'Лондон': 'https://afisha.london/wp-content/uploads/2018/01/28069590_xl-Houses-of-Parliament.jpg',
            'Глазго': 'https://images.theconversation.com/files/280984/original/file-20190624-97745-1cu0wfu.jpg?ixlib=rb-1.1.0&q=15&auto=format&w=600&h=450&fit=crop&dpr=3',
            'Лас-Вегас': 'https://i.artfile.me/wallpaper/03-07-2017/1920x1358/goroda-las-vegas--ssha-las-vegas-1187674.jpg',
            'Вашингтон': 'https://www.fitsnews.com/wp-content/uploads/2017/06/iStock-476247849-e1497022310130.jpg',
            'Альбукерке': 'https://lh5.googleusercontent.com/-LhXZ1GFeT3k/UzGdVpA-3XI/AAAAAAAAAGs/VtlmqvZ0IKs-BAfaZC2Xq-1NadTKSVWXwCJkC/s1600-w1000/',
        };
        // объект с фотографиями городов
        // объект с ссылками на флаги, для вывода на страницу
        const flagsOfTheStates = {
            'RU': 'https://pngimg.com/uploads/flags/flags_PNG14622.png',
            'AE': 'https://www.flagistrany.ru/data/flags/w580/ae.png',
            'GB': 'https://pngimg.com/uploads/flags/flags_PNG14656.png',
            'US': 'https://pngimg.com/uploads/flags/flags_PNG14655.png',
        };
        // объект с ссылками на флаги, для вывода на страницу
        // объект с русскими названиями городов
        const russianNamesOfCities = {
            'Moscow': 'Москва',
            'Saint Petersburg': 'Санкт-Петербург',
            'Nizhniy Novgorod': 'Нижний Новгород',
            'Vladivostok': 'Владивосток',
            'Yakutsk': 'Якутск',
            'Sochi': 'Сочи',
            'Dubai': 'Дубай',
            'London': 'Лондон',
            'Glasgow': 'Глазго',
            'Washington, D. C.': 'Вашингтон',
            'Las Vegas': 'Лас-Вегас',
            'Albuquerque': 'Альбукерке',
        };
        // объект с русскими названиями городов


//select2-library
$(document).ready(function() {
    $('.weather-form__select').select2();
    // console.log($('.weather-form__select').find(':selected'));
    // по специальному событию библиотеки запускаем функцию,
    // где получаем id кастомного option, которое является его value
    // передаём GET запрос с указанным id города, который мы считали
    // выводим все данные по этому городу и стране 
    $('.weather-form__select').on('select2:selecting', function(e) {

        // console.log('Selecting: ' , e.params.args.data);
        const idCity = e.params.args.data.id;
        // запрос погоды на текущий момент---------------------------------------------------------------------------
        // делаем запрос на текущую погоду при выборе города в select
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${idCity}&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
            .then(function (resp) {
                return resp.json()
            })
            .then(function (data) {
                console.group('Данны погоды на текущий день');
                console.info(data);
                console.groupEnd('Данны погоды на текущий день');
                // вывод даты и времени города со смещением пояса в заголовок
                const timezoneCity = data['timezone'] / 60; // из секунд в минуты по требованию метода
                getDateGMTForCity(timezoneCity);
                // console.warn(timezoneCity);
                // вывод даты и времени города со смещением пояса в заголовок
                
                // подстановка имени города
                let nameCity = data.name;
                let titleCity = document.querySelector('.country-city > div > span');
                titleCity.textContent = nameCity;
                // подстановка имени города

                // выводим соответствующую городу фоновую фотографию 
                // Удаляем картинку предыдущего города
                document.querySelector('.weather__background-city').remove();
                awaitLoadPhotoOfCity(photosCities[nameCity]);
                // выводим соответствующую городу фоновую фотографию 

                // определяем код страны и выводим соответствующий флаг
                let imageFlag = document.querySelector('.country-city > img');
                let codeState = data['sys']['country'];
                imageFlag.src = flagsOfTheStates[codeState];
                // определяем код страны и выводим соответствующий флаг

                // подстановка иконки погоды
                let weatherIcon = document.querySelector('#weather-icon');
                let codeIcon = data.weather['0']['icon'];
                let iconUrl = `https://openweathermap.org/img/wn/${codeIcon}@2x.png`;
                weatherIcon.src = iconUrl; // записываем URL в img
                // вывод температуры
                let outTemperature = document.querySelector('.temperature > span');
                let currentTemperature = Math.round(data['main']['temp'] - 273.15); // переводим в цельсии и округляем
                outTemperature.innerHTML = addTemperatureSign(currentTemperature);

                // вывод описания погоды
                let weatherDescription = document.querySelector('.description-weather');
                weatherDescription.textContent = data['weather']['0']['description'];

                // давление
                let pressure = Math.round(data['main']['pressure'] * 0.737); // переводим гектопаскали в мм рт.ст.
                let itemPressure = document.querySelector('.parametr-list > ul #pressure');
                itemPressure.innerHTML = `<span class="icon-compass-pointing"></span>${pressure} мм рт. ст.`;

                // влажность 
                let humidity = data['main']['humidity'];
                let itemHumidity = document.querySelector('.parametr-list > ul #humidity');
                itemHumidity.innerHTML = `<span class="icon-drop-of-water"></span>${humidity}% ${getHumidityLevel(humidity)}`;
                // влажность 
               
                // ветер
                let wind = data['wind']['speed'];
                let windDirection = data['wind']['deg'];
                let itemWind = document.querySelector('.parametr-list > ul #wind');
                itemWind.innerHTML = `<span class="icon-wind-weather"></span>${wind} м/c, ${getWindDirection(windDirection)}, ${getNameWind(wind)}`;
                // ветер

                // восход, закат
                let sunriseTimeUNIX = data['sys']['sunrise']; // UNIX Time
                let sunsetTimeUNIX = data['sys']['sunset']; // UNIX Time
                // переводим время с помощью библиотеки
                let sunriseTimeNormal = moment.unix(sunriseTimeUNIX).format('HH:mm'); // восход
                let sunsetTimeNormal = moment.unix(sunsetTimeUNIX).format('HH:mm'); // закат

                // выводим время восхода и захода рядом с иконками
                let spanSunrise = document.querySelector('.parametr-list > ul #sunrise-sunset');
                spanSunrise.innerHTML = `<span class="icon-sunrise"></span>${sunriseTimeNormal} <span class="icon-sunset" id="sunset-li"></span>${sunsetTimeNormal}`;
                // восход, закат
            })
            .catch(function () {
                // catch any errors
            });
// запрос погоды на текущий момент---------------------------------------------------------------------------
// запрос погоды на 5 дней----------------------------------------------------------------------------------
        // отправляем запрос на получение погоды на 5 дней при выборе города в select
        fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${idCity}&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
        .then(function (resp) { return resp.json() })
        .then(function (data) {
            
            const timezoneCity = data['city']['timezone'] / 60;
            console.warn(`Смещение UTC на ${timezoneCity} минут`);
            console.group('Данные погоды на 5 дней');
            console.info(data);
            console.groupEnd('Данные погоды на 5 дней');
            // day1.setDate(day1.getDate() + 1); // завтрашний день
            let day1 = moment().add(1, 'days').format('YYYY-MM-DD'); // завтрашний день с помощью библиотеки
            let day2 = moment().add(2, 'days').format('YYYY-MM-DD');
            let day3 = moment().add(3, 'days').format('YYYY-MM-DD');
            let day4 = moment().add(4, 'days').format('YYYY-MM-DD');
            // console.log(moment.utc().utcOffset(timezoneCity).format('HH:mm:ss'));

            // вызываем функцию 4 раза, получаем объекты с погодой по каждому дню
            let temperatureDataDay1 = getTemperature(day1);
            let temperatureDataDay2 = getTemperature(day2);
            let temperatureDataDay3 = getTemperature(day3);
            let temperatureDataDay4 = getTemperature(day4);

            // записываем данные по всем дням в массив
            const temperatureDataForAllDaysArray = [
                temperatureDataDay1,
                temperatureDataDay2,
                temperatureDataDay3,
                temperatureDataDay4,
            ];
            console.group('Своя структура с нужными показателями');
            console.info(temperatureDataForAllDaysArray);
            console.groupEnd('Своя структура с нужными показателями');

            // вывод информации на страницу
            // заголовок с датой----------------------------------------------------
            outputHeaderWithTheDate();
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
            outputOfTheIcons();
            function outputOfTheIcons() {
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
            outputDayTimeTemperature(); 
            function outputDayTimeTemperature() {
                let outDayTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .day');
                for (let i = 0; i < outDayTimeTemperature.length; i++) {
                    let temperature = Math.round(temperatureDataForAllDaysArray[i]['day']['temperature'] - 273.15);
                    outDayTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
                }
            }
            // вывод ночной температуры
            outputNightTimeTemperature(); 
            function outputNightTimeTemperature() {
                let outNightTimeTemperature = document.querySelectorAll('.weather-main__day_temperature > .night');
                for (let i = 0; i < outNightTimeTemperature.length; i++) {
                    let temperature = Math.round(temperatureDataForAllDaysArray[i]['night']['temperature'] - 273.15);
                    outNightTimeTemperature[i].innerHTML = addTemperatureSign(temperature);
                }
            }
            // значения температуры--------------------------------------------------
            // общее описание погоды-------------------------------------------------
            outputDescription();
            function outputDescription() {
                let outDescriptionWeather = document.querySelectorAll('.weather-main__day_description');
                for (let i = 0; i < outDescriptionWeather.length; i++) {
                    let description = temperatureDataForAllDaysArray[i]['day']['description'];
                    outDescriptionWeather[i].textContent = description;
                }
            }
            // общее описание погоды-------------------------------------------------
            // вывод давления--------------------------------------------------------
            outputPressure();
            function outputPressure() {
                let itemPressure = document.querySelectorAll('.weather-main__day > ul > li:first-child');
                for (let i = 0; i < itemPressure.length; i++) {
                    let pressure = Math.round(temperatureDataForAllDaysArray[i]['day']['pressure'] * 0.737);
                    itemPressure[i].innerHTML = `<span class="icon-compass-pointing"></span>${pressure} мм`;
                }
            }
            // вывод давления--------------------------------------------------------
            // вывод влажности--------------------------------------------------------
            outputHumidity();
            function outputHumidity() {
                let itemHumidity = document.querySelectorAll('.weather-main__day > ul > li:nth-child(2)');
                for (let i = 0; i < itemHumidity.length; i++) {
                    let humidity = temperatureDataForAllDaysArray[i]['day']['humidity'];
                    itemHumidity[i].innerHTML = `<span class="icon-drop-of-water"></span>${humidity}%`;
                }
            }
            // вывод влажности--------------------------------------------------------
            // вывод скорости ветра--------------------------------------------------------
            outputWind();
            function outputWind() {
                let itemWind = document.querySelectorAll('.weather-main__day > ul > li:last-child');
                for (let i = 0; i < itemWind.length; i++) {
                    let windSpeed = temperatureDataForAllDaysArray[i]['day']['windSpeed'];
                    let windDeg = temperatureDataForAllDaysArray[i]['day']['windDeg'];
                    itemWind[i].innerHTML = `<span class="icon-wind-weather"></span>${windSpeed.toFixed(1)} м/c, ${getWindDirection(windDeg)}`;
                }
            }
            // вывод скорости ветра--------------------------------------------------------
            // вывод информации на страницу

            function getTemperature(dayNumber) {
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
                        // получаем данные о температуре на ночь указанной даты

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
                        // получаем данные о температуре на полдень указанной даты
                        //     // console.log(data['list'][key]['dt_txt']);
                    }
                    // console.log(data['list'][key]);
                }
                return temperatureData; // возвращаем объект с погодой на день и ночь
            }

        })
        .catch(function () {
            // catch any errors
        });
// запрос погоды на 5 дней----------------------------------------------------------------------------------
      });

});
//select2-library


       
       
