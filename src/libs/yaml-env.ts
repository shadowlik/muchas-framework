import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const fn = () => {
    try {
        const yamlPath = path.join(process.cwd(), 'muchas.yml');

        let yamlFileString = fs.readFileSync(yamlPath, 'utf8')

        const yamlFileEnviroments = yamlFileString.match(/\${([^}]+)}/igm);

        yamlFileEnviroments.forEach((env: string) => {
            const cleanEnv = env.replace(/\$|{|}/igm, '');
            yamlFileString = yamlFileString.replace(new RegExp('\\${' + cleanEnv + '}', 'igm'), process.env[cleanEnv]);
        })

        const yamlObject = yaml.safeLoad(yamlFileString);

        process.env = { ...process.env, ...yamlObject };

        console.log(yamlObject);

    } catch (error) {
        console.log(error)
    }
}

export = fn;

fn();