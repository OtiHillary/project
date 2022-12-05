// let signup_btn = document.getElementById('signup')

// // make "changeWindow" promise to use "await" to call it+
// function changeWindow(path){
//    return new Promise((resolve, reject) => {
//       resolve(
//          window.location.replace(path) 
//       )
      
//    })
// }

// const signup = async (event) => {
//    event.preventDefault()
//    let phone_value = document.getElementById('phone').value,
//       first_name_value = document.getElementById('first_name').value,
//       last_name_value = document.getElementById('last_name').value,
//       user_name_value = document.getElementById('user_name').value,
//       email_value = document.getElementById('email').value,
//       currency_value = document.getElementById('currency').value,
//       password_value = document.getElementById('password').value

//    // fetch the details from the database //

//    let login_details = (await fetch(
//       '/ajax/signup',
//       {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify(
//             { 
//                phone: phone_value,
//                first_name: first_name_value,
//                last_name: last_name_value,
//                user_name: user_name_value,
//                email: email_value,
//                currency: currency_value,
//                password: password_value,
//             }
//          ) ,
//       }))
//    let data = await login_details
//    if (data){
//       //(data)
//    }
// }
// // button to sign up
// signup_btn.addEventListener( 'submit', signup )

