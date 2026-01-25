import { ISO } from "types";

export function getTranslationNamespaces(frameworks: ISO[]) {
    return frameworks.map(framework => 'csc/' + framework);
}