const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const execa = require('execa');

module.exports = async (pluginConfig, context) => {
    const logger = context.logger;

    if (pluginConfig.registry) {
        const filePath = path.join(pluginConfig.chartPath, 'Chart.yaml');

        const chartYaml = await fsPromises.readFile(filePath);
        const chart = yaml.load(chartYaml);
        await publishChartToRegistry(pluginConfig.chartPath, pluginConfig.registry, chart.name, chart.version, pluginConfig.oci ?? false);

        logger.log('Chart successfully published.');
    } else if (pluginConfig.crPublish) {
        await publishChartUsingCr(pluginConfig.chartPath, pluginConfig.crConfigPath, context)
    } else {
        logger.log('Chart not published.');
    }
};

const plugins = {
    "s3": "s3",
    "gs": "gcs" 
}

const pluginsOpt = {
    "s3": ['--relative'],
    "gs": []
}

function getBucketProvider(registry) {
    return registry.substr(0, registry.indexOf('://'))
}

function isPluginRequired(registry) {
    return Object.keys(plugins).includes(getBucketProvider(registry))
}

async function publishChartToRegistry(configPath, registry, name, version, oci = false) {
    if (registry) {
        let helmPushArgs = []
        const chartName = `${name}-${version}.tgz`;
        const repoName = 'semantic-release-helm'
        const params = {
            env: {
                HELM_EXPERIMENTAL_OCI: oci ? 1 : 0
            }
        }
        const requirePlugin = isPluginRequired(registry)

        if (requirePlugin) {
            helmPushArgs.push(plugins[getBucketProvider(registry)])
        }
        helmPushArgs.push(...['push', chartName, repoName])
        if (requirePlugin) {
            helmPushArgs.push(...pluginsOpt[getBucketProvider(registry)])
        }

        await execa('helm', ['dependency', 'build', configPath], params);
        await execa('helm', ['package', configPath], params);
        await execa('helm', helmPushArgs, params);
        await execa('rm', ['-f', chartName], params);
        await execa('helm', ['repo', 'remove', repoName], params);
    }
}


async function publishChartUsingCr(chartPath, crConfigPath, context) {
    const logger = context.logger;
    const env = context.env;

    const crExec = await findCrExec()
    const { owner, project } = await parseGithubRepo(context.options.repositoryUrl)

    const globalArgs = ['--config', crConfigPath]
    const ghArgs = [
        '--git-repo', `https://${owner}.github.io/${project}`,
        '--token', env.GITHUB_TOKEN,
        '-o', owner, 
        '-r', project, 
    ]

    await execa(
        'sh', ['-c', 'rm -rf .cr-index .cr-release-packages && mkdir -p .cr-index .cr-release-packages']
    )
    const pkgOut = await execa(
        crExec, [
            ...globalArgs,
            'package', chartPath
        ]
    )
    logger.info(pkgOut.stdout)
    const uploadOut = await execa(
        crExec, [
            ...globalArgs,
            ...ghArgs,
            'upload', 
            '--skip-existing'
        ]
    )
    logger.info(uploadOut.stdout)
    const indexOut = await execa(
        crExec, [
            ...globalArgs,
            ...ghArgs,
            'index', 
            '--charts-repo', `https://${owner}.github.io/${project}`,
            '--push'
        ]
    )
    logger.info(indexOut.stdout)
}

async function findCrExec() {
    try {
        await execa('cr', ['version'])
        return 'cr'
    } catch (error) {
        return '/tmp/cr/cr'
    }
}
