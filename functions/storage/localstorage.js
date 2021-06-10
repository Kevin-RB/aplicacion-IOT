const saveDataIn = function (KeyName, data) {
    localStorage.setItem(`${KeyName}`, JSON.stringify(data))
}

const getSavedDataFrom = (KeyName) => {
    const dataJSON = localStorage.getItem(`${KeyName}`)
    try {
        return dataJSON ? JSON.parse(dataJSON) : []
    } catch (error) {
        return []
    }
}