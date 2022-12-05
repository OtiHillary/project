let login_btn = document.getElementById('login')
let response = document.getElementById('response')


const login = async (event) => {
   event.preventDefault()
   let account_no_value = document.getElementById('account_no').value
   let password_value = document.getElementById('password').value

   // fetch the details from the database //
   if (account_no_value || password_value !== '') {
      let login_details = (await fetch(
         '/ajax/login',
         {
            method: 'POST',  
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
               { 
                  account_no: account_no_value, 
                  password: password_value 
               }),
         }))
      let data = await login_details

      if (data.failed){
         //(data, data.failed)
         response.style = 'display: initial'
         response.innerHTML = data.failed
      }else{
         //(data)
      }    
   }
   response.style = 'display: initial'
   response.innerHTML = 'invalid inputs'
 
}

login_btn.addEventListener( 'click', login )


