isUserLogged()

const loadData = async (string) => {
    const url = `//localhost:3000${string}`
    return await requestData(url)
}

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

//////DISPLAY USER DATA ON SIDENAV
const userProfileName = document.querySelector('#user-profile-name')
const userProfileEmail = document.querySelector('#user-profile-email')
//////Set user data
userProfileName.innerHTML = userName
userProfileEmail.innerHTML = `${userName}@gmail.com`


/////////LOGOUT FUNCTIONS    
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
    let container = document.querySelector('main')
    let elems = document.querySelectorAll('.datepicker');
    let options = {
        autoClose: true,
        format: 'dd/mm/yyyy',
        showMonthAfterYear: false,
        showClearBtn: true,
        container: container,
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

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const initializeCharts = async (filters) => {
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

    const zoomOptions = {
        zoom: {
            wheel: {
                enabled: true,
            },
            pinch: {
                enabled: true,
            },
            mode: 'xy',
        },
        pan: {
            enabled: true,
            mode: 'xy',
        }
    }

    const resolvedData = await loadData(url)
    const nodeDataSet = NodesChartDataset({ resolvedData })
    const averageDataSet = averagesChartDataSet({ resolvedData })

    createChartByNode({
        fullDataSet: nodeDataSet,
        title: `${filters.dato} por nodos de zona`,
        yAxisTitle: filters.dato,
        zoomOptions
    })

    createAveragesChart({
        fullDataSet: averageDataSet,
        title: `${filters.dato} promedio por zona`,
        yAxisTitle: filters.dato,
        zoomOptions
    })
}

const NodesChartDataset = ({ resolvedData }) => {
    //////////CREATE A DATASET FOR EACH NODE
    const fullDataSet = []
    ///////////////// CREATE AN ARRAY WITH ALL AVAILABLE NODE IDS
    const nodeIds = []
    resolvedData.forEach(element => {
        const id = element.id
        !nodeIds.includes(id) ? nodeIds.push(id) : null
    })
    nodeIds.forEach(node => {
        const dataSet = {
            label: `Nodo id:${node}`,
            backgroundColor: `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`,
            borderColor: `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`,
            data: null,
            tension: 0.0
        }
        const nodeArray = resolvedData.filter(object => object.id === node)
        dataSet.data = nodeArray.map(element => ({ x: element.datos.horaFecha, y: element.datos[filters.dato], id: element.id }))
        fullDataSet.push(dataSet)
    })
    return fullDataSet
}

const averagesChartDataSet = ({ resolvedData }) => {
    const averages = averageByDay(resolvedData)
    const dataSet = {
        label: `Promedios`,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: null,
        tension: 0.0
    }
    dataSet.data = averages.map(element => ({ x: element.horaFecha, y: element[filters.dato] }))
    const array = []
    array.push(dataSet)
    return array
}

///////////////////AVERAGE DATA BY DAY
const averageByDay = (dataSet) => {
    const arraysByDay = []
    const averages = []
    const days = []
    dataSet.forEach(element => {
        const day = DateTime.fromISO(element.datos.horaFecha).startOf('day').toISO()
        !days.includes(day) ? days.push(day) : null
        element.datos.horaFecha = DateTime.fromISO(element.datos.horaFecha)
    })
    days.forEach(day => {
        let dayStart = DateTime.fromISO(day).startOf('day')
        let dayEnd = DateTime.fromISO(day).endOf('day')
        const avarageArray = dataSet.filter(object => {
            const objectDate = object.datos.horaFecha
            return objectDate >= dayStart && objectDate <= dayEnd
        })
        arraysByDay.push(avarageArray)
    })
    arraysByDay.forEach(dayArray => {
        const data = {
            caudal: null,
            consumo: null,
            presion: null,
            turbidez: null,
            horaFecha: ''
        }
        dayArray.forEach(element => {
            data.caudal += element.datos.caudal
            data.consumo += element.datos.consumo
            data.presion += element.datos.presion
            data.turbidez += element.datos.turbidez
        })
        data.caudal = data.caudal / dayArray.length
        data.consumo = data.consumo / dayArray.length
        data.presion = data.presion / dayArray.length
        data.turbidez = data.turbidez / dayArray.length
        data.horaFecha = dayArray[0].datos.horaFecha.endOf('day').toISO()
        averages.push(data)
    })
    return averages
}

////////////////////LATEST DATA FUNCTIONS
const latestData = async () => {
    const tituloPromedios = document.querySelector('#titulo-cards-promedios')
    if (filters.zona === 0) {
        tituloPromedios.innerHTML = `Seleccione una zona`
        return
    } else {
        tituloPromedios.innerHTML = `Promedio del día (zona: ${filters.zona})`
    }
    const data = await loadData(`/datos-hoy-zona/${filters.zona}`)
    if(data.length === 0){
        tituloPromedios.innerHTML = `No hay datos hoy en (zona: ${filters.zona})`
        return
    }
    const dayAverages = averageByDay(data)
    //////////create new array from data object
    const array = Object.keys(data[0].datos).map(key => ({ name: key }))
    const units = {
        'presion': 'PSI',
        'turbidez': 'NTU',
        'caudal': 'L/S',
        'consumo': 'L',
    }
    /////////fill the DOM elements with the new array data
    array.forEach(element => {
        if (element.name === 'horaFecha') { return }
        const latestDataCard = document.querySelector(`#${element.name}-latest-data`)
        const parent = latestDataCard.parentNode
        const isParentHidden = parent.className.includes('hide')
        if (isParentHidden) {
            parent.classList.remove('hide')
        }
        let value = dayAverages[0][element.name]
        value = value.toFixed(2)
        const unit = units[element.name]
        latestDataCard.innerHTML = `${value} ${unit}`
    })
}

/////////CHART.JS CONFIG
const createChartByNode = ({ title, yAxisTitle, fullDataSet, zoomOptions }) => {
    const data = {
        datasets: fullDataSet
    }

    const config = {
        type: 'line',
        data,
        options: {
            plugins: {
                zoom: zoomOptions,
                // tooltip: {
                //     callbacks: {
                //         footer: function (context) {
                //             return `id: ${context[0].raw.id}`
                //         },
                //     }
                // }
            },
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'nearest',
            },
            scales: {
                x: {
                    type: 'time',
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 50,
                        maxRotation: 0
                    },
                    time: {
                        displayFormats: {
                            hour: 'HH:mm',
                            minute: 'HH:mm',
                            second: 'HH:mm:ss'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Tiempo',
                        color: '#2196f3',
                        font: {
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
            }
        }
    }

    let chartContainer = document.querySelector('#chart-container-bynodes')
    chartContainer.innerHTML = ''
    const divider = document.createElement('div')
    divider.setAttribute('class', 'divider')
    const h5 = document.createElement('h5')
    h5.innerHTML = title
    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'nodesChart')
    ///////////APPEND CHILD NODES TO CHART CONTAINER
    chartContainer.appendChild(h5)
    chartContainer.appendChild(divider)
    chartContainer.appendChild(canvas)
    //////////INITIALIZE CHART ON GIVEN CONTAINER BY ID
    new Chart(document.getElementById('nodesChart'), config)
}

const createAveragesChart = ({ title, yAxisTitle, fullDataSet, zoomOptions }) => {
    const data = {
        datasets: fullDataSet
    }

    const config = {
        type: 'line',
        data,
        options: {
            plugins: {
                zoom: zoomOptions,
                // tooltip: {
                //     callbacks: {
                //         footer: function (context) {
                //             return `id: ${context[0].raw.id}`
                //         },
                //     }
                // }
            },
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'nearest',
            },
            scales: {
                x: {
                    type: 'time',
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 50,
                        maxRotation: 0
                    },
                    time: {
                        displayFormats: {
                            hour: 'HH:mm',
                            minute: 'HH:mm',
                            second: 'HH:mm:ss'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Tiempo',
                        color: '#2196f3',
                        font: {
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
            }
        }
    }

    let chartContainer = document.querySelector('#chart-container-averages')
    chartContainer.innerHTML = ''
    const divider = document.createElement('div')
    divider.setAttribute('class', 'divider')
    const h5 = document.createElement('h5')
    h5.innerHTML = title
    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'averageChart')
    ///////////APPEND CHILD NODES TO CHART CONTAINER
    chartContainer.appendChild(h5)
    chartContainer.appendChild(divider)
    chartContainer.appendChild(canvas)
    //////////INITIALIZE CHART ON GIVEN CONTAINER BY ID
    new Chart(document.getElementById('averageChart'), config)
}