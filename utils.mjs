import { general, importExtended, Properties, security } from "./lib/registry.mjs";

export { general, importExtended, Properties, security };

if (typeof module !== "undefined") {
        module.exports = { general, security, importExtended, properties };
} else if (typeof window !== "undefined") {
        window.require = (src) => {
                return new Promise((resolve) => {
                        var script = document.createElement('script');
                        script.onload = () => {
                                resolve(module.exports);
                        };
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                });
        }
        window.utils = { general, security, importExtended, properties };
}
