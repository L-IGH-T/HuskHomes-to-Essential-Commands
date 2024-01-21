#!/usr/bin/env node
const {existsSync, readdirSync, readFileSync, mkdirSync,writeFileSync} = require('fs'),
    path = require('path'),
    zlib = require('zlib'),
    nbt = require('nbt'),
    DataUtil = require('../utils/Data')
    prompt = require("prompt-sync")({ sigint: true })

var paths = {
    world:"",
    playerData:"",
    huskHomeDB:""
}

const Data = new DataUtil();


do {
    paths.world = path.normalize(prompt("Path to Minecraft world: "));
    console.log('\nPath is:','\x1b[33m'+paths.world+'\x1b[0m');
} while (!checkPath(["","../world","/world"],paths));

// Get player UUID and file name
let files = readdirSync(paths.playerData)
files.forEach(file => {
    if(path.extname(file).toLowerCase() === ".dat")
    {
        let data = readFileSync(path.join(paths.playerData,file))
        Data.parseData(data,file.replace(".dat",""));
    }
});
    

//Check if HuskHomes database file exist in server folder
if(!checkHuskHomes())
{
    do {
        paths.huskHomeDB = path.normalize(prompt("Path to HuskHomes database file: "));
    } while (!checkHuskPath(["","./HuskHomesData.db"],paths));
}

//Get data from HuskHomes database
Data.Db(paths);


//Save data for a users
Data.Players.map((e)=>{
    if(Object.keys(e.homes).length >0)
    {
        console.log("Saving data for a user with ID:\x1b[32m"+e.fileName+"\x1b[0m")
        saveFilePlayer(e)
    }
})
function saveFilePlayer(player)
{
    let currentPath = process.cwd(),
        rootDir = path.join(currentPath,"./out"),
        dataDir = path.join(rootDir,"/modplayerdata")
    if (!existsSync(rootDir)){
        mkdirSync(rootDir);
        mkdirSync(dataDir);
    }
    if(!existsSync(dataDir))
    {
        mkdirSync(dataDir);
    }

    const writer = nbt.writeUncompressed({
        name:player.fileName,
        value:{data:{type:"compound",value:{
            playerUuid:player.uuid,
            homes: player.homes
        }}}
    })
    writeFileSync(path.join(dataDir,player.fileName+".dat"),  zlib.gzipSync(Buffer.from(writer)));
}

//Save data for world

saveFileWorld(Data.World)
function saveFileWorld(world)
{
    console.log("\x1b[32mSaving data of world(warps)\x1b[0m")
    let currentPath = process.cwd(),
        rootDir = path.join(currentPath,"./out"),
        dataDir = path.join(rootDir,"/essentialcommands")
    if (!existsSync(rootDir)){
        mkdirSync(rootDir);
        mkdirSync(dataDir);
    }
    if(!existsSync(dataDir))
    {
        mkdirSync(dataDir);
    }

    const writer = nbt.writeUncompressed({
        name:"world_data",
        value:{data:world}
    })
    writeFileSync(path.join(dataDir,"world_data.dat"),  zlib.gzipSync(Buffer.from(writer)));

    console.log('');
    console.log('');
    console.log('');
    console.log('');
    console.log("\x1b[32mThe data has been saved successfully.\x1b[0m")
    console.log(' \x1b[33m Look for folder: \x1b[34m ./out \x1b[0m All data should be stored there.');
    console.log('\x1b[36mCopy the contents of that folder to the server\x1b[32m world\x1b[36m folder.\x1b[0m');
    console.log('');
    console.log('');
    process.exit(1);
}

//Functions
function checkPath(check,paths) {
    let original = {...paths},
    result = false;
    check.some((e)=>{
        paths.world = path.join(original.world,e)
        paths.playerData = path.join(paths.world, "/playerdata");
        if(existsSync(paths.playerData))
        {
            result = true;
            return true;
        }
    })

    if(!result)console.log("\x1b[31mWrong path\x1b[0m\n");
    return result;
}

function checkHuskHomes()
{
    paths.huskHomeDB = path.join(paths.world,"../config/huskhomes/HuskHomesData.db")
    if(existsSync(paths.huskHomeDB))
    {
        console.log('\nHuskHomes database found in:','\x1b[33m'+paths.huskHomeDB+'\x1b[0m\n');
        return true
    }
    console.log("\x1b[31mHuskHomes database not found\x1b[0m\n");
    paths.huskHomeDB = "";
    return false;
}


function checkHuskPath(check,paths)
{
    let original = {...paths},
    result = false;
    check.some((e)=>{
        paths.huskHomeDB = path.join(original.world,e)
        if(existsSync(paths.huskHomeDB))
        {
            result = true;
            return true;
        }
    })

    if(!result)console.log("\x1b[31mHuskHomes database not found\x1b[0m\n");
    return result;
}
