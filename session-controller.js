const {v4 : uuidv4 } = require('uuid');
const {SESSION_KEY } = require('./config');

class SessionController {
    constructor(knex_object){
        this.sessions_list = [];
        this.lifespan = 24*60*60*1000;
        this.genID = ()=> uuidv4(SESSION_KEY);
        this.knex = knex_object;

        let scheduler = async () => {
            await this.updateList();
            
            setTimeout(
                scheduler
            , 5000);
        }

        scheduler();
    }

    async setSession(){
        
        let session_id = this.genID();
        let epoch_time = new Date().getTime()
            
        await this.knex.insert( {
            id: session_id,
            epoch_time,
        })
        .into('sessions');

        return session_id;
    }

    async updateList(){
        // 
        try {
            let sessions = await  this.knex.select().from('sessions');
            console.log("sessions :");
            console.log(sessions);

            this.sessions_list = sessions;

            this.deleteExpired();
        } catch (error) {
            console.log(error);
        }
    }

    async deleteExpired(){
        let epoch_time = new Date().getTime() - this.lifespan ;

        await this.knex.delete().from('sessions').where('epoch_time','<', epoch_time );    
    }
    
    async deleteSession(sid){
        //
        await this.knex.delete().from('sessions').where('id', sid );    
    }
}

module.exports = {
    SessionController
}