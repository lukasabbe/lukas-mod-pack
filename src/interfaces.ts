interface modpack {
    gameVersion: string;
    fabricLoaderVersion: string;
    versionId: string;
    loader: string;
    mods: project[];
    resourcepacks: project[];
    shaderpacks: project[];
}

interface project {
    name: string;
    id: string;
    version: string;
    override: boolean;
}

export { modpack, project };