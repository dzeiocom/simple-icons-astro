import fs from 'fs/promises'
import * as SimpleIcons from "simple-icons"

// reset the dist folder
console.log('deleting the dist folder')
await fs.rm('./dist', { recursive: true, force: true})
await fs.mkdir('./dist')

// get the template
const template = await fs.readFile('./src/Template.astro', 'utf8')

// funciton tht fill the template with the icon SVG
function fillTemplate(icon, color = '') {
	return template.replace(
		'<!-- icon -->',
		icon.replace(/<svg(?:.|\n)*?>((?:.|\n)*)<\/svg>/gm, '$1').replace(/  /g, '\t').trim()
	).replace('fill="<!-- color -->"', color ? `fill="#${color}"` : '')
}

// copy the base layout
console.log('copying base layout')
await fs.copyFile('./src/.Layout.astro', './dist/.Layout.astro')

// get the base index.d.ts file
const inter = await fs.readFile('./src/index.d.ts', 'utf8')

try {
	// ceate the index
	let index = ''

	// loop through each icons
	console.log('creating every icons')
	for (const name in SimpleIcons) {
		// get its SVG
		/** @type {import('simple-icons').SimpleIcon} */
		const icon = SimpleIcons[name]
		const svg = icon.svg
		

		// make the name PascalCase
		let fullName = name.slice(2)

		if (/^\d/.test(fullName)) {
			fullName = 'I' + fullName
		}

		// get the file path
		const filePath = `./dist/${fullName}.astro`;

		// compile the icon and write it out
		await fs.writeFile(filePath, fillTemplate(svg, icon.hex), "utf-8");

		// add the icon to the index
		index += `export { default as ${fullName} } from './${fullName}.astro'\n`
	}
	// write the index to the js and d.ts files
	await fs.writeFile('./dist/index.js', index, 'utf-8')
	await fs.writeFile('./dist/index.d.ts', inter + index, 'utf-8')
	process.exit(0)
} catch (e) {
	console.error('Error building the Library', e)
	process.exit(1)
}