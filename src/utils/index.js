const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

const getI18nKey = expression => {
    const baseFunc = 'const __ = expression => { return expression }\n'
    const expressionString = eval(baseFunc + expression)

    return expressionString
}

const findI18n = fileString => {
    const regex = /__\(('|").*('|")\)/g
    const i18nStrings = []

    let result
    while ((result = regex.exec(fileString))) {
        const i18nString = getI18nKey(result[0]) // not sure if the expression should be translated or just map being built

        i18nStrings.push(i18nString)
    }

    return i18nStrings
}

const buildMap = async (i18nStrings, asset, config) => {
    const { langs = ['de'], outFolder = 'src/i18n/languages', todoTag = ' // TODO' } = config.i18n || {}

    langs.forEach(lang => {
        const filePath = path.join(
            asset.options.env.PWD,
            outFolder,
            lang,
            asset.relativeName.replace('.pug', '.json')
        )

        let map
        try {
            if (!fs.existsSync(filePath)) throw new Error()

            map = require(filePath)
        } catch (err) {
            map = {}
        } finally {
            // build the actual map
            i18nStrings.forEach(str => {
                if (map.hasOwnProperty(str)) return

                map[str] = `${str}${todoTag}`
            })

            // remove unused keys
            Object.keys(map).forEach(key => {
                if (!i18nStrings.includes(key)) delete map[key]
            })

            fse.ensureFileSync(filePath)
            fs.writeFileSync(filePath, JSON.stringify(map, null, 4))
        }
    })
}

const translate = (expression, lang, asset, config) => {
    const { langs = ['de'], outFolder = 'src/i18n/languages', todoTag = ' // TODO' } = config.i18n || {}

    const i18nPath = path.join(
        asset.options.env.PWD,
        outFolder,
        lang,
        asset.relativeName.replace('.pug', '.json')
    )
    const i18nMap = require(i18nPath)

    if (i18nMap[expression]) return i18nMap[expression].replace(todoTag, '')

    return expression
}

module.exports = {
    findI18n,
    buildMap,
    translate,
}
