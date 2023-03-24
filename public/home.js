let chatter = document.getElementById('submit'),
   from__db = document.getElementById('from__db'),
   switch_0 = document.getElementById('switch_nought'),
   switch_1 = document.getElementById('switch_one'),
   closer = document.getElementById('closer'),
   db__array = []
   sesh = false,
   counter = 0



function postData (event) {
   event.preventDefault()
   text__input = document.getElementById('text__input')
   body = {
      text__input: text__input.value,
   },

   fetch('http://localhost:8080/livechat/customer/post',
   {
      method: 'POST',
      credentials: 'include',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(body) ,
   } 
   ).then(res => {
      return res.json()
   }).then((value)=>{
      db__array = value
      text__input.value = ''
      console.log(db__array)

      // clear the div and refill it

      from__db.innerHTML = null

      db__array.map((index) => {
         let div = document.createElement('div')
         let p = document.createElement('p')
         div.className = (index.type = 'text')? "sent__text text":"received__text text"
         let text = document.createTextNode( `${index.text}` )
         div.appendChild(p)
         p.appendChild(text)
         from__db.appendChild(div)
      })

   }
   )
}
function fetchData(){
   fetch(`http://localhost:8080/livechat/customer/${sesh_id}`)
   .then(res => res.json())
   .then((value)=>{
      db__array = value
      console.log(db__array)

      // clear the div and refill it

      from__db.innerHTML = null

      db__array.map((index) => {
         let div = document.createElement('div')
         let p = document.createElement('p')
         div.className = (index.type = 'text')? "sent__text text":"received__text text"
         let text = document.createTextNode( `${index.text}` )
         div.appendChild(p)
         p.appendChild(text)
         from__db.appendChild(div)
      })
   }
   )
}

let sesh_id = Math.round(Math.random()*9999)


function createSession() {
   console.log(counter);
   counter ++
   
   if ( sesh ) {
      console.log('continue create session', sesh);
      fetchData()
      setTimeout( createSession, 2000);
   }  
   else{
      endSession()
   }



}
                                                                              
function endSession() {
   fetch(`http://localhost:8080/livechat/end/${sesh_id}`)
   .then(res => res.json())
   .then((value)=>{console.log('value')})
}

function switcher() {
   sesh = !sesh

   switch_0.style = `transform : scale(1); bottom:5%; right: 5%`
   switch_1.style = `transform : scale(0)`

   console.log('start create session', sesh);
   setTimeout( createSession, 2000 );         

   if ( !sesh ){
      switch_0.style = `transform : scale(0); bottom:-20%; right: 5%`
      switch_1.style = `transform : scale(1)`

      console.log('start end session', sesh,);
      endSession()
   }
}



chatter.addEventListener('click', postData)
switch_1.addEventListener('click', switcher )
closer.addEventListener('click', switcher )
