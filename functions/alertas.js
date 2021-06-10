document.addEventListener('DOMContentLoaded', () => {
    select_Initialization()
    sidenav_Initialization()
    datepicker_Initialization()
})

document.querySelector('#consultar-btn').addEventListener('click', () => {
    const zona = parseInt(document.querySelector('#select-zona').value)
    const periodo = document.querySelector('#select-periodo').value
    const isByRange = document.querySelector('#byRange-checkbox').checked
    filters.zona = zona
    filters.periodo = periodo
    filters.byRange = isByRange

    if (filters.byRange === true) {
        filters.periodo = 'rango'
        filters.rango.inicial = parseDateValueinISO(document.querySelector('#fecha-inicial').value).toISO()
        filters.rango.final = parseDateValueinISO(document.querySelector('#fecha-final').value).endOf('day').toISO()
    }
    createTable()
})

const createTable = async () => {
    if (filters.zona === 0 || filters.periodo === '') { return }
    const requestPeriodo = {
        hoy: '/datos-hoy-zona/',
        semana: '/datos-semana-zona/',
        mes: '/datos-mes-zona/',
        rango: '/datos-rango-zona/',
    }

    let url = `${requestPeriodo[filters.periodo]}${filters.zona}`
    if (filters.byRange) {
        url += `/${filters.rango.inicial}/${filters.rango.final}`
    }
    const dataSet = await loadData(url)
    dataSet.reverse()
    const contentTable = document.querySelector('#content-table')
    contentTable.innerHTML = ''
    ///////Creación del Headder de la tabla
    const headders = ['Id nodo', 'Alertas', 'Hora fecha']
    const tableHeadField = document.createElement('thead')
    const tableRow = document.createElement('tr')
    headders.forEach((element) => {
        const tableHead = document.createElement('th')
        tableHead.innerHTML = element
        tableRow.appendChild(tableHead)
    })
    tableHeadField.appendChild(tableRow)
    contentTable.appendChild(tableHeadField)

    ///////Creación del body de la tabla
    const tableBody = document.createElement('tbody')
    dataSet.forEach((element) => {
        /////Inyección de id
        const tableRow = document.createElement('tr')
        const tdId = document.createElement('td')
        tdId.innerHTML = element.id
        /////Inyección de fecha
        const tdDate = document.createElement('td')
        tdDate.innerHTML = dateFromServerToHuman(element.datos.horaFecha)
        /////Inyección de alertas
        const tdAlertas = document.createElement('td')
        const dataKeys = Object.keys(element.alertas)
        dataKeys.forEach((key) => {
            if (element.alertas[key] === null) {
                return
            } else {
                tdAlertas.innerHTML += `${element.alertas[key]}<br>`
            }
        })
        tableRow.appendChild(tdId)
        tableRow.appendChild(tdAlertas)
        tableRow.appendChild(tdDate)
        tableBody.appendChild(tableRow)
    })
    contentTable.appendChild(tableBody)
}