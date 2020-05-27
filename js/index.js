//slider
$('.slider').slick({
    autoplay: true,
    autoplaySpeed: 200,
    dots: false,
    fade: true,
    speed: 0,
    arrows: false,
    pauseOnFocus: false,
    pauseOnHover: false,
});


//dodawanie pomiarów

const measurmentDataBox = document.querySelector('.measurment-data-box');
const addDataBtn = document.querySelector('.add-data-btn');
let ID = 1;

const addData = () => {
    const newData = document.createElement('div');

    newData.innerHTML = `<p>${ID}.</p><input type="number" class="mass"><input type="number" class="time">`
    newData.classList.add('data');
    newData.id = ID;

    measurmentDataBox.appendChild(newData);
    ID++;
}

addDataBtn.addEventListener('click', () => {
    addData();
});

//usuwanie pomiarów
const deleteAllBtn = document.querySelector('.delete-all-btn');

const deleteAll = () => {
    measurmentDataBox.innerHTML = '';
    ID = 1;
    efficiencyPlot.style.display = 'none';
    energyPlot.style.display = 'none';
    startWaterTemperature.value = '';
    teapotPower.value = '';
}

deleteAllBtn.addEventListener('click', deleteAll);

// obliczenia 

const teapotPower = document.querySelector('.teapot-power');
const startWaterTemperature = document.querySelector('.start-water-temperature');
const countBtn = document.querySelector('.count-btn');

const efficiencyPlot = document.querySelector('#efficiency');
const energyPlot = document.querySelector('#energy');

const countFunction = () => {

    const masses = document.querySelectorAll('.mass');
    const massesArr = Array.prototype.slice.call(masses);

    const times = document.querySelectorAll('.time');
    const timesArr = Array.prototype.slice.call(times);

    if (teapotPower.value === '') {
        alert('Podaj moc czajnika, z  którego korzystałeś')
    } else if (startWaterTemperature.value === '') {
        alert('Podaj początkową temperaturę użytej wody')
    } else if (Math.round(startWaterTemperature.value) < -273.5) {
        alert('Temperatura wody nie może być mniejsza od 273,5°C')
    } else if (Math.round(startWaterTemperature.value) > 100) {
        alert('Początkowa temperatura nie może być większa niż 100°C')
    } else if (measurmentDataBox.innerHTML === '') {
        alert('Dodaj pomiar')
    } else {
        exportValuesToFormula(massesArr, timesArr);
    }
}

const exportValuesToFormula = (massesArr, timesArr) => {

    const massesToFormula = massesArr.map((input, index) => parseFloat(massesArr[index].value))
    const timesToFormula = timesArr.map((input, index) => parseFloat(timesArr[index].value))

    const hasMassesNegative = massesToFormula.some(mass => mass < 0);
    const hasTimesNegative = timesToFormula.some(time => time < 0);

    if (massesToFormula.includes(NaN) || timesToFormula.includes(NaN)) {
        alert('Wypełnij wszystkie pomiary')
    } else if (hasMassesNegative === true) {
        alert('Masa nie może być ujemna')
    } else if (hasTimesNegative === true) {
        alert('Czas nie może być ujemny')
    } else {

        const teapotPowerToFormula = parseFloat(teapotPower.value);
        const startWaterTemperatureToFormula = parseFloat(startWaterTemperature.value);
        const waterSpecificHeatToFormula = 4200;
        const endWaterTemperatureToFormula = 100;

        countEfficiency(massesToFormula, timesToFormula, teapotPowerToFormula, startWaterTemperatureToFormula, endWaterTemperatureToFormula, waterSpecificHeatToFormula)
        countEnergy(massesToFormula, timesToFormula, teapotPowerToFormula)

        efficiencyPlot.style.display = 'block';
        energyPlot.style.display = 'block';
    }
}


// liczenie sprawnośći i generowanie wykresu
const countEfficiency = (masses, times, power, startTemp, endTemp, waterHeat) => {

    const efficienciesArr = [];

    for (let i = 0; i < masses.length; i++) {
        // const efficiency = parseFloat(((((waterHeat * masses[i] * (endTemp - startTemp)) / (power * times[i]))) * 100).toFixed());
        const efficiency = Math.round((((waterHeat * masses[i] * (endTemp - startTemp)) / (power * times[i]))) * 100);

        efficienciesArr.push(efficiency);
    }

    const data = [];

    for (let i = 0; i < masses.length; i++) {
        const singleData = {
            x: masses[i],
            y: efficienciesArr[i]
        };
        data.push(singleData);
    }

    const ctx = document.getElementById('efficiency').getContext('2d')

    const scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                pointRadius: 5,
                backgroundColor: '#14161f',
                label: 'Sprawność czajnika elektrycznego (η) [%]',
                data: data,
            }]
        },
        options: {
            layout: {},
            title: {
                display: true,
                text: 'Sprawność czajnika elektrycznego (η) [%]',
                fontSize: 24,
                fontColor: '#14161F',
                fontFamily: 'Open Sans Condensed',
            },


            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Masa użytej wody',
                    },
                    ticks: {
                        min: 0,
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Sprawność czajnika elektrycznego'
                    }
                }]
            },
        },



    });
}


//liczenie energii i generowanie wykresu

const countEnergy = (masses, times, power) => {

    const energiesArr = [];

    for (let i = 0; i < masses.length; i++) {
        // const efficiency = parseFloat(((((waterHeat * masses[i] * (endTemp - startTemp)) / (power * times[i]))) * 100).toFixed());
        const energy = Math.round((power * times[i]) / masses[i]);

        energiesArr.push(energy);
    }

    const data = [];


    for (let i = 0; i < masses.length; i++) {
        const singleData = {
            x: masses[i],
            y: energiesArr[i]
        };
        data.push(singleData);
    }

    const ctx = document.getElementById('energy').getContext('2d')

    const scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                pointRadius: 5,
                backgroundColor: '#14161f',
                label: 'Średnie zużycie energii przypadające na 1 kg wody (δ)  [J/kg]',
                data: data
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Średnie zużycie energii przypadające na 1 kg wody (δ)  [J/kg]',
                fontSize: 24,
                fontColor: '#14161F',
                fontFamily: 'Open Sans Condensed',

            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Masa użytej wody'
                    },
                    ticks: {
                        min: 0,
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Średnie zużycie energii przypadające na 1 kg wody (δ)  [J/kg]',
                    }
                }]
            },

        }
    });
}

countBtn.addEventListener('click', countFunction);
AOS.init();