isUserLogged()

document.addEventListener('DOMContentLoaded', () => {
    select_Initialization()
    sidenav_Initialization()
    datepicker_Initialization()
});

const filters = {
    byRange: false,
    zona: 0,
    dato: '',
    periodo: '',
    rango: {
        inicial: '',
        final: ''
    }
}

let kappaString = ''
const userName = sessionStorage.user
const bienvenida = document.querySelector('#bienvenida')
bienvenida.innerHTML = `Bienvenido ${userName}`

const logouts = document.querySelectorAll('.logout-user')
logouts.forEach(element => {
    element.addEventListener('click', (e) => {
        logout()
    })
});

const logout = () => {
    sessionStorage.clear()
    location.assign(`./index.html`)
}

document.querySelector('#byRange-checkbox').addEventListener('change', (e) => {
    const periodo = document.querySelector('#select-periodo')
    const inferior = document.querySelector('#fecha-inicial')
    const superior = document.querySelector('#fecha-final')

    if (e.target.checked) {
        periodo.setAttribute('disabled', '')
        inferior.removeAttribute('disabled', '')
        superior.removeAttribute('disabled', '')
    } else {
        periodo.removeAttribute('disabled', '')
        inferior.setAttribute('disabled', '')
        superior.setAttribute('disabled', '')
    }
    datepicker_Initialization()
    select_Initialization()
    console.log(e.target.checked)
})

//////////////MATERIALIZE INITIALIZATION
const select_Initialization = () => {
    let elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
}

const sidenav_Initialization = () => {
    let elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
}

const datepicker_Initialization = () => {
    let elems = document.querySelectorAll('.datepicker');
    let options = {
        autoClose: true,
        format: 'dd/mm/yyyy',
        showMonthAfterYear: false,
        showClearBtn: true,
        parse: function () { }
    }
    M.Datepicker.init(elems, options);
}

//////////////KAPPA
window.addEventListener('keypress', (e) => {
    console.log(e.key)
    kappa(e.key)
})

const kappa = (key) => {
    kappaString += key
    console.log(kappaString)
    if (kappaString.length === 50) {
        kappaString = ''
    }
    kappaString.includes('kappa') ? location.assign(`./kappa.html`) : undefined
}

///////////DATE FUNCTIONS
const DateTime = luxon.DateTime

const parseDateValueinISO = (dateString) => {
    if (dateString === '') { return }
    const dateArray = dateString.split('/')
    const Dateobject = {
        year: parseInt(dateArray[2]),
        month: parseInt(dateArray[1]),
        day: parseInt(dateArray[0])
    }
    return DateTime.fromObject({ year: Dateobject.year, month: Dateobject.month, day: Dateobject.day, zone: 'America/Bogota' })

}

const dateFromServerToHuman = (date) => {
    const time = DateTime.fromISO(date)
    return `${time.c.day}/${time.c.month}/${time.c.year}(${time.c.hour}:${time.c.minute}:${time.c.second})`
}

////////////REQUEST DATA PROCESSING

document.querySelector('#graficar-btn').addEventListener('click', () => {
    const zona = parseInt(document.querySelector('#select-zona').value)
    const dato = document.querySelector('#select-dato').value
    const periodo = document.querySelector('#select-periodo').value
    const isByRange = document.querySelector('#byRange-checkbox').checked
    filters.zona = zona
    filters.dato = dato
    filters.periodo = periodo
    filters.byRange = isByRange

    if (filters.byRange === true) {
        filters.periodo = 'rango'
        filters.rango.inicial = parseDateValueinISO(document.querySelector('#fecha-inicial').value).toISO()
        filters.rango.final = parseDateValueinISO(document.querySelector('#fecha-final').value).endOf('day').toISO()
    }
    console.log(filters)
    initializeChart(filters)
})

const initializeChart = async (filters) => {
    if (filters.zona === 0 || filters.dato === '' || filters.periodo === '') { return }
    const requestPeriodo = {
        hoy: '/datos-hoy-zona/',
        semana: '/datos-semana-zona/',
        mes: '/datos-mes-zona/',
        rango: '/datos-rango-zona/'
    }

    let url = `${requestPeriodo[filters.periodo]}${filters.zona}`
    if (filters.byRange) {
        url += `/${filters.rango.inicial}/${filters.rango.final}`
    }

    const resolvedData = await loadData(url)
    console.log(url)
    console.log(resolvedData)
    const chartLabels = getLabels(resolvedData)
    const chartData = getData(resolvedData, filters.dato)
    const title = `Datos por ${filters.periodo} , zona: ${filters.zona}`
    createChart({
        chartLabels: chartLabels,
        chartData: chartData,
        title: title,
        yAxisTitle: filters.dato
    })
}

const loadData = async (string) => {
    const url = `//localhost:3000${string}`
    return await requestData(url)
}

const getLabels = (data) => {
    const array = []
    data.forEach((element) => {
        const humanDate = dateFromServerToHuman(element.datos.horaFecha)
        array.push(humanDate)
    })
    return array
}

const getData = (data, parametro) => {
    const array = []
    data.forEach((element) => {
        array.push(element.datos[parametro])
    })
    return array
}
/////////CHART.JS CONFIG

const createChart = ({ chartLabels, chartData, title, yAxisTitle }) => {

    const zoomOptions = {
        limits: {
            x: { min: 0, max: 500, minRange: 5 },
            y: { min: -100, max: 500, minRange: 5 }
        },
        pan: {
            enabled: true,
            mode: 'xy',
        },
        zoom: {
            wheel: {
                enabled: true,
            },
            pinch: {
                enabled: true
            },
            mode: 'xy',
        }
    }
    const data = {
        labels: chartLabels,
        datasets: [{
            label: title,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: chartData,
            tension: 0.0
        }]
    };
    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'nearest',
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tiempo',
                        color: '#2196f3',
                        font: {
                            // family: 'Comic Sans MS',
                            size: 20,
                            weight: 'bold',
                            lineHeight: 1.2,
                        },
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: yAxisTitle,
                        color: '#2196f3',
                        font: {
                            // family: 'Times',
                            size: 20,
                            weight: 'bold',
                            lineHeight: 1.2
                        },
                        padding: { top: 20, left: 0, right: 0, bottom: 0 }
                    }
                }
            },
            plugins: {
                zoom: zoomOptions
            }
        }
    };

    let chartContainer = document.querySelector('#chart-container')
    let hasChild = chartContainer.firstElementChild
    if (hasChild !== null) { chartContainer.firstElementChild.remove() }
    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'myChart')
    chartContainer.appendChild(canvas)
    new Chart(document.getElementById('myChart'), config)
}