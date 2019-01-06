const Bundler = require('parcel-bundler')
const i18nPugPlugin = require('../src/index')
const path = require('path')
const fs = require('fs')

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
})

async function run() {
    const bundler = new Bundler(['./test/pages/**/{,!(_)*}.pug'], {
        outDir: path.join(__dirname, 'output', 'pages'),
        watch: false,
        cache: false,
        hmr: false,
        logLevel: 0,
    })

    // Register plugin
    i18nPugPlugin(bundler)

    // Bundle everything
    await bundler.bundle()
}

run()
