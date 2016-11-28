'use strict'
require('shelljs/make')

const
    path = require('path'),
    fs = require('fs'),
    rollup = require('rollup'),
    babel = require('rollup-plugin-babel'),
    copyright = `/*\n${fs.readFileSync('COPYRIGHT', 'utf8')}\n */`,
    pkg = require('./package.json'),
    DIST = process.env.DIST === 'true',
    plugins = DIST && [
            babel({
                babelrc: false,
                //exclude: 'node_modules/**',
                comments: false,
                minified: true,
                //presets: [babili],
                plugins: [
                    require("babel-plugin-minify-constant-folding"),
                    //require("babel-plugin-minify-dead-code-elimination"), // FAIL NodePath has been removed so is read-only
                    require("babel-plugin-minify-flip-comparisons"),
                    require("babel-plugin-minify-guarded-expressions"),
                    require("babel-plugin-minify-infinity"),
                    require("babel-plugin-minify-mangle-names"),
                    require("babel-plugin-minify-replace"),
                    //FAIL require("babel-plugin-minify-simplify"),
                    require("babel-plugin-minify-type-constructors"),
                    require("babel-plugin-transform-member-expression-literals"),
                    require("babel-plugin-transform-merge-sibling-variables"),
                    require("babel-plugin-transform-minify-booleans"),
                    require("babel-plugin-transform-property-literals"),
                    require("babel-plugin-transform-simplify-comparison-operators"),
                    require("babel-plugin-transform-undefined-to-void")
                ]
            })
        ]

const targets = {
    node () {
        console.log('target node')
        exec('mkdir -p dist')
        rollup.rollup({
                entry: 'src/X10.js',
                external: Object.keys(pkg.dependencies),
                plugins
            })
            .then(bundle => {
                bundle.write({
                        dest: 'dist/x10.js',
                        format: 'cjs',
                        moduleName: 'x10',
                        banner: copyright,
                        sourceMap: DIST ? false : 'inline'
                    })
                    .then(() => console.log('wrote dist/x10.js'))
            })
    },

    watch () {
        require('watch')
            .watchTree('src', (f, curr, prev) => {
                if (typeof f === "object" && prev === null && curr === null) {
                    // Finished walking the tree
                } else if (prev === null) {
                    // f is a new file
                } else if (curr.nlink === 0) {
                    // f was removed
                } else {
                    // f was changed
                    console.log(f)
                    targets.node()
                }
            })
    },

    package () {
        const p = Object.entries(pkg).reduce((o, [k, v]) => {
            if (!['private', 'devDependencies', 'scripts'].includes(k)) o[k] = v
            return o
        }, {})
        fs.writeFileSync('dist/package.json', JSON.stringify(p, null, '  '), 'utf-8')
        exec('sed -i "s|dist/||g" dist/package.json ')
        exec('cp LICENSE start.js dist')
    },

    publish () {
        console.log('target publish')
        exec('npm publish --access=public dist')
    },

    all () {
        target.node()
        target.package()
    }
}

Object.assign(target, targets)