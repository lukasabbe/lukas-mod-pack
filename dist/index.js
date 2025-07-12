"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const util_1 = require("./util");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Starting to build modpack...");
    const modpack = yield JSON.parse(fs_1.default.readFileSync("./modpack.json", "utf-8"));
    const modrinthMods = yield (0, util_1.getModrinthProjects)(modpack.mods, modpack);
    const modrinthResourcepacks = yield (0, util_1.getModrinthProjects)(modpack.resourcepacks, modpack);
    const modrinthShaderpacks = yield (0, util_1.getModrinthProjects)(modpack.shaderpacks, modpack);
    const zip = new jszip_1.default();
    const modpackData = {
        "versionId": modpack.versionId,
        "modpackName": "Lukas modpack",
        "modpackSummary": "This is the pack I use in vanilla, You can download it if you want the same experience",
        "fabricLoaderVersion": modpack.fabricLoaderVersion,
        "minecraftVersion": modpack.gameVersion,
        "files": (0, util_1.createFiles)(modrinthMods, modrinthResourcepacks, modrinthShaderpacks),
    };
    const renderedModpackDataFile = nunjucks_1.default.render("./src/templates/mrpack_template.njk", modpackData);
    if (!fs_1.default.existsSync("./output")) {
        fs_1.default.mkdirSync("./output");
    }
    zip.file("modrinth.index.json", renderedModpackDataFile);
    zip.generateAsync({ type: "nodebuffer" }).then((content) => {
        fs_1.default.writeFileSync("./output/lukas_fabric_modpack.mrpack", content);
        console.log("Modpack built successfully!");
    });
}))();
