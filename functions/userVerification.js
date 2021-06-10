
const isUserLogged = () => {
    const user = sessionStorage.user
    !user ? location.assign('./index.html') : undefined
}

const validateUser = (users, user, password) => {
    let validation = false
    users.forEach(element => {
        if (element.user === user && element.password === password) {
            validation = true
        }
    });
    return validation
}