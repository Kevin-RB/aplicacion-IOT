const users = getSavedDataFrom('users')

document.querySelector('#submit-user-register-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const user = e.target.elements.newUser.value.trim()
    const password = e.target.elements.newPassword.value.trim()
    if (user.length === 0) { return }
    debugger
    users.push({
        user,
        password
    })
    saveDataIn('users', users)
    e.target.elements.newUser.value = ''
    e.target.elements.newPassword.value = ''
    location.assign(`./index.html`)
})