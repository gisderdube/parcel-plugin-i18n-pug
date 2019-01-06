const PugAsset = require('parcel-bundler/src/assets/PugAsset')
const Bundler = require('parcel-bundler')
const pug = require('pug')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const rimraf = require('rimraf')
const md5 = require('parcel-bundler/src/utils/md5')

const { findI18n, buildMap, translate } = require('./utils')

class i18nPug extends PugAsset {
    constructor(name, options) {
        super(name, options)
        this.type = 'html'
        this.hmrPageReload = true
        // this.langClones = []
        // this.original = true

        // this.generateClones()
    }

    async pretransform() {
        try {
            const config = await this.getConfig(['package.json'])
            const pugConfig = (await this.getConfig(['.pugrc', '.pugrc.js', 'pug.config.js'])) || {}

            this.compiled = pug.compile(this.contents, {
                compileDebug: false,
                filename: this.name,
                basedir: path.dirname(this.name),
                pretty: !this.options.minify,
                templateName: path.basename(this.basename, path.extname(this.basename)),
                filters: pugConfig.filters,
                filterOptions: pugConfig.filterOptions,
                filterAliases: pugConfig.filterAliases,
            })

            let i18nStrings = findI18n(this.contents)
            const dependencies = await this.getDependencies() // necessary to set this.compiled

            // add dependency content to i18nStrings
            dependencies.forEach(dep => {
                const depContent = fs.readFileSync(dep).toString()
                i18nStrings = i18nStrings.concat(findI18n(depContent))
            })
            await buildMap(i18nStrings, this, config)
        } catch (err) {
            console.error(err)
        }

        return super.pretransform()
    }

    // async generateClones() {
    //     const config = await this.getConfig(['package.json'])
    //     const { langs = ['de'] } = config.i18n || {}

    //     for (let lang of langs) {
    //         // FIXME dont know how to add more entry files to parcel after starting the process

    //         const filePath = this.name.replace(
    //             this.relativeName,
    //             path.join(this.relativeName.replace('.pug', `-${lang}.html`))
    //         )

    //         const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    //         clone.original = false
    //         clone.lang = lang
    //         clone.finalOutputPath = filePath
    //         clone.parent = this

    //         this.langClones.push(clone)

    //         // const bundler = new Bundler(filePath, {
    //         //     outDir: path.join(this.options.outDir, lang),
    //         //     outFile: this.basename.replace('.pug', '.html'),
    //         //     publicUrl: path.join(this.options.publicURL, '../'),
    //         //     watch: false,
    //         //     cache: false,
    //         //     hmr: false,
    //         //     logLevel: 0,
    //         //     production: this.options.production,
    //         // })

    //         // await bundler.bundle()

    //         // rimraf.sync(filePath)
    //     }
    // }

    // async generate() {
    //     const config = await this.getConfig(['package.json'])
    //     const pugConfig = (await this.getConfig(['.pugrc', '.pugrc.js', 'pug.config.js'])) || {}
    //     console.log('YISSS')
    //     if (this.original) {
    //         for (let clone of this.langClones) {
    //             await clone.process()
    //         }
    //     }

    //     return this.original
    //         ? this.compiled({ ...pugConfig.locals, __: expression => expression })
    //         : this.parent.compiled({
    //               ...pugConfig,
    //               __: expression => translate(expression, this.lang, this, config),
    //           })
    // }

    async getDependencies() {
        if (this.compiled.dependencies) {
            for (let item of this.compiled.dependencies) {
                this.addDependency(item, {
                    includedInParent: true,
                })
            }
        }

        return this.compiled.dependencies
    }

    // replaceBundleNames(bundleNameMap) {
    //     super.replaceBundleNames(bundleNameMap)
    //     if (this.original) {
    //         for (let clone of this.langClones) {
    //             clone.replaceBundleNames(bundleNameMap)
    //         }
    //     } else {
    //         console.log('CLONE')
    //         console.log(this.generated)
    //     }
    // }

    // async postProcess(generated) {
    //     this.langClones.forEach(async clone => {
    //         // console.log(await clone.generate())
    //     })
    //     return generated
    // }
}

module.exports = i18nPug
