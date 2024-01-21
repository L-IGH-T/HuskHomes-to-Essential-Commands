class Player
{
    constructor(UUID,file)
    {
        this.fileName = file
        this.uuid = UUID
        this.homes = {type:"compound",value:{}}
    }

    addHome(data){
        let home = {[data.name]:{type:"compound",value:{
                WorldRegistryKey:{type: "string",value:data["world_name"]},
                headYaw:{type:"double",value:parseFloat(data.yaw)},
                pitch:{type:"double",value:parseFloat(data.pitch)},
                x:{type:"double",value:parseFloat(data.x)},
                y:{type:"double",value:parseFloat(data.y)},
                z:{type:"double",value:parseFloat(data.z)}
            }}
        }
        this.homes.value = {...this.homes.value,...home};
    }

}
module.exports = Player