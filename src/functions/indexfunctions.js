const users = getSavedDataFrom('users')

document.querySelector('#login-user').addEventListener('submit', (e) => {
    e.preventDefault()
    const users = getSavedDataFrom('users')
    const user = e.target.elements.user.value.trim()
    const password = e.target.elements.password.value.trim()
    if (user.length === 0 || password.length === 0) { return }
    const isValidUser = validateUser(users, user, password)
    e.target.elements.user.value = ''
    e.target.elements.password.value = ''
    if (isValidUser) {
        sessionStorage.user = user
        location.assign('./home.html')
    }
})

