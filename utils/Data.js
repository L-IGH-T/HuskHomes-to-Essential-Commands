const deasync = require('deasync'),
      nbt = require('nbt'),
      Player = require("./player.js"),
      sqlite = require('sqlite3').verbose();

class Data{
    constructor(){
        this.Players = []
        this.World = {type:"compound",value:{
            warps:{type:"compound",value:{}}
        }}
    }
    #sqlPlayer = "SELECT ps.name, pd.x, pd.y, pd.z, pd.yaw, pd.pitch, pd.world_name FROM huskhomes_homes h LEFT JOIN huskhomes_saved_positions ps LEFT JOIN huskhomes_position_data pd WHERE h.owner_uuid='::playerID::' AND ps.id=h.saved_position_id AND pd.id=ps.position_id"
    #sqlWorld = "SELECT ps.name, pd.x, pd.y, pd.z, pd.yaw, pd.pitch, pd.world_name FROM huskhomes_warps w LEFT JOIN huskhomes_saved_positions ps LEFT JOIN huskhomes_position_data pd WHERE ps.id=w.saved_position_id AND pd.id=ps.position_id"

    Db = (paths)=>{
        const db = new sqlite.Database(paths.huskHomeDB)
        db.serialize(()=>{
            this.Players.forEach((e)=>{
                console.log("Player: "+e.fileName+":")
                let homes = this.#getData(db,this.#sqlPlayer.replace("::playerID::",e.fileName))
                if(homes.length > 0)
                {
                    console.log("\x1b[32mThis player has "+homes.length+" homes\x1b[0m\n"); 
                    homes.map((h)=>{
                        e.addHome(h)
                    })
                }
                else
                {
                    console.log("\x1b[31mThis player has no home.\x1b[0m\n"); 
                }
            })
            this.#createWarps(this.#getData(db,this.#sqlWorld))
        })
        db.close();
    }
    

    parseData = (data,file)=>{
        let players = this.Players
        deasync((cb)=>{
            nbt.parse(data, function(error, data) {
                if (error) { throw error;}
                let player = new Player(data.value["UUID"],file);
                players.push(player);
                cb(null,players)
            });
        })()
    }

    #getData = deasync((db,sql,cb)=>{
        db.all(sql,(err,data)=>{
            cb(null,data);
        })
    })

    #createWarps = (data)=>{
        let warps = this.World.value.warps;
        data.map((data)=>{
            let warp = {[data.name]:{type:"compound",value:{
                        WorldRegistryKey:{type: "string",value:data["world_name"]},
                        headYaw:{type:"double",value:parseFloat(data.yaw)},
                        pitch:{type:"double",value:parseFloat(data.pitch)},
                        x:{type:"double",value:parseFloat(data.x)},
                        y:{type:"double",value:parseFloat(data.y)},
                        z:{type:"double",value:parseFloat(data.z)}
                    }}
                }
            warps.value = {...warps.value,...warp};
        })
    }

}

module.exports = Data