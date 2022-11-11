let login_btn = document.getElementById('login')
let signup = document.getElementById('signup')

// make "changeWindow" promise to use "await" to call it+
function changeWindow(string = path){
   return new Promise((resolve, reject) => {
      resolve(
         window.location.replace(path) 
      )
      
   })
}

const login = async (event) => {
   confirm('login bruhh')
   event.preventDefault()
   // fetch the details from the database //
   let login_details = (await fetch(
      'http://localhost:8080/login',
      {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body) ,
      }))
   let data = await login_details.json()
   console.log(data)
   await  changeWindow( './home.html' )
}
// button to login
login_btn.addEventListener( 'click', login )
