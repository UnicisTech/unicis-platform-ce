import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const yamlPath = path.resolve(__dirname, '../openapi/openapi.yaml');
const jsonPath = path.resolve(__dirname, '../public/openapi.json');

const yamlContent = fs.readFileSync(yamlPath, 'utf8');
const spec = yaml.load(yamlContent);

fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2));
console.log('Generated public/openapi.json');
