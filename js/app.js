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
    .then(function (resp) {
        return resp.json()
    })
    .then(function (data) {
        // подстановка имени города
        let nameCity = data.name;
        let titleCity = document.querySelector('.country-city > div > span');
        titleCity.textContent = nameCity;
        // Выводим данные по погоде на сегодняшний день
        requestProcessingToday(data);
    })
    .catch(function (err) {
        console.error(err);
    });
// запрос погоды на текущий момент---------------------------------------------------------------------------

// запрос погоды на 5 дней----------------------------------------------------------------------------------
fetch(`https://api.openweathermap.org/data/2.5/forecast?id=524901&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
        .then(function (resp) { return resp.json() })
        .then(function (data) {
            // Выводим данные по погоде на 5 дней
            requestProcessing(data);
        })
        .catch(function (err) {
            console.error(err);
        });
// запрос погоды на 5 дней----------------------------------------------------------------------------------


// объект с фотографиями городов
const photosCities = {
    'Москва': './img/Moscow.jpg',
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
// объект с ссылками на флаги, для вывода на страницу
const flagsOfTheStates = {
    'RU': 'https://pngimg.com/uploads/flags/flags_PNG14622.png',
    'AE': 'https://www.flagistrany.ru/data/flags/w580/ae.png',
    'GB': 'https://pngimg.com/uploads/flags/flags_PNG14656.png',
    'US': 'https://pngimg.com/uploads/flags/flags_PNG14655.png',
};
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


//select2-library
$(document).ready(function() {
    $('.weather-form__select').select2();
    // по специальному событию библиотеки запускаем функцию,
    // где получаем id кастомного option, которое является его value
    // передаём GET запрос с указанным id города, который мы считали
    // выводим все данные по этому городу и стране 
    $('.weather-form__select').on('select2:selecting', function (e) {

        const idCity = e.params.args.data.id;
        // запрос погоды на текущий момент---------------------------------------------------------------------------
        // делаем запрос на текущую погоду при выборе города в select
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${idCity}&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
            .then(function (resp) {
                return resp.json()
            })
            .then(function (data) {
                // подстановка имени города
                let nameCity = data.name;
                let titleCity = document.querySelector('.country-city > div > span');
                titleCity.textContent = nameCity;

                // выводим соответствующую городу фоновую фотографию 
                // Удаляем картинку предыдущего города
                document.querySelector('.weather__background-city').remove();
                awaitLoadPhotoOfCity(photosCities[nameCity]);

                // определяем код страны и выводим соответствующий флаг
                let imageFlag = document.querySelector('.country-city > img');
                let codeState = data['sys']['country'];
                imageFlag.src = flagsOfTheStates[codeState];

                // Выводим оставшиеся данные
                requestProcessingToday(data);
            })
            .catch(function (err) {
                alert('Не получены данные погоды на текущий день');
                console.error(err);
            });
        // запрос погоды на текущий момент---------------------------------------------------------------------------
        // запрос погоды на 5 дней----------------------------------------------------------------------------------
        // отправляем запрос на получение погоды на 5 дней при выборе города в select
        fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${idCity}&lang=ru&appid=2570ad9f8710a971a6df178c71ad1705`)
            .then(function (resp) {
                return resp.json()
            })
            .then(function (data) {
                // Выводим данные по погоде на 5 дней
                requestProcessing(data);
            })
            .catch(function (err) {
                alert('Не получены данные погоды на 4 дня');
                console.error(err);
            });
        // запрос погоды на 5 дней----------------------------------------------------------------------------------
    });

});
//select2-library


function requestProcessingToday(data) {
    console.group('Данные погоды на текущий день');
    console.info(data);
    console.groupEnd('Данные погоды на текущий день');
    // вывод даты и времени города со смещением пояса в заголовок
    const timezoneCity = data['timezone'] / 60; // из секунд в минуты по требованию метода
    getDateGMTForCity(timezoneCity);

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
   
    // ветер
    let wind = data['wind']['speed'];
    let windDirection = data['wind']['deg'];
    let itemWind = document.querySelector('.parametr-list > ul #wind');
    itemWind.innerHTML = `<span class="icon-wind-weather"></span>${wind} м/c, ${getWindDirection(windDirection)}, ${getNameWind(wind)}`;

    // восход, закат ----------------------------------------------
    let sunriseTimeUNIX = data['sys']['sunrise']; // UNIX Time
    let sunsetTimeUNIX = data['sys']['sunset']; // UNIX Time
    // переводим время с помощью библиотеки
    let sunriseTimeNormal = moment.unix(sunriseTimeUNIX).format('HH:mm'); // восход
    let sunsetTimeNormal = moment.unix(sunsetTimeUNIX).format('HH:mm'); // закат

    // выводим время восхода и захода рядом с иконками
    let spanSunrise = document.querySelector('.parametr-list > ul #sunrise-sunset');
    spanSunrise.innerHTML = `<span class="icon-sunrise"></span>${sunriseTimeNormal} <span class="icon-sunset" id="sunset-li"></span>${sunsetTimeNormal}`;
    // восход, закат ----------------------------------------------
}
// В этой функции вынесен весь код который раньше дублировался в 2 запросах на получение погоды на 5 дней
// Теперь код осмыслен в функцию и вызывается в 2 местах
function requestProcessing(data) {
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

    // вызываем функцию 4 раза, получаем объекты с погодой по каждому дню
    let temperatureDataDay1 = getTemperature(day1, data);
    let temperatureDataDay2 = getTemperature(day2, data);
    let temperatureDataDay3 = getTemperature(day3, data);
    let temperatureDataDay4 = getTemperature(day4, data);

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

    // вывод информации на страницу-------------------------------------------------------------
    // заголовок с датой----------------------------------------------------
    outputHeaderWithTheDate();

    // иконки погоды---------------------------------------------------------
    outputOfTheIcons(temperatureDataForAllDaysArray);

    // значения температуры--------------------------------------------------
    // вывод дневной температуры
    outputDayTimeTemperature(temperatureDataForAllDaysArray);

    // вывод ночной температуры
    outputNightTimeTemperature(temperatureDataForAllDaysArray);
    // значения температуры--------------------------------------------------

    // общее описание погоды
    outputDescription(temperatureDataForAllDaysArray);

    // вывод давления
    outputPressure(temperatureDataForAllDaysArray);

    // вывод влажности
    outputHumidity(temperatureDataForAllDaysArray);

    // вывод скорости ветра
    outputWind(temperatureDataForAllDaysArray);
    // вывод информации на страницу-------------------------------------------------------------
}