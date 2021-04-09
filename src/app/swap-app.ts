// name:    swap-app
// author:  Jos Feenstra
// purpose: swap between different apps.
//          - factory for initiazing these apps
//          - making sure core deletes old apps

import { Core } from "../system/core";
import { EnumParameter, UI } from "../system/ui";
import { App } from "./app";

export class SwapApp extends App {
    possibleApps: any[];
    core: Core;
    currentAppIndex: number = -1;

    constructor(gl: WebGLRenderingContext, core: Core, possibleApps: any[]) {
        super(gl);
        this.core = core;
        this.possibleApps = possibleApps;
    }

    ui(ui: UI) {
        let names: string[] = [];
        let count = this.possibleApps.length;
        for (let i = 0; i < count; i++) {
            names.push(this.possibleApps[i].name.replace("App", ""));
        }

        let p = EnumParameter.new("apps", 0, names);
        ui.addDropdown(p, (i) => {
            this.swap(i);
        });
    }

    swap(index: number) {
        // todo do some range checking
        let AppType = this.possibleApps[index];
        if (this.currentAppIndex > -1) {
            let PreviousType = this.possibleApps[this.currentAppIndex];
            console.log("removing", PreviousType.name);
            this.core.removeApp(PreviousType.name);
        }
        console.log("constructing", AppType.name);
        this.currentAppIndex = index;

        let app = new AppType(this.gl);
        this.core.addApp(app);
    }
}
