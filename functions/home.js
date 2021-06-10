document.addEventListener('DOMContentLoaded', () => {
    select_Initialization()
    sidenav_Initialization()
    datepicker_Initialization()
    latestData()
})


///////////////////CHART FUNCTION
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
    latestData()
    initializeCharts(filters)
})