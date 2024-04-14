const http = require("http");
const OSC = require("node-osc");

const config = require('./config.json');

const client = new OSC.Client('127.0.0.1', 9000);
const httpserver = http.createServer(requestListener);

let clothes = 
{
    choker: true,
    collar:  false,
    glasses: true,
    croptop: true,
    hoodie: false,
    shorts: true,
    skirt: false,
    thighsocks: false,
    belt: true
}

try
{
    //this would be your avatar parameter path. for me, its:
    //C:/Users/Bunny/AppData/LocalLow/VRChat/VRChat/LocalAvatarData/USERID/AVATARID
    const avPath = JSON.parse(require("fs").readFileSync(config.avPath));
    
    for(let e of avPath.animationParameters)
    {
        switch(e.name)
        {
            case "choker":
                clothes.choker = e.value;
            break;
            case "collar":
                clothes.collar = e.value;
            break;
            case "Nerd Glasses":
                clothes.glasses = e.value;
            break;
            case "Crop Top":
                clothes.croptop = e.value;
            break;
            case "Hoodie":
                clothes.hoodie = e.value;
            break;
            case "Shorts":
                clothes.shorts = e.value;
            break;
            case "Skirt":
                clothes.skirt = e.value;
            break;
            case "Socks":
                clothes.thighsocks = e.value;
            break;
            case "VibroEgg":
                clothes.belt = e.value;
            break;
        }

    }
    console.log("Set Defaults:", clothes);
}
catch(e)
{
    console.log("Failed getting avPath,", e);
}

httpserver.listen(8889, "0.0.0.0", () => 
{
    console.log(`Server is listening for traffic on http://0.0.0.0:8889/`);
});

function requestListener(req, res)
{
    if(req.method == "OPTIONS")
    {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log("Got a request!");
    let data = '';
    req.on('data', (chunk) => {data += chunk});
    req.on('end', () => 
    {
        console.log("IP:", req.socket.remoteAddress);
        if(data)
            data = JSON.parse(data);

        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

        if(data == '')
        {
            res.writeHead(200);
            res.end();
            return;
        }
        else if (data.mode == "status" || data.mode == "register")
        {
            //send status
            res.writeHead(200);
            res.write(JSON.stringify(clothes));
            res.end();
        }
        else if (data.mode == "toggle")
        {
            //toggle part
            let bozo = togglePart(data.part);

            if(bozo)
            {
                res.writeHead(200);
                res.write("yea no funny games chief");
                res.end();
            }
            else
            {
                res.writeHead(200);
                res.write(JSON.stringify(clothes));
                res.end();
            }
        }
        else
        {
            console.log("Got some other invalid data??");
        
            res.writeHead(200);
            res.write(JSON.stringify("waiter! waiter! more dumbasses please!"));
            res.end();
        }
    })
}

function togglePart(part)
{
    switch(part)
    {
        case "choker":
            if(clothes.choker)
            {
                clothes.choker = false;
                sendOSC("choker", false);
            }
            else
            {
                clothes.choker = true;
                clothes.collar = false;
                sendOSC("choker", true);
                sendOSC("collar", false);
            }
        break;
        case "collar":
            if(clothes.collar)
            {
                clothes.collar = false;
                sendOSC("collar", false);
            }
            else
            {
                clothes.choker = false;
                clothes.collar = true;
                sendOSC("choker", false);
                sendOSC("collar", true);
            }
        break;
        case "glasses":
            clothes.glasses = !clothes.glasses;
            sendOSC("Nerd_Glasses", clothes.glasses);
        break;
        case "croptop":
            clothes.croptop = !clothes.croptop;
            sendOSC("Crop_Top", clothes.croptop);
        break;
        case "hoodie":
            clothes.hoodie = !clothes.hoodie;
            sendOSC("Hoodie", clothes.hoodie);
        break;
        case "shorts":
            if(clothes.shorts)
            {
                clothes.shorts = false;
                sendOSC("Shorts", false);
            }
            else
            {
                clothes.skirt = false;
                clothes.shorts = true;
                sendOSC("Skirt", false);
                sendOSC("Shorts", true);
            }
        break;
        case "skirt":
            if(clothes.skirt)
            {
                clothes.skirt = false;
                sendOSC("Skirt", false);
            }
            else
            {
                clothes.skirt = true;
                clothes.shorts = false;
                sendOSC("Skirt", true);
                sendOSC("Shorts", false);
            }
        break;
        case "thighsocks":
            clothes.thighsocks = !clothes.thighsocks;
            sendOSC("Socks", clothes.thighsocks);
        break;
        case "belt":
            clothes.belt = !clothes.belt;
            sendOSC("VibroEgg", clothes.belt);
        break;

        default:
            return true;
    }
    return false;
}

let test = false;
function sendOSC(param, value)
{
    if(!test)
    {
        console.log("Sending:", `/avatar/parameters/${param}`, Boolean(value));
        client.send(`/avatar/parameters/${param}`, Boolean(value));
    }
    else
    {
        console.log("Mock Send:", `/avatar/parameters/${param}`, Boolean(value));
    }
}