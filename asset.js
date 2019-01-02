const { Asset } = require('parcel-bundler')

class i18nPug extends Asset {
    constructor(name, pkg, options) {
        super(name, pkg, options)
        this.type = 'pug'
    }

    async parse(str) {
        console.log(str)
    }

    async generate() {
        console.log(this.contents)
    }
}

module.exports = i18nPug
