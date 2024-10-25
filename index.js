const fs = require('fs');
const fetch = require('node-fetch');
const nunjucks = require('nunjucks');
const zipdir = require('zip-dir');

const DEBUG = false;

(async () => {
    console.log("loading modpack.json");
    const projects = await JSON.parse(fs.readFileSync('modpack.json'));
    
    console.log("loading mods...");
    const mods = await Promise.all(projects.mods.map(async element => {
        if(!element.override){
            const mod = await getLatestProjectVersion(element.id, projects.gameVersion, projects.loader);
            if(mod == null){
                console.log(`No version found for ${element.id}, skipping...`);
            }else{
                return mod;
            }
        }
        else 
            return await getVersion(element.version, element.id)
    }))
    console.log("loading resourcepacks...");
    const resourcepacks = await Promise.all(projects.resourcepacks.map(async element => {
        if(!element.override){
            const resourcepack = await getLatestProjectVersion(element.id, projects.gameVersion);
            if(resourcepack == null){
                console.log(`No version found for ${element.id}, skipping...`);
            }else{
                return resourcepack;
            }
        }
        else 
            return await getVersion(element.version, element.id)
    }))
    console.log("loading shaderpacks...");
    const shaderpacks = await Promise.all(projects.shaderpacks.map(async element => {
        if(!element.override){
            const shaderpack = await getLatestProjectVersion(element.id, projects.gameVersion);
            if(shaderpack == null){
                console.log(`No version found for ${element.id}, skipping...`);
            }else{
                return shaderpack;
            }
        }
        else 
            return await getVersion(element.version, element.id)
    }))
    const data = {
        "versionId": projects.versionId,
        "modpackName": "Lukas modpack",
        "modpackSummary": "This is the pack I use in vanilla, You can download it if you want the same experience",
        "fabricLoaderVersion": projects.fabricLoaderVersion,
        "minecraftVersion": projects.gameVersion,
        "files":[]
    }
    mods.forEach(element => {
        data.files.push({
            "path":`mods/${element.files[0].filename}`,
            "sha512":element.files[0].hashes.sha512,
            "sha1":element.files[0].hashes.sha1,
            "clientEnv": element.clientEnv,
            "serverEnv": element.serverEnv,
            "link": element.files[0].url,
            "size": element.files[0].size
        })
    });
    resourcepacks.forEach(element => {
        data.files.push({
            "path":`resourcepacks/${element.files[0].filename}`,
            "sha512":element.files[0].hashes.sha512,
            "sha1":element.files[0].hashes.sha1,
            "clientEnv": element.clientEnv,
            "serverEnv": element.serverEnv,
            "link": element.files[0].url,
            "size": element.files[0].size
        })
    });
    shaderpacks.forEach(element => {
        data.files.push({
            "path":`shaderpacks/${element.files[0].filename}`,
            "sha512":element.files[0].hashes.sha512,
            "sha1":element.files[0].hashes.sha1,
            "clientEnv": element.clientEnv,
            "serverEnv": element.serverEnv,
            "link": element.files[0].url,
            "size": element.files[0].size
        })
    });

    console.log("rendering template...");
    const renderd = nunjucks.render('mrpack_template.njk', data);
    if(!fs.existsSync('./output')){
        fs.mkdirSync('./output');
    }
    fs.mkdirSync("./lukas_fabric_modpack");
    fs.writeFileSync('./lukas_fabric_modpack/modrinth.index.json', renderd);
    fs.cpSync('./overrides/', './lukas_fabric_modpack', {recursive: true});
    zipdir('./lukas_fabric_modpack', { saveTo: './output/lukas_fabric_modpack.zip' }, function (err, buffer) {
        if (err) {
            console.log('oh no!', err);
        } else {
            console.log('done!');
            fs.rmSync('./lukas_fabric_modpack', { recursive: true });
            fs.renameSync('./output/lukas_fabric_modpack.zip', `./output/lukas_fabric_modpack.mrpack`);
        }
    });
})();

async function getLatestProjectVersion(projectId, gameVersion, loader = null) {
    let link;
    if(loader == null){
        link = `https://api.modrinth.com/v2/project/${projectId}/version?game_versions=["${gameVersion}"]`;
    }
    else{
        link = `https://api.modrinth.com/v2/project/${projectId}/version?game_versions=["${gameVersion}"]&loaders=["${loader}"]`;
    }
    if(DEBUG)
        console.log(projectId)
    return new Promise((resolve, reject) => {
        fetch(link).then(res => res.json()).then(json => {
            if(json.length == 0){
                resolve(null);
            }
            fetch(`https://api.modrinth.com/v2/project/${projectId}`).then(res => res.json()).then( project => {
                if(project.client_side == undefined)
                    project.client_side = "";
                if(project.server_side == undefined)
                    project.server_side = "";
                json[0].clientEnv = project.client_side;
                json[0].serverEnv = project.server_side;
                resolve(json[0]);
            })
        })
    });
}

async function getVersion(versionId, projectId) {
    if(DEBUG)
        console.log(projectId)
    return new Promise((resolve, reject) => {
        fetch(`https://api.modrinth.com/v2/version/${versionId}`).then(res => res.json()).then(json => {
            fetch(`https://api.modrinth.com/v2/project/${projectId}`).then(res => res.json()).then(project => {
                json.clientEnv = project.client_side;
                json.serverEnv = project.server_side;
                resolve(json);
            })
        })
    });
}

function wait(ms){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
