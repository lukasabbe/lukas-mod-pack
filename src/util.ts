import { modpack, project } from "./interfaces";

const getModrinthProjects = async (projects: project[], modpack: modpack) => {
    const modrinthProjects = await Promise.all(projects.map(async (project) => {
        let mod;
        if (project.override) mod = getProjectVersion(project.version);
        else mod = getLatestProjectVersion(project, modpack.gameVersion, modpack.loader);
        if(!mod) {
            console.log(`No version found for ${project.id}, skipping...`)
            return null;
        }
        return mod;
    }));
    return modrinthProjects.filter(p => p !== null);
}

const getLatestProjectVersion = async (project: project, gameVersion: string, loader: string | null = null) => {
    let request = `https://api.modrinth.com/v2/project/${project.id}/version?game_versions=["${gameVersion}"]`;
    if (loader) {
        request += `&loaders=["${loader}"]`;
    }
    const res = await fetch(request);
    if (!res.ok) return null;
    const versions = await res.json();
    if (versions.length === 0) return null;
    return versions[0];
}

const getProjectVersion = async (versionId: string) => {
    const res = await fetch(`https://api.modrinth.com/v2/version/${versionId}`);
    if (!res.ok) return null;
    return await res.json();
}

const createFiles = (...projects: any[][]) => {
    return projects.flat().map(project => {
        return {
            "path":`mods/${project.files[0].filename}`,
            "sha512":project.files[0].hashes.sha512,
            "sha1":project.files[0].hashes.sha1,
            "link": project.files[0].url,
            "size": project.files[0].size
        };
    });
}

export { getModrinthProjects, getLatestProjectVersion, getProjectVersion, createFiles };