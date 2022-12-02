console.log(data)

let login_title = document.getElementById('title')
let login_user = document.getElementById('user')
let login_email = document.getElementById('email')

login_title.innerHTML = `Welcome ${ data.user_name }`
login_user.innerHTML = data.user_name
login_email.innerHTML = data.email  