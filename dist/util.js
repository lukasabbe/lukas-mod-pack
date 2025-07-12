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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiles = exports.getProjectVersion = exports.getLatestProjectVersion = exports.getModrinthProjects = void 0;
const getModrinthProjects = (projects, modpack) => __awaiter(void 0, void 0, void 0, function* () {
    const modrinthProjects = yield Promise.all(projects.map((project) => __awaiter(void 0, void 0, void 0, function* () {
        let mod;
        if (project.override)
            mod = getProjectVersion(project.version);
        else
            mod = getLatestProjectVersion(project, modpack.gameVersion, modpack.loader);
        if (!mod) {
            console.log(`No version found for ${project.id}, skipping...`);
            return null;
        }
        return mod;
    })));
    return modrinthProjects.filter(p => p !== null);
});
exports.getModrinthProjects = getModrinthProjects;
const getLatestProjectVersion = (project_1, gameVersion_1, ...args_1) => __awaiter(void 0, [project_1, gameVersion_1, ...args_1], void 0, function* (project, gameVersion, loader = null) {
    let request = `https://api.modrinth.com/v2/project/${project.id}/version?game_versions=["${gameVersion}"]`;
    if (loader) {
        request += `&loaders=["${loader}"]`;
    }
    const res = yield fetch(request);
    if (!res.ok)
        return null;
    const versions = yield res.json();
    if (versions.length === 0)
        return null;
    return versions[0];
});
exports.getLatestProjectVersion = getLatestProjectVersion;
const getProjectVersion = (versionId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(`https://api.modrinth.com/v2/version/${versionId}`);
    if (!res.ok)
        return null;
    return yield res.json();
});
exports.getProjectVersion = getProjectVersion;
const createFiles = (...projects) => {
    return projects.flat().map(project => {
        return {
            "path": `mods/${project.files[0].filename}`,
            "sha512": project.files[0].hashes.sha512,
            "sha1": project.files[0].hashes.sha1,
            "link": project.files[0].url,
            "size": project.files[0].size
        };
    });
};
exports.createFiles = createFiles;
