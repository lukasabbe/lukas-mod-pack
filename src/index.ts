import fs from "fs";
import { modpack, project } from "./interfaces";
import JSZip from "jszip";
import nunjucks from "nunjucks"
import { createFiles, getModrinthProjects } from "./util";


(async () => {
    console.log("Starting to build modpack...");

    const modpack = await JSON.parse(fs.readFileSync("./modpack.json", "utf-8")) as modpack;

    const modrinthMods = await getModrinthProjects(modpack.mods, modpack);
    const modrinthResourcepacks = await getModrinthProjects(modpack.resourcepacks, modpack);
    const modrinthShaderpacks = await getModrinthProjects(modpack.shaderpacks, modpack);

    const zip = new JSZip();

    const modpackData = {
        "versionId": modpack.versionId,
        "modpackName": "Lukas modpack",
        "modpackSummary": "This is the pack I use in vanilla, You can download it if you want the same experience",
        "fabricLoaderVersion": modpack.fabricLoaderVersion,
        "minecraftVersion": modpack.gameVersion,
        "files": createFiles(modrinthMods, modrinthResourcepacks, modrinthShaderpacks),
    }

    const renderedModpackDataFile = nunjucks.render("./src/templates/mrpack_template.njk", modpackData);

    if(!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
    }

    zip.file("modrinth.index.json", renderedModpackDataFile);

    zip.generateAsync({ type: "nodebuffer" }).then((content) => {
        fs.writeFileSync("./output/lukas_fabric_modpack.mrpack", content);
        console.log("Modpack built successfully!");
    });
})();
